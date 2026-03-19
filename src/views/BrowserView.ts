export class BrowserView {
  static render(): string {
    return `
      <div class="view-browser">
        <div class="browser-toolbar">
          <button class="browser-nav-btn" id="btn-back" disabled>←</button>
          <button class="browser-nav-btn" id="btn-forward" disabled>→</button>
          <button class="browser-nav-btn" id="btn-reload">↻</button>
          <input type="text" id="browser-url" class="browser-url-input" placeholder="Enter URL..." />
        </div>
        <div class="browser-content">
          <div class="browser-placeholder">
            <div class="placeholder-icon">🌐</div>
            <h3>Browser</h3>
            <p>Enter a URL above to browse the web</p>
          </div>
        </div>
      </div>
    `;
  }

  static mount(): void {
    const urlInput = document.getElementById("browser-url") as HTMLInputElement;
    urlInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const url = urlInput.value.trim();
        if (url) {
          window.open(url, "_blank");
        }
      }
    });
  }
}
