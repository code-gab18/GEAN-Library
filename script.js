/* ═══════════════════════════════════════════════════════════════
   GEAN LIBRARY — script.js
   Handles: nav scroll, mobile menu, search overlay,
            real-time book search, scroll-reveal, collection nav
   ═══════════════════════════════════════════════════════════════ */

/* ── Book database ─────────────────────────────────────────── */
const BOOKS = [
  // Fiction
  { title: "The Da Vinci Code",    category: "Fiction",    cover: "images/fiction1.jpg", page: "collection.html#fiction" },
  { title: "The Book Thief",       category: "Fiction",    cover: "images/fiction2.jpg", page: "collection.html#fiction" },
  { title: "The Grey Wolf",        category: "Fiction",    cover: "images/fiction3.jpg", page: "collection.html#fiction" },
  { title: "Everyday",             category: "Fiction",    cover: "images/fiction4.jpg", page: "collection.html#fiction" },
  // History
  { title: "The History of the Ancient World",            category: "History",    cover: "images/hist1.jpg", page: "collection.html#history" },
  { title: "The Year Civilization Collapsed",             category: "History",    cover: "images/hist2.jpg", page: "collection.html#history" },
  { title: "London: A Fourteenth-Century City",           category: "History",    cover: "images/hist3.jpg", page: "collection.html#history" },
  { title: "The Fall of Roman Britain",                   category: "History",    cover: "images/hist4.jpg", page: "collection.html#history" },
  // Science
  { title: "Rehab Science",             category: "Science",    cover: "images/sci1.jpg", page: "collection.html#science" },
  { title: "The Science of Interstellar",category: "Science",   cover: "images/sci2.jpg", page: "collection.html#science" },
  { title: "The Thousand Earths",        category: "Science",   cover: "images/sci3.jpg", page: "collection.html#science" },
  { title: "Artifact Space",             category: "Science",   cover: "images/sci4.jpg", page: "collection.html#science" },
  // Technology
  { title: "Beyond Everywhere",          category: "Technology", cover: "images/tech1.jpg", page: "collection.html#technology" },
  { title: "Cybercrime and the Darknet", category: "Technology", cover: "images/tech2.jpg", page: "collection.html#technology" },
  { title: "The Change Function",        category: "Technology", cover: "images/tech3.jpg", page: "collection.html#technology" },
  { title: "The Technology Trap",        category: "Technology", cover: "images/tech4.jpg", page: "collection.html#technology" },
  // Reference
  { title: "Roget's International Thesaurus",    category: "Reference", cover: "images/ref1.jpg", page: "collection.html#reference" },
  { title: "Handbook of Mathematical Functions", category: "Reference", cover: "images/ref2.jpg", page: "collection.html#reference" },
  { title: "The Merck Manual",                   category: "Reference", cover: "images/ref3.jpg", page: "collection.html#reference" },
  { title: "Africana",                           category: "Reference", cover: "images/ref4.jpg", page: "collection.html#reference" },
];

/* ── Category colour map for search results ─────────────────── */
const CAT_COLOR = {
  Fiction:    "#6e8efb",
  History:    "#f6a74b",
  Science:    "#4ecdc4",
  Technology: "#a29bfe",
  Reference:  "#c89040",
};

/* ════════════════════════════════════════════════════════════════
   1. NAV — stick on scroll
   ════════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("stuck", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ════════════════════════════════════════════════════════════════
   2. MOBILE HAMBURGER MENU
   ════════════════════════════════════════════════════════════════ */
