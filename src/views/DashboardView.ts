// Dashboard - simple module pattern
const dashTabs = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "sessions", label: "Sessions", icon: "💬" },
  { id: "cron", label: "Cron", icon: "⏰" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "tools", label: "Tools", icon: "🔧" },
  { id: "memory", label: "Memory", icon: "🧠" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "nodes", label: "Nodes", icon: "🖥️" },
];

let activeTab = "overview";

function switchTab(id: string) {
  activeTab = id;
  renderDashboardTabs();
  renderDashboardContent();
}

function renderDashboardTabs() {
  const bar = document.querySelector(".dashboard-tab-bar");
  if (!bar) return;
  bar.innerHTML = dashTabs.map(t => 
    `<button class="dashboard-tab ${activeTab === t.id ? 'active' : ''}" data-id="${t.id}">${t.icon} ${t.label}</button>`
  ).join("");
}

function renderDashboardContent() {
  const content = document.getElementById("dash-content");
  if (!content) return;
  content.innerHTML = getTabContent(activeTab);
}

function getTabContent(id: string): string {
  switch (id) {
    case "overview": return getOverviewContent();
    case "sessions": return "<h2>Sessions</h2><div>Loading...</div>";
    case "agents": return "<h2>Agents</h2><div>🦞 Alcatelz</div><div>🧠 Claude</div><div>🤖 GPT-4</div>";
    case "tools": return "<h2>Tools</h2><div>🌐 Browser 💬 Telegram 📁 File 🔧 Shell</div>";
    case "memory": return "<h2>Memory</h2><div>📝 MEMORY.md 📅 Daily Notes</div>";
    case "skills": return "<h2>Skills</h2><div>🌤️ Weather 📧 Gmail 🐙 GitHub</div>";
    case "nodes": return "<h2>Nodes</h2><div>💻 This Device</div>";
    case "cron": return "<h2>Cron</h2><div>daily-website-ideas-7am</div>";
    default: return getOverviewContent();
  }
}

function getOverviewContent(): string {
  return `<div>
    <div style="background:var(--bg-secondary);padding:14px;border-radius:8px;margin-bottom:16px">
      <div style="font-size:11px;color:var(--text-secondary)">Current Thought</div>
      <div style="font-size:13px;margin-top:4px">Ready...</div>
    </div>
    <div style="display:flex;gap:12px">
      <div style="flex:1;background:var(--bg-secondary);padding:14px;border-radius:8px;text-align:center">
        <div style="font-size:24px;font-weight:700">-</div>
        <div style="font-size:11px;color:var(--text-secondary)">Sessions</div>
      </div>
      <div style="flex:1;background:var(--bg-secondary);padding:14px;border-radius:8px;text-align:center">
        <div style="font-size:24px;font-weight:700">3</div>
        <div style="font-size:11px;color:var(--text-secondary)">Agents</div>
      </div>
    </div>
  </div>`;
}

function initDashboard() {
  const container = document.querySelector(".dashboard-view");
  if (!container) return;
  
  renderDashboardTabs();
  renderDashboardContent();
  
  // Click handler on tab bar
  const bar = document.querySelector(".dashboard-tab-bar");
  if (bar) {
    bar.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("dashboard-tab")) {
        const id = target.dataset.id;
        if (id) switchTab(id);
      }
    });
  }
}

// Export for App.ts
export function renderDashboardView(): string {
  return `<div class="dashboard-view">
    <div class="dashboard-tab-bar"></div>
    <div class="dashboard-content" id="dash-content"></div>
  </div>`;
}

export function mountDashboardView(): void {
  initDashboard();
}
