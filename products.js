/* =========================================================
   ZINTAX STORE - PRODUCTS PAGE JAVASCRIPT
   =========================================================
   FEATURES:
   - 6 Products Per Page
   - Category Filter
   - Search
   - Sort
   - Pagination
   - Product Image Slider
   - Wishlist
   - Cart
   - Product Lightbox
   - Image Zoom
   - Thumbnails
   - Mobile Category Sidebar
   - Reset Products
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       GLOBAL VARIABLES
    ========================================================= */

    const PRODUCTS_PER_PAGE = 6;

    let allProducts = Array.from(
        document.querySelectorAll(".product-card")
    );

    let filteredProducts = [...allProducts];

    let currentPage = 1;

    let currentCategory = "all";

    let currentSearch = "";

    let currentSort = "featured";

    let currentLightboxProduct = null;

    let currentLightboxImages = [];

    let currentLightboxImageIndex = 0;


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const productGrid = document.getElementById("productGrid");

    const productSearch = document.getElementById("productSearch");

    const sortProducts = document.getElementById("sortProducts");

    const productHeading = document.getElementById("productHeading");

    const productStart = document.getElementById("productStart");

    const productEnd = document.getElementById("productEnd");

    const pagination = document.getElementById("pagination");

    const prevPage = document.getElementById("prevPage");

    const nextPage = document.getElementById("nextPage");

    const noProducts = document.getElementById("noProducts");

    const resetProducts = document.getElementById("resetProducts");

    const categoryButtons = document.querySelectorAll(".category-btn");

    const categoryOpen = document.getElementById("categoryOpen");

    const categoryClose = document.getElementById("categoryClose");

    const categorySidebar = document.getElementById("categorySidebar");

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");

    const mobileMenu = document.getElementById("mobileMenu");

    const categoryToggle = document.getElementById("categoryToggle");

    const productLightbox = document.getElementById("productLightbox");

    const lightboxClose = document.getElementById("lightboxClose");

    const lightboxPrev = document.getElementById("lightboxPrev");

    const lightboxNext = document.getElementById("lightboxNext");

    const lightboxMainImage = document.getElementById("lightboxMainImage");

    const lightboxTitle = document.getElementById("lightboxTitle");

    const lightboxCategory = document.getElementById("lightboxCategory");

    const lightboxRating = document.getElementById("lightboxRating");

    const lightboxRatingNumber = document.getElementById("lightboxRatingNumber");

    const lightboxReviews = document.getElementById("lightboxReviews");

    const lightboxPrice = document.getElementById("lightboxPrice");

    const lightboxOldPrice = document.getElementById("lightboxOldPrice");

    const lightboxDescription = document.getElementById("lightboxDescription");

    const lightboxThumbnails = document.getElementById("lightboxThumbnails");

    const lightboxCounter = document.getElementById("lightboxCounter");

    const zoomImage = document.getElementById("zoomImage");

    const wishlistCount = document.getElementById("wishlistCount");

    const cartCount = document.getElementById("cartCount");


    /* =========================================================
       LOCAL STORAGE
    ========================================================= */

    const WISHLIST_KEY = "zintax_wishlist";

    const CART_KEY = "zintax_cart";


    function getWishlist() {

        try {

            const data = localStorage.getItem(WISHLIST_KEY);

            return data ? JSON.parse(data) : [];

        } catch (error) {

            console.error("Wishlist error:", error);

            return [];

        }

    }


    function saveWishlist(wishlist) {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }


    function getCart() {

        try {

            const data = localStorage.getItem(CART_KEY);

            return data ? JSON.parse(data) : [];

        } catch (error) {

            console.error("Cart error:", error);

            return [];

        }

    }


    function saveCart(cart) {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    }


    /* =========================================================
       PRODUCT DATA
    ========================================================= */

    function getProductId(card) {

        if (card.dataset.id) {
            return card.dataset.id;
        }

        const title = card.querySelector("h3");

        if (title) {

            return title.textContent
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

        }

        return "product-" + allProducts.indexOf(card);

    }


    function getProductTitle(card) {

        const title = card.querySelector("h3");

        return title
            ? title.textContent.trim()
            : "Product";

    }


    function getProductCategory(card) {

        const category = card.querySelector(".category");

        return category
            ? category.textContent.trim()
            : "";

    }


    function getProductPrice(card) {

        return parseFloat(card.dataset.price) || 0;

    }


    function getProductImages(card) {

        return Array.from(
            card.querySelectorAll(".product-image")
        )
        .map(img => img.getAttribute("src"))
        .filter(src => src && src.trim() !== "");

    }


    function getProductRating(card) {

        const ratingNumber = card.querySelector(
            ".rating-number"
        );

        if (ratingNumber) {
            return ratingNumber.textContent.trim();
        }

        const rating = card.querySelector(".rating");

        if (rating) {

            const text = rating.textContent.trim();

            const match = text.match(
                /(\d+(?:\.\d+)?)/
            );

            return match
                ? match[1]
                : "0";

        }

        return "0";

    }


    function getProductReviews(card) {

        const rating = card.querySelector(".rating");

        if (!rating) {
            return "0";
        }

        const text = rating.textContent;

        const match = text.match(
            /\(?\s*(\d+)\s*\)?$/
        );

        if (match) {
            return match[1];
        }

        return "0";

    }


    function getProductDescription(card) {

        if (card.dataset.description) {
            return card.dataset.description;
        }

        const description = card.querySelector(
            ".product-description"
        );

        if (description) {
            return description.textContent.trim();
        }

        const title = getProductTitle(card);

        return `High quality ${title} available at Zintax Store. Contact us for product details and availability.`;

    }


    /* =========================================================
       FORMAT PRICE
    ========================================================= */

    function formatPrice(price) {

        return "Rs. " + Number(price).toLocaleString("en-PK");

    }


    /* =========================================================
       INITIALIZE PRODUCT IDS
    ========================================================= */

    allProducts.forEach((card, index) => {

        if (!card.dataset.id) {

            card.dataset.id =
                "zintax-product-" + (index + 1);

        }

    });


    /* =========================================================
       CATEGORY NAME
    ========================================================= */

    function getCategoryName(category) {

        const names = {

            all: "All Products",

            pos: "POS Machines",

            printer: "Printers",

            scanner: "Barcode Scanners",

            "cash-drawer": "Cash Drawers",

            "barcode-printer": "Barcode Printers",

            scale: "Weighing Scales",

            accessories: "Accessories"

        };

        return names[category] || "Products";

    }


    /* =========================================================
       FILTER PRODUCTS
    ========================================================= */
