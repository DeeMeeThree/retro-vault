(function () {
    'use strict';

    const SHELF_COUNT = 10;
    const BASE_PATH = 'images/shelf/etagere-';
    const EXT = '.webp';

    function getShelfParam() {
        const params = new URLSearchParams(window.location.search);
        let s = parseInt(params.get('shelf'), 10);
        if (isNaN(s)) s = 1;
        s = Math.min(Math.max(s, 1), SHELF_COUNT);
        return s;
    }

    function initShelf(trackEl, viewportEl) {
        const shelf = getShelfParam();

        const title = document.getElementById('shelf-title');
        if (title) title.textContent = 'Étagère ' + shelf;

        if (!trackEl) return;

        // Create the shelf image. It is sized by its natural ratio: height matches the
        // viewport, width follows the aspect ratio, enabling free horizontal scrolling.
        const img = document.createElement('img');
        img.className = 'shelf-image';
        img.alt = 'Étagère ' + shelf;
        img.src = BASE_PATH + shelf + EXT;

        // Subtle start offset so the first game isn't glued to the left edge.
        const spacerBefore = document.createElement('div');
        spacerBefore.className = 'shelf-gutter';

        trackEl.appendChild(spacerBefore);
        trackEl.appendChild(img);

        // Zoom-in entrance on load.
        img.addEventListener('load', function () {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    img.classList.add('shelf-zoom-in');
                });
            });
        });

        // Free scroll: vertical wheel input is translated into horizontal scrolling so
        // a user scrolling naturally with the mouse wheel moves along the shelf.
        if (viewportEl) {
            viewportEl.addEventListener('wheel', function (e) {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.preventDefault();
                    const step = e.deltaY;
                    const max = viewportEl.scrollWidth - viewportEl.clientWidth;
                    viewportEl.scrollLeft = Math.max(0, Math.min(max, viewportEl.scrollLeft + step));
                }
            }, { passive: false });

            // Keep the scroll position valid when the window is resized.
            window.addEventListener('resize', function () {
                viewportEl.scrollLeft = Math.min(viewportEl.scrollLeft, viewportEl.scrollWidth - viewportEl.clientWidth);
            });
        }

        }

    window.Shelf = {
        init: initShelf
    };
})();
