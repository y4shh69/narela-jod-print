import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { AdminAuthProvider } from "./components/admin-auth-provider";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./components/toast-provider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AdminAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
