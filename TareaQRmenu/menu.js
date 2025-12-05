// Interactividad mínima: filtrado, añadir al carrito y modal
document.addEventListener('DOMContentLoaded', () => {
	const filters = document.querySelectorAll('.filter');
	const items = document.querySelectorAll('.menu-item');
	const cartBtn = document.getElementById('cartBtn');
	const cartModal = document.getElementById('cartModal');
	const closeCart = document.getElementById('closeCart');
	const cartItemsEl = document.getElementById('cartItems');
	const cartCountEl = document.getElementById('cartCount');
	const cartTotalEl = document.getElementById('cartTotal');
	const checkout = document.getElementById('checkout');

	let cart = [];

	// Filtrado por categoría
	filters.forEach(btn => btn.addEventListener('click', () => {
		filters.forEach(b => b.classList.remove('active'));
		btn.classList.add('active');
		const cat = btn.dataset.cat;
		items.forEach(it => {
			if (cat === 'all' || it.dataset.category === cat) {
				it.style.display = '';
			} else {
				it.style.display = 'none';
			}
		});

		// Si hay un cambio de fondo asignado para esta categoría, aplicarlo
		if (window.categoryBackgrounds && window.categoryBackgrounds[cat]){
			if(typeof window.setSectionBg === 'function') window.setSectionBg(window.categoryBackgrounds[cat]);
		}
	}));

	// Añadir al carrito
	document.querySelectorAll('.add-btn').forEach((b, idx) => {
		b.addEventListener('click', (e) => {
			const item = e.target.closest('.menu-item');
			const title = item.querySelector('h3').innerText;
			const price = parseFloat(item.dataset.price);
			addToCart({title, price, qty:1});
		});
	});

	function addToCart(product){
		const found = cart.find(i => i.title === product.title);
		if(found){ found.qty += 1; } else { cart.push(product); }
		updateCartUI();
	}

	function updateCartUI(){
		// contador simple
		const totalQty = cart.reduce((s,i)=>s+i.qty,0);
		cartCountEl.innerText = totalQty;

		// lista en modal
		cartItemsEl.innerHTML = '';
		cart.forEach(it => {
			const row = document.createElement('div');
			row.style.display = 'flex';
			row.style.justifyContent = 'space-between';
			row.style.marginBottom = '8px';
			row.innerHTML = `<div>${it.title} x ${it.qty}</div><div>$${(it.price*it.qty).toFixed(2)}</div>`;
			cartItemsEl.appendChild(row);
		});

		const total = cart.reduce((s,i)=>s + i.price * i.qty,0);
		cartTotalEl.innerText = total.toFixed(2);
	}

	// abrir/cerrar modal carrito
	cartBtn.addEventListener('click', ()=>{
		cartModal.setAttribute('aria-hidden','false');
		updateCartUI();
	});
	closeCart.addEventListener('click', ()=>{
		cartModal.setAttribute('aria-hidden','true');
	});
	checkout.addEventListener('click', ()=>{
		alert('Gracias por tu compra! Total: $' + cartTotalEl.innerText);
		cart = []; updateCartUI(); cartModal.setAttribute('aria-hidden','true');
	});

	// cerrar modal con Escape
	document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ cartModal.setAttribute('aria-hidden','true'); } });

});

// --- Fondo por sección (IntersectionObserver) ---
document.addEventListener('DOMContentLoaded', () => {
	const bgLayer = document.getElementById('bgLayer');
	if(!bgLayer) return;

	// Seleccionar secciones que indican una imagen de fondo
	const sections = document.querySelectorAll('[data-bg]');
	const options = { root: null, rootMargin: '0px', threshold: 0.45 };

	let currentBg = null;

	const setBg = (src) => {
		if(!src) return;
		// crossfade: aplicar clase fade-out y luego cambiar imagen
		bgLayer.classList.add('fade-out');
		setTimeout(() => {
			bgLayer.style.backgroundImage = `url('${src}')`;
			bgLayer.classList.remove('fade-out');
		}, 250);
	};

	// Exponer función para que otros handlers (ej. filtros) puedan cambiar el fondo
	window.setSectionBg = setBg;

	// Mapa opcional categoría -> imagen, utilizable por filtros
	window.categoryBackgrounds = {
		'Bebidas Frias': 'smothiee.jpeg',
		'Bebidas Calientes': 'cafeexpreso.jpeg',
		'Postres': 'brownie.jpeg',
		'Desayunos': 'rojos.jpeg',
		'Temporada': 'panmuerto.jpeg',
		'Especiales': 'molletes.jpeg'
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if(entry.isIntersecting){
				const src = entry.target.dataset.bg;
				if(src && src !== currentBg){
					currentBg = src;
					setBg(src);
				}
			}
		});
	}, options);

	sections.forEach(s => observer.observe(s));

	// Inicializar con la primera sección encontrada
	if(sections.length){
		const first = sections[0].dataset.bg;
		if(first) bgLayer.style.backgroundImage = `url('${first}')`;
	}
});


