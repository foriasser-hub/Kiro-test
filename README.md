# ExcelPro — Site vitrine

Site vitrine professionnel pour vendre des templates Excel et mini logiciels de gestion destinés aux petites entreprises, vendeurs en ligne, commerçants, freelances et entrepreneurs en Afrique francophone.

## Aperçu

- HTML / CSS / JavaScript pur, **aucune installation requise**
- Design premium responsive (violet profond, blanc, gris clair, touches dorées et vert émeraude)
- Toutes les sections demandées : Hero, Problème, Solution, Produits, Avantages, Étapes, Témoignages, FAQ, CTA finale, Footer
- Boutons WhatsApp préremplis vers `+261386984531`
- Animations légères (apparition au scroll, mockup, bouton flottant)

## Lancer le site

Ouvrez simplement `index.html` dans votre navigateur. C'est tout.

Pour un rendu plus proche de la production (rechargement live), vous pouvez utiliser n'importe quel mini-serveur statique, par exemple :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

```
.
├── index.html      # Toutes les sections du site
├── styles.css      # Design premium responsive
├── script.js       # WhatsApp dynamique, FAQ, animations
└── README.md
```

## Personnaliser rapidement

- **Numéro WhatsApp / message** : `script.js`, en haut du fichier (`WHATSAPP_NUMBER`, `WHATSAPP_MESSAGE`).
- **Couleurs** : `styles.css`, bloc `:root` en haut.
- **Textes / produits / témoignages** : directement dans `index.html` (chaque section est commentée).
