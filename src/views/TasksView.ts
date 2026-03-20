export class TasksView {
  static render(): string {
    return `
      <div class="view-tasks">
        <div class="view-header">
          <h1 class="view-title">Tasks</h1>
          <p class="view-subtitle">Kanban board</p>
        </div>
        
        <div class="kanban-board">
          <div class="kanban-column" id="todo">
            <div class="kanban-header">
              <h3>To Do</h3>
              <button class="kanban-add" data-column="todo">+</button>
            </div>
            <div class="kanban-cards" id="todo-cards">
              <div class="kanban-card">
                <div class="card-title">New feature request</div>
                <div class="card-meta">High priority</div>
              </div>
            </div>
          </div>
          
          <div class="kanban-column" id="progress">
            <div class="kanban-header">
              <h3>In Progress</h3>
              <button class="kanban-add" data-column="progress">+</button>
            </div>
            <div class="kanban-cards" id="progress-cards">
              <div class="kanban-card">
                <div class="card-title">Implement search</div>
                <div class="card-meta">Medium priority</div>
              </div>
            </div>
          </div>
          
          <div class="kanban-column" id="done">
            <div class="kanban-header">
              <h3>Done</h3>
              <button class="kanban-add" data-column="done">+</button>
            </div>
            <div class="kanban-cards" id="done-cards">
              <div class="kanban-card completed">
                <div class="card-title">Setup project</div>
                <div class="card-meta">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static mount(): void {
    console.log("[TasksView] Mounted");
    
    // Add button handlers
    document.querySelectorAll(".kanban-add").forEach(btn => {
      btn.addEventListener("click", () => {
        const column = (btn as HTMLElement).dataset.column;
        if (column) {
          this.addCard(column);
        }
      });
    });
  }

  private static addCard(column: string): void {
    const cardsContainer = document.getElementById(`${column}-cards`);
    if (!cardsContainer) return;

    const title = prompt("Task title:");
    if (!title) return;

    const card = document.createElement("div");
    card.className = "kanban-card";
    card.innerHTML = `
      <div class="card-title">${title}</div>
      <div class="card-meta">Just added</div>
    `;
    cardsContainer.appendChild(card);
  }
}
