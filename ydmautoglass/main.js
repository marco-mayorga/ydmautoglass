// Language toggle
const btn = document.getElementById('langSwitch');
if (btn) {
  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('lang-es');
    // persist choice
    localStorage.setItem('lang', document.documentElement.classList.contains('lang-es') ? 'es' : 'en');
  });
  // load persisted choice
  const saved = localStorage.getItem('lang');
  if (saved === 'en') document.documentElement.classList.remove('lang-es');
}
// Year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();