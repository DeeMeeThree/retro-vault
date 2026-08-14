# RETRO_VAULT 🕹️✨

Ce projet est une expérimentation réalisée avec **stitch.withgoogle**, conçue pour répertorier et présenter une collection physique de jeux vidéo rétro dans un environnement immersif "Vice Neon".

## 🚀 À propos du projet
RETRO_VAULT est une interface web dynamique qui sert de coffre-fort numérique pour les passionnés de rétrogaming. Le site permet d'explorer une collection de jeux stockée dans un fichier CSV et de visualiser l'historique des consoles (Hardware) avec une esthétique inspirée des néons et de l'univers cyber.

## 📂 Structure du Projet
Le projet est organisé pour fonctionner de manière autonome en local :

- `index.html` : Page d'accueil immersive avec accès rapide aux sections.
- `software.html` : Archive dynamique qui lit et affiche les jeux depuis le fichier CSV.
- `hardware.html` : Galerie d'exposition des consoles (Sega, PlayStation, etc.).
- `style.css` : Design system centralisé (Vice Neon style).
- `database_archive.csv` : La base de données de vos jeux physiques.
- `/images` : Dossier contenant les rendus 3D des consoles et les pochettes de jeux génériques.

## 🛠️ Installation et Utilisation
1.  **Copie des fichiers** : Récupérez le code source de chaque page (HTML, CSS, CSV) depuis le canvas Stitch.
2.  **Organisation** : Placez tous les fichiers à la racine d'un dossier nommé `retro_vault`. Créez un sous-dossier `/images` pour vos actifs visuels.
3.  **Serveur Local** : Pour que la page `software.html` puisse lire le fichier CSV, vous devez ouvrir le dossier avec un serveur local (ex: extension **"Live Server"** dans VS Code).
4.  **Personnalisation** : Modifiez directement le fichier `database_archive.csv` pour ajouter ou retirer des jeux de votre collection.

## 🎨 Design System
- **Typographie** : Anybody (style GTA) & Space Grotesk.
- **Palette** : Noir Profond, Rose Néon, Cyan Électrique.
- **Effets** : Verre dépoli (Glassmorphism), lueurs néon et animations 3D.

---
*Généré avec passion par Stitch pour l'archive RETRO_VAULT.*
