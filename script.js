let gamesData = [];
let currentSort = 'year';
let sortDesc = false;
let currentView = 'grid';

function parseCSV(str) {
    const rows = [];
    let row = [];
    let inQuotes = false;
    let val = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            row.push(val);
            val = "";
        } else if (char === '\n' && !inQuotes) {
            row.push(val.replace(/\r$/, ''));
            if (row.length > 0) rows.push(row);
            row = [];
            val = "";
        } else {
            val += char;
        }
    }
    if (val || row.length > 0) {
        row.push(val);
        rows.push(row);
    }
    return rows;
}

function renderCards(data) {
    if (currentView === 'list') {
        renderList(data);
        return;
    }
    const grid = document.getElementById('games-grid');
    const defaultImg = 'ps1';

    grid.innerHTML = data.map((cols) => {
        if (cols.length < 12) return '';
        const title = cols[0];
        const year = cols[1];
        const type = cols[2];
        const desc = cols[3];
        const mark = cols[11];
        const consoleName = cols[4] ? cols[4].trim() : '';
        const img = cols[5] ? cols[5].trim() : defaultImg;
        const pathToImg = `images/covers/${img}.webp`;
        const linkIGN = cols[6];
        const classIGN = cols[6] === "" ? "hidden": "";
        const markIGN = cols[7];
        const linkMetaCritic = cols[8];
        const classMetaCritic = cols[8] === "" ? "hidden" : "";
        const linkJVC = cols[9];
        const classJVC = cols[9] === "" ? "hidden" : "";
        const markJVC = cols[10];

        const ratioClass = 'ratio-' + consoleName.toLowerCase();

        return `
            <div class="w-full xxs:w-[75%] xs:w-[60%] sm:w-full flex items-center justify-center justify-self-center">
                <div class="flip-card w-full cursor-pointer group ${ratioClass}">
                <div class="flip-card-inner relative w-full h-full">
                    <!-- 3D Box Edges -->
                    <div class="flip-card-spine"><span>${title}</span></div>
                    <div class="flip-card-edge flip-card-edge-right"></div>
                    <div class="flip-card-edge flip-card-edge-top"></div>
                    <div class="flip-card-edge flip-card-edge-bottom"></div>
                    <!-- Front -->
                    <div class="flip-card-front bg-[#1a1a1a] overflow-hidden group-hover:shadow-[0_15px_30px_rgba(255,0,255,0.3)] transition-all duration-300 border border-gray-700">
                        <div class="plastic-sheen"></div>
                        <div class="h-full w-full bg-contain bg-no-repeat bg-center relative" style="background-image: url('${pathToImg}')"></div>
                        <div class="absolute bottom-0 left-0 w-full backdrop-blur-md bg-black/40 p-4 z-20 flex flex-col justify-end">
                            <div class="font-bold text-white text-lg tracking-wide leading-tight mb-1 truncate" style="font-family: 'Soehne',sans-serif;">${title}</div>
                            <div class="font-bold text-white/80 text-sm uppercase tracking-widest" style="font-family: 'Soehne',sans-serif;">${consoleName}</div>
                        </div>
                    </div>
                    <!-- Back -->
                    <div class="flip-card-back border border-gray-700 p-0 flex flex-col overflow-hidden text-sm group-hover:shadow-[0_15px_30px_rgba(255,0,255,0.3)]">
                        <div class="plastic-sheen"></div>
                        <div class="bg-gray-800 text-white p-3 border-b border-gray-700 flex justify-between items-center relative z-20">
                            <h3 class="font-bold text-lg select-none truncate font-headline-lg text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" title="${title}">${title}</h3>
                        </div>
                        <div class="p-4 flex-grow flex flex-col relative z-20 bg-surface/90 backdrop-blur-md">
                            <div class="flex gap-2 mb-3 text-xs flex-wrap">
                                <span class="border border-electric-cyan text-electric-cyan px-2 py-1 rounded-sm select-none">${year}</span>
                                <span class="border border-neon-pink text-neon-pink px-2 py-1 rounded-sm select-none">${consoleName}</span>
                                <span class="border border-gray-500 text-gray-300 px-2 py-1 rounded-sm select-none">${type}</span>
                            </div>
                            <div class="relative flex-grow min-h-0 desc-wrap">
                                <div class="desc-container custom-scrollbar overflow-hidden absolute inset-0">
                                    <p class="text-gray-300 text-sm leading-relaxed select-none desc-text">
                                        ${desc}
                                    </p>
                                </div>
                                <button type="button" class="desc-toggle hidden" aria-label="Déplier la description">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                            </div>
                            <div class="flex gap-2 mb-3 text-xs flex-wrap">
                                <a class="inline-flex items-center gap-1 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classMetaCritic}" href="${linkMetaCritic}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/metacritic.png" style="display: inline" width="20" alt="metacritic"/> ${mark}</a>
                                <a class="inline-flex items-center gap-1 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classIGN}" href="${linkIGN}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/ign.png" style="display: inline" width="20" alt="IGN"/> ${markIGN}</a>
                                    <a class="inline-flex items-center gap-1 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classJVC}" href="${linkJVC}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/jvc.svg" style="display: inline" width="20" alt="jeuxvideo.com"/> ${markJVC}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            `;
    }).join('');

    requestAnimationFrame(() => requestAnimationFrame(initDescToggles));
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => initDescToggles());
    }
}

