// ══════════════════════════════════════
//  Sanaya Store — App Logic
//  Instagram: @_sanaya_jsr_
// ══════════════════════════════════════
const INSTAGRAM_URL = "https://www.instagram.com/_sanaya_jsr_/";

// ── Register Service Worker for Instant Load & Offline Access ──
if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// Category icons mapping
const CAT_ICONS = {
  "All":        "🛍️",
  "Tops":       "👚",
  "Jackets":    "🧥",
  "Dresses":    "👗",
  "Makeup":     "💄",
  "Gadgets":    "📱",
  "Shoes":      "👠",
  "Bags":       "👜",
  "Skincare":   "✨",
  "Jewelry":    "💍",
  "Fitness":    "🏋️",
};

// Set all Instagram links
document.querySelectorAll("#insta-link, #insta-about, #insta-footer, .hero-insta-link")
  .forEach(el => { if(el) el.href = INSTAGRAM_URL; });

// Elements
const grid      = document.getElementById("grid");
const bestGrid  = document.getElementById("best-grid");
const chipsBox  = document.getElementById("chips");
const search    = document.getElementById("search");
const empty     = document.getElementById("empty");

let products = [];
let category = "All";
let query    = "";

// ── Helpers ─────────────────────────────
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
function escapeAttr(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function safeUrl(url) {
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") ? u.href : "#";
  } catch { return "#"; }
}
function shopClass(shop) {
  const s = (shop || "").toLowerCase();
  if (s.includes("amazon"))   return "amazon";
  if (s.includes("flipkart")) return "flipkart";
  if (s.includes("meesho"))   return "meesho";
  return "default";
}
function randomStars() {
  const count = 4 + Math.floor(Math.random() * 2); // 4 or 5
  return "★".repeat(count) + "☆".repeat(5 - count);
}

// ── Card builder ─────────────────────────
function card(p) {
  const link = safeUrl(p.link);
  const sc   = shopClass(p.shop);
  const article = el("article", "card");

  // Photo
  const photo = el("a", "photo");
  photo.href   = link;
  photo.target = "_blank";
  photo.rel    = "sponsored noopener noreferrer";
  photo.setAttribute("aria-hidden", "true");
  photo.tabIndex = -1;
  if (p.image) {
    const img   = document.createElement("img");
    img.src     = p.image;
    img.alt     = p.name || "Sanaya Store Product";
    img.loading = "lazy";
    img.decoding = "async";
    img.width   = 400;
    img.height  = 400;
    img.onerror = () => img.remove();
    photo.appendChild(img);
  }
  const badge = el("span", `badge badge-${sc}`, p.shop);
  photo.appendChild(badge);

  // Body
  const body  = el("div", "card-body");
  const stars = el("div", "stars", randomStars());
  const title = el("h3", "", p.name);
  const price = el("div", "price", p.price);

  const buy   = el("a", `buy buy-${sc}`, "Buy on " + p.shop);
  buy.href    = link;
  buy.target  = "_blank";
  buy.rel     = "sponsored noopener noreferrer";
  buy.setAttribute("aria-label", `Buy ${p.name} on ${p.shop}`);

  if (p.desc) {
    const desc = el("div", "card-desc", p.desc);
    body.append(stars, title, desc, price, buy);
  } else {
    body.append(stars, title, price, buy);
  }
  article.append(photo, body);
  return article;
}

// ── Hero Offer Slider (5s Auto-Scroll & Touch/Click Controls) ──
let heroCurrentSlide = 0;
let heroSliderTimer = null;
const HERO_SLIDE_COUNT = 3;

function updateHeroSlider(index) {
  heroCurrentSlide = (index + HERO_SLIDE_COUNT) % HERO_SLIDE_COUNT;
  const track = document.getElementById("hero-slides-track");
  if (track) {
    track.style.transform = `translateX(-${heroCurrentSlide * 100}%)`;
  }
  const dots = document.querySelectorAll("#slider-dots .slider-dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === heroCurrentSlide);
  });
}

function moveHeroSlide(direction) {
  restartHeroSliderTimer();
  updateHeroSlider(heroCurrentSlide + direction);
}

