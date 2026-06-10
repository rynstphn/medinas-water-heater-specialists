/* ============================================================
   MEDINA'S WATER HEATER SPECIALISTS — Main Script
   ============================================================ */

/* ── Yelp Reviews data ──────────────────────────────────────────
   Yelp's Fusion API (v3) prohibits displaying review text in
   third-party interfaces per Yelp Developer ToS §8.2.
   Reviews must be curated manually. To add, edit, or remove a
   review, update this array. Cards are rendered into
   #yelp-reviews-grid before the IntersectionObserver runs.
   ────────────────────────────────────────────────────────────── */
const YELP_REVIEWS = [
  {
    stars: 5,
    text: "Paul came out the same day I called. My water heater was leaking and he had it replaced within a few hours. Professional, fast, and fairly priced. Highly recommend!",
    name: "Jessica M.",
    location: "Suisun City, CA",
    date: "Apr 2025"
  },
  {
    stars: 5,
    text: "Best experience I've had with a contractor. Paul was honest about what needed to be fixed and didn't try to upsell me on anything I didn't need. My water heater is working perfectly.",
    name: "Robert T.",
    location: "Fairfield, CA",
    date: "Mar 2025"
  },
  {
    stars: 5,
    text: "Woke up to no hot water on a Monday morning and was stressed. Called Paul and he was at my house by noon. Quick diagnosis, same-day fix. Couldn't be happier with the service.",
    name: "Amanda L.",
    location: "Vacaville, CA",
    date: "Feb 2025"
  },
  {
    stars: 5,
    text: "Paul installed a new tankless water heater for us. He explained all our options, helped us choose the right unit for our family, and the installation was flawless. 10/10.",
    name: "David & Sandra K.",
    location: "Suisun City, CA",
    date: "Jan 2025"
  }
];

/* ── Google Reviews config ──────────────────────────────────────
   SETUP STEPS:
   1. Complete your Google Business Profile: https://business.google.com
   2. Find your Place ID using the Place ID Finder tool in Google Maps Platform docs
   3. Enable the Places API in Google Cloud Console; create a browser-restricted API key
   4. Replace the values below — the fetch scaffold activates automatically
   ────────────────────────────────────────────────────────────── */
const GOOGLE_PLACE_ID = 'YOUR_PLACE_ID_HERE';  // ← paste Place ID
const GOOGLE_API_KEY  = 'YOUR_API_KEY_HERE';   // ← paste restricted API key

/* ── Gooey text morph in hero headline (hero_text.md adaptation) */
(function () {
  const container = document.querySelector('.cycle-wrap');
  if (!container) return;

  const texts        = ['NEED IT.', 'DESERVE IT.', 'CALL PAUL.'];
  const morphTime    = 1.2;  // seconds per morph transition
  const cooldownTime = 2.5;  // seconds to hold each word

  const spans = container.querySelectorAll('.morph-text');
  if (spans.length < 2) return;
  const [span1, span2] = spans;

  let textIndex = texts.length - 1;
  let prev      = performance.now();
  let morph     = 0;
  let cooldown  = cooldownTime;

  const applyMorph = (fraction) => {
    span2.style.filter  = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    span2.style.opacity = String(Math.pow(fraction, 0.4));
    const inv = 1 - fraction;
    span1.style.filter  = `blur(${Math.min(8 / inv - 8, 100)}px)`;
    span1.style.opacity = String(Math.pow(inv, 0.4));
  };

  const doCooldown = () => {
    morph = 0;
    span2.style.filter  = '';
    span2.style.opacity = '1';
    span1.style.filter  = '';
    span1.style.opacity = '0';
  };

  let rafId = null;

  const frame = (now) => {
    const dt            = Math.min((now - prev) / 1000, 0.1);
    prev                = now;
    const wasInCooldown = cooldown > 0;
    cooldown -= dt;

    if (cooldown <= 0) {
      if (wasInCooldown) {
        textIndex         = (textIndex + 1) % texts.length;
        span1.textContent = texts[textIndex];
        span2.textContent = texts[(textIndex + 1) % texts.length];
      }
      morph += dt;
      const fraction = Math.min(morph / morphTime, 1);
      if (fraction >= 1) {
        cooldown = cooldownTime;
        morph    = 0;
        doCooldown();
      } else {
        applyMorph(fraction);
      }
    } else {
      doCooldown();
    }
    rafId = requestAnimationFrame(frame);
  };

  // Pause the loop while the hero is scrolled out of view. The morph is
  // invisible offscreen, so this saves CPU/battery (notably on mobile Safari)
  // with zero change to what's seen. dt is clamped in frame(), so the prev
  // reset on resume keeps the animation seamless.
  const start = () => {
    if (rafId !== null) return;
    prev  = performance.now();
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  };

  // span2 is the visible text on load (doCooldown makes span2 opacity=1)
  span1.textContent = texts[texts.length - 1];
  span2.textContent = texts[0];
  doCooldown();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(container);
  } else {
    start();
  }
})();

