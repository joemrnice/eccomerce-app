/**
 * Initialize homepage interactions, animations, and state sync.
 */
const App = (() => {
  const state = {
    testimonialIndex: 0,
    testimonialTimer: null,
    countdownTarget: null,
  };

  /**
   * Safely parse JSON from localStorage.
   * @param {string} key
   * @param {any} fallback
   * @returns {any}
   */
  const loadStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  /**
   * Format a number with leading zero.
   * @param {number} value
   * @returns {string}
   */
  const pad = (value) => String(value).padStart(2, "0");

  /**
   * Update cart and wishlist badges.
   */
  const syncBadges = () => {
    const cart = loadStorage("veloura-cart", []);
    const wishlist = loadStorage("veloura-wishlist", []);
    const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const wishlistCount = wishlist.length;
    const cartBadge = document.querySelector("#cart-count");
    const wishlistBadge = document.querySelector("#wishlist-count");
    if (cartBadge) cartBadge.textContent = cartCount;
    if (wishlistBadge) wishlistBadge.textContent = wishlistCount;
  };

  /**
   * Apply the theme preference.
   */
  const initTheme = () => {
    const toggle = document.querySelector("#theme-toggle");
    const stored = localStorage.getItem("veloura-theme");
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const theme = stored || system;
    document.documentElement.setAttribute("data-theme", theme);
    if (toggle) toggle.textContent = theme === "dark" ? "Light" : "Dark";

    toggle?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("veloura-theme", next);
      toggle.textContent = next === "dark" ? "Light" : "Dark";
    });
  };

  /**
   * Animate hero headline words.
   */
  const initHeadlineSplit = () => {
    const title = document.querySelector("[data-split='words']");
    if (!title) return;
    const words = title.textContent.trim().split(" ");
    title.textContent = "";
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.textContent = `${word} `;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(12px)";
      span.style.transition = `opacity 500ms ease ${index * 80}ms, transform 500ms ease ${index * 80}ms`;
      title.appendChild(span);
      requestAnimationFrame(() => {
        span.style.opacity = "1";
        span.style.transform = "translateY(0)";
      });
    });
  };

  /**
   * Scroll-based parallax effect for hero background.
   */
  const initParallax = () => {
    const heroBg = document.querySelector(".hero-bg");
    if (!heroBg) return;
    window.addEventListener("scroll", () => {
      const offset = window.scrollY * 0.2;
      heroBg.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  /**
   * Reveal elements on scroll.
   */
  const initReveal = () => {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );
    items.forEach((item) => observer.observe(item));
  };

  /**
   * Initialize tabs in trending section.
   */
  const initTabs = () => {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((btn) => btn.classList.toggle("is-active", btn === tab));
        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.dataset.panel === target);
        });
      });
    });
  };

  /**
   * Initialize promo countdown.
   */
  const initCountdown = () => {
    const daysEl = document.querySelector("#days");
    if (!daysEl) return;
    const now = new Date();
    state.countdownTarget = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const tick = () => {
      const diff = state.countdownTarget - new Date();
      if (diff <= 0) {
        state.countdownTarget = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      }
      const remaining = state.countdownTarget - new Date();
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      document.querySelector("#days").textContent = pad(days);
      document.querySelector("#hours").textContent = pad(hours);
      document.querySelector("#minutes").textContent = pad(minutes);
      document.querySelector("#seconds").textContent = pad(seconds);
    };

    tick();
    setInterval(tick, 1000);
  };

  /**
   * Initialize testimonial slider with autoplay.
   */
  const initTestimonials = () => {
    const track = document.querySelector("#testimonial-track");
    const dots = document.querySelector("#testimonial-dots");
    if (!track || !dots) return;
    const slides = Array.from(track.children);
    dots.innerHTML = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      dot.addEventListener("click", () => goToSlide(index));
      dots.appendChild(dot);
    });

    const update = () => {
      track.style.transform = `translateX(-${state.testimonialIndex * 100}%)`;
      dots.querySelectorAll(".dot").forEach((dot, idx) => {
        dot.classList.toggle("is-active", idx === state.testimonialIndex);
      });
    };

    const goToSlide = (index) => {
      state.testimonialIndex = (index + slides.length) % slides.length;
      update();
    };

    const next = () => goToSlide(state.testimonialIndex + 1);

    document.querySelector("#prev-testimonial")?.addEventListener("click", () =>
      goToSlide(state.testimonialIndex - 1)
    );
    document.querySelector("#next-testimonial")?.addEventListener("click", next);

    state.testimonialTimer = setInterval(next, 5000);
    update();
  };

  /**
   * Back to top button.
   */
  const initBackToTop = () => {
    const button = document.querySelector("#back-to-top");
    if (!button) return;
    window.addEventListener("scroll", () => {
      button.classList.toggle("is-visible", window.scrollY > 400);
    });
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  /**
   * Fake loading skeleton for arrivals.
   */
  const initArrivalSkeleton = () => {
    const track = document.querySelector("#arrival-track");
    if (!track) return;
    setTimeout(() => {
      track.classList.remove("is-loading");
    }, 1200);
  };

  const init = () => {
    syncBadges();
    initTheme();
    initHeadlineSplit();
    initParallax();
    initReveal();
    initTabs();
    initCountdown();
    initTestimonials();
    initBackToTop();
    initArrivalSkeleton();
  };

  return { init };
})();

window.addEventListener("DOMContentLoaded", App.init);