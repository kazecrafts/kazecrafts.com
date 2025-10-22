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
			// Try to get user document first (skip persistence to avoid connection issues)
			let userDoc;
			try {
				userDoc = await db.collection('users').doc(user.uid).get();
			} catch (fetchError) {
				console.warn('Failed to fetch user document, attempting to create it:', fetchError);
				// If fetch fails, try to create the document
				await db.collection('users').doc(user.uid).set({
					email: user.email,
					displayName: user.displayName || user.email.split('@')[0],
					role: 'editor', // Default to editor instead of viewer
					createdAt: firebase.firestore.FieldValue.serverTimestamp(),
					updatedAt: firebase.firestore.FieldValue.serverTimestamp()
				}, { merge: true });
				
				console.log('✅ User document created with editor role');
				// Try to fetch again
				userDoc = await db.collection('users').doc(user.uid).get();
			}
			
			// If user document doesn't exist, create it with editor role
			if (!userDoc.exists) {
				console.log('Creating user document with editor role (auto-grant)...');
				await db.collection('users').doc(user.uid).set({
					email: user.email,
					displayName: user.displayName || user.email.split('@')[0],
					role: 'editor', // Auto-grant editor access
					createdAt: firebase.firestore.FieldValue.serverTimestamp(),
					updatedAt: firebase.firestore.FieldValue.serverTimestamp()
				}, { merge: true });
				
				console.log('✅ User document created with editor role');
				// Initialize with editor role
				initAdmin(user, 'editor');
				return;
			}
			
			const userData = userDoc.data();
			let role = userData.role || 'editor'; // Default to editor if no role
			
			console.log('User role:', role);
			
			// Auto-upgrade viewers to editors
			if (role === 'viewer') {
				console.log('Auto-upgrading viewer to editor...');
				await db.collection('users').doc(user.uid).update({ 
					role: 'editor',
					updatedAt: firebase.firestore.FieldValue.serverTimestamp()
				});
				role = 'editor';
			}
			
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
		if (!d) {
			console.error('Denied element not found');
			return;
		}
		const card = d.querySelector('.denied-content');
		if (!card) {
			console.error('Denied content element not found');
			return;
		}
		
		card.innerHTML = `
			<div style="text-align:center;padding:2rem;background:white;border-radius:20px;max-width:600px;box-shadow:0 20px 60px rgba(0,0,0,0.1);">
				<div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
				<h2 style="font-family:'Noto Serif JP',serif;font-size:1.8rem;color:#2a2a2a;margin-bottom:0.5rem;">アクセス制限</h2>
				<h3 style="font-family:'Cinzel',serif;font-size:0.9rem;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1.5rem;">Access Restricted</h3>
				<p style="color:#666;margin-bottom:1rem;font-size:0.95rem;">${message}</p>
				${userEmail ? `<p style="margin-top:1rem;opacity:0.7;font-size:0.9rem;">Logged in as: <strong>${userEmail}</strong></p>` : ''}
				<div style="margin-top:2rem;padding:1.5rem;background:#faf8f3;border:1px solid rgba(212,175,55,0.15);border-radius:12px;text-align:left;font-size:0.9rem;">
					<strong style="font-family:'Noto Serif JP',serif;font-size:1rem;color:#2a2a2a;">管理者アクセスを付与する方法:</strong>
					<strong style="display:block;font-family:'Cinzel',serif;font-size:0.8rem;color:#666;margin-bottom:1rem;">To grant admin access:</strong>
					<ol style="margin:1rem 0;padding-left:1.5rem;color:#666;line-height:1.8;">
						<li>Open Firebase Console</li>
						<li>Go to Firestore Database</li>
						<li>Find users collection → your user document</li>
						<li>Edit and set <code style="background:#fff;padding:2px 6px;border-radius:4px;color:#50C878;">role</code> to <code style="background:#fff;padding:2px 6px;border-radius:4px;color:#50C878;">editor</code> or <code style="background:#fff;padding:2px 6px;border-radius:4px;color:#50C878;">admin</code></li>
						<li>Refresh this page</li>
					</ol>
					<div style="margin-top:1rem;padding:1rem;background:white;border-radius:8px;font-family:monospace;font-size:0.85rem;border:1px solid rgba(80,200,120,0.2);">
						<div style="color:#666;margin-bottom:0.5rem;">Or run in console:</div>
						<code style="color:#50C878;font-weight:600;">setRole('${userEmail}', 'admin')</code>
					</div>
				</div>
				<div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem;">
					<button id="adminLogoutBtn2" style="padding:0.75rem 1.5rem;background:linear-gradient(135deg,#50C878,#3da55f);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;">
						<i class="fas fa-sign-out-alt"></i>
						<span style="font-family:'Noto Serif JP',serif;">ログアウト</span>
					</button>
					<button id="goHome" style="padding:0.75rem 1.5rem;background:white;border:1px solid rgba(212,175,55,0.3);border-radius:10px;color:#2a2a2a;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;">
						<i class="fas fa-home"></i>
						<span style="font-family:'Noto Serif JP',serif;">サイトへ</span>
					</button>
				</div>
			</div>
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

	// Force admin access function (callable from login screen)
	window.forceAdminAccess = async function() {
		console.log('🔑 Forcing admin access...');
		
		// First, try to sign in with Google if not signed in
		if (!auth.currentUser) {
			try {
				const provider = new firebase.auth.GoogleAuthProvider();
				await auth.signInWithPopup(provider);
				console.log('✅ Signed in with Google');
			} catch(error) {
				console.error('Sign in failed:', error);
				alert('Please sign in first before using auto-access');
				return;
			}
		}

		const user = auth.currentUser;
		if (!user) {
			alert('Please sign in first');
			return;
		}

		try {
			// Force create/update user document with admin role
			await db.collection('users').doc(user.uid).set({
				email: user.email,
				displayName: user.displayName || user.email.split('@')[0],
				role: 'admin',
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				updatedAt: firebase.firestore.FieldValue.serverTimestamp()
			}, { merge: true });

			console.log('✅ Admin access granted!');
			alert('✅ Admin access granted! Reloading...');
			location.reload();
		} catch(error) {
			console.error('Error granting access:', error);
			// If that fails, use bypass
			console.log('Using bypass method...');
			localStorage.setItem('adminBypass', 'true');
			alert('✅ Bypass enabled! Reloading...');
			location.reload();
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
		el('adminUserEmail').textContent = user.email;
		el('adminUserRole').textContent = role === 'admin' ? '管理者 | Admin' : '編集者 | Editor';
		el('adminLogoutBtn').onclick = () => auth.signOut().then(() => location.reload());
		// Tabs
		qsa('.admin-tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
		// Products
		el('btnNewProduct').onclick = resetProductForm;
		el('productForm').onsubmit = onSaveProduct;
		el('resetProductBtn').onclick = resetProductForm;
		el('deleteProductBtn').onclick = onDeleteProduct;
		el('productSearch').oninput = filterProductsList;
		// Add preview listeners for products
		qsa('#productForm input, #productForm textarea').forEach(input => {
			input.addEventListener('input', updateProductPreview);
			input.addEventListener('change', updateProductPreview); // For file inputs and selects
		});
		// Handle image file preview
		el('productImageFile').addEventListener('change', function(e) {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = function(event) {
					el('productImage').value = event.target.result; // Set data URL
					updateProductPreview();
				};
				reader.readAsDataURL(file);
			}
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
			input.addEventListener('change', updateArtisanPreview); // For file inputs and selects
		});
		// Handle image file preview
		el('artisanImageFile').addEventListener('change', function(e) {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = function(event) {
					el('artisanImage').value = event.target.result; // Set data URL
					updateArtisanPreview();
				};
				reader.readAsDataURL(file);
			}
		});
		// Content
		el('btnNewContent').onclick = () => { el('contentKey').value=''; el('contentText').value=''; el('deleteContentBtn').style.display='none'; };
		el('contentForm').onsubmit = onSaveContent;
		el('deleteContentBtn').onclick = onDeleteContent;
		el('contentSearch').oninput = filterContentList;
		
		refreshAll();
	}

	function switchTab(tab){
		qsa('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
		qsa('.admin-tab').forEach(s => s.classList.toggle('active', s.id===`tab-${tab}`));
	}

	// Make switchTab global for quick actions
	window.switchToTab = switchTab;

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
		const image = el('productImage').value.trim() || 'pot1.webp';

		if (!name) {
			preview.innerHTML = `
				<div class="preview-placeholder">
					<i class="fas fa-eye"></i>
					<p>Fill out the form to see preview</p>
				</div>
			`;
			return;
		}

		// Use EXACT structure from website's product cards
		preview.innerHTML = `
			<div class="product-card" style="max-width: 320px; margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.15);">
				<div class="product-image">
					<img src="${image}" alt="${name}" onerror="this.src='pot1.webp'">
					${badge && badge.toLowerCase() === 'new' ? `<div class="product-badge">${badge}</div>` : ''}
					<button class="product-wishlist-btn" onclick="return false;" title="Add to wishlist" style="pointer-events: none;">
						<i class="far fa-heart"></i>
					</button>
				</div>
				<div class="product-info">
					<div class="product-category-label">${category.toUpperCase()}</div>
					<div class="product-name">${name}</div>
					<div class="product-artisan">${artisan}</div>
					<div class="product-location">📍 ${location}</div>
					<div class="product-price-large">¥${price.toLocaleString()}</div>
					<div class="product-actions">
						<button class="product-stripe-btn" onclick="return false;" style="pointer-events: none;">
							<i class="fas fa-lock"></i> Buy Now
						</button>
						<button class="product-cart-btn" onclick="return false;" style="pointer-events: none;">
							<i class="fas fa-shopping-cart"></i> Cart
						</button>
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
		const image = el('artisanImage').value.trim() || 'face1.jpg';

		if (!name) {
			preview.innerHTML = `
				<div class="preview-placeholder">
					<i class="fas fa-eye"></i>
					<p>Fill out the form to see preview</p>
				</div>
			`;
			return;
		}

		// Use EXACT structure from website's artisan modal/spotlight
		preview.innerHTML = `
			<div class="craftsman-modal-grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 600px; margin: 0 auto;">
				<div class="craftsman-modal-left" style="max-width: 100%;">
					<img src="${image}" alt="${name}" class="craftsman-modal-image" style="width: 100%; height: auto; border-radius: 12px; object-fit: cover;" onerror="this.src='face1.jpg'">
				</div>
				<div class="craftsman-modal-right">
					<div class="craftsman-modal-label">${craft}</div>
					<h2 class="craftsman-modal-name">${name}</h2>
					<p class="craftsman-modal-name-jp">${nameJp} | ${craftJp}</p>
					<div class="craftsman-modal-meta">
						<span>📍 ${location}</span>
						<span>⏱️ ${years} years</span>
						<span>✨ ${specialty}</span>
					</div>
					
					${story ? `<div class="craftsman-modal-story">
						<h3>The Story</h3>
						<p>${story}</p>
					</div>` : ''}
					
					${quote ? `<div class="craftsman-modal-quote">
						<i class="fas fa-quote-left"></i>
						<p>${quote}</p>
					</div>` : ''}
					
					<button class="craftsman-modal-browse" onclick="return false;" style="pointer-events: none;">
						Browse ${name}'s Works
					</button>
				</div>
			</div>
		`;
	}

})();


