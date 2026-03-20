import { invoke } from "@tauri-apps/api/core";

interface ChatCallbacks {
  onAgentChange?: (agent: string) => void;
  selectedAgent: string;
}

export class ChatView {
  static render(agentId: string): string {
    return `
      <div class="view-chat">
        <div class="view-header">
          <h1 class="view-title">Chat</h1>
          <span class="view-subtitle">Send messages to AI agents</span>
        </div>

        <div class="chat-container">
          <div class="chat-messages" id="chat-messages">
            <div class="chat-welcome">
              <div class="welcome-icon">💬</div>
              <h2>Welcome to Chat</h2>
              <p>Select an agent and send a message</p>
            </div>
          </div>
          
          <div class="chat-input-container">
            <select id="agent-select" class="agent-select">
              <option value="alcatelz" ${agentId === "alcatelz" ? "selected" : ""}>🦞 Alcatelz</option>
              <option value="claude" ${agentId === "claude" ? "selected" : ""}>🧠 Claude</option>
              <option value="gpt4" ${agentId === "gpt4" ? "selected" : ""}>🤖 GPT-4</option>
            </select>
            
            <div class="chat-input-row">
              <textarea 
                id="chat-input" 
                class="chat-input" 
                placeholder="Type your message..."
                rows="1"
              ></textarea>
              <button id="chat-send" class="chat-send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static mount(callbacks: ChatCallbacks, _agents: Array<{id: string, name: string, icon: string}>): void {
    const input = document.getElementById("chat-input") as HTMLTextAreaElement;
    const sendBtn = document.getElementById("chat-send")!;
    const agentSelect = document.getElementById("agent-select") as HTMLSelectElement;

    const autoResize = () => {
      if (input) { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 200) + "px"; }
    };

    input?.addEventListener("input", autoResize);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    agentSelect?.addEventListener("change", () => {
      callbacks.onAgentChange?.(agentSelect.value);
    });

    sendBtn.addEventListener("click", async () => {
      const message = input?.value?.trim();
      if (!message) return;

      const agent = agentSelect?.value || "alcatelz";
      
      // Add user message
      const messagesEl = document.getElementById("chat-messages");
      if (messagesEl) {
        messagesEl.innerHTML += `
          <div class="chat-message user">
            <div class="message-content">${message}</div>
          </div>
        `;
      }
      
      input.value = "";
      autoResize();

      // Send via OpenClaw
      try {
        await invoke("exec_command", {
          command: `echo "Sending: ${message} to ${agent}"`
        });
      } catch (e) {
        console.error("Send error:", e);
      }
    });
  }
}
