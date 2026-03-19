// OpenClaw API - connects via Tauri backend
import { invoke } from "@tauri-apps/api/core";
import type { Session, SystemInfo, CronJob } from "./types";

export async function fetchSessions(): Promise<Session[]> {
  try {
    const result = await invoke<string>("exec_command", {
      command: "openclaw sessions list",
    });
    return parseSessions(result);
  } catch {
    return [];
  }
}

function parseSessions(output: string): Session[] {
  const lines = output.trim().split("\n").slice(2);
  return lines.map((line) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) return null as unknown as Session;
    return {
      key: parts[1],
      kind: parts[0],
      age: parts[2],
      model: parts[3],
      tokens: parts[4],
      flags: parts.slice(5).join(" "),
    };
  }).filter(Boolean);
}

export async function fetchSystemInfo(): Promise<SystemInfo> {
  try {
    const [cpu, mem, uptimeResult] = await Promise.all([
      invoke<string>("exec_command", { command: "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'" }),
      invoke<string>("exec_command", { command: "free -h | awk '/^Mem:/ {print $3}'" }),
      invoke<string>("exec_command", { command: "uptime -p" }),
    ]);
    return { cpu: cpu.trim(), memory: mem.trim(), uptime: uptimeResult.trim() };
  } catch {
    return { cpu: "N/A", memory: "N/A", uptime: "N/A" };
  }
}

export async function fetchCronJobs(): Promise<CronJob[]> {
  try {
    const result = await invoke<string>("exec_command", {
      command: "openclaw cron list",
    });
    const lines = result.trim().split("\n").slice(1);
    return lines.map((line) => {
      const parts = line.trim().split(/\s{2,}/);
      return { time: parts[0] || "", task: parts[1] || parts[0] || "" };
    });
  } catch {
    return [];
  }
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const escaped = text.replace(/'/g, "'\\''");
    await invoke("exec_command", {
      command: `openclaw message send -t 5688140692 -m '${escaped}' --channel telegram`,
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchAgentThought(): Promise<string> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await invoke<string>("exec_command", {
      command: `grep -i 'thought\\|thinking' /tmp/openclaw/openclaw-${today}.log 2>/dev/null | tail -1`,
    });
    const match = result.match(/"([^"]+)"/);
    return match ? match[1].substring(0, 100) : "Analyzing system state...";
  } catch {
    return "Analyzing system state...";
  }
}
