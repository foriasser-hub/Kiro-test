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
       CHATBOT DATALIO - Basé sur les données CMS
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

    // Messages de base du chatbot (uniquement les messages génériques)
    var botMessages = {
        greetings: [
            "Bonjour ! 👋 Comment puis-je vous aider ?",
            "Bienvenue ! Posez-moi vos questions sur nos services.",
            "Bonjour ! 😊 Que puis-je faire pour vous ?"
        ],
        thanks: "Avec plaisir ! 😊\n\n→ <a href=\"#\" data-whatsapp>Besoin d'autre chose ?</a>",
        human: "Notre équipe est disponible sur WhatsApp.\n\n→ <a href=\"#\" data-whatsapp>Parler à un conseiller</a>",
        default: "Je n'ai pas trouvé de réponse précise, mais notre équipe peut vous aider !\n\n→ <a href=\"#\" data-whatsapp>Poser la question sur WhatsApp</a>"
    };

    // Fonction pour normaliser le texte (enlever accents, minuscules)
    function normalizeText(text) {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Fonction pour calculer la similarité entre deux textes
    function getMatchScore(text, keywords) {
        var normalizedText = normalizeText(text);
        var score = 0;
        keywords.forEach(function(keyword) {
            if (normalizedText.indexOf(normalizeText(keyword)) !== -1) {
                score += keyword.length; // Score plus élevé pour les mots plus longs
            }
        });
        return score;
    }

    // Extraire les mots-clés d'un texte
    function extractKeywords(text) {
        var words = normalizeText(text).split(/\s+/);
        // Filtrer les mots courts et les mots communs
        var stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'a', 'au', 'aux', 'en', 'est', 'ce', 'qui', 'que', 'pour', 'dans', 'sur', 'avec', 'par', 'je', 'vous', 'nous', 'il', 'elle', 'ils', 'elles', 'son', 'sa', 'ses', 'votre', 'vos', 'mon', 'ma', 'mes', 'ca', 'cela', 'cette', 'ces', 'quoi', 'comment', 'pourquoi', 'quand', 'faire', 'fait', 'etre', 'avoir', 'plus', 'aussi', 'tres', 'bien', 'tout', 'tous', 'toute', 'toutes'];
        return words.filter(function(word) {
            return word.length > 2 && stopWords.indexOf(word) === -1;
        });
    }

    // Chercher dans les services
    function searchServices(userMessage) {
        if (!cmsData.services || cmsData.services.length === 0) return null;
        
        var userKeywords = extractKeywords(userMessage);
        var bestMatch = null;
        var bestScore = 0;

        cmsData.services.forEach(function(service) {
            // Créer une liste de mots-clés à partir du service
            var serviceKeywords = [];
            if (service.title) serviceKeywords = serviceKeywords.concat(extractKeywords(service.title));
            if (service.description) serviceKeywords = serviceKeywords.concat(extractKeywords(service.description));
            if (service.benefits) {
                service.benefits.forEach(function(b) {
                    serviceKeywords = serviceKeywords.concat(extractKeywords(b));
                });
            }

            // Calculer le score de correspondance
            var score = 0;
            userKeywords.forEach(function(uk) {
                serviceKeywords.forEach(function(sk) {
                    if (sk.indexOf(uk) !== -1 || uk.indexOf(sk) !== -1) {
                        score += Math.min(uk.length, sk.length);
                    }
                });
            });

            if (score > bestScore) {
                bestScore = score;
                bestMatch = service;
            }
        });

        // Retourner seulement si le score est suffisant
        if (bestScore >= 4 && bestMatch) {
            var benefits = (bestMatch.benefits || []).map(function(b) {
                return '• ' + b;
            }).join('\n');
            
            return '**' + bestMatch.title + '**\n\n' +
                bestMatch.description + '\n\n' +
                (benefits ? benefits + '\n\n' : '') +
                '→ <a href="#solutions">En savoir plus</a>\n' +
                '→ <a href="#" data-whatsapp data-product="' + bestMatch.title + '">Commander ce service</a>';
        }

        return null;
    }

    // Chercher dans la FAQ
    function searchFAQ(userMessage) {
        if (!cmsData.faq || cmsData.faq.length === 0) return null;
        
        var userKeywords = extractKeywords(userMessage);
        var bestMatch = null;
        var bestScore = 0;

        cmsData.faq.forEach(function(faq) {
            var faqKeywords = extractKeywords(faq.question + ' ' + faq.answer);
            
            var score = 0;
            userKeywords.forEach(function(uk) {
                faqKeywords.forEach(function(fk) {
                    if (fk.indexOf(uk) !== -1 || uk.indexOf(fk) !== -1) {
                        score += Math.min(uk.length, fk.length);
                    }
                });
            });

            if (score > bestScore) {
                bestScore = score;
                bestMatch = faq;
            }
        });

        // Retourner seulement si le score est suffisant
        if (bestScore >= 4 && bestMatch) {
            return '**' + bestMatch.question + '**\n\n' + bestMatch.answer + '\n\n→ <a href="#faq">Voir toutes les FAQ</a>';
        }

        return null;
    }

    // Générer la liste des services
    function getServicesListResponse() {
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

        var servicesList = cmsData.services.map(function(s) {
            var emoji = iconMap[s.icon] || '✨';
            return emoji + ' ' + s.title;
        }).join('\n');

        return 'Nos services :\n\n' + servicesList + '\n\n→ <a href="#solutions">Voir tous les détails</a>\n→ <a href="#" data-whatsapp>Demander un devis</a>';
    }

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

    // Analyser le message et générer une réponse basée sur les données CMS
    function getBotResponse(userMessage) {
        var msg = normalizeText(userMessage);
        
        // 1. Salutations
        if (msg.match(/\b(bonjour|salut|hello|hi|hey|coucou|bonsoir)\b/)) {
            return botMessages.greetings[Math.floor(Math.random() * botMessages.greetings.length)];
        }
        
        // 2. Remerciements
        if (msg.match(/\b(merci|thanks|super|genial|parfait|excellent|top|cool)\b/)) {
            return botMessages.thanks;
        }
        
        // 3. Demande de parler à un humain
        if (msg.match(/\b(humain|personne|quelqu.?un|parler|agent|conseiller|reel|equipe)\b/)) {
            return botMessages.human;
        }
        
        // 4. Demande de liste des services
        if (msg.match(/\b(service|solution|propose|offre|faites|quoi faire|liste)\b/)) {
            return getServicesListResponse();
        }
        
        // 5. Questions sur les prix/devis
        if (msg.match(/\b(prix|tarif|cout|combien|cher|budget|devis)\b/)) {
            return "Les prix sont définis après un échange sur votre besoin.\n\nChaque solution est personnalisée selon votre activité.\n\n→ <a href=\"#\" data-whatsapp>Demander un devis gratuit sur WhatsApp</a>";
        }
        
        // 6. Comment commander
        if (msg.match(/\b(commander|commande|acheter|souscrire|demarrer|commencer)\b/)) {
            return "Pour commander :\n\n1. On échange sur votre besoin\n2. On prépare votre solution\n3. Vous l'utilisez !\n\n→ <a href=\"#\" data-whatsapp>Commander sur WhatsApp</a>";
        }
        
        // 7. Chercher d'abord dans la FAQ (priorité aux questions fréquentes)
        var faqResponse = searchFAQ(userMessage);
        if (faqResponse) {
            return faqResponse;
        }
        
        // 8. Chercher dans les services
        var serviceResponse = searchServices(userMessage);
        if (serviceResponse) {
            return serviceResponse;
        }
        
        // 9. Réponse par défaut
        return botMessages.default;
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
                    addMessage(botMessages.greetings[0], true);
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

        // ----- Charger les données dans le chatbot -----
        if (Array.isArray(c.services)) {
            cmsData.services = c.services;
        }
        if (Array.isArray(c.faq)) {
            cmsData.faq = c.faq;
        }
        cmsData.loaded = true;

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