/* ── Render Yelp reviews — infinite-scroll two columns ──────── */
(function () {
  const col1 = document.getElementById('reviews-col-1');
  const col2 = document.getElementById('reviews-col-2');
  if (!col1 && !col2) return;

  const renderCard = (r) => `
    <article class="review-card">
      <div class="review-stars" aria-label="${r.stars} stars">${'★'.repeat(r.stars)}</div>
      <blockquote>${r.text}</blockquote>
      <footer class="review-footer">
        <div class="reviewer-avatar">${r.name[0]}</div>
        <div>
          <cite class="reviewer-name">${r.name}</cite>
          <div class="reviewer-meta">
            <span class="yelp-badge">Yelp</span> · ${r.location}${r.date ? ' · ' + r.date : ''}
          </div>
        </div>
      </footer>
    </article>`;

  const half  = Math.ceil(YELP_REVIEWS.length / 2);
  const group1 = YELP_REVIEWS.slice(0, half);
  const group2 = YELP_REVIEWS.slice(half).length
    ? YELP_REVIEWS.slice(half)
    : YELP_REVIEWS; // fallback if fewer than 2 reviews

  // Duplicate each group so the column loops seamlessly at -50%
  if (col1) col1.innerHTML = [...group1, ...group1].map(renderCard).join('');
  if (col2) col2.innerHTML = [...group2, ...group2].map(renderCard).join('');
})();

