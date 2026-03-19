export class SettingsView {
  static render(): string {
    return `
      <div class="view-settings">
        <div class="view-header">
          <h1 class="view-title">Settings</h1>
          <span class="view-subtitle">Configure PeakClaw</span>
        </div>

        <div class="settings-container">
          <div class="settings-section">
            <h2 class="settings-section-title">General</h2>
            <div class="settings-item">
              <div class="settings-label">
                <div class="settings-label-text">Launch at startup</div>
                <div class="settings-label-desc">Start PeakClaw when you log in</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="toggle-startup" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h2 class="settings-section-title">About</h2>
            <div class="about-info">
              <div class="about-logo">🦞</div>
              <div class="about-name">PeakClaw</div>
              <div class="about-version">Version 0.1.0</div>
              <div class="about-desc">AI Agent Dashboard for OpenClaw</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static mount(): void {
    // Settings mount logic
  }
}
