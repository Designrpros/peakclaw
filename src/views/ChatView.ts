import { invoke } from "@tauri-apps/api/core";

export class ChatView {
  static render(): string {
    return `
      <div class="view-chat">
        <div class="view-header">
          <h1 class="view-title">Chat</h1>
          <span class="view-subtitle">Send messages to Alcatelz via Telegram</span>
        </div>

        <div class="chat-container">
          <div class="chat-messages" id="chat-messages">
            <div class="chat-welcome">
              <div class="welcome-icon">🦞</div>
              <h2>Alcatelz Chat</h2>
              <p>Send a message to start a conversation through Telegram.</p>
            </div>
          </div>
          <div class="chat-input-area">
            <textarea
              id="chat-input"
              class="chat-input"
              placeholder="Type a message... (Enter to send)"
              rows="1"
            ></textarea>
            <button id="btn-send" class="chat-send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static mount(): void {
    const input = document.getElementById("chat-input") as HTMLTextAreaElement;
    const sendBtn = document.getElementById("btn-send")!;

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;

      this.addMessage("user", text);
      input.value = "";

      try {
        const escaped = text.replace(/'/g, "'\\''");
        await invoke("exec_command", {
          command: `openclaw message send -t 5688140692 -m '${escaped}' --channel telegram`,
        });
        this.addMessage("agent", "✓ Message sent to Telegram! Alcatelz will respond shortly.");
      } catch (e) {
        this.addMessage("agent", `⚠️ Failed to send: ${e}`);
      }
    };

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
      // Auto-resize
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 150) + "px";
    });
  }

  private static addMessage(type: "user" | "agent", text: string): void {
    const container = document.getElementById("chat-messages")!;
    const welcome = container.querySelector(".chat-welcome");
    if (welcome) welcome.remove();

    const div = document.createElement("div");
    div.className = `chat-message ${type}`;
    div.innerHTML = `
      <div class="message-avatar">${type === "user" ? "👤" : "🤖"}</div>
      <div class="message-bubble">${this.escapeHtml(text)}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