function initDescToggles() {
    if (!window.__descResizeBound) {
        window.__descResizeBound = true;
        window.addEventListener('resize', initDescToggles);
    }
    document.querySelectorAll('.desc-wrap').forEach((wrap) => {
        const container = wrap.querySelector('.desc-container');
        const btn = wrap.querySelector('.desc-toggle');
        const p = wrap.querySelector('.desc-text');
        if (!container || !btn || !p) return;
        wrap.classList.remove('expanded');
        container.scrollTop = 0;
        p.classList.remove('desc-clamp');
        p.style.webkitLineClamp = '';

        const clientH = container.clientHeight;
        if (clientH < 20) return;

        if (p.scrollHeight <= clientH + 2) return;

        const lineHeight = parseFloat(getComputedStyle(p).lineHeight) || 23;
        const lines = Math.max(2, Math.floor(clientH / lineHeight));
        wrap._lines = lines;
        p.classList.add('desc-clamp');
        p.style.webkitLineClamp = String(lines);
        btn.classList.remove('hidden');

        if (!btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const expanded = wrap.classList.toggle('expanded');
                btn.setAttribute('aria-expanded', String(expanded));
                if (expanded) {
                    p.classList.remove('desc-clamp');
                    p.style.webkitLineClamp = '';
                } else {
                    p.classList.add('desc-clamp');
                    p.style.webkitLineClamp = String(wrap._lines);
                    container.scrollTop = 0;
                }
            });
        }
    });
}

function renderList(data) {
    const grid = document.getElementById('games-grid');
    const defaultImg = 'ps1';

    grid.innerHTML = data.map((cols) => {
        if (cols.length < 12) return '';
        const title = cols[0];
        const year = cols[1];
        const type = cols[2];
        const desc = cols[3];
        const mark = cols[11];
        const consoleName = cols[4] ? cols[4].trim() : '';
        const img = cols[5] ? cols[5].trim() : defaultImg;
        const pathToImg = `images/covers/${img}.webp`;
        const linkIGN = cols[6];
        const classIGN = cols[6] === "" ? "hidden" : "";
        const markIGN = cols[7];
        const linkMetaCritic = cols[8];
        const classMetaCritic = cols[8] === "" ? "hidden" : "";
        const linkJVC = cols[9];
        const classJVC = cols[9] === "" ? "hidden" : "";
        const markJVC = cols[10];

        return `
            <div class="group flex items-center gap-4 bg-surface-container/60 backdrop-blur-md p-3 rounded-lg border border-glass-border hover:border-electric-cyan hover:shadow-[0_0_12px_rgba(0,255,255,0.15)] transition-all duration-300">
                <img src="${pathToImg}" alt="${title}" loading="lazy" class="h-20 w-14 object-cover object-top rounded bg-[#1a1a1a] shrink-0"/>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-white text-base tracking-wide leading-tight truncate" style="font-family: 'Soehne',sans-serif;">${title}</div>
                    <div class="text-sm text-on-surface-variant mt-1">
                        <span class="text-electric-cyan">${year}</span> · ${consoleName} · ${type}
                    </div>
                    <p class="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">${desc}</p>
                </div>
                <div class="flex flex-col items-stretch gap-1 shrink-0">
                    <a class="border border-gray-500 text-gray-300 px-2 py-1 rounded-sm text-xs hover:border-electric-cyan hover:text-electric-cyan transition-colors justify-center inline-flex items-center gap-1 ${classMetaCritic}" href="${linkMetaCritic}" target="_blank" rel="noopener"><img src="images/metacritic.png" style="display: inline" width="20" alt="metacritic"/> ${mark}</a>
                    <a class="border border-gray-500 text-gray-300 px-2 py-1 rounded-sm text-xs hover:border-neon-pink hover:text-neon-pink transition-colors justify-center inline-flex items-center gap-1 ${classIGN}" href="${linkIGN}" target="_blank" rel="noopener"><img src="images/ign.png" style="display: inline" width="20" alt="IGN"/> ${markIGN}</a>
                    <a class="border border-gray-500 text-gray-300 px-2 py-1 rounded-sm text-xs hover:border-neon-pink hover:text-neon-pink transition-colors justify-center inline-flex items-center gap-1 ${classJVC}" href="${linkJVC}" target="_blank" rel="noopener"><img src="images/jvc.svg" style="display: inline" width="20" alt="jeuxvideo.com"/> ${markJVC}</a>
                </div>
            </div>
            `;
    }).join('');
}

