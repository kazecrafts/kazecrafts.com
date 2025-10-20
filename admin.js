(function(){
	if (typeof firebase === 'undefined') {
		alert('Firebase not loaded. Please check your internet connection and refresh.');
		return;
	}

	const el = (id) => document.getElementById(id);
	const qs = (sel) => document.querySelector(sel);
	const qsa = (sel) => Array.from(document.querySelectorAll(sel));

	// Initialize login form
	window.addEventListener('load', () => {
		const loginForm = el('adminLoginForm');
		if (loginForm) {
			loginForm.addEventListener('submit', handleAdminLogin);
		}
	});

	// Auth gate
	firebase.auth().onAuthStateChanged(async (user) => {
		if (!user) return showLoginScreen();
		if (!db) return showDenied('Firebase not initialized');
		
		// Check for bypass flag
		if (localStorage.getItem('adminBypass') === 'true') {
			console.log('🚀 Admin bypass enabled');
			localStorage.removeItem('adminBypass'); // Remove after use
			initAdmin(user, 'admin');
			return;
		}
		
		try {
			// Enable offline persistence
			await db.enablePersistence().catch(err => {
				if (err.code === 'failed-precondition') {
					console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
				} else if (err.code === 'unimplemented') {
					console.warn('The current browser does not support all features required for persistence');
				}
			});

			const userDoc = await db.collection('users').doc(user.uid).get();
			
			// If user document doesn't exist, create it with viewer role
			if (!userDoc.exists) {
				console.log('Creating user document with viewer role...');
				await db.collection('users').doc(user.uid).set({
					email: user.email,
					displayName: user.displayName || user.email.split('@')[0],
					role: 'viewer',
					createdAt: firebase.firestore.FieldValue.serverTimestamp()
				});
				return showDenied(`Account created. Please ask an admin to grant you editor access.`, user.email);
			}
			
			const userData = userDoc.data();
			const role = userData.role || 'viewer';
			
			console.log('User role:', role);
			
			if (!['editor','admin'].includes(role)) {
				return showDenied(`Access denied. Your role: ${role}`, user.email);
			}
			
			initAdmin(user, role);
		} catch(e){
			console.error('Auth error:', e);
			// If it's an offline error, try to continue with cached data
			if (e.code === 'unavailable' || e.message.includes('offline')) {
				console.log('Offline mode detected, checking cached role...');
				// Try to get cached data
				try {
					const userDoc = await db.collection('users').doc(user.uid).get({ source: 'cache' });
					if (userDoc.exists) {
						const role = userDoc.data().role || 'viewer';
						if (['editor','admin'].includes(role)) {
							console.log('Using cached role:', role);
							initAdmin(user, role);
							return;
						}
					}
				} catch (cacheError) {
					console.log('No cached data available');
				}
			}
			showDenied('Error loading user data: ' + e.message);
		}
	});

	function showLoginScreen(){
		el('adminApp').style.display = 'none';
		el('denied').style.display = 'none';
		el('loginScreen').style.display = 'flex';
	}

	function showDenied(message = 'Access restricted', userEmail = ''){
		el('adminApp').style.display = 'none';
		el('loginScreen').style.display = 'none';
		const d = el('denied');
		const card = d.querySelector('.denied-card');
		
		card.innerHTML = `
			<h2>Access Restricted</h2>
			<p>${message}</p>
			${userEmail ? `<p style="margin-top:1rem;opacity:0.7">Logged in as: <strong>${userEmail}</strong></p>` : ''}
			<div style="margin-top:1.5rem;padding:1rem;background:#1d222b;border-radius:8px;text-align:left;font-size:0.9rem">
				<strong>To grant yourself admin access:</strong>
				<ol style="margin:0.5rem 0;padding-left:1.5rem">
					<li>Open Firebase Console</li>
					<li>Go to Firestore Database</li>
					<li>Find users collection > your user document</li>
					<li>Edit and set <code>role</code> to <code>editor</code> or <code>admin</code></li>
					<li>Refresh this page</li>
				</ol>
				<div style="margin-top:1rem;padding:0.75rem;background:#0c0f14;border-radius:6px;font-family:monospace;font-size:0.85rem">
					Or run in console:<br>
					<code style="color:#5c7cfa">setRole('${userEmail}', 'admin')</code>
				</div>
			</div>
			<button id="adminLogoutBtn2" class="btn" style="margin-top:1rem"><i class="fas fa-sign-out-alt"></i> Logout</button>
			<button id="goHome" class="btn" style="margin-top:0.5rem"><i class="fas fa-home"></i> Go to Site</button>
		`;
		
		d.style.display = 'flex';
		const logoutBtn = el('adminLogoutBtn2');
		if (logoutBtn) logoutBtn.onclick = () => { auth.signOut().then(() => location.reload()); };
		const btn = el('goHome');
		if (btn) btn.onclick = () => { window.location.href = 'index.html'; };
	}
	
	// Helper function to set role (callable from console)
	window.setRole = async function(email, role) {
		if (!db) return console.error('Firebase not initialized');
		try {
			const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
			if (usersSnap.empty) return console.error('User not found');
			await usersSnap.docs[0].ref.update({ role });
			console.log(`✅ Role updated to ${role} for ${email}`);
			console.log('Reloading page...');
			setTimeout(() => location.reload(), 1000);
		} catch(e) {
			console.error('Error:', e);
		}
	};

	// Login handler
	async function handleAdminLogin(e) {
		e.preventDefault();
		const email = el('adminEmail').value;
		const password = el('adminPassword').value;
		const loginBtn = el('adminLoginBtn');
		const errorDiv = el('loginError');
		
		errorDiv.style.display = 'none';
		loginBtn.disabled = true;
		loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
		
		try {
			await auth.signInWithEmailAndPassword(email, password);
			// Auth state change will trigger and show admin or denied
		} catch (error) {
			console.error('Login error:', error);
			errorDiv.textContent = getErrorMessage(error.code);
			errorDiv.style.display = 'block';
			loginBtn.disabled = false;
			loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
		}
	}

	// Google sign in
	window.signInWithGoogle = async function() {
		try {
			const provider = new firebase.auth.GoogleAuthProvider();
			await auth.signInWithPopup(provider);
			// Auth state change will handle the rest
		} catch (error) {
			console.error('Google sign in error:', error);
			if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
				alert('Sign in failed: ' + getErrorMessage(error.code));
			}
		}
	};

	function getErrorMessage(code) {
		const messages = {
			'auth/invalid-email': 'Invalid email address',
			'auth/user-disabled': 'This account has been disabled',
			'auth/user-not-found': 'No account found with this email',
			'auth/wrong-password': 'Incorrect password',
			'auth/invalid-credential': 'Invalid email or password',
			'auth/too-many-requests': 'Too many failed attempts. Try again later.',
			'auth/network-request-failed': 'Network error. Check your connection.'
		};
		return messages[code] || 'Login failed. Please try again.';
	}

	function initAdmin(user, role){
		el('denied').style.display = 'none';
		el('loginScreen').style.display = 'none';
		el('adminApp').style.display = 'block';
		el('adminUserEmail').textContent = user.email + ' (' + role + ')';
		el('adminLogoutBtn').onclick = () => auth.signOut().then(() => location.reload());
		// Tabs
		qsa('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
		// Products
		el('btnNewProduct').onclick = resetProductForm;
		el('productForm').onsubmit = onSaveProduct;
		el('resetProductBtn').onclick = resetProductForm;
		el('deleteProductBtn').onclick = onDeleteProduct;
		el('productSearch').oninput = filterProductsList;
		// Add preview listeners for products
		qsa('#productForm input, #productForm textarea').forEach(input => {
			input.addEventListener('input', updateProductPreview);
		});
		// Artisans
		el('btnNewArtisan').onclick = resetArtisanForm;
		el('artisanForm').onsubmit = onSaveArtisan;
		el('resetArtisanBtn').onclick = resetArtisanForm;
		el('deleteArtisanBtn').onclick = onDeleteArtisan;
		el('artisanSearch').oninput = filterArtisansList;
		// Add preview listeners for artisans
		qsa('#artisanForm input, #artisanForm textarea').forEach(input => {
			input.addEventListener('input', updateArtisanPreview);
		});
		// Content
		el('btnNewContent').onclick = () => { el('contentKey').value=''; el('contentText').value=''; el('deleteContentBtn').style.display='none'; };
		el('contentForm').onsubmit = onSaveContent;
		el('deleteContentBtn').onclick = onDeleteContent;
		el('contentSearch').oninput = filterContentList;
		
		refreshAll();
	}

	function switchTab(tab){
		qsa('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
		qsa('.tab').forEach(s => s.classList.toggle('active', s.id===`tab-${tab}`));
	}

	// ===== Products =====
	let productsDocs = [];
	async function loadProducts(){
		const snap = await db.collection('products').orderBy('createdAt','desc').get();
		productsDocs = snap.docs.map(d => ({ id:d.id, ...d.data() }));
		renderProductsList();
		el('statProducts').textContent = String(productsDocs.length);
	}
	function renderProductsList(filter=''){
		const list = el('productsList');
		const f = filter.trim().toLowerCase();
		list.innerHTML = productsDocs.filter(p => !f || `${p.name} ${p.category||''} ${p.artisan||''}`.toLowerCase().includes(f)).map(p => `
			<div class="list-item" data-id="${p.id}">
				<div style="width:40px;height:40px;overflow:hidden;border-radius:6px;background:#0c0f14;border:1px solid #2a2f3a;display:flex;align-items:center;justify-content:center">
					<img src="${p.image||''}" alt="" style="max-width:100%;max-height:100%" onerror="this.style.display='none'">
				</div>
				<div style="display:flex;flex-direction:column;gap:4px">
					<strong>${p.name}</strong>
					<small style="color:#9aa4b2">${p.category||''} • ¥${Number(p.price||0).toLocaleString()}</small>
				</div>
			</div>
		`).join('');
		qsa('#productsList .list-item').forEach(item => item.onclick = () => loadProductIntoForm(item.getAttribute('data-id')));
	}
	function filterProductsList(e){ renderProductsList(e.target.value); }
	function resetProductForm(){
		el('productForm').reset();
		el('productDocId').value = '';
		el('deleteProductBtn').style.display = 'none';
		updateProductPreview(); // Clear preview when resetting form
	}
	function loadProductIntoForm(id){
		const p = productsDocs.find(x=>x.id===id); if(!p) return;
		el('productDocId').value = p.id;
		el('productName').value = p.name||'';
		el('productArtisan').value = p.artisan||'';
		el('productLocation').value = p.location||'';
		el('productCategory').value = p.category||'';
		el('productBadge').value = p.badge||'';
		el('productPrice').value = p.price||0;
		el('productDescription').value = p.description||'';
		el('productMaterials').value = p.materials||'';
		el('productDimensions').value = p.dimensions||'';
		el('productImage').value = p.image||'';
		el('deleteProductBtn').style.display = 'inline-flex';
		updateProductPreview(); // Update preview when loading existing product
	}
	async function onSaveProduct(e){
		e.preventDefault();
		let imageURL = el('productImage').value.trim();
		const file = el('productImageFile').files[0];
		if (file && storage) {
			const ref = storage.ref().child(`uploads/products/${Date.now()}_${file.name}`);
			await ref.put(file);
			imageURL = await ref.getDownloadURL();
		}
		const record = {
			name: el('productName').value.trim(),
			artisan: el('productArtisan').value.trim(),
			location: el('productLocation').value.trim(),
			category: el('productCategory').value.trim() || 'pottery',
			badge: el('productBadge').value.trim(),
			price: Number(el('productPrice').value) || 0,
			description: el('productDescription').value.trim(),
			materials: el('productMaterials').value.trim(),
			dimensions: el('productDimensions').value.trim(),
			image: imageURL
		};
		const docId = el('productDocId').value;
		if (docId) {
			await db.collection('products').doc(docId).set(record, { merge: true });
		} else {
			await db.collection('products').add({ ...record, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
		}
		await loadProducts();
		resetProductForm();
		alert('Saved');
	}
	async function onDeleteProduct(){
		const id = el('productDocId').value; if(!id) return;
		if (!confirm('Delete this product?')) return;
		await db.collection('products').doc(id).delete();
		await loadProducts();
		resetProductForm();
	}

	// ===== Artisans =====
	let artisansDocs = [];
	async function loadArtisans(){
		const snap = await db.collection('artisans').orderBy('createdAt','desc').get();
		artisansDocs = snap.docs.map(d => ({ id:d.id, ...d.data() }));
		renderArtisansList();
		el('statArtisans').textContent = String(artisansDocs.length);
	}
	function renderArtisansList(filter=''){
		const list = el('artisansList');
		const f = filter.trim().toLowerCase();
		list.innerHTML = artisansDocs.filter(a => !f || `${a.name} ${a.craft||''}`.toLowerCase().includes(f)).map(a => `
			<div class="list-item" data-id="${a.id}">
				<div style="width:40px;height:40px;overflow:hidden;border-radius:6px;background:#0c0f14;border:1px solid #2a2f3a;display:flex;align-items:center;justify-content:center">
					<img src="${a.image||''}" alt="" style="max-width:100%;max-height:100%" onerror="this.style.display='none'">
				</div>
				<div style="display:flex;flex-direction:column;gap:4px">
					<strong>${a.name}</strong>
					<small style="color:#9aa4b2">${a.craft||''} • ${a.location||''}</small>
				</div>
			</div>
		`).join('');
		qsa('#artisansList .list-item').forEach(item => item.onclick = () => loadArtisanIntoForm(item.getAttribute('data-id')));
	}
	function filterArtisansList(e){ renderArtisansList(e.target.value); }
	function resetArtisanForm(){
		el('artisanForm').reset();
		el('artisanDocId').value = '';
		el('deleteArtisanBtn').style.display = 'none';
		updateArtisanPreview(); // Clear preview when resetting form
	}
	function loadArtisanIntoForm(id){
		const a = artisansDocs.find(x=>x.id===id); if(!a) return;
		el('artisanDocId').value = a.id;
		el('artisanName').value = a.name||'';
		el('artisanNameJp').value = a.nameJp||'';
		el('artisanCraft').value = a.craft||'';
		el('artisanCraftJp').value = a.craftJp||'';
		el('artisanLocation').value = a.location||'';
		el('artisanYears').value = a.years||0;
		el('artisanSpecialty').value = a.specialty||'';
		el('artisanStory').value = a.story||'';
		el('artisanQuote').value = a.quote||'';
		el('artisanImage').value = a.image||'';
		el('deleteArtisanBtn').style.display = 'inline-flex';
		updateArtisanPreview(); // Update preview when loading existing artisan
	}
	async function onSaveArtisan(e){
		e.preventDefault();
		let imageURL = el('artisanImage').value.trim();
		const file = el('artisanImageFile').files[0];
		if (file && storage) {
			const ref = storage.ref().child(`uploads/artisans/${Date.now()}_${file.name}`);
			await ref.put(file);
			imageURL = await ref.getDownloadURL();
		}
		const record = {
			name: el('artisanName').value.trim(),
			nameJp: el('artisanNameJp').value.trim(),
			craft: el('artisanCraft').value.trim(),
			craftJp: el('artisanCraftJp').value.trim(),
			location: el('artisanLocation').value.trim(),
			years: Number(el('artisanYears').value)||0,
			specialty: el('artisanSpecialty').value.trim(),
			story: el('artisanStory').value.trim(),
			quote: el('artisanQuote').value.trim(),
			image: imageURL
		};
		const docId = el('artisanDocId').value;
		if (docId) {
			await db.collection('artisans').doc(docId).set(record, { merge: true });
		} else {
			await db.collection('artisans').add({ ...record, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
		}
		await loadArtisans();
		resetArtisanForm();
		alert('Saved');
	}
	async function onDeleteArtisan(){
		const id = el('artisanDocId').value; if(!id) return;
		if (!confirm('Delete this artisan?')) return;
		await db.collection('artisans').doc(id).delete();
		await loadArtisans();
		resetArtisanForm();
	}

	// ===== Content =====
	let contentDocs = [];
	async function loadContent(){
		const snap = await db.collection('content').get();
		contentDocs = snap.docs.map(d => ({ id:d.id, ...d.data() }));
		renderContentList();
		el('statContent').textContent = String(contentDocs.length);
	}
	function renderContentList(filter=''){
		const list = el('contentList');
		const f = filter.trim().toLowerCase();
		list.innerHTML = contentDocs.filter(c => !f || `${c.id} ${c.text||''}`.toLowerCase().includes(f)).map(c => `
			<div class="list-item" data-id="${c.id}">
				<div style="display:flex;flex-direction:column;gap:4px">
					<strong>${c.id}</strong>
					<small style="color:#9aa4b2;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(c.text||'').replace(/</g,'&lt;')}</small>
				</div>
			</div>
		`).join('');
		qsa('#contentList .list-item').forEach(item => item.onclick = () => loadContentIntoForm(item.getAttribute('data-id')));
	}
	function filterContentList(e){ renderContentList(e.target.value); }
	function loadContentIntoForm(id){
		const c = contentDocs.find(x=>x.id===id); if(!c) return;
		el('contentKey').value = c.id;
		el('contentText').value = c.text || '';
		el('deleteContentBtn').style.display = 'inline-flex';
	}
	async function onSaveContent(e){
		e.preventDefault();
		const key = el('contentKey').value.trim();
		const text = el('contentText').value;
		if (!key) { alert('Key required'); return; }
		await db.collection('content').doc(key).set({ text, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
		await loadContent();
		alert('Saved');
	}
	async function onDeleteContent(){
		const key = el('contentKey').value.trim(); if(!key) return;
		if (!confirm('Delete this content key?')) return;
		await db.collection('content').doc(key).delete();
		await loadContent();
		el('contentForm').reset();
		el('deleteContentBtn').style.display = 'none';
	}

	async function refreshAll(){
		await Promise.all([loadProducts(), loadArtisans(), loadContent()]);
	}

	// ===== Preview Functions =====
	function updateProductPreview() {
		const preview = el('productPreview');
		const name = el('productName').value.trim();
		const artisan = el('productArtisan').value.trim();
		const location = el('productLocation').value.trim();
		const category = el('productCategory').value.trim() || 'pottery';
		const badge = el('productBadge').value.trim();
		const price = Number(el('productPrice').value) || 0;
		const description = el('productDescription').value.trim();
		const materials = el('productMaterials').value.trim();
		const dimensions = el('productDimensions').value.trim();
		const image = el('productImage').value.trim();

		if (!name) {
			preview.innerHTML = `
				<div class="preview-placeholder">
					<i class="fas fa-eye"></i>
					<p>Fill out the form to see preview</p>
				</div>
			`;
			return;
		}

		preview.innerHTML = `
			<div style="font-family: system-ui, -apple-system, sans-serif; color: #333; max-width: 300px;">
				<div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
					<div style="position: relative;">
						<div style="width: 100%; height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
							${image ? `<img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
								<div style="display: none; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 14px;">
									<i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px;"></i>
									<span>No Image</span>
								</div>` : `
								<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 14px;">
									<i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px;"></i>
									<span>No Image</span>
								</div>
							`}
						</div>
						${badge ? `<div style="position: absolute; top: 12px; left: 12px; background: #635BFF; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${badge}</div>` : ''}
						<div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
							¥${price.toLocaleString()}
						</div>
					</div>
					<div style="padding: 16px;">
						<h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${name}</h3>
						${artisan ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">by ${artisan}</p>` : ''}
						${location ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">📍 ${location}</p>` : ''}
						${description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #555; line-height: 1.4;">${description}</p>` : ''}
						<div style="display: flex; gap: 12px; margin-top: 12px; font-size: 12px; color: #666;">
							${category ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${category}</span>` : ''}
							${materials ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${materials}</span>` : ''}
						</div>
						${dimensions ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">📏 ${dimensions}</p>` : ''}
					</div>
				</div>
			</div>
		`;
	}

	function updateArtisanPreview() {
		const preview = el('artisanPreview');
		const name = el('artisanName').value.trim();
		const nameJp = el('artisanNameJp').value.trim();
		const craft = el('artisanCraft').value.trim();
		const craftJp = el('artisanCraftJp').value.trim();
		const location = el('artisanLocation').value.trim();
		const years = Number(el('artisanYears').value) || 0;
		const specialty = el('artisanSpecialty').value.trim();
		const story = el('artisanStory').value.trim();
		const quote = el('artisanQuote').value.trim();
		const image = el('artisanImage').value.trim();

		if (!name) {
			preview.innerHTML = `
				<div class="preview-placeholder">
					<i class="fas fa-eye"></i>
					<p>Fill out the form to see preview</p>
				</div>
			`;
			return;
		}

		preview.innerHTML = `
			<div style="font-family: system-ui, -apple-system, sans-serif; color: #333; max-width: 300px;">
				<div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
					<div style="position: relative;">
						<div style="width: 100%; height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
							${image ? `<img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
								<div style="display: none; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 14px;">
									<i class="fas fa-user" style="font-size: 24px; margin-bottom: 8px;"></i>
									<span>No Photo</span>
								</div>` : `
								<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 14px;">
									<i class="fas fa-user" style="font-size: 24px; margin-bottom: 8px;"></i>
									<span>No Photo</span>
								</div>
							`}
						</div>
					</div>
					<div style="padding: 16px;">
						<h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${name}</h3>
						${nameJp ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-style: italic;">${nameJp}</p>` : ''}
						${craft ? `<p style="margin: 0 0 4px 0; font-size: 16px; color: #635BFF; font-weight: 600;">${craft}</p>` : ''}
						${craftJp ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-style: italic;">${craftJp}</p>` : ''}
						<div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 12px; color: #666;">
							${location ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">📍 ${location}</span>` : ''}
							${years ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${years} years</span>` : ''}
						</div>
						${specialty ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #555; font-weight: 600;">Specialty: ${specialty}</p>` : ''}
						${story ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #555; line-height: 1.4;">${story}</p>` : ''}
						${quote ? `<blockquote style="margin: 8px 0 0 0; padding: 8px 12px; background: #f8f9fa; border-left: 3px solid #635BFF; font-style: italic; color: #555; font-size: 14px;">"${quote}"</blockquote>` : ''}
					</div>
				</div>
			</div>
		`;
	}

})();


