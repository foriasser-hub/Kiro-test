/* =========================================================
   Datalio — Analytics helpers
   ---------------------------------------------------------
   - Expose window.trackEvent(name, { category, label, ... })
   - Listener déléguée pour [data-track-event] (clics)
   - Listener pour la soumission du formulaire chatbot
     → événement 'form_submit'

   Aucun crash si Google Analytics n'est pas configuré : si
   window.gtag n'est pas une fonction (ID placeholder, GA bloqué
   par un adblocker, etc.), trackEvent() est silencieusement ignoré.
   ========================================================= */
(function () {
    'use strict';

    function trackEvent(eventName, params) {
        if (typeof window.gtag !== 'function' || !eventName) return;
        var p = params || {};
        try {
            window.gtag('event', String(eventName), {
                event_category: p.category || 'engagement',
                event_label: p.label || '',
                page_location: window.location.href,
                page_path: window.location.pathname,
                page_title: document.title
            });
        } catch (e) {
            /* On ne casse jamais l'UX si l'envoi GA échoue */
        }
    }

    /* Exposé globalement pour pouvoir être appelé depuis n'importe
       où (script.js, inline scripts, console pour debug, etc.) */
    window.trackEvent = trackEvent;

    /* Délégation : tout élément avec data-track-event déclenche
       un événement au clic, sans devoir attacher manuellement. */
    document.addEventListener('click', function (e) {
        var target = e.target && e.target.closest
            ? e.target.closest('[data-track-event]')
            : null;
        if (!target) return;

        var name = target.getAttribute('data-track-event');
        var label = target.getAttribute('data-track-label')
            || (target.textContent || '').trim().slice(0, 80);
        var category = target.getAttribute('data-track-category') || 'cta';

        trackEvent(name, { category: category, label: label });
    }, true);

    /* Suivi de la soumission du formulaire chatbot (form_submit).
       Si d'autres formulaires sont ajoutés plus tard, on peut les
       traquer en ajoutant data-track-event="form_submit" sur le <form>. */
    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form || form.nodeName !== 'FORM') return;

        if (form.id === 'chatbot-form') {
            trackEvent('form_submit', {
                category: 'chatbot',
                label: 'chatbot_message_envoye'
            });
            return;
        }

        var explicit = form.getAttribute('data-track-event');
        if (explicit) {
            trackEvent(explicit, {
                category: form.getAttribute('data-track-category') || 'form',
                label: form.getAttribute('data-track-label') || form.id || 'form'
            });
        }
    }, true);
})();
