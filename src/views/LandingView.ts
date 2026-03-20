export type InputMode = "Chat" | "Browser" | "Tasks" | "Note" | "Settings";

interface LandingCallbacks {
  onAction: (mode: InputMode, text: string) => void;
  onOpenSettings: () => void;
}

const state = {
  selectedMode: "Chat" as InputMode,
  inputText: "",
};

export class LandingView {
  static render(rootView: string = "landing"): string {
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
            ></textarea>
            
            <div class="landing-controls">
              <select id="landing-mode" class="landing-select">
                <option value="Chat" ${state.selectedMode === "Chat" ? "selected" : ""}>Chat</option>
                <option value="Browser" ${state.selectedMode === "Browser" ? "selected" : ""}>Browser</option>
                <option value="Tasks" ${state.selectedMode === "Tasks" ? "selected" : ""}>Tasks</option>
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
      </div>
    `;
  }

  static mount(callbacks: LandingCallbacks): void {
    const input = document.getElementById("landing-input") as HTMLTextAreaElement | null;
    const modeSelect = document.getElementById("landing-mode") as HTMLSelectElement | null;
    const submitBtn = document.getElementById("landing-submit") as HTMLButtonElement | null;

    const autoResize = () => {
      if (!input) return;
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 200) + "px";
    };

    const updateUI = () => {
      autoResize();
      if (submitBtn) submitBtn.disabled = !input?.value?.trim();
    };

    if (input) {
      input.addEventListener("input", () => {
        state.inputText = input.value;
        updateUI();
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (submitBtn && !submitBtn.disabled) submitBtn.click();
        }
      });
    }

    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        state.selectedMode = modeSelect.value as InputMode;
        if (input) input.placeholder = this.getPlaceholder();
        updateUI();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        callbacks.onAction(state.selectedMode, input?.value?.trim() || "");
        if (input) input.value = "";
        state.inputText = "";
        updateUI();
      });
    }

    document.getElementById("go-settings")?.addEventListener("click", (e) => {
      e.preventDefault();
      callbacks.onOpenSettings();
    });

    requestAnimationFrame(() => {
      input?.focus();
      updateUI();
    });
  }

  private static getPlaceholder(): string {
    switch (state.selectedMode) {
      case "Chat": return "Send a message...";
      case "Browser": return "Enter URL to open...";
      case "Tasks": return "Create or open tasks...";
      case "Note": return "Create a new note...";
      case "Settings": return "Open Settings...";
      default: return "What would you like to do?";
    }
  }
}
