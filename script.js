let gamesData = [];
let currentSort = 'year';
let sortDesc = false;

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
    const grid = document.getElementById('games-grid');
    const defaultImg = 'ps1';

    grid.innerHTML = data.map((cols) => {
        if (cols.length < 8) return '';
        const title = cols[0];
        const year = cols[1];
        const type = cols[2];
        const desc = cols[3];
        const mark = cols[4];
        const consoleName = cols[5] ? cols[5].trim() : '';
        const img = cols[6] ? cols[6].trim() : defaultImg;
        const pathToImg = `images/covers/${img}.webp`;
        const linkIGN = cols[7];
        const classIGN = cols[7] === "" ? "hidden": "";
        const linkMetaCritic = cols[8];
        const classMetaCritic = cols[8] === "" ? "hidden" : "";

        return `
            <div class="flip-card h-[500px] w-full xxs:w-[75%] xs:w-[60%] sm:w-full justify-self-center cursor-pointer group" onclick="this.classList.toggle('flipped')">
                <div class="flip-card-inner relative w-full h-full">
                    <!-- Front -->
                    <div class="flip-card-front bg-[#1a1a1a] overflow-hidden group-hover:shadow-[0_15px_30px_rgba(255,0,255,0.3)] transition-all duration-300 border border-gray-700">
                        <div class="plastic-sheen"></div>
                        <div class="h-full w-full bg-cover bg-center relative" style="background-image: url('${pathToImg}')"></div>
                        <div class="absolute bottom-0 left-0 w-full backdrop-blur-md bg-black/40 p-4 z-20 flex flex-col justify-end">
                            <div class="font-bold text-white text-lg tracking-wide leading-tight mb-1 truncate" style="font-family: 'Space Grotesk', sans-serif;">${title}</div>
                            <div class="font-bold text-white/80 text-sm uppercase tracking-widest" style="font-family: 'Space Grotesk', sans-serif;">${consoleName}</div>
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
                                <a class="inline-flex items-center gap-1.5 border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classMetaCritic}" href="${linkMetaCritic}" onclick="arguments[0].stopPropagation()" target="_blank"><img src="images/metacritic.png" style="display: inline" width="20" alt="metacritic"> ${mark}</a>
                                <a class="inline-flex items-center border border-gray-500 text-gray-300 px-2 py-1 rounded-sm ${classIGN}" href="${linkIGN}" onclick="arguments[0].stopPropagation()" target="_blank">IGN</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }).join('');
}

function filterAndSortData() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const consoleFilter = document.getElementById('console-filter').value.toLowerCase();

    let filteredData = gamesData.filter(cols => {
        if(cols.length < 6) return false;
        const titleMatch = cols[0].toLowerCase().includes(searchTerm);
        const consoleMatch = consoleFilter === '' || (cols[5] && cols[5].toLowerCase().includes(consoleFilter));
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
            valA = a[4];
            valB = b[4];
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