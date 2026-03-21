import { App } from "./App";
import "./styles.css";

const app = new App();
document.querySelector("#app")!.innerHTML = app.render();
app.loadTheme();
app.mount();
