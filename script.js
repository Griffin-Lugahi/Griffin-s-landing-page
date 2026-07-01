//  TOAST 
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = 'show' + (type === 'error' ? ' error' : '');
  toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
}


// EMAIL FORM VALIDATION 
const form = document.getElementById('form');
const emailInput = document.getElementById('email');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    showToast('⚠️ Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  showToast('🎉 Subscribed! Sweet offers are on their way.');
  emailInput.value = '';
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// PROMO BANNER
const promoBanner = document.getElementById('promo-banner');
const promoClose   = document.getElementById('promo-close');

if (sessionStorage.getItem('promoDismissed') === '1') {
  promoBanner.classList.add('hidden');
}

promoClose.addEventListener('click', () => {
  promoBanner.classList.add('hidden');
  sessionStorage.setItem('promoDismissed', '1');
});

// BACK TO TOP
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// CTA BAR — appears once user scrolls past the hero
const ctaBar       = document.getElementById('cta-bar');
const ctaWhatsapp  = document.getElementById('cta-whatsapp');
const heroSection  = document.getElementById('hero');

function updateCtaBar() {
  const heroBtm = heroSection.getBoundingClientRect().bottom;
  ctaBar.classList.toggle('visible', heroBtm < 0);
}
window.addEventListener('scroll', updateCtaBar, { passive: true });
updateCtaBar();

ctaWhatsapp.addEventListener('click', (e) => {
  e.preventDefault();
  const msg = buildWhatsAppMessage();
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

// DARK MODE TOGGLE
const themeToggle = document.getElementById('theme-toggle');
const iconMoon    = document.getElementById('icon-moon');
const iconSun     = document.getElementById('icon-sun');

// Restore saved preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  iconMoon.style.display = 'none';
  iconSun.style.display  = 'block';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');

  iconMoon.style.display = isDark ? 'none'  : 'block';
  iconSun.style.display  = isDark ? 'block' : 'none';

  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// SCROLL REVEAL 
const revealEls = document.querySelectorAll('.feature, .price-card, .testi-card, .about-block, .stat-card, .gallery-item, .faq-item');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));


// ACTIVE NAV ON SCROLL 
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', highlightNav, { passive: true });

function highlightNav() {
  const scrollY = window.scrollY + 130;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}


//  HAMBURGER MENU 
const hamburger = document.getElementById('hamburger');
const navBar    = document.getElementById('nav-bar');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navBar.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navBar.classList.remove('open');
  });
});



// CART + ORDER MODAL
const cartCount     = document.getElementById('cart-count');
const cartBtn        = document.getElementById('cart-btn');
const cartDropdown   = document.getElementById('cart-dropdown');
const cartDropdownClose = document.getElementById('cart-dropdown-close');
const cartItemsList  = document.getElementById('cart-items-list');
const cartTotalEl    = document.getElementById('cart-total');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
const cartClearBtn   = document.getElementById('cart-clear-btn');
const whatsappBtn    = document.getElementById('whatsapp-btn');

const couponInput      = document.getElementById('coupon-input');
const couponApplyBtn   = document.getElementById('coupon-apply-btn');
const couponForm       = document.getElementById('coupon-form');
const couponApplied    = document.getElementById('coupon-applied');
const couponAppliedText = document.getElementById('coupon-applied-text');
const couponRemoveBtn  = document.getElementById('coupon-remove-btn');
const couponErrorEl    = document.getElementById('err-coupon');
const cartSubtotalEl   = document.getElementById('cart-subtotal');
const cartDiscountRow  = document.getElementById('cart-discount-row');
const cartDiscountLabel = document.getElementById('cart-discount-label');
const cartDiscountEl   = document.getElementById('cart-discount');

const overlay     = document.getElementById('modal-overlay');
const step1       = document.getElementById('modal-step-1');
const step2       = document.getElementById('modal-step-2');
const modalTitle  = document.getElementById('modal-title');
const modalPrice  = document.getElementById('modal-price');
const modalBadge  = document.getElementById('modal-badge');

const cart = {};
let pendingItem = null;
let lastOrder = null; // most recently placed order, for the "Track This Order" shortcut
let appliedCoupon = null; // { code, type: 'percent'|'flat', value, label }

