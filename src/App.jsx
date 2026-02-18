import React, { useEffect, useState, useRef } from "react";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import "./App.css";
import "./components/RSVP/RSVP.css";
import Envelope from "./components/Envelope/Envelope";
import RSVP from "./components/RSVP/RSVP";
import PhotoGallery from "./components/PhotoGallery/PhotoGallery";
import translations from "./translations";
import Rsvp from "./components/RSVP/RSVP";
import OurStoryCarousel from "./components/OurStoryCarousel/OurStoryCarousel";

function useCountdown(targetDate) {
  const [t, setT] = useState(getDiff(targetDate));
  useEffect(() => {
    const id = setInterval(() => setT(getDiff(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
  function getDiff(d) {
    const diff = Math.max(0, new Date(d) - new Date());
    const days = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const mins = Math.floor((diff % 36e5) / 6e4);
    const secs = Math.floor((diff % 6e4) / 1000);
    return { days, hours, mins, secs };
  }
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, audioRef } = useOutletContext();
  // Data evento
  const target = "2026-06-05T16:30:00";
  const { days, hours, mins, secs } = useCountdown(target);
  
  // Inizializza envelopeOpen basandoti su skipIntro o sessionStorage
  const [envelopeOpen, setEnvelopeOpen] = useState(() => {
    if (location.state?.skipIntro) {
      try {
        sessionStorage.setItem("envelopeSeen", "1");
        window.dispatchEvent(new Event("envelopeOpened"));
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  });
  
  // Stato per la sezione Regalos
  const [showAportacion, setShowAportacion] = useState(false);
  const [showIban, setShowIban] = useState(false);
  // Stato per RSVP espandibile
  const [showRSVP, setShowRSVP] = useState(false);
  // Traduzioni
  const t = translations[lang];
  // Ref per la sezione RSVP
  const rsvpSectionRef = useRef(null);

  // Link Google Maps: usa sempre l'URL web di Google Maps
  const getMapsHref = (label) => {
    const encoded = encodeURIComponent(label);
    return `https://www.google.com/maps?q=${encoded}`;
  };

  // Disabilita il ripristino automatico della posizione scroll del browser
  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
  }, []);

  const mapsHrefCeremony = getMapsHref(
    "Basilica di Santa Cecilia in Trastevere, Roma",
  );
  const mapsHrefReception = getMapsHref(
    "Villa dei Consoli, Via di Colle Reti 2, Frascati",
  );

  const handleEnvelopeOpen = () => {
    setEnvelopeOpen(true);
    try {
      sessionStorage.setItem("envelopeSeen", "1");
      window.dispatchEvent(new Event("envelopeOpened"));
    } catch {
      /* ignore */
    }
  };

  const startMusic = () => {
    const a = audioRef.current;
    if (!a) return;

    a.loop = true;
    a.volume = 0.6;

    const p = a.play();
    if (p?.catch) p.catch(() => {});
  };

  // Se arrivi con skipIntro (es. bottone "indietro" della full gallery), scrolla alla sezione target
  useEffect(() => {
    if (location.state?.skipIntro && envelopeOpen) {
      const targetId = location.state?.targetSection || "galleria";
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, envelopeOpen]);

  // Se torni da /gallery con il tasto indietro, usa il flag di sessione per scrollare alla galleria
  useEffect(() => {
    if (!envelopeOpen) return;
    const targetId = sessionStorage.getItem("returnToSection");
    if (!targetId) return;

    const el = document.getElementById(targetId);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
    sessionStorage.removeItem("returnToSection");
  }, [envelopeOpen]);

  // Scroll reveal effect
  useEffect(() => {
    if (!envelopeOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const sections = document.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-left",
    );
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [envelopeOpen]);

  return (
    <>
      {!envelopeOpen && (
        <>
          <div className="envelope-root-bg" />
          <Envelope onStart={startMusic} onOpen={handleEnvelopeOpen} />
        </>
      )}
      {envelopeOpen && (
        <>
          {/* Hero Section */}
          <section className="hero-video">
            {/* Background immagine + video */}

            <video
              className="bg-video bg-video--desktop"
              src="/videos/Save-the-date-orizzontale.mp4"
              autoPlay
              loop
              muted
              playsInline
            />

            {/* Mobile (verticale) */}
            <video
              className="bg-video bg-video--mobile"
              src="/videos/Save-the-date-verticale8.mp4"
              autoPlay
              loop
              muted
              playsInline
            />

            {/* Overlay content */}
            <div className="relative z-20 min-h-screen flex flex-col items-center justify-center">
              <button
                className="absolute bottom-8 flex flex-col items-center gap-2 bg-transparent text-foreground/50 hover:text-primary transition-colors cursor-pointer border-none shadow-none p-0"
                style={{
                  background: "none",
                  boxShadow: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowRSVP(true);
                  setTimeout(() => {
                    if (rsvpSectionRef.current) {
                      rsvpSectionRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }, 50);
                }}
                aria-expanded={showRSVP}
                aria-controls="rsvp-form-section"
              >
                <span className="text-[10px] tracking-[0.3em] max-w-2xl uppercase font-body font-light">
                  {t.hero.confirmAttendance}
                </span>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-down w-5 h-5"
                  >
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </div>
              </button>
            </div>
          </section>
        </>
      )}

      {/* Countdown Section */}
      <div className="site-content">
        <section
          id="countdown"
          className="section-padding bg-background scroll-reveal"
        >
          <div className="max-w-4xl mx-auto text-center px-4">
            <p className="text-primary text-[10px] font-body tracking-[0.4em] uppercase mb-4">
              {t.countdown.title}
            </p>

            <h2 className="font-script text-5xl text-foreground mb-16">
              {t.countdown.subtitle}
            </h2>

            <div
              className="flex flex-row justify-center max-w-2xl mx-auto"
              style={{ gap: "clamp(10px, 3.5vw, 48px)" }}
            >
              {/* Giorni */}
              <div className="flex flex-col items-center">
                <div
                  className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                  style={{
                    width: "clamp(70px, 13vw, 180px)",
                    height: "clamp(70px, 11vw, 150px)",
                  }}
                >
                  <span
                    className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                    style={{ fontSize: "clamp(1.8rem, 3.8vw, 4.6rem)" }}
                  >
                    {String(days).padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                  {t.countdown.days}
                </span>
              </div>

              {/* Ore */}
              <div className="flex flex-col items-center">
                <div
                  className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                  style={{
                    width: "clamp(70px, 13vw, 180px)",
                    height: "clamp(70px, 11vw, 150px)",
                  }}
                >
                  <span
                    className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                    style={{ fontSize: "clamp(1.8rem, 3.8vw, 4.6rem)" }}
                  >
                    {String(hours).padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                  {t.countdown.hours}
                </span>
              </div>

              {/* Minuti */}
              <div className="flex flex-col items-center">
                <div
                  className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                  style={{
                    width: "clamp(70px, 13vw, 180px)",
                    height: "clamp(70px, 11vw, 150px)",
                  }}
                >
                  <span
                    className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                    style={{ fontSize: "clamp(1.8rem, 3.8vw, 4.6rem)" }}
                  >
                    {String(mins).padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                  {t.countdown.minutes}
                </span>
              </div>

              {/* Secondi */}
              <div className="flex flex-col items-center">
                <div
                  className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                  style={{
                    width: "clamp(70px, 13vw, 180px)",
                    height: "clamp(70px, 11vw, 150px)",
                  }}
                >
                  <span
                    className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                    style={{ fontSize: "clamp(1.8rem, 3.8vw, 4.6rem)" }}
                  >
                    {String(secs).padStart(2, "0")}
                  </span>
                </div>
                <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                  {t.countdown.seconds}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Separatore cuore */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* Location Section */}
        <section
          id="cerimonia"
          className="section-padding relative scroll-reveal"
        >
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-8">
              <h2 className="font-script text-5xl md:text-6xl text-foreground ">
                {t.ceremony.title}
              </h2>
            </div>
            <div className="text-center">
              <a
                href={mapsHrefCeremony}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.reception.openInMaps}
                className="inline-block hover:opacity-90 transition-opacity duration-300"
              >
                <img
                  src="/images/chiesa.png"
                  alt={t.ceremony.place}
                  className="ceremony-map-img"
                />
              </a>
            </div>
            <div className="flex flex-col items-center mt-4">
              <button
                type="button"
                onClick={() => window.open(mapsHrefCeremony, "_blank")}
                className="rsvp-btn primary rsvp-btn--single"
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: "8px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                Piazza di Santa Cecilia, 22, 00153 Roma RM
              </button>
            </div>
          </div>
        </section>
        {/* Separatore cuore */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* Ricevimento Section */}
        <section
          id="ricevimento"
          className="section-padding relative scroll-reveal"
        >
          <div className="max-w-4xl mx-auto relative z-10 px-4">
            <div className="text-center mb-8">
              <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
                {t.reception.title}
              </h2>
            </div>
            <div className="text-center">
              <a
                href={mapsHrefReception}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.reception.openInMaps}
                className="inline-block hover:opacity-90 transition-opacity duration-300"
              >
                <img
                  src="/images/ricevimento.png"
                  alt={t.reception.place}
                  className="reception-map-img"
                />
              </a>
            </div>
            <div className="flex flex-col items-center mt-4">
              <button
                type="button"
                onClick={() => window.open(mapsHrefReception, "_blank")}
                className="rsvp-btn primary rsvp-btn--single"
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: "8px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                Via di Pietra Porzia, 38, 00044 Frascati RM
              </button>
            </div>
          </div>
        </section>
        {/* Separatore cuore */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* Programma del giorno (timeline fornita) */}
        <section id="programma" className="section-padding scroll-reveal-left">
          <div className="max-w-5xl mx-auto ">
            <div
              className="text-center mb-16"
              style={{ opacity: 1, transform: "none" }}
            >
              <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
                {lang === "en" ? (
                  <>
                    <span className="program-title-desktop">
                      {t.program.titleDesktop}
                    </span>
                    <span className="program-title-mobile">
                      {t.program.titleMobile}
                    </span>
                  </>
                ) : (
                  t.program.title
                )}
              </h2>
              <p className="text-muted-foreground font-body tracking-wide">
                {t.program.subtitle}
              </p>
            </div>
            <div className="relative">
              <div className="timeline-desktop relative">
                {/* linea orizzontale dietro gli step */}
                <div className="absolute left-0 right-0 top-14 h-px bg-border" />
                <div className="timeline-row w-full max-w-6xl">
                  {/* ...7 eventi desktop, come fornito... */}
                  <div className="flex-1 min-w-[120px] flex flex-col items-center text-center group relative">
                    <div className="timeline-badge mb-4">16:00</div>
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                      {/* svg map-pin */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-map-pin w-5 h-5"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <h3 className="font-display text-base text-foreground mb-0 leading-tight">
                      {t.program.events.ceremony.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed px-1">
                      {t.program.events.ceremony.description}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px] flex flex-col items-center text-center group relative scroll-reveal-left">
                    <div className="timeline-badge mb-4">18:30</div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                      {/* svg heart */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-heart w-5 h-5"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </div>
                    <h3 className="font-display text-base lg:text-sm text-foreground mb-0 leading-tight">
                      {t.program.events.aperitivo.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed px-1">
                      {t.program.events.aperitivo.description}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px] flex flex-col items-center text-center group relative scroll-reveal-left">
                    <div className="timeline-badge mb-4">20:30</div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                      {/* svg wine */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-wine w-5 h-5"
                      >
                        <path d="M8 22h8"></path>
                        <path d="M7 10h10"></path>
                        <path d="M12 15v7"></path>
                        <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"></path>
                      </svg>
                    </div>
                    <h3 className="font-display text-base lg:text-lg text-foreground mb-0 leading-tight">
                      {t.program.events.dinner.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed px-1">
                      {t.program.events.dinner.description}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px] flex flex-col items-center text-center group relative scroll-reveal-left">
                    <div className="timeline-badge mb-4">22:00</div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                      {/* svg utensils-crossed */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-utensils-crossed w-5 h-5"
                      >
                        <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path>
                        <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path>
                        <path d="m2.1 21.8 6.4-6.3"></path>
                        <path d="m19 5-7 7"></path>
                      </svg>
                    </div>
                    <h3 className="font-display text-base lg:text-lg text-foreground mb-0 leading-tight">
                      {t.program.events.cakeCutting.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed px-1">
                      {t.program.events.cakeCutting.description}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px] flex flex-col items-center text-center group relative scroll-reveal-left">
                    <div className="timeline-badge mb-4">22:30</div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                      {/* svg flower2 */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-flower2 w-5 h-5"
                      >
                        <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path>
                        <circle cx="12" cy="8" r="2"></circle>
                        <path d="M12 10v12"></path>
                        <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path>
                        <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path>
                      </svg>
                    </div>
                    <h3 className="font-display text-base lg:text-lg text-foreground mb-0 leading-tight">
                      {t.program.events.firstDance.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed px-1">
                      {t.program.events.firstDance.description}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px] flex flex-col items-center text-center group relative scroll-reveal-left">
                    <div className="timeline-badge mb-4">23:00</div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                      {/* svg music */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-music w-5 h-5"
                      >
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <h3 className="font-display program-3 lg:text-lg text-foreground mb-0 leading-tight">
                      {t.program.events.party.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed px-1">
                      {t.program.events.party.description}
                    </p>
                  </div>
                  
                </div>
              </div>
              {/* Mobile timeline fornita */}
              <div className="timeline-mobile relative">
                {/* Linea verticale che collega tutte le icone, più visibile */}
                <div
                  className="absolute left-8 top-0 bottom-0 w-4 bg-black border-2 border-white z-0"
                  style={{ borderRadius: "9999px" }}
                ></div>
                <div className="space-y-6 relative z-10">
                  {/* Evento 1 */}
                  <div
                    className="flex items-start gap-4 pl-1 relative"
                    style={{ opacity: 1, transform: "none" }}
                  >
                    {/* Primo evento: nessuna linea sopra */}
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                      {/* svg map-pin */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-map-pin w-5 h-5"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="timeline-badge">16:00</span>
                        <h3 className="font-display text-lg text-foreground margin-0">
                          {t.program.events.ceremony.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {t.program.events.ceremony.description}
                      </p>
                    </div>
                  </div>
                  {/* Evento 2 */}
                  <div
                    className="flex items-start gap-4 pl-1 relative"
                    style={{ opacity: 1, transform: "none" }}
                  >
                    {/* Linea verticale sopra l'icona */}
                    <div className="absolute top-0 left-[34px] w-px h-8 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                      {/* svg heart */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-heart w-5 h-5"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="timeline-badge">18:30</span>
                        <h3 className="font-display text-lg text-foreground margin-0">
                          {t.program.events.aperitivo.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {t.program.events.aperitivo.description}
                      </p>
                    </div>
                  </div>
                  {/* Evento 3 */}
                  <div
                    className="flex items-start gap-4 pl-1 relative"
                    style={{ opacity: 1, transform: "none" }}
                  >
                    <div className="absolute top-0 left-[34px] w-px h-8 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                      {/* svg wine */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-wine w-5 h-5"
                      >
                        <path d="M8 22h8"></path>
                        <path d="M7 10h10"></path>
                        <path d="M12 15v7"></path>
                        <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="timeline-badge">20:30</span>
                        <h3 className="font-display text-lg text-foreground margin-0">
                          {t.program.events.dinner.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {t.program.events.dinner.description}
                      </p>
                    </div>
                  </div>
                  {/* Evento 4 */}
                  <div
                    className="flex items-start gap-4 pl-1 relative"
                    style={{ opacity: 1, transform: "none" }}
                  >
                    <div className="absolute top-0 left-[34px] w-px h-8 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                      {/* svg utensils-crossed */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-utensils-crossed w-5 h-5"
                      >
                        <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path>
                        <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path>
                        <path d="m2.1 21.8 6.4-6.3"></path>
                        <path d="m19 5-7 7"></path>
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="timeline-badge">22:00</span>
                        <h3 className="font-display text-lg text-foreground margin-0">
                          {t.program.events.firstDance.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {t.program.events.firstDance.description}
                      </p>
                    </div>
                  </div>
                  {/* Evento 5 */}
                  <div
                    className="flex items-start gap-4 pl-1 relative"
                    style={{ opacity: 1, transform: "none" }}
                  >
                    <div className="absolute top-0 left-[34px] w-px h-8 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                      {/* svg flower2 */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-flower2 w-5 h-5"
                      >
                        <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path>
                        <circle cx="12" cy="8" r="2"></circle>
                        <path d="M12 10v12"></path>
                        <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path>
                        <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="timeline-badge">22:30</span>
                        <h3 className="font-display text-lg text-foreground margin-0">
                          {t.program.events.cakeCutting.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {t.program.events.cakeCutting.description}
                      </p>
                    </div>
                  </div>
                  {/* Evento 6 */}
                  <div
                    className="flex items-start gap-4 pl-1 relative"
                    style={{ opacity: 1, transform: "none" }}
                  >
                    <div className="absolute top-0 left-[34px] w-px h-8 bg-border z-0" />
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                      {/* svg music */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-music w-5 h-5"
                      >
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-0.5">
                        <span className="timeline-badge">23:00</span>
                        <h3 className="font-display text-lg text-foreground margin-0">
                          {t.program.events.party.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {t.program.events.party.description}
                      </p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separatore cuore */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* Our Story Section */}
        <section id="our-story" className="section-padding scroll-reveal">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-4">
              {t.ourStory.title}
            </h2>
            <p
              className="text-base text-muted-foreground font-body leading-relaxed"
              style={{ whiteSpace: "pre-line" }}
            >
              {t.ourStory.text}
            </p>
            <OurStoryCarousel />
          </div>
        </section>

        {/* Separatore cuore DOPO Our Story */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* Sezione Regalo */}
        <section id="regalo" className="section-padding relative scroll-reveal">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-12" style={{ opacity: 1, transform: "none" }}>
              <h2 className="font-script text-5xl md:text-6xl text-foreground mb-6">
                {t.gifts.title}
              </h2>
              <p className="text-base text-muted-foreground font-body leading-relaxed max-w-lg mx-auto">
                {t.gifts.description}
              </p>
            </div>
            <button
              className={`rsvp-btn rsvp-btn--single ${
                showAportacion ? "secondary" : "primary"
              }`}
              onClick={() => setShowAportacion((v) => !v)}
              aria-expanded={showAportacion}
            >
              {t.gifts.contribution}
            </button>
            {showAportacion && (
              <div
                className="card-elegant overflow-hidden p-8 border border-border"
                style={{ opacity: 1, transform: "none", marginTop: "24px" }}
              >
                <div className="px-6 pb-6 pt-2 border-t border-border animate-fade-in text-center">
                  <p className="text-base text-muted-foreground font-body leading-relaxed mb-6">
                    {t.gifts.cashText}
                  </p>
                  <div className="mb-4">
                    <button
                      className="rsvp-btn secondary rsvp-btn--small"
                      onClick={() => setShowIban((v) => !v)}
                    >
                      {showIban ? t.gifts.hideIban : t.gifts.showIban}
                    </button>
                    {showIban && (
                      <div className="mt-4">
                        <div className="text-xs font-body regalos-iban-label mb-1 tracking-widest uppercase">
                          IBAN
                        </div>
                        <div className="font-mono text-base text-foreground select-all regalos-iban-value">
                          IT60X0542811101000000123456
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Separatore cuore DOPO Gift */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* Bottone RSVP e form espandibile */}
        <section
          id="rsvp"
          className="section-padding scroll-reveal"
          ref={rsvpSectionRef}
        >
          <div className="max-w-xl mx-auto text-center mb-8">
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
              RSVP
            </h2>
            <p className="text-base text-muted-foreground font-body leading-relaxed mb-6">
              <span
                className="rsvp-desc-desktop"
                style={{ whiteSpace: "pre-line" }}
              >
                {t.rsvp.descriptionDesktop}
              </span>
              <span className="rsvp-desc-mobile" style={{ whiteSpace: "pre-line" }}>
                {t.rsvp.descriptionMobile}
              </span>
            </p>
            <button
              className={`rsvp-btn ${
                showRSVP ? "secondary" : "primary"
              } rsvp-btn--single`}
              onClick={() => setShowRSVP((v) => !v)}
              aria-expanded={showRSVP}
              aria-controls="rsvp-form-section"
            >
              {showRSVP ? t.rsvp.hide : t.rsvp.reply}
            </button>
          </div>

          {showRSVP && (
            <div id="rsvp-form-section" className="fade-in max-w-xl mx-auto">
              <RSVP lang={lang} />
            </div>
          )}
        </section>

        {/* Separatore cuore DOPO RSVP */}
        <div className="section-separator" style={{ opacity: 1 }}>
          <span className="section-separator__line"></span>
          <span className="section-separator__heart">♥</span>
          <span className="section-separator__line"></span>
        </div>

        {/* SEZIONE FOTO - Photo Gallery */}
        <PhotoGallery lang={lang} />
      </div>
      {/* Footer */}
      <footer
        className="py-8 bg-primary text-center"
        style={{ marginTop: "4rem" }}
      >
        {/*                <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-flower2 w-8 h-8 mx-auto text-primary-foreground/70"
          >
            <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path>
            <circle cx="12" cy="8" r="2"></circle>
            <path d="M12 10v12"></path>
            <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path>
            <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path>
          </svg> */}
        <div>
          {/* Contatti */}
          <div
            className="max-w-xl mx-auto mb-8 text-primary-foreground/80 font-body"
            style={{ lineHeight: 1.6 }}
          >
            <p className="text-sm mb-4" style={{ whiteSpace: "pre-line" }}>
              {t.footer.contactLead}
            </p>

            <div className="space-y-2 text-sm md:text-base">
              {/* Email */}
              <p className="flex items-center justify-center gap-2">
                {/* icona mail */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"></path>
                  <path d="m22 6-10 7L2 6"></path>
                </svg>
                <span className="font-medium">Email:</span>
                <a
                  href="mailto:karlandreichelle@gmail.com"
                  className="underline underline-offset-2 hover:opacity-90 text-primary-foreground"
                >
                  karlandreichelle@gmail.com
                </a>
              </p>

              {/* Karl Anjelo Reyes */}
              <p className="flex items-center justify-center gap-2">
                {/* icona telefono */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.61 2.6a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.57-1.27a2 2 0 0 1 2.11-.45c.83.28 1.7.49 2.6.61A2 2 0 0 1 22 16.92Z" />
                </svg>
                <span className="font-medium">Karl Anjelo Reyes:</span>
                <a
                  href="tel:+393342070009"
                  className="underline underline-offset-2 hover:opacity-90 text-primary-foreground"
                >
                  +39 327 432 7315
                </a>
                <span>—</span>
                {/* icona instagram */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <circle cx="18" cy="6" r="1"></circle>
                </svg>
                <a
                  href="https://instagram.com/karl.anjelo_r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-90 text-primary-foreground"
                >
                  @karl.anjelo_r
                </a>
              </p>

              {/* Reichelle Mercado */}
              <p className="flex items-center justify-center gap-2">
                {/* icona telefono */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.61 2.6a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.57-1.27a2 2 0 0 1 2.11-.45c.83.28 1.7.49 2.6.61A2 2 0 0 1 22 16.92Z" />
                </svg>
                <span className="font-medium">Reichelle Mercado:</span>
                <a
                  href="tel:+393285969749"
                  className="underline underline-offset-2 hover:opacity-90 text-primary-foreground"
                >
                  +39 328 596 9749
                </a>
                <span>—</span>
                {/* icona instagram */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <circle cx="18" cy="6" r="1"></circle>
                </svg>
                <a
                  href="https://instagram.com/reichellem_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-90 text-primary-foreground"
                >
                  @reichellem_
                </a>
              </p>
            </div>
          </div>

          <p className="font-script text-5xl text-primary-foreground mt-4 mb-2">
            {t.footer.names}
          </p>
    
        </div>
      </footer>
    </>
  );
}
