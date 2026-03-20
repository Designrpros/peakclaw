export interface Agent {
  id: string;
  name: string;
  icon: string;
}

export const AGENTS: Agent[] = [
  { id: "alcatelz", name: "Alcatelz", icon: "🦞" },
  { id: "claude", name: "Claude", icon: "🧠" },
  { id: "gpt4", name: "GPT-4", icon: "🤖" },
];