function gotoHeroSlide(index) {
  restartHeroSliderTimer();
  updateHeroSlider(index);
}

function startHeroSliderTimer() {
  stopHeroSliderTimer();
  heroSliderTimer = setInterval(() => {
    updateHeroSlider(heroCurrentSlide + 1);
  }, 5000);
}

function stopHeroSliderTimer() {
  if (heroSliderTimer) {
    clearInterval(heroSliderTimer);
    heroSliderTimer = null;
  }
}

function restartHeroSliderTimer() {
  startHeroSliderTimer();
}

window.moveHeroSlide = moveHeroSlide;
window.gotoHeroSlide = gotoHeroSlide;

function initHeroSlider() {
  const slider = document.getElementById("hero-slider");
  if (!slider) return;

  // Pause on hover
  slider.addEventListener("mouseenter", stopHeroSliderTimer);
  slider.addEventListener("mouseleave", startHeroSliderTimer);

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopHeroSliderTimer();
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        moveHeroSlide(1);
      } else {
        moveHeroSlide(-1);
      }
    } else {
      startHeroSliderTimer();
    }
  }, { passive: true });

  startHeroSliderTimer();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroSlider);
} else {
  initHeroSlider();
}

// ── Drawer Functions ─────────────────────
function toggleDrawer() {
  const d = document.getElementById("drawer");
  const o = document.getElementById("drawer-overlay");
  if (d && o) {
    const isOpen = d.classList.toggle("active");
    o.classList.toggle("active", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
}
function closeDrawer() {
  const d = document.getElementById("drawer");
  const o = document.getElementById("drawer-overlay");
  if (d && o) {
    d.classList.remove("active");
    o.classList.remove("active");
    document.body.style.overflow = "";
  }
}
function drawerSelectCategory(cat) {
  closeDrawer();
  selectCategory(cat, true);
}
window.toggleDrawer = toggleDrawer;
window.closeDrawer = closeDrawer;
window.drawerSelectCategory = drawerSelectCategory;

// ── Search & Empty State ──────────────────
function handleSearchSubmit(e) {
  if (e) e.preventDefault();
  query = (search ? search.value : "").trim();
  const clearBtn = document.getElementById("clear-search-btn");
  if (clearBtn) clearBtn.style.display = query ? "block" : "none";
  render();
  const picksSection = document.getElementById("picks");
  if (picksSection) {
    picksSection.scrollIntoView({ behavior: "smooth" });
  }
}
function clearSearch() {
  if (search) search.value = "";
  query = "";
  const clearBtn = document.getElementById("clear-search-btn");
  if (clearBtn) clearBtn.style.display = "none";
  render();
}
function trackEmptyRequest(item) {
  if (item && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(`Hi Sanaya! Mujhe "${item}" chahiye tha, kya aap iska best link share kar sakti hain?`).catch(() => {});
  }
}
window.handleSearchSubmit = handleSearchSubmit;
window.clearSearch = clearSearch;
window.trackEmptyRequest = trackEmptyRequest;

// ── Category Selection & Smooth Scroll ───
function selectCategory(c, shouldScroll = true) {
  category = c;
  renderChips();
  render();
  if (shouldScroll) {
    const picksSection = document.getElementById("picks");
    if (picksSection) {
      picksSection.scrollIntoView({ behavior: "smooth" });
    }
  }
}
window.selectCategory = selectCategory;

// ── Render ───────────────────────────────
function render() {
  const q    = query.trim().toLowerCase();
  const list = products.filter(p => {
    const inCat  = category === "All" || p.category === category;
    const inText = !q || (p.name + " " + p.category + " " + (p.desc || "") + " " + p.shop).toLowerCase().includes(q);
    return inCat && inText;
  });

  if (list.length > 0) {
    grid.replaceChildren(...list.map(card));
    empty.hidden = true;
  } else {
    if (q) {
      const emptyCard = document.createElement("div");
      emptyCard.className = "search-empty-card";
      emptyCard.innerHTML = `
        <div class="sec-icon">🔍</div>
        <h3>"${escapeHtml(query.trim())}" abhi available nahi hai</h3>
        <p>Aapne jo dhoonda wo abhi Sanaya Store par list nahi hai.</p>
        <p class="sec-promise">Lekin fikar mat kijiye — hum ise jald se jald Sanaya Store par laane ki poori koshish karenge! 💖</p>
        <div class="search-empty-actions">
          <a href="https://ig.me/m/_sanaya_jsr_" target="_blank" rel="noopener noreferrer" class="btn-primary search-empty-btn" onclick="trackEmptyRequest('${escapeAttr(query.trim())}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>
            Request "${escapeHtml(query.trim())}" on Instagram DM 💌
          </a>
          <button type="button" class="btn-outline search-reset-btn" onclick="clearSearch()">Saare Products Dekhein →</button>
        </div>
      `;
      grid.replaceChildren(emptyCard);
      empty.hidden = true;
    } else {
      grid.replaceChildren();
      empty.textContent = "Is category me abhi koi product nahi hai. Jald hi naye picks add honge!";
      empty.hidden = false;
    }
  }

  // Update Section Title & Reset button dynamically
  const titleEl = document.getElementById("picks-title");
  if (titleEl) {
    if (query.trim()) {
      titleEl.textContent = list.length ? `Search: "${query.trim()}" (${list.length} found)` : `Search: "${query.trim()}"`;
    } else {
      titleEl.textContent = category === "All" ? "All Picks" : `${category} (${list.length} picks)`;
    }
  }
  const resetBtn = document.getElementById("reset-filter-btn");
  if (resetBtn) {
    resetBtn.style.display = (category !== "All" || query.trim()) ? "inline-flex" : "none";
  }
}

function renderBest() {
  // Show first 4 products as "best sellers" (or tag them in JSON)
  const best = products.filter(p => p.best || false).slice(0, 8);
  const show = best.length ? best : products.slice(0, 4);
  bestGrid.replaceChildren(...show.map(card));
}

// ── Category Chips ───────────────────────
function renderChips() {
  const catCounts = {};
  products.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });
  const allCountEl = document.getElementById("drawer-count-all");
  if (allCountEl) allCountEl.textContent = `${products.length} picks`;
  const cats = ["All", ...new Set(products.map(p => p.category))];
  chipsBox.replaceChildren(
    ...cats.map(c => {
      const btn  = el("button", "chip");
      btn.type   = "button";
      btn.setAttribute("aria-pressed", String(c === category));
      const icon  = el("span", "cat-icon", CAT_ICONS[c] || "🏷️");
      const label = el("span", "", c);
      const count = el("span", "cat-count",
        c === "All" ? `${products.length} picks` : `${catCounts[c] || 0} picks`
      );
      btn.append(icon, label, count);
      btn.addEventListener("click", () => {
        selectCategory(c, true);
      });
      return btn;
    })
  );
}

