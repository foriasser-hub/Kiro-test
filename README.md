# Datalio — Site vitrine

**Datalio — Solutions digitales pour entreprises**
*Gérez mieux. Automatisez plus. Avancez vite.*

Site vitrine professionnel pour Datalio : outils de gestion personnalisés, automatisation, chatbots et suivi client pour petites entreprises, vendeurs en ligne, commerces, freelances et entrepreneurs.

## 🌐 Site en ligne

https://foriasser-hub.github.io/Kiro-test/

## 🛠 Interface admin

Gestion du contenu sans code via [Pages CMS](https://pagescms.org).

1. Va sur **https://foriasser-hub.github.io/Kiro-test/admin/**
2. Clique sur "Ouvrir l'admin Datalio"
3. Connecte-toi avec ton compte GitHub
4. Modifie textes, services, témoignages, FAQ via formulaires
5. Clique **Save** → site mis à jour automatiquement

Le contenu est stocké dans `content/site.json`.

## 🔍 SEO — Optimisation de référencement

Le site inclut tout ce qu'il faut pour être bien référencé :

- ✅ Balises `<title>`, `<meta description>` et `<meta keywords>` optimisées
- ✅ **Open Graph** (Facebook, WhatsApp, LinkedIn) avec image de partage
- ✅ **Twitter Cards** (aperçus riches sur X/Twitter)
- ✅ **Schema.org JSON-LD** (Organization, ProfessionalService, FAQPage, WebSite)
- ✅ **Sitemap.xml** + **robots.txt** pour les moteurs de recherche
- ✅ **Canonical URL** (évite le contenu dupliqué)
- ✅ **PWA manifest** (le site peut être installé comme app sur mobile)
- ✅ Page `/admin/` exclue de l'indexation

### Aperçu de partage

Quand tu colles le lien du site sur WhatsApp / Facebook / LinkedIn, ça affiche maintenant un joli aperçu (1200×630 px) avec ton logo, ton slogan et tes services.

## 📊 Analytics — Suivre les visiteurs

Le code Analytics est **prêt mais désactivé**. Choisis l'une des deux options :

### Option A — Plausible *(recommandé : gratuit, sans cookies, RGPD)*

1. Crée un compte sur https://plausible.io (essai 30 jours gratuit, ~9$/mois ensuite)
2. Ajoute le site `foriasser-hub.github.io/Kiro-test`
3. Dans `index.html`, trouve le bloc `ANALYTICS` (vers la ligne ~120) et décommente :
   ```html
   <script defer data-domain="foriasser-hub.github.io" src="https://plausible.io/js/script.js"></script>
   ```

**Alternative gratuite** : [Umami Cloud](https://umami.is) — 100% gratuit jusqu'à 100k vues/mois.

### Option B — Google Analytics 4 *(gratuit, plus complet, nécessite un bandeau cookies)*

1. Crée un compte GA4 sur https://analytics.google.com
2. Récupère ton **ID de mesure** (format `G-XXXXXXXXXX`)
3. Dans `index.html`, trouve le bloc `ANALYTICS` et décommente le bloc Google :
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
4. Remplace **les deux occurrences** de `G-XXXXXXXXXX` par ton vrai ID.

**Important** : Si tu choisis GA4, tu dois ajouter un bandeau de consentement cookies pour respecter le RGPD.

## 🚀 Search Console (recommandé)

Pour suivre ton référencement Google :

1. Va sur https://search.google.com/search-console
2. Ajoute la propriété `https://foriasser-hub.github.io/Kiro-test/`
3. Vérifie via balise meta (à ajouter dans le `<head>`) ou fichier HTML
4. Soumets ton sitemap : `https://foriasser-hub.github.io/Kiro-test/sitemap.xml`

## 🎨 Charte graphique

- Bleu nuit `#05045F` (couleur principale)
- Jaune doré `#F5B800` (accent)
- Blanc `#FFFFFF`, Gris clair `#F5F7FA`, Gris texte `#5B6472`
- Bleu tech `#2D6BFF` (détails subtils)
- Police : **Poppins**

## 📁 Structure du projet

```
.
├── index.html              # Page d'accueil
├── styles.css              # Charte Datalio + responsive
├── script.js               # Charge le contenu JSON, animations, WhatsApp
├── content/
│   └── site.json           # 📝 Tous les textes du site (édité via admin)
├── assets/
│   └── logo.png            # Logo Datalio
├── admin/
│   └── index.html          # Page d'accueil de l'admin (noindex)
├── og-image.svg            # Image de partage (Open Graph) 1200×630
├── manifest.webmanifest    # PWA manifest
├── sitemap.xml             # Sitemap pour Google
├── robots.txt              # Directives moteurs de recherche
└── .pages.yml              # Config Pages CMS
```

## 💻 Développement local

Aucune installation. Ouvre `index.html` dans ton navigateur, ou lance :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```
