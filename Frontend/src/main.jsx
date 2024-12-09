import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import useTheme from "./Context/useTheme.js";

const Root = () => {
  const { theme } = useTheme();

  return (
    <StrictMode>
      <BrowserRouter>
        <Toaster
          toastOptions={{
            success: {
              style: {
                background: theme === "dark" ? "#0A3981" : "#d1fae5",
                color: theme === "dark" ? "#6ee7b7" : "#10b981",
              },
            },
            error: {
              style: {
                background: theme === "dark" ? "#7f1d1d" : "#fee2e2",
                color: theme === "dark" ? "#fecaca" : "#7f1d1d",
              },
            },
          }}
        />
        <App />
      </BrowserRouter>
    </StrictMode>
  );
};

createRoot(document.getElementById("root")).render(<Root />);
