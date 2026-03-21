// NotesView.ts - PeakClaw Notes with Tree + Markdown Editor
import { NotesTree } from "../components/NotesTree";
import { NotesEditor } from "../components/NotesEditor";
import { NotesStorage } from "../lib/notesStorage";

export class NotesView {
  private storage: NotesStorage;
  private selectedNoteId: string | null = null;
  private isEditMode: boolean = false;

  constructor() {
    this.storage = new NotesStorage();
  }

  static render(): string {
    return `
      <div class="notes-container">
        <div class="notes-sidebar" id="notes-sidebar">
          <div class="notes-sidebar-header">
            <span class="notes-sidebar-title">Notes</span>
            <button class="notes-btn" id="notes-new-folder" title="New Folder">📁</button>
            <button class="notes-btn" id="notes-new-note" title="New Note">📄</button>
          </div>
          <div class="notes-tree" id="notes-tree"></div>
        </div>
        <div class="notes-main" id="notes-main">
          <div class="notes-empty">
            <div class="notes-empty-icon">📝</div>
            <div class="notes-empty-text">Velg eller opprett en note</div>
          </div>
        </div>
      </div>
    `;
  }

  static mount(): void {
    const view = new NotesView();
    view.init();
  }

  private init(): void {
    this.renderTree();
    this.attachSidebarButtons();
    this.attachMainHandlers();
  }

  private renderTree(): void {
    const treeEl = document.getElementById("notes-tree");
    if (!treeEl) return;

    const notes = this.storage.getAllNotes();
    treeEl.innerHTML = NotesTree.render(notes, this.selectedNoteId);
    NotesTree.mount({
      notes,
      selectedId: this.selectedNoteId,
      onSelect: (id: string) => this.selectNote(id),
      onDelete: (id: string) => this.deleteNote(id),
      onRename: (id: string, title: string) => this.renameNote(id, title),
      onToggleFolder: (id: string) => this.toggleFolder(id),
    });
  }

  private selectNote(id: string): void {
    this.selectedNoteId = id;
    this.isEditMode = false;
    this.renderTree();
    this.renderEditor();
  }

  private renderEditor(): void {
    const mainEl = document.getElementById("notes-main");
    if (!mainEl || !this.selectedNoteId) return;

    const note = this.storage.getNote(this.selectedNoteId);
    if (!note) return;

    mainEl.innerHTML = NotesEditor.render(note, this.isEditMode);
    NotesEditor.mount({
      note,
      isEditMode: this.isEditMode,
      onEdit: () => {
        this.isEditMode = true;
        this.renderEditor();
      },
      onSave: (content: string) => {
        this.storage.updateNote(this.selectedNoteId!, content);
        this.isEditMode = false;
        this.renderEditor();
      },
      onCancel: () => {
        this.isEditMode = false;
        this.renderEditor();
      },
      onBack: () => {
        this.selectedNoteId = null;
        this.isEditMode = false;
        mainEl.innerHTML = `
          <div class="notes-empty">
            <div class="notes-empty-icon">📝</div>
            <div class="notes-empty-text">Velg eller opprett en note</div>
          </div>
        `;
        this.renderTree();
      },
    });
  }

  private attachSidebarButtons(): void {
    document.getElementById("notes-new-folder")?.addEventListener("click", () => {
      const title = prompt("Folder name:");
      if (title) {
        this.storage.createFolder(title);
        this.renderTree();
      }
    });

    document.getElementById("notes-new-note")?.addEventListener("click", () => {
      const title = prompt("Note name:");
      if (title) {
        const note = this.storage.createNote(title);
        this.selectNote(note.id);
      }
    });
  }

  private attachMainHandlers(): void {
    // Handled by NotesEditor mount
  }

  private deleteNote(id: string): void {
    if (confirm("Slett denne nota?")) {
      this.storage.deleteNote(id);
      if (this.selectedNoteId === id) {
        this.selectedNoteId = null;
      }
      this.renderTree();
    }
  }

  private renameNote(id: string, title: string): void {
    this.storage.renameNote(id, title);
    this.renderTree();
  }

  private toggleFolder(id: string): void {
    this.storage.toggleFolder(id);
    this.renderTree();
  }
}
