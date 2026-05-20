/* =========================================
   Datalio — Solutions digitales pour entreprises
   Interactions JS + chargement du contenu CMS
   ========================================= */
(function () {
    'use strict';

    /* ----- Configuration WhatsApp (valeurs par défaut, surchargées par le CMS) ----- */
    var WHATSAPP_NUMBER  = '261386984531';
    var WHATSAPP_MESSAGE = "Bonjour, je suis intéressé(e) par les solutions digitales Datalio. J'aimerais en savoir plus pour mon entreprise.";

    function buildWhatsAppLink(productName) {
        var msg = WHATSAPP_MESSAGE;
        if (productName) {
            msg = "Bonjour Datalio, je suis intéressé(e) par votre service \"" + productName + "\". J'aimerais en savoir plus pour mon entreprise.";
        }
        return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    }

    function refreshWhatsAppLinks() {
        document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
            var product = el.getAttribute('data-product');
            el.setAttribute('href', buildWhatsAppLink(product));
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener');
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

    // Base de connaissances du chatbot
    var botKnowledge = {
        greetings: [
            "Bonjour ! 👋 Je suis l'assistant Datalio. Comment puis-je vous aider aujourd'hui ?",
            "Bienvenue chez Datalio ! 🎉 Je suis là pour répondre à vos questions sur nos solutions digitales.",
            "Salut ! 😊 Ravi de vous accueillir. Que puis-je faire pour vous ?"
        ],
        services: "Datalio propose **5 services** pour digitaliser votre entreprise :\n\n" +
            "📊 **Outils de gestion** — Tableaux de bord, suivi ventes, stock, trésorerie\n" +
            "⚡ **Automatisation** — Rappels, rapports, calculs automatiques\n" +
            "🤖 **Chatbots** — Assistants 24/7 pour WhatsApp et Web\n" +
            "🌐 **Sites web** — Sites vitrines professionnels et optimisés SEO\n" +
            "👥 **Suivi client** — CRM simple pour gérer vos relations clients\n\n" +
            "Quel service vous intéresse ?",
        pricing: "Nos tarifs sont **personnalisés** selon vos besoins. 💰\n\n" +
            "Chaque solution est adaptée à votre activité, vos processus et votre budget.\n\n" +
            "Pour obtenir un **devis gratuit**, discutons sur WhatsApp ! Je peux vous y rediriger si vous le souhaitez. 📱",
        order: "Commander chez Datalio, c'est simple ! 🚀\n\n" +
            "1️⃣ **Discutez** avec nous sur WhatsApp\n" +
            "2️⃣ **Expliquez** votre besoin et votre activité\n" +
            "3️⃣ **Recevez** une proposition adaptée\n" +
            "4️⃣ **Validez** et on lance la mise en place !\n\n" +
            "Voulez-vous que je vous redirige vers WhatsApp pour démarrer ?",
        human: "Bien sûr ! 🙋‍♂️ Je comprends que vous préfériez parler à un humain.\n\n" +
            "Notre équipe est disponible sur **WhatsApp** au **+261 38 69 845 31**.\n\n" +
            "Cliquez sur le bouton ci-dessous pour nous contacter directement !",
        automation: "L'**automatisation** est notre spécialité ! ⚡\n\n" +
            "On peut automatiser :\n" +
            "• Rappels et relances clients\n" +
            "• Génération de rapports\n" +
            "• Calculs et alertes de stock\n" +
            "• Envois de messages programmés\n" +
            "• Et bien plus selon votre activité !\n\n" +
            "Quelle tâche aimeriez-vous automatiser ?",
        chatbots: "Nos **chatbots** sont intelligents et personnalisés ! 🤖\n\n" +
            "Ils peuvent :\n" +
            "• Répondre à vos clients 24h/24\n" +
            "• Prendre des commandes\n" +
            "• Donner des infos sur vos produits\n" +
            "• S'intégrer à WhatsApp, votre site web ou Facebook\n\n" +
            "Le tout basé sur **vos données** et votre activité !",
        website: "Nous créons des **sites web professionnels** ! 🌐\n\n" +
            "Ce qu'on propose :\n" +
            "• Design moderne et responsive\n" +
            "• Optimisation SEO (Google)\n" +
            "• Hébergement et HTTPS inclus\n" +
            "• Adapté à votre image de marque\n\n" +
            "Vous avez déjà une idée de ce que vous voulez ?",
        thanks: "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider !",
        default: "Je comprends votre question ! 🤔\n\n" +
            "Pour vous donner la meilleure réponse, je vous suggère de **discuter directement avec notre équipe** sur WhatsApp.\n\n" +
            "Ils pourront vous accompagner personnellement ! 📱"
    };

    // Fonction pour formater les messages (markdown basique)
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // Ajouter un message dans le chat
    function addMessage(text, isBot) {
        var messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot__message chatbot__message--' + (isBot ? 'bot' : 'user');
        messageDiv.innerHTML = isBot ? formatMessage(text) : escapeHtml(text);
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
        if (msg.match(/\b(service|solution|propose|offre|faites|quoi)\b/)) {
            return botKnowledge.services;
        }
        if (msg.match(/\b(prix|tarif|cout|combien|cher|budget|devis)\b/)) {
            return botKnowledge.pricing;
        }
        if (msg.match(/\b(commander|commande|acheter|souscrire|demarrer|commencer|comment faire)\b/)) {
            return botKnowledge.order;
        }
        if (msg.match(/\b(humain|personne|quelqu'un|parler|agent|conseiller|reel)\b/)) {
            return botKnowledge.human;
        }
        if (msg.match(/\b(automat|tache|repetiti|rappel|rapport|calcul)\b/)) {
            return botKnowledge.automation;
        }
        if (msg.match(/\b(chatbot|bot|assistant|whatsapp|messenger|facebook)\b/)) {
            return botKnowledge.chatbots;
        }
        if (msg.match(/\b(site|web|internet|vitrine|landing|page)\b/)) {
            return botKnowledge.website;
        }
        if (msg.match(/\b(merci|thanks|super|genial|parfait|excellent)\b/)) {
            return botKnowledge.thanks;
        }
        
        return botKnowledge.default;
    }

    // Gérer l'envoi de message
    function handleUserMessage(text) {
        if (!text.trim()) return;
        
        // Cacher le badge après le premier message
        chatbot.classList.add('badge-hidden');
        
        // Ajouter le message utilisateur
        addMessage(text, false);
        
        // Afficher l'indicateur de frappe
        showTyping();
        
        // Simuler un délai de réponse (entre 800ms et 1500ms)
        var delay = 800 + Math.random() * 700;
        setTimeout(function() {
            hideTyping();
            var response = getBotResponse(text);
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
            chatbotInput.value = '';
            handleUserMessage(text);
        });

        // Gestion des suggestions rapides
        chatbotSuggestions.querySelectorAll('.chatbot__suggestion').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var message = btn.getAttribute('data-message');
                handleUserMessage(message);
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
        if (!c) return;

        // ----- WhatsApp -----
        if (c.whatsapp) {
            if (c.whatsapp.number)          WHATSAPP_NUMBER  = String(c.whatsapp.number).replace(/[^0-9]/g, '');
            if (c.whatsapp.default_message) WHATSAPP_MESSAGE = c.whatsapp.default_message;
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

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot;');
    }

    // Charge le contenu depuis le fichier JSON (modifié via Pages CMS)
    if (window.fetch) {
        fetch('content/site.json', { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data) applyContent(data); })
            .catch(function () { /* fallback : on garde le HTML par défaut */ });
    }
})();
