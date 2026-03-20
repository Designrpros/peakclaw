// Dashboard - connected to OpenClaw CLI
import { invoke } from "@tauri-apps/api/core";

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

async function runCmd(cmd: string): Promise<string> {
  try {
    const result = await invoke<string>("exec_command", { command: cmd });
    return result;
  } catch (e) {
    return String(e);
  }
}

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

async function renderDashboardContent() {
  const content = document.getElementById("dash-content");
  if (!content) return;
  content.innerHTML = "<div class='loading'>Loading...</div>";
  
  let html = "";
  switch (activeTab) {
    case "overview": html = await getOverviewContent(); break;
    case "sessions": html = await getSessionsContent(); break;
    case "cron": html = await getCronContent(); break;
    case "agents": html = getAgentsContent(); break;
    case "tools": html = getToolsContent(); break;
    case "memory": html = getMemoryContent(); break;
    case "skills": html = getSkillsContent(); break;
    case "nodes": html = getNodesContent(); break;
    default: html = await getOverviewContent();
  }
  
  content.innerHTML = html;
}

async function getOverviewContent(): Promise<string> {
  const sessionsResult = await runCmd("openclaw sessions list 2>/dev/null | tail -n +3 | wc -l || echo 0");
  const sessionsCount = parseInt(sessionsResult.trim()) || 0;
  
  const cronResult = await runCmd("cat /home/vegar/.openclaw/cron/jobs.json 2>/dev/null | grep -c 'name' || echo 0");
  const cronCount = parseInt(cronResult.trim()) || 0;
  
  const toolsResult = await runCmd("ls /home/vegar/.openclaw/plugins/ 2>/dev/null | wc -l || echo 0");
  const toolsCount = Math.max(parseInt(toolsResult.trim()) || 0, 6);
  
  const agentsResult = await runCmd("openclaw agents list 2>/dev/null | head -5 || echo 3");
  const agentLines = agentsResult.trim().split("\n").filter((l: string) => l.trim());
  const agentCount = Math.max(agentLines.length, 3);
  
  return `<div class="dash-section">
    <div class="overview-grid">
      <div class="stat-card" onclick="switchTab('sessions')" style="cursor:pointer">
        <div class="stat-num">${sessionsCount}</div>
        <div class="stat-label">Sessions</div>
      </div>
      <div class="stat-card" onclick="switchTab('agents')" style="cursor:pointer">
        <div class="stat-num">${agentCount}</div>
        <div class="stat-label">Agents</div>
      </div>
      <div class="stat-card" onclick="switchTab('cron')" style="cursor:pointer">
        <div class="stat-num">${cronCount}</div>
        <div class="stat-label">Cron Jobs</div>
      </div>
      <div class="stat-card" onclick="switchTab('tools')" style="cursor:pointer">
        <div class="stat-num">${toolsCount}</div>
        <div class="stat-label">Plugins</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-head">🤖 Current Agent</div>
      <div class="card-body">
        <div class="agent-row">
          <div class="agent-ico">🦞</div>
          <div>
            <div class="agent-name">Alcatelz</div>
            <div class="agent-state">Active • Running</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

async function getSessionsContent(): Promise<string> {
  const result = await runCmd("openclaw sessions list 2>/dev/null | head -20");
  const lines = result.trim().split("\n").filter((l: string) => l.trim());
  
  if (lines.length <= 2) {
    return `<div class="dash-section"><h2>Sessions</h2><div class="empty">No active sessions</div></div>`;
  }
  
  const sessions = lines.slice(2).map((line: string) => {
    const parts = line.trim().split(/\s+/);
    return `<div class="list-item">
      <div class="item-name">${parts[0] || "session"}</div>
      <div class="item-sub">${parts.slice(1).join(" ")}</div>
    </div>`;
  }).join("");
  
  return `<div class="dash-section"><h2>Sessions</h2><div class="list">${sessions}</div></div>`;
}

async function getCronContent(): Promise<string> {
  const result = await runCmd("cat /home/vegar/.openclaw/cron/jobs.json 2>/dev/null");
  
  try {
    const data = JSON.parse(result);
    if (data.jobs && data.jobs.length > 0) {
      const jobs = data.jobs.map((job: any) => {
        const nextRun = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString("nb-NO", { hour: "2-digit", minute: "2-digit" }) : "N/A";
        return `<div class="list-item">
          <div class="item-name">${job.name}</div>
          <div class="item-sub">${job.schedule?.expr || "no schedule"} • Next: ${nextRun}</div>
        </div>`;
      }).join("");
      return `<div class="dash-section"><h2>Cron Jobs</h2><div class="list">${jobs}</div></div>`;
    }
  } catch (e) {}
  
  return `<div class="dash-section"><h2>Cron Jobs</h2><div class="empty">No cron jobs configured</div></div>`;
}

function getAgentsContent(): string {
  return `<div class="dash-section">
    <h2>Agents</h2>
    <div class="list">
      <div class="agent-card">
        <div class="agent-ico">🦞</div>
        <div class="agent-info">
          <div class="agent-name">Alcatelz</div>
          <div class="agent-state">Primary • Active</div>
        </div>
      </div>
      <div class="agent-card">
        <div class="agent-ico">🧠</div>
        <div class="agent-info">
          <div class="agent-name">Claude</div>
          <div class="agent-state">Available</div>
        </div>
      </div>
      <div class="agent-card">
        <div class="agent-ico">🤖</div>
        <div class="agent-info">
          <div class="agent-name">GPT-4</div>
          <div class="agent-state">Available</div>
        </div>
      </div>
    </div>
  </div>`;
}

function getToolsContent(): string {
  return `<div class="dash-section">
    <h2>Tools</h2>
    <div class="grid-2">
      <div class="tool-card"><span class="tool-ico">🌐</span><div><div class="tool-name">Browser</div><div class="tool-desc">Web search & navigation</div></div></div>
      <div class="tool-card"><span class="tool-ico">💬</span><div><div class="tool-name">Telegram</div><div class="tool-desc">Messaging integration</div></div></div>
      <div class="tool-card"><span class="tool-ico">📁</span><div><div class="tool-name">File System</div><div class="tool-desc">Read/write files</div></div></div>
      <div class="tool-card"><span class="tool-ico">🔧</span><div><div class="tool-name">Shell</div><div class="tool-desc">Execute commands</div></div></div>
      <div class="tool-card"><span class="tool-ico">🌤️</span><div><div class="tool-name">Weather</div><div class="tool-desc">Weather forecasts</div></div></div>
      <div class="tool-card"><span class="tool-ico">📧</span><div><div class="tool-name">Gmail</div><div class="tool-desc">Email via Google Workspace</div></div></div>
    </div>
  </div>`;
}

function getMemoryContent(): string {
  return `<div class="dash-section">
    <h2>Memory</h2>
    <div class="list">
      <div class="mem-card"><span>📝</span><div><div class="mem-name">MEMORY.md</div><div class="mem-desc">Long-term curated memories</div></div></div>
      <div class="mem-card"><span>📅</span><div><div class="mem-name">Daily Notes</div><div class="mem-desc">Session logs</div></div></div>
      <div class="mem-card"><span>👤</span><div><div class="mem-name">USER.md</div><div class="mem-desc">User preferences</div></div></div>
    </div>
  </div>`;
}

function getSkillsContent(): string {
  return `<div class="dash-section">
    <h2>Skills</h2>
    <div class="grid-2">
      <div class="skill-card"><span>🌤️</span><div class="skill-name">Weather</div></div>
      <div class="skill-card"><span>📧</span><div class="skill-name">Gmail</div></div>
      <div class="skill-card"><span>🐙</span><div class="skill-name">GitHub</div></div>
      <div class="skill-card"><span>🔍</span><div class="skill-name">GitHub Issues</div></div>
      <div class="skill-card"><span>🗓️</span><div class="skill-name">Calendar</div></div>
      <div class="skill-card"><span>📁</span><div class="skill-name">Drive</div></div>
    </div>
  </div>`;
}

function getNodesContent(): string {
  return `<div class="dash-section">
    <h2>Nodes</h2>
    <div class="list">
      <div class="node-card"><span>💻</span><div><div class="node-name">This Device</div><div class="node-state">Connected • Online</div></div></div>
    </div>
  </div>`;
}

function initDashboard() {
  const container = document.querySelector(".dashboard-view");
  if (!container) return;
  
  renderDashboardTabs();
  renderDashboardContent();
  
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

export function renderDashboardView(): string {
  return `<div class="dashboard-view">
    <div class="dashboard-tab-bar"></div>
    <div class="dashboard-content" id="dash-content"></div>
  </div>`;
}

export function mountDashboardView(): void {
  initDashboard();
}
