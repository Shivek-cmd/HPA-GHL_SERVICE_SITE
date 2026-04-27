/* ============================================================
   HAPPY PEOPLE AI — GHL SERVICES LANDING PAGE
   script.js
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // STICKY HEADER
  // ============================================================
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ============================================================
  // MOBILE MENU
  // ============================================================
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 8;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

  // ============================================================
  // HERO CAROUSEL
  // ============================================================
  const slides   = document.querySelectorAll('.hero__slide');
  const dots     = document.querySelectorAll('.hero__dot');
  let current    = 0;
  let carouselTimer;

  function goToSlide(n) {
    slides[current].classList.remove('hero__slide--active');
    dots[current].classList.remove('hero__dot--active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('hero__slide--active');
    dots[current].classList.add('hero__dot--active');
  }

  function startCarousel() {
    carouselTimer = setInterval(() => goToSlide(current + 1), 5000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(carouselTimer);
      goToSlide(i);
      startCarousel();
    });
  });

  if (slides.length > 0) startCarousel();

  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(
        entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
      );
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.max(idx, 0) * 90);
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ============================================================
  // STATS COUNTER ANIMATION
  // ============================================================
  function animateCounter(el, target, isDecimal, suffix, duration) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const val = target * eased;
      el.textContent = isDecimal
        ? val.toFixed(1) + suffix
        : Math.floor(val).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
    }
    requestAnimationFrame(tick);
  }

  let countersRun = false;
  const statsBar  = document.querySelector('.stats-bar');

  const statsObs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || countersRun) return;
    countersRun = true;
    document.querySelectorAll('.stat-item__number[data-target]').forEach(el => {
      animateCounter(el, parseFloat(el.dataset.target), el.dataset.decimal === 'true', el.dataset.suffix || '', 1800);
    });
    statsObs.disconnect();
  }, { threshold: 0.5 });

  if (statsBar) statsObs.observe(statsBar);

  // ============================================================
  // SCROLL SPY
  // ============================================================
  const navLinks = document.querySelectorAll('.nav__link:not(.btn)');
  const sections = document.querySelectorAll('section[id]');

  const spyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.3, rootMargin: '-72px 0px 0px 0px' });

  sections.forEach(s => spyObs.observe(s));

  // ============================================================
  // SERVICES SPLIT PANEL
  // ============================================================
  const spNavItems  = document.querySelectorAll('.sp-nav-item');
  const spDetails   = document.querySelectorAll('.sp-detail');
  const spProgress  = document.querySelector('.sp-progress-fill');
  const spPanel     = document.querySelector('.services-panel');
  let   spActive    = 0;
  let   spTimer     = null;

  function spActivate(n) {
    spNavItems[spActive].classList.remove('sp-nav-item--active');
    spNavItems[spActive].setAttribute('aria-selected', 'false');
    spDetails[spActive].classList.remove('sp-detail--active');
    spActive = (n + spNavItems.length) % spNavItems.length;
    spNavItems[spActive].classList.add('sp-nav-item--active');
    spNavItems[spActive].setAttribute('aria-selected', 'true');
    spDetails[spActive].classList.add('sp-detail--active');
    if (spProgress) {
      spProgress.classList.remove('running');
      void spProgress.offsetWidth;
      spProgress.classList.add('running');
    }
  }

  function spStart() { spTimer = setInterval(() => spActivate(spActive + 1), 6000); }
  function spStop()  { clearInterval(spTimer); spTimer = null; }

  spNavItems.forEach((item, i) => {
    item.addEventListener('click', () => { spStop(); spActivate(i); spStart(); });
  });

  if (spPanel) {
    spPanel.addEventListener('mouseenter', spStop);
    spPanel.addEventListener('mouseleave', () => { if (!spTimer) spStart(); });
  }

  if (spNavItems.length > 0) {
    if (spProgress) spProgress.classList.add('running');
    spStart();
  }

  // ============================================================
  // CONTACT FORM
  // ============================================================
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn  = this.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      const name  = this.querySelector('#name').value.trim();
      const email = this.querySelector('#email').value.trim();
      if (!name || !email) {
        btn.textContent = 'Please fill in your name and email.';
        btn.style.background = '#DC2626';
        btn.style.borderColor = '#DC2626';
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.borderColor = ''; }, 3000);
        return;
      }
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Sent! We\'ll contact you within 24 hours';
        btn.style.background = '#059669';
        btn.style.borderColor = '#059669';
        setTimeout(() => {
          btn.textContent = orig; btn.disabled = false;
          btn.style.background = ''; btn.style.borderColor = '';
          form.reset();
        }, 4500);
      }, 1200);
    });
  }

  // ============================================================
  // SUBSCRIBE FORM
  // ============================================================
  const subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn  = this.querySelector('.subscribe-form__btn');
      const orig = btn.textContent;
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#059669';
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; this.reset(); }, 3000);
    });
  }

})();
