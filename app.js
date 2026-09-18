let cart = JSON.parse(localStorage.getItem("foodShopCart") || "[]");
let activeCategory = "All";

const money = n => `${SHOP_CONFIG.currency}${n}`;
const save = () => localStorage.setItem("foodShopCart", JSON.stringify(cart));

const escHtml = value => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

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
function attachSafeHorizontalSwipe(track) {
  if (!track || track.dataset.safeSwipe === "1") return;
  track.dataset.safeSwipe = "1";

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let active = false;
  let horizontal = false;

  const isInteractive = target => !!target?.closest?.(
    "button, input, textarea, select, video, audio"
  );

  const setDragging = on => {
    track.classList.toggle("is-dragging", on);
    if (on) {
      track.style.scrollBehavior = "auto";
      track.style.scrollSnapType = "none";
    } else {
      track.style.removeProperty("scroll-behavior");
      track.style.removeProperty("scroll-snap-type");
    }
  };

  const cleanup = () => {
    setDragging(false);
    active = false;
    horizontal = false;
    pointerId = null;
  };

  const snapToNearest = dx => {
    const slides = [...track.children];
    if (!slides.length) return;

    let nearestIndex = 0;
    let nearestDistance = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    let targetIndex = nearestIndex;
    if (Math.abs(dx) >= 36) {
      targetIndex = dx < 0
        ? Math.min(slides.length - 1, nearestIndex + 1)
        : Math.max(0, nearestIndex - 1);
    }

    track.scrollTo({
      left: slides[targetIndex].offsetLeft,
      behavior: "smooth"
    });
  };

  const end = event => {
    if (!active || event.pointerId !== pointerId) return;

    const wasHorizontal = horizontal;
    const dx = event.clientX - startX;

    if (wasHorizontal && !track.classList.contains("reviews-touch-carousel")) snapToNearest(dx);

    try {
      if (track.hasPointerCapture?.(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    } catch (_) {}

    cleanup();
  };

  track.addEventListener("pointerdown", event => {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractive(event.target)) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startScroll = track.scrollLeft;
    active = true;
    horizontal = false;
  }, { passive: true });

  track.addEventListener("pointermove", event => {
    if (!active || event.pointerId !== pointerId) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!horizontal) {
      if (absX < 8 && absY < 8) return;

      // Vertical gesture: immediately hand the gesture back to the browser.
      // `touch-action: pan-y pinch-zoom` then keeps normal page scrolling.
      if (absY > absX + 6) {
        cleanup();
        return;
      }

      // Horizontal gesture: JS takes control of the carousel.
      horizontal = true;
      setDragging(true);
      try { track.setPointerCapture(event.pointerId); } catch (_) {}
    }

    if (!horizontal) return;

    if (event.cancelable) event.preventDefault();
    track.scrollLeft = startScroll - dx;
  }, { passive: false });

  track.addEventListener("pointerup", end, { passive: true });
  track.addEventListener("pointercancel", event => {
    if (event.pointerId === pointerId) cleanup();
  }, { passive: true });

  track.addEventListener("lostpointercapture", event => {
    if (event.pointerId === pointerId && active) cleanup();
  }, { passive: true });
}

/* SECTION 2 ONLY — phone showcase two-axis touch swipe.
   Horizontal finger movement changes photos; vertical movement is left
   to the browser so the page can scroll normally. */
