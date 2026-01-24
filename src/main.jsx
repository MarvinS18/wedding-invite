import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import FullGallery from "./components/PhotoGallery/FullGallery.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gallery" element={<FullGallery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
