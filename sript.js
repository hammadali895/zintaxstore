/* =========================================================
   ZINTAX STORE - script.js
   ========================================================= */
(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const WHATSAPP = '923390019568';
    const CART_KEY = 'zintaxCart';

    /* ---------------- Toast ---------------- */
    const toast = $('#toast');
    let toastTimer;
    function showToast(message, icon) {
        if (!toast) return;
        $('span', toast).textContent = message;
        const i = $('i', toast);
        if (i) i.className = icon || 'fa-solid fa-check';
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    /* ---------------- Category menu ---------------- */
    const categoryBtn = $('#categoryBtn');
    const categoryMenu = $('#categoryMenu');
    const chevron = categoryBtn ? $('.fa-chevron-down', categoryBtn) : null;

    function setCategoryMenu(open) {
        if (!categoryBtn || !categoryMenu) return;
        categoryMenu.classList.toggle('show', open);
        categoryBtn.classList.toggle('active', open);
        categoryBtn.setAttribute('aria-expanded', String(open));
        if (chevron) chevron.classList.toggle('rotate', open);
    }

    if (categoryBtn && categoryMenu) {
        categoryBtn.addEventListener('click', e => {
            e.stopPropagation();
            setCategoryMenu(!categoryMenu.classList.contains('show'));
        });

        // close when clicking a link inside the menu
        $$('a', categoryMenu).forEach(a => a.addEventListener('click', () => setCategoryMenu(false)));

        // close on outside click
        document.addEventListener('click', e => {
            if (!categoryMenu.classList.contains('show')) return;
            if (!categoryMenu.contains(e.target) && !categoryBtn.contains(e.target)) setCategoryMenu(false);
        });
    }

    // "Explore Categories" / footer "Categories" open the menu
    $$('[data-open-categories]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const nav = $('.navigation');
            if (nav && window.innerWidth <= 768) nav.classList.add('mobile-open');
            setTimeout(() => setCategoryMenu(true), 250);
        });
    });

    /* ---------------- Mobile menu ---------------- */
    const mobileMenu = $('#mobileMenu');
    const navigation = $('.navigation');

    if (mobileMenu && navigation) {
        mobileMenu.addEventListener('click', () => {
            const open = navigation.classList.toggle('mobile-open');
            mobileMenu.classList.toggle('active', open);
            const icon = $('i', mobileMenu);
            if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            if (!open) setCategoryMenu(false);
        });

        $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
            if (window.innerWidth <= 768) mobileMenu.click();
        }));
    }

    /* ---------------- Search ---------------- */
    const searchInput = $('#searchInput');
    const searchBtn = $('#searchBtn');

    function doSearch() {
        const q = searchInput.value.trim();
        if (!q) { searchInput.focus(); return; }
        window.location.href = 'products.html?search=' + encodeURIComponent(q);
    }
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', doSearch);
        searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    }

    /* ---------------- Newsletter ---------------- */
    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = $('#newsletterEmail').value.trim();
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                showToast('Please enter a valid email', 'fa-solid fa-triangle-exclamation');
                return;
            }
            try {
                const list = JSON.parse(localStorage.getItem('zintaxNewsletter') || '[]');
                if (!list.includes(email)) list.push(email);
                localStorage.setItem('zintaxNewsletter', JSON.stringify(list));
            } catch (err) { /* storage unavailable */ }
            newsletterForm.reset();
            showToast('Thanks for subscribing!');
        });
    }

    /* ---------------- Auto sliders ---------------- */
    function initSlider(opts) {
        const track = $(opts.track);
        if (!track) return;

        const viewport = track.parentElement;
        const wrapper = viewport.parentElement;
        const prevBtn = $(opts.prev);
        const nextBtn = $(opts.next);
        const cards = Array.from(track.children);

        let index = 0, perView = 4, gap = 20, cardW = 0, max = 0, timer = null;

        function layout() {
            const w = window.innerWidth;
            perView = w > 1100 ? 4 : w > 768 ? 3 : w > 480 ? 2 : 1;
            gap = parseFloat(getComputedStyle(track).columnGap) || 20;
            cardW = (viewport.clientWidth - gap * (perView - 1)) / perView;
            cards.forEach(c => { c.style.width = cardW + 'px'; });
            max = Math.max(0, cards.length - perView);
            index = Math.min(index, max);
            if (prevBtn) prevBtn.style.visibility = max === 0 ? 'hidden' : '';
            if (nextBtn) nextBtn.style.visibility = max === 0 ? 'hidden' : '';
            move();
        }

        function move() {
            track.style.transform = 'translate3d(' + (-index * (cardW + gap)) + 'px,0,0)';
        }

        function next() { index = index >= max ? 0 : index + 1; move(); }
        function prev() { index = index <= 0 ? max : index - 1; move(); }

        function start() {
            stop();
            if (max === 0) return;
            timer = setInterval(next, opts.delay);
        }
        function stop() { clearInterval(timer); timer = null; }

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); start(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); start(); });

        // pause on hover / focus
        wrapper.addEventListener('mouseenter', stop);
        wrapper.addEventListener('mouseleave', start);
        wrapper.addEventListener('focusin', stop);
        wrapper.addEventListener('focusout', start);

        // touch swipe
        let startX = 0, dx = 0, swiping = false;
        viewport.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX; dx = 0; swiping = true; stop();
        }, { passive: true });
        viewport.addEventListener('touchmove', e => {
            if (swiping) dx = e.touches[0].clientX - startX;
        }, { passive: true });
        viewport.addEventListener('touchend', () => {
            if (!swiping) return;
            swiping = false;
            if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
            start();
        });

        // pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { layout(); start(); }, 150);
        });

        layout();
        start();
    }

    initSlider({ track: '#newArrivalsTrack', prev: '#newArrivalsPrev', next: '#newArrivalsNext', delay: 3500 });
    initSlider({ track: '#sliderTrack', prev: '#sliderPrev', next: '#sliderNext', delay: 3000 });

    /* ---------------- Cart ---------------- */
    const cartBtn = $('#cartBtn');
    const cartDrawer = $('#cartDrawer');
    const cartOverlay = $('#cartOverlay');
    const closeCart = $('#closeCart');
    const cartItemsEl = $('#cartItems');

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { cart = []; }

    const money = n => 'Rs. ' + Number(n).toLocaleString('en-PK');
    const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
    }

    function openCart() {
        if (!cartDrawer) return;
        cartDrawer.classList.add('show');
        cartOverlay && cartOverlay.classList.add('show');
        document.body.classList.add('no-scroll');
    }
    function closeCartDrawer() {
        cartDrawer && cartDrawer.classList.remove('show');
        cartOverlay && cartOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }

    function renderCart() {
        const count = cart.reduce((s, i) => s + i.qty, 0);
        const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

        const set = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
        set('#cartCount', count);
        set('#cartHeaderCount', count);
        set('#cartTotalSmall', money(total));
        set('#drawerTotal', money(total));

        if (!cartItemsEl) return;

        if (!cart.length) {
            cartItemsEl.innerHTML =
                '<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i>' +
                '<h3>Your cart is empty</h3><p>Add products to your cart.</p></div>';
            return;
        }

        cartItemsEl.innerHTML = cart.map(item => (
            '<div class="cart-item" data-id="' + esc(item.id) + '">' +
                '<div class="cart-item-image"><img src="' + esc(item.image || '') + '" alt="' + esc(item.name) + '"></div>' +
                '<div class="cart-item-info">' +
                    '<h4>' + esc(item.name) + '</h4>' +
                    '<div class="cart-item-price">' + money(item.price) + '</div>' +
                    '<div class="quantity">' +
                        '<button type="button" data-act="dec" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>' +
                        '<span>' + item.qty + '</span>' +
                        '<button type="button" data-act="inc" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>' +
                    '</div>' +
                '</div>' +
                '<button type="button" class="remove-item" data-act="remove" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>'
        )).join('');
    }

    function addToCart(product) {
        if (!product || !product.id) return;
        const found = cart.find(i => i.id === product.id);
        if (found) found.qty += 1;
        else cart.push({
            id: String(product.id),
            name: product.name || 'Product',
            price: Number(product.price) || 0,
            image: product.image || '',
            qty: 1
        });
        saveCart();
        renderCart();
        showToast('Product added to cart');
    }
    window.addToCart = addToCart;   // usable from products.html too

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    if (cartItemsEl) {
        cartItemsEl.addEventListener('click', e => {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            const row = btn.closest('.cart-item');
            const item = cart.find(i => i.id === row.dataset.id);
            if (!item) return;
            const act = btn.dataset.act;
            if (act === 'inc') item.qty += 1;
            if (act === 'dec') item.qty -= 1;
            if (act === 'remove' || item.qty < 1) cart = cart.filter(i => i !== item);
            saveCart();
            renderCart();
        });
    }

    // any button with class .add-cart + data attributes works (for product pages)
    document.addEventListener('click', e => {
        const btn = e.target.closest('.add-cart');
        if (!btn) return;
        addToCart({
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: btn.dataset.price,
            image: btn.dataset.image
        });
    });

    // order on WhatsApp (also used by Checkout)
    function orderOnWhatsApp() {
        if (!cart.length) {
            showToast('Your cart is empty', 'fa-solid fa-triangle-exclamation');
            return;
        }
        const lines = cart.map((i, n) => (n + 1) + '. ' + i.name + ' x ' + i.qty + ' = ' + money(i.qty * i.price));
        const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
        const msg = 'Hello Zintax Software, I want to order:\n\n' + lines.join('\n') + '\n\nTotal: ' + money(total);
        window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    }
    const whatsappOrder = $('#whatsappOrder');
    const checkoutBtn = $('#checkoutBtn');
    if (whatsappOrder) whatsappOrder.addEventListener('click', orderOnWhatsApp);
    if (checkoutBtn) checkoutBtn.addEventListener('click', orderOnWhatsApp);

    renderCart();

    /* ---------------- Escape key closes everything ---------------- */
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        setCategoryMenu(false);
        closeCartDrawer();
    });
})();