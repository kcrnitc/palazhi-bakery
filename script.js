/**
 * Palazhi Bakery — Modern Interactive Engine
 * Handles live bakery hours, 3D tilt physics, touch-swipe carousel,
 * menu category filtering, WhatsApp ordering modal, and scroll UI.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. LIVE OPERATING HOURS STATUS (IST / Cherthala Time)
  // =========================================================================
  function initBakeryStatus() {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (!dot || !text) return;

    function checkHours() {
      // Calculate current Indian Standard Time (UTC + 5:30)
      const now = new Date();
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utcMs + (5.5 * 3600000));
      
      const hour = istTime.getHours();
      const minute = istTime.getMinutes();
      const timeInMinutes = (hour * 60) + minute;

      const openTime = 7 * 60;   // 7:00 AM
      const closeTime = 21 * 60; // 9:00 PM (21:00)

      if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
        dot.classList.remove('closed');
        text.textContent = 'Open Now • Closes at 9:00 PM';
      } else {
        dot.classList.add('closed');
        if (timeInMinutes < openTime) {
          text.textContent = 'Closed Now • Opens today at 7:00 AM';
        } else {
          text.textContent = 'Closed Now • Opens tomorrow at 7:00 AM';
        }
      }
    }

    checkHours();
    setInterval(checkHours, 60000);
  }

  // =========================================================================
  // 2. HERO 3D PERSPECTIVE TILT WITH DAMPING
  // =========================================================================
  function initHeroTilt() {
    const card = document.getElementById('hero-tilt-card');
    if (!card) return;

    // Check if hover is supported (desktops/laptops)
    if (!window.matchMedia('(hover: hover)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;
    let animId = null;

    function animate() {
      if (isHovering || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        // Smooth lerp (linear interpolation)
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        card.style.transform = `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
        animId = requestAnimationFrame(animate);
      } else {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to 1
      const normY = (y / rect.height) * 2 - 1; // -1 to 1

      targetX = normX * 9;  // max 9 deg tilt
      targetY = -normY * 9; // inverted for natural tilt

      isHovering = true;
      if (!animId) animId = requestAnimationFrame(animate);
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
    });
  }

  // =========================================================================
  // 3. HEADER SCROLL EFFECT & MOBILE DRAWER
  // =========================================================================
  function initNavigation() {
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerClose = document.getElementById('drawer-close');

    // Sticky header shadow & blur
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    }, { passive: true });

    // Drawer Open/Close
    function openDrawer() {
      mobileDrawer?.classList.add('active');
      drawerBackdrop?.classList.add('active');
      menuToggle?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      mobileDrawer?.classList.remove('active');
      drawerBackdrop?.classList.remove('active');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    menuToggle?.addEventListener('click', openDrawer);
    drawerClose?.addEventListener('click', closeDrawer);
    drawerBackdrop?.addEventListener('click', closeDrawer);

    // Close drawer when any mobile nav link is clicked
    mobileDrawer?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Active Section Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#site-nav a');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id') || '';
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (currentSectionId && link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  // =========================================================================
  // 4. MENU CATEGORY FILTER
  // =========================================================================
  function initMenuFilter() {
    const pills = document.querySelectorAll('.cat-pill');
    const cards = document.querySelectorAll('.menu-card');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter;

        // Toggle active button
        pills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        // Filter cards with smooth stagger animation
        cards.forEach((card, index) => {
          const cat = card.dataset.category;
          const match = filter === 'all' || cat === filter;

          if (match) {
            card.classList.remove('hidden');
            card.classList.remove('fade-in');
            // Trigger reflow to restart CSS animation
            void card.offsetWidth;
            card.classList.add('fade-in');
            card.style.animationDelay = `${(index % 3) * 0.08}s`;
          } else {
            card.classList.add('hidden');
            card.classList.remove('fade-in');
          }
        });
      });
    });
  }

  // =========================================================================
  // 5. CINEMATIC GALLERY TOUCH SLIDER
  // =========================================================================
  function initGallerySlider() {
    const track = document.getElementById('slider-track');
    const viewport = document.getElementById('slider-viewport');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');
    const progressFill = document.getElementById('slider-progress-fill');

    if (!track || !viewport) return;

    const slides = track.querySelectorAll('.slider-item');
    const total = slides.length;
    let currentIndex = 0;
    const intervalTime = 5500; // 5.5s
    let autoPlayTimer = null;
    let progressStartTime = 0;
    let progressAnimId = null;

    // Build dots
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    function updateDots() {
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + total) % total;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots();
      restartAutoPlay();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    prevBtn?.addEventListener('click', prevSlide);
    nextBtn?.addEventListener('click', nextSlide);

    // Progress Bar Animation
    function startProgress() {
      progressStartTime = performance.now();
      cancelAnimationFrame(progressAnimId);

      function step(now) {
        const elapsed = now - progressStartTime;
        const progress = Math.min((elapsed / intervalTime) * 100, 100);
        if (progressFill) progressFill.style.width = `${progress}%`;

        if (elapsed < intervalTime) {
          progressAnimId = requestAnimationFrame(step);
        }
      }
      progressAnimId = requestAnimationFrame(step);
    }

    function restartAutoPlay() {
      clearInterval(autoPlayTimer);
      startProgress();
      autoPlayTimer = setInterval(nextSlide, intervalTime);
    }

    // Pause on Hover
    viewport.addEventListener('mouseenter', () => {
      clearInterval(autoPlayTimer);
      cancelAnimationFrame(progressAnimId);
    });

    viewport.addEventListener('mouseleave', () => {
      restartAutoPlay();
    });

    // Touch & Swipe Gesture Logic
    let startX = 0;
    let currentDragX = 0;
    let isDragging = false;

    function onTouchStart(e) {
      startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      isDragging = true;
      track.style.transition = 'none';
      clearInterval(autoPlayTimer);
      cancelAnimationFrame(progressAnimId);
    }

    function onTouchMove(e) {
      if (!isDragging) return;
      const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      currentDragX = currentX - startX;
      const currentPercent = -currentIndex * 100;
      const offsetPercent = (currentDragX / viewport.offsetWidth) * 100;
      track.style.transform = `translateX(${currentPercent + offsetPercent}%)`;
    }

    function onTouchEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

      if (currentDragX < -50) {
        nextSlide();
      } else if (currentDragX > 50) {
        prevSlide();
      } else {
        goToSlide(currentIndex);
      }
      currentDragX = 0;
    }

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd);

    viewport.addEventListener('mousedown', onTouchStart);
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('mouseup', onTouchEnd);

    // Keyboard Arrow navigation when gallery is in view
    window.addEventListener('keydown', (e) => {
      const rect = viewport.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    // Start initial autoplay
    restartAutoPlay();
  }

  // =========================================================================
  // 6. WHATSAPP DIRECT ORDER MODAL
  // =========================================================================
  function initOrderModal() {
    const modal = document.getElementById('order-modal');
    const modalClose = document.getElementById('modal-close');
    const modalItemName = document.getElementById('modal-item-name');
    const modalItemSub = document.getElementById('modal-item-sub');
    const orderInputItem = document.getElementById('order-input-item');
    const qtyInput = document.getElementById('order-qty');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const orderNote = document.getElementById('order-note');
    const confirmBtn = document.getElementById('confirm-wa-order');

    if (!modal) return;

    let selectedItem = 'Palazhi Bakery Order';
    let selectedPrice = '';

    function openModal(itemName, itemPrice) {
      selectedItem = itemName || 'Palazhi Bakery Order';
      selectedPrice = itemPrice || '';

      if (modalItemName) {
        modalItemName.textContent = selectedItem;
      }
      if (modalItemSub) {
        modalItemSub.textContent = selectedPrice 
          ? `Selected: ${selectedItem} (${selectedPrice}). Adjust your quantity and message us directly on WhatsApp.`
          : 'Adjust your quantity or note special instructions, then chat with us directly on WhatsApp.';
      }
      if (orderInputItem) orderInputItem.value = selectedItem;
      if (qtyInput) qtyInput.value = 1;
      if (orderNote) orderNote.value = '';

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Attach click listeners to all order buttons
    document.querySelectorAll('.open-order-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemName = btn.dataset.item;
        const itemPrice = btn.dataset.price;
        openModal(itemName, itemPrice);
      });
    });

    modalClose?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Quantity Stepper
    qtyMinus?.addEventListener('click', () => {
      let cur = parseInt(qtyInput?.value || '1', 10);
      if (cur > 1) qtyInput.value = cur - 1;
    });

    qtyPlus?.addEventListener('click', () => {
      let cur = parseInt(qtyInput?.value || '1', 10);
      if (cur < 100) qtyInput.value = cur + 1;
    });

    // Send to WhatsApp
    confirmBtn?.addEventListener('click', () => {
      const qty = qtyInput?.value || '1';
      const notes = orderNote?.value.trim();

      let message = `Hello Palazhi Bakery! 👋\nI would like to place an order enquiry:\n\n`;
      message += `• Item: ${selectedItem}\n`;
      if (selectedPrice) message += `• Price: ${selectedPrice}\n`;
      message += `• Quantity: ${qty}\n`;
      if (notes) message += `• Notes / Preferences: ${notes}\n`;
      message += `\nPlease let me know availability and estimated pickup/delivery time. Thank you!`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/918547317272?text=${encodedMsg}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      closeModal();
    });
  }

  // =========================================================================
  // 7. BACK TO TOP & SCROLL PROGRESS RING
  // =========================================================================
  function initBackToTop() {
    const backBtn = document.getElementById('back-to-top');
    const circle = document.getElementById('progress-circle');
    if (!backBtn || !circle) return;

    const circumference = 2 * Math.PI * 18; // r = 18 => ~113.1
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight > 0) {
        const progress = Math.min(scrollY / scrollHeight, 1);
        const offset = circumference - (progress * circumference);
        circle.style.strokeDashoffset = offset.toString();
      }

      if (scrollY > 350) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }, { passive: true });

    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 8. SCROLL REVEAL OBSERVER
  // =========================================================================
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.feature-card, .menu-card, .info-card, .section-title, .section-tag'
    );

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
      observer.observe(el);
    });
  }

  // =========================================================================
  // INITIALIZE ALL MODULES
  // =========================================================================
  initBakeryStatus();
  initHeroTilt();
  initNavigation();
  initMenuFilter();
  initGallerySlider();
  initOrderModal();
  initBackToTop();
  initScrollReveal();

});
