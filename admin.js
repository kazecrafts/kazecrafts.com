(function(){
	if (typeof firebase === 'undefined') return;

	const el = (id) => document.getElementById(id);
	const qs = (sel) => document.querySelector(sel);
	const qsa = (sel) => Array.from(document.querySelectorAll(sel));

	// Auth gate
	firebase.auth().onAuthStateChanged(async (user) => {
		if (!user || !db) return showDenied();
		try {
			const userDoc = await db.collection('users').doc(user.uid).get();
			const role = userDoc.exists ? (userDoc.data().role || 'viewer') : 'viewer';
			if (!['editor','admin'].includes(role)) return showDenied();
			initAdmin(user);
		} catch(e){
			console.error(e); showDenied();
		}
	});

	function showDenied(){
		el('adminApp').style.display = 'none';
		const d = el('denied');
		d.style.display = 'flex';
		const btn = el('goHome');
		if (btn) btn.onclick = () => { window.location.href = 'index.html'; };
	}

	function initAdmin(user){
		el('denied').style.display = 'none';
		el('adminApp').style.display = 'block';
		el('adminUserEmail').textContent = user.email;
		el('adminLogoutBtn').onclick = () => auth.signOut();
		// Tabs
		qsa('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
		// Products
		el('btnNewProduct').onclick = resetProductForm;
		el('productForm').onsubmit = onSaveProduct;
		el('resetProductBtn').onclick = resetProductForm;
		el('deleteProductBtn').onclick = onDeleteProduct;
		el('productSearch').oninput = filterProductsList;
		// Artisans
		el('btnNewArtisan').onclick = resetArtisanForm;
		el('artisanForm').onsubmit = onSaveArtisan;
		el('resetArtisanBtn').onclick = resetArtisanForm;
		el('deleteArtisanBtn').onclick = onDeleteArtisan;
		el('artisanSearch').oninput = filterArtisansList;
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

})();


