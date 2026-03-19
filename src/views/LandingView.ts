export type InputMode = "Dashboard" | "Workspaces" | "Chat" | "Browser" | "Note" | "Settings";
export type PageView = "landing" | "dashboard" | "workspaces";

interface LandingCallbacks {
  onAction: (mode: InputMode, text: string) => void;
  onOpenSettings: () => void;
  onPageChange: (page: PageView) => void;
  currentPage: PageView;
}

const state = {
  selectedMode: "Chat" as InputMode,
  inputText: "",
};

export class LandingView {
  static render(page: PageView = "landing"): string {
    return `
      <div class="landing-container">
        <div class="landing-vstack">
          <img src="/assets/Peak-icon.png" alt="PeakClaw" class="landing-logo">
          
          <div class="landing-input-box">
            <textarea 
              id="landing-input" 
              class="landing-textarea" 
              placeholder="${this.getPlaceholder()}"
              rows="1"
              spellcheck="true"
            >${state.inputText}</textarea>
            
            <div class="landing-controls">
              <select id="landing-mode" class="landing-select">
                <option value="Dashboard" ${state.selectedMode === "Dashboard" ? "selected" : ""}>Dashboard</option>
                <option value="Workspaces" ${state.selectedMode === "Workspaces" ? "selected" : ""}>Workspaces</option>
                <option value="Chat" ${state.selectedMode === "Chat" ? "selected" : ""}>Chat</option>
                <option value="Browser" ${state.selectedMode === "Browser" ? "selected" : ""}>Browser</option>
                <option value="Note" ${state.selectedMode === "Note" ? "selected" : ""}>Note</option>
                <option value="Settings" ${state.selectedMode === "Settings" ? "selected" : ""}>Settings</option>
              </select>
              
              <button id="landing-submit" class="landing-submit" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <a href="#" class="landing-settings-link" id="go-settings">Settings</a>
        </div>
        
        <div class="landing-dots">
          <span class="landing-dot ${page === 'landing' ? 'active' : ''}" data-page="landing" title="Landing"></span>
          <span class="landing-dot ${page === 'dashboard' ? 'active' : ''}" data-page="dashboard" title="Dashboard"></span>
          <span class="landing-dot ${page === 'workspaces' ? 'active' : ''}" data-page="workspaces" title="Workspaces"></span>
        </div>
      </div>
    `;
  }

  static mount(callbacks: LandingCallbacks): void {
    const input = document.getElementById("landing-input") as HTMLTextAreaElement;
    const modeSelect = document.getElementById("landing-mode") as HTMLSelectElement;
    const submitBtn = document.getElementById("landing-submit")!;
    const settingsLink = document.getElementById("go-settings")!;

    const autoResize = () => {
      if (!input) return;
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 200) + "px";
    };

    const updateUI = () => {
      autoResize();
      const isLaunchMode = ["Settings", "Dashboard", "Workspaces"].includes(state.selectedMode);
      const hasContent = input.value.trim().length > 0;
      (submitBtn as HTMLButtonElement).disabled = !(hasContent || isLaunchMode);
    };

    input?.addEventListener("input", () => {
      state.inputText = input.value;
      updateUI();
    });

    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!submitBtn.hasAttribute("disabled")) {
          submitBtn.click();
        }
      }
    });

    modeSelect?.addEventListener("change", () => {
      state.selectedMode = modeSelect.value as InputMode;
      input.placeholder = this.getPlaceholder();
      updateUI();
    });

    submitBtn.addEventListener("click", () => {
      callbacks.onAction(state.selectedMode, input.value.trim());
      input.value = "";
      state.inputText = "";
      updateUI();
    });

    settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      callbacks.onOpenSettings();
    });

    document.querySelectorAll(".landing-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const page = dot.getAttribute("data-page") as PageView;
        callbacks.onPageChange(page);
      });
    });

    requestAnimationFrame(() => {
      input?.focus();
      updateUI();
    });
  }

  private static getPlaceholder(): string {
    switch (state.selectedMode) {
      case "Dashboard": return "Go to Dashboard...";
      case "Workspaces": return "Manage Workspaces...";
      case "Chat": return "Send a message to Alcatelz...";
      case "Browser": return "Enter URL to open...";
      case "Note": return "Create a new note...";
      case "Settings": return "Open Settings...";
      default: return "What would you like to do?";
    }
  }
}
