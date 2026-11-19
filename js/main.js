// Gestion du thème clair/sombre avec mémorisation locale
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
});
