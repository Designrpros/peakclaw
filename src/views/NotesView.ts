// NotesView.ts - PeakClaw Notes with Vault/Note workflow
import { NotesTree } from "../components/NotesTree";
import { NotesEditor } from "../components/NotesEditor";

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

function createFolder(title: string, order: number): Note {
  return {
    id: "folder-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    title,
    content: "",
    parentId: null,
    order,
    type: "folder",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    collapsed: false
  };
}

function createNote(title: string, content: string, order: number): Note {
  return {
    id: "note-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    title,
    content,
    parentId: null,
    order,
    type: "note",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

interface NotesWorkspace {
  type: "vault" | "simple";
  path?: string;
  notes: Note[];
}

const STORAGE_KEY = "peakclaw-notes-workspace";

export class NotesView {
  private workspace: NotesWorkspace | null = null;
  private selectedNoteId: string | null = null;
  private isEditMode: boolean = false;

  static render(): string {
    return `
      <div class="notes-container">
        <div class="notes-setup" id="notes-setup">
          <div class="notes-setup-card">
            <div class="notes-setup-icon">📝</div>
            <h2 class="notes-setup-title">Notes</h2>
            
            <div class="notes-input-group">
              <input type="text" class="notes-command-input" id="notes-input" placeholder="Skriv kommando..." autocomplete="off">
              <div class="notes-menu" id="notes-menu">
                <div class="notes-menu-item" data-value="vault">
                  <span class="notes-menu-icon">📁</span>
                  <span class="notes-menu-text">Vault</span>
                  <span class="notes-menu-hint">Opprett vault med tree view</span>
                </div>
                <div class="notes-menu-item" data-value="simple">
                  <span class="notes-menu-icon">📄</span>
                  <span class="notes-menu-text">Simple</span>
                  <span class="notes-menu-hint">Hurtignotat</span>
                </div>
              </div>
              <button class="notes-send-btn" id="notes-send">→</button>
            </div>
            
            <div class="notes-hints">
              <span>Skriv <strong>vault</strong> eller <strong>simple</strong></span>
            </div>
          </div>
        </div>
        
        <div class="notes-workspace" id="notes-workspace" style="display:none;">
          <div class="notes-sidebar" id="notes-sidebar">
            <div class="notes-sidebar-header">
              <button class="notes-back-btn" id="notes-back-to-setup" title="Back">←</button>
              <span class="notes-sidebar-title" id="notes-workspace-title">Notes</span>
              <div class="notes-sidebar-actions">
                <button class="notes-btn" id="notes-new-folder" title="New Folder">📁</button>
                <button class="notes-btn" id="notes-new-note" title="New Note">📄</button>
              </div>
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
      </div>
    `;
  }

  static mount(): void {
    const view = new NotesView();
    view.init();
  }

  private init(): void {
    this.loadWorkspace();
    this.attachSetupHandlers();
    
    if (this.workspace) {
      this.showWorkspace();
    }
  }

  private loadWorkspace(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.workspace = JSON.parse(data);
      }
    } catch {
      this.workspace = null;
    }
  }

  private saveWorkspace(): void {
    if (this.workspace) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workspace));
    }
  }

  private attachSetupHandlers(): void {
    const input = document.getElementById("notes-input") as HTMLInputElement;
    const menu = document.getElementById("notes-menu");
    const sendBtn = document.getElementById("notes-send");

    // Show menu when typing
    input?.addEventListener("input", () => {
      const value = input.value.toLowerCase().trim();
      if (value.length > 0) {
        menu?.classList.add("active");
      } else {
        menu?.classList.remove("active");
      }
    });

    // Handle menu item clicks
    document.querySelectorAll(".notes-menu-item").forEach(item => {
      item.addEventListener("click", () => {
        const value = (item as HTMLElement).dataset.value;
        if (value === "vault") {
          this.initVault();
        } else if (value === "simple") {
          this.initSimple();
        }
      });
    });

    // Handle send button
    sendBtn?.addEventListener("click", () => {
      const value = input.value.toLowerCase().trim();
      if (value === "vault") {
        this.initVault();
      } else if (value === "simple") {
        this.initSimple();
      }
    });

    // Handle enter key
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = input.value.toLowerCase().trim();
        if (value === "vault") {
          this.initVault();
        } else if (value === "simple") {
          this.initSimple();
        }
      }
    });

    // Focus input
    input?.focus();
  }

  private initVault(): void {
    const defaultNotes: Note[] = [
      createFolder("Prosjekter", 0),
      createNote("Velkommen", "# Velkommen til PeakClaw Notes\n\nDette er ditt første notat! Klikk for å redigere.\n\n## Funksjoner\n- **Tree view** - organiser notater i foldere\n- **Markdown** - skriv med markdown-syntaks\n- **Auto-save** - alt lagres automatisk", 1)
    ];

    this.workspace = {
      type: "vault",
      path: "~/.peakclaw/notes",
      notes: defaultNotes
    };
    this.saveWorkspace();
    this.showWorkspace();
  }

  private initSimple(): void {
    const simpleNote = createNote(
      "Hurtignotat",
      "# Hurtignotat\n\nSkriv dine tanker her...\n\n*Trykk Ctrl+S for å lagre*",
      0
    );

    this.workspace = {
      type: "simple",
      notes: [simpleNote]
    };
    this.saveWorkspace();
    
    this.showSimpleEditor(simpleNote);
  }

  private showWorkspace(): void {
    const setup = document.getElementById("notes-setup");
    const workspace = document.getElementById("notes-workspace");
    if (setup) setup.style.display = "none";
    if (workspace) workspace.style.display = "flex";
    
    // Update title based on workspace type
    const title = document.getElementById("notes-workspace-title");
    if (title) {
      title.textContent = this.workspace?.type === "simple" ? "Simple Note" : "Vault";
    }
    
    // Hide sidebar for simple mode
    const sidebar = document.getElementById("notes-sidebar");
    if (sidebar) {
      sidebar.style.display = this.workspace?.type === "simple" ? "none" : "flex";
    }
    
    this.renderTree();
    this.attachWorkspaceHandlers();
  }

  private showSimpleEditor(note: Note): void {
    const setup = document.getElementById("notes-setup");
    const workspace = document.getElementById("notes-workspace");
    if (setup) setup.style.display = "none";
    if (workspace) workspace.style.display = "flex";
    
    // Hide sidebar for simple mode
    const sidebar = document.getElementById("notes-sidebar");
    if (sidebar) sidebar.style.display = "none";
    
    const main = document.getElementById("notes-main");
    if (main) {
      main.innerHTML = this.renderSimpleEditor(note);
      this.attachSimpleEditorHandlers(note);
    }
  }

  private renderSimpleEditor(note: Note): string {
    return `
      <div class="notes-editor notes-simple">
        <div class="notes-editor-header">
          <div class="notes-title">${note.title}</div>
          <button class="notes-save-btn" id="notes-save">Lagre</button>
        </div>
        <textarea class="notes-textarea" id="notes-textarea">${note.content}</textarea>
      </div>
    `;
  }

  private attachSimpleEditorHandlers(note: Note): void {
    const textarea = document.getElementById("notes-textarea") as HTMLTextAreaElement;
    const saveBtn = document.getElementById("notes-save");
    
    if (textarea) {
      textarea.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          this.saveSimpleNote(note.id, textarea.value);
        }
      });
    }
    
    saveBtn?.addEventListener("click", () => {
      this.saveSimpleNote(note.id, textarea.value);
    });
  }

  private saveSimpleNote(id: string, content: string): void {
    if (!this.workspace) return;
    
    const note = this.workspace.notes.find(n => n.id === id);
    if (note) {
      note.content = content;
      note.updatedAt = Date.now();
      this.saveWorkspace();
      
      // Show saved indicator
      const saveBtn = document.getElementById("notes-save");
      if (saveBtn) {
        saveBtn.textContent = "Lagret!";
        setTimeout(() => {
          saveBtn.textContent = "Lagre";
        }, 1500);
      }
    }
  }

  private attachWorkspaceHandlers(): void {
    document.getElementById("notes-back-to-setup")?.addEventListener("click", () => {
      this.workspace = null;
      this.saveWorkspace();
      localStorage.removeItem(STORAGE_KEY);
      
      const setup = document.getElementById("notes-setup");
      const workspace = document.getElementById("notes-workspace");
      if (setup) setup.style.display = "flex";
      if (workspace) workspace.style.display = "none";
    });

    document.getElementById("notes-new-folder")?.addEventListener("click", () => {
      const title = prompt("Folder name:");
      if (title && this.workspace) {
        const folder = createFolder(title, this.workspace.notes.length);
        this.workspace.notes.push(folder);
        this.saveWorkspace();
        this.renderTree();
      }
    });

    document.getElementById("notes-new-note")?.addEventListener("click", () => {
      const title = prompt("Note name:");
      if (title && this.workspace) {
        const note = createNote(title, "", this.workspace.notes.length);
        this.workspace.notes.push(note);
        this.saveWorkspace();
        this.selectNote(note.id);
      }
    });
  }

  private renderTree(): void {
    const treeEl = document.getElementById("notes-tree");
    if (!treeEl || !this.workspace) return;

    treeEl.innerHTML = NotesTree.render(this.workspace.notes, this.selectedNoteId);
    NotesTree.mount({
      notes: this.workspace.notes,
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
    if (!mainEl || !this.selectedNoteId || !this.workspace) return;

    const note = this.workspace.notes.find(n => n.id === this.selectedNoteId);
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
        this.saveNote(this.selectedNoteId!, content);
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

  private saveNote(id: string, content: string): void {
    if (!this.workspace) return;
    
    const note = this.workspace.notes.find(n => n.id === id);
    if (note) {
      note.content = content;
      note.updatedAt = Date.now();
      this.saveWorkspace();
    }
  }

  private deleteNote(id: string): void {
    if (!this.workspace) return;
    
    if (confirm("Slett denne nota?")) {
      this.deleteRecursive(id);
      if (this.selectedNoteId === id) {
        this.selectedNoteId = null;
      }
      this.saveWorkspace();
      this.renderTree();
    }
  }

  private deleteRecursive(id: string): void {
    if (!this.workspace) return;
    
    // Delete children first
    const children = this.workspace.notes.filter(n => n.parentId === id);
    children.forEach(child => this.deleteRecursive(child.id));
    
    // Delete the note itself
    this.workspace.notes = this.workspace.notes.filter(n => n.id !== id);
  }

  private renameNote(id: string, title: string): void {
    if (!this.workspace) return;
    
    const note = this.workspace.notes.find(n => n.id === id);
    if (note) {
      note.title = title;
      note.updatedAt = Date.now();
      this.saveWorkspace();
      this.renderTree();
    }
  }

  private toggleFolder(id: string): void {
    if (!this.workspace) return;
    
    const folder = this.workspace.notes.find(n => n.id === id && n.type === "folder");
    if (folder) {
      folder.collapsed = !folder.collapsed;
      this.saveWorkspace();
      this.renderTree();
    }
  }
}
