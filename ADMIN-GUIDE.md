# Guide de l'admin Datalio

Bienvenue ! Ce guide explique comment gérer le site **Datalio** (`https://datalio.online`) sans coder, via l'espace admin propulsé par [Pages CMS](https://pagescms.org).

---

## 🔒 Sécurité — comment ça marche

L'admin Datalio est conçu pour **un site statique sur GitHub Pages**, ce qui impose des contraintes fortes :

- ✅ **Aucun mot de passe** n'est stocké dans le site (rien à mémoriser, rien à voler).
- ✅ **Aucun token GitHub** n'est exposé dans le frontend.
- ✅ La connexion utilise **GitHub OAuth** : Pages CMS demande votre autorisation pour accéder au repo en votre nom.
- ✅ Seuls les **collaborateurs du repo GitHub** `foriasser-hub/Kiro-test` peuvent éditer.
- ✅ Toutes les modifications sont des **commits Git** : historique complet, restauration possible à tout moment.

> ⚠️ Si vous voyez sur internet des "admins GitHub Pages" qui demandent un mot de passe ou collent un token GitHub dans le navigateur, **fuyez** : ce sont des fausses sécurités. La seule méthode propre est OAuth GitHub, comme on l'a configurée ici.

---

## 1. Accéder à l'admin

1. Allez sur **https://datalio.online/admin/**
2. Cliquez sur **« Ouvrir l'admin Datalio »**
3. Connectez-vous avec votre compte **GitHub** (le bouton « Sign in with GitHub »)
4. Autorisez Pages CMS à accéder au repo `foriasser-hub/Kiro-test`
5. Vous arrivez sur l'interface d'édition Datalio

L'URL directe de l'admin est : <https://app.pagescms.org/foriasser-hub/Kiro-test/main>

> 📝 La première fois, GitHub vous demande l'autorisation. Les fois suivantes, c'est un simple clic.

---

## 2. Vue d'ensemble — qu'est-ce qu'on peut éditer ?

L'admin affiche une **barre latérale** avec toutes les sections éditables :