function filterProducts() {

    currentSearch = productSearch
        ? productSearch.value.trim().toLowerCase()
        : "";

    filteredProducts = allProducts.filter(card => {

        const category = (card.dataset.category || "")
            .trim()
            .toLowerCase();

        const title = getProductTitle(card)
            .toLowerCase();

        const categoryText = getProductCategory(card)
            .toLowerCase();

        const matchesCategory =
            currentCategory === "all" ||
            category === currentCategory.toLowerCase();

        const matchesSearch =
            !currentSearch ||
            title.includes(currentSearch) ||
            categoryText.includes(currentSearch) ||
            category.includes(currentSearch);

        return matchesCategory && matchesSearch;
    });

    // SORT
    if (currentSort === "low") {

        filteredProducts.sort((a, b) =>
            getProductPrice(a) - getProductPrice(b)
        );

    } else if (currentSort === "high") {

        filteredProducts.sort((a, b) =>
            getProductPrice(b) - getProductPrice(a)
        );

    } else {

        filteredProducts.sort((a, b) =>
            allProducts.indexOf(a) -
            allProducts.indexOf(b)
        );
    }

    currentPage = 1;
    renderProducts();

        /* =====================================================
           SORT
        ===================================================== */

        if (currentSort === "low") {

            filteredProducts.sort(
                (a, b) =>
                    getProductPrice(a) -
                    getProductPrice(b)
            );

        }

        else if (currentSort === "high") {

            filteredProducts.sort(
                (a, b) =>
                    getProductPrice(b) -
                    getProductPrice(a)
            );

        }

        else {

            /* Featured = original HTML order */

            filteredProducts.sort(
                (a, b) =>
                    allProducts.indexOf(a) -
                    allProducts.indexOf(b)
            );

        }


        currentPage = 1;

        renderProducts();

    }


    /* =========================================================
       RENDER PRODUCTS
    ========================================================= */

    function renderProducts() {

        if (!productGrid) {
            return;
        }


        /* Hide all products first */

        allProducts.forEach(card => {

            card.style.display = "none";

        });


        const totalProducts =
            filteredProducts.length;


        /* No products */

        if (totalProducts === 0) {

            if (noProducts) {
                noProducts.style.display = "block";
            }

            productGrid.style.display = "none";

            updateProductCounter(0, 0);

            updatePagination();

            return;

        }


        /* Products available */

        if (noProducts) {
            noProducts.style.display = "none";
        }

        productGrid.style.display = "grid";


        const totalPages =
            Math.ceil(
                totalProducts /
                PRODUCTS_PER_PAGE
            );


        if (currentPage > totalPages) {
            currentPage = totalPages;
        }


        const startIndex =
            (currentPage - 1) *
            PRODUCTS_PER_PAGE;


        const endIndex =
            startIndex +
            PRODUCTS_PER_PAGE;


        const productsToShow =
            filteredProducts.slice(
                startIndex,
                endIndex
            );


        productsToShow.forEach(card => {

            card.style.display = "";

        });


        updateProductCounter(
            startIndex + 1,
            Math.min(
                endIndex,
                totalProducts
            )
        );


        updatePagination();

        updateHeading();

    }


    /* =========================================================
       PRODUCT COUNTER
    ========================================================= */

    function updateProductCounter(start, end) {

        if (productStart) {
            productStart.textContent = start;
        }

        if (productEnd) {
            productEnd.textContent = end;
        }

    }


    /* =========================================================
       HEADING
    ========================================================= */

    function updateHeading() {

        if (!productHeading) {
            return;
        }


        if (currentSearch) {

            productHeading.textContent =
                `Search Results for "${currentSearch}"`;

            return;

        }


        productHeading.textContent =
            getCategoryName(currentCategory);

    }


    /* =========================================================
       PAGINATION
    ========================================================= */

    function updatePagination() {

        if (!pagination) {
            return;
        }


        const totalPages =
            Math.ceil(
                filteredProducts.length /
                PRODUCTS_PER_PAGE
            );


        const pageNumbers =
            pagination.querySelector(
                ".page-numbers"
            );


        if (pageNumbers) {

            pageNumbers.innerHTML = "";


            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "page-btn page-number";

                button.dataset.page = page;

                button.textContent = page;


                if (page === currentPage) {

                    button.classList.add("active");

                }


                button.addEventListener(
                    "click",
                    function () {

                        currentPage = page;

                        renderProducts();

                        scrollToProducts();

                    }
                );


                pageNumbers.appendChild(button);

            }

        }


        /* Previous */

        if (prevPage) {

            prevPage.disabled =
                currentPage <= 1 ||
                totalPages === 0;

        }


        /* Next */

        if (nextPage) {

            nextPage.disabled =
                currentPage >= totalPages ||
                totalPages === 0;

        }

    }


    /* =========================================================
       PAGINATION BUTTONS
    ========================================================= */

    if (prevPage) {

        prevPage.addEventListener(
            "click",
            function () {

                if (currentPage > 1) {

                    currentPage--;

                    renderProducts();

                    scrollToProducts();

                }

            }
        );

    }


    if (nextPage) {

        nextPage.addEventListener(
            "click",
            function () {

                const totalPages =
                    Math.ceil(
                        filteredProducts.length /
                        PRODUCTS_PER_PAGE
                    );


                if (currentPage < totalPages) {

                    currentPage++;

                    renderProducts();

                    scrollToProducts();

                }

            }
        );

    }


    /* =========================================================
       SCROLL TO PRODUCTS
    ========================================================= */

    function scrollToProducts() {

        const section =
            document.querySelector(
                ".products-section"
            );

        if (!section) {
            return;
        }


        const headerOffset = 100;

        const position =
            section.getBoundingClientRect().top +
            window.pageYOffset -
            headerOffset;


        window.scrollTo({

            top: position,

            behavior: "smooth"

        });

    }


    /* =========================================================
       CATEGORY FILTER
    ========================================================= */

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                categoryButtons.forEach(btn => {

                    btn.classList.remove("active");

                });


                this.classList.add("active");


                currentCategory =
                    this.dataset.category ||
                    "all";


                currentPage = 1;

                filterProducts();


                /* Close mobile sidebar */

                if (
                    window.innerWidth <= 768 &&
                    categorySidebar
                ) {

                    categorySidebar.classList.remove(
                        "open"
                    );

                    document.body.classList.remove(
                        "sidebar-open"
                    );

                }

            }
        );

    });


    /* =========================================================
       SEARCH
    ========================================================= */

    if (productSearch) {

        productSearch.addEventListener(
            "input",
            function () {

                filterProducts();

            }
        );

    }


    /* =========================================================
       SORT
    ========================================================= */

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            function () {

                currentSort =
                    this.value || "featured";

                currentPage = 1;

                filterProducts();

            }
        );

    }


    /* =========================================================
       RESET PRODUCTS
    ========================================================= */

    if (resetProducts) {

        resetProducts.addEventListener(
            "click",
            function () {

                currentCategory = "all";

                currentSearch = "";

                currentSort = "featured";

                currentPage = 1;


                if (productSearch) {
                    productSearch.value = "";
                }


                if (sortProducts) {
                    sortProducts.value = "featured";
                }


                categoryButtons.forEach(button => {

                    button.classList.remove(
                        "active"
                    );


                    if (
                        button.dataset.category ===
                        "all"
                    ) {

                        button.classList.add(
                            "active"
                        );

                    }

                });


                filterProducts();

            }
        );

    }


    /* =========================================================
       IMAGE SLIDER
    ========================================================= */

    function setupProductImageSlider(card) {

        const images =
            Array.from(
                card.querySelectorAll(
                    ".product-image"
                )
            );


        const dots =
            Array.from(
                card.querySelectorAll(".dot")
            );


        const prevButton =
            card.querySelector(
                ".image-arrow.prev"
            );


        const nextButton =
            card.querySelector(
                ".image-arrow.next"
            );


        if (images.length === 0) {
            return;
        }


        let currentImage = 0;


        /* Find existing active image */

        const activeIndex =
            images.findIndex(
                image =>
                    image.classList.contains(
                        "active"
                    )
            );


        if (activeIndex >= 0) {

            currentImage = activeIndex;

        }


        function showImage(index) {

            if (index < 0) {

                index =
                    images.length - 1;

            }


            if (index >= images.length) {

                index = 0;

            }


            currentImage = index;


            images.forEach(
                (image, imageIndex) => {

                    image.classList.toggle(
                        "active",
                        imageIndex ===
                        currentImage
                    );

                }
            );


            dots.forEach(
                (dot, dotIndex) => {

                    dot.classList.toggle(
                        "active",
                        dotIndex ===
                        currentImage
                    );

                }
            );

        }


        if (prevButton) {

            prevButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    showImage(
                        currentImage - 1
                    );

                }
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    showImage(
                        currentImage + 1
                    );

                }
            );

        }


        dots.forEach(
            (dot, dotIndex) => {

                if (
                    dotIndex >= images.length
                ) {

                    dot.style.display = "none";

                    return;

                }


                dot.style.display = "";


                dot.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();

                        showImage(dotIndex);

                    }
                );

            }
        );


        /* Hide arrows when only one image */

        if (images.length <= 1) {

            if (prevButton) {
                prevButton.style.display = "none";
            }

            if (nextButton) {
                nextButton.style.display = "none";
            }

        }


        showImage(currentImage);

    }


    /* Initialize sliders */

    allProducts.forEach(card => {

        setupProductImageSlider(card);

    });