(function initBurger() {
  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  if (!burger || !drawer) return;

  burger.addEventListener("click", () => {
    const open = burger.classList.toggle("open");
    drawer.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  // Close when any drawer link is clicked
  drawer.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      drawer.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
})();

/* ════════════════════════════════════════════════════════════════
   3. SEARCH OVERLAY
   ════════════════════════════════════════════════════════════════ */
(function initSearch() {
  const overlay   = document.getElementById("searchOverlay");
  const openBtn   = document.getElementById("navSearchBtn");
  const closeBtn  = document.getElementById("searchCloseBtn");
  const input     = document.getElementById("searchInput");
  const results   = document.getElementById("searchResults");

  if (!overlay) return;

  /* Open */
  function openSearch() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => input?.focus(), 120);
  }

  /* Close */
  function closeSearch() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (input) { input.value = ""; }
    if (results) { results.innerHTML = ""; }
  }

  openBtn?.addEventListener("click", openSearch);
  closeBtn?.addEventListener("click", closeSearch);

  // Click outside search-box closes overlay
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });

  // Keyboard: Escape closes, Ctrl+K opens
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
  });

  /* ── Real-time search ──────────────────────────────────────── */
  let debounceTimer;

  input?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(input.value.trim()), 90);
  });

  function performSearch(query) {
    if (!results) return;

    if (!query) {
      results.innerHTML = "";
      return;
    }

    const q = query.toLowerCase();

    // Filter: title OR category contains query
    const matches = BOOKS.filter(
      b => b.title.toLowerCase().includes(q) ||
           b.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">No results for "<em>${escHtml(query)}</em>"</div>`;
      return;
    }

    results.innerHTML = matches
      .map((book, i) => buildResultItem(book, i, q))
      .join("");

    // Navigate on click
    results.querySelectorAll(".sr-item").forEach(item => {
      item.addEventListener("click", () => {
        const href = item.dataset.href;
        if (href) {
          closeSearch();
          window.location.href = href;
        }
      });
    });
  }

  /* Build one result row */
  function buildResultItem(book, idx, query) {
    const highlightedTitle = highlight(escHtml(book.title), query);
    const delay = Math.min(idx * 0.04, 0.3);
    const catColor = CAT_COLOR[book.category] || "#c89040";

    return `
      <div class="sr-item" data-href="${book.page}" style="animation-delay:${delay}s" role="button" tabindex="0">
        <div class="sr-cover" style="background:${catColor}20; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
          ${categoryIcon(book.category)}
        </div>
        <div class="sr-info">
          <div class="sr-title">${highlightedTitle}</div>
          <div class="sr-cat">${escHtml(book.category)}</div>
        </div>
        <span class="sr-arrow">→</span>
      </div>`;
  }

  /* Highlight matching substring */
  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${escRegex(query)})`, "gi");
    return text.replace(re, `<mark style="background:rgba(200,144,64,.35);color:#f2d898;border-radius:2px;">$1</mark>`);
  }

  function escHtml(str) {
    return str.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function escRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function categoryIcon(cat) {
    return { Fiction:"📖", History:"🏛️", Science:"🔬", Technology:"💻", Reference:"📚" }[cat] || "📕";
  }

  // Keyboard nav inside results
  results?.addEventListener("keydown", (e) => {
    const items = [...results.querySelectorAll(".sr-item")];
    const idx   = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(idx+1, items.length-1)]?.focus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); items[Math.max(idx-1, 0)]?.focus(); }
    if (e.key === "Enter" && idx > -1) items[idx].click();
  });
})();

/* ════════════════════════════════════════════════════════════════
   4. SCROLL-REVEAL
   ════════════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  els.forEach(el => obs.observe(el));
})();

/* ════════════════════════════════════════════════════════════════
   5. COLLECTION PAGE — Category nav scroll-to
   ════════════════════════════════════════════════════════════════ */
(function initColNav() {
  const btns = document.querySelectorAll(".col-btn");
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;

      // Update active state
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Scroll with offset for sticky navs
      const offset = 130;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // Highlight active section on scroll
  const sections = [...btns].map(b => document.getElementById(b.dataset.target)).filter(Boolean);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const id = en.target.id;
        btns.forEach(b => b.classList.toggle("active", b.dataset.target === id));
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach(s => obs.observe(s));
})();

/* ════════════════════════════════════════════════════════════════
   6. ADD-TO-COLLECTION buttons (local storage wishlist)
   ════════════════════════════════════════════════════════════════ */
(function initWishlist() {
  const KEY = "gean_wishlist";

  function getList() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function saveList(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;

    const card  = btn.closest(".book-card");
    const title = card?.querySelector(".book-title")?.textContent?.trim() || "Unknown";
    const cat   = card?.querySelector(".book-cat")?.textContent?.trim()   || "";

    const list = getList();
    const exists = list.some(b => b.title === title);

    if (!exists) {
      list.push({ title, cat, addedAt: Date.now() });
      saveList(list);
      flashBtn(btn, "✓ Added");
    } else {
      flashBtn(btn, "Already saved");
    }
  });

  function flashBtn(btn, msg) {
    const orig = btn.textContent;
    btn.textContent = msg;
    btn.style.background = "rgba(200,144,64,.5)";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
    }, 1600);
  }
})();

/* ════════════════════════════════════════════════════════════════
   7. HERO PARALLAX (subtle, performance-safe)
   ════════════════════════════════════════════════════════════════ */
(function initParallax() {
  const radial = document.querySelector(".hero-radial");
  const radial2 = document.querySelector(".hero-radial-2");
  if (!radial) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      radial.style.transform  = `scale(1) translateY(${y * 0.12}px)`;
      radial2.style.transform = `scale(1) translateY(${y * 0.08}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════════════
   8. PAGE TRANSITION (subtle fade-in on load)
   ════════════════════════════════════════════════════════════════ */
(function initPageFade() {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.45s ease";
  window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => { document.body.style.opacity = "1"; });
  });
  // If DOMContentLoaded already fired
  if (document.readyState !== "loading") {
    requestAnimationFrame(() => { document.body.style.opacity = "1"; });
  }
})();

/* ════════════════════════════════════════════════════════════════
   9. ACTIVE NAV LINK — highlight current page
   ════════════════════════════════════════════════════════════════ */
(function setActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .nav-drawer a").forEach(a => {
    const href = a.getAttribute("href")?.split("/").pop() || "";
    if (href === page) a.classList.add("active");
  });
})();

/* ════════════════════════════════════════════════════════════════
   10. COUNTER ANIMATION — hero stats
   ════════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el  = en.target;
      const end = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      let start = 0;
      const step = Math.ceil(end / 55);
      const tick = setInterval(() => {
        start = Math.min(start + step, end);
        el.textContent = start.toLocaleString() + suffix;
        if (start >= end) clearInterval(tick);
      }, 22);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ═══════════════════════════════════════════════════════
   POLICY ACCORDION (optional interactive feature)
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll(".policy-block h3").forEach(title => {
  title.addEventListener("click", () => {
    const parent = title.parentElement;
    parent.classList.toggle("open");
  });
});