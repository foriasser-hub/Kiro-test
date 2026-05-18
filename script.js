/* =========================================
   Datalio — Solutions digitales pour entreprises
   Interactions JS (vanilla, sans dépendance)
   ========================================= */
(function () {
    'use strict';

    /* ----- Configuration WhatsApp ----- */
    var WHATSAPP_NUMBER  = '261386984531'; // sans le "+"
    var WHATSAPP_MESSAGE = "Bonjour, je suis intéressé(e) par les solutions digitales Datalio. J'aimerais en savoir plus pour mon entreprise.";

    function buildWhatsAppLink(productName) {
        var msg = WHATSAPP_MESSAGE;
        if (productName) {
            msg = "Bonjour Datalio, je suis intéressé(e) par votre service \"" + productName + "\". J'aimerais en savoir plus pour mon entreprise.";
        }
        return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    }

    document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
        var product = el.getAttribute('data-product');
        el.setAttribute('href', buildWhatsAppLink(product));
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
    });

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
    var revealEls = document.querySelectorAll('.reveal');
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
})();
