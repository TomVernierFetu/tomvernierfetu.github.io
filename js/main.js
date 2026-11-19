/* ==========================================================================
   Portfolio — Tom Vernier-Fétu
   Script JavaScript léger pour l'interactivité
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. Gestion du Thème Clair / Sombre
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Récupérer le thème sauvegardé ou la préférence système
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

  htmlRoot.setAttribute('data-theme', initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ------------------------------------------------------------------------
  // 2. Menu Mobile Responsive
  // ------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Fermer le menu au clic sur un lien
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. Copie de l'adresse email dans le presse-papier
  // ------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const copyLabel = document.getElementById('copy-label');
  const emailText = document.getElementById('email-text');
  const toast = document.getElementById('toast');

  if (copyBtn && emailText) {
    copyBtn.addEventListener('click', async () => {
      const email = emailText.textContent.trim();
      
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = email;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        // Feedback visuel sur le bouton
        if (copyLabel) copyLabel.textContent = 'Copié !';
        copyBtn.style.borderColor = '#22c55e';
        copyBtn.style.color = '#22c55e';

        // Afficher le toast
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 2500);
        }

        // Remettre le libellé normal après 2 secondes
        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copier';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);

      } catch (err) {
        console.error('Erreur lors de la copie :', err);
      }
    });
  }

});
