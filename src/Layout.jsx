import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Menu from "./components/Menu/Menu";
import translations from "./translations";

export default function Layout() {
  const location = useLocation();
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("lang") || "en";
  });
  const t = translations[lang];

  const audioRef = useRef(null);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVisible, setMusicVisible] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.scrollY : 0,
  );
  const musicHideTimer = useRef(null);

  // Propaga la lingua selezionata a localStorage e agli eventuali listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lang", lang);
    window.dispatchEvent(new Event("languageChange"));
  }, [lang]);

  // Mostra/nascondi controllo musica allo scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;

      if (Math.abs(y - lastScrollY.current) > 2) {
        lastScrollY.current = y;

        setMusicVisible(true);

        if (musicHideTimer.current) clearTimeout(musicHideTimer.current);
        musicHideTimer.current = setTimeout(() => {
          setMusicVisible(false);
        }, 2000);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (musicHideTimer.current) clearTimeout(musicHideTimer.current);
    };
  }, []);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;

    const next = !musicMuted;
    a.muted = next;
    setMusicMuted(next);

    if (!next && a.paused) {
      const p = a.play();
      if (p?.catch) p.catch(() => {});
    }
  };

  // Avvia la musica automaticamente (solo su home dopo apertura busta)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    // Se siamo in /gallery, avvia subito
    if (location.pathname === "/gallery") {
      a.loop = true;
      a.volume = 0.6;
      a.muted = musicMuted;
      const p = a.play();
      if (p?.catch) p.catch(() => {});
    }
  }, [location.pathname, musicMuted]);

  // Mobile detection helper
  function isMobile() {
    try {
      const ua = navigator?.userAgent || navigator?.vendor || "";
      if (/android/i.test(ua)) return true;
      if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
    } catch {
      /* ignore */
    }
    try {
      if (
        window?.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches
      ) {
        return true;
      }
      if (window?.innerWidth && window.innerWidth <= 640) return true;
    } catch {
      /* ignore */
    }
    return false;
  }

  // Auto-pause/resume music on mobile when tab/window loses focus
  useEffect(() => {
    if (!isMobile()) return;

    const handleVisibility = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.hidden) {
        if (!a.paused) {
          a.pause();
          setAutoPaused(true);
        }
      } else {
        if (autoPaused && !musicMuted) {
          const p = a.play();
          if (p?.catch) p.catch(() => {});
          setAutoPaused(false);
        }
      }
    };

    const handleBlur = () => {
      const a = audioRef.current;
      if (!a || a.paused) return;
      a.pause();
      setAutoPaused(true);
    };

    const handleFocus = () => {
      const a = audioRef.current;
      if (!a || !autoPaused || musicMuted) return;
      const p = a.play();
      if (p?.catch) p.catch(() => {});
      setAutoPaused(false);
    };

    const handlePageHide = () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
      }
    };

    const handleBeforeUnload = () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [musicMuted, autoPaused]);

  // Nascondi menu e musica nella home prima dell'apertura busta
  const showControls =
    location.pathname === "/gallery" ||
    sessionStorage.getItem("envelopeSeen") === "1";

  return (
    <>
      {showControls && <Menu lang={lang} onLangChange={setLang} />}

      <audio ref={audioRef} preload="auto">
        <source src="/music/Olivia-song.mp3" type="audio/mpeg" />
      </audio>

      {showControls && (
        <button
          type="button"
          className={`music-fab ${
            musicVisible ? "music-fab--visible" : "music-fab--hidden"
          }`}
          onClick={() => {
            toggleMute();

            setMusicVisible(true);
            if (musicHideTimer.current) clearTimeout(musicHideTimer.current);
            musicHideTimer.current = setTimeout(() => {
              setMusicVisible(false);
            }, 2000);
          }}
          aria-label={musicMuted ? t.music.unmute : t.music.mute}
          title={musicMuted ? t.music.unmute : t.music.mute}
        >
          {musicMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="m23 9-6 6" />
              <path d="m17 9 6 6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}

      <Outlet context={{ lang, audioRef }} />
    </>
  );
}
