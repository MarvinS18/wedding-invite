import React, { useState } from "react";
import "./Navbar.css";
import translations from "../translations";

export default function Navbar({ lang = "it", setLang = () => {} }) {
  const [open, setOpen] = useState(false);
  const t = translations[lang] || translations.it;

  return (
    <header className={`navbar ${open ? "open" : ""}`} role="navigation" aria-label="Main menu">
      <div className="nav-inner container">
        <div className="nav-brand">Maria &amp; Carlos</div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="lang-switch" aria-hidden={false}>
            <button
              className={`lang-btn ${lang === "it" ? "active" : ""}`}
              onClick={() => setLang("it")}
              aria-pressed={lang === "it"}
              aria-label="Italiano"
            >
              IT
            </button>
            <button
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              aria-label="English"
            >
              EN
            </button>
          </div>

          <button
            className="nav-toggle"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
          >
            <span className="hamburger" />
          </button>
        </div>

        <nav className="nav-links" aria-hidden={!open}>
          <a href="#details">{t.nav.program || t.programTitle || t.nav.details}</a>
          <a href="#reception">{t.nav.reception || t.reception?.title}</a>
          <a href="#gifts">{t.nav.gifts || t.gifts?.title}</a>
          <a href="#attire">{t.nav.dresscode || t.attire?.title}</a>
          <a href="#dove">{t.nav.where}</a>
          <a href="#rsvp">{t.nav.rsvp}</a>
        </nav>
      </div>
    </header>
  );
}
