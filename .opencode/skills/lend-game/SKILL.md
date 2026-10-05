---
name: lend-game
description: >
  Use when the user says a game is lent out, e.g. "j'ai prêté Heavenly Sword à Jean Dupont",
  "prête Crash Bandicoot à JD", or the opposite "il m'a rendu X".
  Writes only the "Prêté à" (13th) CSV column, leaving every other field byte-identical.
  Handles initials derivation and marking a game as returned.
---

# Mark a Game as Lent Out

The user keeps a private log of who borrowed which game. Column 13 of
`database_archive.csv` (`Prêté à`) holds the borrower's initials; `script/software.js`
renders it as an amber badge after the Metacritic/IGN/Jeuxvideo.com boxes, and renders
nothing when the column is empty.

**Never rewrite a CSV line by hand.** The Description column is double-quoted and
contains commas and apostrophes, so `split(',')` / `join(',')` corrupts the file. Always
go through the helper script, which owns that edit.

## Input

- **Game title** (required): as the user says it, e.g. "Heavenly Sword", "gta v"
- **Borrower** (required unless the game came back): a full name or initials already

## Step 1: Resolve the borrower's initials

| User says | Column value |
|-----------|--------------|
| "Jean Dupont" | `JD` |
| "Jean-Pierre Martin" | `JPM` |
| "Marie Curie" | `MC` |
| "JD", "J.D." | keep exactly as written |

The script derives initials automatically with `--derive`. Rules it applies: split on
spaces, hyphens, underscores, dots and apostrophes (`O'Neill` → `O` + `Neill`), take the
first character of each token, uppercase, cap at 5 characters. "Jean-Pierre Martin" → `JPM`.

Ask the user to confirm only when the result is ambiguous — a single-word surname
("Dupont" → `D`), more than three names, or two games with similar titles.

## Step 2: Run the script

Script: `.opencode/skills/lend-game/scripts/set-loan.js` (run it with `node`).

Mark as lent out:
```
node .opencode/skills/lend-game/scripts/set-loan.js --game "Heavenly Sword" --to "Jean Dupont" --derive
```
Initials already known — skip `--derive`:
```
node .opencode/skills/lend-game/scripts/set-loan.js --game "Heavenly Sword" --to "JD"
```
Mark as returned (clears the column):
```
node .opencode/skills/lend-game/scripts/set-loan.js --game "Heavenly Sword" --clear
```
List everything currently lent out:
```
node .opencode/skills/lend-game/scripts/set-loan.js --list
```

Title matching is accent- and punctuation-insensitive and case-insensitive, so
`gta v`, `GTA V` and `Grand Theft Auto V` all resolve. Add `--dry-run` to preview.

## Step 3: Handle the exit code

| Code | Meaning | What to do |
|------|---------|------------|
| 0 | Written and verified | Report the result to the user |
| 2 | Not found, or ambiguous | The script printed candidate lines/titles — show them to the user and ask which one, then re-run with the exact title. Do **not** guess |
| 1 | Refused to write | Read the reason. Usually the CSV predates the 13th column or a line has unbalanced quotes — tell the user instead of working around it |

## Step 4: Report back

State the game, the console tag, and the resulting column value. If the game was already
lent to someone else, say so explicitly — the script overwrites, so confirm with the user
first when `->` shows a non-empty previous value that differs from the new one.

## Notes

- Do NOT touch `script/software.js` or `style/software.css` — the badge already renders
  from column 13 in both the card back and the list view, and hides itself when empty
- Do NOT edit any column other than 13; the script verifies columns 1-12 are untouched
- One row per physical line is guaranteed by the script's pre-flight check; if it ever
  fails, stop and tell the user rather than patching the file by hand
- When adding a brand new game, the `add-game` skill leaves column 13 empty — use this
  skill afterwards if the game is already lent out
- "Prêté à" accepts at most 5 characters and no commas or quotes; the script rejects
  anything else so a malformed value can never break the page