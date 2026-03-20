import { invoke } from "@tauri-apps/api/core";

const dashTabs = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "sessions", label: "Sessions", icon: "💬" },
  { id: "cron", label: "Cron", icon: "⏰" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "tools", label: "Tools & Skills", icon: "🔧" },
  { id: "providers", label: "Providers", icon: "☁️" },
  { id: "memory", label: "Memory", icon: "🧠" },
  { id: "nodes", label: "Nodes", icon: "🖥️" },
];

let activeTab = "overview";
let detailItem: any = null;
let detailData: any = null;

async function runCmd(cmd: string): Promise<string> {
  try {
    return await invoke<string>("exec_command", { command: cmd });
  } catch (e) {
    return "Error: " + String(e);
  }
}

function switchTab(id: string) {
  activeTab = id;
  detailItem = null;
  detailData = null;
  renderDashboard();
  loadTabData(id);
}

function showDetail(item: any) {
  detailItem = item;
  detailData = null;
  loadDetailContent();
  renderDashboard();
}

function goBack() {
  detailItem = null;
  detailData = null;
  renderDashboard();
  loadTabData(activeTab);
}

function renderDashboard() {
  const bar = document.querySelector(".dashboard-tab-bar") as HTMLElement;
  if (bar) {
    bar.innerHTML = dashTabs.map(t => 
      `<button class="dashboard-tab ${activeTab === t.id ? 'active' : ''}" data-id="${t.id}">${t.icon} ${t.label}</button>`
    ).join("");
  }
  
  const content = document.getElementById("dash-content");
  if (!content) return;
  
  if (detailItem) {
    content.innerHTML = renderDetail();
  } else {
    content.innerHTML = getTabContent(activeTab);
  }
}

function getTabContent(tabId: string): string {
  switch (tabId) {
    case "overview": return getOverviewContent();
    case "sessions": return `<div class="dash-section"><h2>Sessions</h2><div class="loading">Loading...</div></div>`;
    case "cron": return `<div class="dash-section"><h2>Cron Jobs</h2><div class="loading">Loading...</div></div>`;
    case "agents": return `<div class="dash-section"><h2>Agents</h2><div class="loading">Loading...</div></div>`;
    case "tools": return `<div class="dash-section"><h2>Tools & Skills</h2><div class="loading">Loading...</div></div>`;
    case "memory": return getMemoryContent();
    case "providers": return `<div class="dash-section"><h2>Providers</h2><div class="loading">Loading...</div></div>`;
    case "nodes": return `<div class="dash-section"><h2>Nodes</h2><div class="loading">Loading...</div></div>`;
    default: return getOverviewContent();
  }
}

