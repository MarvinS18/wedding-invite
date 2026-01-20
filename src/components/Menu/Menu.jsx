import { useEffect, useRef, useState } from "react";
import "./Menu.css";

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const hideTimer = useRef(null);

  // chiudi con ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // mostra il bottone SOLO quando l'utente scrolla (su o giù)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;

      // se si è mosso davvero un pochino, consideriamo "scroll"
      if (Math.abs(y - lastY.current) > 2) {
        lastY.current = y;

        setVisible(true);

        // reset timer di hide
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
          // se il menu è aperto, non nascondere il bottone
          setVisible(false);
        }, 900); // ⬅️ dopo 0.9s che smette di scrollare sparisce
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const close = () => setOpen(false);

  // se è aperto, deve restare visibile
  const showFab = visible || open;

  return (
    <>
      {/* Bottone in alto a destra: visibile solo durante scroll o menu aperto */}
       <button
        className={`menu-fab ${showFab ? "menu-fab--visible" : ""} ${open ? "menu-fab--open" : ""}`}
        onClick={() => setOpen(v => !v)}
      >
        ☰
      </button>

      {/* Overlay + pannello */}
      {open && (
        <div className="menu-overlay" onClick={close} role="dialog" aria-modal="true">
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="menu-title">Menu</div>

            <a className="menu-link" href="#countdown" onClick={close}>Conto alla rovescia</a>
            <a className="menu-link" href="#cerimonia" onClick={close}>Cerimonia</a>
            <a className="menu-link" href="#ricevimento" onClick={close}>Ricevimento</a>
            <a className="menu-link" href="#programma" onClick={close}>Programma</a>
            <a className="menu-link" href="#regalo" onClick={close}>Regalo</a>
            <a className="menu-link" href="#rsvp" onClick={close}>RSVP</a>
          </div>
        </div>
      )}
    </>
  );
}
