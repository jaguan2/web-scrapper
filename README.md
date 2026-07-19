<div align="center">

# ⭐ Snag · Paste a link, keep the media

### An ad-free media grabber for YouTube, Instagram, and X — MP4, MP3, JPG, or PNG. No popups, no countdown timers, no "premium".

<br />

<img src="docs/home.png" alt="Snag home — paste a link, keep the media" width="85%" />

<img src="docs/video-result.png" alt="Snag video result — quality ladder and MP4/MP3 download" width="85%" />

</div>

---

## ✨ What it does

Paste a share link and Snag figures out what's behind it:

- 🎬 **Videos** (YouTube, reels, video tweets) → download as **MP4** with a real quality ladder (2160p → 144p, with file-size estimates), or rip the audio as **MP3**
- 🖼️ **Photo posts** (Instagram carousels, image tweets) → every photo in a selectable grid; download each as **JPG or PNG** (converted server-side), pick a few, or grab the whole set as one **ZIP**
- 📊 **Live progress** — video downloads run as server-side jobs and stream a progress bar to the UI
- 🌙 **Light/dark pastel "sticker" design** — glassmorphism panels, puffy floating stars, springy micro-interactions (design system inspired by [Morph](https://usemorph.netlify.app/))

## 🏗️ How it works

Unlike a pure-frontend converter, scraping needs a server — platforms block browser-side fetching with CORS and hotlink protection. So Snag is two npm workspaces:

```mermaid
flowchart LR
    A["🔗 Paste a link<br/><i>React client</i>"] --> B["POST /api/resolve<br/><i>Express server</i>"]
    B --> C{"platform?"}
    C -->|youtube / generic| D["yt-dlp -J<br/><i>metadata + formats</i>"]
    C -->|twitter / x| E["fxtwitter API<br/><i>photos + videos</i>"]
    C -->|instagram| F["yt-dlp + embed page<br/><i>videos + image carousels</i>"]
    D --> G["🎚️ Quality picker<br/>MP4 / MP3"]
    E --> H["🖼️ Photo grid<br/>JPG / PNG / ZIP"]
    F --> G
    F --> H
    G --> I["POST /api/jobs<br/><i>yt-dlp + ffmpeg merge,<br/>progress polling</i>"]
    H --> J["GET /api/media<br/><i>proxy + sharp convert</i>"]
```

- **yt-dlp** (auto-downloaded by `youtube-dl-exec`) does the heavy extraction; **ffmpeg** (`ffmpeg-static`) merges video+audio into MP4 and extracts MP3
- **sharp** converts photos to JPG/PNG on the fly as they stream through the `/api/media` proxy
- Photo ZIPs are assembled **client-side** with `fflate` — the server just streams the images
- Downloads run in per-job temp dirs (`server/tmp/`) that are deleted right after the file is streamed; stale jobs are swept hourly

## 📁 Code structure

```
web-scrapper/
├── package.json          # npm workspaces root: `npm run dev` starts both apps
├── docs/                 # README screenshots
├── server/               # Express API (port 5175)
│   ├── index.js          # routes: /api/resolve, /api/media, /api/jobs
│   └── lib/
│       ├── ytdlp.js      # yt-dlp wrapper, shared flags, friendly error mapping
│       ├── normalize.js  # raw yt-dlp JSON → { platform, items[] } shape
│       ├── resolve.js    # per-platform resolution strategy
│       ├── twitter.js    # fxtwitter API (photo tweets + video enrichment)
│       ├── instagram.js  # embed-page scrape for image posts/carousels
│       ├── media.js      # image proxy + sharp JPG/PNG conversion
│       └── jobs.js       # download job manager: spawn, progress, stream, cleanup
└── client/               # Vite + React + MUI (port 5173, /api proxied to 5175)
    └── src/
        ├── theme/        # sticker design tokens, MUI theme factory, dark/light mode
        ├── components/
        │   ├── layout/   # Header, Footer, AppLayout (glass navbar, skip link)
        │   ├── decor/    # PuffyStar SVG + floating StarField backdrop
        │   ├── common/   # StickerButton, StickerToggle (segmented control)
        │   └── scrape/   # LinkInput, VideoCard (quality ladder), GalleryCard (grid + ZIP)
        ├── pages/        # ScrapePage — hero + state machine (idle/loading/done/error)
        ├── hooks/        # useLocalStorage
        └── utils/        # api client, download/zip helpers, formatters
```

## 🚀 Running locally

Requires **Node 20+**. First install downloads the `yt-dlp` and `ffmpeg` binaries automatically — no Python or system installs needed.

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**. The API listens on 5175; Vite proxies `/api` to it.

| Command         | Description                                        |
| :-------------- | :------------------------------------------------- |
| `npm run dev`   | Start API + client together (concurrently)         |
| `npm run build` | Build the client for production                    |
| `npm start`     | Serve the API + built client from one process      |

## 🔐 Instagram & age-restricted content

Public reels and most posts work out of the box. Private accounts, some carousels, and age-restricted videos need a logged-in session:

1. Install a "cookies.txt" browser extension (e.g. *Get cookies.txt LOCALLY*)
2. Log in to the site in your browser, export cookies in Netscape format
3. Save the file as `server/cookies.txt` (it's gitignored — never commit it)

Every yt-dlp call picks it up automatically.

## ⚠️ A note on use

Snag is a personal, ad-free alternative to sketchy downloader sites. Download only content you have the right to save (your own posts, licensed/CC media, etc.) and respect each platform's terms of service. Extractors depend on how platforms behave — if one breaks, updating yt-dlp (`npm update youtube-dl-exec`) usually fixes it.
