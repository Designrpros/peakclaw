import { invoke } from "@tauri-apps/api/core";
import type { Session, SystemInfo, CronJob } from "../lib/types";

export class DashboardView {
  static render(showDots: boolean = false, _currentPage: string = "dashboard"): string {
    return `
      <div class="view-dashboard">
        ${showDots ? `
        <div class="landing-dots landing-dots-fixed">
          <span class="landing-dot" data-page="landing" title="Landing"></span>
          <span class="landing-dot active" data-page="dashboard" title="Dashboard"></span>
          <span class="landing-dot" data-page="workspaces" title="Workspaces"></span>
        </div>
        ` : ''}
        
        <div class="dashboard-header">
          <h1 class="view-title">Dashboard</h1>
          <span class="view-subtitle">Alcatelz Agent Overview</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" id="stat-sessions">-</div>
            <div class="stat-label">Active Sessions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="stat-cpu">-</div>
            <div class="stat-label">CPU Usage</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="stat-memory">-</div>
            <div class="stat-label">Memory</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="stat-uptime">-</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>

        <div class="agent-card">
          <div class="agent-header">
            <div class="agent-avatar">🦞</div>
            <div class="agent-info">
              <div class="agent-name">Alcatelz</div>
              <div class="agent-status">Active Agent</div>
            </div>
            <div class="agent-badge">Running</div>
          </div>
          <div class="thought-box">
            <div class="thought-label">Current Thought</div>
            <div class="thought-text" id="agent-thought">Loading...</div>
          </div>
        </div>

        <div class="two-col-grid">
          <div class="card">
            <div class="card-header">
              <span class="card-icon">💬</span>
              <span>Sessions</span>
            </div>
            <div class="card-body" id="sessions-list">
              <div class="loading">Loading sessions...</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-icon">⏰</span>
              <span>Scheduled Tasks</span>
            </div>
            <div class="card-body" id="cron-list">
              <div class="loading">Loading tasks...</div>
            </div>
          </div>
        </div>

        <div class="card full-width">
          <div class="card-header">
            <span class="card-icon">💻</span>
            <span>System Info</span>
          </div>
          <div class="card-body" id="system-info">
            <div class="loading">Loading system info...</div>
          </div>
        </div>
      </div>
    `;
  }

  static mount(callbacks?: { onPageChange?: (page: string) => void }): void {
    const view = new DashboardView();
    view.startPolling();
    
    // Attach page dot listeners if provided
    if (callbacks?.onPageChange) {
      document.querySelectorAll(".view-dashboard .landing-dot").forEach((dot) => {
        dot.addEventListener("click", () => {
          const page = dot.getAttribute("data-page");
          if (page) callbacks.onPageChange!(page);
        });
      });
    }
  }

  private async execCommand(command: string): Promise<string> {
    try {
      return await invoke<string>("exec_command", { command });
    } catch {
      return "";
    }
  }

  private startPolling(): void {
    this.loadData();
    setInterval(() => this.loadData(), 5000);
  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadSessions(),
      this.loadSystemInfo(),
      this.loadThought(),
      this.loadCronJobs(),
    ]);
  }

  private async loadSessions(): Promise<void> {
    const result = await this.execCommand(
      "openclaw sessions list 2>/dev/null | tail -n +3"
    );
    const lines = result.trim().split("\n").filter(Boolean);
    const sessions: Session[] = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        kind: parts[0] || "",
        key: parts[1] || "",
        age: parts[2] || "",
        model: parts[3] || "",
        tokens: parts[4] || "",
        flags: parts.slice(5).join(" "),
      };
    });

    document.getElementById("stat-sessions")!.textContent = sessions.length.toString();
    document.getElementById("sessions-list")!.innerHTML =
      sessions.length > 0
        ? sessions
            .slice(0, 5)
            .map((s) => `
          <div class="session-item">
            <div class="session-kind">${s.kind}</div>
            <div class="session-info">
              <div class="session-key">${s.key.slice(-12)}...</div>
              <div class="session-age">${s.age} • ${s.model.split(":").pop()}</div>
            </div>
          </div>
        `)
            .join("")
        : '<div class="empty-state">No active sessions</div>';
  }

  private async loadSystemInfo(): Promise<void> {
    const [cpu, mem, uptimeResult] = await Promise.all([
      this.execCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'"),
      this.execCommand("free -h | awk '/^Mem:/ {print $3}'"),
      this.execCommand("uptime -p"),
    ]);
    const systemInfo: SystemInfo = {
      cpu: cpu.trim() + "%",
      memory: mem.trim(),
      uptime: uptimeResult.trim(),
    };

    document.getElementById("stat-cpu")!.textContent = systemInfo.cpu;
    document.getElementById("stat-memory")!.textContent = systemInfo.memory;
    document.getElementById("stat-uptime")!.textContent = systemInfo.uptime.replace("up ", "").slice(0, 15);
    document.getElementById("system-info")!.innerHTML = `
      <div class="system-grid">
        <div class="system-item">
          <span class="system-label">CPU</span>
          <span class="system-value">${systemInfo.cpu}</span>
        </div>
        <div class="system-item">
          <span class="system-label">Memory</span>
          <span class="system-value">${systemInfo.memory}</span>
        </div>
        <div class="system-item">
          <span class="system-label">Uptime</span>
          <span class="system-value">${systemInfo.uptime}</span>
        </div>
      </div>
    `;
  }

  private async loadThought(): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const result = await this.execCommand(
      `grep -i 'thought\\|thinking' /tmp/openclaw/openclaw-${today}.log 2>/dev/null | tail -1`
    );
    const match = result.match(/"([^"]+)"/);
    const thought = match ? match[1].substring(0, 120) : "Analyzing system state...";
    const el = document.getElementById("agent-thought");
    if (el) el.textContent = thought;
  }

  private async loadCronJobs(): Promise<void> {
    const result = await this.execCommand("openclaw cron list 2>/dev/null");
    const lines = result.trim().split("\n").slice(1);
    const cronJobs: CronJob[] = lines
      .map((line) => {
        const parts = line.trim().split(/\s{2,}/);
        return { time: parts[0] || "", task: parts[1] || parts[0] || "" };
      })
      .filter((c) => c.time || c.task);

    document.getElementById("cron-list")!.innerHTML =
      cronJobs.length > 0
        ? cronJobs
            .slice(0, 6)
            .map((c) => `
          <div class="cron-item">
            <span class="cron-task">${c.task}</span>
            <span class="cron-time">${c.time}</span>
          </div>
        `)
            .join("")
        : '<div class="empty-state">No scheduled tasks</div>';
  }
}