// ── Events ───────────────────────────────
if (search) {
  search.addEventListener("input", () => {
    query = search.value.trim();
    const clearBtn = document.getElementById("clear-search-btn");
    if (clearBtn) clearBtn.style.display = query ? "block" : "none";
    render();
    if (query.length >= 2) {
      const picksSection = document.getElementById("picks");
      if (picksSection) {
        picksSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
}

function handleProductRequest(e) {
  e.preventDefault();
  const input = document.getElementById("req-product-input");
  const val = input ? input.value.trim() : "";
  const btn = e.target.querySelector("button");

  if (btn) {
    btn.innerHTML = `<span>Opening DM... 💌</span>`;
    setTimeout(() => {
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>
        <span>Request on Instagram DM</span>
      `;
    }, 2500);
  }

  // If user entered a query, copy formatted message so they can simply paste in DM
  if (val && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(`Hi Sanaya! Can you please share the best link for: "${val}"?`).catch(() => {});
  }

  // Direct Instagram DM link
  const dmUrl = "https://ig.me/m/_sanaya_jsr_";
  window.open(dmUrl, "_blank", "noopener,noreferrer");
}
window.handleProductRequest = handleProductRequest;

// ── Modals: Terms & Trust ────────────────
const modalOverlay = document.getElementById("modal-overlay");
const modalBody    = document.getElementById("modal-body");

function openTermsModal() {
  if (!modalOverlay || !modalBody) return;
  modalBody.innerHTML = `
    <h2>Terms & Conditions</h2>
    <span class="modal-tagline">Sanaya Store • Transparent & Trustworthy Guidelines</span>
    <div class="modal-content-text">
      <h4>1. Personal Curation & Best Recommendations</h4>
      <p>Sanaya Store par recommend kiye gaye sabhi products Sanaya ke personal research, styling knowledge aur real testing ke mutabiq chune gaye hain. Humara focus customer ko sirf genuine aur value-for-money products recommend karna hai.</p>
      
      <h4>2. Verified Shopping Platforms & Direct Orders</h4>
      <p>Jab aap kisi product ke "Buy" button par tap karte hain, toh aap direct respective official platform (Amazon, Flipkart, ya Meesho) par safe redirect hote hain. Aapka order, payment transaction, dispatch aur invoice seedha usi certified store ke dwara process hota hai.</p>
      
      <h4>3. Official Returns & Buyer Protection</h4>
      <p>Aapko unhi shopping platforms ki 100% official return, refund aur replacement policies ka full benefit milta hai. Agar product pasand na aaye ya size issue ho, toh platform ki standard easy return policy applicable rehti hai.</p>
      
      <h4>4. Prices & Live Offers</h4>
      <p>Products ke prices, discounts aur stock availability respective platforms dwara live update hoti rehti hain. Sanaya Store hamesha best available deals aapke saamne rakhne ki koshish karta hai.</p>
    </div>
  `;
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function openTrustModal() {
  if (!modalOverlay || !modalBody) return;
  modalBody.innerHTML = `
    <h2>Customer Trust & Buyer Protection 🛡️</h2>
    <span class="modal-tagline">Aapka Vishwas — Sanaya Ka Commitment</span>
    <div class="modal-content-text">
      <h4>Kyun Sanaya Store Aapke Liye Best Hai?</h4>
      <p>Online shopping me sabse badi problem hoti hai: <em>"Photo me kuch aur dikh raha hai, real me kaisa aayega?"</em> ya ghanton search karne ke baad bhi doubt rehta hai.</p>
      
      <h4>1. Thoroughly Researched & Tested</h4>
      <p>Maine khud hazaron options me se deep research, fabric quality, fitting aur durability check karke wahi products shortlist kiye hain jo maine khud try ya verify kiye hain.</p>
      
      <h4>2. Zero Risk & Zero Compromise</h4>
      <p>Aapka paisa aur time dono safe rahein, isliye cheap quality ya misleading products yahan bilkul list nahi hote.</p>
      
      <h4>3. 100% Secure Official Checkouts</h4>
      <p>Aap direct official platforms (Amazon, Flipkart, Meesho) se buy karte hain jahan Cash on Delivery, UPI, Cards aur easy 7-day returns fully supported hain.</p>
    </div>
  `;
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(e) {
  if (e && e.target !== modalOverlay && !e.target.classList.contains("modal-close")) return;
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Close on Escape key (Modals and Drawer)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modalOverlay && modalOverlay.classList.contains("active")) {
      closeModal();
    }
    const d = document.getElementById("drawer");
    if (d && d.classList.contains("active")) {
      closeDrawer();
    }
  }
});

// ── Load products (Instant local cache restore + Background sync) ──
try {
  const cachedProducts = localStorage.getItem("sanaya_products_cache");
  if (cachedProducts) {
    const parsed = JSON.parse(cachedProducts);
    if (Array.isArray(parsed) && parsed.length > 0) {
      products = parsed;
      renderChips();
      render();
      renderBest();
    }
  }
} catch (e) {}

fetch("products.json")
  .then(r => r.json())
  .then(data => {
    products = data;
    try {
      localStorage.setItem("sanaya_products_cache", JSON.stringify(data));
    } catch (e) {}
    renderChips();
    render();
    renderBest();
  })
  .catch(() => {
    if (!products || products.length === 0) {
      empty.textContent = "Could not load products. Please refresh.";
      empty.hidden = false;
    }
  });
