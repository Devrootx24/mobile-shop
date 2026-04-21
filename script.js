/* ============================================================
   BHAI BHAI MOBILE STORE — script.js
   Features: Products, Cart, Search, Filter, localStorage, Toast
============================================================ */

// ===== PRODUCT DATA =====
const products = [
  // Smartphones
  { id: 1, name: "Samsung Galaxy S24 Ultra", category: "smartphones", emoji: "📱", price: 124999, oldPrice: 139999, rating: 4.9, reviews: 328, badge: "Hot Deal" },
  { id: 2, name: "iPhone 15 Pro Max", category: "smartphones", emoji: "📲", price: 159900, oldPrice: 174900, rating: 4.8, reviews: 512, badge: "Best Seller" },
  { id: 3, name: "OnePlus 12 5G", category: "smartphones", emoji: "📱", price: 64999, oldPrice: 74999, rating: 4.7, reviews: 204, badge: null },
  { id: 4, name: "Redmi Note 13 Pro+", category: "smartphones", emoji: "📲", price: 29999, oldPrice: 34999, rating: 4.5, reviews: 780, badge: "Budget Pick" },
  { id: 5, name: "Google Pixel 8 Pro", category: "smartphones", emoji: "📱", price: 99999, oldPrice: 109999, rating: 4.7, reviews: 167, badge: null },
  { id: 6, name: "Vivo X100 Pro", category: "smartphones", emoji: "📲", price: 89999, oldPrice: 99999, rating: 4.6, reviews: 134, badge: "New", badgeType: "new" },

  // Accessories
  { id: 7, name: "boAt Rockerz 450 Pro", category: "accessories", emoji: "🎧", price: 1699, oldPrice: 2999, rating: 4.3, reviews: 2400, badge: "43% Off" },
  { id: 8, name: "Anker 65W GaN Charger", category: "accessories", emoji: "🔌", price: 2499, oldPrice: 3499, rating: 4.6, reviews: 893, badge: null },
  { id: 9, name: "Spigen Tempered Glass (Universal)", category: "accessories", emoji: "🛡️", price: 499, oldPrice: 799, rating: 4.4, reviews: 1230, badge: null },
  { id: 10, name: "Baseus Power Bank 20000mAh", category: "accessories", emoji: "🔋", price: 2999, oldPrice: 3999, rating: 4.7, reviews: 654, badge: "Popular" },

  // Smartwatches
  { id: 11, name: "Apple Watch Series 9", category: "smartwatches", emoji: "⌚", price: 41900, oldPrice: 45900, rating: 4.8, reviews: 320, badge: "New", badgeType: "new" },
  { id: 12, name: "Samsung Galaxy Watch 6", category: "smartwatches", emoji: "🕐", price: 26999, oldPrice: 31999, rating: 4.6, reviews: 198, badge: null },
  { id: 13, name: "boAt Wave Sigma Smart Watch", category: "smartwatches", emoji: "⌚", price: 1999, oldPrice: 3999, rating: 4.2, reviews: 1560, badge: "Budget" },

  // Tablets
  { id: 14, name: "iPad Air 5th Gen", category: "tablets", emoji: "📟", price: 59900, oldPrice: 64900, rating: 4.8, reviews: 276, badge: "Hot Deal" },
  { id: 15, name: "Samsung Galaxy Tab S9", category: "tablets", emoji: "📔", price: 72999, oldPrice: 82999, rating: 4.7, reviews: 189, badge: null },
  { id: 16, name: "Redmi Pad SE", category: "tablets", emoji: "📗", price: 14999, oldPrice: 17999, rating: 4.4, reviews: 430, badge: "New", badgeType: "new" },
];

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem("bbCart")) || [];
let activeFilter = "all";
let searchQuery = "";
let sortOrder = "default";

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
  initNavbar();
  initSearch();
  initFilterTabs();
  initSortSelect();
  initContactForm();
  initCartEvents();
  animateOnScroll();
});

