document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu");
  const cvMenu = document.querySelector(".cv-menu");
  const cvTrigger = document.querySelector(".cv-trigger");
  const theme = document.querySelector(".theme-toggle");

  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  const openCV = () => {
    if (!cvMenu) return;
    cvMenu.classList.add("open");
    cvTrigger?.setAttribute("aria-expanded", "true");
  };
  const closeCV = () => {
    if (!cvMenu) return;
    cvMenu.classList.remove("open");
    cvTrigger?.setAttribute("aria-expanded", "false");
  };

  // Desktop: CV opens naturally on hover; keyboard/click remain supported.
  cvMenu?.addEventListener("mouseenter", openCV);
  cvMenu?.addEventListener("mouseleave", closeCV);
  cvTrigger?.addEventListener("focus", openCV);
  cvTrigger?.addEventListener("click", (e) => {
    e.preventDefault();
    cvMenu?.classList.toggle("open");
    cvTrigger?.setAttribute("aria-expanded", String(cvMenu?.classList.contains("open")));
  });

  document.addEventListener("click", (e) => {
    if (cvMenu && !cvMenu.contains(e.target)) closeCV();
  });
  document.querySelectorAll(".cv-pop a").forEach(a => a.addEventListener("click", closeCV));

  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
  const updateThemeLabel = () => {
    const light = document.body.classList.contains("light");
    theme?.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    if (theme) theme.textContent = light ? "☾" : "☀";
  };
  updateThemeLabel();
  theme?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
    updateThemeLabel();
  });
  // Shared project image viewer: click/tap a photo, then use the on-image arrows,
  // keyboard arrows, or a horizontal swipe to move through the gallery.
  const galleryConfigs = [
    { gallery: ".irrigation-gallery", lightbox: "#irrigation-lightbox" },
    { gallery: ".mahabharat-gallery", lightbox: "#mahabharat-lightbox" },
    { gallery: ".tourism-gallery", lightbox: "#tourism-lightbox" },
    { gallery: ".post-fire-gallery", lightbox: "#post-fire-lightbox" }
  ];

  let activeViewer = null;

  const initGalleryViewer = ({gallery, lightbox: lightboxSelector}) => {
    const links = [...document.querySelectorAll(`${gallery} .gallery-link`)];
    const lightbox = document.querySelector(lightboxSelector);
    if (!links.length || !lightbox) return null;

    const img = lightbox.querySelector(".lightbox-figure img");
    const caption = lightbox.querySelector(".lightbox-figure figcaption");
    const prev = lightbox.querySelector(".lightbox-prev");
    const next = lightbox.querySelector(".lightbox-next");
    const close = lightbox.querySelector(".lightbox-close");
    let index = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const show = (nextIndex) => {
      index = (nextIndex + links.length) % links.length;
      const link = links[index];
      img.src = link.href;
      img.alt = link.querySelector("img")?.alt || "";
      if (caption) caption.textContent = link.dataset.caption || link.querySelector("img")?.alt || "";
      lightbox.dataset.index = String(index + 1);
    };

    const open = (nextIndex) => {
      show(nextIndex);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      activeViewer = viewer;
      close?.focus();
    };

    const shut = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (activeViewer === viewer) activeViewer = null;
    };

    const viewer = {
      next: () => show(index + 1),
      prev: () => show(index - 1),
      close: shut,
      isOpen: () => lightbox.classList.contains("open")
    };

    links.forEach((link, linkIndex) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        open(linkIndex);
      });
    });

    prev?.addEventListener("click", (e) => { e.stopPropagation(); viewer.prev(); });
    next?.addEventListener("click", (e) => { e.stopPropagation(); viewer.next(); });
    close?.addEventListener("click", shut);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) shut();
    });

    // Touch/swipe support. Vertical scrolling remains available; a horizontal
    // swipe changes the photo just like the on-image arrow buttons.
    lightbox.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, {passive: true});

    lightbox.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) viewer.next(); else viewer.prev();
    }, {passive: true});

    return viewer;
  };

  galleryConfigs.map(initGalleryViewer).filter(Boolean);

  document.addEventListener("keydown", (e) => {
    if (!activeViewer?.isOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      activeViewer.close();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activeViewer.prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      activeViewer.next();
    }
  });

});
