// ══════════════════════════════════════
//  Sanaya Store — App Logic
//  Instagram: @_sanaya_jsr_
// ══════════════════════════════════════
const INSTAGRAM_URL = "https://www.instagram.com/_sanaya_jsr_/";

// Category icons mapping
const CAT_ICONS = {
  "All":     "🛍️",
  "Dresses": "👗",
  "Makeup":  "💄",
  "Gadgets": "📱",
  "Shoes":   "👠",
  "Bags":    "👜",
  "Skincare":"✨",
  "Jewelry": "💍",
  "Fitness": "🏋️",
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
    img.alt     = "";
    img.loading = "lazy";
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

  body.append(stars, title, price, buy);
  article.append(photo, body);
  return article;
}

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
    const inText = !q || (p.name + " " + p.category + " " + p.shop).toLowerCase().includes(q);
    return inCat && inText;
  });
  grid.replaceChildren(...list.map(card));
  empty.hidden = list.length > 0;

  // Update Section Title & Reset button dynamically
  const titleEl = document.getElementById("picks-title");
  if (titleEl) {
    titleEl.textContent = category === "All" ? "All Picks" : `${category} (${list.length} picks)`;
  }
  const resetBtn = document.getElementById("reset-filter-btn");
  if (resetBtn) {
    resetBtn.style.display = category === "All" ? "none" : "inline-flex";
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
search.addEventListener("input", () => {
  query = search.value;
  render();
});

function handleNL(e) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const btn   = e.target.querySelector("button");
  btn.textContent = "Subscribed! 🎉";
  btn.style.background = "#22c55e";
  input.value = "";
  setTimeout(() => {
    btn.textContent = "Subscribe";
    btn.style.background = "";
  }, 3000);
}

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

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});

// ── Load products ────────────────────────
fetch("products.json")
  .then(r => r.json())
  .then(data => {
    products = data;
    renderChips();
    render();
    renderBest();
  })
  .catch(() => {
    empty.textContent = "Could not load products. Please refresh.";
    empty.hidden = false;
  });
