# Colonies and Colonial Power — Interactive Web Platform

The official publication-grade static website for **Colonies and Colonial Power** (*The Colonial Age*), compiling all 72 documentary episodes across 9 seasons into a zero-latency, responsive web reading experience.

---

## 🌐 Live Deployment

* **Live Site:** [https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/](https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/)
* **Featured Episode (Haiti):** [https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/episodes/season-05/ep-38-haiti/](https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/episodes/season-05/ep-38-haiti/)
* **Viewing Paths & Samplers:** [https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/paths/](https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/paths/)
* **Comparative Matrix:** [https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/matrix/](https://abhinav-knowledge-base.github.io/Colonies-and-Colonial-Power/matrix/)

---

## 🚀 Key Features

1. **All 72 Canonical Episodes Dynamic Generation:**
   - Automatically parses all 72 markdown episodes from the root repository into styled reading pages.
   - Live scroll-progress reading bar, sticky Table of Contents, logline badges, and baton navigation.
2. **Instant Client-Side Search:**
   - Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere on the site to search all 72 episodes instantly.
3. **Curriculum & Viewing Paths:**
   - Modular paths for secondary and university survey courses, plus thematic threads on Labor, Settler Colonialism, Chartered Companies, Abolition, and Decolonization.
4. **Zero Hosting Cost:**
   - 100% static compilation deployed to GitHub Pages via automated GitHub Actions workflow (`.github/workflows/deploy.yml`).

---

## 🛠️ Technology Stack

- **Framework:** [Astro](https://astro.build/) (Static Site Generation)
- **Styling:** Bespoke Vanilla CSS (Archival Nautical design system, responsive layout, custom typography)
- **Deployment:** GitHub Actions $\rightarrow$ GitHub Pages

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (outputs to ./dist)
npm run build

# 4. Preview production build locally
npm run preview
```
