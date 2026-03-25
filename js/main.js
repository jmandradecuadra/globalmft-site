/* ======================================================
   FILE: main.js
   FUNCTION: Shared client-side JavaScript for Global MFT
             Handles: favicon injection, header scroll shadow,
             announcement bar, mobile menu, scroll reveal,
             active nav link, tab switcher, stat counters.
   VERSION: 1.1.0
   ====================================================== */

// ── Favicon (inline so it works on any host) ──────────
(function injectFavicon() {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  // Path relative to any page (assets/ is always one level up for sub-pages,
  // same level for root). We use a dynamic path based on location.
  const depth = (window.location.pathname.match(/\//g) || []).length;
  link.href = depth <= 1 ? "assets/favicon.png" : "../assets/favicon.png";
  document.head.appendChild(link);
})();

// ── Header scroll shadow ─────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 50);
    });
  }

  // ── Announcement bar close ────────────────────────
  const closeBtn = document.querySelector(".announce-close");
  const announceBar = document.querySelector(".announce-bar");
  if (closeBtn && announceBar) {
    closeBtn.addEventListener("click", function () {
      announceBar.style.display = "none";
    });
  }

  // ── Mobile menu ───────────────────────────────────
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
      const spans = hamburger.querySelectorAll("span");
      const isOpen = mobileMenu.classList.contains("open");
      if (isOpen) {
        spans[0].style.transform = "rotate(45deg) translate(5px,5px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translate(5px,-5px)";
      } else {
        spans.forEach((s) => {
          s.style.transform = "";
          s.style.opacity = "";
        });
      }
    });
    // Close on nav link click
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        hamburger.querySelectorAll("span").forEach((s) => {
          s.style.transform = "";
          s.style.opacity = "";
        });
      });
    });
  }

  // ── Scroll reveal ─────────────────────────────────
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // ── Active nav link ───────────────────────────────
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    const href = link.getAttribute("href") || "";
    if (
      href.includes(currentPage) ||
      (currentPage === "" && href.includes("index"))
    ) {
      link.classList.add("active");
    }
  });

  // NOTE: Contact form submission is intentionally NOT handled here.
  // The form POSTs natively to the CF Pages Function at /functions/submit,
  // which handles R2 storage, Brevo email, and redirects to ?status=success/error.
  // The success/error display is handled inline in each contact.html page.

  // ── Simple tab switcher ────────────────────────────
  document.querySelectorAll(".tab-nav").forEach(function (nav) {
    nav.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = btn.dataset.tab;
        nav
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const container = btn.closest("section") || document;
        container.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.style.display = panel.id === target ? "" : "none";
        });
      });
    });
  });

  // ── Counter animation for stats ───────────────────
  const counters = document.querySelectorAll(".stat-num[data-target]");
  if (counters.length) {
    const cObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || "";
            const prefix = el.dataset.prefix || "";
            let current = 0;
            const inc = target / 50;
            const timer = setInterval(function () {
              current += inc;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent =
                prefix +
                (Number.isInteger(target)
                  ? Math.round(current)
                  : current.toFixed(1)) +
                suffix;
            }, 30);
            cObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((el) => cObserver.observe(el));
  }
});
