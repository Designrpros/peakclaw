# PeakClaw

AI Agent Dashboard — a Tauri-based menubar application for managing your OpenClaw AI agent.

![PeakClaw](assets/Peak-icon.png)

## Features

- **Landing Page** — Quick access hub with command input
- **Dashboard** — Live agent overview with sessions, system info, and cron jobs
- **Chat Tabs** — Send messages to Alcatelz via Telegram
- **Browser Tab** — Web browsing
- **Settings** — Configure PeakClaw
- **Light/Dark Theme** — Toggle via tab bar
- **Tab System** — Open multiple features as tabs

## Tech Stack

- **Tauri 2** — Desktop app framework
- **TypeScript** — Type-safe frontend
- **Vite** — Fast build tool
- **Tailwind CSS v4** — Utility-first styling

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
peakclaw/
├── src/
│   ├── components/     # UI components (TabBar, TitleBar)
│   ├── views/          # Page views (Landing, Dashboard, Chat, etc.)
│   ├── lib/            # Types and API utilities
│   ├── App.ts          # Main application logic
│   ├── main.ts         # Entry point
│   └── styles.css      # Global styles
├── src-tauri/          # Tauri Rust backend
├── assets/             # Static assets (logos, icons)
└── package.json
```

## License

MIT