function getOverviewContent(): string {
  return `<div class="dash-section">
    <div class="overview-grid">
      <div class="stat-card" onclick="switchTab('sessions')" style="cursor:pointer">
        <div class="stat-num" id="stat-sessions">-</div>
        <div class="stat-label">Sessions</div>
      </div>
      <div class="stat-card" onclick="switchTab('agents')" style="cursor:pointer">
        <div class="stat-num" id="stat-agents">3</div>
        <div class="stat-label">Agents</div>
      </div>
      <div class="stat-card" onclick="switchTab('cron')" style="cursor:pointer">
        <div class="stat-num" id="stat-cron">-</div>
        <div class="stat-label">Cron Jobs</div>
      </div>
      <div class="stat-card" onclick="switchTab('tools')" style="cursor:pointer">
        <div class="stat-num" id="stat-tools">-</div>
        <div class="stat-label">Tools & Skills</div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-head">🤖 Current Agent</div>
      <div class="card-body">
        <div class="agent-row" onclick="showDetail({type:'agent',name:'Alcatelz',icon:'🦞',state:'Active'})" style="cursor:pointer">
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

function getMemoryContent(): string {
  return `<div class="dash-section">
    <h2>Memory</h2>
    <div class="list">
      <div class="item-card" onclick="showDetail({type:'file',name:'MEMORY.md',path:'/home/vegar/.openclaw/workspace/MEMORY.md',icon:'📝'})" style="cursor:pointer">
        <span class="item-icon">📝</span>
        <div class="item-info">
          <div class="item-name">MEMORY.md</div>
          <div class="item-sub">Long-term curated memories</div>
        </div>
        
      </div>
      <div class="item-card" onclick="showDetail({type:'folder',name:'Daily Notes',path:'/home/vegar/.openclaw/workspace/memory/',icon:'📅'})" style="cursor:pointer">
        <span class="item-icon">📅</span>
        <div class="item-info">
          <div class="item-name">Daily Notes</div>
          <div class="item-sub">Session logs</div>
        </div>
        
      </div>
      <div class="item-card" onclick="showDetail({type:'file',name:'USER.md',path:'/home/vegar/.openclaw/workspace/USER.md',icon:'👤'})" style="cursor:pointer">
        <span class="item-icon">👤</span>
        <div class="item-info">
          <div class="item-name">USER.md</div>
          <div class="item-sub">User preferences</div>
        </div>
        
      </div>
    </div>
  </div>`;
}

function renderDetail(): string {
  if (!detailItem) return "";
  
  const icon = detailItem.icon || "📄";
  const title = detailItem.name || detailItem.title || "Detail";
  const type = detailItem.type;
  
  let body = "<div class='loading'>Loading...</div>";
  
  if (detailData) {
    if (type === "file") {
      body = `<pre class="code-block">${(detailData.content || "Empty").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    } else if (type === "folder") {
      body = `<pre class="code-block">${(detailData.content || "Empty").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    } else if (type === "agent") {
      body = `<div class="card"><div class="card-body">
        <div class="prop-row"><span>Name</span><span>${detailItem.name}</span></div>
        <div class="prop-row"><span>Status</span><span>${detailData.status || "Active"}</span></div>
        <div class="prop-row"><span>Type</span><span>AI Agent</span></div>
      </div></div>`;
    } else {
      body = `<div class="card"><div class="card-body"><pre>${JSON.stringify(detailData, null, 2)}</pre></div></div>`;
    }
  }
  
  return `<div class="detail-view">
    <div class="detail-header">
      <button class="back-btn" onclick="goBack()">← Back</button>
      <span class="detail-icon">${icon}</span>
      <span class="detail-title">${title}</span>
    </div>
    <div class="detail-body">${body}</div>
  </div>`;
}

async function loadDetailContent() {
  if (!detailItem) return;
  
  const type = detailItem.type;
  const path = detailItem.path;
  
  switch (type) {
    case "file":
      if (path) {
        const result = await runCmd("cat " + path + " 2>&1 | head -100");
        detailData = { content: result };
      }
      break;
    case "folder":
      if (path) {
        const result = await runCmd("ls -la " + path + " 2>&1 | head -20");
        detailData = { content: result };
      }
      break;
    case "agent":
      detailData = { status: "Active", type: "AI Agent" };
      break;
    default:
      detailData = { info: "No data" };
  }
  
  renderDashboard();
}

async function loadTabData(tabId: string) {
  switch (tabId) {
    case "overview": await loadOverviewData(); break;
    case "sessions": await loadSessionsData(); break;
    case "cron": await loadCronData(); break;
    case "agents": await loadAgentsData(); break;
    case "tools": await loadToolsData(); break;
    case "memory": break;
    case "providers": await loadProvidersData(); break;
    case "nodes": await loadNodesData(); break;
  }
}

async function loadOverviewData() {
  try {
    const r1 = await runCmd("openclaw sessions list 2>/dev/null | tail -n +3 | wc -l || echo 0");
    const sessions = parseInt(r1.trim()) || 0;
    const el = document.getElementById("stat-sessions");
    if (el) el.textContent = String(sessions);
    
    const r2 = await runCmd("cat /home/vegar/.openclaw/cron/jobs.json 2>/dev/null | grep -c name || echo 0");
    const cron = parseInt(r2.trim()) || 0;
    const el2 = document.getElementById("stat-cron");
    if (el2) el2.textContent = String(cron);
    
    const r3 = await runCmd("ls /home/vegar/.openclaw/plugins/ 2>/dev/null | wc -l");
    const r4 = await runCmd("ls /home/vegar/.nvm/versions/node/v24.11.1/lib/node_modules/openclaw/skills/ 2>/dev/null | wc -l");
    const tools = (parseInt(r3.trim()) || 0) + (parseInt(r4.trim()) || 0);
    const el3 = document.getElementById("stat-tools");
    if (el3) el3.textContent = String(tools);
    
    const el4 = document.getElementById("stat-agents");
    if (el4) el4.textContent = "3";
  } catch (e) {}
}

async function loadSessionsData() {
  const result = await runCmd("openclaw sessions list 2>/dev/null | head -30");
  const lines = result.trim().split("\n").filter(l => l.trim());
  
  const content = document.querySelector(".dash-section");
  if (!content) return;
  
  if (lines.length <= 2) {
    content.innerHTML = `<h2>Sessions</h2><div class="empty">No active sessions</div>`;
    return;
  }
  
  const items = lines.slice(2).map(line => {
    const parts = line.trim().split(/\s+/);
    const key = parts[0] || "session";
    const info = parts.slice(1).join(" ") || "Active";
    return `<div class="item-card" onclick="showDetail({type:'session',name:'${key}',info:'${info}'})" style="cursor:pointer">
      <span class="item-icon">💬</span>
      <div class="item-info">
        <div class="item-name">${key}</div>
        <div class="item-sub">${info}</div>
      </div>
      
    </div>`;
  }).join("");
  
  content.innerHTML = `<h2>Sessions</h2><div class="list">${items}</div>`;
}

async function loadCronData() {
  const result = await runCmd("cat /home/vegar/.openclaw/cron/jobs.json 2>/dev/null");
  
  const content = document.querySelector(".dash-section");
  if (!content) return;
  
  try {
    const data = JSON.parse(result);
    if (data.jobs && data.jobs.length > 0) {
      const items = data.jobs.map((job: any) => {
        const next = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString("nb-NO", {hour:"2-digit", minute:"2-digit"}) : "N/A";
        return `<div class="item-card" onclick="showDetail({type:'cron',name:'${job.name}',schedule:'${job.schedule?.expr || 'N/A'}',nextRun:'${next}'})" style="cursor:pointer">
          <span class="item-icon">⏰</span>
          <div class="item-info">
            <div class="item-name">${job.name}</div>
            <div class="item-sub">${job.schedule?.expr || "N/A"}</div>
          </div>
          
        </div>`;
      }).join("");
      content.innerHTML = `<h2>Cron Jobs</h2><div class="list">${items}</div>`;
    } else {
      content.innerHTML = `<h2>Cron Jobs</h2><div class="empty">No cron jobs</div>`;
    }
  } catch (e) {
    content.innerHTML = `<h2>Cron Jobs</h2><div class="empty">Error loading</div>`;
  }
}

async function loadAgentsData() {
  const content = document.querySelector(".dash-section");
  if (!content) return;
  
  const agents = `<div class="item-card" onclick="showDetail({type:'agent',name:'Alcatelz',icon:'🦞',state:'Active'})" style="cursor:pointer">
    <span class="item-icon">🦞</span>
    <div class="item-info"><div class="item-name">Alcatelz</div><div class="item-sub">Primary • Active</div></div>
    
  </div>
    
  </div>
    
  </div>`;
  
  content.innerHTML = `<h2>Agents</h2><div class="list">${agents}</div>`;
}

async function loadToolsData() {
  // Fetch all data
  const pluginsResult = await runCmd("ls /home/vegar/.openclaw/plugins/ 2>/dev/null");
  const skillsResult = await runCmd("ls /home/vegar/.nvm/versions/node/v24.11.1/lib/node_modules/openclaw/skills/ 2>/dev/null");
  const channelsResult = await runCmd("cat /home/vegar/.openclaw/openclaw.json 2>/dev/null | python3 -c \"import json,sys; d=json.load(sys.stdin); print(list(d.get('channels',{}).keys()))\" 2>/dev/null");
  const enabledSkillsResult = await runCmd("cat /home/vegar/.openclaw/openclaw.json 2>/dev/null | python3 -c \"import json,sys; d=json.load(sys.stdin); print(list(d.get('skills',{}).keys()))\" 2>/dev/null");
  const enabledPluginsResult = await runCmd("cat /home/vegar/.openclaw/openclaw.json 2>/dev/null | python3 -c \"import json,sys; d=json.load(sys.stdin); print(list(d.get('plugins',[])))\" 2>/dev/null");
  
  const content = document.querySelector(".dash-section");
  if (!content) return;
  
  const plugins = pluginsResult.trim().split("\n").filter(l => l.trim());
  const skills = skillsResult.trim().split("\n").filter(l => l.trim());
  
  const channelsRaw = channelsResult.trim().replace(/[\[\]' ]/g, '');
  const channels = channelsRaw ? channelsRaw.split(',').filter(l => l) : [];
  
  const enabledSkillsRaw = enabledSkillsResult.trim().replace(/[\[\]' ]/g, '');
  const enabledSkills = enabledSkillsRaw ? enabledSkillsRaw.split(',').filter(l => l) : [];
  
  const enabledPluginsRaw = enabledPluginsResult.trim().replace(/[\[\]' ]/g, '');
  const enabledPlugins = enabledPluginsRaw ? enabledPluginsRaw.split(',').filter(l => l) : [];
  
  const total = plugins.length + skills.length;
  
  // Get list of available binaries
  const binsResult = await runCmd("ls ~/.nvm/versions/node/v24.11.1/lib/node_modules/openclaw/skills/*/SKILL.md 2>/dev/null | sed 's|.*/||' | sed 's|-skill$||' | sort -u");
  const bins = binsResult.trim().split("\n").filter(l => l.trim());
  
  // Helper to check if item is enabled (in config OR has binary)
  const isEnabled = (name: string, type: string): boolean => {
    const lower = name.toLowerCase().replace('(channel)','').trim();
    if (type === 'channel') return channels.some(c => c.toLowerCase() === lower);
    if (type === 'skill') {
      if (enabledSkills.some(s => s.toLowerCase() === lower)) return true;
      // Check if skill has a binary
      return bins.some(b => b.toLowerCase() === lower) || 
             bins.some(b => b.toLowerCase().replace(/-/g,'') === lower.replace(/-/g,''));
    }
    if (type === 'plugin') return enabledPlugins.some(p => p.toLowerCase() === lower);
    return false;
  };
  
  // Categorize
  const cats: Record<string, {icon: string, items: {name: string, type: string}[]}> = {
    "💬 Chat & Messaging": {icon: "💬", items: []},
    "🌐 Web & Browser": {icon: "🌐", items: []},
    "📧 Email & Mail": {icon: "📧", items: []},
    "🎵 Media & Audio": {icon: "🎵", items: []},
    "📋 Productivity": {icon: "📋", items: []},
    "🧠 AI & Memory": {icon: "🧠", items: []},
    "🔧 System & Hardware": {icon: "🔧", items: []},
    "📊 Data & Development": {icon: "📊", items: []},
    "🎨 Images & Vision": {icon: "🎨", items: []},
    "⚙️ Plugins": {icon: "⚙️", items: []},
    "⚡ Other": {icon: "⚡", items: []},
  };
  
  // Add channels to messaging
  channels.forEach(ch => {
    cats["💬 Chat & Messaging"].items.push({name: ch + ' (channel)', type: 'channel'});
  });
  
  // Categorize skills
  skills.forEach(s => {
    const lower = s.toLowerCase();
    let cat = "⚡ Other";
    if (lower.includes("telegram") || lower.includes("discord") || lower.includes("slack") || lower.includes("imsg") || lower.includes("wacli") || lower.includes("bluebubbles") || lower.includes("message")) cat = "💬 Chat & Messaging";
    else if (lower.includes("web") || lower.includes("browser") || lower.includes("xurl")) cat = "🌐 Web & Browser";
    else if (lower.includes("mail") || lower.includes("email") || lower.includes("gmail") || lower.includes("himalaya")) cat = "📧 Email & Mail";
    else if (lower.includes("spotify") || lower.includes("songsee") || lower.includes("sonos") || lower.includes("video") || lower.includes("audio") || lower.includes("whisper") || lower.includes("sag") || lower.includes("tts")) cat = "🎵 Media & Audio";
    else if (lower.includes("notion") || lower.includes("obsidian") || lower.includes("bear") || lower.includes("trello") || lower.includes("1password") || lower.includes("apple") || lower.includes("things") || lower.includes("ordercli") || lower.includes("reminder")) cat = "📋 Productivity";
    else if (lower.includes("gemini") || lower.includes("summarize") || lower.includes("coding-agent") || lower.includes("model-usage") || lower.includes("oracle")) cat = "🧠 AI & Memory";
    else if (lower.includes("tmux") || lower.includes("health") || lower.includes("hue") || lower.includes("eightctl") || lower.includes("openhue") || lower.includes("blucli") || lower.includes("camsnap") || lower.includes("voice-call") || lower.includes("peekaboo")) cat = "🔧 System & Hardware";
    else if (lower.includes("github") || lower.includes("git") || lower.includes("gh-") || lower.includes("nano") || lower.includes("coding") || lower.includes("gifgrep") || lower.includes("session-logs") || lower.includes("skill-creator")) cat = "📊 Data & Development";
    else if (lower.includes("image") || lower.includes("canvas") || lower.includes("video-frames") || lower.includes("clawhub")) cat = "🎨 Images & Vision";
    else if (lower.includes("plugin") || lower.includes("office")) cat = "⚙️ Plugins";
    
    cats[cat].items.push({name: s, type: 'skill'});
  });
  
  // Add plugins
  plugins.forEach(p => {
    cats["⚙️ Plugins"].items.push({name: p, type: 'plugin'});
  });
  
  // Build HTML
  const catHtml = Object.entries(cats)
    .filter(([_, v]) => v.items.length > 0)
    .map(([cat, data]) => {
      const tags = data.items.map(item => {
        const isActive = isEnabled(item.name.split(' ')[0].replace('(channel)','').trim(), item.type);
        return `<span class="tool-tag ${isActive ? 'active' : ''}">${data.icon} ${item.name}</span>`;
      }).join("");
      return `<div class="tool-cat">
        <div class="tool-cat-head">${cat} <span class="tool-cat-count">${data.items.length}</span></div>
        <div class="tool-tags">${tags}</div>
      </div>`;
    }).join("");
  
  // Count enabled
  const enabledCount = channels.length + enabledSkills.length + enabledPlugins.length;
  
  content.innerHTML = `<h2>Tools & Skills</h2>
    <div class="tools-banner">
      <div class="tools-banner-text">
        <div class="tools-banner-title">OpenClaw Integration Hub</div>
        <div class="tools-banner-sub">${channels.length} channel${channels.length !== 1 ? 's' : ''} connected • ${skills.length} skills • ${plugins.length} plugins</div>
      </div>
    </div>
    <div class="tools-summary">
      <div class="tools-stat"><span class="tools-num">${total}</span><span class="tools-label">Total</span></div>
      <div class="tools-stat"><span class="tools-num">${enabledCount}</span><span class="tools-label">Enabled</span></div>
      <div class="tools-stat"><span class="tools-num">${channels.length}</span><span class="tools-label">Channels</span></div>
      <div class="tools-stat"><span class="tools-num">${skills.length}</span><span class="tools-label">Skills</span></div>
    </div>
    <div class="tools-cats">${catHtml}</div>`;
}

async function loadProvidersData() {
  const result = await runCmd("cat /home/vegar/.openclaw/openclaw.json 2>/dev/null");
  
  const content = document.querySelector(".dash-section");
  if (!content) return;
  
  try {
    const data = JSON.parse(result);
    const models = data.models || {};
    const mode = models.mode || "single";
    const providers = models.providers || {};
    
    let html = `<h2>Providers</h2>
      <div class="providers-mode">
        <span class="providers-mode-label">Mode:</span>
        <span class="providers-mode-value">${mode}</span>
      </div>
      <div class="providers-grid">`;
    
    Object.entries(providers).forEach(([name, details]: [string, any]) => {
      const modelsList = (details.models || []).map((m: any) => `<div class="provider-model">${m.id || m}</div>`).join("");
      const baseUrl = details.baseUrl || "";
      const apiType = details.api || "";
      
      html += `<div class="provider-card">
        <div class="provider-header">
          <span class="provider-icon">${name === 'ollama' ? '🦕' : name === 'openrouter' ? '🌐' : '☁️'}</span>
          <span class="provider-name">${name}</span>
        </div>
        <div class="provider-info">
          <div><span class="provider-label">API:</span> ${apiType}</div>
          <div><span class="provider-label">URL:</span> <span class="provider-url">${baseUrl}</span></div>
        </div>
        <div class="provider-models">${modelsList}</div>
      </div>`;
    });
    
    html += `</div>`;
    content.innerHTML = html;
  } catch (e) {
    content.innerHTML = `<h2>Providers</h2><div class="empty">Error loading</div>`;
  }
}

async function loadNodesData() {
  const content = document.querySelector(".dash-section");
  if (!content) return;
  
  content.innerHTML = `<h2>Nodes</h2><div class="list">
    <div class="item-card"><span class="item-icon">💻</span><div class="item-info"><div class="item-name">This Device</div><div class="item-sub">Connected</div></div></div>
  </div>`;
}

function initDashboard() {
  const container = document.querySelector(".dashboard-view");
  if (!container) return;
  
  renderDashboard();
  loadTabData(activeTab);
  
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

(window as any).switchTab = switchTab;
(window as any).showDetail = showDetail;
(window as any).goBack = goBack;

export function renderDashboardView(): string {
  return `<div class="dashboard-view">
    <div class="dashboard-tab-bar"></div>
    <div class="dashboard-content" id="dash-content"></div>
  </div>`;
}

export function mountDashboardView(): void {
  initDashboard();
}
