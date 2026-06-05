
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


// SCROLL REVEAL 
const revealEls = document.querySelectorAll('.feature, .price-card, .testi-card, .about-block, .stat-card');

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
const cartCount   = document.getElementById('cart-count');
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

// Submit form
document.getElementById('modal-submit').addEventListener('click', () => {
  if (!validateForm()) return;

  const name    = document.getElementById('order-name').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const date    = new Date(document.getElementById('order-date').value + 'T00:00:00');
  const notes   = document.getElementById('order-notes').value.trim();
  const dateStr = date.toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Add to cart tracking
  const { name: itemName, price } = pendingItem;
  if (cart[itemName]) cart[itemName].qty++;
  else cart[itemName] = { price, qty: 1 };

  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = total;
  cartCount.classList.remove('bump');
  void cartCount.offsetWidth;
  cartCount.classList.add('bump');
  setTimeout(() => cartCount.classList.remove('bump'), 300);

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