function attachPhoneShowcaseTouchSwipe(track) {
  /* SECTION 2 ONLY: two-axis mobile gesture handling.
     - Horizontal swipe = move the phone showcase photos.
     - Vertical swipe = browser keeps scrolling the page.
     We deliberately avoid pointer capture here so the page can retain
     normal vertical scrolling when the gesture is vertical. */
  if (!track || track.dataset.phoneTouchSwipe === "1") return;
  track.dataset.phoneTouchSwipe = "1";

  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let direction = null;
  let tracking = false;

  const slides = () => [...track.children];

  const snap = dx => {
    const items = slides();
    if (!items.length) return;
    const current = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    let target = current;
    if (Math.abs(dx) >= 35) {
      target = dx < 0
        ? Math.min(items.length - 1, current + 1)
        : Math.max(0, current - 1);
    }
    track.scrollTo({ left: items[target].offsetLeft, behavior: "smooth" });
  };

  track.addEventListener("touchstart", event => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startScroll = track.scrollLeft;
    direction = null;
    tracking = true;
  }, { passive: true });

  track.addEventListener("touchmove", event => {
    if (!tracking || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!direction) {
      if (absX < 8 && absY < 8) return;
      direction = absX > absY + 5 ? "horizontal" : "vertical";
    }

    /* For vertical movement, do nothing: the browser owns the gesture
       and the document can scroll normally up/down. */
    if (direction !== "horizontal") return;

    if (event.cancelable) event.preventDefault();
    track.scrollLeft = startScroll - dx;
  }, { passive: false });

  track.addEventListener("touchend", event => {
    if (!tracking) return;
    if (direction === "horizontal") {
      const touch = event.changedTouches[0];
      snap(touch.clientX - startX);
    }
    tracking = false;
    direction = null;
  }, { passive: true });

  track.addEventListener("touchcancel", () => {
    tracking = false;
    direction = null;
  }, { passive: true });
}

/* SECTION 4 ONLY — MENU CARD PHOTO SWIPE
   Keep the menu carousel independent from the other carousels so changes here
   cannot alter the Hero, phone showcase, Story, or other sections. */
function attachMenuCarouselTouchSwipe(track) {
  if (!track || track.dataset.menuTouchSwipe === "1") return;
  track.dataset.menuTouchSwipe = "1";

  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let direction = null;
  let tracking = false;

  const getSlides = () => [...track.children];

  const snapToSlide = dx => {
    const slides = getSlides();
    if (!slides.length) return;

    let nearest = 0;
    let nearestDistance = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    let target = nearest;
    if (Math.abs(dx) >= 32) {
      target = dx < 0
        ? Math.min(slides.length - 1, nearest + 1)
        : Math.max(0, nearest - 1);
    }

    track.scrollTo({ left: slides[target].offsetLeft, behavior: "smooth" });
  };

  track.addEventListener("touchstart", event => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startScroll = track.scrollLeft;
    direction = null;
    tracking = true;
  }, { passive: true });

  track.addEventListener("touchmove", event => {
    if (!tracking || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!direction) {
      if (absX < 8 && absY < 8) return;
      direction = absX > absY + 6 ? "horizontal" : "vertical";
    }

    // Vertical gesture: never cancel it. The page remains normally scrollable.
    if (direction !== "horizontal") return;

    // Horizontal gesture: this carousel owns the movement.
    if (event.cancelable) event.preventDefault();
    track.scrollLeft = startScroll - dx;
  }, { passive: false });

  track.addEventListener("touchend", event => {
    if (!tracking) return;
    if (direction === "horizontal") {
      const touch = event.changedTouches[0];
      snapToSlide(touch.clientX - startX);
    }
    tracking = false;
    direction = null;
  }, { passive: true });

  track.addEventListener("touchcancel", () => {
    tracking = false;
    direction = null;
  }, { passive: true });
}

function setupSwipeCarousel(id) {
  const root = document.getElementById(id);
  if (!root) return;
  const track = root.querySelector(".swipe-track");
  const dots = root.querySelector(".swipe-dots");
  if (!track) return;

  const slides = [...track.children];
  if (!slides.length) return;
  if (id === "phoneMediaCarousel") {
    attachPhoneShowcaseTouchSwipe(track);
  } else if (id.startsWith("menuCarousel-")) {
    attachMenuCarouselTouchSwipe(track);
  } else {
    attachSafeHorizontalSwipe(track);
  }

  const goTo = index => {
    const safe = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: slides[safe].offsetLeft, behavior: "smooth" });
  };

  if (dots) {
    dots.innerHTML = slides.map((_, i) =>
      `<button class="swipe-dot ${i === 0 ? "active" : ""}" type="button" aria-label="Go to photo ${i + 1}"></button>`
    ).join("");
    [...dots.children].forEach((dot, i) => {
      dot.addEventListener("click", () => goTo(i));
    });
  }

  const updateDots = () => {
    if (!dots) return;
    const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
    [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === index));
  };

  track.addEventListener("scroll", updateDots, { passive: true });

  root.querySelectorAll(`[data-carousel-prev="${id}"]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const current = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      goTo(current - 1);
    });
  });

  root.querySelectorAll(`[data-carousel-next="${id}"]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const current = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      goTo(current + 1);
    });
  });
}