viewport.style.width = "100%";
viewport.style.minWidth = "0";
viewport.style.overflow = "hidden";
viewport.style.flex = "1 1 0%";
    /* =========================================================
       OPEN LIGHTBOX
    ========================================================= */

    function openLightbox(card) {

        if (!productLightbox) {
            return;
        }


        currentLightboxProduct = card;


        currentLightboxImages =
            getProductImages(card);


        currentLightboxImageIndex = 0;


        /* Product information */

        const title =
            getProductTitle(card);

        const category =
            getProductCategory(card);

        const rating =
            getProductRating(card);

        const reviews =
            getProductReviews(card);

        const price =
            getProductPrice(card);


        if (lightboxTitle) {
            lightboxTitle.textContent = title;
        }


        if (lightboxCategory) {
            lightboxCategory.textContent = category;
        }


        if (lightboxRatingNumber) {
            lightboxRatingNumber.textContent =
                rating;
        }


        if (lightboxReviews) {
            lightboxReviews.textContent =
                `(${reviews} reviews)`;
        }


        if (lightboxPrice) {
            lightboxPrice.textContent =
                formatPrice(price);
        }


        /* Old price */

        const oldPriceElement =
            card.querySelector(".old-price");


        if (lightboxOldPrice) {

            if (oldPriceElement) {

                lightboxOldPrice.textContent =
                    oldPriceElement.textContent.trim();

                lightboxOldPrice.style.display =
                    "inline";

            }

            else if (card.dataset.oldPrice) {

                lightboxOldPrice.textContent =
                    formatPrice(
                        Number(card.dataset.oldPrice)
                    );

                lightboxOldPrice.style.display =
                    "inline";

            }

            else {

                lightboxOldPrice.textContent = "";

                lightboxOldPrice.style.display =
                    "none";

            }

        }


        /* Description */

        if (lightboxDescription) {

            lightboxDescription.textContent =
                getProductDescription(card);

        }


        /* Rating stars */

        if (lightboxRating) {

            const numericRating =
                parseFloat(rating) || 0;

            const fullStars =
                Math.floor(numericRating);

            let stars = "";

            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                stars +=
                    i <= fullStars
                        ? "★"
                        : "☆";

            }

            lightboxRating.textContent =
                stars;

        }


        /* Render thumbnails */

        renderLightboxThumbnails();


        /* Show first image */

        updateLightboxImage();


        /* Open */

        productLightbox.classList.add("active");

        document.body.classList.add(
            "lightbox-open"
        );


        /* Prevent page scroll */

        document.body.style.overflow =
            "hidden";

    }


    /* =========================================================
       LIGHTBOX THUMBNAILS
    ========================================================= */

    function renderLightboxThumbnails() {

        if (!lightboxThumbnails) {
            return;
        }


        lightboxThumbnails.innerHTML = "";


        currentLightboxImages.forEach(
            (src, index) => {

                const thumbnail =
                    document.createElement("button");

                thumbnail.type = "button";

                thumbnail.className =
                    "lightbox-thumbnail";


                if (index === 0) {

                    thumbnail.classList.add(
                        "active"
                    );

                }


                const image =
                    document.createElement("img");

                image.src = src;

                image.alt =
                    `${getProductTitle(
                        currentLightboxProduct
                    )} ${index + 1}`;


                thumbnail.appendChild(image);


                thumbnail.addEventListener(
                    "click",
                    function () {

                        currentLightboxImageIndex =
                            index;

                        updateLightboxImage();

                    }
                );


                lightboxThumbnails.appendChild(
                    thumbnail
                );

            }
        );

    }


    /* =========================================================
       UPDATE LIGHTBOX IMAGE
    ========================================================= */

    function updateLightboxImage() {

        if (
            !lightboxMainImage ||
            currentLightboxImages.length === 0
        ) {

            return;

        }


        const imageSrc =
            currentLightboxImages[
                currentLightboxImageIndex
            ];


        lightboxMainImage.src =
            imageSrc;


        lightboxMainImage.alt =
            getProductTitle(
                currentLightboxProduct
            );


        /* Zoom image */

        if (zoomImage) {

            zoomImage.classList.remove(
                "zoomed"
            );

            zoomImage.style.transform =
                "scale(1)";

        }


        /* Counter */

        if (lightboxCounter) {

            lightboxCounter.textContent =
                `${currentLightboxImageIndex + 1} / ${currentLightboxImages.length}`;

        }


        /* Thumbnail active */

        if (lightboxThumbnails) {

            const thumbnails =
                lightboxThumbnails.querySelectorAll(
                    ".lightbox-thumbnail"
                );


            thumbnails.forEach(
                (thumbnail, index) => {

                    thumbnail.classList.toggle(
                        "active",
                        index ===
                        currentLightboxImageIndex
                    );

                }
            );

        }


        /* Show/hide arrows */

        if (lightboxPrev) {

            lightboxPrev.style.display =
                currentLightboxImages.length > 1
                    ? ""
                    : "none";

        }


        if (lightboxNext) {

            lightboxNext.style.display =
                currentLightboxImages.length > 1
                    ? ""
                    : "none";

        }

    }


    /* =========================================================
       LIGHTBOX NEXT
    ========================================================= */

    function nextLightboxImage() {

        if (
            currentLightboxImages.length <= 1
        ) {
            return;
        }


        currentLightboxImageIndex++;


        if (
            currentLightboxImageIndex >=
            currentLightboxImages.length
        ) {

            currentLightboxImageIndex = 0;

        }


        updateLightboxImage();

    }


    /* =========================================================
       LIGHTBOX PREVIOUS
    ========================================================= */

    function previousLightboxImage() {

        if (
            currentLightboxImages.length <= 1
        ) {
            return;
        }


        currentLightboxImageIndex--;


        if (
            currentLightboxImageIndex < 0
        ) {

            currentLightboxImageIndex =
                currentLightboxImages.length - 1;

        }


        updateLightboxImage();

    }


    /* =========================================================
       LIGHTBOX BUTTON EVENTS
    ========================================================= */

    if (lightboxNext) {

        lightboxNext.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                nextLightboxImage();

            }
        );

    }


    if (lightboxPrev) {

        lightboxPrev.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                previousLightboxImage();

            }
        );

    }


    /* =========================================================
       CLOSE LIGHTBOX
    ========================================================= */

    function closeLightbox() {

        if (!productLightbox) {
            return;
        }


        productLightbox.classList.remove(
            "active"
        );


        document.body.classList.remove(
            "lightbox-open"
        );


        document.body.style.overflow = "";


        currentLightboxProduct = null;

        currentLightboxImages = [];

        currentLightboxImageIndex = 0;

    }


    if (lightboxClose) {

        lightboxClose.addEventListener(
            "click",
            function () {

                closeLightbox();

            }
        );

    }


    /* Backdrop click */

    const lightboxBackdrop =
        document.querySelector(
            ".lightbox-backdrop"
        );


    if (lightboxBackdrop) {

        lightboxBackdrop.addEventListener(
            "click",
            function () {

                closeLightbox();

            }
        );

    }


    /* =========================================================
       PRODUCT IMAGE CLICK
    ========================================================= */

    allProducts.forEach(card => {

        const images =
            card.querySelectorAll(
                ".product-image"
            );


        images.forEach(image => {

            image.addEventListener(
                "click",
                function () {

                    openLightbox(card);

                }
            );

        });

    });


    /* =========================================================
       LIGHTBOX KEYBOARD CONTROLS
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                !productLightbox ||
                !productLightbox.classList.contains(
                    "active"
                )
            ) {

                return;

            }


            if (event.key === "Escape") {

                closeLightbox();

            }


            if (
                event.key === "ArrowRight"
            ) {

                nextLightboxImage();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                previousLightboxImage();

            }

        }
    );


    /* =========================================================
       IMAGE ZOOM
    ========================================================= */

    if (zoomImage) {

        zoomImage.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const isZoomed =
                    zoomImage.classList.contains(
                        "zoomed"
                    );


                if (isZoomed) {

                    zoomImage.classList.remove(
                        "zoomed"
                    );

                    zoomImage.style.transform =
                        "scale(1)";

                }

                else {

                    zoomImage.classList.add(
                        "zoomed"
                    );

                    zoomImage.style.transform =
                        "scale(1.8)";

                }

            }
        );

    }


    /* =========================================================
       WISHLIST
    ========================================================= */

    function updateWishlistCount() {

        if (!wishlistCount) {
            return;
        }


        const wishlist =
            getWishlist();


        wishlistCount.textContent =
            wishlist.length;

    }


    function updateWishlistButtons() {

        const wishlist =
            getWishlist();


        allProducts.forEach(card => {

            const button =
                card.querySelector(
                    ".wishlist-btn"
                );


            if (!button) {
                return;
            }


            const productId =
                getProductId(card);


            const exists =
                wishlist.some(
                    item =>
                        String(
                            item.id
                        ) === String(
                            productId
                        )
                );


            button.classList.toggle(
                "active",
                exists
            );


            const icon =
                button.querySelector("i");


            if (icon) {

                icon.className =
                    exists
                        ? "fa-solid fa-heart"
                        : "fa-regular fa-heart";

            }

        });

    }


    function toggleWishlist(card) {

        const productId =
            getProductId(card);


        let wishlist =
            getWishlist();


        const existingIndex =
            wishlist.findIndex(
                item =>
                    String(item.id) ===
                    String(productId)
            );


        if (existingIndex !== -1) {

            wishlist.splice(
                existingIndex,
                1
            );

            showNotification(
                "Removed from wishlist"
            );

        }

        else {

            wishlist.push({

                id: productId,

                title:
                    getProductTitle(card),

                category:
                    getProductCategory(card),

                price:
                    getProductPrice(card),

                image:
                    getProductImages(card)[0] || ""

            });


            showNotification(
                "Added to wishlist ❤️"
            );

        }


        saveWishlist(wishlist);

        updateWishlistCount();

        updateWishlistButtons();

    }


    allProducts.forEach(card => {

        const wishlistButton =
            card.querySelector(
                ".wishlist-btn"
            );


        if (wishlistButton) {

            wishlistButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleWishlist(card);

                }
            );

        }

    });


    /* =========================================================
       CART COUNT
    ========================================================= */

    function getCartItemCount() {

        const cart =
            getCart();


        let count = 0;


        cart.forEach(item => {

            const quantity =
                Number(item.quantity) || 1;

            count += quantity;

        });


        return count;

    }


    function updateCartCount() {

        if (!cartCount) {
            return;
        }


        cartCount.textContent =
            getCartItemCount();

    }


    /* =========================================================
       ADD TO CART
    ========================================================= */

    function addToCart(card) {

        const productId =
            getProductId(card);


        const title =
            getProductTitle(card);


        const category =
            getProductCategory(card);


        const price =
            getProductPrice(card);


        const images =
            getProductImages(card);


        const image =
            images.length
                ? images[0]
                : "";


        let cart =
            getCart();


        const existingIndex =
            cart.findIndex(
                item =>
                    String(item.id) ===
                    String(productId)
            );


        if (existingIndex !== -1) {

            cart[existingIndex].quantity =
                (
                    Number(
                        cart[existingIndex].quantity
                    ) || 1
                ) + 1;

        }

        else {

            cart.push({

                id: productId,

                title: title,

                name: title,

                category: category,

                price: price,

                image: image,

                quantity: 1

            });

        }


        saveCart(cart);

        updateCartCount();


        const button =
            card.querySelector(
                ".add-cart"
            );


        if (button) {

            const originalHTML =
                button.innerHTML;


            button.classList.add(
                "added"
            );


            button.innerHTML =
                '<i class="fa-solid fa-check"></i> Added to Cart';


            setTimeout(
                function () {

                    button.classList.remove(
                        "added"
                    );

                    button.innerHTML =
                        originalHTML;

                },
                1500
            );

        }


        showNotification(
            `${title} added to cart`
        );

    }


    /* =========================================================
       ADD CART BUTTON EVENTS
    ========================================================= */

    allProducts.forEach(card => {

        const addButton =
            card.querySelector(
                ".add-cart"
            );


        if (addButton) {

            addButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    addToCart(card);

                }
            );

        }

    });


    /* =========================================================
       NOTIFICATION
    ========================================================= */

    function showNotification(message) {

        let notification =
            document.getElementById(
                "zintaxNotification"
            );


        if (!notification) {

            notification =
                document.createElement(
                    "div"
                );


            notification.id =
                "zintaxNotification";


            notification.className =
                "zintax-notification";


            document.body.appendChild(
                notification
            );

        }


        notification.textContent =
            message;


        notification.classList.add(
            "show"
        );


        clearTimeout(
            notification.hideTimer
        );


        notification.hideTimer =
            setTimeout(
                function () {

                    notification.classList.remove(
                        "show"
                    );

                },
                2000
            );

    }


    /* =========================================================
       MOBILE CATEGORY SIDEBAR
    ========================================================= */

    if (categoryOpen) {

        categoryOpen.addEventListener(
            "click",
            function () {

                if (!categorySidebar) {
                    return;
                }


                categorySidebar.classList.add(
                    "open"
                );


                document.body.classList.add(
                    "sidebar-open"
                );

            }
        );

    }


    if (categoryClose) {

        categoryClose.addEventListener(
            "click",
            function () {

                closeCategorySidebar();

            }
        );

    }


    function closeCategorySidebar() {

        if (categorySidebar) {

            categorySidebar.classList.remove(
                "open"
            );

        }


        document.body.classList.remove(
            "sidebar-open"
        );

    }


    /* =========================================================
       CATEGORY TOGGLE
    ========================================================= */

    if (categoryToggle) {

        categoryToggle.addEventListener(
            "click",
            function () {

                if (!categorySidebar) {
                    return;
                }


                categorySidebar.classList.toggle(
                    "collapsed"
                );

            }
        );

    }


    /* =========================================================
       MOBILE MENU
    ========================================================= */

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener(
            "click",
            function () {

                mobileMenu.classList.toggle(
                    "open"
                );


                this.classList.toggle(
                    "active"
                );

            }
        );

    }


    /* =========================================================
       CLOSE MOBILE MENU WHEN LINK CLICKED
    ========================================================= */

    if (mobileMenu) {

        const mobileLinks =
            mobileMenu.querySelectorAll(
                "a"
            );


        mobileLinks.forEach(link => {

            link.addEventListener(
                "click",
                function () {

                    mobileMenu.classList.remove(
                        "open"
                    );


                    if (mobileMenuBtn) {

                        mobileMenuBtn.classList.remove(
                            "active"
                        );

                    }

                }
            );

        });

    }


    /* =========================================================
       CLOSE SIDEBAR ON RESIZE
    ========================================================= */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 768) {

                closeCategorySidebar();

            }

        }
    );


    /* =========================================================
       ESCAPE CLOSE SIDEBAR
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                categorySidebar &&
                categorySidebar.classList.contains(
                    "open"
                )
            ) {

                closeCategorySidebar();

            }

        }
    );


    /* =========================================================
       UPDATE CATEGORY COUNTS
    ========================================================= */

    function updateCategoryCounts() {

        categoryButtons.forEach(button => {

            const category =
                button.dataset.category;


            const countElement =
                button.querySelector(
                    ".category-count"
                );


            if (!countElement) {
                return;
            }


            if (category === "all") {

                countElement.textContent =
                    allProducts.length;

                return;

            }


            const count =
                allProducts.filter(
                    card =>
                        card.dataset.category ===
                        category
                ).length;


            countElement.textContent =
                count;

        });

    }


    /* =========================================================
       PRODUCT CARD ACCESSIBILITY
    ========================================================= */

    allProducts.forEach(card => {

        card.setAttribute(
            "tabindex",
            "0"
        );


        card.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    const clickedElement =
                        event.target.closest(
                            "button"
                        );


                    if (!clickedElement) {

                        event.preventDefault();

                        openLightbox(card);

                    }

                }

            }
        );

    });


    /* =========================================================
       LIGHTBOX TOUCH / SWIPE
    ========================================================= */

    let touchStartX = 0;

    let touchEndX = 0;


    if (productLightbox) {

        productLightbox.addEventListener(
            "touchstart",
            function (event) {

                if (
                    event.touches &&
                    event.touches.length
                ) {

                    touchStartX =
                        event.touches[0].clientX;

                }

            },
            { passive: true }
        );


        productLightbox.addEventListener(
            "touchend",
            function (event) {

                if (
                    event.changedTouches &&
                    event.changedTouches.length
                ) {

                    touchEndX =
                        event.changedTouches[0].clientX;

                }


                const difference =
                    touchStartX -
                    touchEndX;


                if (Math.abs(difference) < 50) {
                    return;
                }


                if (difference > 0) {

                    nextLightboxImage();

                }

                else {

                    previousLightboxImage();

                }

            },
            { passive: true }
        );

    }


    /* =========================================================
       INITIALIZE
    ========================================================= */

    updateWishlistCount();

    updateWishlistButtons();

    updateCartCount();

    updateCategoryCounts();

    renderProducts();


    /* =========================================================
       DEBUG INFORMATION
    ========================================================= */

    console.log(
        "Zintax Store Products Loaded"
    );

    console.log(
        "Total Products:",
        allProducts.length
    );

    console.log(
        "Products Per Page:",
        PRODUCTS_PER_PAGE
    );

});