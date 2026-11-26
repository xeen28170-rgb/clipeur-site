// Bouton de téléchargement : récupère la dernière version publiée dans les Releases GitHub du site.
// Si aucune version n'est publiée, le bouton passe en « Bientôt disponible ».
(function () {
  var API = 'https://api.github.com/repos/xeen28170-rgb/clipeur-site/releases/latest';
  var RELEASES = 'https://github.com/xeen28170-rgb/clipeur-site/releases';
  var btns = [document.getElementById('dl-btn'), document.getElementById('dl-btn2')];
  var labels = [document.getElementById('dl-label'), document.getElementById('dl-label2')];
  var meta = document.getElementById('dl-meta');
  var tag = document.getElementById('dl-tag');

  function mb(n) { return (n / 1048576).toFixed(0) + ' Mo'; }
  function soon() {
    btns.forEach(function (b) { if (b) { b.setAttribute('aria-disabled', 'true'); b.href = RELEASES; } });
    labels.forEach(function (l) { if (l) l.textContent = 'Bientôt disponible'; });
    if (meta) meta.innerHTML = '<span>Première version en préparation</span><span>Windows 11 · 64 bits</span><span>Gratuit</span>';
  }

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (rel) {
      var exe = (rel.assets || []).filter(function (a) { return /\.exe$/i.test(a.name); })[0];
      if (!exe) return soon();
      btns.forEach(function (b) { if (b) { b.href = exe.browser_download_url; b.setAttribute('aria-disabled', 'false'); } });
      var v = (rel.tag_name || '').replace(/^v/, '');
      var d = rel.published_at ? new Date(rel.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      if (meta) meta.innerHTML = '<span>Version ' + v + '</span><span>' + mb(exe.size) + '</span><span>Windows 11 · 64 bits</span>' + (d ? '<span>' + d + '</span>' : '');
      if (tag && rel.prerelease) tag.textContent = 'Bêta ' + v + ' · gratuite';
    })
    .catch(soon);
})();
