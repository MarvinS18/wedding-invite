import { useEffect, useRef, useState } from "react";
import "./Menu.css";
import translations from "../../translations";

export default function Menu({ lang = "en", onLangChange }) {
    const t = translations[lang];
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
                className={`menu-fab ${showFab ? "menu-fab--visible" : ""} ${open ? "menu-fab--open" : ""
                    }`}
                onClick={onMenuClick}
                aria-label="Apri menu"
            >
                ☰
            </button>

            {open && (
                <div
                    className="menu-overlay"
                    onClick={close}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="menu-panel" onClick={(e) => e.stopPropagation()}>

                        {/* <div className="menu-title">Menu</div> */}

                        <a className="menu-link" href="#countdown" onClick={close}>
                            {t.menu.countdown}
                        </a>
                        <a className="menu-link" href="#cerimonia" onClick={close}>
                            {t.menu.ceremony}
                        </a>
                        <a className="menu-link" href="#ricevimento" onClick={close}>
                            {t.menu.reception}
                        </a>
                        <a className="menu-link" href="#programma" onClick={close}>
                            {t.menu.program}
                        </a>
                        <a className="menu-link" href="#regalo" onClick={close}>
                            {t.menu.gifts}
                        </a>
                        <a className="menu-link" href="#rsvp" onClick={close}>
                            {t.menu.rsvp}
                        </a>
                        {/* Language switcher */}
                        <div className="menu-lang-toggle-wrap">
                            <button
                                type="button"
                                className={`menu-lang-toggle ${lang === "it" ? "is-it" : "is-en"}`}
                                onClick={() => onLangChange(lang === "en" ? "it" : "en")}
                                aria-label={`Cambia lingua (attuale: ${lang.toUpperCase()})`}
                            >
                                <span className="toggle-track" aria-hidden="true">
                                    <span className="toggle-label left">EN</span>
                                    <span className="toggle-label right">IT</span>
                                    <span className="toggle-knob" />
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
