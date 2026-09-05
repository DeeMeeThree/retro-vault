// Shelf modal: opens a fullscreen, horizontally scrollable view of an étagère
// photo directly on the cabinet page (no separate shelf page).
// The open/close zoom is done in pure CSS (@keyframes) via the .open/.closing
// classes; this script only toggles them and wires the inputs.
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
    let closing = false;

    function buildImage(shelf) {
        track.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'shelf-image';
        img.alt = 'Étagère ' + shelf;
        img.src = BASE_PATH + shelf + EXT;
        track.appendChild(img);
        return img;
    }

    function openModal(shelf) {
        if (!modal || modal.classList.contains('open')) return;
        closing = false;
        lastFocused = document.activeElement;

        buildImage(shelf);
        titleChip.textContent = 'Étagère ' + shelf;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        viewport.scrollLeft = 0;
    }

    function closeModal() {
        if (!modal || !modal.classList.contains('open') || closing) return;
        closing = true;
        modal.classList.add('closing');
        document.body.style.overflow = '';
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // Hide fully once the close pop has finished
    function onAnimationEnd(e) {
        if (e.target !== modal || !closing) return;
        modal.classList.remove('open', 'closing');
        track.innerHTML = '';
        closing = false;
    }

    // Hotspots → open modal
    document.querySelectorAll('.shelf-hotspot').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            const shelf = parseInt(el.dataset.shelf, 10);
            if (isNaN(shelf) || shelf < 1 || shelf > SHELF_COUNT) return;
            openModal(shelf);
        });
    });

    // Close: ✕ button, backdrop click, Escape
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBackdrop) closeBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
    if (modal) modal.addEventListener('animationend', onAnimationEnd);

    // Vertical wheel input scrolls the shelf horizontally
    if (viewport) {
        viewport.addEventListener('wheel', function (e) {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                const step = e.deltaY;
                const max = viewport.scrollWidth - viewport.clientWidth;
                viewport.scrollLeft = Math.max(0, Math.min(max, viewport.scrollLeft + step));
            }
        }, { passive: false });

        // Keep the scroll position valid on resize
        window.addEventListener('resize', function () {
            viewport.scrollLeft = Math.min(viewport.scrollLeft, viewport.scrollWidth - viewport.clientWidth);
        });
    }
})();