// Available coupon codes
const COUPONS = {
  SWEET15: { type: 'percent', value: 15, label: '15% off' },
  WELCOME10: { type: 'percent', value: 10, label: '10% off' },
  SAVE5: { type: 'flat', value: 5, label: '$5 off' },
};

// Minimum delivery date = tomorrow
function setMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('order-date').min = tomorrow.toISOString().split('T')[0];
}

function openModal(name, price) {
  pendingItem = { name, price };
  modalTitle.textContent  = name;
  modalPrice.textContent  = `$${price}`;
  step1.classList.remove('hidden');
  step2.classList.add('hidden');
  clearErrors();
  document.getElementById('order-name').value    = '';
  document.getElementById('order-phone').value   = '';
  document.getElementById('order-address').value = '';
  document.getElementById('order-date').value    = '';
  document.getElementById('order-notes').value   = '';
  setMinDate();
  overlay.classList.add('open');
  setTimeout(() => document.getElementById('order-name').focus(), 250);
}

function closeModal() {
  overlay.classList.remove('open');
  pendingItem = null;
}

function clearErrors() {
  ['name','phone','address','date'].forEach(f => {
    document.getElementById(`err-${f}`).textContent = '';
    document.getElementById(`order-${f}`).classList.remove('invalid');
  });
}

function setError(field, msg) {
  document.getElementById(`err-${field}`).textContent = msg;
  document.getElementById(`order-${field}`).classList.add('invalid');
}

function validateForm() {
  clearErrors();
  let valid = true;
  const name    = document.getElementById('order-name').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const date    = document.getElementById('order-date').value;

  if (!name)                          { setError('name', 'Please enter your full name.'); valid = false; }
  if (!phone)                         { setError('phone', 'Please enter a phone number.'); valid = false; }
  else if (!/^[\d\s\+\-\(\)]{7,}$/.test(phone)) { setError('phone', 'Enter a valid phone number.'); valid = false; }
  if (!address)                       { setError('address', 'Please enter a delivery address.'); valid = false; }
  if (!date)                          { setError('date', 'Please choose a delivery date.'); valid = false; }
  return valid;
}

// Order Now buttons → open modal
document.querySelectorAll('.order-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    openModal(btn.dataset.name, parseInt(btn.dataset.price));
  });
});

// --- Cart dropdown rendering & cart state helpers ---

function cartItemCount() {
  return Object.values(cart).reduce((s, i) => s + i.qty, 0);
}

function updateCartCount() {
  cartCount.textContent = cartItemCount();
}

function bumpCartCount() {
  cartCount.classList.remove('bump');
  void cartCount.offsetWidth;
  cartCount.classList.add('bump');
  setTimeout(() => cartCount.classList.remove('bump'), 300);
}

function syncWhatsAppBadge() {
  whatsappBtn.classList.toggle('has-items', cartItemCount() > 0);
}

function calcSubtotal() {
  return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
}

function calcDiscount(subtotal) {
  if (!appliedCoupon || subtotal <= 0) return 0;
  if (appliedCoupon.type === 'percent') {
    return Math.round(subtotal * (appliedCoupon.value / 100) * 100) / 100;
  }
  return Math.min(appliedCoupon.value, subtotal);
}

function renderCart() {
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartItemsList.innerHTML = `
      <div class="cart-empty">
        <p>🛒</p>
        <p>Your cart is empty</p>
        <p class="cart-empty-sub">Add a cake to get started!</p>
      </div>`;
    cartCheckoutBtn.disabled = true;
  } else {
    cartCheckoutBtn.disabled = false;
    cartItemsList.innerHTML = entries.map(([name, { price, qty }]) => `
      <div class="cart-item" data-name="${name}">
        <div class="cart-item-info">
          <p class="cart-item-name">${name}</p>
          <p class="cart-item-price">$${price} each</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn qty-dec" aria-label="Decrease quantity of ${name}">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn qty-inc" aria-label="Increase quantity of ${name}">+</button>
        </div>
        <span class="cart-item-subtotal">$${price * qty}</span>
        <button class="cart-item-remove" aria-label="Remove ${name} from cart">&times;</button>
      </div>`).join('');
  }

  const subtotal = calcSubtotal();
  const discount  = calcDiscount(subtotal);
  const total     = Math.max(0, subtotal - discount);

  cartSubtotalEl.textContent = `$${subtotal}`;
  cartTotalEl.textContent    = `$${total}`;

  if (appliedCoupon && discount > 0) {
    cartDiscountRow.classList.remove('hidden');
    cartDiscountLabel.textContent = `Discount (${appliedCoupon.code})`;
    cartDiscountEl.textContent = `-$${discount}`;
  } else {
    cartDiscountRow.classList.add('hidden');
  }
}

