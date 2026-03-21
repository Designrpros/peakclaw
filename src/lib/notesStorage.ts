// NotesStorage.ts - Local storage for notes

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

export class NotesStorage {
  private storageKey = "peakclaw-notes";
  private notes: Note[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.notes = JSON.parse(data);
      } else {
        // Create default structure
        this.createDefaultNotes();
      }
    } catch {
      this.notes = [];
      this.createDefaultNotes();
    }
  }

  private save(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
  }

  private createDefaultNotes(): void {
    const general = this.createFolderObject("Generelt", null, 0);
    const projects = this.createFolderObject("Prosjekter", null, 1);
    
    this.notes = [general, projects];
    this.save();
  }

  private createNoteObject(title: string, parentId: string | null, order: number): Note {
    return {
      id: "note-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      title,
      content: "",
      parentId,
      order,
      type: "note",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private createFolderObject(title: string, parentId: string | null, order: number): Note {
    return {
      id: "folder-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      title,
      content: "",
      parentId,
      order,
      type: "folder",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      collapsed: false,
    };
  }

  getAllNotes(): Note[] {
    return [...this.notes];
  }

  getNote(id: string): Note | undefined {
    return this.notes.find(n => n.id === id);
  }

  createNote(title: string, parentId: string | null = null): Note {
    const siblings = this.notes.filter(n => n.parentId === parentId);
    const order = siblings.length;
    
    const note = this.createNoteObject(title, parentId, order);
    this.notes.push(note);
    this.save();
    return note;
  }

  createFolder(title: string, parentId: string | null = null): Note {
    const siblings = this.notes.filter(n => n.parentId === parentId);
    const order = siblings.length;
    
    const folder = this.createFolderObject(title, parentId, order);
    this.notes.push(folder);
    this.save();
    return folder;
  }

  updateNote(id: string, content: string): void {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.content = content;
      note.updatedAt = Date.now();
      this.save();
    }
  }

  renameNote(id: string, title: string): void {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.title = title;
      note.updatedAt = Date.now();
      this.save();
    }
  }

  deleteNote(id: string): void {
    // Delete children first (recursive)
    const children = this.notes.filter(n => n.parentId === id);
    children.forEach(child => this.deleteNote(child.id));
    
    // Delete the note itself
    this.notes = this.notes.filter(n => n.id !== id);
    this.save();
  }

  toggleFolder(id: string): void {
    const folder = this.notes.find(n => n.id === id && n.type === "folder");
    if (folder) {
      folder.collapsed = !folder.collapsed;
      this.save();
    }
  }

  moveNote(id: string, newParentId: string | null): void {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.parentId = newParentId;
      // Update order
      const siblings = this.notes.filter(n => n.parentId === newParentId && n.id !== id);
      note.order = siblings.length;
      note.updatedAt = Date.now();
      this.save();
    }
  }

  reorderNote(id: string, newOrder: number): void {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.order = newOrder;
      note.updatedAt = Date.now();
      this.save();
    }
  }
}
