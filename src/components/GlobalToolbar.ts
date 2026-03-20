
export class GlobalToolbar {
  static render(): string {
    return `
      <div id="global-toolbar">
        <div class="global-nav-controls">
          <button class="toolbar-btn" id="toolbar-back" title="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="toolbar-forward" title="Forward">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="toolbar-reload" title="Reload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
        
        <div class="global-search-container">
          <input 
            type="text" 
            id="global-search" 
            class="global-search-input" 
            placeholder="Search or enter URL..."
          />
        </div>
        
        <div class="global-toolbar-actions">
          <button class="toolbar-btn icon-only" id="toolbar-notes" title="Notes">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-only" id="toolbar-chat" title="Chat History">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-only" id="toolbar-tasks" title="Tasks">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-only" id="toolbar-history" title="History">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-only" id="toolbar-sessions" title="Sessions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  static mount(callbacks: {
    onSearch: (query: string) => void;
    onNewTab: () => void;
    onInspector: (type: string) => void;
  }): void {
    const searchInput = document.getElementById("global-search") as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("keydown", async (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          const value: string = searchInput.value;
          if (value && value.trim().length > 0) {
            const query = value.trim();
            let url: string;

            if (query.startsWith("http://") || query.startsWith("https://")) {
              url = query;
            } else if (query.includes(".") && !query.includes(" ")) {
              url = "https://" + query;
            } else {
              url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            }

            try {
              callbacks.onSearch(url);
            } catch (err) {
              console.error("Failed to open URL:", err);
            }
          }
        }
      });
    }

    document.getElementById("toolbar-notes")?.addEventListener("click", () => callbacks.onInspector("notes"));
    document.getElementById("toolbar-chat")?.addEventListener("click", () => callbacks.onInspector("chat"));
    document.getElementById("toolbar-tasks")?.addEventListener("click", () => callbacks.onInspector("tasks"));
    document.getElementById("toolbar-history")?.addEventListener("click", () => callbacks.onInspector("history"));
    document.getElementById("toolbar-sessions")?.addEventListener("click", () => callbacks.onInspector("sessions"));
  }
}