function renderMediaCollection(trackId, dotsId, items, allowVideo = false) {
  const track = document.getElementById(trackId);
  if (!track) return;

  track.innerHTML = items.map((item, index) => {
    const media = typeof item === "string" ? { type: "image", src: item, alt: "Sudh Vaishno Tandoor food" } : item;
    const loading = index === 0 ? "eager" : "lazy";
    if (allowVideo && media.type === "video") {
      return `<div class="swipe-slide"><video src="${media.src}" autoplay muted loop playsinline preload="metadata" aria-label="${media.alt || "Food video"}"></video></div>`;
    }
    return `<div class="swipe-slide"><img src="${media.src}" alt="${media.alt || "Sudh Vaishno Tandoor food"}" loading="${loading}" decoding="async"></div>`;
  }).join("");

  const root = track.closest(".swipe-carousel");
  if (!root) return;
  setupSwipeCarousel(root.id);
}

/* Phone showcase */
renderMediaCollection("phoneMediaTrack", "phoneMediaDots", SHOP_CONFIG.experienceMedia || [], true);

/* About gallery */
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

function getMenuQty(id){
  const row = cart.find(x => Number(x.id) === Number(id));
  return row ? Number(row.qty) || 0 : 0;
}

function renderMenu() {
  const items = activeCategory === "All"
    ? SHOP_CONFIG.menu
    : SHOP_CONFIG.menu.filter(x => x.category === activeCategory);
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  grid.innerHTML = items.map(item => {
    const images = liveMenuMediaByName[item.name]?.length
      ? liveMenuMediaByName[item.name]
      : (item.images?.length ? item.images.map(src => ({type:'image',src})) : [{type:'image',src:item.image}]);
    const slides = images.map((media, i) => {
      const type = typeof media === 'string' ? 'image' : (media.type || 'image');
      const src = typeof media === 'string' ? media : media.src;
      const caption = typeof media === 'string' ? '' : (media.caption || '');
      const safeSrc = escHtml(src);
      const safeCaption = escHtml(caption);
      const safeName = escHtml(item.name);
      if(type === 'video') return `<div class="swipe-slide"><div class="menu-media-wrap"><video class="menu-img menu-video" src="${safeSrc}" controls muted playsinline preload="metadata" aria-label="${safeName} video"></video>${caption ? `<div class="menu-media-caption">${safeCaption}</div>` : ''}</div></div>`;
      return `<div class="swipe-slide"><div class="menu-media-wrap"><img class="menu-img" src="${safeSrc}" alt="${safeName} photo ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async">${caption ? `<div class="menu-media-caption">${safeCaption}</div>` : ''}</div></div>`;
    }).join("");
    const qty = getMenuQty(item.id);
    const safeName = escHtml(item.name);
    const action = qty > 0
      ? `<div class="menu-qty" aria-label="Quantity controls for ${safeName}"><button type="button" data-menu-minus="${item.id}" aria-label="Decrease ${safeName} quantity">−</button><strong>${qty}</strong><button type="button" data-menu-plus="${item.id}" aria-label="Increase ${safeName} quantity">+</button></div>`
      : `<button class="add-btn" data-add="${item.id}">+ Add</button>`;
    const safeDescription = escHtml(item.description);
    return `<article class="menu-card" data-menu-card="${item.id}"><div class="menu-carousel swipe-carousel" id="menuCarousel-${item.id}"><div class="swipe-track">${slides}</div>${images.length > 1 ? `<button class="swipe-arrow prev" type="button" data-carousel-prev="menuCarousel-${item.id}" aria-label="Previous ${safeName} photo">‹</button><button class="swipe-arrow next" type="button" data-carousel-next="menuCarousel-${item.id}" aria-label="Next ${safeName} photo">›</button><div class="swipe-dots"></div>` : ""}</div><div class="menu-body"><h3>${safeName}</h3><p>${safeDescription}</p><div class="menu-bottom"><span class="price">${money(item.price)}</span><span class="menu-action" data-menu-action="${item.id}">${action}</span></div></div></article>`;
  }).join("");
  items.forEach(item => { if ((liveMenuMediaByName[item.name] || item.images || []).length > 1) setupSwipeCarousel(`menuCarousel-${item.id}`); });
}

