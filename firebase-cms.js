// ===== LIVE CMS - REAL-TIME SYNC WITH FIRESTORE =====
// Products and Artisans from admin panel appear INSTANTLY on website
// Text edits with [data-edit-key] sync in real-time

(function() {
	if (typeof firebase === 'undefined' || !db) {
		console.warn('⚠️ CMS disabled: Firebase not initialized');
		return;
	}

	console.log('🔥 CMS: Initializing real-time sync...');

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
			
			console.log(`👤 CMS: User role = ${role}`);
			
			if (cmsState.isEditor) {
				console.log('✅ CMS: Editor access - showing toolbar');
				showCmsToolbar();
			} else {
				hideCmsToolbar();
			}
		} catch (e) {
			console.error('❌ Failed to load user role', e);
		}
	});

	// ===== REAL-TIME PRODUCTS SYNC =====
	// Listen to Firestore changes and update website LIVE
	let productsListener = null;
	
	function startProductsSync() {
		if (productsListener) return; // Already listening
		
		console.log('🔄 CMS: Starting real-time products sync...');
		
		productsListener = db.collection('products').onSnapshot((snapshot) => {
			console.log(`📦 CMS: Products updated (${snapshot.docs.length} items)`);
			
			const cmsProducts = [];
			snapshot.forEach(doc => {
				cmsProducts.push({
					id: doc.id,
					...doc.data()
				});
			});
			
			// Merge into window.products array
			mergeProductsIntoUI(cmsProducts);
		}, (error) => {
			console.error('❌ Products sync error:', error);
		});
	}

	function mergeProductsIntoUI(cmsProducts) {
		if (!Array.isArray(window.products)) {
			console.warn('⚠️ window.products not found, creating array');
			window.products = [];
		}
		
		// Get max ID from existing products
		let maxId = 0;
		window.products.forEach(p => {
			if (typeof p.id === 'number') maxId = Math.max(maxId, p.id);
		});
		
		// Merge/update products
		cmsProducts.forEach(cmsProduct => {
			// Find existing product by name
			const existingIndex = window.products.findIndex(p => p.name === cmsProduct.name);
			
			const productData = {
				name: cmsProduct.name || '',
				artisan: cmsProduct.artisan || '',
				location: cmsProduct.location || '',
				price: Number(cmsProduct.price) || 0,
				image: cmsProduct.image || 'pot1.webp',
				badge: cmsProduct.badge || '',
				category: cmsProduct.category || 'pottery',
				description: cmsProduct.description || '',
				materials: cmsProduct.materials || '',
				dimensions: cmsProduct.dimensions || ''
			};
			
			if (existingIndex >= 0) {
				// Update existing product (keep same ID)
				window.products[existingIndex] = {
					id: window.products[existingIndex].id,
					...productData
				};
			} else {
				// Add new product
				maxId += 1;
				window.products.push({
					id: maxId,
					...productData
				});
			}
		});
		
		// Refresh display
		if (typeof window.displayProducts === 'function') {
			console.log('✅ CMS: Refreshing products display');
			window.displayProducts(window.products);
			
			// Update product count if function exists
			if (typeof window.updateProductCount === 'function') {
				window.updateProductCount();
			}
		}
	}

	// ===== REAL-TIME ARTISANS SYNC =====
	let artisansListener = null;
	
	function startArtisansSync() {
		if (artisansListener) return; // Already listening
		
		console.log('🔄 CMS: Starting real-time artisans sync...');
		
		artisansListener = db.collection('artisans').onSnapshot((snapshot) => {
			console.log(`👥 CMS: Artisans updated (${snapshot.docs.length} items)`);
			
			const cmsArtisans = [];
			snapshot.forEach(doc => {
				cmsArtisans.push({
					id: doc.id,
					...doc.data()
				});
			});
			
			// Merge into window.craftsmen array
			mergeArtisansIntoUI(cmsArtisans);
		}, (error) => {
			console.error('❌ Artisans sync error:', error);
		});
	}

	function mergeArtisansIntoUI(cmsArtisans) {
		if (!Array.isArray(window.craftsmen)) {
			console.warn('⚠️ window.craftsmen not found, creating array');
			window.craftsmen = [];
		}
		
		// Get max ID from existing artisans
		let maxId = 0;
		window.craftsmen.forEach(a => {
			if (typeof a.id === 'number') maxId = Math.max(maxId, a.id);
		});
		
		// Merge/update artisans
		cmsArtisans.forEach(cmsArtisan => {
			// Find existing artisan by name
			const existingIndex = window.craftsmen.findIndex(a => a.name === cmsArtisan.name);
			
			const artisanData = {
				name: cmsArtisan.name || '',
				nameJp: cmsArtisan.nameJp || '',
				craft: cmsArtisan.craft || '',
				craftJp: cmsArtisan.craftJp || '',
				location: cmsArtisan.location || '',
				image: cmsArtisan.image || 'face1.jpg',
				specialty: cmsArtisan.specialty || '',
				years: Number(cmsArtisan.years) || 0,
				story: cmsArtisan.story || '',
				quote: cmsArtisan.quote || ''
			};
			
			if (existingIndex >= 0) {
				// Update existing artisan (keep same ID)
				window.craftsmen[existingIndex] = {
					id: window.craftsmen[existingIndex].id,
					...artisanData
				};
			} else {
				// Add new artisan
				maxId += 1;
				window.craftsmen.push({
					id: maxId,
					...artisanData
				});
			}
		});
		
		// Refresh spotlight display
		if (typeof window.displaySpotlightArtisan === 'function') {
			console.log('✅ CMS: Refreshing artisans display');
			window.displaySpotlightArtisan(window.currentSpotlightIndex || 0);
		}
	}

	// ===== REAL-TIME CONTENT (TEXT) SYNC =====
	let contentListener = null;
	
	function startContentSync() {
		if (contentListener) return; // Already listening
		
		console.log('🔄 CMS: Starting real-time content sync...');
		
		contentListener = db.collection('content').onSnapshot((snapshot) => {
			console.log(`📝 CMS: Content updated (${snapshot.docs.length} keys)`);
			
			snapshot.forEach(doc => {
				const key = doc.id;
				const data = doc.data();
				
				// Find all elements with this key
				const elements = document.querySelectorAll(`[data-edit-key="${key}"]`);
				elements.forEach(el => {
					if (data.text && el.textContent !== data.text) {
						el.textContent = data.text;
						console.log(`✅ CMS: Updated text for key "${key}"`);
					}
				});
			});
		}, (error) => {
			console.error('❌ Content sync error:', error);
		});
	}

	// ===== Start all real-time listeners when page loads =====
	document.addEventListener('DOMContentLoaded', () => {
		console.log('📄 CMS: DOM loaded, starting sync...');
		
		// Start real-time sync for all data
		startProductsSync();
		startArtisansSync();
		startContentSync();
		
		// Also load initial content
		applyEditableContentFromFirestore();
	});

	// Initial content load (one-time)
	async function applyEditableContentFromFirestore() {
		const editableEls = document.querySelectorAll('[data-edit-key]');
		console.log(`📝 CMS: Loading content for ${editableEls.length} editable elements`);
		
		for (const el of editableEls) {
			const key = el.getAttribute('data-edit-key');
			if (!key || cmsState.loadedContentKeys.has(key)) continue;
			
			try {
				const docRef = db.collection('content').doc(key);
				const snap = await docRef.get();
				if (snap.exists && snap.data().text) {
					el.textContent = snap.data().text;
					console.log(`✅ CMS: Loaded content for "${key}"`);
				}
				cmsState.loadedContentKeys.add(key);
			} catch (e) {
				console.warn(`⚠️ Content load failed for "${key}"`, e);
			}
		}
	}

	// ===== CMS TOOLBAR =====
	let toolbar = null;

	function showCmsToolbar() {
		if (toolbar) {
			toolbar.style.display = 'flex';
			return;
		}
		
		// Create floating toolbar with marketplace styling
		toolbar = document.createElement('div');
		toolbar.id = 'cmsToolbar';
		toolbar.style.cssText = `
			position: fixed;
			z-index: 2147483647;
			right: 20px;
			bottom: 20px;
			display: flex;
			gap: 0.8rem;
			background: rgba(255, 255, 255, 0.4);
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			color: #2a2a2a;
			padding: 1rem 1.5rem;
			border-radius: 50px;
			box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
			border: 1px solid rgba(0, 0, 0, 0.08);
			align-items: center;
			font-family: 'Noto Serif JP', serif;
		`;
		
		toolbar.innerHTML = `
			<span style="opacity: 0.75; font-size: 0.9rem; font-weight: 600;">🎨 CMS</span>
			<button id="cmsToggleEdit" style="background: #f5f5f5; color: #2a2a2a; border: 1px solid rgba(0,0,0,0.1); border-radius: 25px; padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.3s ease;">✏️ Edit</button>
			<button id="cmsSaveContent" style="background: #000000; color: white; border: none; border-radius: 25px; padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">💾 Save</button>
			<a href="admin.html" style="background: #f5f5f5; color: #2a2a2a; border: 1px solid rgba(0,0,0,0.1); border-radius: 25px; padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">⚙️ Admin</a>
		`;
		
		document.body.appendChild(toolbar);

		// Add hover effects
		const buttons = toolbar.querySelectorAll('button, a');
		buttons.forEach(btn => {
			btn.addEventListener('mouseenter', function() {
				this.style.background = '#2a2a2a';
				this.style.color = 'white';
				this.style.transform = 'translateY(-2px)';
				this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
			});
			btn.addEventListener('mouseleave', function() {
				if (this.id === 'cmsSaveContent') {
					this.style.background = '#000000';
					this.style.color = 'white';
				} else {
					this.style.background = '#f5f5f5';
					this.style.color = '#2a2a2a';
				}
				this.style.transform = 'translateY(0)';
				this.style.boxShadow = this.id === 'cmsSaveContent' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none';
			});
		});

		document.getElementById('cmsToggleEdit').addEventListener('click', toggleEditMode);
		document.getElementById('cmsSaveContent').addEventListener('click', saveEditableContent);
	}

	function hideCmsToolbar() {
		if (toolbar) toolbar.style.display = 'none';
		setEditMode(false);
	}

	// ===== INLINE TEXT EDITING =====
	let editMode = false;
	
	function toggleEditMode() {
		setEditMode(!editMode);
	}

	function setEditMode(enabled) {
		editMode = enabled;
		const btn = document.getElementById('cmsToggleEdit');
		if (btn) {
			btn.textContent = enabled ? '✅ Editing' : '✏️ Edit';
			btn.style.background = enabled ? '#50C878' : '#f5f5f5';
			btn.style.color = enabled ? 'white' : '#2a2a2a';
		}
		
		document.querySelectorAll('[data-edit-key]').forEach(el => {
			if (enabled) {
				el.setAttribute('contenteditable', 'true');
				el.style.outline = '2px dashed #50C878';
				el.style.outlineOffset = '4px';
				el.style.cursor = 'text';
			} else {
				el.removeAttribute('contenteditable');
				el.style.outline = '';
				el.style.outlineOffset = '';
				el.style.cursor = '';
			}
		});
	}

	async function saveEditableContent() {
		if (!cmsState.isEditor) {
			alert('❌ You do not have permission to save content.');
			return;
		}
		
		const user = firebase.auth().currentUser;
		const batch = db.batch();
		let saveCount = 0;
		
		document.querySelectorAll('[data-edit-key]').forEach(el => {
			const key = el.getAttribute('data-edit-key');
			if (!key) return;
			
			const ref = db.collection('content').doc(key);
			batch.set(ref, {
				text: el.textContent.trim(),
				updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
				updatedBy: user ? user.uid : ''
			}, { merge: true });
			
			saveCount++;
		});
		
		try {
			await batch.commit();
			console.log(`✅ CMS: Saved ${saveCount} content keys`);
			
			// Show success notification
			showCMSNotification(`✅ ${saveCount} changes saved!`, 'success');
			
			// Turn off edit mode
			setEditMode(false);
		} catch (e) {
			console.error('❌ Save failed', e);
			showCMSNotification('❌ Failed to save content', 'error');
		}
	}

	// ===== CMS NOTIFICATION =====
	function showCMSNotification(message, type = 'success') {
		const notification = document.createElement('div');
		notification.style.cssText = `
			position: fixed;
			top: 100px;
			right: 20px;
			background: ${type === 'success' ? 'linear-gradient(135deg, #50C878, #3da55f)' : 'linear-gradient(135deg, #e11d48, #c01d3f)'};
			color: white;
			padding: 1rem 2rem;
			border-radius: 50px;
			box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
			z-index: 2147483646;
			font-family: 'Noto Serif JP', serif;
			font-weight: 600;
			font-size: 1rem;
			animation: slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
			border: 2px solid white;
		`;
		notification.textContent = message;
		
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.style.animation = 'slideOut 0.3s ease';
			setTimeout(() => notification.remove(), 300);
		}, 3000);
	}

	// ===== Start everything when window loads =====
	window.addEventListener('load', () => {
		console.log('🚀 CMS: Window loaded, ensuring sync is active');
		
		// Make sure listeners are started
		startProductsSync();
		startArtisansSync();
		startContentSync();
	});

	// ===== ADMIN LINK IN TOOLBAR =====
	// Already included in toolbar HTML above

})();