function addToCart(name, price, qty = 1) {
  if (cart[name]) cart[name].qty += qty;
  else cart[name] = { price, qty };

  updateCartCount();
  bumpCartCount();
  renderCart();
  syncWhatsAppBadge();
}

// Open / close the dropdown
function openCartDropdown() {
  cartDropdown.classList.add('open');
  cartBtn.setAttribute('aria-expanded', 'true');
}

function closeCartDropdown() {
  cartDropdown.classList.remove('open');
  cartBtn.setAttribute('aria-expanded', 'false');
}

cartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (cartDropdown.classList.contains('open')) closeCartDropdown();
  else openCartDropdown();
});

cartDropdownClose.addEventListener('click', closeCartDropdown);

document.addEventListener('click', (e) => {
  if (!cartDropdown.classList.contains('open')) return;
  if (cartDropdown.contains(e.target) || cartBtn.contains(e.target)) return;
  closeCartDropdown();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCartDropdown();
});

// Quantity +/- and remove, via delegation
cartItemsList.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.cart-item');
  if (!itemEl) return;
  const name = itemEl.dataset.name;
  if (!cart[name]) return;

  if (e.target.classList.contains('qty-inc')) {
    cart[name].qty++;
  } else if (e.target.classList.contains('qty-dec')) {
    cart[name].qty--;
    if (cart[name].qty <= 0) delete cart[name];
  } else if (e.target.classList.contains('cart-item-remove')) {
    delete cart[name];
  } else {
    return;
  }

  renderCart();
  updateCartCount();
  syncWhatsAppBadge();
});

cartClearBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0 && !appliedCoupon) return;
  Object.keys(cart).forEach(k => delete cart[k]);
  removeCoupon(false);
  renderCart();
  updateCartCount();
  syncWhatsAppBadge();
  showToast('🗑️ Cart cleared');
});

function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  couponErrorEl.textContent = '';
  couponInput.classList.remove('invalid');

  if (!code) {
    couponErrorEl.textContent = 'Enter a coupon code.';
    couponInput.classList.add('invalid');
    return;
  }
  if (Object.keys(cart).length === 0) {
    couponErrorEl.textContent = 'Add a cake to your cart first.';
    return;
  }

  const coupon = COUPONS[code];
  if (!coupon) {
    couponErrorEl.textContent = 'Invalid or expired coupon code.';
    couponInput.classList.add('invalid');
    showToast('⚠️ That coupon code isn\'t valid.', 'error');
    return;
  }

  appliedCoupon = { code, ...coupon };
  couponInput.value = '';
  couponForm.classList.add('hidden');
  couponApplied.classList.remove('hidden');
  couponAppliedText.textContent = `✅ ${code} applied — ${coupon.label}`;
  renderCart();
  showToast(`🎉 Coupon ${code} applied!`);
}

function removeCoupon(notify = true) {
  appliedCoupon = null;
  couponApplied.classList.add('hidden');
  couponForm.classList.remove('hidden');
  couponErrorEl.textContent = '';
  couponInput.classList.remove('invalid');
  renderCart();
  if (notify) showToast('Coupon removed');
}

couponApplyBtn.addEventListener('click', applyCoupon);
couponInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    applyCoupon();
  }
});
couponRemoveBtn.addEventListener('click', () => removeCoupon(true));

cartCheckoutBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0) return;
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// Submit order form
document.getElementById('modal-submit').addEventListener('click', () => {
  if (!validateForm()) return;

  const name      = document.getElementById('order-name').value.trim();
  const phone     = document.getElementById('order-phone').value.trim();
  const address   = document.getElementById('order-address').value.trim();
  const dateInput = document.getElementById('order-date').value;
  const date      = new Date(dateInput + 'T00:00:00');
  const notes     = document.getElementById('order-notes').value.trim();
  const dateStr   = date.toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Add to cart
  const { name: itemName, price } = pendingItem;
  addToCart(itemName, price);

  // Create a trackable order record
  const orderId = generateOrderId();
  lastOrder = {
    id: orderId,
    cake: itemName,
    price,
    name,
    phone,
    address,
    notes,
    date: dateInput,
    placedAt: Date.now(),
  };
  addOrderRecord(lastOrder);

  // Build confirmation
  document.getElementById('confirm-order-id').textContent = orderId;

  const rows = [
    ['Cake',     itemName],
    ['Price',    `$${price}`],
    ['Name',     name],
    ['Phone',    phone],
    ['Delivery', address],
    ['Date',     dateStr],
  ];
  if (notes) rows.push(['Notes', notes]);

  document.getElementById('confirm-details').innerHTML = rows
    .map(([k, v]) => `<div class="confirm-row"><span>${k}</span><span>${v}</span></div>`)
    .join('');

  // Auto-open a pre-filled WhatsApp confirmation message for this order
  sendOrderWhatsAppConfirmation(lastOrder);

  step1.classList.add('hidden');
  step2.classList.remove('hidden');
});

// Close triggers
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-done').addEventListener('click', () => {
  closeModal();
  showToast(`🎉 Order for "${pendingItem?.name ?? 'your cake'}" confirmed!`);
});
document.getElementById('resend-wa-btn').addEventListener('click', () => {
  if (lastOrder) sendOrderWhatsAppConfirmation(lastOrder);
});
document.getElementById('modal-track-btn').addEventListener('click', () => {
  closeModal();
  if (lastOrder) {
    openTrackModal();
    document.getElementById('track-order-id').value = lastOrder.id;
    lookupOrder(lastOrder.id);
  }
});
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Initial render (empty cart state)
renderCart();
syncWhatsAppBadge();


// WHATSAPP BUTTON
const WA_NUMBER = '254114593974';

function buildWhatsAppMessage() {
  const items = Object.entries(cart);
  if (items.length === 0) {
    return "Hi SweetBite! I'd like to enquire about your cakes.";
  }

  let msg = "Hi SweetBite! I'd like to place an order:\n\n";
  let subtotal = 0;

  items.forEach(([name, { price, qty }]) => {
    const lineTotal = price * qty;
    subtotal += lineTotal;
    msg += `• ${name} x${qty} — $${lineTotal}\n`;
  });

  const discount = calcDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  msg += `\nSubtotal: $${subtotal}`;
  if (appliedCoupon && discount > 0) {
    msg += `\nCoupon (${appliedCoupon.code}): -$${discount}`;
  }
  msg += `\n*Total: $${total}*`;
  msg += "\n\nPlease confirm availability and delivery details. Thank you!";
  return msg;
}

