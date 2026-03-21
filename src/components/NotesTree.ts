// NotesTree.ts - Obsidian-style collapsible tree sidebar

interface Note {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  order: number;
  type: "note" | "folder";
  createdAt: number;
  updatedAt: number;
  collapsed?: boolean;
}

interface NotesTreeOptions {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onToggleFolder: (id: string) => void;
}

export class NotesTree {
  static render(notes: Note[], selectedId: string | null): string {
    // Build tree structure
    const rootNotes = notes.filter(n => n.parentId === null).sort((a, b) => a.order - b.order);

    const renderItem = (note: Note, depth: number = 0): string => {
      const children = notes.filter(n => n.parentId === note.id).sort((a, b) => a.order - b.order);
      const hasChildren = children.length > 0;
      const isSelected = selectedId === note.id;
      const isCollapsed = note.collapsed && note.type === "folder";

      const indent = depth * 16;
      const icon = note.type === "folder" ? (isCollapsed ? "📁" : "📂") : "📄";
      const expandIcon = note.type === "folder" ? (isCollapsed ? "▶" : "▼") : "";

      let html = `
        <div class="tree-item tree-${note.type} ${isSelected ? "selected" : ""}" 
             data-id="${note.id}" 
             style="padding-left: ${indent + 8}px"
             draggable="true">
          ${note.type === "folder" ? `<span class="tree-expand">${expandIcon}</span>` : ""}
          <span class="tree-icon">${icon}</span>
          <span class="tree-title">${note.title}</span>
          <div class="tree-actions">
            <button class="tree-btn rename" title="Rename">✏️</button>
            <button class="tree-btn delete" title="Delete">🗑️</button>
          </div>
        </div>
      `;

      if (!isCollapsed && hasChildren) {
        children.forEach(child => {
          html += renderItem(child, depth + 1);
        });
      }

      return html;
    };

    let treeHtml = '<div class="tree-root">';
    rootNotes.forEach(note => {
      treeHtml += renderItem(note);
    });
    treeHtml += '</div>';

    if (rootNotes.length === 0) {
      treeHtml = '<div class="tree-empty">Ingen notater enda</div>';
    }

    return treeHtml;
  }

  static mount(options: NotesTreeOptions): void {
    const { notes, onSelect, onDelete, onRename, onToggleFolder } = options;

    // Click handlers
    document.querySelectorAll(".tree-item").forEach(item => {
      const el = item as HTMLElement;
      const id = el.dataset.id!;

      el.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        
        // Check if clicking expand icon
        if (target.classList.contains("tree-expand")) {
          e.stopPropagation();
          const note = notes.find(n => n.id === id);
          if (note) onToggleFolder(id);
          return;
        }

        // Check if clicking action buttons
        if (target.classList.contains("rename")) {
          e.stopPropagation();
          const note = notes.find(n => n.id === id);
          if (note) {
            const newTitle = prompt("New name:", note.title);
            if (newTitle && newTitle !== note.title) {
              onRename(id, newTitle);
            }
          }
          return;
        }

        if (target.classList.contains("delete")) {
          e.stopPropagation();
          onDelete(id);
          return;
        }

        // Select item
        const note = notes.find(n => n.id === id);
        if (note?.type === "folder") {
          onToggleFolder(id);
        } else {
          onSelect(id);
        }
      });

      // Double click to rename
      el.addEventListener("dblclick", (e) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains("tree-expand") && !target.classList.contains("tree-btn")) {
          const note = notes.find(n => n.id === id);
          if (note && note.type !== "folder") {
            const newTitle = prompt("Rename:", note.title);
            if (newTitle && newTitle !== note.title) {
              onRename(id, newTitle);
            }
          }
        }
      });

      // Drag and drop
      el.addEventListener("dragstart", (e) => {
        (e as DragEvent).dataTransfer?.setData("text/plain", id);
        el.classList.add("dragging");
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
      });

      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.classList.add("drag-over");
      });

      el.addEventListener("dragleave", () => {
        el.classList.remove("drag-over");
      });

      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("drag-over");
        // TODO: Implement reorder/relocate
      });
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const selected = document.querySelector(".tree-item.selected");
        if (selected) {
          const id = (selected as HTMLElement).dataset.id!;
          const note = notes.find(n => n.id === id);
          if (note) {
            if (note.type === "folder") {
              onToggleFolder(id);
            } else {
              onSelect(id);
            }
          }
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = document.querySelector(".tree-item.selected");
        if (selected) {
          const id = (selected as HTMLElement).dataset.id!;
          onDelete(id);
        }
      }

      if (e.key === "F2") {
        const selected = document.querySelector(".tree-item.selected");
        if (selected) {
          const id = (selected as HTMLElement).dataset.id!;
          const note = notes.find(n => n.id === id);
          if (note) {
            const newTitle = prompt("Rename:", note.title);
            if (newTitle && newTitle !== note.title) {
              onRename(id, newTitle);
            }
          }
        }
      }
    });
  }
}
