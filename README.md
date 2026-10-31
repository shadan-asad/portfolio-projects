# Portfolio & Interactive Experiments Showcase

Curated collection of interactive 3D WebGL experiences, generative AI interfaces, and frontend prototypes, configured for zero-friction continuous deployment on **Vercel**.

---

## ⚡ Quick Start

### Run Locally
To view the showcase gallery and test all projects locally:
```bash
# Using Python
python3 -m http.server 3000

# Or using npx
npx serve .
```
Then visit `http://localhost:3000`.

---

## 🚀 Deploying to Vercel

### Option 1: Git-Backed Deployment (Recommended)
1. Initialize Git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial portfolio showcase setup"
   ```
2. Push to a new repository on your GitHub account.
3. In [Vercel Dashboard](https://vercel.com/new):
   - Import your GitHub repository.
   - Leave build settings as default (it will automatically run `node build.js` and serve the static files).
   - Click **Deploy**.

> **Note:** From then on, every time you add a new project and push to GitHub, Vercel rebuilds and deploys automatically!

### Option 2: Direct CLI Deployment
If you prefer deploying directly from your terminal:
```bash
npx vercel
```
Follow the interactive prompts to log in and deploy. When deploying to production:
```bash
npx vercel --prod
```

---

## ➕ Adding Future Projects

Whenever you create a new interactive project:

1. **Save the `.html` file** in this directory (e.g. `neural_audio_synthesizer.html`).
2. **That's it!**
   - When deployed on Vercel, the build step automatically detects the new file, extracts its `<title>` and headline, generates a clean slug, and adds it to the showcase gallery.
3. *(Optional)* If you want to customize its category, accent color, tags, or short slug, add an entry to [`projects.json`](./projects.json):
   ```json
   {
     "file": "neural_audio_synthesizer.html",
     "slug": "audio-synth",
     "title": "Neural Synthesizer",
     "tagline": "Real-time WebAudio Neural DSP",
     "description": "Interactive WebAudio synthesis engine running in-browser DSP.",
     "category": "Audio & DSP",
     "tags": ["WebAudio", "DSP", "Canvas"],
     "accentColor": "#a855f7",
     "featured": true
   }
   ```
4. Run `npm run build` locally if you want to preview the updated gallery before pushing.

