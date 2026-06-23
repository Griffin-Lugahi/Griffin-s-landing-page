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

const overlay     = document.getElementById('modal-overlay');
const step1       = document.getElementById('modal-step-1');
const step2       = document.getElementById('modal-step-2');
const modalTitle  = document.getElementById('modal-title');
const modalPrice  = document.getElementById('modal-price');
const modalBadge  = document.getElementById('modal-badge');

const cart = {};
let pendingItem = null;

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

function renderCart() {
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartItemsList.innerHTML = `
      <div class="cart-empty">
        <p>🛒</p>
        <p>Your cart is empty</p>
        <p class="cart-empty-sub">Add a cake to get started!</p>
      </div>`;
    cartTotalEl.textContent = '$0';
    cartCheckoutBtn.disabled = true;
    return;
  }

  cartCheckoutBtn.disabled = false;
  let total = 0;

  cartItemsList.innerHTML = entries.map(([name, { price, qty }]) => {
    total += price * qty;
    return `
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
      </div>`;
  }).join('');

  cartTotalEl.textContent = `$${total}`;
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
  if (Object.keys(cart).length === 0) return;
  Object.keys(cart).forEach(k => delete cart[k]);
  renderCart();
  updateCartCount();
  syncWhatsAppBadge();
  showToast('🗑️ Cart cleared');
});

cartCheckoutBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0) return;
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// Submit order form
document.getElementById('modal-submit').addEventListener('click', () => {
  if (!validateForm()) return;

  const name    = document.getElementById('order-name').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const date    = new Date(document.getElementById('order-date').value + 'T00:00:00');
  const notes   = document.getElementById('order-notes').value.trim();
  const dateStr = date.toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Add to cart
  const { name: itemName, price } = pendingItem;
  addToCart(itemName, price);

  // Build confirmation
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

  step1.classList.add('hidden');
  step2.classList.remove('hidden');
});

// Close triggers
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-done').addEventListener('click', () => {
  closeModal();
  showToast(`🎉 Order for "${pendingItem?.name ?? 'your cake'}" confirmed!`);
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
  let total = 0;

  items.forEach(([name, { price, qty }]) => {
    const subtotal = price * qty;
    total += subtotal;
    msg += `• ${name} x${qty} — $${subtotal}\n`;
  });

  msg += `\n*Total: $${total}*`;
  msg += "\n\nPlease confirm availability and delivery details. Thank you!";
  return msg;
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
