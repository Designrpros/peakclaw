// NotesEditor.ts - Live Markdown Editor with View/Edit toggle

interface Note {
  id: string;
  title: string;
  content: string;
  type: "note" | "folder";
  createdAt: number;
  updatedAt: number;
}

interface NotesEditorOptions {
  note: Note;
  isEditMode: boolean;
  onEdit: () => void;
  onSave: (content: string) => void;
  onCancel: () => void;
  onBack: () => void;
}

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n/gim, '<br>');
  
  // Wrap consecutive li in ul
  html = html.replace(/(<li>.*<\/li>)<br>/g, '$1');
  html = '<ul>' + html + '</ul>';
  html = html.replace(/<ul><li>/g, '<li>').replace(/<\/li><\/ul>/g, '</li>');
  
  return html;
}

export class NotesEditor {
  static render(note: Note, isEditMode: boolean): string {
    if (isEditMode) {
      return this.renderEditMode(note);
    }
    return this.renderViewMode(note);
  }

  private static renderViewMode(note: Note): string {
    const html = markdownToHtml(note.content || "*Tom note - klikk for å redigere*");
    const date = new Date(note.updatedAt).toLocaleString("no-NO");

    return `
      <div class="notes-editor">
        <div class="notes-editor-header">
          <button class="notes-back-btn" id="notes-back">← Tilbake</button>
          <div class="notes-title">${note.title}</div>
          <div class="notes-actions">
            <button class="notes-edit-btn" id="notes-edit">Rediger</button>
          </div>
        </div>
        <div class="notes-meta">Oppdatert: ${date}</div>
        <div class="notes-content" id="notes-content">
          ${html}
        </div>
      </div>
    `;
  }

  private static renderEditMode(note: Note): string {
    return `
      <div class="notes-editor notes-edit-mode">
        <div class="notes-editor-header">
          <button class="notes-back-btn" id="notes-back">Avbryt</button>
          <div class="notes-title">${note.title}</div>
          <div class="notes-actions">
            <button class="notes-save-btn" id="notes-save">Lagre</button>
          </div>
        </div>
        <div class="notes-meta">Redigerer...</div>
        <textarea 
          class="notes-textarea" 
          id="notes-textarea"
          placeholder="Skriv markdown her..."
        >${note.content}</textarea>
        <div class="notes-preview" id="notes-preview"></div>
      </div>
    `;
  }

  static mount(options: NotesEditorOptions): void {
    const { isEditMode, onEdit, onSave, onCancel, onBack } = options;

    // Back button
    document.getElementById("notes-back")?.addEventListener("click", () => {
      if (isEditMode) {
        onCancel();
      } else {
        onBack();
      }
    });

    if (isEditMode) {
      // Edit mode handlers
      const textarea = document.getElementById("notes-textarea") as HTMLTextAreaElement;
      const preview = document.getElementById("notes-preview");

      if (textarea && preview) {
        // Live preview
        textarea.addEventListener("input", () => {
          preview.innerHTML = markdownToHtml(textarea.value);
        });

        // Initial preview
        preview.innerHTML = markdownToHtml(textarea.value);

        // Auto-resize textarea
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.addEventListener("input", () => {
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        });

        // Focus textarea
        textarea.focus();
      }

      // Save button
      document.getElementById("notes-save")?.addEventListener("click", () => {
        const content = textarea?.value || "";
        onSave(content);
      });

      // Ctrl+S to save
      textarea?.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          const content = textarea?.value || "";
          onSave(content);
        }
      });

      // Escape to cancel
      textarea?.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          onCancel();
        }
      });

    } else {
      // View mode handlers
      document.getElementById("notes-edit")?.addEventListener("click", () => {
        onEdit();
      });

      // Click on content to edit
      const content = document.getElementById("notes-content");
      content?.addEventListener("click", () => {
        onEdit();
      });
    }
  }
}
