// ===== SIMPLE ROLE-BASED CMS (Firebase) =====
// Provides:
// - Inline text editing for elements with [data-edit-key]
// - Products and Artisans CRUD (Firestore) with image upload (Storage)
// - Role gating via users/{uid}.role in Firestore ('editor' or 'admin')

(function() {
	if (typeof firebase === 'undefined' || !db) {
		console.warn('CMS disabled: Firebase not initialized');
		return;
	}

	const cmsState = {
		role: 'viewer',
		isEditor: false,
		loadedContentKeys: new Set()
	};

	// ===== Role detection =====
	firebase.auth().onAuthStateChanged(async (user) => {
		if (!user) {
			cmsState.role = 'viewer';
			cmsState.isEditor = false;
			hideCmsToolbar();
			return;
		}
		try {
			const userDoc = await db.collection('users').doc(user.uid).get();
			const role = userDoc.exists ? (userDoc.data().role || 'viewer') : 'viewer';
			cmsState.role = role;
			cmsState.isEditor = ['editor', 'admin'].includes(role);
			if (cmsState.isEditor) {
				showCmsToolbar();
			} else {
				hideCmsToolbar();
			}
		} catch (e) {
			console.error('Failed to load user role', e);
		}
	});

	// ===== Content loading for data-edit-key elements =====
	document.addEventListener('DOMContentLoaded', () => {
		applyEditableContentFromFirestore();
	});

	async function applyEditableContentFromFirestore() {
		const editableEls = document.querySelectorAll('[data-edit-key]');
		for (const el of editableEls) {
			const key = el.getAttribute('data-edit-key');
			if (!key || cmsState.loadedContentKeys.has(key)) continue;
			try {
				const docRef = db.collection('content').doc(key);
				const snap = await docRef.get();
				if (snap.exists && snap.data().text) {
					el.textContent = snap.data().text;
				}
				cmsState.loadedContentKeys.add(key);
			} catch (e) {
				console.warn('Content load failed for', key, e);
			}
		}
	}

	// ===== Toolbar UI =====
	let toolbar = null;

	function showCmsToolbar() {
		if (toolbar) {
			toolbar.style.display = 'flex';
			return;
		}
		toolbar = document.createElement('div');
		toolbar.id = 'cmsToolbar';
		toolbar.style.cssText = `
			position: fixed; z-index: 2147483647; right: 16px; bottom: 16px;
			display: flex; gap: 8px; background: #111; color: #fff; padding: 10px 12px;
			border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,.25); align-items: center;
			font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
		`;
		toolbar.innerHTML = `
			<span style="opacity:.75; font-size:.9rem;">CMS</span>
			<button id="cmsToggleEdit" style="background:#2e7d32; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;">Edit</button>
			<button id="cmsManageProducts" style="background:#1565c0; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;">Products</button>
			<button id="cmsManageArtisans" style="background:#6a1b9a; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;">Artisans</button>
			<button id="cmsSaveContent" style="background:#ef6c00; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;">Save</button>
		`;
		document.body.appendChild(toolbar);

		document.getElementById('cmsToggleEdit').addEventListener('click', toggleEditMode);
		document.getElementById('cmsSaveContent').addEventListener('click', saveEditableContent);
		document.getElementById('cmsManageProducts').addEventListener('click', openProductsManager);
		document.getElementById('cmsManageArtisans').addEventListener('click', openArtisansManager);
	}

	function hideCmsToolbar() {
		if (toolbar) toolbar.style.display = 'none';
		setEditMode(false);
	}

	let editMode = false;
	function toggleEditMode() {
		setEditMode(!editMode);
	}

	function setEditMode(enabled) {
		editMode = enabled;
		const btn = document.getElementById('cmsToggleEdit');
		if (btn) btn.textContent = enabled ? 'Editing…' : 'Edit';
		document.querySelectorAll('[data-edit-key]').forEach(el => {
			if (enabled) {
				el.setAttribute('contenteditable', 'true');
				el.style.outline = '2px dashed #ff9800';
				el.style.outlineOffset = '2px';
			} else {
				el.removeAttribute('contenteditable');
				el.style.outline = '';
				el.style.outlineOffset = '';
			}
		});
	}

	async function saveEditableContent() {
		if (!cmsState.isEditor) {
			alert('You do not have permission to save content.');
			return;
		}
		const user = firebase.auth().currentUser;
		const batch = db.batch();
		document.querySelectorAll('[data-edit-key]').forEach(el => {
			const key = el.getAttribute('data-edit-key');
			if (!key) return;
			const ref = db.collection('content').doc(key);
			batch.set(ref, {
				text: el.textContent.trim(),
				updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
				updatedBy: user ? user.uid : ''
			}, { merge: true });
		});
		try {
			await batch.commit();
			alert('Content saved.');
		} catch (e) {
			console.error('Save failed', e);
			alert('Failed to save content.');
		}
	}

	// ===== Products Manager (prompt-driven MVP) =====
	async function openProductsManager() {
		if (!cmsState.isEditor) { alert('Insufficient permissions'); return; }
		const action = prompt('Products: type one of: list, add, edit, delete');
		if (!action) return;
		switch (action.toLowerCase()) {
			case 'list': return listProducts();
			case 'add': return addProduct();
			case 'edit': return editProduct();
			case 'delete': return deleteProduct();
			default: alert('Unknown action');
		}
	}

	async function listProducts() {
		const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
		const items = [];
		snap.forEach(d => items.push({ id: d.id, ...d.data() }));
		alert(`Products in CMS:\n${items.map(p => `- ${p.name} (${p.category || ''})`).join('\n') || 'None'}`);
	}

	async function addProduct() {
		const name = prompt('Product name?'); if (!name) return;
		const artisan = prompt('Artisan name?') || '';
		const location = prompt('Location?') || '';
		const priceStr = prompt('Price (number)?') || '0';
		const category = prompt('Category (pottery, kimono, etc)?') || 'pottery';
		const badge = prompt('Badge (New, Masterpiece, etc)?') || '';
		const description = prompt('Short description?') || '';
		const materials = prompt('Materials?') || '';
		const dimensions = prompt('Dimensions?') || '';
		let imageUrl = prompt('Image URL (leave blank to upload)') || '';
		if (!imageUrl && storage) {
			alert('Select an image file in the next dialog.');
			try {
				const [fileHandle] = await window.showOpenFilePicker({ types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'] } }] });
				const file = await fileHandle.getFile();
				const ref = storage.ref().child(`uploads/products/${Date.now()}_${file.name}`);
				await ref.put(file);
				imageUrl = await ref.getDownloadURL();
			} catch (e) {
				console.warn('File upload skipped/failed', e);
			}
		}
		await db.collection('products').add({
			name, artisan, location,
			price: Number(priceStr) || 0,
			category, badge, description, materials, dimensions,
			image: imageUrl || 'pot1.webp',
			createdAt: firebase.firestore.FieldValue.serverTimestamp()
		});
		await mergeFirestoreProductsIntoUI();
		alert('Product added.');
	}

	async function editProduct() {
		const name = prompt('Enter existing product name to edit'); if (!name) return;
		const q = await db.collection('products').where('name', '==', name).limit(1).get();
		if (q.empty) { alert('Not found'); return; }
		const doc = q.docs[0];
		const data = doc.data();
		const newPrice = prompt(`New price (current ${data.price})`, String(data.price));
		const newBadge = prompt(`New badge (current ${data.badge||''})`, data.badge||'');
		await doc.ref.update({ price: Number(newPrice)||0, badge: newBadge });
		await mergeFirestoreProductsIntoUI(true);
		alert('Product updated.');
	}

	async function deleteProduct() {
		const name = prompt('Enter product name to delete'); if (!name) return;
		const q = await db.collection('products').where('name', '==', name).limit(1).get();
		if (q.empty) { alert('Not found'); return; }
		await q.docs[0].ref.delete();
		await mergeFirestoreProductsIntoUI(true);
		alert('Product deleted.');
	}

	// ===== Artisans Manager (prompt-driven MVP) =====
	async function openArtisansManager() {
		if (!cmsState.isEditor) { alert('Insufficient permissions'); return; }
		const action = prompt('Artisans: type one of: list, add, edit, delete');
		if (!action) return;
		switch (action.toLowerCase()) {
			case 'list': return listArtisans();
			case 'add': return addArtisan();
			case 'edit': return editArtisan();
			case 'delete': return deleteArtisan();
			default: alert('Unknown action');
		}
	}

	async function listArtisans() {
		const snap = await db.collection('artisans').orderBy('createdAt', 'desc').get();
		const items = [];
		snap.forEach(d => items.push({ id: d.id, ...d.data() }));
		alert(`Artisans in CMS:\n${items.map(a => `- ${a.name} (${a.craft || ''})`).join('\n') || 'None'}`);
	}

	async function addArtisan() {
		const name = prompt('Artisan name?'); if (!name) return;
		const nameJp = prompt('Name (Japanese)?') || '';
		const craft = prompt('Craft?') || '';
		const craftJp = prompt('Craft (JP)?') || '';
		const location = prompt('Location?') || '';
		const yearsStr = prompt('Years of experience?') || '0';
		const specialty = prompt('Specialty?') || '';
		const story = prompt('Short story?') || '';
		const quote = prompt('Quote?') || '';
		let image = prompt('Image URL (leave blank to upload)') || '';
		if (!image && storage) {
			alert('Select an image file in the next dialog.');
			try {
				const [fileHandle] = await window.showOpenFilePicker({ types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'] } }] });
				const file = await fileHandle.getFile();
				const ref = storage.ref().child(`uploads/artisans/${Date.now()}_${file.name}`);
				await ref.put(file);
				image = await ref.getDownloadURL();
			} catch (e) {
				console.warn('File upload skipped/failed', e);
			}
		}
		await db.collection('artisans').add({
			name, nameJp, craft, craftJp, location, years: Number(yearsStr)||0,
			specialty, story, quote, image,
			createdAt: firebase.firestore.FieldValue.serverTimestamp()
		});
		await mergeFirestoreArtisansIntoUI();
		alert('Artisan added.');
	}

	async function editArtisan() {
		const name = prompt('Enter existing artisan name to edit'); if (!name) return;
		const q = await db.collection('artisans').where('name', '==', name).limit(1).get();
		if (q.empty) { alert('Not found'); return; }
		const doc = q.docs[0];
		const data = doc.data();
		const newLocation = prompt(`New location (current ${data.location||''})`, data.location||'');
		await doc.ref.update({ location: newLocation });
		await mergeFirestoreArtisansIntoUI(true);
		alert('Artisan updated.');
	}

	async function deleteArtisan() {
		const name = prompt('Enter artisan name to delete'); if (!name) return;
		const q = await db.collection('artisans').where('name', '==', name).limit(1).get();
		if (q.empty) { alert('Not found'); return; }
		await q.docs[0].ref.delete();
		await mergeFirestoreArtisansIntoUI(true);
		alert('Artisan deleted.');
	}

	// ===== Merge CMS data into existing UI =====
	async function mergeFirestoreProductsIntoUI(forceRefresh) {
		try {
			const snap = await db.collection('products').get();
			const cmsProducts = [];
			snap.forEach(d => cmsProducts.push(d.data()));
			if (Array.isArray(window.products)) {
				const existingIds = new Set(window.products.map(p => p.id));
				let maxId = 0;
				window.products.forEach(p => { if (typeof p.id === 'number') maxId = Math.max(maxId, p.id); });
				cmsProducts.forEach(p => {
					if (!window.products.some(x => x.name === p.name)) {
						maxId += 1;
						window.products.push({
							id: maxId,
							name: p.name,
							artisan: p.artisan || '',
							location: p.location || '',
							price: Number(p.price) || 0,
							image: p.image || 'pot1.webp',
							badge: p.badge || '',
							category: p.category || 'pottery',
							description: p.description || '',
							materials: p.materials || '',
							dimensions: p.dimensions || ''
						});
					}
				});
				if (typeof window.displayProducts === 'function') {
					window.displayProducts(window.products);
				}
			}
		} catch (e) {
			console.error('Failed merging products', e);
		}
	}

	async function mergeFirestoreArtisansIntoUI(forceRefresh) {
		try {
			const snap = await db.collection('artisans').get();
			const cmsArtisans = [];
			snap.forEach(d => cmsArtisans.push(d.data()));
			if (Array.isArray(window.craftsmen)) {
				let maxId = 0;
				window.craftsmen.forEach(a => { if (typeof a.id === 'number') maxId = Math.max(maxId, a.id); });
				cmsArtisans.forEach(a => {
					if (!window.craftsmen.some(x => x.name === a.name)) {
						maxId += 1;
						window.craftsmen.push({
							id: maxId,
							name: a.name,
							nameJp: a.nameJp || '',
							craft: a.craft || '',
							craftJp: a.craftJp || '',
							location: a.location || '',
							image: a.image || 'face1.jpg',
							specialty: a.specialty || '',
							years: Number(a.years) || 0,
							story: a.story || '',
							quote: a.quote || ''
						});
					}
				});
				// Refresh spotlight
				if (typeof window.displaySpotlightArtisan === 'function') {
					window.displaySpotlightArtisan(0);
				}
			}
		} catch (e) {
			console.error('Failed merging artisans', e);
		}
	}

	// Merge on window load to ensure UI functions exist
	window.addEventListener('load', () => {
		mergeFirestoreProductsIntoUI();
		mergeFirestoreArtisansIntoUI();
	});

})();


