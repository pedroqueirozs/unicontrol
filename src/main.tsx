import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { ToastContainerGlobal } from "@/components/ToastContainerGlobal";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastContainerGlobal />
    <App />
  </React.StrictMode>
);