/* ── Fetch Google reviews (activates when Place ID is configured) */
(function () {
  if (!GOOGLE_PLACE_ID || GOOGLE_PLACE_ID === 'YOUR_PLACE_ID_HERE') return;

  const placeholder = document.getElementById('google-reviews-placeholder');
  const grid        = document.getElementById('google-reviews-grid');

  window._initGoogleReviews = function () {
    const svc = new google.maps.places.PlacesService(document.createElement('div'));
    svc.getDetails(
      { placeId: GOOGLE_PLACE_ID, fields: ['reviews', 'rating'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place.reviews) return;
        if (placeholder) placeholder.hidden = true;
        if (!grid) return;

        grid.hidden = false;
        grid.innerHTML = place.reviews
          .filter(r => r.rating >= 4)
          .slice(0, 4)
          .map(r => `
            <article class="review-card">
              <div class="review-stars" aria-label="${r.rating} stars">${'★'.repeat(r.rating)}</div>
              <blockquote>${r.text}</blockquote>
              <footer class="review-footer">
                <div class="reviewer-avatar">${r.author_name[0]}</div>
                <div>
                  <cite class="reviewer-name">${r.author_name}</cite>
                  <div class="reviewer-meta">
                    <span class="google-badge">Google</span> · ${r.relative_time_description}
                  </div>
                </div>
              </footer>
            </article>
          `).join('');
      }
    );
  };

  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=_initGoogleReviews`;
  s.async = true;
  document.head.appendChild(s);
})();

/* ── Sliding nav pill (menu.md adaptation) ──────────────────── */
(function () {
  const nav  = document.querySelector('.hdr-nav');
  const pill = nav && nav.querySelector('.nav-pill');
  if (!nav || !pill) return;

  const links = nav.querySelectorAll('.nav-link');

  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const navRect  = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      pill.style.left    = (linkRect.left - navRect.left) + 'px';
      pill.style.width   = linkRect.width + 'px';
      pill.style.opacity = '1';
    });
  });

  nav.addEventListener('mouseleave', () => {
    pill.style.opacity = '0';
  });
})();

/* ── Sticky header ─────────────────────────────────────────── */
(function () {
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile menu ────────────────────────────────────────────── */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on any link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
})();

/* ── Smooth scroll (for older Safari) ──────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Scroll-reveal (Intersection Observer) ──────────────────── */
(function () {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
      .forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach(el => io.observe(el));
})();

/* ── Counter animation ──────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const duration = 1800;

  const animate = el => {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const suffix  = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
    const start   = performance.now();

    const step = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.innerHTML   = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(el => io.observe(el));
})();

/* ── FAQ accordion (details/summary) ───────────────────────── */
(function () {
  // Smooth height animation for <details>
  document.querySelectorAll('.faq-item').forEach(details => {
    const summary = details.querySelector('summary');
    const body    = details.querySelector('.faq-body');
    if (!summary || !body) return;

    summary.addEventListener('click', e => {
      e.preventDefault();

      if (details.open) {
        // Close
        const startH = body.scrollHeight;
        body.style.maxHeight = startH + 'px';
        requestAnimationFrame(() => {
          body.style.transition = 'max-height .3s cubic-bezier(.4,0,.2,1), opacity .3s';
          body.style.overflow   = 'hidden';
          body.style.maxHeight  = '0';
          body.style.opacity    = '0';
          body.addEventListener('transitionend', () => {
            details.removeAttribute('open');
            body.style.maxHeight = '';
            body.style.opacity   = '';
            body.style.transition = '';
          }, { once: true });
        });
      } else {
        // Open
        details.setAttribute('open', '');
        body.style.overflow  = 'hidden';
        body.style.maxHeight = '0';
        body.style.opacity   = '0';
        const targetH = body.scrollHeight;
        requestAnimationFrame(() => {
          body.style.transition = 'max-height .35s cubic-bezier(0,0,.2,1), opacity .3s';
          body.style.maxHeight  = targetH + 'px';
          body.style.opacity    = '1';
          body.addEventListener('transitionend', () => {
            body.style.maxHeight  = '';
            body.style.overflow   = '';
            body.style.transition = '';
          }, { once: true });
        });
      }
    });
  });
})();

/* ── Booking form ───────────────────────────────────────────── */
(function () {
  const form    = document.getElementById('booking-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  // Set min date to today
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Submit handler
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });
    if (!valid) {
      form.querySelector('.error')?.focus();
      return;
    }

    const btn     = form.querySelector('.btn-submit');
    const btnTxt  = btn.querySelector('.btn-txt');
    const origTxt = btnTxt.textContent;

    btn.disabled     = true;
    btnTxt.textContent = 'Sending…';

    try {
      const data = new FormData(form);
      const action = form.getAttribute('action');

      // If using Formspree (real endpoint)
      if (!action.includes('YOUR_FORM_ID')) {
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Network response not ok');
      } else {
        // Demo mode: just simulate a delay
        await new Promise(r => setTimeout(r, 800));
      }

      form.hidden = true;
      success.hidden = false;
    } catch {
      btnTxt.textContent = origTxt;
      btn.disabled = false;
      alert('Something went wrong. Please call us directly at (707) 336-2290.');
    }
  });
})();

/* ── Hero scroll-hint hide on scroll ────────────────────────── */
(function () {
  const hint = document.querySelector('.hero-scroll');
  if (!hint) return;
  const hide = () => { if (window.scrollY > 60) hint.style.opacity = '0'; else hint.style.opacity = '1'; };
  window.addEventListener('scroll', hide, { passive: true });
})();

/* ── Active nav link highlight ──────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const headerH = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  ) || 70;

  const onScroll = () => {
    const scrollY = window.scrollY;
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - headerH() - 16) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── Set current year in footer ─────────────────────────────── */
(function () {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── Form field error style injection ───────────────────────── */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .form-group input.error,
    .form-group select.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239,68,68,.15);
    }
    .nav-link.active { color: var(--steel); }
  `;
  document.head.appendChild(style);
})();
