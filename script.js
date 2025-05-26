  // --- Cart logic (simple in-memory for demo) ---
const cartKey = 'ourodaterra.cart';

// Utility: load cart from localstorage or array
function loadCart() {
    const str = localStorage.getItem(cartKey);
    return str ? JSON.parse(str) : [];
}
function saveCart(arr) {
    localStorage.setItem(cartKey, JSON.stringify(arr));
}
function getCartCount() {
    return loadCart().reduce((acc, el) => acc + (el.qty || 1), 0);
}
function addToCart(product) {
    let cart = loadCart();
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx > -1) {
        cart[idx].qty = (cart[idx].qty || 1) + 1;
    } else {
        product.qty = 1;
        cart.push(product);
    }
    saveCart(cart);
}
function updateCartCount() {
    document.getElementById('cart-count').textContent = getCartCount();
}

// --- Product Catalog for cart redirects ---
const PRODUCTS = [
    { id: "1", name: "Cachaça Prata Clássica", img: "cachaça acerola.jpeg" },
    { id: "2", name: "Cachaça Ouro Envelhecida", img: "cachaça goiba.jpeg" },
    { id: "3", name: "Reserva Especial", img: "açai.jpeg" },
    { id: "4", name: "Prata com Especiarias", img: "mate.jpeg" },
    { id: "5", name: "Ouro Safra Limitada de baunilha", img: "baunilha.jpeg" },
    { id: "6", name: "Copo de Cachaça", img: "copos de time.jpeg" },
    { id: "7", name: "Chaveiro Ouro da Terra", img: "chaveiro.png" },
    { id: "8", name: "Camiseta Temática", img: "camisa.jpeg" },
];

// --- Cart Page Redirect (simple) ---
function openCartPage() {
    window.location = 'carrinho.html';
}
function openPlansPage() {
    window.location = 'assinaturas.html';
}

document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calculate position of target element
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20; // 20px extra space

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update active nav link
                document.querySelectorAll('header nav ul li a').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Intersection Observer for scroll animations
    const revealables = document.querySelectorAll('.product-card, .about-text p, .about-image, .contact p, .hero h2, .hero p, .cta-button, #cachacas h2, #sobre h2, #contato h2');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: unobserve after revealing to save resources
                // observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }); // Trigger when 10% visible or 50px from bottom

    revealables.forEach(el => {
        el.classList.add('revealable'); // Add base class for initial state
        revealObserver.observe(el);
    });

    // Active nav link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav ul li a');
    const headerHeight = document.querySelector('header').offsetHeight;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50; // Adjusted for header and some leeway
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });

        // If at the top of the page, 'Início' should be active
        if (pageYOffset < sections[0].offsetTop - headerHeight - 50) {
             navLinks.forEach(link => link.classList.remove('active'));
             document.querySelector('header nav ul li a[href="#inicio"]').classList.add('active');
        }
    });
    // Trigger scroll once to set initial active link
    window.dispatchEvent(new Event('scroll'));

    // Add event listeners for adding to cart
    document.querySelectorAll('.product-card').forEach(card => {
        // "Comprar" button
        card.querySelector('.buy-btn').addEventListener('click', function () {
            const id = card.getAttribute('data-id');
            const prod = PRODUCTS.find(p => p.id === id);
            if (prod) addToCart(prod);
            updateCartCount();
            openCartPage();
        });
        // Add-to-cart (cestinha) button
        card.querySelector('.add-cart-btn').addEventListener('click', function (e) {
            e.preventDefault();
            const id = card.getAttribute('data-id');
            const prod = PRODUCTS.find(p => p.id === id);
            if (prod) addToCart(prod);
            updateCartCount();
            // Can show feedback here (toast, badge animation etc)
        });
    });

    // Header cart icon
    document.getElementById('cart-btn').addEventListener('click', function () {
        openCartPage();
    });

    // Premium subscription button
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function () {
            openPlansPage();
        });
    }

    // Search bar: demo
    document.querySelector('.search-bar').addEventListener('submit', function (e) {
        e.preventDefault();
        const val = this.querySelector('input[type="search"]').value.trim().toLowerCase();
        if (!val) return;
        // Try to focus product matching search
        let found = false;
        document.querySelectorAll('.product-card h3').forEach(h3 => {
            if (h3.textContent.toLowerCase().includes(val)) {
                h3.closest('.product-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
                h3.closest('.product-card').classList.add('highlight');
                found = true;
            }
        });
        setTimeout(() => {
            document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        }, 1200);
        // Optionally: show no result message if not found
    });

    // SCROLL: Auto-highlight nav links by section in view (category)
    function updateCategoryActive() {
        // Which section is in viewport?
        let scrollY = window.pageYOffset;
        let pos = 0;
        let cats = [
            { id: "bebidas", el: document.getElementById("bebidas") },
            { id: "personalizados", el: document.getElementById("personalizados") },
            { id: "assinatura", el: document.getElementById("assinatura") }
        ];
        for (let i = 0; i < cats.length; ++i) {
            let s = cats[i].el;
            let rect = s.getBoundingClientRect();
            let top = rect.top + window.scrollY - 120;
            if (scrollY >= top) pos = i;
        }
        // Update horizontal and mobile menu
        document.querySelectorAll('.category-bar a, .category-menu-mobile a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === '#' + cats[pos].id) a.classList.add('active');
        });
    }
    window.addEventListener('scroll', updateCategoryActive);
    updateCategoryActive();

    // Category menu (hamburguer button)
    let menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let catMenu = document.getElementById('category-menu-mobile');
            if (catMenu.style.display === 'block') {
                catMenu.style.display = 'none';
            } else {
                catMenu.style.display = 'block';
            }
        });
        // Close open menu when clicking elsewhere
        window.addEventListener('click', function() {
            let catMenu = document.getElementById('category-menu-mobile');
            if (catMenu) catMenu.style.display = 'none';
        });
        // Prevent closing when clicking inside menu
        document.getElementById('category-menu-mobile').addEventListener('click', e => e.stopPropagation());
    }

    // Initial count
    updateCartCount();
});

// Optional: smooth highlight animation when adding to cart or search
const style = document.createElement('style');
style.innerHTML = `
.product-card.highlight { box-shadow: 0 0 0 4px #FFD25E,0 4px 14px #daa52042; transition: box-shadow .16s;}
`;
document.head.appendChild(style);

// --- SCROLL TO anchors fixes for offset header
window.addEventListener("hashchange", function () {
    const y = window.pageYOffset;
    setTimeout(() => {
        window.scrollTo({ top: y - 15, behavior: "auto" });
    }, 10);
});