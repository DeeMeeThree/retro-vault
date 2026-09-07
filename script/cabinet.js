// Shelf modal: opens a fullscreen, horizontally scrollable view of an étagère
// photo directly on the cabinet page (no separate shelf page).
// The modal starts at the exact position/size of the clicked shelf
// and transitions to fullscreen via CSS custom properties.
(function () {
    'use strict';

    const SHELF_COUNT = 10;
    const BASE_PATH = 'images/shelf/etagere-';
    const EXT = '.webp';

    const modal = document.getElementById('shelf-modal');
    const viewport = document.getElementById('shelf-modal-viewport');
    const track = document.getElementById('shelf-modal-track');
    const titleChip = document.getElementById('shelf-modal-title');
    const closeBtn = document.getElementById('shelf-modal-x');
    const closeBackdrop = document.getElementById('shelf-modal-close');

    let lastFocused = null;
    let animating = false;

    // Preload all shelf images once, keep them in a map, and reuse the same
    // Image object when showing the modal (it is already cached / decoded).
    var preloaded = {};
    for (var i = 1; i <= SHELF_COUNT; i++) {
        var preloader = new Image();
        preloader.src = BASE_PATH + i + EXT;
        preloaded[i] = preloader;
    }

    function buildImage(shelf) {
        track.innerHTML = '';
        var img = preloaded[shelf];
        img.className = 'shelf-image';
        img.alt = 'Étagère ' + shelf;
        track.appendChild(img);
        return img;
    }

    function setImageWidths(img, startW) {
        img.style.setProperty('--img-w-start', startW + 'px');
        if (!img.naturalWidth || !img.naturalHeight) return;
        var renderHeight = window.innerHeight * 0.88;
        var endW = img.naturalWidth * (renderHeight / img.naturalHeight);
        img.style.setProperty('--img-w-end', endW + 'px');
        img.classList.add('loaded');
    }

    function openModal(shelf, hotspotEl) {
        if (!modal || modal.classList.contains('open') || animating) return;
        animating = true;
        lastFocused = document.activeElement;

        var rect = hotspotEl.getBoundingClientRect();
        var rectWidth = rect.width;
        modal.style.setProperty('--modal-top', rect.top + 'px');
        modal.style.setProperty('--modal-left', rect.left + 'px');
        modal.style.setProperty('--modal-width', rectWidth + 'px');
        modal.style.setProperty('--modal-height', rect.height + 'px');

        var img = buildImage(shelf);
        img.style.setProperty('--img-w-start', rectWidth + 'px');
        titleChip.textContent = 'Étagère ' + shelf;
        viewport.scrollLeft = 0;

        modal.style.display = 'flex';
        modal.offsetHeight;

        function startAnimation() {
            setImageWidths(img, rectWidth);
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';

            modal.addEventListener('transitionend', function onOpen(e) {
                if (e.propertyName !== 'opacity') return;
                modal.removeEventListener('transitionend', onOpen);
                animating = false;
            });
        }

        if (img.complete && img.naturalWidth) {
            startAnimation();
        } else {
            img.addEventListener('load', function onLoad() {
                img.removeEventListener('load', onLoad);
                startAnimation();
            });
            img.addEventListener('error', function onError() {
                img.removeEventListener('error', onError);
                startAnimation();
            });
        }
    }

    function closeModal() {
        if (!modal || !modal.classList.contains('open') || animating) return;
        animating = true;
        var img = track.querySelector('.shelf-image');
        if (img) img.classList.remove('loaded');
        modal.classList.remove('open');

        function onClose(e) {
            if (e.propertyName !== 'opacity') return;
            modal.removeEventListener('transitionend', onClose);
            modal.style.display = '';
            animating = false;
            track.innerHTML = '';
            document.body.style.overflow = '';
            if (lastFocused && lastFocused.focus) lastFocused.focus();
        }
        modal.addEventListener('transitionend', onClose);
    }

    document.querySelectorAll('.shelf-hotspot').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            var shelf = parseInt(el.dataset.shelf, 10);
            if (isNaN(shelf) || shelf < 1 || shelf > SHELF_COUNT) return;
            openModal(shelf, el);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBackdrop) closeBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    if (viewport) {
        viewport.addEventListener('wheel', function (e) {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                var step = e.deltaY;
                var max = viewport.scrollWidth - viewport.clientWidth;
                viewport.scrollLeft = Math.max(0, Math.min(max, viewport.scrollLeft + step));
            }
        }, { passive: false });

        window.addEventListener('resize', function () {
            viewport.scrollLeft = Math.min(viewport.scrollLeft, viewport.scrollWidth - viewport.clientWidth);
        });
    }
})();
