import type { Tab, TabType } from "../lib/types";

export class TabBar {
  static render(tabs: Tab[], activeId: string, canClose: boolean = false): string {
    return `
      <div class="tabs-wrapper">
        <div class="tabs-list" id="tabs-list">
          ${tabs.map((tab) => `
            <div class="tab-item ${tab.id === activeId ? "active" : ""}" data-tab-id="${tab.id}">
              <span class="tab-icon">${this.getTabIcon(tab.type)}</span>
              <span class="tab-label">${tab.title}</span>
              ${canClose && tabs.length > 1 ? `<button class="tab-close" data-close-id="${tab.id}">×</button>` : ""}
            </div>
          `).join("")}
        </div>
        <button class="tab-add-btn" id="tab-add" title="New Tab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <div class="tabs-right">
          <button class="tab-action-btn" id="theme-toggle" title="Toggle Theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private static getTabIcon(type: TabType): string {
    const icons: Record<TabType, string> = {
      chat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      browser: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      settings: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    };
    return icons[type] || icons.chat;
  }

  static getIcon(type: TabType): string {
    return this.getTabIcon(type);
  }

  static mount(
    _tabs: Tab[],
    _activeId: string,
    callbacks: {
      onSelect: (id: string) => void;
      onClose?: (id: string) => void;
      onAdd?: () => void;
      onThemeToggle?: () => void;
    }
  ): void {
    // Tab selection
    document.querySelectorAll(".tab-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".tab-close")) return;
        const id = (el as HTMLElement).dataset.tabId!;
        callbacks.onSelect(id);
      });
    });

    // Tab close
    document.querySelectorAll(".tab-close").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = (el as HTMLElement).dataset.closeId!;
        callbacks.onClose?.(id);
      });
    });

    // Add tab
    document.getElementById("tab-add")?.addEventListener("click", () => {
      callbacks.onAdd?.();
    });

    // Theme toggle
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      callbacks.onThemeToggle?.();
    });
  }
}
