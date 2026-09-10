(function () {
  try {
    var key = window.location.pathname.indexOf('/admin') === 0 ? 'admin-theme' : 'theme';
    var stored = window.localStorage.getItem(key);
    document.documentElement.classList.toggle('dark', stored === 'dark');
  } catch (e) {}
})();