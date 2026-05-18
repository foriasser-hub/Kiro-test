# Datalio — Site vitrine

**Datalio — Solutions digitales pour entreprises**
*Gérez mieux. Automatisez plus. Avancez vite.*

Site vitrine professionnel pour Datalio : outils de gestion personnalisés, automatisation, chatbots et suivi client pour petites entreprises, vendeurs en ligne, commerces, freelances et entrepreneurs.

## 🌐 Site en ligne

https://foriasser-hub.github.io/Kiro-test/

## 🛠 Interface admin (modifier le site sans coder)

Une admin est branchée sur le site grâce à **[Pages CMS](https://pagescms.org)** :

1. Va sur **https://foriasser-hub.github.io/Kiro-test/admin/**
2. Clique sur "Ouvrir l'admin Datalio"
3. Connecte-toi avec ton compte GitHub (le propriétaire du repo)
4. Autorise l'accès au repo `Kiro-test`
5. Modifie ce que tu veux dans des formulaires (titres, services, témoignages, FAQ, contact)
6. Clique sur **Save** → le site se met à jour automatiquement en 30 sec

**Tout ce qui est modifiable depuis l'admin :**
- ✅ Tous les textes du Hero (titre, sous-titre, slogan, points clés)
- ✅ Numéro WhatsApp & message prérempli
- ✅ Les 4 services (titre, description, bénéfices, mise en avant)
- ✅ Les témoignages clients (nom, rôle, citation)
- ✅ La FAQ (questions / réponses)
- ✅ Numéro de téléphone affiché
- ✅ Le logo (en uploadant un nouveau fichier)

Le contenu est stocké dans `content/site.json` (modifiable directement aussi sur GitHub).

## Charte graphique

- Bleu nuit `#05045F` (couleur principale)
- Jaune doré `#F5B800` (accent)
- Blanc `#FFFFFF`, Gris clair `#F5F7FA`, Gris texte `#5B6472`
- Bleu tech `#2D6BFF` (détails subtils)
- Police : **Poppins**

## Structure du projet

```
.
├── index.html          # Page d'accueil
├── styles.css          # Charte Datalio + responsive
├── script.js           # Charge le contenu JSON, animations, WhatsApp
├── content/
│   └── site.json       # 📝 Tous les textes du site (édité via admin)
├── assets/
│   └── logo.png        # Logo Datalio
├── admin/
│   └── index.html      # Page d'accueil de l'admin
└── .pages.yml          # Config Pages CMS (interface admin)
```

## Développement local

Aucune installation. Ouvrez `index.html` dans votre navigateur, ou lancez :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```
