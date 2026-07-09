/* ==========================================================================
   MOTHER MARY PUBLIC SCHOOL — MAIN SCRIPT
   Vanilla JS only. Handles: page loader, theme toggle, mobile nav,
   scroll progress bar, back-to-top, hero slider, gallery preview,
   testimonials slider, animated counters, scroll-reveal (AOS-like),
   ripple buttons, contact form, gallery page filters + lightbox.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ----------
     Hides shortly after the DOM itself is ready rather than waiting on
     window.load, so slow/blocked images (fonts, placeholder photos, etc.)
     never leave the loader stuck on screen. A hard-cap timeout is also
     set as a safety net in case something else goes wrong. */
  const loader = document.querySelector('.page-loader');
  const hideLoader = () => loader && loader.classList.add('hidden');
  setTimeout(hideLoader, 500);
  window.addEventListener('load', hideLoader);

  /* ---------- Theme toggle (dark/light) ---------- */
  const root = document.documentElement;
  const themeBtn = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('mmps-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  const syncThemeIcon = () => {
    if (!themeBtn) return;
    themeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  };
  syncThemeIcon();
  themeBtn && themeBtn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('mmps-theme', isDark ? 'light' : 'dark');
    syncThemeIcon();
  });

  /* ---------- Sticky navbar shadow + active link ---------- */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle && navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks && navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.querySelector('.progress-bar');
  window.addEventListener('scroll', () => {
    if (!progressBar) return;
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    backToTop && backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop && backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Ripple buttons ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Scroll reveal (AOS-like) ---------- */
  const revealEls = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-aos-delay') || 0;
          setTimeout(() => entry.target.classList.add('aos-in'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('aos-in'));
  }

  /* ---------- Hero slider ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDotsWrap = document.querySelector('.hero-dots');
  let heroIndex = 0;
  let heroTimer;
  if (heroSlides.length) {
    heroSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => showHeroSlide(i));
      heroDotsWrap && heroDotsWrap.appendChild(dot);
    });
  }
  function showHeroSlide(i) {
    heroSlides.forEach(s => s.classList.remove('active'));
    heroSlides[i].classList.add('active');
    if (heroDotsWrap) {
      [...heroDotsWrap.children].forEach((d, di) => d.classList.toggle('active', di === i));
    }
    heroIndex = i;
  }
  function nextHero() { showHeroSlide((heroIndex + 1) % heroSlides.length); }
  function prevHero() { showHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length); }
  function startHeroAuto() { heroTimer = setInterval(nextHero, 4000); }
  if (heroSlides.length) startHeroAuto();
  document.querySelector('.hero-next') && document.querySelector('.hero-next').addEventListener('click', () => { nextHero(); clearInterval(heroTimer); startHeroAuto(); });
  document.querySelector('.hero-prev') && document.querySelector('.hero-prev').addEventListener('click', () => { prevHero(); clearInterval(heroTimer); startHeroAuto(); });

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 80));
    const tick = () => {
      cur += step;
      if (cur >= target) { el.textContent = target + suffix; return; }
      el.textContent = cur + suffix;
      requestAnimationFrame(tick);
    };
    tick();
  };
  if (counters.length && 'IntersectionObserver' in window) {
    const cIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target); cIo.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cIo.observe(c));
  }

  /* ---------- Testimonials slider ---------- */
  const tTrack = document.querySelector('.testimonial-track');
  const tDotsWrap = document.querySelector('.testimonial-dots');
  if (tTrack) {
    const cards = tTrack.children;
    let tIndex = 0;
    [...cards].forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showTestimonial(i));
      tDotsWrap && tDotsWrap.appendChild(dot);
    });
    function showTestimonial(i) {
      tIndex = i;
      tTrack.style.transform = `translateX(-${i * 100}%)`;
      if (tDotsWrap) [...tDotsWrap.children].forEach((d, di) => d.classList.toggle('active', di === i));
    }
    setInterval(() => showTestimonial((tIndex + 1) % cards.length), 5000);
  }

  /* ---------- Ticker duplication for seamless loop ---------- */
  const tickerTrack = document.querySelector('.ticker-track');
  if (tickerTrack && !tickerTrack.dataset.cloned) {
    tickerTrack.innerHTML += tickerTrack.innerHTML;
    tickerTrack.dataset.cloned = 'true';
  }

  /* ---------- Contact form (frontend-only) ---------- */
  const contactForm = document.querySelector('.contact-form');
  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = contactForm.querySelector('.form-msg');
    msg.textContent = 'Thank you! Your message has been received — our office will get back to you shortly.';
    msg.classList.add('show', 'success');
    contactForm.reset();
    setTimeout(() => msg.classList.remove('show'), 6000);
  });

  /* ---------- Gallery filter (gallery.html) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      masonryItems.forEach(item => {
        const match = cat === 'all' || item.getAttribute('data-category') === cat;
        item.style.display = match ? 'block' : 'none';
      });
    });
  });

  /* ---------- Lightbox (gallery.html) ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const visibleItems = () => [...masonryItems];
    let lbIndex = 0;
    const openLightbox = (i) => {
      lbIndex = i;
      lbImg.src = masonryItems[i].querySelector('img').src;
      lbImg.alt = masonryItems[i].querySelector('img').alt;
      lightbox.classList.add('open');
    };
    masonryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => openLightbox((lbIndex + 1) % masonryItems.length));
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => openLightbox((lbIndex - 1 + masonryItems.length) % masonryItems.length));
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('open');
      if (e.key === 'ArrowRight') openLightbox((lbIndex + 1) % masonryItems.length);
      if (e.key === 'ArrowLeft') openLightbox((lbIndex - 1 + masonryItems.length) % masonryItems.length);
    });
  }

  /* ---------- Active nav link by current page ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

});
