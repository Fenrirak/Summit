(function () {
    'use strict';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initStickyOffset() {
        var bar = document.querySelector('.topbar');
        if (!bar) return;

        function measure() {
            document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px');
        }

        measure();
        window.addEventListener('resize', measure);
        if (window.ResizeObserver) new ResizeObserver(measure).observe(bar);
    }

    function initPopIn() {
        var groups = Array.prototype.slice.call(document.querySelectorAll('.pop-group'));
        if (!groups.length) return;

        var groupEntries = groups.map(function (group) {
            var items = Array.prototype.slice.call(group.querySelectorAll('.pop-in'));
            return {
                group: group,
                items: items.map(function (el, i) { return { el: el, offset: i * 22 }; })
            };
        }).filter(function (g) { return g.items.length; });
        if (!groupEntries.length) return;

        if (reduceMotion) {
            groupEntries.forEach(function (g) {
                g.items.forEach(function (entry) { entry.el.style.opacity = 1; });
            });
            return;
        }

        function update() {
            var vh = window.innerHeight;
            var startY = vh * 0.92;
            var endY = vh * 0.50;

            groupEntries.forEach(function (g) {
                var groupTop = g.group.getBoundingClientRect().top;

                g.items.forEach(function (entry) {
                    var top = groupTop + entry.offset;
                    var progress = (startY - top) / (startY - endY);
                    if (progress < 0) progress = 0;
                    else if (progress > 1) progress = 1;

                    if (progress >= 1) {
                        entry.el.style.opacity = '';
                        entry.el.style.transform = '';
                    } else {
                        entry.el.style.opacity = progress;
                        entry.el.style.transform = 'translateY(' + (26 * (1 - progress)) + 'px)';
                    }
                });
            });
        }

        var ticking = false;
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function () { update(); ticking = false; });
                ticking = true;
            }
        }

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        document.querySelectorAll('img').forEach(function (img) {
            if (!img.complete) img.addEventListener('load', onScroll, { once: true });
        });
    }

    function initBackToTop() {
        var btn = document.querySelector('.back-to-top');
        if (!btn) return;

        function update() {
            var show = window.scrollY > 400;
            btn.classList.toggle('visible', show);
        }

        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    function init() {
        initStickyOffset();
        initPopIn();
        initBackToTop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
