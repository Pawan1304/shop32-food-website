let cart = JSON.parse(localStorage.getItem("foodShopCart") || "[]");
let activeCategory = "All";

const money = n => `${SHOP_CONFIG.currency}${n}`;
const save = () => localStorage.setItem("foodShopCart", JSON.stringify(cart));

/* Basic shop links/text */
document.querySelectorAll("[data-shop-name]").forEach(el => el.textContent = SHOP_CONFIG.shopName);
document.querySelectorAll("[data-address]").forEach(el => el.textContent = SHOP_CONFIG.address);
document.querySelectorAll("[data-hours]").forEach(el => el.textContent = SHOP_CONFIG.hours);
document.querySelectorAll("[data-owner]").forEach(el => el.textContent = SHOP_CONFIG.owner);
document.querySelectorAll("[data-phone-link]").forEach((el, i) => el.href = `tel:+${SHOP_CONFIG.phone[i] || SHOP_CONFIG.phone[0]}`);
document.querySelectorAll("[data-map-link]").forEach(el => el.href = SHOP_CONFIG.mapsUrl);
document.querySelectorAll("[data-whatsapp-link]").forEach(el => el.href = `https://wa.me/${SHOP_CONFIG.whatsapp}`);
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* =====================================================
   GENERIC SWIPE CAROUSEL
   ===================================================== */
function setupSwipeCarousel(id) {
  const root = document.getElementById(id);
  if (!root) return;
  const track = root.querySelector(".swipe-track");
  const dots = root.querySelector(".swipe-dots");
  if (!track) return;

  const slides = [...track.children];
  if (!slides.length) return;

  if (dots) {
    dots.innerHTML = slides.map((_, i) =>
      `<button class="swipe-dot ${i === 0 ? "active" : ""}" type="button" aria-label="Go to photo ${i + 1}"></button>`
    ).join("");
    [...dots.children].forEach((dot, i) => {
      dot.addEventListener("click", () => {
        slides[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    });
  }

  const updateDots = () => {
    if (!dots) return;
    const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === index));
  };

  track.addEventListener("scroll", updateDots, { passive: true });

  root.querySelectorAll(`[data-carousel-prev="${id}"]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const current = Math.round(track.scrollLeft / track.clientWidth);
      const next = Math.max(0, current - 1);
      slides[next].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  });

  root.querySelectorAll(`[data-carousel-next="${id}"]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const current = Math.round(track.scrollLeft / track.clientWidth);
      const next = Math.min(slides.length - 1, current + 1);
      slides[next].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  });
}

function renderMediaCollection(trackId, dotsId, items, allowVideo = false) {
  const track = document.getElementById(trackId);
  if (!track) return;

  track.innerHTML = items.map(item => {
    const media = typeof item === "string" ? { type: "image", src: item, alt: "Sudh Vaishno Tandoor food" } : item;
    if (allowVideo && media.type === "video") {
      return `<div class="swipe-slide"><video src="${media.src}" autoplay muted loop playsinline preload="metadata" aria-label="${media.alt || "Food video"}"></video></div>`;
    }
    return `<div class="swipe-slide"><img src="${media.src}" alt="${media.alt || "Sudh Vaishno Tandoor food"}" loading="lazy"></div>`;
  }).join("");

  const root = track.closest(".swipe-carousel");
  if (!root) return;
  setupSwipeCarousel(root.id);
}

/* Phone showcase */
renderMediaCollection("phoneMediaTrack", "phoneMediaDots", SHOP_CONFIG.experienceMedia || [], true);

/* About gallery */
renderMediaCollection("aboutTrack", "aboutDots", SHOP_CONFIG.aboutImages || []);

/* Food & Moments gallery */
renderMediaCollection("galleryTrack", "galleryDots", SHOP_CONFIG.galleryImages || []);

/* Langar gallery */
renderMediaCollection("langarTrack", "langarDots", SHOP_CONFIG.langarImages || []);

/* =====================================================
   MENU WITH MULTI-PHOTO SWIPE CARDS
   ===================================================== */
const categories = ["All", ...new Set(SHOP_CONFIG.menu.map(x => x.category))];
const tabs = document.getElementById("categoryTabs");
if (tabs) {
  tabs.innerHTML = categories.map(c => `<button class="${c === "All" ? "active" : ""}" data-category="${c}">${c}</button>`).join("");
  tabs.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    tabs.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    renderMenu();
  });
}

