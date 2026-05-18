# Datalio — Site vitrine

**Datalio — Solutions digitales pour entreprises**
*Gérez mieux. Automatisez plus. Avancez vite.*

Site vitrine professionnel pour Datalio : outils de gestion personnalisés, automatisation, chatbots et suivi client pour petites entreprises, vendeurs en ligne, commerces, freelances et entrepreneurs.

## Charte graphique

- Bleu nuit `#05045F` (couleur principale)
- Jaune doré `#F5B800` (accent)
- Blanc `#FFFFFF`, Gris clair `#F5F7FA`, Gris texte `#5B6472`
- Bleu tech `#2D6BFF` (détails subtils)
- Police : **Poppins**

## Aperçu

- HTML / CSS / JavaScript pur — **aucune installation, compatible GitHub Pages**
- Responsive (mobile, tablette, desktop)
- Animations légères (apparition au scroll, dashboard, dots & rings)
- Bouton WhatsApp dynamique et bouton flottant

## Lancer le site

Ouvrez simplement `index.html` dans votre navigateur, ou hébergez le dossier sur n'importe quel serveur statique (GitHub Pages, Netlify, Vercel…).

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

```
.
├── index.html      # Toutes les sections du site
├── styles.css      # Charte Datalio + responsive
├── script.js       # WhatsApp dynamique, FAQ, animations
└── README.md
```

## Personnaliser rapidement

- **Numéro WhatsApp / message** : `script.js` (`WHATSAPP_NUMBER`, `WHATSAPP_MESSAGE`)
- **Couleurs** : `styles.css`, bloc `:root`
- **Textes / services / témoignages** : directement dans `index.html` (sections commentées)
