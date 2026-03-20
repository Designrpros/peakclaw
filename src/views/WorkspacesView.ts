export class WorkspacesView {
  static render(): string {
    return `
      <div class="view-workspaces">
        <div class="view-header">
          <h1 class="view-title">Workspaces</h1>
          <span class="view-subtitle">Manage your saved workspace layouts</span>
        </div>

        <div class="workspaces-section">
          <div class="workspaces-grid">
            ${this.renderWorkspaceCard("New Workspace", "create")}
          </div>
          
          <div class="workspaces-saved">
            <h2 class="section-title">Saved Workspaces</h2>
            <div class="saved-workspaces-list" id="saved-workspaces">
              <div class="empty-state">No saved workspaces yet</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private static renderWorkspaceCard(title: string, action: string): string {
    return `
      <div class="workspace-card empty" data-action="${action}">
        <div class="workspace-add">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>${title}</span>
        </div>
      </div>
    `;
  }

  static mount(): void {
    document.querySelectorAll(".workspace-card").forEach((card) => {
      card.addEventListener("click", () => {
        const action = card.getAttribute("data-action");
        if (action === "create") {
          console.log("Create new workspace");
        }
      });
    });
  }
}
