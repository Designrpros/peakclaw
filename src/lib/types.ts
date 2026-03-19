// Types for PeakClaw

export interface Tab {
  id: string;
  title: string;
  type: TabType;
  icon: string;
  data?: unknown;
}

export type TabType = 'chat' | 'browser' | 'settings';

export interface AgentState {
  name: string;
  thought: string;
  status: 'idle' | 'thinking' | 'working';
  lastUpdate: number;
}

export interface Session {
  key: string;
  kind: string;
  age: string;
  model: string;
  tokens: string;
  flags: string;
}

export interface SystemInfo {
  cpu: string;
  memory: string;
  uptime: string;
}

export interface MemoryItem {
  label: string;
  value: string;
}

export interface CronJob {
  time: string;
  task: string;
}