function setView(view) {
    currentView = view;
    const grid = document.getElementById('games-grid');
    if (view === 'list') {
        grid.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'gap-lg');
        grid.classList.add('flex', 'flex-col', 'gap-md');
    } else {
        grid.classList.remove('flex', 'flex-col', 'gap-md');
        grid.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'gap-lg');
    }
    filterAndSortData();
}

function filterAndSortData() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const consoleFilter = document.getElementById('console-filter').value.toLowerCase();

    let filteredData = gamesData.filter(cols => {
        if(cols.length < 12) return false;
        const titleMatch = cols[0].toLowerCase().includes(searchTerm);
        const consoleMatch = consoleFilter === '' || (cols[4] && cols[4].toLowerCase().includes(consoleFilter));
        return titleMatch && consoleMatch;
    });

    filteredData.sort((a, b) => {
        let valA, valB;
        if (currentSort === 'title') {
            valA = a[0];
            valB = b[0];
        } else if (currentSort === 'year') {
            valA = parseInt(a[1]);
            valB = parseInt(b[1]);
        } else if (currentSort === 'note') {
            valA = numVal(a[11]);
            valB = numVal(b[11]);
        } else if (currentSort === 'ign') {
            valA = numVal(a[7]);
            valB = numVal(b[7]);
        } else if (currentSort === 'jvc') {
            valA = numVal(a[10]);
            valB = numVal(b[10]);
        }

        let comparison;
        if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB);
        } else {
            comparison = valA - valB;
        }

        return sortDesc ? -comparison : comparison;
    });

    renderCards(filteredData);
}

function numVal(v) {
    const n = parseFloat(v);
    return isNaN(n) ? -Infinity : n;
}

