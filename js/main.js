/*
  js/main.js
  Consolidated site scripts: theme toggle, animations, counters,
  portfolio filter, and contact form handling.
*/

// -------- Theme handling (shared across pages) --------
function updateThemeButtons(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    // Update visible label for sighted users
    btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    // Update aria-pressed for assistive tech (true when dark theme is active)
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeButtons(theme);
}

function initializeTheme() {
  const saved = localStorage.getItem('theme');
  const preferred = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(preferred);
}

// Attach toggle listeners to any .theme-toggle buttons
function setupThemeToggles() {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    // Ensure initial aria-pressed state reflects current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    btn.setAttribute('aria-pressed', currentTheme === 'dark' ? 'true' : 'false');

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  });

  // Respond to system changes only when user hasn't set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }
}

// -------- Skip-link behavior --------
// When a skip-link is activated, move focus to the target main element.
function setupSkipLinks() {
  document.querySelectorAll('.skip-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // href is like '#main'
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        // Make target focusable, move focus, then remove tabindex later
        target.setAttribute('tabindex', '-1');
        target.focus();
        window.setTimeout(() => { target.removeAttribute('tabindex'); }, 1000);
      }
    });
  });
}

// -------- Mobile menu toggle --------
function setupMenuToggle() {
  const menuBtn = document.getElementById('menuToggle');
  const nav = document.getElementById('primary-nav');
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when resizing to large screens
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav.classList.contains('open')) {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// -------- Scroll animations & counters --------
// Generic animation observer: elements with classes 'fade-in-*' will animate when visible.
function setupAnimationObserver() {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Make element visible and trigger any CSS animation defined.
      entry.target.style.opacity = '1';
      const anim = getComputedStyle(entry.target).animation;
      if (anim && anim !== 'none') entry.target.style.animation = anim;

      // If the element is a stat number, animate the count
      if (entry.target.classList.contains('stat-number')) animateNumber(entry.target);

      obs.unobserve(entry.target);
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up, .fade-in-down, .fade-in-left, .fade-in-right').forEach(el => {
    // Start hidden so the fade-in works
    el.style.opacity = el.style.opacity || '0';
    observer.observe(el);
  });
}

// Smooth numeric counter for elements with `data-target`
function animateNumber(element) {
  const target = parseInt(element.getAttribute('data-target')) || 0;
  const duration = 2000; // ms
  const startTime = performance.now();
  const start = 0;

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    element.textContent = value;
    if (progress < 1) requestAnimationFrame(tick);
    else element.textContent = target; // ensure exact final value
  }

  requestAnimationFrame(tick);
}

// -------- Portfolio filter (only runs on portfolio pages) --------
function setupPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = btn.getAttribute('data-filter');
      items.forEach(item => {
        const match = (val === 'all') || (item.getAttribute('data-category') === val);
        item.style.display = match ? 'block' : 'none';
        item.style.opacity = match ? '1' : '0';
      });
    });
  });
}

// -------- Contact form handling (only runs on contact page) --------
function setupContactForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const phoneInput = document.getElementById('phoneInput');
  const serviceInput = document.getElementById('serviceInput');
  const messageInput = document.getElementById('messageInput');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');
  const serviceError = document.getElementById('serviceError');
  const messageError = document.getElementById('messageError');

  const pName = document.getElementById('pName');
  const pEmail = document.getElementById('pEmail');
  const pService = document.getElementById('pService');
  const pMessage = document.getElementById('pMessage');
  const successMessage = document.getElementById('successMessage');

  // Live preview updates
  if (nameInput) nameInput.addEventListener('input', () => { pName.textContent = nameInput.value || '---'; });
  if (emailInput) emailInput.addEventListener('input', () => { pEmail.textContent = emailInput.value || '---'; });
  if (serviceInput) serviceInput.addEventListener('change', () => { pService.textContent = serviceInput.value || '---'; });
  if (messageInput) messageInput.addEventListener('input', () => {
    const preview = messageInput.value.substring(0, 50);
    pMessage.textContent = preview ? preview + (messageInput.value.length > 50 ? '...' : '') : '---';
  });

  // Form validation & fake submission (client-side only)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    [nameError, emailError, phoneError, serviceError, messageError].forEach(el => { if (el) el.classList.remove('show'); });

    let valid = true;

    if (nameInput && nameInput.value.trim() === '') {
      nameError.textContent = 'Name is required'; nameError.classList.add('show'); valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailPattern.test(emailInput.value)) {
      emailError.textContent = 'Please enter a valid email'; emailError.classList.add('show'); valid = false;
    }

    if (phoneInput && phoneInput.value && phoneInput.value.length < 10) {
      phoneError.textContent = 'Please enter a valid phone number'; phoneError.classList.add('show'); valid = false;
    }

    if (serviceInput && serviceInput.value === '') {
      serviceError.textContent = 'Please select a service'; serviceError.classList.add('show'); valid = false;
    }

    if (messageInput && messageInput.value.trim() === '') {
      messageError.textContent = 'Please tell us about your project'; messageError.classList.add('show'); valid = false;
    }

    if (!valid) return;

    // Show success and hide form (client-side only). Replace with API call to send data.
    if (successMessage) successMessage.classList.add('show');
    form.style.display = 'none';

    // Reset after a short delay so user can see confirmation
    setTimeout(() => {
      form.reset();
      form.style.display = 'block';
      if (successMessage) successMessage.classList.remove('show');
      ['pName','pEmail','pService','pMessage'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '---'; });
    }, 3000);
  });
}

// -------- Initialize everything conditionally --------
(function () {
  initializeTheme();
  setupThemeToggles();
  setupAnimationObserver();
  setupPortfolioFilter();
  setupContactForm();
  setupSkipLinks();
  setupMenuToggle();
})();
