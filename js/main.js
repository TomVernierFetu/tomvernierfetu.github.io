// Gestion du thème clair/sombre, copie d'email et défilement fluide
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = htmlRoot.getAttribute('data-theme');
      const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(targetTheme);
      localStorage.setItem('theme', targetTheme);
    });
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'mode clair' : 'mode sombre';
    }
  }

  // Copie rapide de l'adresse email sur tous les boutons dédiés
  const copyButtons = document.querySelectorAll('[data-copy-email]');
  copyButtons.forEach((btn) => {
    const originalText = btn.textContent;
    let resetTimer = null;

    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email');
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
        btn.textContent = 'Copié ✓';
        btn.classList.add('is-copied');

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('is-copied');
        }, 2000);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  });

  // Défilement fluide (molette souris + liens d'ancrage) indépendant du taux de rafraîchissement
  htmlRoot.style.scrollBehavior = 'auto';

  let targetY = window.scrollY;
  let currentY = window.scrollY;
  let isAnimating = false;
  let lockScrollSpy = false;
  let lastFrameTime = 0;

  const trackedSections = Array.from(document.querySelectorAll('main section[id]'));

  function syncUrlWithSection() {
    if (lockScrollSpy || !trackedSections.length) return;

    let activeHash = '';
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24;

    if (atBottom) {
      activeHash = `#${trackedSections[trackedSections.length - 1].id}`;
    } else if (window.scrollY >= 160) {
      const triggerLine = window.innerHeight * 0.32;
      for (const sec of trackedSections) {
        if (sec.getBoundingClientRect().top <= triggerLine) {
          activeHash = `#${sec.id}`;
        }
      }
    }

    if (window.location.hash !== activeHash) {
      const nextUrl = activeHash || (window.location.pathname + window.location.search);
      history.replaceState(null, '', nextUrl);
    }
  }

  function getMaxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clampScroll(value) {
    return Math.max(0, Math.min(value, getMaxScroll()));
  }

  function animateScroll(timestamp) {
    if (!isAnimating) return;

    const dt = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.05) : 0.016;
    lastFrameTime = timestamp;

    const diff = targetY - currentY;
    if (Math.abs(diff) < 0.5) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      isAnimating = false;
      lockScrollSpy = false;
      lastFrameTime = 0;
      syncUrlWithSection();
      return;
    }

    // Facteur d'inertie constant sur écrans 60Hz, 120Hz et 144Hz
    const easeFactor = 1 - Math.exp(-9.5 * dt);
    currentY += diff * easeFactor;
    window.scrollTo(0, currentY);
    requestAnimationFrame(animateScroll);
  }

  function startAnimation() {
    if (!isAnimating) {
      isAnimating = true;
      lastFrameTime = 0;
      requestAnimationFrame(animateScroll);
    }
  }

  const previewModal = document.getElementById('preview-modal');

  // Lissage de la molette (compatible Chrome, Edge et Firefox)
  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey || (previewModal && !previewModal.hidden) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    lockScrollSpy = false;

    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 36;
    else if (event.deltaMode === 2) delta *= window.innerHeight;

    if (!isAnimating) {
      currentY = window.scrollY;
      targetY = window.scrollY;
    }

    targetY = clampScroll(targetY + delta);
    startAnimation();
  }, { passive: false });

  // Arrêt immédiat si l'utilisateur manipule la barre, le tactile ou le clavier
  ['mousedown', 'touchstart', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, () => {
      if (isAnimating) {
        isAnimating = false;
        lockScrollSpy = false;
        lastFrameTime = 0;
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
    }, { passive: true });
  });

  window.addEventListener('scroll', () => {
    if (!isAnimating) {
      currentY = window.scrollY;
      targetY = window.scrollY;
    }
    syncUrlWithSection();
  }, { passive: true });

  // Glissement fluide vers les sections sur clic d'un lien d'ancrage (#section)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      const offset = 32;
      const destination = targetEl.getBoundingClientRect().top + window.scrollY - offset;

      lockScrollSpy = true;
      currentY = window.scrollY;
      targetY = clampScroll(destination);
      startAnimation();

      history.replaceState(null, '', targetId);
    });
  });

  // Mise à l'échelle des aperçus miniatures dans les cartes projets
  function scaleProjectPreviews() {
    document.querySelectorAll('.preview-viewport').forEach((viewport) => {
      const iframe = viewport.querySelector('iframe');
      if (!iframe) return;
      const scale = viewport.clientWidth / 1200;
      iframe.style.transform = `scale(${scale})`;
    });
  }

  scaleProjectPreviews();
  window.addEventListener('load', scaleProjectPreviews);
  window.addEventListener('resize', scaleProjectPreviews);

  // Modale d'aperçu interactif des sites hébergés
  const modalIframe = document.getElementById('preview-modal-iframe');
  const modalTitle = document.getElementById('preview-modal-title');
  const modalExternal = document.getElementById('preview-modal-external');

  function openPreviewModal(url, title, embedOnly) {
    if (!previewModal || !modalIframe) return;
    modalIframe.src = url;
    if (modalTitle) modalTitle.textContent = title || 'Aperçu en direct';
    if (modalExternal) {
      modalExternal.href = url;
      modalExternal.hidden = Boolean(embedOnly);
    }
    previewModal.hidden = false;
    previewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePreviewModal() {
    if (!previewModal || !modalIframe || previewModal.hidden) return;
    previewModal.hidden = true;
    previewModal.setAttribute('aria-hidden', 'true');
    modalIframe.src = 'about:blank';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-preview-url]').forEach((trigger) => {
    const launchPreview = () => {
      const url = trigger.getAttribute('data-preview-url');
      const title = trigger.getAttribute('data-preview-title');
      const embedOnly = trigger.getAttribute('data-preview-embed-only') === 'true';
      if (url) openPreviewModal(url, title, embedOnly);
    };

    trigger.addEventListener('click', launchPreview);
    if (trigger.tagName !== 'BUTTON' && trigger.tagName !== 'A') {
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          launchPreview();
        }
      });
    }
  });

  document.querySelectorAll('[data-close-preview]').forEach((closer) => {
    closer.addEventListener('click', closePreviewModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePreviewModal();
  });
});
