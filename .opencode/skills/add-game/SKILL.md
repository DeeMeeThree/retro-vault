---
name: add-game
description: >
  Use when the user wants to add a new game to the retro-games collection.
  Triggers on "add a game", "add [game name]", "new game", "add [game] for [platform]".
  Handles cover art, scores, description, and CSV entry.
---

# Add Game to Retro-Games Collection

When the user provides a game name and platform, follow these steps exactly. Do NOT modify `script.js` or `style.css` unless explicitly asked.

## Input

The user provides:
- **Game name** (required): e.g. "Crash Bandicoot", "Final Fantasy X"
- **Platform** (required): e.g. "PS1", "PS2", "PS3", "PS4", "PS5", "Sega Mega Drive"

## Step 1: Gather Information

Search the web for the game on the following sites and collect:

### 1a. JeuxVideo.com
- Search: `site:jeuxvideo.com "[game name]" [platform]`
- Fetch the game page and extract:
  - **JVC URL**: the canonical game page URL (format: `https://www.jeuxvideo.com/jeux/[platform-slug]/[id]-[game-slug].htm` or `https://www.jeuxvideo.com/jeux/[id]-[game-slug]/`)
  - **JVC Note**: the reader score (note des lecteurs), e.g. "18/20". Use the score out of 20 displayed prominently on the page.

### 1b. Metacritic
- Search: `site:metacritic.com "[game name]" [platform]`
- Fetch the game page and extract:
  - **Metacritic URL**: the canonical game page URL
  - **Metacritic Note**: the **critic score** (NOT user score). It's the large number displayed at the top. Use integer (e.g. 95, not 95.0).

### 1c. IGN
- Search: `site:ign.com "[game name]" [platform]`
- Fetch the game page and extract:
  - **IGN URL**: the canonical game page URL
  - **IGN Note**: the review score (e.g. 9.7, 8.0)

### 1d. Description
- Write a **French description** (3-4 sentences) covering:
  - Release year and platform
  - Game premise / story
  - Key gameplay features
  - What makes it notable
- Format: start with "Sorti en [year] sur [platform], ..." 
- No emojis, no markdown, plain text only
- Must fit in a single CSV field (wrap in double quotes if it contains commas)

## Step 2: Find Cover Art

Search on **gamesdb.launchbox-app.com**:

1. Search: `site:gamesdb.launchbox-app.com "[game name]" [platform-full-name]`
   - Platform name mapping: PS1→"Sony Playstation", PS2→"Sony Playstation 2", PS3→"Sony Playstation 3", PS4→"Sony Playstation 4", PS5→"Sony Playstation 5", "Sega Mega Drive"→"Sega Mega Drive"
2. Fetch the game page HTML
3. In the `__NUXT_DATA__` script payload, find **Box - Front** images. Priority order:
   - France (if exists)
   - Europe
   - United Kingdom
   - Any other PAL/European region
   - North America (last resort)
4. The page shows **thumbnail** UUIDs in `<img src>` tags. The **full-resolution** image has a different UUID found via `fullGameImageFileName` in the `__NUXT_DATA__` JSON array.
   - To map thumbnail → full-res: find the thumbnail UUID in the array, locate the object containing it as `imageFileName`, read the `fullGameImageFileName` index, and resolve that index to the actual UUID string.
5. Download the full-res image from: `https://images.launchbox-app.com//[full-res-UUID].jpg`

## Step 3: Process Cover Image

Using sharp (installed at `C:/Users/incor/AppData/Local/Temp/opencode/covers/node_modules/sharp`):

1. Resize to **600px width** (maintain aspect ratio)
2. Convert to **webp** format (quality 85)
3. Save to `C:/Users/incor/WebstormProjects/retro-games/images/covers/[cover-filename].webp`

The cover filename should be a kebab-case slug of the game title, e.g.:
- "Grand Theft Auto: Vice City" → `gta-vice-city.webp`
- "Crash Bandicoot" → `crash-bandicoot.webp`
- "Final Fantasy X" → `final-fantasy-x.webp`

## Step 4: Determine Console Tag and Ratio

Map the platform to the console tag used in the CSV and the CSS ratio class:

| Platform | Console Tag | CSS Ratio Class |
|----------|-------------|-----------------|
| PS1 | PS1 | `ratio-ps1` (1/1) |
| PS2 | PS2 | `ratio-ps2` (0.71/1) |
| PS3 | PS3 | `ratio-ps3` (0.87/1) |
| PS4 | PS4 | `ratio-ps4` (0.80/1) |
| PS5 | PS5 | `ratio-ps5` (0.80/1) |
| Sega Mega Drive | SEGA | `ratio-sega` (0.73/1) |

If the game's cover aspect ratio significantly differs from the default ratio for that console, add a 13th column override in the CSV: `[ratio-width c-ratio-height]` (e.g. `[60c-1]` means aspect-ratio: 60/100). Only do this if the cover is clearly non-standard.

## Step 5: Add to CSV

Append a new line to `C:/Users/incor/WebstormProjects/retro-games/database_archive.csv`.

CSV format (12 columns, no header row for new entries):
```
Titre,Année de sortie,Type de jeu,Description,Console,Cover,Lien IGN,Note IGN,Lien Metacritic,Lien Jeuxvideo.com,Note Jeuxvideo.com,Note Metacritic
```

Rules:
- The file currently has a header row + game rows. Append AFTER the last game row.
- Fields containing commas must be wrapped in double quotes.
- Description is the only field likely to contain commas — always wrap it in quotes.
- Cover column: just the filename slug WITHOUT the `.webp` extension.
- Notes: use the numeric values (IGN as decimal like `9.7`, JVC and Metacritic as integer like `18`, `95`).

Example line:
```
Crash Bandicoot,1996,Action,"Sorti en 1996 sur PS1, Crash Bandicoot est un platformer emblématique dans lequel le joueur incarne un marsupial coloré devant traverser des niveaux fills de pièges et d'ennemis pour sauver son frère et affronter le Dr Neo Cortex.",PS1,crash-bandicoot,https://www.ign.com/games/crash-bandicoot,8.9,https://www.metacritic.com/game/crash-bandicoot,https://www.jeuxvideo.com/jeux/ps2/jeu-XXXXX/,16,81
```

## Step 6: Verify

After adding the entry:
1. Confirm the webp file exists in `images/covers/`
2. Confirm the CSV line was appended correctly (read last 2 lines to verify)
3. Report back to the user with a summary: game name, platform, scores found, cover filename

## Notes
- Do NOT modify `script.js` or `style.css`
- If a score is not found on a site, use `0` or leave empty — but try hard to find it
- If the game already exists in the CSV, warn the user and do NOT add a duplicate
- When multiple editions exist (e.g. "GTA Vice City" on PS2 vs PSP), make sure you're linking to the correct platform version
