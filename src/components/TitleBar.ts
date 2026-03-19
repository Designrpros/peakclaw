export class TitleBar {
  static render(): string {
    return `
      <div class="titlebar">
        <div class="titlebar-drag-region">
          <div class="titlebar-icon">
            <img src="/assets/Peak-icon.png" alt="Peak" />
          </div>
          <span class="titlebar-title">PeakClaw</span>
        </div>
        <div class="titlebar-controls">
          <button class="titlebar-btn" id="btn-minimize" title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect y="5" width="12" height="2" fill="currentColor"/>
            </svg>
          </button>
          <button class="titlebar-btn" id="btn-maximize" title="Maximize">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button class="titlebar-btn btn-close" id="btn-close" title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  static mount(): void {
    import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      const win = getCurrentWindow();

      document.getElementById("btn-minimize")?.addEventListener("click", () => win.minimize());
      document.getElementById("btn-maximize")?.addEventListener("click", () => win.toggleMaximize());
      document.getElementById("btn-close")?.addEventListener("click", () => win.close());
    });
  }
}
