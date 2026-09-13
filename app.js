let cart = JSON.parse(localStorage.getItem("foodShopCart") || "[]");
let activeCategory = "All";

const money = n => `${SHOP_CONFIG.currency}${n}`;
const save = () => localStorage.setItem("foodShopCart", JSON.stringify(cart));

document.querySelectorAll("[data-shop-name]").forEach(el => el.textContent = SHOP_CONFIG.shopName);
document.querySelectorAll("[data-address]").forEach(el => el.textContent = SHOP_CONFIG.address);
document.querySelectorAll("[data-hours]").forEach(el => el.textContent = SHOP_CONFIG.hours);
document.querySelectorAll("[data-owner]").forEach(el => el.textContent = SHOP_CONFIG.owner);
document.querySelectorAll("[data-phone-link]").forEach((el, i) => el.href = `tel:+${SHOP_CONFIG.phone[i] || SHOP_CONFIG.phone[0]}`);
document.querySelectorAll("[data-map-link]").forEach(el => el.href = SHOP_CONFIG.mapsUrl);
document.querySelectorAll("[data-whatsapp-link]").forEach(el => el.href = `https://wa.me/${SHOP_CONFIG.whatsapp}`);
document.getElementById("year").textContent = new Date().getFullYear();

const categories = ["All", ...new Set(SHOP_CONFIG.menu.map(x => x.category))];
const tabs = document.getElementById("categoryTabs");
tabs.innerHTML = categories.map(c => `<button class="${c==="All"?"active":""}" data-category="${c}">${c}</button>`).join("");
tabs.addEventListener("click", e => {
  const btn = e.target.closest("button"); if (!btn) return;
  activeCategory = btn.dataset.category;
  tabs.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
  renderMenu();
});

function renderMenu() {
  const items = activeCategory === "All" ? SHOP_CONFIG.menu : SHOP_CONFIG.menu.filter(x => x.category === activeCategory);
  document.getElementById("menuGrid").innerHTML = items.map(item => `
    <article class="menu-card">
      <img class="menu-img" src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="menu-body">
        <h3>${item.name}</h3><p>${item.description}</p>
        <div class="menu-bottom"><span class="price">${money(item.price)}</span><button class="add-btn" data-add="${item.id}">+ Add</button></div>
      </div>
    </article>`).join("");
}
document.getElementById("menuGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-add]"); if (!btn) return;
  const id = Number(btn.dataset.add);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++; else cart.push({id, qty:1});
  save(); updateCart();
  btn.textContent = "✓ Added"; setTimeout(() => btn.textContent = "+ Add", 800);
});

const overlay = document.getElementById("cartOverlay");
function openCart(){overlay.classList.add("open"); overlay.setAttribute("aria-hidden","false"); renderCart();}
function closeCart(){overlay.classList.remove("open"); overlay.setAttribute("aria-hidden","true");}
document.getElementById("openCart").onclick = openCart;
document.getElementById("mobileCart").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
overlay.addEventListener("click", e => {if(e.target === overlay) closeCart();});
document.getElementById("browseMenu").onclick = closeCart;

function updateCart(){
  const count = cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("mobileCartCount").textContent = count;
  renderCart();
}
function renderCart(){
  const wrap = document.getElementById("cartItems");
  const panel = document.querySelector(".cart-panel");
  if (!cart.length) {panel.classList.add("no-items"); wrap.innerHTML=""; document.getElementById("cartTotal").textContent="0"; return;}
  panel.classList.remove("no-items");
  let total=0;
  wrap.innerHTML = cart.map(row => {
    const item=SHOP_CONFIG.menu.find(x=>x.id===row.id); if(!item) return "";
    total += item.price*row.qty;
    return `<div class="cart-row">
      <div><strong>${item.name}</strong><small>${money(item.price)} each</small></div>
      <div class="qty"><button data-minus="${item.id}">−</button><strong>${row.qty}</strong><button data-plus="${item.id}">+</button></div>
      <strong>${money(item.price*row.qty)}</strong>
    </div>`;
  }).join("");
  document.getElementById("cartTotal").textContent=total;
}
document.getElementById("cartItems").addEventListener("click", e=>{
  const plus=e.target.closest("[data-plus]"), minus=e.target.closest("[data-minus]");
  const id=Number((plus||minus).dataset[plus?"plus":"minus"]);
  const row=cart.find(x=>x.id===id); if(!row)return;
  if(plus) row.qty++; else row.qty--;
  cart=cart.filter(x=>x.qty>0); save(); updateCart();
});

document.getElementById("checkoutBtn").onclick = () => {
  if (!cart.length) return;
  let total=0;
  const lines=cart.map(row=>{
    const item=SHOP_CONFIG.menu.find(x=>x.id===row.id); total += item.price*row.qty;
    return `${row.qty} × ${item.name} - ${money(item.price*row.qty)}`;
  });
  const text=`Hello ${SHOP_CONFIG.shopName}!%0A%0AI'd like to order:%0A${lines.map(encodeURIComponent).join("%0A")}%0A%0ATotal: ${encodeURIComponent(money(total))}%0A%0APlease confirm my order.`;
  window.open(`https://wa.me/${SHOP_CONFIG.whatsapp}?text=${text}`, "_blank");
};

renderMenu(); updateCart();
