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
// Langar media is loaded only from Supabase. Do not use static menu/config images here.

/* =====================================================
   MENU WITH MULTI-PHOTO SWIPE CARDS
   Live menu-item media from Supabase is loaded below and
   overrides the local config images when available.
   ===================================================== */
let liveMenuMediaByName = {};
const tabs = document.getElementById("categoryTabs");
function rebuildMenuCategories(){
  if(!tabs) return;
  const categories = ["All", ...new Set(SHOP_CONFIG.menu.map(x => x.category))];
  tabs.innerHTML = categories.map(c => `<button class="${c === activeCategory ? "active" : (c === "All" && activeCategory === "All" ? "active" : "")}" data-category="${c}">${c}</button>`).join("");
}
if (tabs) {
  rebuildMenuCategories();
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
    const images = liveMenuMediaByName[item.name]?.length
      ? liveMenuMediaByName[item.name]
      : (item.images?.length ? item.images.map(src => ({type:'image',src})) : [{type:'image',src:item.image}]);
    const slides = images.map((media, i) => {
      const type = typeof media === 'string' ? 'image' : (media.type || 'image');
      const src = typeof media === 'string' ? media : media.src;
      if(type === 'video') {
        return `<div class="swipe-slide"><video class="menu-img menu-video" src="${src}" controls muted playsinline preload="metadata" aria-label="${item.name} video"></video></div>`;
      }
      return `<div class="swipe-slide"><img class="menu-img" src="${src}" alt="${item.name} photo ${i + 1}" loading="lazy"></div>`;
    }).join("");

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
    if ((liveMenuMediaByName[item.name] || item.images || []).length > 1) setupSwipeCarousel(`menuCarousel-${item.id}`);
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

async function loadLiveMenuItemMedia(){
  if(!window.supabase || typeof supabaseClient === 'undefined' || !supabaseClient) return;
  try{
    const {data,error}=await supabaseClient
      .from('site_photos')
      .select('id,title,short_title,media_type,public_url')
      .eq('category','menu_item')
      .order('id',{ascending:true})
      .limit(200);
    if(error){ console.warn('Menu item media:', error.message); return; }

    const grouped={};
    (data||[]).forEach(row=>{
      const name=(row.short_title||row.title||'').trim();
      if(!name || !row.public_url) return;
      (grouped[name] ||= []).push({type:row.media_type==='video'?'video':'image',src:row.public_url});
    });
    liveMenuMediaByName=grouped;
    renderMenu();
  }catch(error){
    console.warn('Live menu item media:', error);
  }
}

async function loadLiveMenuItems(){
  if(!window.supabase || typeof supabaseClient === 'undefined' || !supabaseClient) return;
  try{
    const {data,error}=await supabaseClient
      .from('menu_items')
      .select('id,name,category,description,price,image,sort_order,is_active')
      .eq('is_active',true)
      .order('sort_order',{ascending:true})
      .order('id',{ascending:true});
    if(error){ console.warn('Live menu items:', error.message); return; }
    if(!data?.length) return;

    const localByName=new Map((SHOP_CONFIG.menu||[]).map(x=>[String(x.name).trim().toLowerCase(),x]));
    const dbItems=data.map(row=>{
      const local=localByName.get(String(row.name).trim().toLowerCase());
      return {
        ...(local||{}),
        id:Number(row.id),
        name:row.name,
        category:row.category,
        description:row.description||local?.description||'Freshly prepared and served hot.',
        price:Number(row.price)||0,
        image:row.image||local?.image||'assets/photos/thali.png',
        images:local?.images||[]
      };
    });

    // Keep the original config items that have not yet been migrated to Supabase,
    // then add all new database-created items.
    const dbNames=new Set(dbItems.map(x=>String(x.name).trim().toLowerCase()));
    const localOnly=(SHOP_CONFIG.menu||[]).map((x,i)=>({...x,sort_order:(i+1)*10})).filter(x=>!dbNames.has(String(x.name).trim().toLowerCase()));
    SHOP_CONFIG.menu=[...localOnly,...dbItems].sort((a,b)=>(Number(a.sort_order)||999999)-(Number(b.sort_order)||999999) || String(a.name).localeCompare(String(b.name)));
    rebuildMenuCategories();
    renderMenu();
    updateCart();
  }catch(error){ console.warn('Live menu items:', error); }
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
loadLiveMenuItemMedia();
loadLiveMenuItems();


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
   SUPABASE LIVE MEDIA SYSTEM
   - Today's Menu: only the admin-selected menu photo
   - Langar: ONLY Supabase Langar photos + YouTube thumbnails
   - Gallery: Supabase gallery photos
   ===================================================== */
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
      .select("id,title,short_title,category,media_type,youtube_url,public_url,is_today")
      .eq("category", category)
      .order("id", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Supabase media system:", error.message);
      return [];
    }

    return data || [];
  }

  async function getTodaysMenu() {
    // Prefer the photo explicitly marked Today's Menu in Admin Panel.
    const { data, error } = await supabaseClient
      .from("site_photos")
      .select("id,title,short_title,category,public_url,is_today")
      .eq("category", "menu")
      .eq("is_today", true)
      .order("id", { ascending: false })
      .limit(1);

    if (error) {
      console.warn("Today's Menu:", error.message);
      return null;
    }

    // Backward-compatible fallback if older menu uploads do not have is_today set.
    if (data && data.length) return data[0];

    const { data: latest, error: latestError } = await supabaseClient
      .from("site_photos")
      .select("id,title,short_title,category,public_url,is_today")
      .eq("category", "menu")
      .order("id", { ascending: false })
      .limit(1);

    if (latestError) {
      console.warn("Latest Menu:", latestError.message);
      return null;
    }

    return latest?.[0] || null;
  }

  function renderDailyMenu(photo) {
    const box = document.getElementById("dailyMenuPhotoBox");
    if (!box || !photo) return;

    box.innerHTML = `
      <div class="daily-menu-photo-card">
        <div class="daily-menu-photo-heading">
          <span>🍽️ TODAY'S MENU</span>
        </div>
        <img src="${esc(photo.public_url)}" alt="${esc(photo.short_title || photo.title || "Today's menu")}" loading="lazy">
      </div>
    `;
  }

  function ensureLangarCaptionStyles() {
    if (document.getElementById("supabaseLangarCaptionStyles")) return;

    const style = document.createElement("style");
    style.id = "supabaseLangarCaptionStyles";
    style.textContent = `
      .langar-media-slide { position: relative; }
      .langar-photo-card, .langar-youtube-card {
        position: relative; width: 100%; height: 100%; display: block;
        overflow: hidden; border-radius: 21px;
      }
      .langar-photo-card img, .langar-youtube-card img {
        display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 21px;
      }
      .langar-photo-caption, .langar-youtube-info {
        position: absolute; left: 0; right: 0; bottom: 0; z-index: 3;
        padding: 12px 16px 14px;
        background: rgba(0, 0, 0, 0.58);
        color: #fff;
        backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
      }
      .langar-photo-caption strong, .langar-youtube-info strong {
        display: block; color: #fff; font-size: 16px; line-height: 1.35;
        font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,.55);
      }
      .langar-youtube-info em {
        display: block; margin-top: 4px; color: rgba(255,255,255,.9);
        font-size: 12px; font-style: normal;
      }
      .langar-youtube-play {
        position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
        z-index: 4; width: 58px; height: 58px; display: grid; place-items: center;
        border-radius: 50%; background: #ef3333; color: #fff; font-size: 25px;
        padding-left: 4px; box-shadow: 0 6px 18px rgba(0,0,0,.3);
      }
      @media (max-width: 600px) {
        .langar-photo-caption, .langar-youtube-info { padding: 9px 12px 11px; }
        .langar-photo-caption strong, .langar-youtube-info strong { font-size: 14px; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderLangar(items) {
    const track = document.getElementById("langarTrack");
    const dots = document.getElementById("langarDots");
    const root = document.getElementById("langarCarousel");

    if (!track || !root) return;

    ensureLangarCaptionStyles();

    // IMPORTANT: clear the old static/config Langar images first.
    track.innerHTML = "";
    if (dots) dots.innerHTML = "";

    if (!items.length) {
      track.innerHTML = `
        <div class="swipe-slide langar-empty-slide">
          <div class="langar-empty-message">
            🙏 Langar Seva photos and videos will appear here.
          </div>
        </div>
      `;
      return;
    }

    track.innerHTML = items.map((item) => {
      const title = item.short_title || item.title || "Langar Seva";
      // YouTube item: thumbnail is stored in Supabase; clicking opens the saved YouTube URL.
      if (item.media_type === "youtube" && item.youtube_url) {
        return `
          <div class="swipe-slide langar-media-slide">
            <a
              class="langar-youtube-card"
              href="${esc(item.youtube_url)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch ${esc(title)} on YouTube"
            >
              <img src="${esc(item.public_url)}" alt="${esc(title)}" loading="lazy">
              <span class="langar-youtube-play" aria-hidden="true">▶</span>
              <div class="langar-youtube-info">
                <strong>${esc(title)}</strong>
                <em>▶ Watch on YouTube ↗</em>
              </div>
            </a>
          </div>
        `;
      }

      // Normal Langar food/distribution photo.
      return `
        <div class="swipe-slide langar-media-slide">
          <div class="langar-photo-card">
            <img src="${esc(item.public_url)}" alt="${esc(title)}" loading="lazy">
            <div class="langar-photo-caption">
              <strong>${esc(title)}</strong>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Build dots and arrow behavior once, after the live slides exist.
    setupSwipeCarousel("langarCarousel");
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
    try {
      const [menu, langar, gallery] = await Promise.all([
        getTodaysMenu(),
        getPhotos("langar", 12),
        getPhotos("gallery", 12)
      ]);

      renderDailyMenu(menu);
      renderLangar(langar);
      renderGallery(gallery);
    } catch (error) {
      console.warn("Live media system:", error);
    }
  }

  // app.js is loaded at the end of index.html, but this also works if the script is moved.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadLivePhotos);
  } else {
    loadLivePhotos();
  }
})();

/* =====================================================
   PWA INSTALL EXPERIENCE
   ===================================================== */
let deferredInstallPrompt = null;
const installButtons = [
  document.getElementById("installAppButton"),
  document.getElementById("installAppButtonDesktop")
].filter(Boolean);

function showInstallButtons(show) {
  installButtons.forEach(btn => {
    btn.hidden = !show;
  });
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallButtons(true);
});

installButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    if (result.outcome === "accepted") showInstallButtons(false);
    deferredInstallPrompt = null;
  });
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  showInstallButtons(false);
});
