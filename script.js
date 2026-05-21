/* =========================================
   Datalio — Solutions digitales pour entreprises
   Interactions JS + chargement du contenu CMS
   ========================================= */
(function () {
    'use strict';

    /* =========================================
       SÉCURITÉ - Fonctions de protection
       ========================================= */
    
    // Protection XSS - Échappement HTML strict
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        var div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }
    
    // Échappement pour les attributs HTML
    function escapeAttr(str) {
        return escapeHtml(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    
    // Validation des URLs (protection contre javascript: et data:)
    function isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        var trimmed = url.trim().toLowerCase();
        // Bloquer les protocoles dangereux
        if (trimmed.startsWith('javascript:') || 
            trimmed.startsWith('data:') || 
            trimmed.startsWith('vbscript:')) {
            return false;
        }
        return true;
    }
    
    // Validation du numéro WhatsApp (chiffres uniquement)
    function sanitizePhoneNumber(phone) {
        if (!phone) return '';
        return String(phone).replace(/[^0-9]/g, '');
    }
    
    // Limitation de la longueur des entrées
    function truncateInput(str, maxLength) {
        if (!str) return '';
        return String(str).substring(0, maxLength || 500);
    }
    
    // Rate limiting simple pour le chatbot (anti-spam)
    var rateLimiter = {
        messages: [],
        maxMessages: 10,
        timeWindow: 60000, // 1 minute
        isAllowed: function() {
            var now = Date.now();
            // Nettoyer les anciens messages
            this.messages = this.messages.filter(function(time) {
                return now - time < this.timeWindow;
            }.bind(this));
            // Vérifier la limite
            if (this.messages.length >= this.maxMessages) {
                return false;
            }
            this.messages.push(now);
            return true;
        }
    };

    /* ----- Configuration WhatsApp (valeurs par défaut, surchargées par le CMS) ----- */
    var WHATSAPP_NUMBER  = '261386984531';
    var WHATSAPP_MESSAGE = "Bonjour, je suis intéressé(e) par les solutions digitales Datalio. J'aimerais en savoir plus pour mon entreprise.";

    function buildWhatsAppLink(productName) {
        var msg = WHATSAPP_MESSAGE;
        if (productName) {
            // Sécurité : échapper le nom du produit
            var safeName = truncateInput(productName, 100);
            msg = "Bonjour Datalio, je suis intéressé(e) par votre service \"" + safeName + "\". J'aimerais en savoir plus pour mon entreprise.";
        }
        // Sécurité : valider le numéro
        var safeNumber = sanitizePhoneNumber(WHATSAPP_NUMBER);
        if (!safeNumber) return '#';
        return 'https://wa.me/' + safeNumber + '?text=' + encodeURIComponent(msg);
    }

    function refreshWhatsAppLinks() {
        document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
            var product = el.getAttribute('data-product');
            var href = buildWhatsAppLink(product);
            // Sécurité : valider l'URL avant de l'appliquer
            if (isValidUrl(href)) {
                el.setAttribute('href', href);
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
    refreshWhatsAppLinks();

    /* ----- Année du footer ----- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ----- Menu mobile ----- */
    var burger = document.querySelector('.nav__burger');
    var links  = document.querySelector('.nav__links');
    if (burger && links) {
        burger.addEventListener('click', function () {
            var isOpen = links.classList.toggle('nav__links--open');
            burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        links.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                links.classList.remove('nav__links--open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ----- Apparition au scroll ----- */
    function setupReveal() {
        var revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(function (el) { observer.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        }
    }
    setupReveal();

    /* =========================================
       CHATBOT DATALIO
       ========================================= */
    var chatbot = document.getElementById('chatbot');
    var chatbotTrigger = document.getElementById('chatbot-trigger');
    var chatbotClose = document.getElementById('chatbot-close');
    var chatbotWindow = document.getElementById('chatbot-window');
    var chatbotMessages = document.getElementById('chatbot-messages');
    var chatbotForm = document.getElementById('chatbot-form');
    var chatbotInput = document.getElementById('chatbot-input');
    var chatbotSuggestions = document.getElementById('chatbot-suggestions');

    // Base de connaissances du chatbot - Réponses courtes et directes avec liens
    var botKnowledge = {
        greetings: [
            "Bonjour ! 👋 Comment puis-je vous aider ?",
            "Bienvenue ! Posez-moi vos questions sur nos services.",
            "Bonjour ! 😊 Que puis-je faire pour vous ?"
        ],
        services: "Nos 5 services :\n\n" +
            "📊 <a href=\"#solutions\">Outils de gestion</a>\n" +
            "⚡ <a href=\"#solutions\">Automatisation</a>\n" +
            "🤖 <a href=\"#solutions\">Chatbots</a>\n" +
            "🌐 <a href=\"#solutions\">Sites web</a>\n" +
            "👥 <a href=\"#solutions\">Suivi client</a>\n\n" +
            "→ <a href=\"#solutions\">Voir tous les détails</a>",
        pricing: "Les prix sont définis après un audit gratuit de votre besoin.\n\n" +
            "Chaque solution est personnalisée selon votre activité.\n\n" +
            "→ <a href=\"#\" data-whatsapp>Demander un devis gratuit sur WhatsApp</a>",
        order: "Pour commander :\n\n" +
            "1. On échange sur votre besoin\n" +
            "2. On prépare votre solution\n" +
            "3. Vous l'utilisez !\n\n" +
            "→ <a href=\"#\" data-whatsapp>Commander sur WhatsApp</a>",
        human: "Notre équipe est disponible sur WhatsApp.\n\n" +
            "→ <a href=\"#\" data-whatsapp>Parler à un conseiller</a>",
        automation: "**Automatisation des tâches** :\n" +
            "Rappels, rapports, calculs et alertes automatiques.\n\n" +
            "→ <a href=\"#solutions\">En savoir plus</a>\n" +
            "→ <a href=\"#\" data-whatsapp data-product=\"Automatisation des tâches\">Commander</a>",
        chatbots: "**Chatbots pour entreprises** :\n" +
            "Réponses 24/7, basés sur vos données, intégrés à WhatsApp.\n\n" +
            "→ <a href=\"#solutions\">En savoir plus</a>\n" +
            "→ <a href=\"#\" data-whatsapp data-product=\"Chatbots pour entreprises\">Commander</a>",
        website: "**Sites web professionnels** :\n" +
            "Design responsive, SEO optimisé, hébergement inclus.\n\n" +
            "→ <a href=\"#solutions\">En savoir plus</a>\n" +
            "→ <a href=\"#\" data-whatsapp data-product=\"Création de sites web\">Commander</a>",
        gestion: "**Outils de gestion** :\n" +
            "Tableau de bord, suivi ventes/stock, trésorerie.\n\n" +
            "→ <a href=\"#solutions\">En savoir plus</a>\n" +
            "→ <a href=\"#\" data-whatsapp data-product=\"Outils de gestion personnalisés\">Commander</a>",
        suivi: "**Suivi client intelligent** :\n" +
            "Fiches client, relances automatiques, pipeline commercial.\n\n" +
            "→ <a href=\"#solutions\">En savoir plus</a>\n" +
            "→ <a href=\"#\" data-whatsapp data-product=\"Suivi client intelligent\">Commander</a>",
        excel: "Non, pas que Excel ! On propose :\n" +
            "• Outils de gestion (Excel, Google Sheets ou apps)\n" +
            "• Automatisations\n" +
            "• Chatbots\n" +
            "• Sites web\n" +
            "• Suivi client\n\n" +
            "→ <a href=\"#solutions\">Voir nos solutions</a>",
        informatique: "Pas besoin d'être expert ! Nos outils sont simples et on vous accompagne.\n\n" +
            "→ <a href=\"#faq\">Voir la FAQ</a>",
        assistance: "Oui, une assistance est incluse avec chaque solution.\n\n" +
            "→ <a href=\"#\" data-whatsapp>Nous contacter</a>",
        localisation: "Basés à Antananarivo 🇲🇬, on travaille avec 8 pays francophones.\n\n" +
            "→ <a href=\"#apropos\">En savoir plus sur nous</a>",
        etapes: "Comment ça marche :\n\n" +
            "1️⃣ Vous décrivez votre besoin\n" +
            "2️⃣ On prépare l'outil\n" +
            "3️⃣ Vous l'utilisez !\n\n" +
            "→ <a href=\"#etapes\">Voir les détails</a>\n" +
            "→ <a href=\"#\" data-whatsapp>Démarrer maintenant</a>",
        thanks: "Avec plaisir ! 😊\n\n" +
            "→ <a href=\"#\" data-whatsapp>Besoin d'autre chose ?</a>",
        default: "Je n'ai pas la réponse, mais notre équipe peut vous aider !\n\n" +
            "→ <a href=\"#\" data-whatsapp>Poser la question sur WhatsApp</a>"
    };

    // Fonction pour formater les messages (markdown basique + liens)
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // Ajouter un message dans le chat
    function addMessage(text, isBot) {
        // Sécurité : limiter la taille du message
        var safeText = truncateInput(text, 2000);
        
        var messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot__message chatbot__message--' + (isBot ? 'bot' : 'user');
        
        // Sécurité : échapper le contenu utilisateur, formater seulement le bot
        if (isBot) {
            messageDiv.innerHTML = formatMessage(safeText);
            // Activer les liens WhatsApp dans les messages du bot
            setTimeout(function() {
                refreshWhatsAppLinks();
            }, 10);
        } else {
            // Les messages utilisateur sont toujours échappés en texte pur
            messageDiv.textContent = safeText;
        }
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return messageDiv;
    }

    // Afficher l'indicateur de frappe
    function showTyping() {
        var typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot__message chatbot__message--bot chatbot__message--typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Cacher l'indicateur de frappe
    function hideTyping() {
        var typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    // Analyser le message et générer une réponse
    function getBotResponse(userMessage) {
        var msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Détection des intentions
        if (msg.match(/\b(bonjour|salut|hello|hi|hey|coucou|bonsoir)\b/)) {
            return botKnowledge.greetings[Math.floor(Math.random() * botKnowledge.greetings.length)];
        }
        if (msg.match(/\b(service|solution|propose|offre|faites|quoi faire)\b/)) {
            return botKnowledge.services;
        }
        if (msg.match(/\b(prix|tarif|cout|combien|cher|budget|devis)\b/)) {
            return botKnowledge.pricing;
        }
        if (msg.match(/\b(commander|commande|acheter|souscrire|demarrer|commencer)\b/)) {
            return botKnowledge.order;
        }
        if (msg.match(/\b(comment.*(marche|fonctionne)|etape|processus|procedure)\b/)) {
            return botKnowledge.etapes;
        }
        if (msg.match(/\b(humain|personne|quelqu.?un|parler|agent|conseiller|reel|equipe)\b/)) {
            return botKnowledge.human;
        }
        if (msg.match(/\b(automat|tache|repetiti|rappel|rapport|calcul|alertes?)\b/)) {
            return botKnowledge.automation;
        }
        if (msg.match(/\b(chatbot|bot|assistant|whatsapp|messenger|facebook|24.?7)\b/)) {
            return botKnowledge.chatbots;
        }
        if (msg.match(/\b(site|web|internet|vitrine|landing|page|seo|google)\b/)) {
            return botKnowledge.website;
        }
        if (msg.match(/\b(gestion|tableau|bord|stock|vente|tresorerie|livraison|commandes?)\b/)) {
            return botKnowledge.gestion;
        }
        if (msg.match(/\b(suivi|client|crm|relance|historique|pipeline|commercial)\b/)) {
            return botKnowledge.suivi;
        }
        if (msg.match(/\b(excel|sheets?|fichier|format)\b/)) {
            return botKnowledge.excel;
        }
        if (msg.match(/\b(informatique|technique|debutant|facile|difficile|complique)\b/)) {
            return botKnowledge.informatique;
        }
        if (msg.match(/\b(assistance|aide|support|accompagnement|question)\b/)) {
            return botKnowledge.assistance;
        }
        if (msg.match(/\b(ou|localisation|pays|madagascar|antananarivo|afrique|francophone)\b/)) {
            return botKnowledge.localisation;
        }
        if (msg.match(/\b(merci|thanks|super|genial|parfait|excellent|top|cool)\b/)) {
            return botKnowledge.thanks;
        }
        
        return botKnowledge.default;
    }

    // Gérer l'envoi de message
    function handleUserMessage(text) {
        // Sécurité : vérifier et nettoyer l'entrée
        if (!text || typeof text !== 'string') return;
        var cleanText = truncateInput(text.trim(), 500);
        if (!cleanText) return;
        
        // Sécurité : rate limiting anti-spam
        if (!rateLimiter.isAllowed()) {
            addMessage("Merci de patienter un moment avant d'envoyer d'autres messages. 🙏", true);
            return;
        }
        
        // Cacher le badge après le premier message
        chatbot.classList.add('badge-hidden');
        
        // Ajouter le message utilisateur
        addMessage(cleanText, false);
        
        // Afficher l'indicateur de frappe
        showTyping();
        
        // Simuler un délai de réponse (entre 800ms et 1500ms)
        var delay = 800 + Math.random() * 700;
        setTimeout(function() {
            hideTyping();
            var response = getBotResponse(cleanText);
            addMessage(response, true);
        }, delay);
    }

    // Initialiser le chatbot
    function initChatbot() {
        if (!chatbot) return;

        // Ouvrir/Fermer le chatbot
        chatbotTrigger.addEventListener('click', function() {
            var isOpen = chatbot.classList.toggle('is-open');
            chatbotWindow.setAttribute('aria-hidden', !isOpen);
            
            // Afficher le message d'accueil au premier ouverture
            if (isOpen && chatbotMessages.children.length === 0) {
                setTimeout(function() {
                    addMessage(botKnowledge.greetings[0], true);
                }, 300);
            }
            
            if (isOpen) {
                chatbotInput.focus();
            }
        });

        chatbotClose.addEventListener('click', function() {
            chatbot.classList.remove('is-open');
            chatbotWindow.setAttribute('aria-hidden', 'true');
        });

        // Fermer avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && chatbot.classList.contains('is-open')) {
                chatbot.classList.remove('is-open');
                chatbotWindow.setAttribute('aria-hidden', 'true');
            }
        });

        // Soumettre le formulaire
        chatbotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var text = chatbotInput.value;
            // Sécurité : nettoyer l'input après récupération
            chatbotInput.value = '';
            handleUserMessage(text);
        });

        // Gestion des suggestions rapides
        chatbotSuggestions.querySelectorAll('.chatbot__suggestion').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var message = btn.getAttribute('data-message');
                // Sécurité : valider que le message vient bien d'un attribut attendu
                if (message && typeof message === 'string' && message.length < 100) {
                    handleUserMessage(message);
                }
            });
        });
    }

    initChatbot();

    /* ----- Mapping des noms d'icônes vers le sprite SVG ----- */
    // Si l'admin utilise un emoji par habitude, on le convertit automatiquement.
    var EMOJI_TO_ICON = {
        '📊': 'bar-chart', '⚡': 'zap',  '💬': 'bot',     '👥': 'users',
        '🌐': 'globe',     '🚀': 'rocket','🎯': 'target', '🌱': 'sprout',
        '⏱️': 'timer',     '🤝': 'handshake', '✨': 'sparkles',
        '🏪': 'store',     '💎': 'gem',  '⚙️': 'settings', '📈': 'trending-up',
        '📓': 'notebook',  '🧮': 'calculator', '📉': 'trending-down',
        '🤖': 'bot'
    };
    function resolveIconName(raw) {
        if (!raw) return 'sparkles';
        if (EMOJI_TO_ICON[raw]) return EMOJI_TO_ICON[raw];
        // Sinon on suppose que c'est déjà un nom d'icône valide (ex: "bar-chart")
        return String(raw).toLowerCase().trim();
    }
    function iconHtml(name, extraClass) {
        var cls = 'icon' + (extraClass ? ' ' + extraClass : '');
        return '<svg class="' + cls + '" aria-hidden="true"><use href="#icon-' + escapeAttr(resolveIconName(name)) + '"></use></svg>';
    }


    function applyContent(c) {
        if (!c || typeof c !== 'object') return;

        // ----- WhatsApp -----
        if (c.whatsapp) {
            // Sécurité : valider et sanitizer le numéro
            if (c.whatsapp.number) {
                var safeNumber = sanitizePhoneNumber(c.whatsapp.number);
                if (safeNumber && safeNumber.length >= 8 && safeNumber.length <= 15) {
                    WHATSAPP_NUMBER = safeNumber;
                }
            }
            // Sécurité : limiter la taille du message
            if (c.whatsapp.default_message && typeof c.whatsapp.default_message === 'string') {
                WHATSAPP_MESSAGE = truncateInput(c.whatsapp.default_message, 500);
            }
        }

        // ----- HERO -----
        if (c.hero) {
            setText('[data-cms="hero.badge"]',     c.hero.badge);
            setText('[data-cms="hero.title_part1"]',     c.hero.title_part1);
            setText('[data-cms="hero.title_highlight"]', c.hero.title_highlight);
            setText('[data-cms="hero.title_part2"]',     c.hero.title_part2);
            setText('[data-cms="hero.subtitle"]', c.hero.subtitle);
            setText('[data-cms="hero.tagline"]',  c.hero.tagline);
            setText('[data-cms="hero.cta_primary"]',   c.hero.cta_primary);
            setText('[data-cms="hero.cta_secondary"]', c.hero.cta_secondary);
            setText('[data-cms="hero.point_1"]', c.hero.point_1);
            setText('[data-cms="hero.point_2"]', c.hero.point_2);
            setText('[data-cms="hero.point_3"]', c.hero.point_3);
        }

        // ----- SERVICES -----
        var solutionsContainer = document.querySelector('.solutions');
        if (solutionsContainer && Array.isArray(c.services) && c.services.length > 0) {
            solutionsContainer.innerHTML = c.services.map(function (s) {
                var benefits = (s.benefits || []).map(function (b) {
                    return '<li>' + escapeHtml(b) + '</li>';
                }).join('');
                var featuredClass = s.featured ? ' solution--featured' : '';
                return ''
                    + '<article class="solution reveal' + featuredClass + '">'
                    +   '<div class="solution__icon">' + iconHtml(s.icon) + '</div>'
                    +   '<h3>' + escapeHtml(s.title || '') + '</h3>'
                    +   '<p>' + escapeHtml(s.description || '') + '</p>'
                    +   '<ul class="solution__list">' + benefits + '</ul>'
                    +   '<a class="btn btn--gold btn--block" href="#" data-whatsapp data-product="' + escapeAttr(s.title || '') + '">Commander</a>'
                    + '</article>';
            }).join('');
        }

        // ----- TEMOIGNAGES -----
        var testimonialsContainer = document.querySelector('.testimonials');
        if (testimonialsContainer && Array.isArray(c.testimonials) && c.testimonials.length > 0) {
            testimonialsContainer.innerHTML = c.testimonials.map(function (t) {
                var initial = (t.name || '?').charAt(0).toUpperCase();
                return ''
                    + '<figure class="testimonial reveal">'
                    +   '<div class="testimonial__stars" aria-label="5 étoiles sur 5">★★★★★</div>'
                    +   '<blockquote>' + escapeHtml(t.quote || '') + '</blockquote>'
                    +   '<figcaption>'
                    +     '<div class="avatar">' + escapeHtml(initial) + '</div>'
                    +     '<div>'
                    +       '<strong>' + escapeHtml(t.name || '') + '</strong>'
                    +       '<span>' + escapeHtml(t.role || '') + '</span>'
                    +     '</div>'
                    +   '</figcaption>'
                    + '</figure>';
            }).join('');
        }

        // ----- FAQ -----
        var faqContainer = document.querySelector('.faq');
        if (faqContainer && Array.isArray(c.faq) && c.faq.length > 0) {
            faqContainer.innerHTML = c.faq.map(function (f) {
                return ''
                    + '<details class="faq__item reveal">'
                    +   '<summary>' + escapeHtml(f.question || '') + '</summary>'
                    +   '<p>' + escapeHtml(f.answer || '') + '</p>'
                    + '</details>';
            }).join('');
        }

        // ----- CONTACT -----
        if (c.contact) {
            document.querySelectorAll('[data-cms="contact.phone"]').forEach(function (el) {
                el.textContent = c.contact.phone || el.textContent;
                if (c.contact.phone_link) {
                    el.setAttribute('href', 'tel:' + c.contact.phone_link.replace(/\s/g, ''));
                }
            });
        }

        // Re-applique les liens WhatsApp et les animations sur les nouveaux éléments
        refreshWhatsAppLinks();
        setupReveal();
    }

    // Fonction setText pour le CMS (avec protection)
    function setText(selector, value) {
        if (!value) return;
        var el = document.querySelector(selector);
        if (el) {
            // Sécurité : utiliser textContent au lieu de innerHTML
            el.textContent = truncateInput(value, 500);
        }
    }

    // Charge le contenu depuis le fichier JSON (modifié via Pages CMS)
    if (window.fetch) {
        fetch('content/site.json', { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data) applyContent(data); })
            .catch(function () { /* fallback : on garde le HTML par défaut */ });
    }
})();
