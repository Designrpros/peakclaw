import { TabBar } from "./components/TabBar";
import { TitleBar } from "./components/TitleBar";
import { DashboardView } from "./views/DashboardView";
import { ChatView } from "./views/ChatView";
import { BrowserView } from "./views/BrowserView";
import { SettingsView } from "./views/SettingsView";
import { LandingView } from "./views/LandingView";
import { WorkspacesView } from "./views/WorkspacesView";
import type { Tab, TabType } from "./lib/types";
import type { InputMode } from "./views/LandingView";

type PageView = "landing" | "dashboard" | "workspaces";

export class App {
  // Feature tabs (Chat, Browser, Settings)
  private tabs: Tab[] = [];
  private activeTab: string | null = null;
  
  // Root page views
  private currentPage: PageView = "landing";
  
  private isDarkMode: boolean = false;

  constructor() {
    const saved = localStorage.getItem("peakclaw-theme");
    this.isDarkMode = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  render(): string {
    return `
      <div class="app-container" data-theme="${this.isDarkMode ? "dark" : "light"}">
        ${TitleBar.render()}
        <div class="tab-bar-container">
          ${TabBar.render(this.tabs, this.activeTab || "", true)}
        </div>
        <div class="content-area" id="content-area">
          ${this.renderCurrent()}
        </div>
      </div>
    `;
  }

  mount(): void {
    TitleBar.mount();
    this.attachTabBar();
    this.mountCurrent();
  }

  // Render what should currently be shown
  private renderCurrent(): string {
    // Feature tabs take priority over root pages
    if (this.activeTab && this.tabs.length > 0) {
      return this.renderTabContent();
    }
    return this.renderPage();
  }

  // Render a root page (Landing, Dashboard, Workspaces)
  private renderPage(): string {
    switch (this.currentPage) {
      case "landing":
        return LandingView.render(this.currentPage);
      case "dashboard":
        return DashboardView.render(true, this.currentPage);
      case "workspaces":
        return WorkspacesView.render(true, this.currentPage);
      default:
        return LandingView.render("landing");
    }
  }

  // Render a feature tab content
  private renderTabContent(): string {
    const tab = this.tabs.find((t) => t.id === this.activeTab);
    if (!tab) return this.renderPage();

    switch (tab.type) {
      case "chat": return ChatView.render();
      case "browser": return BrowserView.render();
      case "settings": return SettingsView.render();
      default: return ChatView.render();
    }
  }

  private mountCurrent(): void {
    if (this.activeTab && this.tabs.length > 0) {
      this.mountTab();
    } else {
      this.mountPage();
    }
  }

  private mountPage(): void {
    switch (this.currentPage) {
      case "landing":
        LandingView.mount({
          onAction: (mode: InputMode) => this.handleLandingAction(mode),
          onOpenSettings: () => this.addTab("settings"),
          onPageChange: (page: PageView) => {
            this.currentPage = page;
            this.refresh();
          },
          currentPage: this.currentPage,
        });
        break;
      case "dashboard":
        DashboardView.mount({
          onPageChange: (page) => {
            this.currentPage = page as PageView;
            this.refresh();
          },
        });
        break;
      case "workspaces":
        WorkspacesView.mount({
          onPageChange: (page) => {
            this.currentPage = page as PageView;
            this.refresh();
          },
        });
        break;
    }
  }

  private mountTab(): void {
    const tab = this.tabs.find((t) => t.id === this.activeTab);
    if (!tab) return;

    switch (tab.type) {
      case "chat": ChatView.mount(); break;
      case "browser": BrowserView.mount(); break;
      case "settings": SettingsView.mount(); break;
    }
  }

  // Handle landing page actions - switch pages OR open tabs
  private handleLandingAction(mode: InputMode): void {
    switch (mode) {
      case "Dashboard":
        this.currentPage = "dashboard";
        this.refresh();
        break;
      case "Workspaces":
        this.currentPage = "workspaces";
        this.refresh();
        break;
      case "Chat":
        this.addTab("chat");
        break;
      case "Browser":
        this.addTab("browser");
        break;
      case "Settings":
        this.addTab("settings");
        break;
      default:
        this.addTab("chat");
    }
  }

  private attachTabBar(): void {
    TabBar.mount(this.tabs, this.activeTab || "", {
      onSelect: (id: string) => {
        this.activeTab = id;
        this.refresh();
      },
      onClose: (id: string) => {
        this.closeTab(id);
      },
      onAdd: () => {
        this.addNewTab();
      },
      onThemeToggle: () => {
        this.toggleTheme();
      },
    });
  }

  private toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.querySelector(".app-container")?.setAttribute("data-theme", this.isDarkMode ? "dark" : "light");
    localStorage.setItem("peakclaw-theme", this.isDarkMode ? "dark" : "light");
  }

  private updateTabBar(): void {
    const container = document.querySelector(".tab-bar-container")!;
    container.innerHTML = this.tabs.length > 0 ? TabBar.render(this.tabs, this.activeTab!, true) : "";
    this.attachTabBar();
  }

  private refresh(): void {
    const contentArea = document.querySelector("#content-area")!;
    const tabBarContainer = document.querySelector(".tab-bar-container")!;
    contentArea.innerHTML = this.renderCurrent();
    tabBarContainer.innerHTML = TabBar.render(this.tabs, this.activeTab || "", true);
    this.attachTabBar();
    this.mountCurrent();
  }

  // Add a new landing page tab (shows in tab bar but doesn't switch to it)
  private addNewTab(): void {
    const id = `tab-${Date.now()}`;
    this.tabs.push({ id, title: "New Tab", type: "chat", icon: "chat" });
    // Don't set activeTab - stay on current page
    this.updateTabBar();
    this.refresh();
  }

  // Open a specific feature tab
  addTab(type: TabType): void {
    const titles: Record<TabType, string> = {
      chat: "Chat",
      browser: "Browser",
      settings: "Settings",
    };
    const id = `tab-${Date.now()}`;
    this.tabs.push({ id, title: titles[type], type, icon: type });
    this.activeTab = id;
    this.updateTabBar();
    this.refresh();
  }

  private closeTab(id: string): void {
    const idx = this.tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;

    this.tabs.splice(idx, 1);

    if (this.activeTab === id) {
      this.activeTab = this.tabs.length > 0 ? this.tabs[Math.max(0, idx - 1)].id : null;
    }

    this.updateTabBar();
    this.refresh();
  }
}