function renderMenu() {
  const items = activeCategory === "All" ? SHOP_CONFIG.menu : SHOP_CONFIG.menu.filter(x => x.category === activeCategory);
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  grid.innerHTML = items.map(item => {
    const images = item.images?.length ? item.images : [item.image];
    const slides = images.map((src, i) => `
      <div class="swipe-slide">
        <img class="menu-img" src="${src}" alt="${item.name} photo ${i + 1}" loading="lazy">
      </div>
    `).join("");

    return `
      <article class="menu-card">
        <div class="menu-carousel swipe-carousel" id="menuCarousel-${item.id}">
          <div class="swipe-track">${slides}</div>
          ${images.length > 1 ? `
            <button class="swipe-arrow prev" type="button" data-carousel-prev="menuCarousel-${item.id}" aria-label="Previous ${item.name} photo">‹</button>
            <button class="swipe-arrow next" type="button" data-carousel-next="menuCarousel-${item.id}" aria-label="Next ${item.name} photo">›</button>
            <div class="swipe-dots"></div>
          ` : ""}
        </div>
        <div class="menu-body">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="menu-bottom">
            <span class="price">${money(item.price)}</span>
            <button class="add-btn" data-add="${item.id}">+ Add</button>
          </div>
        </div>
      </article>`;
  }).join("");

  items.forEach(item => {
    if ((item.images || []).length > 1) setupSwipeCarousel(`menuCarousel-${item.id}`);
  });
}

const menuGrid = document.getElementById("menuGrid");
if (menuGrid) {
  menuGrid.addEventListener("click", e => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = Number(btn.dataset.add);
    const existing = cart.find(x => x.id === id);
    if (existing) existing.qty++; else cart.push({ id, qty: 1 });
    save();
    updateCart();
    btn.textContent = "✓ Added";
    setTimeout(() => btn.textContent = "+ Add", 800);
  });
}

/* =====================================================
   CART
   ===================================================== */
const overlay = document.getElementById("cartOverlay");
function openCart() {
  overlay?.classList.add("open");
  overlay?.setAttribute("aria-hidden", "false");
  renderCart();
}
function closeCart() {
  overlay?.classList.remove("open");
  overlay?.setAttribute("aria-hidden", "true");
}

document.getElementById("openCart")?.addEventListener("click", openCart);
document.getElementById("mobileCart")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
overlay?.addEventListener("click", e => { if (e.target === overlay) closeCart(); });
document.getElementById("browseMenu")?.addEventListener("click", closeCart);

function updateCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("mobileCartCount").textContent = count;
  renderCart();
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const panel = document.querySelector(".cart-panel");
  if (!wrap || !panel) return;
  if (!cart.length) {
    panel.classList.add("no-items");
    wrap.innerHTML = "";
    document.getElementById("cartTotal").textContent = "0";
    return;
  }
  panel.classList.remove("no-items");
  let total = 0;
  wrap.innerHTML = cart.map(row => {
    const item = SHOP_CONFIG.menu.find(x => x.id === row.id);
    if (!item) return "";
    total += item.price * row.qty;
    return `<div class="cart-row">
      <div><strong>${item.name}</strong><small>${money(item.price)} each</small></div>
      <div class="qty"><button data-minus="${item.id}">−</button><strong>${row.qty}</strong><button data-plus="${item.id}">+</button></div>
      <strong>${money(item.price * row.qty)}</strong>
    </div>`;
  }).join("");
  document.getElementById("cartTotal").textContent = total;
}

document.getElementById("cartItems")?.addEventListener("click", e => {
  const plus = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  if (!plus && !minus) return;
  const id = Number((plus || minus).dataset[plus ? "plus" : "minus"]);
  const row = cart.find(x => x.id === id);
  if (!row) return;
  if (plus) row.qty++; else row.qty--;
  cart = cart.filter(x => x.qty > 0);
  save();
  updateCart();
});

/* WhatsApp checkout — uses the dedicated single WhatsApp number */
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  if (!cart.length) return;
  let total = 0;
  const lines = cart.map(row => {
    const item = SHOP_CONFIG.menu.find(x => x.id === row.id);
    if (!item) return "";
    total += item.price * row.qty;
    return `${row.qty} × ${item.name} - ${money(item.price * row.qty)}`;
  }).filter(Boolean);

  const message = `Hello ${SHOP_CONFIG.shopName}!\n\nI'd like to order:\n\n${lines.join("\n")}\n\nTotal: ${money(total)}\n\nPlease confirm my order.`;
  const whatsappNumber = String(SHOP_CONFIG.whatsapp).replace(/\D/g, "");
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank", "noopener");
});

