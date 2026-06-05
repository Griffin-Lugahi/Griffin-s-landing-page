
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
const revealEls = document.querySelectorAll('.feature, .price-card, .testi-card');

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


// CART — with item tracking
const cartCount = document.getElementById('cart-count');
const cart = {};   // { name: { price, qty } }

document.querySelectorAll('.order-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = parseInt(btn.dataset.price);

    if (cart[name]) {
      cart[name].qty++;
    } else {
      cart[name] = { price, qty: 1 };
    }

    const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = total;

    cartCount.classList.remove('bump');
    void cartCount.offsetWidth;
    cartCount.classList.add('bump');
    setTimeout(() => cartCount.classList.remove('bump'), 300);

    showToast(`🛒 "${name}" ($${price}) added to cart!`);

    // pulse the WhatsApp button when cart has items
    const wa = document.getElementById('whatsapp-btn');
    if (wa) wa.classList.add('has-items');
  });
});


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
