import { TitleBar } from "./components/TitleBar";
import { TabBar } from "./components/TabBar";
import { GlobalToolbar } from "./components/GlobalToolbar";
import { LandingView } from "./views/LandingView";
import { WorkspacesView } from "./views/WorkspacesView";
import { ChatView } from "./views/ChatView";
import { BrowserView } from "./views/BrowserView";
import { SettingsView } from "./views/SettingsView";
import { TasksView } from "./views/TasksView";
import { AGENTS } from "./lib/constants";
import { renderDashboardView, mountDashboardView } from "./views/DashboardView";

type RootView = "landing" | "dashboard" | "workspaces";
type TabType = "landing" | "chat" | "browser" | "settings" | "tasks" | "note";

interface Tab {
  id: string;
  title: string;
  type: TabType;
}

export class App {
  private tabs: Tab[] = [];
  private activeTab: string = "";
  private selectedAgent: string = "alcatelz";
  private currentRootView: RootView = "landing";

  constructor() {
    this.openTab("landing");
  }

  render(): string {
    return `
      <div class="app-container">
        ${TitleBar.render()}
        <div class="toolbar-container">
          ${GlobalToolbar.render()}
        </div>
        <div class="tab-bar-container">
          ${TabBar.render(this.tabs, this.activeTab, true)}
        </div>
        <div class="content-area" id="content-area">
          ${this.renderContent()}
        </div>
        
        <div class="bottom-nav-bar" id="bottom-nav">
          <button class="bottom-nav-dot ${this.currentRootView === "landing" ? "active" : ""}" data-view="landing" title="Landing"></button>
          <button class="bottom-nav-dot ${this.currentRootView === "dashboard" ? "active" : ""}" data-view="dashboard" title="Dashboard"></button>
          <button class="bottom-nav-dot ${this.currentRootView === "workspaces" ? "active" : ""}" data-view="workspaces" title="Workspaces"></button>
        </div>
      </div>
    `;
  }

  mount(): void {
    TitleBar.mount();
    this.attachTabBar();
    this.mountGlobalToolbar();
    this.mountBottomNav();
    this.mountContent();
  }

  private renderContent(): string {
    const tab = this.tabs.find(t => t.id === this.activeTab);
    if (!tab || tab.type !== "landing") return ChatView.render(this.selectedAgent);

    switch (this.currentRootView) {
      case "dashboard": return renderDashboardView();
      case "workspaces": return WorkspacesView.render();
      default: return LandingView.render(this.currentRootView);
    }
  }

  private openTab(type: TabType): void {
    const titles: Record<TabType, string> = {
      landing: "Landing",
      chat: "Chat",
      browser: "Browser",
      settings: "Settings",
      tasks: "Tasks",
      note: "Note",
    };
    const id = "tab-" + Date.now();
    this.tabs.push({ id, title: titles[type], type });
    this.activeTab = id;
  }

  private attachTabBar(): void {
    TabBar.mount(this.tabs, this.activeTab, {
      onSelect: (id) => {
        this.activeTab = id;
        this.mountContent();
      },
      onClose: (id) => {
        this.tabs = this.tabs.filter(t => t.id !== id);
        if (this.tabs.length === 0) this.openTab("landing");
        else if (this.activeTab === id) this.activeTab = this.tabs[this.tabs.length - 1].id;
        this.mountContent();
      },
      onAdd: () => {
        this.openTab("landing");
        this.mountContent();
      },
      onThemeToggle: () => {
        this.toggleTheme();
      },
    });
  }

  public toggleTheme(): void {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("peak-theme", next);
  }

  public loadTheme(): void {
    const saved = localStorage.getItem("peak-theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
    }
  }

  private mountGlobalToolbar(): void {
    GlobalToolbar.mount({
      onSearch: (query) => {
        if (query) {
          (window as any).__browserQuery = query;
          this.openTab("browser");
          this.mountContent();
        }
      },
      onNewTab: () => {
        this.openTab("landing");
        this.mountContent();
      },
      onInspector: (type) => console.log("Inspector:", type),
    });
  }

  private mountBottomNav(): void {
    document.querySelectorAll(".bottom-nav-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        const view = (dot as HTMLElement).dataset.view as RootView;
        if (view) {
          this.currentRootView = view;
          this.updateNavDots();
          // Re-render content area
          const contentArea = document.getElementById("content-area");
          if (contentArea) {
            contentArea.innerHTML = this.renderContent();
          }
          this.mountContent();
        }
      });
    });
  }

  private updateNavDots(): void {
    document.querySelectorAll(".bottom-nav-dot").forEach(dot => {
      dot.classList.toggle("active", (dot as HTMLElement).dataset.view === this.currentRootView);
    });
  }

  private mountContent(): void {
    const tab = this.tabs.find(t => t.id === this.activeTab);
    if (!tab) return;

    if (tab.type === "landing") {
      switch (this.currentRootView) {
        case "dashboard":
          mountDashboardView();
          return;
        case "workspaces":
          WorkspacesView.mount();
          return;
        default:
          LandingView.mount({
            onAction: (mode, text) => {
              switch (mode) {
                case "Browser": 
                  if (text) (window as any).__browserQuery = text;
                  this.openTab("browser");
                  this.mountContent();
                  break;
                case "Chat": this.openTab("chat"); this.mountContent(); break;
                case "Tasks": this.openTab("tasks"); this.mountContent(); break;
                case "Note": this.openTab("note"); this.mountContent(); break;
                case "Settings": this.openTab("settings"); this.mountContent(); break;
              }
            },
            onOpenSettings: () => { this.openTab("settings"); this.mountContent(); },
          });
          return;
      }
    }

    if (tab.type === "chat") {
      ChatView.mount({
        selectedAgent: this.selectedAgent,
        onAgentChange: (a) => { this.selectedAgent = a; }
      }, AGENTS);
    } else if (tab.type === "browser") {
      BrowserView.mount();
    } else if (tab.type === "settings") {
      SettingsView.mount();
    } else if (tab.type === "tasks") {
      TasksView.mount();
    }
  }
}
