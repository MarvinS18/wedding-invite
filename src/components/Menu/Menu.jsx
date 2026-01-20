import { useEffect, useRef, useState } from "react";
import "./Menu.css";

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const hideTimer = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;

      if (Math.abs(y - lastY.current) > 2) {
        lastY.current = y;

        setVisible(true);

        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
          // se è aperto, non nascondere
          setVisible(false);
        }, 900);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const close = () => setOpen(false);

  const onMenuClick = () => {
   
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setOpen((v) => !v);
    hideTimer.current = setTimeout(() => {
  
      setVisible(false);
    }, 900);
  };

  const showFab = visible || open;

  return (
    <>
      <button
        className={`menu-fab ${showFab ? "menu-fab--visible" : ""} ${open ? "menu-fab--open" : ""}`}
        onClick={onMenuClick}
        aria-label="Apri menu"
      >
        ☰
      </button>

      {open && (
        <div className="menu-overlay" onClick={close} role="dialog" aria-modal="true">
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            {/* <div className="menu-title">Menu</div> */}

            <a className="menu-link" href="#countdown" onClick={close}>Countdown</a>
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
