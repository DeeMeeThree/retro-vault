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

        return `
            <div class="flip-card h-[500px] w-full xxs:w-[75%] xs:w-[60%] sm:w-full justify-self-center cursor-pointer group">
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
                            <div class="font-bold text-white text-lg tracking-wide leading-tight mb-1 truncate" style="font-family: 'Soehne';">${title}</div>
                            <div class="font-bold text-white/80 text-sm uppercase tracking-widest" style="font-family: 'Soehne';">${consoleName}</div>
                        </div>
                    </div>
                    <!-- Back -->
                    <div class="flip-card-back border border-gray-700 p-0 flex flex-col overflow-hidden text-sm">
                        <div class="plastic-sheen"></div>
                        <div class="bg-gray-800 text-white p-3 border-b border-gray-700 flex justify-between items-center relative z-20">
                            <h3 class="font-bold text-lg truncate font-headline-lg text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" title="${title}">${title}</h3>
                        </div>
                        <div class="p-4 flex-grow flex flex-col relative z-20 bg-surface/90 backdrop-blur-md">
                            <div class="flex gap-2 mb-3 text-xs flex-wrap">
                                <span class="border border-electric-cyan text-electric-cyan px-2 py-1 rounded-sm">${year}</span>
                                <span class="border border-neon-pink text-neon-pink px-2 py-1 rounded-sm">${consoleName}</span>
                                <span class="border border-gray-500 text-gray-300 px-2 py-1 rounded-sm">${type}</span>
                            </div>
                            <p class="text-gray-300 flex-grow text-sm overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
                                ${desc}
                            </p>
                            <div class="flex gap-2 mb-3 text-xs flex-wrap">
                                <a class="inline-flex items-center gap-1 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classMetaCritic}" href="${linkMetaCritic}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/metacritic.png" style="display: inline" width="20" alt="metacritic"/> ${mark}</a>
                                <a class="inline-flex items-center gap-1 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classIGN}" href="${linkIGN}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/ign.png" style="display: inline" width="20" alt="IGN"/> ${markIGN}</a>
                                    <a class="inline-flex items-center gap-1 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classJVC}" href="${linkJVC}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/jvc.svg" style="display: inline" width="20" alt="jeuxvideo.com"/> ${markJVC}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }).join('');
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
                    <div class="font-bold text-white text-base tracking-wide leading-tight truncate" style="font-family: 'Soehne';">${title}</div>
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
            valA = a[11];
            valB = b[11];
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

function initCardDrag() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    let activeCard = null;
    let startX = 0;
    let startY = 0;
    let startRot = 0;
    let moved = false;

    grid.addEventListener('pointerdown', (e) => {
        const card = e.target.closest('.flip-card');
        if (!card || e.target.closest('a')) return;

        activeCard = card;
        startX = e.clientX;
        startY = e.clientY;
        moved = false;
        startRot = card.classList.contains('flipped') ? 180 : 0;

        card.classList.add('dragging');
        card.setPointerCapture(e.pointerId);
    });

    grid.addEventListener('pointermove', (e) => {
        if (!activeCard) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!moved && Math.hypot(dx, dy) > 6) {
            moved = true;
            e.preventDefault();
        }
        if (!moved) return;

        const width = activeCard.offsetWidth || 1;
        const rot = startRot + (dx / width) * 180;
        const inner = activeCard.querySelector('.flip-card-inner');
        if (inner) inner.style.transform = `rotateY(${rot}deg)`;
    });

    const release = (e) => {
        if (!activeCard) return;
        const card = activeCard;
        activeCard = null;

        const inner = card.querySelector('.flip-card-inner');
        card.classList.remove('dragging');

        if (moved) {
            const dx = e.clientX - startX;
            const width = card.offsetWidth || 1;
            const rot = startRot + (dx / width) * 180;
            const target = Math.round(rot / 180) * 180;
            const flipped = ((target % 360) + 360) % 360 === 180;
            card.classList.toggle('flipped', flipped);
        } else {
            card.classList.toggle('flipped');
        }

        if (inner) {
            inner.style.transition = '';
            inner.style.transform = '';
        }
    };

    grid.addEventListener('pointerup', release);
    grid.addEventListener('pointercancel', release);
}