// Builds the order-confirmation WhatsApp message sent right after checkout
// (separate from the cart checkout message above, which can bundle multiple cakes).
function buildOrderWhatsAppMessage(order) {
  const dateStr = order.date
    ? new Date(order.date + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  let msg = "Hi SweetBite! I just placed an order — please confirm:\n\n";
  msg += `Order ID: ${order.id}\n`;
  msg += `Cake: ${order.cake}\n`;
  msg += `Price: $${order.price}\n`;
  msg += `Name: ${order.name}\n`;
  msg += `Phone: ${order.phone}\n`;
  msg += `Delivery: ${order.address}\n`;
  msg += `Date: ${dateStr}\n`;
  if (order.notes) msg += `Notes: ${order.notes}\n`;
  msg += "\nLooking forward to your confirmation. Thank you!";
  return msg;
}

// Opens a pre-filled WhatsApp chat with the shop so the order acts as
// an automatic confirmation message — there's no backend here, so this
// is the closest equivalent to an email/SMS receipt this site can send.
function sendOrderWhatsAppConfirmation(order) {
  if (!order) return;
  const msg = buildOrderWhatsAppMessage(order);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

document.getElementById('whatsapp-btn').addEventListener('click', () => {
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// STICKY HEADER
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.style.background   = 'rgba(255, 248, 244, 1)';
    header.style.boxShadow    = '0 4px 16px rgba(0,0,0,0.12)';
  } else {
    header.style.background   = 'rgba(255, 248, 244, 0.96)';
    header.style.boxShadow    = '0 2px 12px rgba(0,0,0,0.08)';
  }
}, { passive: true });


// GALLERY + LIGHTBOX
const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox      = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightbox-img');
const lightboxCap    = document.getElementById('lightbox-caption');
const lightboxClose  = document.getElementById('lightbox-close');
const lightboxPrev   = document.getElementById('lightbox-prev');
const lightboxNext   = document.getElementById('lightbox-next');

let currentGalleryIndex = 0;

function openLightbox(index) {
  currentGalleryIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
}

function renderLightbox() {
  const item = galleryItems[currentGalleryIndex];
  const img  = item.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCap.textContent = item.dataset.caption || img.alt || '';
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

function showNext(delta) {
  currentGalleryIndex = (currentGalleryIndex + delta + galleryItems.length) % galleryItems.length;
  renderLightbox();
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showNext(-1));
lightboxNext.addEventListener('click', () => showNext(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showNext(-1);
  if (e.key === 'ArrowRight') showNext(1);
});


// FAQ ACCORDION
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  const wrap      = item.querySelector('.faq-answer-wrap');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close any other open item
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer-wrap').style.maxHeight = null;
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      wrap.style.maxHeight = null;
    } else {
      item.classList.add('open');
      wrap.style.maxHeight = wrap.scrollHeight + 'px';
    }
  });
});


// CONTACT FORM
const contactForm    = document.getElementById('contact-form');
const contactSuccess  = document.getElementById('contact-success');

function clearContactErrors() {
  ['contact-name', 'contact-email', 'contact-message'].forEach(id => {
    document.getElementById(`err-${id}`).textContent = '';
    document.getElementById(id).classList.remove('invalid');
  });
}

function setContactError(id, msg) {
  document.getElementById(`err-${id}`).textContent = msg;
  document.getElementById(id).classList.add('invalid');
}

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  clearContactErrors();

  const name    = document.getElementById('contact-name').value.trim();
  const email   = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  let valid = true;

  if (!name)                     { setContactError('contact-name', 'Please enter your name.'); valid = false; }
  if (!email)                    { setContactError('contact-email', 'Please enter your email.'); valid = false; }
  else if (!isValidEmail(email)) { setContactError('contact-email', 'Enter a valid email address.'); valid = false; }
  if (!message)                  { setContactError('contact-message', 'Please write a short message.'); valid = false; }

  if (!valid) return;

  contactForm.classList.add('hidden');
  contactSuccess.classList.remove('hidden');
  showToast('💌 Message sent! We\'ll be in touch soon.');

  setTimeout(() => {
    contactForm.reset();
    contactForm.classList.remove('hidden');
    contactForm.classList.add('hidden');
  }, 4000);
});


// ORDER TRACKING
//
// NOTE: This is a static demo site with no backend, so order status is
// simulated client-side based on elapsed time since the order was placed
// (using short demo timings rather than real kitchen/delivery timings).
// Orders are persisted to localStorage so an order ID can be looked up
// again later, including after a page refresh.

const ORDERS_KEY = 'sweetbite_orders';

// Simulated stage timings (ms elapsed since order placed)
const TRACK_STAGE_KEYS = ['confirmed', 'baking', 'delivery', 'delivered'];
const TRACK_STAGE_THRESHOLDS = [0, 30 * 1000, 90 * 1000, 180 * 1000];
const TRACK_STAGE_MESSAGES = [
  "Your order has been confirmed — we'll start baking soon! 📝",
  "Good news — your cake is in the oven right now! 🧁",
  "Your cake is out for delivery and on its way! 🚚",
  "Delivered! We hope you enjoy every bite. 🎉",
];

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 20)));
}

function generateOrderId() {
  const existing = new Set(getOrders().map(o => o.id));
  let id;
  do {
    id = 'SB-' + (1000 + Math.floor(Math.random() * 9000));
  } while (existing.has(id));
  return id;
}