/* =====================================================
   SHOW FLOATING CART ONLY WHEN MENU IS IN VIEW
   ===================================================== */
const menuSection = document.getElementById("menu");
if (menuSection && "IntersectionObserver" in window) {
  const menuObserver = new IntersectionObserver(entries => {
    document.body.classList.toggle("menu-visible", entries[0].isIntersecting);
  }, { threshold: 0.08 });
  menuObserver.observe(menuSection);
}

renderMenu();
updateCart();


/* =====================================================
   PAGE HEADER / MOBILE NAV / SCROLL UX
   Moved out of index.html so HTML stays clean.
   ===================================================== */

/* =====================================================
       MODERN HEADER BEHAVIOUR
       ===================================================== */

    (function () {
      const header = document.getElementById("siteHeader");
      const navLinks = document.querySelectorAll("[data-nav-link]");
      const mobileButton = document.getElementById("mobileMenuButton");
      const mobileDropdown = document.getElementById("mobileDropdown");

      function updateHeader() {
        header.classList.toggle("scrolled", window.scrollY > 30);
      }

      window.addEventListener("scroll", updateHeader, { passive: true });
      updateHeader();

      const sections = [...document.querySelectorAll("main section[id]")];

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      }, {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      });

      sections.forEach((section) => observer.observe(section));

      if (mobileButton && mobileDropdown) {
        mobileButton.addEventListener("click", () => {
          const open = mobileDropdown.classList.toggle("open");
          mobileButton.setAttribute("aria-expanded", String(open));
        });

        mobileDropdown.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            mobileDropdown.classList.remove("open");
            mobileButton.setAttribute("aria-expanded", "false");
          });
        });

        document.addEventListener("click", (event) => {
          if (!mobileDropdown.contains(event.target) &&
              !mobileButton.contains(event.target)) {
            mobileDropdown.classList.remove("open");
            mobileButton.setAttribute("aria-expanded", "false");
          }
        });
      }
    })();

    /* =====================================================
       PHOTO GESTURE UX
       Keep images swipeable without trapping vertical scrolling.
       IMPORTANT: no preventDefault() is used here, so normal page
       scrolling always remains available when the finger starts on a photo.
       ===================================================== */
    (function () {
      document.querySelectorAll('.swipe-track img').forEach(img => {
        img.addEventListener('dragstart', event => event.preventDefault());
      });
    })();

    /* =====================================================
       MOBILE HERO SCROLL PROMPT
       Visible on the first screen, hidden after scrolling.
       ===================================================== */
    (function () {
      const scrollPrompt = document.querySelector('.scroll-down');
      if (!scrollPrompt) return;

      function updateScrollPrompt() {
        scrollPrompt.classList.toggle('scroll-hidden', window.scrollY > 90);
      }

      window.addEventListener('scroll', updateScrollPrompt, { passive: true });
      updateScrollPrompt();
    })();


/* =====================================================
   SUPABASE LIVE PHOTO SYSTEM
   Safe to keep here: if Supabase is not configured, it exits.
   ===================================================== */

/* =========================================================
   SUDH VAISHNO TANDOOR - LIVE PHOTO SYSTEM

   Public website side:
   - Daily Menu: latest "menu" photo
   - Langar: latest 6 "langar" photos
   - Gallery: latest 12 "gallery" photos

   Daily uploads are handled from admin.html.
   ========================================================= */

