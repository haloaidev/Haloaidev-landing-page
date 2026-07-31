# HaloAiStudios Hub Landing Page

Vercel-ready static landing page for HaloAiStudios.

## Files

- `index.html` — the page (nav, intro sequence, hero, apps, features, pricing, contact, footer)
- `styles.css` — supporting styles (cards, pricing, nav, responsive)
- `script.js` — particle background, intro sequence, menu, config wiring
- `config.js` — **edit this to go live** (see below)
- `vercel.json` — security headers + clean URLs

## Going live: edit `config.js`

Everything you need to point at real destinations lives in one file.

```js
introVideoUrl: "",   // paste a hosted .mp4/.webm URL to replace the coded
                      // intro with a real video — leave blank to keep the
                      // animated halo-ring intro
apps: {
    epicAiBattle: "...",   // replace each placeholder with the app's live URL
    motivabot: "...",
    // ...
}
```

No other file needs to change — `index.html` reads links via `data-app`
attributes and `script.js` applies them from `config.js` on load.

## Local Test

```
python -m http.server 3000
```

Open http://localhost:3000

## Deploy to Vercel

Push to GitHub, import the repo into Vercel, and select:

- Framework: Other
- Build Command: None
- Output Directory: `./`

## Push this repo to GitHub

This folder is already a git repo with one commit on `main`. From inside it:

```bash
# Option A — GitHub CLI (if installed)
gh repo create haloaistudios-hub --public --source=. --remote=origin --push

# Option B — manual
git remote add origin https://github.com/<your-username>/haloaistudios-hub.git
git push -u origin main
```
