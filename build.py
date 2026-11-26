#!/usr/bin/env python3
"""Génère les pages du site dans docs/ à partir de src/*.html (contenu) + gabarit commun."""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
SRC, OUT = ROOT / "src", ROOT / "docs"
SITE = "https://xeen28170-rgb.github.io/clipeur-site/"
REPO = "https://github.com/xeen28170-rgb/clipeur-site"
CONTACT_URL = REPO + "/issues/new"
VER = "5"
UPDATED = "23 novembre 2026"

HEAD = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0c0c10">
<link rel="icon" href="img/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="img/icon.png">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}img/icon.png">
<meta name="twitter:card" content="summary">
<link rel="preload" href="fonts/bricolage-grotesque-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css?v={ver}">
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top"><div class="wrap">
  <a class="brand" href="./"><img src="img/logo.svg" alt="" width="34" height="34"><span>Clip<b>eur</b></span></a>
  <nav aria-label="Navigation principale">
    <a href="./#fonctions">Fonctionnalités</a>
    <a href="./#plateformes">Plateformes</a>
    <a href="./#faq">FAQ</a>
    <a class="btn btn-acc btn-sm" href="./#telecharger">Télécharger</a>
  </nav>
</div></header>
<main id="contenu">
"""

FOOT = """</main>
<footer><div class="wrap">
  <div class="foot">
    <div>
      <a class="brand" href="./"><img src="img/logo.svg" alt="" width="30" height="30"><span>Clip<b>eur</b></span></a>
      <p>Logiciel gratuit de clipping vidéo par IA pour Windows, développé par Xeen.</p>
    </div>
    <div><h4>Produit</h4><ul>
      <li><a href="./#telecharger">Télécharger</a></li>
      <li><a href="./#fonctions">Fonctionnalités</a></li>
      <li><a href="./#config">Configuration requise</a></li>
      <li><a href="{repo}/releases">Versions</a></li>
    </ul></div>
    <div><h4>Informations légales</h4><ul>
      <li><a href="mentions-legales">Mentions légales</a></li>
      <li><a href="terms">Conditions d'utilisation</a></li>
      <li><a href="privacy">Politique de confidentialité</a></li>
      <li><a href="{contact}">Contact</a></li>
    </ul></div>
  </div>
  <p class="fine">© 2026 Clipeur by Xeen. Ce site n'utilise aucun cookie ni traceur.
  TikTok, YouTube, Instagram, Twitch et Metricool sont des marques de leurs propriétaires respectifs ;
  Clipeur n'est ni affilié à ces services, ni approuvé ou sponsorisé par eux.</p>
</div></footer>
{scripts}
</body>
</html>
"""

SCENE = """<canvas id="scene" aria-hidden="true"></canvas><div class="veil" aria-hidden="true"></div>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module" src="hero.js?v={ver}"></script>
<script type="module" src="scene.js?v={ver}"></script>
"""

def build():
    for f in sorted(SRC.glob("*.html")):
        raw = f.read_text(encoding="utf-8")
        meta = dict(re.findall(r"<!--\s*(\w+):\s*(.*?)\s*-->", raw.split("\n\n", 1)[0]))
        body = re.sub(r"^(<!--.*?-->\s*)+", "", raw, flags=re.S)
        body = (body.replace("{UPDATED}", UPDATED).replace("{REPO}", REPO)
                    .replace("{CONTACT}", CONTACT_URL).replace("{SITE}", SITE))
        slug = f.stem
        url = SITE if slug == "index" else SITE + slug
        scripts = '<script src="download.js?v={ver}" defer></script>' if meta.get("download") else ""
        if meta.get("scene"):
            scripts = SCENE + scripts
        html = (HEAD.format(title=meta["title"], desc=meta["desc"], url=url, site=SITE, ver=VER)
                + body + FOOT.format(repo=REPO, contact=CONTACT_URL, scripts=scripts.replace("{ver}", VER)))
        if slug == "404":  # servie à n'importe quelle adresse : liens absolus
            html = re.sub(r'(href|src)="(?!https?:|/|#)(\./)?', r'\1="/clipeur-site/', html)
        (OUT / f.name).write_text(html, encoding="utf-8")
        print("ok", f.name)

if __name__ == "__main__":
    build()
