import { invoke } from "@tauri-apps/api/core";

export class BrowserView {
  static currentQuery: string = "";
  static baseUrl: string = "";
  static cachedHtml: string = "";
  static cachedUrl: string = "";

  static render(): string {
    return `
      <div class="view-browser-full">
        <div class="browser-loading" id="browser-loading">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
        <iframe 
          id="browser-iframe" 
          class="browser-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock allow-top-navigation-by-user-activation"
        ></iframe>
      </div>
    `;
  }

  static mount(): void {
    console.log("[BrowserView] Mounted");
    
    const iframe = document.getElementById("browser-iframe") as HTMLIFrameElement;
    const query = (window as any).__browserQuery;
    
    if (query) {
      // New navigation
      console.log("[BrowserView] Found pending query:", query);
      (window as any).__browserQuery = "";
      this.navigate(query);
    } else if (this.cachedHtml && iframe) {
      // Restore using data URL for better script execution
      console.log("[BrowserView] Restoring cached content");
      const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(this.cachedHtml);
      iframe.src = dataUrl;
      this.attachLinkHandlers(iframe);
      this.hideLoading();
    } else {
      console.log("[BrowserView] No content to restore");
      this.hideLoading();
    }
  }

  static async navigate(query: string): Promise<void> {
    if (!query || typeof query !== "string") return;
    
    const trimmed = query.trim();
    if (!trimmed) return;

    let url: string;

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      url = trimmed;
    } else if (trimmed.includes(".") && !trimmed.includes(" ")) {
      url = "https://" + trimmed;
    } else {
      url = `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
    }

    console.log("[BrowserView] Loading URL via Rust:", url);
    
    this.showLoading();
    
    try {
      const html = await invoke<string>("fetch_url", { url });
      console.log("[BrowserView] Got HTML via Rust, length:", html.length);
      
      this.baseUrl = url;
      const rewrittenHtml = this.rewriteUrls(html, url);
      
      const iframe = document.getElementById("browser-iframe") as HTMLIFrameElement;
      if (iframe) {
        const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(rewrittenHtml);
        iframe.src = dataUrl;
        
        // Wait for iframe to load, then attach link click handlers
        iframe.onload = () => {
          console.log("[BrowserView] iframe loaded");
          this.attachLinkHandlers(iframe);
          this.hideLoading();
        };
        
        // Cache for tab switching
        this.cachedHtml = rewrittenHtml;
        this.cachedUrl = url;
      }
    } catch (e) {
      console.error("[BrowserView] Rust fetch failed:", e);
      this.hideLoading();
    }
  }

  private static attachLinkHandlers(iframe: HTMLIFrameElement): void {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      const links = iframeDoc.querySelectorAll("a");
      links.forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const href = link.getAttribute("href");
          if (href) {
            console.log("[BrowserView] Link clicked:", href);
            this.navigate(href);
          }
        });
      });
      console.log("[BrowserView] Attached handlers to", links.length, "links");
    } catch (e) {
      console.log("[BrowserView] Cannot access iframe content (cross-origin):", e);
    }
  }

  private static showLoading(): void {
    const loading = document.getElementById("browser-loading");
    if (loading) {
      loading.style.display = "flex";
    }
  }

  private static hideLoading(): void {
    const loading = document.getElementById("browser-loading");
    if (loading) {
      loading.style.display = "none";
    }
  }

  private static rewriteUrls(html: string, baseUrl: string): string {
    try {
      const urlObj = new URL(baseUrl);
      const origin = urlObj.origin;
      
      html = html.replace(/src="\/([^"]*)"/g, `src="${origin}/$1"`);
      html = html.replace(/href="\/([^"]*)"/g, `href="${origin}/$1"`);
      html = html.replace(/srcset="\/([^"]*)"/g, `srcset="${origin}/$1"`);
      html = html.replace(/action="\/([^"]*)"/g, `action="${origin}/$1"`);
      html = html.replace(/data-src="\/([^"]*)"/g, `data-src="${origin}/$1"`);
      
    } catch (e) {
      console.log("[BrowserView] URL rewrite error:", e);
    }
    
    return html;
  }
}
