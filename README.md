# VR Portfolio

Spatial portfolio built with Three.js, TypeScript, and Vite.

## Run locally

```bash
npm install
npm run dev
```

## Controls

- `W A S D` to move
- Mouse to look after pressing `▶ PLAY MY CAREER`
- Mouse wheel to zoom
- `E` or mouse click to inspect a panel
- `Esc` to release the mouse

## GitHub Pages

If the repository name will be `vr-portfolio`, this project can be published to:

- `https://<your-user>.github.io/vr-portfolio/`

### 1. Keep the repo name aligned

Use `vr-portfolio` as the GitHub repository name.

If you publish under another repository name, change the build base path accordingly:

```bash
VITE_BASE_PATH=/your-repo-name/ npm run build:pages
```

### 2. Build for GitHub Pages

```bash
npm install
VITE_BASE_PATH=/vr-portfolio/ npm run build:pages
```

This generates the static site in `dist/`.

### 3. Publish with GitHub Pages

Recommended path:

1. Push the repository to GitHub.
2. Open `Settings > Pages`.
3. Set `Source` to `GitHub Actions`.
4. Add the workflow from `.github/workflows/deploy-pages.yml`.
5. Push to `main`.

### 4. After deployment

The app should be available at:

- `https://<your-user>.github.io/vr-portfolio/`

## Embedded site note

If you want a panel to render `https://lucaseyer.dev`, that site must explicitly allow iframe embedding from the portfolio origin using `Content-Security-Policy: frame-ancestors ...`.

For GitHub Pages, the origin to allow would typically be:

- `https://<your-user>.github.io`

If you later use a custom domain for this 3D portfolio, update the allowed origin on `lucaseyer.dev`.