// ===== RENDER PRODUCTS =====
function renderProducts() {
  let filtered = products.filter(p => {
    const matchCat = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Sort
  if (sortOrder === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortOrder === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sortOrder === "rating") filtered.sort((a, b) => b.rating - a.rating);

  const grid = document.getElementById("productsGrid");
  const noResults = document.getElementById("noResults");

  if (filtered.length === 0) {
    grid.innerHTML = "";
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.07}s">
      ${p.badge ? `<div class="product-badge ${p.badgeType || ''}">${p.badge}</div>` : ""}
      <div class="product-img-wrap">
        <div class="product-img">${p.emoji}</div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${getStars(p.rating)}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">₹${p.price.toLocaleString("en-IN")}</span>
          <span class="product-price-old">₹${p.oldPrice.toLocaleString("en-IN")}</span>
        </div>
        <div class="product-actions">
          <button class="btn-add-cart" onclick="addToCart(${p.id})">
            <i class="fas fa-shopping-cart"></i> Add
          </button>
          <button class="btn-buy-now" onclick="buyNow(${p.id})">
            <i class="fas fa-bolt"></i> Buy Now
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// ===== STARS =====
function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// ===== CART FUNCTIONS =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`<i class="fas fa-check-circle"></i> ${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartItems();
}

function buyNow(productId) {
  addToCart(productId);
  openCart();
}

function saveCart() {
  localStorage.setItem("bbCart", JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cartCount").textContent = totalItems;
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");
  const empty = document.getElementById("cartEmpty");

  if (cart.length === 0) {
    container.style.display = "none";
    footer.style.display = "none";
    empty.classList.add("show");
    return;
  }

  container.style.display = "flex";
  footer.style.display = "flex";
  empty.classList.remove("show");

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString("en-IN")}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById("cartTotal").textContent = `₹${total.toLocaleString("en-IN")}`;
}

// ===== CART OPEN / CLOSE =====
function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function initCartEvents() {
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) return;
    showToast('<i class="fas fa-check-circle"></i> Order placed! We\'ll contact you soon.');
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
  });
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
    highlightNavLink();
  });

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  // Close menu on link click
  navLinks.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });
}

function highlightNavLink() {
  const sections = ["home", "shop", "categories", "about", "contact"];
  let current = "home";
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) current = id;
  });
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === `#${current}`);
  });
}

// ===== SEARCH =====
function initSearch() {
  const toggle = document.getElementById("searchToggle");
  const wrap = document.getElementById("searchBarWrap");
  const input = document.getElementById("searchInput");
  const close = document.getElementById("searchClose");

  toggle.addEventListener("click", () => {
    wrap.classList.toggle("open");
    if (wrap.classList.contains("open")) {
      setTimeout(() => input.focus(), 200);
    }
  });
  close.addEventListener("click", () => {
    wrap.classList.remove("open");
    input.value = "";
    searchQuery = "";
    renderProducts();
  });
  input.addEventListener("input", () => {
    searchQuery = input.value.trim();
    renderProducts();
    // Scroll to shop section if searching
    if (searchQuery.length > 0) {
      document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

// ===== FILTER TABS =====
function initFilterTabs() {
  document.getElementById("filterTabs").querySelectorAll(".filter-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.cat;
      renderProducts();
    });
  });
}

// ===== CATEGORY CLICK (from categories section) =====
function filterCategory(cat) {
  activeFilter = cat;
  document.querySelectorAll(".filter-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  renderProducts();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}

// ===== SORT =====
function initSortSelect() {
  document.getElementById("sortSelect").addEventListener("change", e => {
    sortOrder = e.target.value;
    renderProducts();
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  document.getElementById("contactForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("cName").value.trim();
    const email = document.getElementById("cEmail").value.trim();
    const msg = document.getElementById("cMsg").value.trim();

    let valid = true;
    // Reset
    ["nameErr","emailErr","msgErr"].forEach(id => document.getElementById(id).textContent = "");
    document.querySelectorAll(".form-group").forEach(g => g.classList.remove("error"));

    if (!name || name.length < 2) {
      document.getElementById("nameErr").textContent = "Please enter your name (min 2 chars).";
      document.getElementById("cName").closest(".form-group").classList.add("error");
      valid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      document.getElementById("emailErr").textContent = "Please enter a valid email address.";
      document.getElementById("cEmail").closest(".form-group").classList.add("error");
      valid = false;
    }
    if (!msg || msg.length < 10) {
      document.getElementById("msgErr").textContent = "Message must be at least 10 characters.";
      document.getElementById("cMsg").closest(".form-group").classList.add("error");
      valid = false;
    }

    if (valid) {
      showToast('<i class="fas fa-check-circle"></i> Message sent! We\'ll reply soon.');
      document.getElementById("contactForm").reset();
    }
  });
}

// ===== TOAST =====
let toastTimeout;
function showToast(html) {
  const toast = document.getElementById("toast");
  toast.innerHTML = html;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ===== INTERSECTION OBSERVER ANIMATIONS =====
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".cat-card, .info-card, .about-content, .section-header").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}