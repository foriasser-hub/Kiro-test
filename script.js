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
        timeWindow: 60000,
        isAllowed: function() {
            var now = Date.now();
            this.messages = this.messages.filter(function(time) {
                return now - time < this.timeWindow;
            }.bind(this));
            if (this.messages.length >= this.maxMessages) {
                return false;
            }
            this.messages.push(now);
            return true;
        }
    };

    /* ----- Configuration WhatsApp ----- */
    var WHATSAPP_NUMBER  = '261386984531';
    var WHATSAPP_MESSAGE = "Bonjour, je suis intéressé(e) par les solutions digitales Datalio. J'aimerais en savoir plus pour mon entreprise.";

    function buildWhatsAppLink(productName) {
        var msg = WHATSAPP_MESSAGE;
        if (productName) {
            var safeName = truncateInput(productName, 100);
            msg = "Bonjour Datalio, je suis intéressé(e) par votre service \"" + safeName + "\". J'aimerais en savoir plus pour mon entreprise.";
        }
        var safeNumber = sanitizePhoneNumber(WHATSAPP_NUMBER);
        if (!safeNumber) return '#';
        return 'https://wa.me/' + safeNumber + '?text=' + encodeURIComponent(msg);
    }

    function refreshWhatsAppLinks() {
        document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
            var product = el.getAttribute('data-product');
            var href = buildWhatsAppLink(product);
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
       CHATBOT DATALIO - Basé sur Services & FAQ
       ========================================= */
    var chatbot = document.getElementById('chatbot');
    var chatbotTrigger = document.getElementById('chatbot-trigger');
    var chatbotClose = document.getElementById('chatbot-close');
    var chatbotWindow = document.getElementById('chatbot-window');
    var chatbotMessages = document.getElementById('chatbot-messages');
    var chatbotForm = document.getElementById('chatbot-form');
    var chatbotInput = document.getElementById('chatbot-input');
    var chatbotSuggestions = document.getElementById('chatbot-suggestions');

    // Données CMS chargées dynamiquement
    var cmsData = {
        services: [],
        faq: [],
        loaded: false
    };

    // Normaliser le texte (minuscules, sans accents)
    function normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Vérifier si un texte contient un mot-clé
    function containsKeyword(text, keywords) {
        var normalized = normalizeText(text);
        for (var i = 0; i < keywords.length; i++) {
            if (normalized.indexOf(keywords[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    // Formater les messages (markdown basique + liens)
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    // Ajouter un message dans le chat
    function addMessage(text, isBot) {
        var safeText = truncateInput(text, 2000);
        var messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot__message chatbot__message--' + (isBot ? 'bot' : 'user');
        
        if (isBot) {
            messageDiv.innerHTML = formatMessage(safeText);
            setTimeout(function() { refreshWhatsAppLinks(); }, 10);
        } else {
            messageDiv.textContent = safeText;
        }
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return messageDiv;
    }

    // Indicateur de frappe
    function showTyping() {
        var typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot__message chatbot__message--bot chatbot__message--typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function hideTyping() {
        var typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    // ============================================
    // LOGIQUE DE RÉPONSE DU CHATBOT
    // ============================================

    // Trouver un service par mots-clés spécifiques
    function findService(keywords) {
        if (!cmsData.services || cmsData.services.length === 0) return null;
        
        for (var i = 0; i < cmsData.services.length; i++) {
            var service = cmsData.services[i];
            var searchText = (service.title || '') + ' ' + (service.description || '');
            if (containsKeyword(searchText, keywords)) {
                return service;
            }
        }
        return null;
    }

    // Trouver une FAQ par mots-clés spécifiques
    function findFAQ(keywords) {
        if (!cmsData.faq || cmsData.faq.length === 0) return null;
        
        for (var i = 0; i < cmsData.faq.length; i++) {
            var faq = cmsData.faq[i];
            var searchText = (faq.question || '') + ' ' + (faq.answer || '');
            if (containsKeyword(searchText, keywords)) {
                return faq;
            }
        }
        return null;
    }

    // Formater la réponse d'un service
    function formatServiceResponse(service) {
        var response = '**' + service.title + '**\n\n';
        response += service.description + '\n\n';
        
        if (service.benefits && service.benefits.length > 0) {
            service.benefits.forEach(function(b) {
                response += '✓ ' + b + '\n';
            });
            response += '\n';
        }
        
        response += '→ <a href="#solutions">Voir les détails</a>\n';
        response += '→ <a href="#" data-whatsapp data-product="' + service.title + '">Commander ce service</a>';
        
        return response;
    }

    // Formater la réponse d'une FAQ
    function formatFAQResponse(faq) {
        return faq.answer + '\n\n→ <a href="#faq">Voir toutes les FAQ</a>';
    }

    // Liste des services
    function getServicesList() {
        if (!cmsData.services || cmsData.services.length === 0) {
            return "Nos services sont en cours de chargement...\n\n→ <a href=\"#solutions\">Voir la section services</a>";
        }

        var iconMap = {
            'bar-chart': '📊',
            'zap': '⚡',
            'bot': '🤖',
            'globe': '🌐',
            'users': '👥'
        };

        var response = 'Voici nos services :\n\n';
        cmsData.services.forEach(function(s) {
            var emoji = iconMap[s.icon] || '✨';
            response += emoji + ' **' + s.title + '**\n';
        });
        response += '\n→ <a href="#solutions">Voir tous les détails</a>\n';
        response += '→ <a href="#" data-whatsapp>Demander un devis</a>';
        
        return response;
    }

    // ============================================
    // FONCTION PRINCIPALE DE RÉPONSE
    // ============================================
    function getBotResponse(userMessage) {
        var msg = normalizeText(userMessage);
        var service, faq;
        
        // --- SALUTATIONS ---
        if (containsKeyword(msg, ['bonjour', 'salut', 'hello', 'hi', 'hey', 'coucou', 'bonsoir'])) {
            return "Bonjour ! 👋 Comment puis-je vous aider ?\n\nVous pouvez me poser des questions sur nos services ou cliquer sur les suggestions ci-dessous.";
        }
        
        // --- REMERCIEMENTS ---
        if (containsKeyword(msg, ['merci', 'thanks', 'super', 'genial', 'parfait', 'excellent'])) {
            return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions.\n\n→ <a href=\"#\" data-whatsapp>Nous contacter sur WhatsApp</a>";
        }
        
        // --- PARLER À UN HUMAIN ---
        if (containsKeyword(msg, ['humain', 'personne', 'quelqu', 'parler', 'agent', 'conseiller', 'equipe'])) {
            return "Notre équipe est disponible pour vous aider !\n\n→ <a href=\"#\" data-whatsapp>Parler à un conseiller sur WhatsApp</a>";
        }
        
        // --- LISTE DES SERVICES ---
        if (containsKeyword(msg, ['service', 'solution', 'propose', 'offre', 'faites', 'quoi faire', 'liste'])) {
            return getServicesList();
        }
        
        // --- PRIX / DEVIS ---
        if (containsKeyword(msg, ['prix', 'tarif', 'cout', 'combien', 'cher', 'budget', 'devis'])) {
            faq = findFAQ(['prix', 'tarif', 'devis']);
            if (faq) return formatFAQResponse(faq);
            return "Les prix sont définis selon votre besoin spécifique.\n\nChaque solution est personnalisée pour votre activité.\n\n→ <a href=\"#\" data-whatsapp>Demander un devis gratuit</a>";
        }
        
        // --- COMMANDER ---
        if (containsKeyword(msg, ['commander', 'commande', 'acheter', 'souscrire', 'demarrer', 'commencer'])) {
            faq = findFAQ(['commander', 'commande']);
            if (faq) return formatFAQResponse(faq);
            return "Pour commander :\n\n1️⃣ On échange sur votre besoin\n2️⃣ On prépare votre solution\n3️⃣ Vous l'utilisez !\n\n→ <a href=\"#\" data-whatsapp>Commander sur WhatsApp</a>";
        }
        
        // --- CHATBOT / BOT ---
        if (containsKeyword(msg, ['chatbot', 'bot', 'assistant', 'whatsapp', 'messenger', '24h', '24/7'])) {
            service = findService(['chatbot', 'bot', 'assistant']);
            if (service) return formatServiceResponse(service);
        }
        
        // --- AUTOMATISATION ---
        if (containsKeyword(msg, ['automat', 'tache', 'repetit', 'rappel', 'rapport', 'calcul', 'alerte'])) {
            service = findService(['automat', 'tache']);
            if (service) return formatServiceResponse(service);
        }
        
        // --- SITE WEB ---
        if (containsKeyword(msg, ['site', 'web', 'internet', 'vitrine', 'landing', 'page', 'seo', 'google'])) {
            service = findService(['site', 'web', 'vitrine']);
            if (service) return formatServiceResponse(service);
        }
        
        // --- GESTION / TABLEAU DE BORD ---
        if (containsKeyword(msg, ['gestion', 'tableau', 'bord', 'stock', 'vente', 'tresorerie', 'livraison'])) {
            service = findService(['gestion', 'tableau', 'stock']);
            if (service) return formatServiceResponse(service);
        }
        
        // --- SUIVI CLIENT / CRM ---
        if (containsKeyword(msg, ['suivi', 'client', 'crm', 'relance', 'historique', 'pipeline', 'commercial'])) {
            service = findService(['suivi', 'client', 'crm']);
            if (service) return formatServiceResponse(service);
        }
        
        // --- EXCEL / FICHIER ---
        if (containsKeyword(msg, ['excel', 'sheet', 'fichier', 'format'])) {
            faq = findFAQ(['excel', 'fichier']);
            if (faq) return formatFAQResponse(faq);
        }
        
        // --- INFORMATIQUE / DÉBUTANT ---
        if (containsKeyword(msg, ['informatique', 'technique', 'debutant', 'facile', 'difficile', 'complique', 'fort'])) {
            faq = findFAQ(['informatique', 'debutant', 'fort']);
            if (faq) return formatFAQResponse(faq);
        }
        
        // --- ASSISTANCE / AIDE ---
        if (containsKeyword(msg, ['assistance', 'aide', 'support', 'accompagnement'])) {
            faq = findFAQ(['assistance', 'aide']);
            if (faq) return formatFAQResponse(faq);
        }
        
        // --- PERSONNALISER ---
        if (containsKeyword(msg, ['personnalis', 'adapte', 'sur mesure', 'specifique', 'activite'])) {
            faq = findFAQ(['personnalis', 'adapte']);
            if (faq) return formatFAQResponse(faq);
        }
        
        // --- RÉPONSE PAR DÉFAUT ---
        return "Je n'ai pas bien compris votre question. 🤔\n\nVoici ce que je peux faire :\n• Vous présenter nos services\n• Répondre à vos questions\n• Vous mettre en contact avec notre équipe\n\n→ <a href=\"#\" data-whatsapp>Poser votre question sur WhatsApp</a>";
    }

    // Gérer l'envoi de message
    function handleUserMessage(text) {
        if (!text || typeof text !== 'string') return;
        var cleanText = truncateInput(text.trim(), 500);
        if (!cleanText) return;
        
        if (!rateLimiter.isAllowed()) {
            addMessage("Merci de patienter un moment avant d'envoyer d'autres messages. 🙏", true);
            return;
        }
        
        chatbot.classList.add('badge-hidden');
        addMessage(cleanText, false);
        showTyping();
        
        var delay = 600 + Math.random() * 500;
        setTimeout(function() {
            hideTyping();
            var response = getBotResponse(cleanText);
            addMessage(response, true);
        }, delay);
    }

    // Initialiser le chatbot
    function initChatbot() {
        if (!chatbot) return;

        chatbotTrigger.addEventListener('click', function() {
            var isOpen = chatbot.classList.toggle('is-open');
            chatbotWindow.setAttribute('aria-hidden', !isOpen);
            
            if (isOpen && chatbotMessages.children.length === 0) {
                setTimeout(function() {
                    addMessage("Bonjour ! 👋 Comment puis-je vous aider ?\n\nVous pouvez me poser des questions sur nos services.", true);
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

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && chatbot.classList.contains('is-open')) {
                chatbot.classList.remove('is-open');
                chatbotWindow.setAttribute('aria-hidden', 'true');
            }
        });

        chatbotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var text = chatbotInput.value;
            chatbotInput.value = '';
            handleUserMessage(text);
        });

        chatbotSuggestions.querySelectorAll('.chatbot__suggestion').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var message = btn.getAttribute('data-message');
                if (message && typeof message === 'string' && message.length < 100) {
                    handleUserMessage(message);
                }
            });
        });
    }

    initChatbot();

    /* ----- Mapping des icônes ----- */
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
        return String(raw).toLowerCase().trim();
    }
    function iconHtml(name, extraClass) {
        var cls = 'icon' + (extraClass ? ' ' + extraClass : '');
        return '<svg class="' + cls + '" aria-hidden="true"><use href="#icon-' + escapeAttr(resolveIconName(name)) + '"></use></svg>';
    }


    function applyContent(c) {
        if (!c || typeof c !== 'object') return;

        // Charger les données dans le chatbot
        if (Array.isArray(c.services)) {
            cmsData.services = c.services;
        }
        if (Array.isArray(c.faq)) {
            cmsData.faq = c.faq;
        }
        cmsData.loaded = true;

        // WhatsApp
        if (c.whatsapp) {
            if (c.whatsapp.number) {
                var safeNumber = sanitizePhoneNumber(c.whatsapp.number);
                if (safeNumber && safeNumber.length >= 8 && safeNumber.length <= 15) {
                    WHATSAPP_NUMBER = safeNumber;
                }
            }
            if (c.whatsapp.default_message && typeof c.whatsapp.default_message === 'string') {
                WHATSAPP_MESSAGE = truncateInput(c.whatsapp.default_message, 500);
            }
        }

        // HERO
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

        // SERVICES
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

        // TEMOIGNAGES
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

        // FAQ
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

        // CONTACT
        if (c.contact) {
            document.querySelectorAll('[data-cms="contact.phone"]').forEach(function (el) {
                el.textContent = c.contact.phone || el.textContent;
                if (c.contact.phone_link) {
                    el.setAttribute('href', 'tel:' + c.contact.phone_link.replace(/\s/g, ''));
                }
            });
        }

        refreshWhatsAppLinks();
        setupReveal();
    }

    function setText(selector, value) {
        if (!value) return;
        var el = document.querySelector(selector);
        if (el) {
            el.textContent = truncateInput(value, 500);
        }
    }

    // Charger le contenu CMS
    if (window.fetch) {
        fetch('content/site.json', { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data) applyContent(data); })
            .catch(function () { /* fallback */ });
    }
})();
