/* =========================================================
   PROFESSIONAL SHARED CART SYSTEM
   Works across multiple HTML pages
========================================================= */

(function () {
    "use strict";

    const CART_KEY = "zintax_cart";

    let cart = [];

    /* =========================================================
       LOAD CART
    ========================================================= */

    function loadCart() {
        try {
            const saved = localStorage.getItem(CART_KEY);
            cart = saved ? JSON.parse(saved) : [];

            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (error) {
            console.error("Cart loading error:", error);
            cart = [];
        }
    }

    /* =========================================================
       SAVE CART
    ========================================================= */

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartUI();
    }

    /* =========================================================
       FORMAT PRICE
    ========================================================= */

    function formatPrice(price) {
        return "Rs. " + Number(price || 0).toLocaleString("en-PK");
    }

    /* =========================================================
       GET PRODUCT DATA
    ========================================================= */

    function getProductData(button) {

        const card = button.closest(".product-card");

        if (!card) {
            return null;
        }

        const titleElement = card.querySelector("h3");

        const imageElement = card.querySelector(
            ".product-image.active, .product-image"
        );

        const priceElement = card.querySelector(".price strong");

        const categoryElement = card.querySelector(".category");

        const title = titleElement
            ? titleElement.textContent.trim()
            : "Product";

        let price = parseFloat(card.dataset.price || "0");

        if (!price && priceElement) {
            price = parseFloat(
                priceElement.textContent.replace(/[^\d.]/g, "")
            ) || 0;
        }

        const image = imageElement
            ? imageElement.getAttribute("src")
            : "";

        const category = categoryElement
            ? categoryElement.textContent.trim()
            : "";

        /*
           Create stable product ID
        */
        const id = [
            title,
            price,
            image
        ]
            .join("-")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        return {
            id: id,
            name: title,
            price: price,
            image: image,
            category: category,
            quantity: 1
        };
    }

    /* =========================================================
       ADD TO CART
    ========================================================= */

    function addToCart(product) {

        if (!product) {
            return;
        }

        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push(product);
        }

        saveCart();

        showCartMessage(
            product.name + " added to cart"
        );

        openCartDrawer();
    }

    /* =========================================================
       REMOVE FROM CART
    ========================================================= */

    function removeFromCart(id) {

        cart = cart.filter(item => item.id !== id);

        saveCart();
    }

    /* =========================================================
       CHANGE QUANTITY
    ========================================================= */

    function changeQuantity(id, amount) {

        const item = cart.find(product => product.id === id);

        if (!item) {
            return;
        }

        item.quantity += amount;

        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }

        saveCart();
    }

    /* =========================================================
       CART TOTAL
    ========================================================= */

    function getSubtotal() {

        return cart.reduce(
            (total, item) =>
                total + Number(item.price) * Number(item.quantity),
            0
        );
    }

    function getCartCount() {

        return cart.reduce(
            (total, item) =>
                total + Number(item.quantity),
            0
        );
    }

    /* =========================================================
       SHIPPING
    ========================================================= */

    function getShipping() {

        const subtotal = getSubtotal();

        if (subtotal <= 0) {
            return 0;
        }

        /*
           Free shipping above Rs. 10,000
           Change this value if required.
        */

        if (subtotal >= 10000) {
            return 0;
        }

        return 250;
    }

    /* =========================================================
       GRAND TOTAL
    ========================================================= */

    function getGrandTotal() {

        return getSubtotal() + getShipping();
    }

    /* =========================================================
       UPDATE CART COUNT
    ========================================================= */

    function updateCartCount() {

        const count = getCartCount();

        const counters = document.querySelectorAll(
            ".cart-count, #cartCount, #cart-count"
        );

        counters.forEach(counter => {
            counter.textContent = count;
            counter.style.display = count > 0 ? "flex" : "none";
        });
    }

    /* =========================================================
       RENDER CART
    ========================================================= */

    function renderCart() {

        const container = document.querySelector(
            "#cartItems, .cart-items"
        );

        if (!container) {
            updateCartCount();
            return;
        }

        if (cart.length === 0) {

            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <h3>Your Cart is Empty</h3>
                    <p>Add products to your cart to continue.</p>
                </div>
            `;

        } else {

            container.innerHTML = cart.map(item => {

                const total =
                    Number(item.price) * Number(item.quantity);

                return `
                    <div class="cart-item">

                        <div class="cart-item-image">
                            <img
                                src="${escapeHTML(item.image)}"
                                alt="${escapeHTML(item.name)}"
                                onerror="this.style.display='none'">
                        </div>

                        <div class="cart-item-info">

                            <h4>
                                ${escapeHTML(item.name)}
                            </h4>

                            ${
                                item.category
                                    ? `<small>${escapeHTML(item.category)}</small>`
                                    : ""
                            }

                            <div class="cart-item-price">
                                ${formatPrice(item.price)}
                            </div>

                            <div class="quantity-control">

                                <button
                                    type="button"
                                    onclick="changeCartQuantity('${item.id}', -1)">
                                    −
                                </button>

                                <span>
                                    ${item.quantity}
                                </span>

                                <button
                                    type="button"
                                    onclick="changeCartQuantity('${item.id}', 1)">
                                    +
                                </button>

                            </div>

                        </div>

                        <div class="cart-item-right">

                            <strong>
                                ${formatPrice(total)}
                            </strong>

                            <button
                                type="button"
                                class="remove-cart-item"
                                onclick="removeCartItem('${item.id}')"
                                aria-label="Remove product">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </div>
                `;

            }).join("");
        }

        updateCartSummary();
        updateCartCount();
    }

    /* =========================================================
       CART SUMMARY
    ========================================================= */

    function updateCartSummary() {

        const subtotal = getSubtotal();
        const shipping = getShipping();
        const total = subtotal + shipping;

        const subtotalElements = document.querySelectorAll(
            "#cartSubtotal, .cart-subtotal"
        );

        subtotalElements.forEach(element => {
            element.textContent = formatPrice(subtotal);
        });

        const shippingElements = document.querySelectorAll(
            "#cartShipping, .cart-shipping"
        );

        shippingElements.forEach(element => {

            element.textContent =
                shipping === 0
                    ? "FREE"
                    : formatPrice(shipping);

        });

        const totalElements = document.querySelectorAll(
            "#cartTotal, .cart-total"
        );

        totalElements.forEach(element => {
            element.textContent = formatPrice(total);
        });
    }

    /* =========================================================
       UPDATE ALL CART UI
    ========================================================= */

    function updateCartUI() {

        renderCart();
        updateCartCount();
    }

    /* =========================================================
       OPEN CART
    ========================================================= */

    function openCartDrawer() {

        const drawer =
            document.querySelector("#cartDrawer") ||
            document.querySelector(".cart-drawer");

        if (!drawer) {
            return;
        }

        drawer.classList.add("active");
        document.body.classList.add("cart-open");
    }

    /* =========================================================
       CLOSE CART
    ========================================================= */

    function closeCartDrawer() {

        const drawer =
            document.querySelector("#cartDrawer") ||
            document.querySelector(".cart-drawer");

        if (!drawer) {
            return;
        }

        drawer.classList.remove("active");
        document.body.classList.remove("cart-open");
    }

    /* =========================================================
       CHECKOUT PAGE
    ========================================================= */

    function goToCheckout() {

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;
        }

        window.location.href = "checkout.html";
    }

    /* =========================================================
       GENERATE ORDER NUMBER
    ========================================================= */

    function generateOrderNumber() {

        const date = new Date();

        const year = date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        const day =
            String(date.getDate()).padStart(2, "0");

        const random =
            Math.floor(1000 + Math.random() * 9000);

        return `ZS-${year}${month}${day}-${random}`;
    }

    /* =========================================================
       SAVE CUSTOMER ORDER
    ========================================================= */

    function saveOrder(customer) {

        const order = {

            orderNumber: generateOrderNumber(),

            date: new Date().toISOString(),

            customer: customer,

            items: cart.map(item => ({
                ...item
            })),

            subtotal: getSubtotal(),

            shipping: getShipping(),

            total: getGrandTotal()

        };

        localStorage.setItem(
            "zintax_last_order",
            JSON.stringify(order)
        );

        return order;
    }

    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =========================================================
       CART MESSAGE
    ========================================================= */

    function showCartMessage(message) {

        let toast = document.querySelector(
            "#cartToast"
        );

        if (!toast) {

            toast = document.createElement("div");

            toast.id = "cartToast";

            toast.className = "cart-toast";

            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>${escapeHTML(message)}</span>
        `;

        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    /* =========================================================
       GLOBAL FUNCTIONS
    ========================================================= */

    window.changeCartQuantity = function (id, amount) {
        changeQuantity(id, amount);
    };

    window.removeCartItem = function (id) {
        removeFromCart(id);
    };

    window.openCart = function () {
        openCartDrawer();
    };

    window.closeCart = function () {
        closeCartDrawer();
    };

    window.goToCheckout = function () {
        goToCheckout();
    };

    window.getSharedCart = function () {
        return cart;
    };

    window.getCartSubtotal = function () {
        return getSubtotal();
    };

    window.getCartShipping = function () {
        return getShipping();
    };

    window.getCartGrandTotal = function () {
        return getGrandTotal();
    };

    /* =========================================================
       ADD CART BUTTON EVENTS
    ========================================================= */

    function setupAddToCart() {

        document.addEventListener("click", function (event) {

            const button =
                event.target.closest(".add-cart");

            if (!button) {
                return;
            }

            event.preventDefault();

            const product = getProductData(button);

            addToCart(product);

        });
    }

    /* =========================================================
       CART BUTTON EVENTS
    ========================================================= */

    function setupCartButtons() {

        document.addEventListener("click", function (event) {

            if (
                event.target.closest(
                    "#cartButton, .cart-button, .cart-icon"
                )
            ) {
                openCartDrawer();
            }

            if (
                event.target.closest(
                    "#closeCart, .close-cart"
                )
            ) {
                closeCartDrawer();
            }

            if (
                event.target.closest(
                    "#checkoutButton, .checkout-button"
                )
            ) {
                goToCheckout();
            }

        });
    }

    /* =========================================================
       STORAGE SYNC
       Keeps BOTH HTML pages synchronized
    ========================================================= */

    window.addEventListener("storage", function (event) {

        if (event.key === CART_KEY) {

            loadCart();
            updateCartUI();

        }

    });

    /* =========================================================
       INIT
    ========================================================= */

    document.addEventListener("DOMContentLoaded", function () {

        loadCart();

        setupAddToCart();

        setupCartButtons();

        updateCartUI();

    });

})();