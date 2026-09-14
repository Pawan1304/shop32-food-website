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
  /* =====================================================
   SUPABASE LIVE PHOTO SYSTEM
   ===================================================== */

(function () {

  // Supabase must be configured
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    console.warn("Supabase is not configured.");
    return;
  }

  /* -----------------------------------------------------
     Escape HTML safely
     ----------------------------------------------------- */
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* -----------------------------------------------------
     Get photos from Supabase
     ----------------------------------------------------- */
  async function getPhotos(category, limit = 12) {

    try {

      const { data, error } = await supabaseClient
        .from("site_photos")
        .select(`
          id,
          title,
          short_title,
          category,
          public_url,
          storage_path,
          display_date,
          is_today,
          media_type,
          youtube_url,
          created_at
        `)
        .eq("category", category)
        .order("created_at", {
          ascending: false
        })
        .limit(limit);

      if (error) {
        console.error(
          "Supabase photo error:",
          error.message
        );

        return [];
      }

      return data || [];

    } catch (error) {

      console.error(
        "Photo loading error:",
        error
      );

      return [];
    }
  }


  /* -----------------------------------------------------
     YouTube thumbnail / URL helper
     ----------------------------------------------------- */
  function youtubeId(url) {

    if (!url) return "";

    try {

      const u = new URL(url);

      if (u.hostname === "youtu.be") {
        return u.pathname.substring(1);
      }

      if (
        u.hostname.includes("youtube.com") &&
        u.searchParams.get("v")
      ) {
        return u.searchParams.get("v");
      }

      const match = u.pathname.match(
        /\/(?:embed|shorts)\/([^/?]+)/
      );

      return match ? match[1] : "";

    } catch {

      return "";
    }
  }


  /* -----------------------------------------------------
     Render Langar photos
     ----------------------------------------------------- */
  function renderSupabaseLangar(photos) {

    const track =
      document.getElementById("langarTrack");

    const dots =
      document.getElementById("langarDots");

    if (!track) {
      console.warn(
        "langarTrack not found in HTML."
      );
      return;
    }

    /* No Langar uploads */
    if (!photos.length) {

      track.innerHTML = `
        <div class="swipe-slide">
          <div style="
            width:100%;
            height:100%;
            min-height:300px;
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
            padding:30px;
            background:#f7eee7;
            border-radius:20px;
          ">
            <div>
              <div style="font-size:42px;">🍲</div>
              <strong>Langar Seva Photos</strong>
              <p style="margin-top:8px;">
                Photos will appear here after uploading
                them from the Admin Panel.
              </p>
            </div>
          </div>
        </div>
      `;

      if (dots) {
        dots.innerHTML = "";
      }

      return;
    }


    /* ---------------------------------------------------
       Create slides
       --------------------------------------------------- */

    track.innerHTML = photos.map((photo) => {

      const title =
        photo.short_title ||
        photo.title ||
        "Langar Seva";

      const date =
        photo.display_date ||
        photo.created_at?.slice(0, 10) ||
        "";

      const isYouTube =
        photo.media_type === "youtube" &&
        photo.youtube_url;

      const ytId =
        isYouTube
          ? youtubeId(photo.youtube_url)
          : "";

      const imageUrl =
        photo.public_url ||
        (
          ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : ""
        );

      if (!imageUrl) {
        return "";
      }


      /* -------------------------------------------------
         YouTube slide
         ------------------------------------------------- */

      if (isYouTube) {

        return `
          <div class="swipe-slide">

            <a
              href="${esc(photo.youtube_url)}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display:block;
                position:relative;
                width:100%;
                height:100%;
                text-decoration:none;
                color:inherit;
              "
            >

              <img
                src="${esc(imageUrl)}"
                alt="${esc(title)}"
                loading="lazy"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
              >

              <div style="
                position:absolute;
                inset:0;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(0,0,0,.15);
              ">

                <div style="
                  width:64px;
                  height:64px;
                  border-radius:50%;
                  background:#e53935;
                  color:#fff;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:28px;
                  box-shadow:0 8px 25px rgba(0,0,0,.25);
                ">
                  ▶
                </div>

              </div>

              <div style="
                position:absolute;
                left:16px;
                right:16px;
                bottom:16px;
                padding:12px 14px;
                border-radius:12px;
                background:rgba(0,0,0,.65);
                color:#fff;
              ">

                <strong>
                  ${esc(title)}
                </strong>

                ${
                  date
                    ? `<small style="
                        display:block;
                        margin-top:4px;
                        opacity:.85;
                      ">${esc(date)}</small>`
                    : ""
                }

              </div>

            </a>

          </div>
        `;
      }


      /* -------------------------------------------------
         Normal Langar photo
         ------------------------------------------------- */

      return `
        <div class="swipe-slide">

          <div style="
            position:relative;
            width:100%;
            height:100%;
          ">

            <img
              src="${esc(imageUrl)}"
              alt="${esc(title)}"
              loading="lazy"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                display:block;
              "
            >

            <div style="
              position:absolute;
              left:16px;
              right:16px;
              bottom:16px;
              padding:12px 14px;
              border-radius:12px;
              background:rgba(0,0,0,.60);
              color:#fff;
            ">

              <strong>
                ${esc(title)}
              </strong>

              ${
                date
                  ? `<small style="
                      display:block;
                      margin-top:4px;
                      opacity:.85;
                    ">${esc(date)}</small>`
                  : ""
              }

            </div>

          </div>

        </div>
      `;

    }).join("");


    /* ---------------------------------------------------
       Re-create dots
       --------------------------------------------------- */

    if (dots) {

      dots.innerHTML = photos.map(
        (_, index) => `
          <button
            class="swipe-dot ${index === 0 ? "active" : ""}"
            type="button"
            aria-label="Go to Langar photo ${index + 1}"
          ></button>
        `
      ).join("");


      const slides =
        [...track.children];

      [...dots.children].forEach(
        (dot, index) => {

          dot.addEventListener(
            "click",
            () => {

              slides[index]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
              });

            }
          );

        }
      );


      /* Update active dot while swiping */

      track.addEventListener(
        "scroll",
        () => {

          const width =
            track.clientWidth || 1;

          const index =
            Math.round(
              track.scrollLeft / width
            );

          [...dots.children].forEach(
            (dot, i) => {

              dot.classList.toggle(
                "active",
                i === index
              );

            }
          );

        },
        {
          passive: true
        }
      );

    }


    /* ---------------------------------------------------
       IMPORTANT:
       Connect existing carousel arrows
       --------------------------------------------------- */

    const carousel =
      document.getElementById("langarCarousel");

    if (carousel) {

      const slides =
        [...track.children];

      const previous =
        carousel.querySelector(
          '[data-carousel-prev="langarCarousel"]'
        );

      const next =
        carousel.querySelector(
          '[data-carousel-next="langarCarousel"]'
        );


      if (previous) {

        previous.onclick = () => {

          const current =
            Math.round(
              track.scrollLeft /
              (track.clientWidth || 1)
            );

          const index =
            Math.max(
              0,
              current - 1
            );

          slides[index]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
          });

        };

      }


      if (next) {

        next.onclick = () => {

          const current =
            Math.round(
              track.scrollLeft /
              (track.clientWidth || 1)
            );

          const index =
            Math.min(
              slides.length - 1,
              current + 1
            );

          slides[index]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
          });

        };

      }

    }

  }


  /* -----------------------------------------------------
     Load everything from Supabase
     ----------------------------------------------------- */
  async function loadSupabasePhotos() {

    console.log(
      "Loading photos from Supabase..."
    );


    /* Today's Menu */
    const menuPhotos =
      await getPhotos("menu", 10);


    /*
      We don't replace the normal menu.
      The menu upload remains available through
      Supabase for future use.
    */


    /* ---------------------------------------------------
       LANGAR — ONLY SUPABASE
       --------------------------------------------------- */

    const langarPhotos =
      await getPhotos("langar", 20);


    console.log(
      "Langar photos loaded:",
      langarPhotos.length
    );


    renderSupabaseLangar(
      langarPhotos
    );


    /* ---------------------------------------------------
       Gallery
       --------------------------------------------------- */

    const galleryPhotos =
      await getPhotos("gallery", 20);

    const galleryTrack =
      document.getElementById(
        "galleryTrack"
      );

    const galleryDots =
      document.getElementById(
        "galleryDots"
      );


    if (
      galleryTrack &&
      galleryPhotos.length
    ) {

      galleryTrack.innerHTML =
        galleryPhotos.map(
          photo => `
            <div class="swipe-slide">

              <img
                src="${esc(photo.public_url)}"
                alt="${esc(
                  photo.title ||
                  "Sudh Vaishno Tandoor"
                )}"
                loading="lazy"
              >

            </div>
          `
        ).join("");


      if (galleryDots) {

        galleryDots.innerHTML =
          galleryPhotos.map(
            (_, i) => `
              <button
                class="swipe-dot ${
                  i === 0
                    ? "active"
                    : ""
                }"
                type="button"
                aria-label="Gallery photo ${i + 1}"
              ></button>
            `
          ).join("");

      }

    }

  }


  /* -----------------------------------------------------
     Start after page is ready
     ----------------------------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      loadSupabasePhotos
    );

  } else {

    loadSupabasePhotos();

  }

})();
