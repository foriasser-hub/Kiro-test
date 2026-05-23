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
    var WHATSAPP_NUMBER  = '261386315306';
    var WHATSAPP_MESSAGE = "Bonjour Datalio, je souhaite discuter d'un projet digital.";

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
       CHATBOT DATALIO - Agent configuré selon brief
       
       COMPORTEMENT :
       - Répond en français, court et direct (2-3 phrases max)
       - Ne jamais inventer de prix ou de délais
       - Si ne sait pas → redirige vers WhatsApp
       
       SERVICES :
       1. Sites web premium (avec SEO, Analytics, admin sécurisé inclus)
       2. Mini-logiciels de gestion (tableaux de bord, stock, ventes)
       3. Chatbots pour entreprises (WhatsApp, web, Facebook)
       4. Automatisations pour petites entreprises (rappels, rapports, alertes)
       5. Maintenance & accompagnement digital (mises à jour, conseils)
       ========================================= */
    var chatbot = document.getElementById('chatbot');
    var chatbotTrigger = document.getElementById('chatbot-trigger');
    var chatbotClose = document.getElementById('chatbot-close');
    var chatbotWindow = document.getElementById('chatbot-window');
    var chatbotMessages = document.getElementById('chatbot-messages');
    var chatbotForm = document.getElementById('chatbot-form');
    var chatbotInput = document.getElementById('chatbot-input');
    var chatbotSuggestions = document.getElementById('chatbot-suggestions');

    // Liens de redirection
    var LINKS = {
        solutions: 'https://datalio.online/#solutions',
        whatsapp: 'https://wa.me/261386315306',
        blog: 'https://datalio.online/blog/'
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
    // RÉPONSES DE L'AGENT DATALIO
    // Court, direct, professionnel (2-3 phrases)
    // ============================================
    function getBotResponse(userMessage) {
        var msg = normalizeText(userMessage);
        
        // --- SALUTATIONS ---
        if (containsKeyword(msg, ['bonjour', 'salut', 'hello', 'hi', 'hey', 'coucou', 'bonsoir'])) {
            return "Bonjour ! 👋 Je suis l'assistant Datalio. Comment puis-je vous aider ?";
        }
        
        // --- REMERCIEMENTS ---
        if (containsKeyword(msg, ['merci', 'thanks', 'super', 'genial', 'parfait', 'excellent'])) {
            return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">WhatsApp</a>";
        }
        
        // --- PARLER À UN HUMAIN ---
        if (containsKeyword(msg, ['humain', 'personne', 'quelqu', 'parler', 'agent', 'conseiller', 'equipe', 'contact'])) {
            return "Notre équipe est disponible sur WhatsApp : <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">Discuter maintenant</a>";
        }
        
        // --- PRIX / DEVIS / COMBIEN ---
        if (containsKeyword(msg, ['prix', 'tarif', 'cout', 'combien', 'cher', 'budget', 'devis', 'gratuit'])) {
            return "Les tarifs dépendent de votre besoin. Écrivez-nous directement : <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">WhatsApp</a>";
        }
        
        // --- DÉLAI ---
        if (containsKeyword(msg, ['delai', 'combien temps', 'duree', 'rapide', 'urgent', 'vite'])) {
            return "Le délai dépend du projet. Discutons de votre besoin : <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">WhatsApp</a>";
        }
        
        // --- LISTE DES SERVICES ---
        if (containsKeyword(msg, ['service', 'solution', 'propose', 'offre', 'faites', 'quoi faire', 'liste', 'activite'])) {
            return "Nous proposons : sites web premium, mini-logiciels de gestion, chatbots, automatisations et maintenance & accompagnement digital. SEO, Google Analytics et espace admin sécurisé sont inclus dans nos sites premium. <a href=\"" + LINKS.solutions + "\">Voir les services</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">discuter sur WhatsApp</a>";
        }
        
        // --- COMMANDER ---
        if (containsKeyword(msg, ['commander', 'commande', 'acheter', 'souscrire', 'demarrer', 'commencer', 'interesse'])) {
            return "Super ! Écrivez-nous pour en discuter : <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">WhatsApp</a>";
        }
        
        // --- CHATBOT / BOT ---
        if (containsKeyword(msg, ['chatbot', 'bot', 'assistant', 'messenger', '24h', '24/7'])) {
            return "Nous créons des chatbots sur mesure pour WhatsApp, votre site ou Facebook. <a href=\"" + LINKS.solutions + "\">Voir le service</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">discuter sur WhatsApp</a>";
        }
        
        // --- WHATSAPP (service) ---
        if (containsKeyword(msg, ['whatsapp', 'messagerie', 'repondre client', 'message auto'])) {
            return "Nous créons des chatbots WhatsApp qui répondent automatiquement à vos clients 24/7. <a href=\"" + LINKS.solutions + "\">En savoir plus</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">commander</a>";
        }
        
        // --- AUTOMATISATION ---
        if (containsKeyword(msg, ['automat', 'tache', 'repetit', 'rappel', 'rapport', 'calcul', 'alerte', 'gain temps'])) {
            return "Nous automatisons vos tâches répétitives : rappels, rapports, alertes. <a href=\"" + LINKS.solutions + "\">Voir le service</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">discuter sur WhatsApp</a>";
        }
        
        // --- SITE WEB ---
        if (containsKeyword(msg, ['site', 'web', 'internet', 'vitrine', 'landing', 'page', 'seo', 'google', 'en ligne'])) {
            return "Nous créons des sites web premium sur-mesure. SEO de base, Google Analytics, espace admin sécurisé, chatbot, WhatsApp et formulaire de contact sont inclus. <a href=\"" + LINKS.solutions + "\">Voir le service</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">discuter sur WhatsApp</a>";
        }
        
        // --- GESTION / TABLEAU DE BORD ---
        if (containsKeyword(msg, ['gestion', 'tableau', 'bord', 'stock', 'vente', 'tresorerie', 'livraison', 'inventaire', 'caisse'])) {
            return "Nous créons des outils de gestion sur mesure : stock, ventes, trésorerie. <a href=\"" + LINKS.solutions + "\">Voir le service</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">discuter sur WhatsApp</a>";
        }
        
        // --- SUIVI CLIENT / CRM ---
        if (containsKeyword(msg, ['suivi', 'client', 'crm', 'relance', 'historique', 'pipeline', 'commercial', 'prospect'])) {
            return "Le suivi client (mini-CRM, relances, historique) peut être intégré à votre mini-logiciel de gestion ou à votre site web premium. <a href=\"" + LINKS.solutions + "\">Voir nos services</a> ou <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">discuter sur WhatsApp</a>";
        }
        
        // --- EXCEL / FICHIER ---
        if (containsKeyword(msg, ['excel', 'sheet', 'fichier', 'format', 'google'])) {
            return "Nous proposons des solutions complètes : Excel, Google Sheets, applications et plus. <a href=\"" + LINKS.solutions + "\">Voir nos services</a>";
        }
        
        // --- INFORMATIQUE / DÉBUTANT ---
        if (containsKeyword(msg, ['informatique', 'technique', 'debutant', 'facile', 'difficile', 'complique', 'fort', 'savoir'])) {
            return "Pas besoin d'être expert ! Nos outils sont simples et nous vous accompagnons. <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">En savoir plus</a>";
        }
        
        // --- ASSISTANCE / AIDE ---
        if (containsKeyword(msg, ['assistance', 'aide', 'support', 'accompagnement', 'formation', 'apprendre'])) {
            return "Une assistance est incluse avec chaque solution. Nous vous accompagnons ! <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">Nous contacter</a>";
        }
        
        // --- PERSONNALISER ---
        if (containsKeyword(msg, ['personnalis', 'adapte', 'sur mesure', 'specifique', 'besoin', 'secteur'])) {
            return "Oui, chaque solution est adaptée à votre activité et vos besoins. <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">Discutons de votre projet</a>";
        }
        
        // --- BLOG ---
        if (containsKeyword(msg, ['blog', 'article', 'conseil', 'astuce', 'lire'])) {
            return "Consultez nos articles sur la digitalisation : <a href=\"" + LINKS.blog + "\" target=\"_blank\">Voir le blog</a>";
        }
        
        // --- LOCALISATION / MADAGASCAR ---
        if (containsKeyword(msg, ['ou', 'localisation', 'pays', 'madagascar', 'antananarivo', 'afrique', 'distance'])) {
            return "Nous sommes basés à Antananarivo, Madagascar, et travaillons avec toute l'Afrique francophone. <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">Nous contacter</a>";
        }
        
        // --- QUI ÊTES-VOUS / DATALIO ---
        if (containsKeyword(msg, ['qui', 'datalio', 'entreprise', 'agence', 'equipe', 'propos'])) {
            return "Datalio aide les petites entreprises d'Afrique francophone à digitaliser leur activité. <a href=\"" + LINKS.solutions + "\">Voir nos services</a>";
        }
        
        // --- RÉPONSE PAR DÉFAUT (hors sujet) ---
        return "Je suis l'assistant Datalio, je réponds aux questions sur nos services. <a href=\"" + LINKS.whatsapp + "\" target=\"_blank\">Contactez-nous sur WhatsApp</a>";
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
                    addMessage("Bonjour ! 👋 Je suis l'assistant Datalio. Comment puis-je vous aider ?", true);
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
                var title = s.title || '';
                /* Event name dérivé du titre du service pour l'analytics */
                var lc = title.toLowerCase();
                var eventName = 'services_click';
                if (lc.indexOf('site web premium') !== -1 || lc.indexOf('site web') !== -1) {
                    eventName = 'premium_sites_click';
                } else if (lc.indexOf('mini-logiciel') !== -1 || lc.indexOf('mini logiciel') !== -1 || lc.indexOf('outil de gestion') !== -1) {
                    eventName = 'management_software_click';
                }
                return ''
                    + '<article class="solution reveal' + featuredClass + '">'
                    +   '<div class="solution__icon">' + iconHtml(s.icon) + '</div>'
                    +   '<h3>' + escapeHtml(title) + '</h3>'
                    +   '<p>' + escapeHtml(s.description || '') + '</p>'
                    +   '<ul class="solution__list">' + benefits + '</ul>'
                    +   '<a class="btn btn--gold btn--block" href="#" data-whatsapp'
                    +     ' data-product="' + escapeAttr(title) + '"'
                    +     ' data-track-event="' + escapeAttr(eventName) + '"'
                    +     ' data-track-category="service_card"'
                    +     ' data-track-label="' + escapeAttr(title) + '"'
                    +   '>Demander un devis</a>'
                    + '</article>';
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
            // phone_link sur les <a> dédiés (section contact)
            document.querySelectorAll('[data-cms="contact.phone_link"]').forEach(function (el) {
                if (c.contact.phone_link) {
                    el.setAttribute('href', 'tel:' + c.contact.phone_link.replace(/\s/g, ''));
                }
            });
            // email
            if (c.contact.email && typeof c.contact.email === 'string') {
                document.querySelectorAll('[data-cms="contact.email"]').forEach(function (el) {
                    var safeEmail = c.contact.email.trim();
                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
                        if (el.tagName === 'A') {
                            el.setAttribute('href', 'mailto:' + safeEmail);
                        }
                        // Met à jour aussi le texte si l'élément est un simple lien-email
                        var hasOnlyText = el.children.length === 0;
                        if (hasOnlyText) el.textContent = safeEmail;
                    }
                });
            }
            // adresse
            if (c.contact.address) {
                document.querySelectorAll('[data-cms="contact.address"]').forEach(function (el) {
                    el.textContent = c.contact.address;
                });
            }
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

    /* =========================================
       CHARGEMENT DU CONTENU CMS
       -----------------------------------------
       1. content/site.json est la source principale (hero, contact,
          about, expertises, etc.) — toujours chargé en premier.
       2. content/services.json, faq.json, testimonials.json sont des
          collections dédiées éditées via Pages CMS. Si elles existent,
          elles remplacent les sections correspondantes de site.json.
       3. Si un fichier est absent ou invalide, on retombe silencieusement
          sur les données de site.json puis sur le HTML statique. Le site
          ne casse jamais.
       ========================================= */
    function fetchJsonSafe(path) {
        if (!window.fetch) return null;
        return fetch(path, { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }

    function extractItems(data) {
        if (!data) return null;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.items)) return data.items;
        return null;
    }

    function filterActive(items) {
        if (!Array.isArray(items)) return items;
        return items.filter(function (it) {
            return it && (it.active === undefined || it.active === true);
        });
    }

    if (window.fetch && window.Promise) {
        Promise.all([
            fetchJsonSafe('content/site.json'),
            fetchJsonSafe('content/services.json'),
            fetchJsonSafe('content/faq.json'),
            fetchJsonSafe('content/testimonials.json'),
            fetchJsonSafe('content/settings.json')
        ]).then(function (results) {
            var data = results[0] || {};
            var services = extractItems(results[1]);
            var faq = extractItems(results[2]);
            var testimonials = extractItems(results[3]);
            var settings = results[4] || {};
            if (services) data.services = filterActive(services);
            if (faq) data.faq = faq;
            if (testimonials) data.testimonials = filterActive(testimonials);
            // settings.contact_form → exposé sous c.contact_form pour applyContent
            if (settings.contact_form) data.contact_form = settings.contact_form;
            applyContent(data);
        }).catch(function () { /* le site garde le HTML statique */ });
    } else if (window.fetch) {
        fetch('content/site.json', { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data) applyContent(data); })
            .catch(function () { /* fallback */ });
    }
})();
