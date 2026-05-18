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