| Section | Fichier | À quoi ça sert |
|---|---|---|
| 📄 **Contenu du site** | `content/site.json` | Hero, à propos, expertises, contact, réseaux sociaux, WhatsApp, etc. |
| 🛠 **Services** | `content/services.json` | Liste des services proposés (sites web, mini-logiciels, chatbot…) |
| 💎 **Packs / Offres** | `content/packs.json` | Pack Présence Premium, Business Premium, Signature Premium |
| ❓ **FAQ** | `content/faq.json` | Questions fréquentes affichées sur la page d'accueil |
| 💬 **Témoignages clients** | `content/testimonials.json` | Citations clients (admin-only pour l'instant, future intégration) |
| 📝 **Blog** | `content/blog/*.md` | Articles de blog en Markdown |
| ⚙️ **Réglages SEO & Analytics** | `content/settings.json` | Titre, meta description, OG image, ID Google Analytics, etc. |
| 🤖 **Chatbot** | `content/chatbot.json` | Messages, suggestions et Q/R du chatbot |
| 🖼 **Logo Datalio** | `assets/logo.png` | Remplacer le logo |

---

## 3. Modifier le texte du site (hero, à propos, contact)

1. Dans la barre latérale, cliquez sur **📄 Contenu du site**
2. Vous voyez un formulaire avec toutes les sections (Hero, À propos, Contact, etc.)
3. Modifiez les champs voulus
4. Cliquez sur **Save** en haut à droite
5. Patientez 30 à 60 secondes : le site est mis à jour automatiquement

> 💡 Si un champ est obligatoire, l'admin vous le signale en rouge avant de pouvoir sauvegarder.

### Champs déjà connectés au site public (changement immédiat)

- Hero (titre, sous-titre, slogan, points clés)
- WhatsApp (numéro + message par défaut)
- Contact : téléphone affiché, clic-pour-appeler, **email**, **adresse** (visibles dans la section Contact + footer)
- Services (cartes affichées dans la section Solutions)
- FAQ (section Questions fréquentes)
- Formulaire de contact (Web3Forms access_key + email destinataire — voir section 11)

### Champs gérés mais non encore affichés sur le site

- À propos (texte enrichi, paragraphes)
- Nos deux expertises
- Ce qui est inclus
- Pourquoi Datalio
- Comment ça marche
- Réseaux sociaux
- Packs / offres
- Témoignages

> Ces champs sont **édités et versionnés dès maintenant**. Pour les afficher sur le site public, demander à votre développeur d'ajouter les attributs `data-cms` correspondants dans le HTML — c'est rapide.

---

## 4. Modifier les packs (Présence / Business / Signature)

1. Cliquez sur **💎 Packs / Offres**
2. Vous voyez la liste de vos packs
3. Cliquez sur un pack pour le modifier, ou sur **Add item** pour en créer un
4. Champs disponibles :
   - **Nom** (Pack Présence Premium…) — obligatoire
   - **Prix** (texte libre — « 1 200 000 Ar » ou « Sur devis ») — obligatoire
   - **Période** (« / projet », « / mois ») — optionnel
   - **Phrase d'accroche**
   - **Description** — obligatoire
   - **Éléments inclus** (un par ligne — affichés en cases à cocher)
   - **Texte du bouton** (par défaut : Demander un devis)
   - **Message WhatsApp prérempli** (si différent du défaut)
   - **Populaire** / **Recommandé** (mises en avant visuelles)
   - **Actif** (décochez pour cacher temporairement)
   - **Ordre d'affichage** (1 = premier)
5. Cliquez sur **Save**

---

## 5. Ajouter un article de blog

1. Cliquez sur **📝 Blog** dans la barre latérale
2. Cliquez sur **+ Add entry** (en haut à droite)
3. Remplissez :
   - **Titre** (obligatoire)
   - **Slug** (obligatoire — minuscules + tirets, ex : `mon-super-article`)
   - **Date de publication** (obligatoire)
   - **Auteur** (par défaut : « L'équipe Datalio »)
   - **Image de couverture** — uploadez une image (1200×675 px conseillé)
   - **Texte alternatif de la couverture** (important pour SEO et accessibilité)
   - **Titre SEO** (60 caractères max conseillés)
   - **Description SEO** (155 caractères max conseillés)
   - **Tags** (un par ligne)
   - **Catégorie** (Automatisation / Chatbot / Sites web / etc.)
   - **Statut** : 📝 Brouillon ou ✅ Publié
   - **Extrait** (résumé court affiché sur la liste)
   - **Contenu** (Markdown — voir mémo ci-dessous)
4. Cliquez sur **Save**

### Mémo Markdown

```markdown
# Titre principal
## Sous-titre

Un paragraphe normal. Vous pouvez **mettre en gras** ou *en italique*.

- Liste à puce
- Deuxième élément

[Texte du lien](https://datalio.online)

![Description de l'image](/assets/uploads/mon-image.jpg)

> Citation ou bloc remarquable
```

> ⚠️ **Important sur le blog** : pour l'instant, les articles **HTML** existants (`/blog/index.html`, `/blog/5-taches-a-automatiser-petite-entreprise.html`, etc.) sont la version affichée sur le site public. Les articles **Markdown** créés via l'admin sont stockés dans `content/blog/*.md` mais ne sont pas encore rendus automatiquement. Demander au développeur d'activer le rendu Markdown ou de générer les pages HTML correspondantes.

---

## 6. Changer le numéro WhatsApp

1. **📄 Contenu du site** → section **WhatsApp**
2. Modifiez le champ **Numéro WhatsApp**
3. ⚠️ Format : **chiffres uniquement, avec code pays, SANS le `+`**
   - ✅ Bon : `261386315306`
   - ❌ Mauvais : `+261 38 63 153 06`
4. Vous pouvez aussi personnaliser les messages préremplis :
   - Message par défaut
   - Message « Demande de devis »
   - Message « Sites web premium »
   - Message « Mini-logiciels de gestion »
   - Message « Support »
5. Cochez/décochez **Afficher le bouton flottant WhatsApp**
6. **Save**

> 💡 **Numéro Datalio actuel** : `+261 38 63 153 06` (format wa.me : `261386315306`)
> 💡 Pour changer aussi le numéro affiché en clair sur la page, modifiez **Contact → Téléphone** dans la même section. Pour le clic-pour-appeler (`tel:`), modifiez **Contact → Téléphone (clic-pour-appeler)** au format international avec `+`.

---

## 7. Modifier les services

1. Cliquez sur **🛠 Services**
2. Liste de vos services. Cliquez pour modifier ou **+ Add item** pour créer
3. Champs :
   - Icône (sélection visuelle)
   - Titre — obligatoire
   - Description courte (visible sur la carte) — obligatoire
   - Description détaillée (pour future page dédiée)
   - Avantages (liste — 3 conseillés)
   - Image illustrative (optionnelle)
   - Texte alternatif image (SEO)
   - Texte du bouton
   - Mettre en avant ?
   - Service actif (décochez pour cacher temporairement)
   - Étiquette (« Nouveau », « Populaire »…)
4. **Save**

---

## 8. Modifier les FAQ

1. Cliquez sur **❓ FAQ**
2. Liste de vos questions. Cliquez pour modifier, **+ Add item** pour créer, glisser-déposer pour réorganiser
3. Pour chaque question :
   - Question — obligatoire
   - Réponse — obligatoire
   - Catégorie (optionnel)
4. **Save**

---

## 9. Modifier le SEO et Google Analytics

1. Cliquez sur **⚙️ Réglages SEO & Analytics**
2. Trois sections :

### SEO global
- Titre du site (`<title>`)
- Description SEO (155 caractères max)
- Mots-clés (séparés par virgules)
- Image Open Graph (1200×630 px)
- Texte alternatif OG
- URL canonique
- Locale (`fr_FR`)

### Analytics & Search Console
- Google Analytics 4 — Measurement ID (`G-XXXXXXXXXX`)
- Google Search Console — code de vérification
- Anonymiser les IP (RGPD) ✅ recommandé

### Identité de marque
- Nom, slogan, phrase footer

> ⚠️ **Note importante sur certains réglages SEO** : Pour des raisons de performance (chargement immédiat), certaines balises (`<title>`, `<meta description>`, `<meta name="google-site-verification">`, `window.GA_MEASUREMENT_ID`) sont **inscrites directement dans le code HTML** (`index.html`, `blog/*.html`). Modifier la valeur ici dans l'admin **n'a pas d'effet immédiat** sur ces balises. Pour les changer effectivement, il faut :
> 1. Modifier la valeur ici dans l'admin (pour avoir une source de vérité unique)
> 2. **Demander au développeur** de répercuter la nouvelle valeur dans les fichiers HTML
>
> Les autres champs (texte du contenu, services, FAQ, packs, blog) sont eux **immédiatement appliqués**.

---

## 10. Modifier le chatbot

1. Cliquez sur **🤖 Chatbot**
2. Vous pouvez :
   - **Activer/désactiver** complètement le chatbot
   - Modifier le **message de bienvenue**
   - Modifier le **message de secours** (quand le bot ne comprend pas)
   - Ajouter/modifier les **boutons rapides** (suggestions cliquables)
   - Ajouter/modifier les **paires Question/Réponse** (déclenchées par mots-clés)
3. Pour chaque Q/R :
   - **Sujet** (pour vous y retrouver — ex : « Tarifs »)
   - **Mots-clés déclencheurs** (insensible aux accents et à la casse — un par ligne)
   - **Réponse** (HTML autorisé pour les liens)
   - Cocher **Inclure un lien WhatsApp** pour ajouter automatiquement un bouton vers WhatsApp
4. **Save**

> ℹ️ Pour l'instant, le chatbot affiché sur le site lit ses réponses depuis le code (raisons historiques). La configuration ici dans l'admin est **prête** : demander au développeur de brancher le chatbot sur `content/chatbot.json` (modification mineure dans `script.js`).

---

## 11. Configurer le formulaire de contact

La section **Contact** de la page d'accueil (`#contact`) propose un vrai formulaire qui envoie les demandes directement sur **`contact@datalio.online`**.

L'envoi passe par **[Web3Forms](https://web3forms.com/)** : un service gratuit qui transmet les soumissions vers votre boîte mail, **sans serveur à maintenir** et **sans secret côté client**.

> 🚨 **Tant que la clé Web3Forms n'est pas configurée, le formulaire affiche un message d'erreur** invitant le visiteur à passer par WhatsApp. Il n'y a plus de fallback `mailto:` qui ouvre le client mail. **Configurez la clé en priorité** (5 minutes, voir ci-dessous) — sans elle, vous perdez toutes les demandes envoyées via le formulaire.

### Pourquoi Web3Forms est sûr

- La « access_key » Web3Forms est une **clé d'envoi publique** (l'équivalent d'un identifiant Formspree) — elle est conçue pour être visible dans le frontend, comme `<form action>`.
- Ce n'est pas un mot de passe ni un token API. Quelqu'un qui la copie peut au pire envoyer du spam à votre adresse — Web3Forms inclut un anti-spam et vous pouvez régénérer la clé en un clic.
- **Aucun secret sensible** n'est stocké dans le repo ni dans le navigateur.

### Récupérer votre access_key Web3Forms (5 minutes)

1. Aller sur **<https://web3forms.com/>**
2. Dans la barre **« Get your Access Key »** (en haut de la page), saisir l'email **`contact@datalio.online`** puis cliquer sur **« Create Access Key »**
3. Web3Forms envoie un email de validation à `contact@datalio.online` — ouvrez-le et cliquez sur le lien de confirmation
4. La page Web3Forms affiche alors votre **Access Key** (une chaîne de type `abcd1234-5678-90ef-...`). **Copiez-la.**

### Coller la clé dans le site

**Méthode A — via l'admin (recommandée, aucun code à toucher) :**

1. Ouvrir l'admin Datalio : <https://datalio.online/admin/>
2. Cliquer sur **⚙️ Réglages SEO & Analytics**
3. Section **Formulaire de contact** :
   - **Provider** : laisser sur `web3forms`
   - **Web3Forms — Access Key** : coller la clé
   - **Email de réception** : `contact@datalio.online` (déjà prérempli)
   - **Préfixe du sujet** : `[Datalio] Nouvelle demande depuis le site` (déjà prérempli)
4. Cliquer **Save** en haut à droite
5. Patientez 30 à 60 secondes que GitHub Pages redéploie

**Méthode B — directement dans le repo (pour développeurs) :**

Éditer le fichier **`content/settings.json`** et remplir le champ `web3forms_access_key` :

```json
"contact_form": {
  "provider": "web3forms",
  "web3forms_access_key": "VOTRE-CLE-ICI",
  "receiver_email": "contact@datalio.online",
  "subject_prefix": "[Datalio] Nouvelle demande depuis le site"
}
```

Commiter sur `main` → GitHub Pages redéploie automatiquement.

### Tester l'envoi

1. Aller sur <https://datalio.online/#contact>
2. Remplir tous les champs (le **message doit faire au moins 20 caractères**)
3. Cliquer **« Envoyer ma demande »**
4. Le bouton se met en mode « Envoi en cours… »
5. Quelques secondes plus tard :
   - ✅ **Succès** : message vert *« Votre demande a été envoyée avec succès. Nous vous répondrons rapidement. »* + le formulaire se réinitialise
   - ❌ **Erreur** : message rouge *« Une erreur est survenue. Vous pouvez aussi nous contacter directement sur WhatsApp. »* — le bouton WhatsApp de la même section reste cliquable comme canal secondaire
6. Vérifier votre boîte **`contact@datalio.online`** (regarder aussi les **spams** la première fois — Web3Forms passe parfois en quarantaine sur le tout premier envoi)

### Champs envoyés dans l'email

L'email reçu sur `contact@datalio.online` contient :
- Sujet : `[Datalio] Nouvelle demande depuis le site` (configurable)
- `name` : nom complet
- `company` : entreprise (optionnel)
- `email` : email du visiteur
- `phone` : téléphone / WhatsApp (optionnel)
- `project_type` : type de projet (Site web premium / Mini-logiciel / Chatbot / SEO / Maintenance / Autre)
- `budget` : budget estimé (optionnel)
- `message` : message libre (≥ 20 caractères)

Web3Forms remplit automatiquement le champ `Reply-To` avec l'email du visiteur, donc un simple **« Répondre »** depuis votre boîte mail répond directement au prospect.

### Anti-spam intégré

- **Honeypot** : un champ caché `botcheck` que les humains ne voient jamais. Si un bot le remplit, le formulaire affiche un faux succès et n'envoie rien.
- **Validation côté navigateur** : champs obligatoires (nom, email, type de projet, message), format email vérifié, message ≥ 20 caractères.
- **Anti-spam Web3Forms** : couche serveur incluse dans le service.

### Modifier l'email de réception

1. **⚙️ Réglages SEO & Analytics → Formulaire de contact → Email de réception**
2. Saisir la nouvelle adresse
3. **Save**

> ⚠️ Si la nouvelle adresse n'est pas vérifiée sur Web3Forms, **régénérez aussi une access_key** sur <https://web3forms.com/> avec cette nouvelle adresse, et collez-la dans **Web3Forms — Access Key**. Sinon Web3Forms refusera l'envoi.

### Vérifier les événements GA4

Dans Google Analytics → **Reports → Realtime → Event count** :
- `form_submit` (event_category : `contact`, event_label : `contact_form_web3forms`) doit apparaître à chaque envoi **réussi** du formulaire
- `whatsapp_click` (event_category : `contact`) au clic du bouton WhatsApp de la section Contact
- `phone_click` au clic du téléphone
- `contact_click` au clic de l'email

> Marquez `form_submit` comme **conversion** dans GA4 (Admin → Events → Mark as conversion) si ce n'est pas déjà fait. C'est l'indicateur le plus important pour mesurer le taux de transformation du site.

### En cas d'erreur d'envoi

Si un visiteur voit le message rouge *« Une erreur est survenue… »* :

1. Ouvrir la **console du navigateur** (F12) sur la page : un message `[Datalio] Web3Forms access_key absente…` indique que la clé n'est pas configurée — appliquez la procédure « Coller la clé » ci-dessus.
2. Sinon, vérifier sur <https://web3forms.com/> que votre clé n'a pas été révoquée et que votre quota mensuel n'est pas dépassé (250 envois/mois sur le plan gratuit, suffisant pour un site vitrine).
3. En attendant la résolution, **les visiteurs peuvent toujours utiliser le bouton WhatsApp** affiché juste à côté du formulaire — c'est notre canal secondaire, intentionnellement maintenu en permanence.

---

## 12. Uploader des images

1. Quand vous éditez un champ de type « image » (cover blog, photo À propos, photo témoignage…), un sélecteur d'images s'ouvre
2. Cliquez sur **Upload** pour uploader une image depuis votre ordinateur
3. L'image est commitée dans `/assets/uploads/`
4. Pages CMS génère automatiquement le chemin correct dans le JSON

### Bonnes pratiques

- **Format conseillé** : JPEG ou WebP (plus léger). PNG seulement pour les logos / icônes
- **Poids conseillé** : moins de 300 ko par image
- **Largeur max conseillée** : 1600 px
- **Toujours** remplir le **texte alternatif** (SEO + accessibilité)

> Pour optimiser une image avant upload : <https://squoosh.app> ou <https://tinypng.com>

---

## 13. Publier les modifications

Pages CMS commit directement sur la branche `main` du repo. Donc :

1. Vous cliquez **Save** dans l'admin
2. Pages CMS crée un commit Git sur `main`
3. GitHub Pages (le système qui héberge le site) détecte le changement
4. **30 à 60 secondes plus tard**, le site est mis à jour
5. Si vous avez vidé le cache de votre navigateur (Ctrl + F5), vous voyez la nouvelle version

> 🟢 Aucune intervention manuelle nécessaire. C'est entièrement automatique.

---

## 14. Ajouter un autre administrateur

Pour donner à quelqu'un d'autre le droit d'éditer le site :

1. Allez sur **https://github.com/foriasser-hub/Kiro-test/settings/access**
2. Cliquez sur **Add people**
3. Tapez son nom d'utilisateur GitHub ou son email
4. Choisissez le rôle :
   - **Write** : peut éditer le contenu (✅ recommandé)
   - **Maintain** : Write + gestion de quelques paramètres
   - **Admin** : tout (à n'utiliser que pour les co-fondateurs)
5. Validez

La personne reçoit un email d'invitation. Une fois acceptée, elle peut se connecter à <https://datalio.online/admin/> avec son compte GitHub.

> 🚨 **Ne donnez jamais le rôle Admin à une personne extérieure**. Write suffit pour gérer le contenu.

---

## 15. Quoi faire si l'admin ne se connecte pas ?

### Cas 1 : « Sign in with GitHub » ne fait rien

- Vérifiez que les **cookies tiers** sont autorisés (Pages CMS utilise `app.pagescms.org`)
- Désactivez temporairement les bloqueurs de pubs
- Essayez en navigation privée

### Cas 2 : « You don't have access to this repository »

- Vérifiez que vous êtes bien **collaborateur** du repo `foriasser-hub/Kiro-test`
- Vérifiez que vous avez bien **autorisé** Pages CMS à accéder au repo (pendant la connexion)
- Si vous venez d'être ajouté, **acceptez d'abord l'invitation** dans votre email GitHub

### Cas 3 : Save échoue avec une erreur

- Pages CMS vous indique souvent quel champ pose problème (validation rouge)
- Si l'erreur persiste, vérifiez :
  - Que GitHub n'est pas en panne (<https://www.githubstatus.com>)
  - Que vos modifications respectent les règles (champs obligatoires, format des URL/email, etc.)

### Cas 4 : Le site ne se met pas à jour après Save

- Patientez 1 à 2 minutes (GitHub Pages a parfois un léger délai)
- Vérifiez les **GitHub Actions** : <https://github.com/foriasser-hub/Kiro-test/actions> — un déploiement doit être marqué ✅
- Forcez le rechargement (Ctrl + F5 ou Cmd + Shift + R)

### Si rien ne marche

- Allez sur <https://github.com/foriasser-hub/Kiro-test/commits/main> pour vérifier que vos commits Pages CMS ont bien été enregistrés
- Sinon : ouvrez une issue sur <https://github.com/foriasser-hub/Kiro-test/issues> en décrivant le problème
- Ou contactez votre développeur

---

## 16. Bonnes pratiques

- **Ne supprimez pas** des champs obligatoires sans les remplacer (le site reprendra alors le texte du HTML statique en secours, mais c'est moins propre).
- **Évitez les copier-coller depuis Word** dans les champs de texte (apporte des caractères invisibles). Préférez un éditeur de texte basique ou tapez directement.
- **Toujours** remplir les **textes alternatifs** des images.
- Utilisez la fonction **brouillon** des articles de blog pour préparer du contenu sans le publier.
- Avant un changement risqué, regardez l'historique : <https://github.com/foriasser-hub/Kiro-test/commits/main> — vous pouvez **toujours revenir en arrière**.

---

## 📞 Aide

- Documentation Pages CMS : <https://pagescms.org/docs/>
- Statut GitHub : <https://www.githubstatus.com>
- Repo du site : <https://github.com/foriasser-hub/Kiro-test>

Bon contenu ! 🎯
