import React, { useState, useRef, useEffect } from "react";
import "./Envelope.css";
const closedImg = new URL("../../public/images/envelope-closed.avif", import.meta.url).href;
const openImg = new URL("../../public/images/envelope-open.avif", import.meta.url).href;

export default function Envelope({ onOpen }) {
  const [opened, setOpened] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  // user-triggered open only (no auto-open)
  const [showMenu, setShowMenu] = useState(false);

  function handleOpen() {
    if (opened) return;
    setOpened(true);
    // reveal internal menu; parent callback will be called when user chooses to enter
    setShowMenu(true);
  }

  function enterSite() {
    if (onOpen) onOpen();
  }

  return (
    <div className="envelope-overlay" role="dialog" aria-modal="true" aria-label="Invito">
      <div className="envelope-center">
        <div
          ref={btnRef}
          role="button"
          tabIndex={0}
          className={`envelope ${opened ? "opened" : ""}`}
          onClick={handleOpen}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpen(); }}
          aria-pressed={opened}
          aria-label={opened ? "Lettera aperta" : "Apri la lettera"}
        >
          <div className="flap" aria-hidden="true" />
          <div className="body">
            <div className={`letter fade-in${opened ? " visible" : ""}`}>
              <div className="img-stack" aria-hidden="true">
                <img src={closedImg} alt="Busta chiusa" className={`envelope-art closed ${opened ? "hidden" : "visible"}`} />
                <img src={openImg} alt="Busta aperta" className={`envelope-art open ${opened ? "visible" : "hidden"}`} />
              </div>
              {/* internal menu that appears inside the letter after opening */}
              <div className={`letter-menu ${showMenu ? "visible" : ""}`}>
                <nav>
                  <a href="#details" onClick={enterSite}>{"Dettagli"}</a>
                  <a href="#rsvp" onClick={enterSite}>{"RSVP"}</a>
                  <a href="#dove" onClick={enterSite}>{"Dove"}</a>
                </nav>
                <div style={{marginTop:8}}>
                  <button className="btn" onClick={enterSite}>{"Entra"}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="seal" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden>
              <circle cx="32" cy="32" r="20" fill="#b97d6a" />
              <circle cx="32" cy="32" r="14" fill="#d99b79" />
              <text x="32" y="36" fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">KR</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
