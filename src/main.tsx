import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ToastContainerGlobal } from "./components/ToastContainerGlobal.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastContainerGlobal />
    <App />
  </React.StrictMode>
);
