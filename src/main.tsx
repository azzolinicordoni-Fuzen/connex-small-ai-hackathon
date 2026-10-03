import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerConnexFieldSW } from "./pwa/registerSW";

createRoot(document.getElementById("root")!).render(<App />);

registerConnexFieldSW();