function changeMenuQty(id, delta){
  const numericId = Number(id);
  const row = cart.find(x => Number(x.id) === numericId);
  if (row) {
    row.qty += delta;
    if (row.qty <= 0) cart = cart.filter(x => Number(x.id) !== numericId);
  } else if (delta > 0) {
    cart.push({ id:numericId, qty:1 });
  }

  save();
  updateCart();

  // Update ONLY this item's control. Do not rebuild the whole menu grid:
  // rebuilding caused the visible menu to flash/re-enter on every +/− tap.
  const actionWrap = document.querySelector(`[data-menu-action="${numericId}"]`);
  if (!actionWrap) return;
  const item = SHOP_CONFIG.menu.find(x => Number(x.id) === numericId);
  const name = item?.name || 'menu item';
  const qty = getMenuQty(numericId);
  actionWrap.innerHTML = qty > 0
    ? `<div class="menu-qty menu-qty-pop" aria-label="Quantity controls for ${name}"><button type="button" data-menu-minus="${numericId}" aria-label="Decrease ${name} quantity">−</button><strong>${qty}</strong><button type="button" data-menu-plus="${numericId}" aria-label="Increase ${name} quantity">+</button></div>`
    : `<button class="add-btn add-btn-pop" data-add="${numericId}">+ Add</button>`;

  // Tiny local feedback only; the card/photos remain completely still.
  const control = actionWrap.firstElementChild;
  if (control) {
    control.addEventListener('animationend', () => control.classList.remove('menu-qty-pop','add-btn-pop'), { once:true });
  }
}

const menuGrid = document.getElementById("menuGrid");
if (menuGrid) {
  menuGrid.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    const plus = e.target.closest("[data-menu-plus]");
    const minus = e.target.closest("[data-menu-minus]");
    if (!add && !plus && !minus) return;
    const raw = add ? add.dataset.add : (plus ? plus.dataset.menuPlus : minus.dataset.menuMinus);
    const id = Number(raw);
    if (!Number.isFinite(id)) return;
    changeMenuQty(id, (add || plus) ? 1 : -1);
  });
}