function initCardDrag() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    let activeCard = null;
    let activeInner = null;
    let activeWidth = 1;
    let startX = 0;
    let startY = 0;
    let startRot = 0;
    let moved = false;
    const flipStates = new Map();
    const FLIP_DELAY = 400;
    const FLIP_DURATION = 2500;

    // Locks the card until the flip animation is fully done (input ignored meanwhile)
    const lockDuringFlip = (card, inner) => {
        card._animating = true;
        card.classList.add('animating');
        let finished = false;
        const unlock = () => {
            if (finished) return;
            finished = true;
            card._animating = false;
            card.classList.remove('animating');
            inner.removeEventListener('transitionend', onEnd);
            clearTimeout(card._lockFallback);
        };
        const onEnd = (ev) => {
            if (ev.target !== inner || ev.propertyName !== 'transform') return;
            unlock();
        };
        inner.addEventListener('transitionend', onEnd);
        clearTimeout(card._lockFallback);
        card._lockFallback = setTimeout(unlock, FLIP_DURATION + 300);
    };

    grid.addEventListener('pointerdown', (e) => {
        const card = e.target.closest('.flip-card');
        if (!card || e.target.closest('a') || e.target.closest('.desc-toggle')) return;
        if (card._animating) return;

        activeCard = card;
        activeInner = card.querySelector('.flip-card-inner');
        activeWidth = card.offsetWidth || 1;
        startX = e.clientX;
        startY = e.clientY;
        moved = false;
        const state = flipStates.get(card) || 0;
        startRot = state === 1 ? 180 : 0;

        card.classList.add('dragging');
        card.setPointerCapture(e.pointerId);

        if (activeInner) {
            activeInner.style.transition = '';
            activeInner.style.transform = '';
            activeInner.style.setProperty('--rot', startRot + 'deg');
        }
    });

    grid.addEventListener('pointermove', (e) => {
        if (!activeCard) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!moved && Math.hypot(dx, dy) > 6) {
            moved = true;
            if (activeCard._flipTimer) { clearTimeout(activeCard._flipTimer); activeCard._flipTimer = null; }
            e.preventDefault();
        }
        if (!moved) return;

        const rot = startRot + (dx / activeWidth) * 180;
        if (activeInner) activeInner.style.setProperty('--rot', rot + 'deg');
    });

    const release = (e) => {
        if (!activeCard) return;
        const card = activeCard;
        const inner = activeInner;
        activeCard = null;
        activeInner = null;

        card.classList.remove('dragging');

        if (moved) {
            const dx = e.clientX - startX;
            const rot = startRot + (dx / activeWidth) * 180;
            const target = Math.round(rot / 180) * 180;
            const flipped = ((target % 360) + 360) % 360 === 180;
            const newState = flipped ? 1 : 0;
            flipStates.set(card, newState);
            card.classList.toggle('flipped', newState === 1);
            card.classList.remove('flipped-v');
            if (inner) {
                const tgt = flipped ? 180 : 0;
                const k = Math.round((rot - tgt) / 360);
                inner.style.removeProperty('--rot');
                inner.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.085)';
                inner.style.transform = `rotateY(${tgt + 360 * k}deg)`;
                card._flipCount = (tgt + 360 * k) / 180;
                lockDuringFlip(card, inner);
            }
        } else {
            if (card._flipTimer) {
                clearTimeout(card._flipTimer);
                card._flipTimer = null;
                if (inner) {
                    const st = flipStates.get(card) || 0;
                    if (st === 1) {
                        inner.style.transition = 'none';
                        inner.style.transform = 'rotateY(180deg)';
                    }
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            inner.style.transition = '';
                            inner.style.transform = st === 1 ? 'rotateY(180deg) rotateX(-360deg)' : 'rotateX(360deg)';
                            lockDuringFlip(card, inner);
                            const onEnd = (ev) => {
                                if (ev.propertyName !== 'transform') return;
                                inner.removeEventListener('transitionend', onEnd);
                                inner.style.transition = 'none';
                                inner.style.transform = st === 1 ? 'rotateY(180deg)' : '';
                                card._flipCount = st === 1 ? 1 : 0;
                                requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                        inner.style.transition = '';
                                    });
                                });
                            };
                            inner.addEventListener('transitionend', onEnd);
                        });
                    });
                }
            } else {
                card._flipTimer = setTimeout(() => {
                    card._flipTimer = null;
                    card._flipCount = (card._flipCount || 0) + 1;
                    const st = flipStates.get(card) || 0;
                    flipStates.set(card, st === 0 ? 1 : 0);
                    card.classList.toggle('flipped', st === 0);
                    card.classList.remove('flipped-v');
                    if (inner) {
                        inner.style.transition = '';
                        inner.style.transform = `rotateY(${card._flipCount * 180}deg)`;
                        lockDuringFlip(card, inner);
                        const onEnd = (ev) => {
                            if (ev.propertyName !== 'transform') return;
                            inner.removeEventListener('transitionend', onEnd);
                            const newState = flipStates.get(card) || 0;
                            inner.style.transition = 'none';
                            inner.style.transform = newState === 1 ? 'rotateY(180deg)' : '';
                            card._flipCount = newState === 1 ? 1 : 0;
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    inner.style.transition = '';
                                });
                            });
                        };
                        inner.addEventListener('transitionend', onEnd);
                    }
                }, FLIP_DELAY);
            }
        }
    };

    const cancel = () => {
        if (!activeCard) return;
        const card = activeCard;
        const inner = activeInner;
        activeCard = null;
        activeInner = null;

        card.classList.remove('dragging');
        if (inner) {
            inner.style.removeProperty('--rot');
            inner.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.085)';
            inner.style.transform = '';
        }
        if (moved) {
            const state = flipStates.get(card) || 0;
            card.classList.toggle('flipped', state === 1);
            if (inner) lockDuringFlip(card, inner);
        }
    };

    grid.addEventListener('pointerup', release);
    grid.addEventListener('pointercancel', cancel);
}