function addOrderRecord(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}

function findOrder(idStr) {
  const id = idStr.trim().toUpperCase();
  if (!id) return null;
  return getOrders().find(o => o.id.toUpperCase() === id) || null;
}

function getStageIndex(order) {
  const elapsed = Date.now() - order.placedAt;
  let idx = 0;
  TRACK_STAGE_THRESHOLDS.forEach((t, i) => { if (elapsed >= t) idx = i; });
  return idx;
}

function formatOrderDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Tracker modal elements ---
const trackOverlay     = document.getElementById('track-overlay');
const trackStepLookup  = document.getElementById('track-step-lookup');
const trackStepResult  = document.getElementById('track-step-result');
const trackInput       = document.getElementById('track-order-id');
const trackErrorEl     = document.getElementById('err-track-order-id');
const navTrackLink     = document.getElementById('nav-track-link');
let trackerPollInterval = null;

function openTrackModal() {
  trackOverlay.classList.add('open');
  trackStepLookup.classList.remove('hidden');
  trackStepResult.classList.add('hidden');
  trackErrorEl.textContent = '';
  trackInput.classList.remove('invalid');
  setTimeout(() => trackInput.focus(), 250);
}

function closeTrackModal() {
  trackOverlay.classList.remove('open');
  clearInterval(trackerPollInterval);
  trackerPollInterval = null;
}

function renderTracker(order) {
  const stageIndex = getStageIndex(order);

  document.getElementById('track-result-id').textContent = order.id;
  document.getElementById('track-result-cake').textContent = order.cake;
  document.getElementById('track-result-eta').textContent = order.date
    ? `Expected delivery: ${formatOrderDate(order.date)}`
    : '';

  const steps = trackStepResult.querySelectorAll('.tracker-step');
  steps.forEach((stepEl, i) => {
    stepEl.classList.remove('completed', 'active');
    if (i < stageIndex) stepEl.classList.add('completed');
    else if (i === stageIndex) stepEl.classList.add('active');
  });

  const lines = trackStepResult.querySelectorAll('.tracker-line');
  lines.forEach((lineEl, i) => {
    lineEl.classList.toggle('completed', i < stageIndex);
  });

  document.getElementById('tracker-message').textContent = TRACK_STAGE_MESSAGES[stageIndex];

  trackStepLookup.classList.add('hidden');
  trackStepResult.classList.remove('hidden');
}

function startTrackerPolling(order) {
  clearInterval(trackerPollInterval);
  trackerPollInterval = setInterval(() => renderTracker(order), 5000);
}

function lookupOrder(idStr) {
  trackErrorEl.textContent = '';
  trackInput.classList.remove('invalid');

  const id = (idStr || '').trim();
  if (!id) {
    trackErrorEl.textContent = 'Please enter an order ID.';
    trackInput.classList.add('invalid');
    return;
  }

  const order = findOrder(id);
  if (!order) {
    trackErrorEl.textContent = 'No order found with that ID.';
    trackInput.classList.add('invalid');
    showToast('⚠️ Order not found.', 'error');
    return;
  }

  renderTracker(order);
  startTrackerPolling(order);
}

// --- Tracker modal events ---
navTrackLink.addEventListener('click', (e) => {
  e.preventDefault();
  hamburger.classList.remove('open');
  navBar.classList.remove('open');
  trackInput.value = '';
  openTrackModal();
});

document.getElementById('track-close').addEventListener('click', closeTrackModal);
trackOverlay.addEventListener('click', e => { if (e.target === trackOverlay) closeTrackModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTrackModal(); });

document.getElementById('track-lookup-btn').addEventListener('click', () => lookupOrder(trackInput.value));
trackInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    lookupOrder(trackInput.value);
  }
});

document.getElementById('track-another-btn').addEventListener('click', () => {
  clearInterval(trackerPollInterval);
  trackStepResult.classList.add('hidden');
  trackStepLookup.classList.remove('hidden');
  trackInput.value = '';
  trackErrorEl.textContent = '';
  trackInput.classList.remove('invalid');
  setTimeout(() => trackInput.focus(), 150);
});