async function loadLiveMenuItemMedia(){
  if(!window.supabase || typeof supabaseClient === 'undefined' || !supabaseClient) return;
  try{
    const {data,error}=await supabaseClient
      .from('site_photos')
      .select('id,title,short_title,caption,media_type,public_url')
      .eq('category','menu_item')
      .order('id',{ascending:true})
      .limit(200);
    if(error){ console.warn('Menu item media:', error.message); return; }

    const grouped={};
    (data||[]).forEach(row=>{
      const name=(row.short_title||row.title||'').trim();
      if(!name || !row.public_url) return;
      (grouped[name] ||= []).push({type:row.media_type==='video'?'video':'image',src:row.public_url,caption:row.caption||row.title||''});
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
        images:local?.images||[],
        sort_order:Number(row.sort_order)||local?.sort_order||999999
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
   ADVANCED LIVE CONTENT + PWA UX
   - Today's Menu multi-photo carousel
   - Editable About stories
   - Editable Food & Moments photo/video gallery
   - Editable website review carousel
   - Installable PWA controls
   ===================================================== */
(function () {
  const esc = (value) => String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  const fallbackReviews = [
    { reviewer_name:'Ashok Kumar', review_text:'Nice experience with family, tasty and healthy food available here at very minimum price of 60 rupees only. Loving the food and serving staff.', rating:5, review_count:1 },
    { reviewer_name:'Chaman Baghel', review_text:'Amazing taste, feels like homemade food. Food is prepared in a hygienic measures. Worth every rupees.', rating:5, review_count:1 },
    { reviewer_name:'Ladsahab Alam', review_text:'Highly recommend for family. Home made taste food.', rating:5, review_count:1 },
    { reviewer_name:'RITIK Kumar', review_text:'Tasty food, home made.', rating:5, review_count:1 },
    { reviewer_name:'Murle Murle', review_text:'Valuable for money. Tasty kadhi chawal and rajma chawal. Breakfast Lunch Dinner available.', rating:5, review_count:1 },
    { reviewer_name:'Tarkesh 99', review_text:'Tasty food.', rating:5, review_count:4 }
  ];

  function setupAutoReviewCarousel() {
    const root = document.getElementById('reviewsCarousel');
    const track = document.getElementById('reviewsTrack');
    if (!root || !track || root.dataset.ready === '1') return;
    root.dataset.ready = '1';

    // True continuous marquee: smooth, constant-speed movement instead of
    // jumping one card every few seconds. The track contains two identical
    // sets, so we can loop seamlessly when the first set has passed.
    let raf = 0;
    let lastTime = 0;
    let pausedUntil = 0;
    let resumeTimer = null;
    const speed = 34; // pixels/second; lower = slower, higher = faster

    const pauseForInteraction = () => {
      pausedUntil = performance.now() + 1000;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        pausedUntil = performance.now();
      }, 1050);
    };

    ['pointerdown','touchstart','wheel','mouseenter','focusin'].forEach(evt => {
      root.addEventListener(evt, pauseForInteraction, { passive: true });
    });

    ['pointerup','touchend','mouseleave','focusout'].forEach(evt => {
      root.addEventListener(evt, () => {
        clearTimeout(resumeTimer);
        pausedUntil = performance.now() + 1000;
        resumeTimer = setTimeout(() => {
          pausedUntil = performance.now();
        }, 1050);
      }, { passive: true });
    });

    const animate = (now) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(50, now - lastTime);
      lastTime = now;

      if (!document.hidden && now >= pausedUntil) {
        const loopWidth = track.scrollWidth / 2;
        if (loopWidth > 0) {
          // Positive scrollLeft makes the content travel right-to-left.
          root.scrollLeft += (speed * dt) / 1000;
          if (root.scrollLeft >= loopWidth) {
            root.scrollLeft -= loopWidth;
          }
        }
      }

      raf = requestAnimationFrame(animate);
    };

    attachSafeHorizontalSwipe(root);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(animate);

    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
    });
  }

  function renderReviews(rows) {
    const track = document.getElementById('reviewsTrack');
    if (!track) return;
    const items = (rows && rows.length ? rows : fallbackReviews);
    const cards = items.map(row => {
      const name = row.reviewer_name || row.name || 'Google reviewer';
      const initial = name.trim().charAt(0).toUpperCase() || 'G';
      const stars = '★'.repeat(Math.max(1, Math.min(5, Number(row.rating) || 5)));
      return `<article class="review"><div class="stars">${stars}</div><p>“${esc(row.review_text || row.text || '')}”</p><div class="reviewer"><span>${esc(initial)}</span><div><strong>${esc(name)}</strong><small>Google reviewer · ${Number(row.review_count)||1} ${Number(row.review_count)===1?'review':'reviews'}</small></div></div></article>`;
    }).join('');
    // Duplicate the set once so the horizontal area always feels continuous on desktop.
    track.innerHTML = cards + cards;
    setupAutoReviewCarousel();
  }

  async function loadReviews() {
    if (!window.supabase || typeof supabaseClient === 'undefined' || !supabaseClient) {
      renderReviews(fallbackReviews); return;
    }
    try {
      const {data, error} = await supabaseClient.from('site_reviews')
        .select('id,reviewer_name,review_text,rating,review_count,is_active,sort_order')
        .eq('is_active', true).order('sort_order',{ascending:true}).order('id',{ascending:true});
      if (error) throw error;
      renderReviews(data || fallbackReviews);

      const settings = await supabaseClient.from('site_settings').select('google_rating,google_review_count').eq('id',1).maybeSingle();
      if (!settings.error && settings.data) {
        const rating = document.getElementById('googleRatingScore');
        const count = document.getElementById('googleReviewCount');
        if (rating) rating.textContent = Number(settings.data.google_rating || 4.9).toFixed(1).replace('.0','');
        if (count) count.textContent = Number(settings.data.google_review_count || 17);
      }
    } catch (e) {
      console.warn('Live reviews unavailable; using website fallback reviews.', e.message || e);
      renderReviews(fallbackReviews);
    }
  }

  async function getContent(category, limit=30) {
    if (!window.supabase || typeof supabaseClient === 'undefined' || !supabaseClient) return [];
    const {data,error} = await supabaseClient.from('site_photos')
      .select('id,title,short_title,caption,story_text,category,media_type,youtube_url,public_url,is_today')
      .eq('category', category).order('id',{ascending:true}).limit(limit);
    if (error) throw error;
    return data || [];
  }

  function renderLangar(items) {
    const track = document.getElementById('langarTrack');
    const root = document.getElementById('langarCarousel');
    if (!track || !root) return;

    track.innerHTML = '';
    const rows = items || [];
    if (!rows.length) {
      track.innerHTML = `<div class="swipe-slide langar-empty-slide"><div class="langar-empty-message">🙏 Langar Seva photos and videos will appear here.</div></div>`;
      root.querySelectorAll('.swipe-arrow,.swipe-dots').forEach(el => el.remove());
      return;
    }

    track.innerHTML = rows.map(item => {
      const title = item.short_title || item.title || 'Langar Seva';
      if (item.media_type === 'youtube' && item.youtube_url) {
        return `<div class="swipe-slide langar-media-slide">
          <a class="langar-youtube-card" href="${esc(item.youtube_url)}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${esc(title)} on YouTube">
            <img src="${esc(item.public_url)}" alt="${esc(title)}" loading="lazy">
            <span class="langar-youtube-play" aria-hidden="true">▶</span>
            <div class="langar-youtube-info"><strong>${esc(title)}</strong><em>▶ Watch on YouTube ↗</em></div>
          </a>
        </div>`;
      }
      if (item.media_type === 'video') {
        return `<div class="swipe-slide langar-media-slide"><div class="langar-photo-card"><video src="${esc(item.public_url)}" controls muted playsinline preload="metadata" aria-label="${esc(title)}"></video><div class="langar-photo-caption"><strong>${esc(title)}</strong></div></div></div>`;
      }
      return `<div class="swipe-slide langar-media-slide"><div class="langar-photo-card"><img src="${esc(item.public_url)}" alt="${esc(title)}" loading="lazy"><div class="langar-photo-caption"><strong>${esc(title)}</strong></div></div></div>`;
    }).join('');

    root.querySelectorAll('.swipe-arrow,.swipe-dots').forEach(el => el.remove());
    if (rows.length > 1) {
      root.insertAdjacentHTML('beforeend', `
        <button class="swipe-arrow prev" type="button" data-carousel-prev="langarCarousel" aria-label="Previous Langar photo">‹</button>
        <button class="swipe-arrow next" type="button" data-carousel-next="langarCarousel" aria-label="Next Langar photo">›</button>
        <div class="swipe-dots" id="langarDots"></div>
      `);
      setupSwipeCarousel('langarCarousel');
    }
  }

  function renderToday(items) {
    const box = document.getElementById('dailyMenuPhotoBox');
    if (!box) return;
    const rows = items.length ? items : [];
    if (!rows.length) { box.innerHTML=''; return; }
    const slides = rows.map((p,i)=>{
      const caption = p.caption || p.title || '';
      return `<div class="swipe-slide"><div class="today-media-wrap"><img src="${esc(p.public_url)}" alt="${esc(p.short_title||p.title||`Today's menu ${i+1}`)}" loading="${i===0?'eager':'lazy'}">${caption ? `<div class="today-media-caption">${esc(caption)}</div>` : ''}</div></div>`;
    }).join('');
    box.innerHTML = `<div class="daily-menu-photo-card"><div class="daily-menu-photo-heading"><span>🍽️ TODAY'S MENU</span><small>${rows.length} ${rows.length===1?'photo':'photos'} · swipe</small></div><div class="daily-menu-carousel swipe-carousel" id="dailyMenuCarousel"><div class="swipe-track">${slides}</div>${rows.length>1?'<button class="swipe-arrow prev" type="button" data-carousel-prev="dailyMenuCarousel" aria-label="Previous menu photo">‹</button><button class="swipe-arrow next" type="button" data-carousel-next="dailyMenuCarousel" aria-label="Next menu photo">›</button><div class="swipe-dots"></div>':''}</div></div>`;
    if (rows.length>1) setupSwipeCarousel('dailyMenuCarousel');
  }

  function renderAbout(rows) {
    const track = document.getElementById('aboutStoryTrack');
    const root = document.getElementById('aboutStoryCarousel');
    if (!track || !root) return;

    const fallback = [{
      title: 'Pure vegetarian food since 1996.',
      story_text: 'Sudh Vaishno Tandoor is a pure vegetarian food shop at Gate No. 2, GMCH, Chandigarh, serving simple, satisfying and homely meals. Owned by Sudhir Mandal and serving customers since 1996.',
      public_url: 'assets/photos/thali.png'
    }];
    const items = rows.length ? rows : fallback;

    track.innerHTML = items.map((item, index) => {
      const title = item.title || 'Our story';
      const fullText = String(item.story_text || item.caption || 'Pure vegetarian food, fresh every day, with a homely taste.').trim();
      const preview = fullText.length > 260 ? fullText.slice(0, 257).trimEnd() + '…' : fullText;
      const image = item.public_url || 'assets/photos/thali.png';
      return `<article class="about-story-slide">
        <div class="about-story-image"><img src="${esc(image)}" alt="${esc(title)}" loading="${index === 0 ? 'eager' : 'lazy'}"></div>
        <div class="about-story-copy">
          <span class="eyebrow">ABOUT US</span>
          <h2>${esc(title)}</h2>
          <p class="about-story-preview-text">${esc(preview)}</p>
          <a class="about-read-more" href="story.html">Read full story <span>→</span></a>
          <div class="about-story-meta"><span>🌱 Pure Vegetarian</span><span>Since 1996</span><span>📍 Chandigarh</span></div>
        </div>
      </article>`;
    }).join('');

    const oldControls = root.querySelectorAll('.swipe-arrow,.swipe-dots');
    oldControls.forEach(el => el.remove());

    if (items.length > 1) {
      root.insertAdjacentHTML('beforeend', `
        <button class="swipe-arrow prev" type="button" data-carousel-prev="aboutStoryCarousel" aria-label="Previous story">‹</button>
        <button class="swipe-arrow next" type="button" data-carousel-next="aboutStoryCarousel" aria-label="Next story">›</button>
        <div class="swipe-dots" id="aboutStoryDots"></div>
      `);
      setupSwipeCarousel('aboutStoryCarousel');
    }
  }

  function renderGallery(rows) {
    const track = document.getElementById('galleryTrack');
    const root = document.getElementById('galleryCarousel');
    if (!track || !root) return;

    const fallback = (SHOP_CONFIG.galleryImages || []).map(src => ({ public_url: src, title: 'Sudh Vaishno Tandoor' }));
    const items = rows.length ? rows : fallback.slice(0, 5);

    track.innerHTML = items.map((p, i) => {
      const title = p.caption || p.title || 'Sudh Vaishno Tandoor';
      if (p.media_type === 'video') {
        return `<div class="swipe-slide"><div class="gallery-media-card"><video src="${esc(p.public_url)}" controls muted playsinline preload="metadata" aria-label="${esc(title)}"></video><div class="gallery-media-caption">${esc(title)}</div></div></div>`;
      }
      return `<div class="swipe-slide"><div class="gallery-media-card"><img src="${esc(p.public_url)}" alt="${esc(title)}" loading="${i === 0 ? 'eager' : 'lazy'}"><div class="gallery-media-caption">${esc(title)}</div></div></div>`;
    }).join('');

    root.querySelectorAll('.swipe-arrow,.swipe-dots').forEach(el => el.remove());
    if (items.length > 1) {
      root.insertAdjacentHTML('beforeend', `
        <button class="swipe-arrow prev" type="button" data-carousel-prev="galleryCarousel" aria-label="Previous food photo">‹</button>
        <button class="swipe-arrow next" type="button" data-carousel-next="galleryCarousel" aria-label="Next food photo">›</button>
        <div class="swipe-dots" id="galleryDots"></div>
      `);
      setupSwipeCarousel('galleryCarousel');
    }
  }

  async function loadBranding() {
    if (!supabaseClient) return;
    try {
      const {data,error} = await supabaseClient.from('site_settings')
        .select('setting_key,setting_value')
        .in('setting_key',['header_profile_image_url','phone_showcase_logo_url']);
      if (error) throw error;
      const map = Object.fromEntries((data || []).map(x => [x.setting_key, x.setting_value]));
      const fallback = 'assets/photos/logo.png';
      const applyBrandImage = (img, url) => {
        if (!img) return;
        img.dataset.fallback = fallback;
        img.dataset.fallbackApplied = '0';
        img.onerror = () => {
          if (img.dataset.fallbackApplied === '1') return;
          img.dataset.fallbackApplied = '1';
          img.src = fallback;
        };
        const clean = String(url || '').trim();
        img.src = clean || fallback;
      };
      applyBrandImage(document.getElementById('headerProfileImage'), map.header_profile_image_url);
      applyBrandImage(document.getElementById('phoneShowcaseScreenLogo'), map.phone_showcase_logo_url);
    } catch (e) {
      console.warn('Branding settings unavailable; using built-in images.', e.message || e);
    }
  }

  async function loadAdvancedContent() {
    renderReviews(fallbackReviews);

    const results = await Promise.allSettled([
      getContent('menu', 20).then(rows => rows.filter(x => x.is_today)),
      getContent('about', 20),
      getContent('gallery', 30),
      getContent('langar', 30)
    ]);

    const valueAt = index => results[index]?.status === 'fulfilled' ? results[index].value : [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Live content category ${index + 1} unavailable:`, result.reason?.message || result.reason);
      }
    });

    renderToday(valueAt(0));
    renderAbout(valueAt(1));
    renderGallery(valueAt(2).slice(0, 5));
    renderLangar(valueAt(3));

    loadReviews();
    loadBranding();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAdvancedContent);
  else loadAdvancedContent();

  /* PWA install UX */
  let deferredInstallPrompt = null;
  const installButtons = () => [document.getElementById('installAppButton'), document.getElementById('mobileInstallAppButton')].filter(Boolean);
  const markInstalled = () => installButtons().forEach(btn => { btn.textContent='✓ App Installed'; btn.classList.add('installed'); });
  const showInstallHelp = () => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);
    const message = isIOS
      ? 'To install: open this website in Safari → Share → Add to Home Screen.'
      : isAndroid
        ? 'If the install popup does not appear: Chrome ⋮ → Install app (or Add to Home screen).'
        : 'Use Chrome or Edge and choose Install app from the browser address-bar menu.';
    alert(message);
  };
  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch(e) {}
      deferredInstallPrompt = null;
      return;
    }
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) { markInstalled(); return; }
    showInstallHelp();
  };
  installButtons().forEach(btn => btn.addEventListener('click', handleInstallClick));
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredInstallPrompt=e;
    installButtons().forEach(btn => { btn.textContent='📲 Install App'; btn.classList.remove('installed'); });
  });
  window.addEventListener('appinstalled', markInstalled);
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) markInstalled();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker:', err)));
  }
})();