(function () {
  if (!window.supabase || typeof supabaseClient === "undefined") return;

  const esc = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  async function getPhotos(category, limit) {
    const { data, error } = await supabaseClient
      .from("site_photos")
      .select("id,title,category,public_url,created_at")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Photo system:", error.message);
      return [];
    }

    return data || [];
  }

  function renderDailyMenu(photo) {
    const box = document.getElementById("dailyMenuPhotoBox");
    if (!box || !photo) return;

    box.innerHTML = `
      <div class="daily-menu-photo-card">
        <div class="daily-menu-photo-heading">
          <span>🍽️ TODAY'S MENU</span>
          <small>Freshly updated</small>
        </div>
        <img src="${esc(photo.public_url)}" alt="${esc(photo.title || "Today's menu")}" loading="lazy">
      </div>
    `;
  }

  function renderLangar(photos) {
    const main = document.getElementById("langarMainPhoto");
    const grid = document.getElementById("langarPhotoGrid");
    if (!main || !grid || !photos.length) return;

    main.src = photos[0].public_url;
    main.alt = photos[0].title || "Langar Seva photo";

    grid.innerHTML = photos.slice(0, 6).map((photo, index) => `
      <button class="langar-thumb ${index === 0 ? "active" : ""}" type="button" data-langar-url="${esc(photo.public_url)}" data-langar-title="${esc(photo.title || "Langar Seva photo")}">
        <img src="${esc(photo.public_url)}" alt="${esc(photo.title || "Langar Seva photo")}" loading="lazy">
      </button>
    `).join("");

    grid.querySelectorAll(".langar-thumb").forEach(btn => {
      btn.addEventListener("click", () => {
        main.src = btn.dataset.langarUrl;
        main.alt = btn.dataset.langarTitle;
        grid.querySelectorAll(".langar-thumb").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  function renderGallery(photos) {
    const grid = document.getElementById("livePhotoGrid");
    if (!grid || !photos.length) return;

    grid.innerHTML = photos.map(photo => `
      <figure class="live-photo-card">
        <img src="${esc(photo.public_url)}" alt="${esc(photo.title || "Sudh Vaishno Tandoor photo")}" loading="lazy">
        <figcaption>${esc(photo.title || "Sudh Vaishno Tandoor")}</figcaption>
      </figure>
    `).join("");
  }

  async function loadLivePhotos() {
    const [menu, langar, gallery] = await Promise.all([
      getPhotos("menu", 1),
      getPhotos("langar", 6),
      getPhotos("gallery", 12)
    ]);

    renderDailyMenu(menu[0]);
    renderLangar(langar);
    renderGallery(gallery);
  }

  document.addEventListener("DOMContentLoaded", loadLivePhotos);
})();


/* =====================================================
   SUPABASE LIVE PHOTO SYSTEM
   ===================================================== */

(function () {

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    console.log("Supabase photo system not connected.");
    return;
  }

  async function getPhotos(category, limit) {

    const { data, error } = await supabaseClient
      .from("site_photos")
      .select("id,title,category,public_url,created_at")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Supabase photo error:", error.message);
      return [];
    }

    return data || [];
  }


  /* =====================================================
     TODAY'S MENU
     ===================================================== */

  async function loadDailyMenu() {

    const photos = await getPhotos("menu", 1);

    const box =
      document.getElementById("dailyMenuPhotoBox");

    if (!box || !photos.length) return;

    const photo = photos[0];

    box.innerHTML = `
      <div class="daily-menu-photo-card">

        <div class="daily-menu-photo-heading">
          <span>🍽️ TODAY'S MENU</span>
          <small>Freshly updated</small>
        </div>

        <img
          src="${photo.public_url}"
          alt="${photo.title || "Today's Menu"}"
          loading="lazy"
        >

      </div>
    `;
  }


  /* =====================================================
     LANGAR SEVA
     ===================================================== */

  async function loadLangarPhotos() {

    const photos =
      await getPhotos("langar", 6);

    const track =
      document.getElementById("langarTrack");

    if (!track || !photos.length) return;

    track.innerHTML = photos.map(photo => `
      <div class="swipe-slide">

        <img
          src="${photo.public_url}"
          alt="${photo.title || "Langar Seva"}"
          loading="lazy"
        >

      </div>
    `).join("");

    const root =
      track.closest(".swipe-carousel");

    if (root && typeof setupSwipeCarousel === "function") {
      setupSwipeCarousel(root.id);
    }
  }


  /* =====================================================
     GALLERY
     ===================================================== */

  async function loadGalleryPhotos() {

    const photos =
      await getPhotos("gallery", 12);

    const track =
      document.getElementById("galleryTrack");

    if (!track || !photos.length) return;

    track.innerHTML = photos.map(photo => `
      <div class="swipe-slide">

        <img
          src="${photo.public_url}"
          alt="${photo.title || "Sudh Vaishno Tandoor"}"
          loading="lazy"
        >

      </div>
    `).join("");

    const root =
      track.closest(".swipe-carousel");

    if (root && typeof setupSwipeCarousel === "function") {
      setupSwipeCarousel(root.id);
    }
  }


  /* =====================================================
     LOAD EVERYTHING
     ===================================================== */

  async function loadSupabasePhotos() {

    await loadDailyMenu();
    await loadLangarPhotos();
    await loadGalleryPhotos();

  }

  loadSupabasePhotos();

})();
