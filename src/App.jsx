
import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import Envelope from "./components/Envelope/Envelope";
import RSVP from "./components/RSVP/RSVP";
import Menu from "./components/Menu/Menu";

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
  // Data evento
  const target = "2026-06-05T16:30:00";
  const { days, hours, mins, secs } = useCountdown(target);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  // Stato per la sezione Regalos
  const [showAportacion, setShowAportacion] = useState(false);
  const [showIban, setShowIban] = useState(false);
  // Stato per RSVP espandibile
  const [showRSVP, setShowRSVP] = useState(false);
  // Ref per la sezione RSVP
  const rsvpSectionRef = useRef(null);
  const audioRef = useRef(null);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVisible, setMusicVisible] = useState(false);
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const musicHideTimer = useRef(null);


  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;

      if (Math.abs(y - lastScrollY.current) > 2) {
        lastScrollY.current = y;

        setMusicVisible(true);

        if (musicHideTimer.current) clearTimeout(musicHideTimer.current);
        musicHideTimer.current = setTimeout(() => {
          setMusicVisible(false);
        }, 900);
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

    // opzionale: se era in pausa, riparte (utile su mobile)
    if (!next && a.paused) {
      const p = a.play();
      if (p?.catch) p.catch(() => { });
    }
  };

  const startMusic = () => {
    const a = audioRef.current;
    if (!a) return;

    a.loop = true;
    a.volume = 0.6;
    a.muted = musicMuted;

    const p = a.play();
    if (p?.catch) p.catch(() => { });
  };



  return (
    <>
      {envelopeOpen && <Menu />}
      <audio ref={audioRef} preload="auto">
        <source src="/music/Olivia-song.mp3" type="audio/mpeg" />
      </audio>

      <button
        type="button"
        className={`music-fab ${musicVisible ? "music-fab--visible" : "music-fab--hidden"
          }`}
        onClick={() => {
          toggleMute();

          // quando l'utente clicca, si rende visibile un attimo
          setMusicVisible(true);
          if (musicHideTimer.current) clearTimeout(musicHideTimer.current);
          musicHideTimer.current = setTimeout(() => {
            setMusicVisible(false);
          }, 900);
        }}
        aria-label={musicMuted ? "Attiva musica" : "Silenzia musica"}
        title={musicMuted ? "Attiva musica" : "Silenzia musica"}
      >
        {musicMuted ? (
          // 🔇 volume OFF
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
          // 🔊 volume ON
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

      {!envelopeOpen && (
        <>
          <div className="envelope-root-bg" />
          <Envelope onStart={startMusic} onOpen={() => setEnvelopeOpen(true)} />
        </>
      )}
      {envelopeOpen && (
        <>
          {/* Hero Section */}
         <section className="hero-video">

            {/* Background immagine + video */}

        <video
    className="bg-video bg-video--desktop"
    src="/videos/Save-the-date.mp4"
    autoPlay
    loop
    muted
    playsInline
  />

  {/* Mobile (verticale) */}
  <video
    className="bg-video bg-video--mobile"
    src="/videos/save-the-date-vertical.mp4"
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
                <span className="text-[10px] tracking-[0.3em] uppercase font-body font-light">
                  Conferma presenza
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
      <section id="countdown" className="section-padding bg-background">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-primary text-[10px] font-body tracking-[0.4em] uppercase mb-4">
            Conto alla rovescia
          </p>

          <h2 className="font-script text-4xl md:text-5xl text-foreground mb-16">
            Per il grande giorno
          </h2>

          <div
            className="flex flex-row justify-center max-w-2xl mx-auto"
            style={{ gap: "clamp(8px, 2.5vw, 32px)" }}
          >
            {/* Giorni */}
            <div className="flex flex-col items-center">
              <div
                className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                style={{
                  width: "clamp(70px, 18vw, 140px)",
                  height: "clamp(70px, 14vw, 120px)",
                }}
              >
                <span
                  className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                  style={{ fontSize: "clamp(1.6rem, 5vw, 3.8rem)" }}
                >
                  {String(days).padStart(2, "0")}
                </span>
              </div>
              <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                Giorni
              </span>
            </div>

            {/* Ore */}
            <div className="flex flex-col items-center">
              <div
                className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                style={{
                  width: "clamp(70px, 18vw, 140px)",
                  height: "clamp(70px, 14vw, 120px)",
                }}
              >
                <span
                  className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                  style={{ fontSize: "clamp(1.6rem, 5vw, 3.8rem)" }}
                >
                  {String(hours).padStart(2, "0")}
                </span>
              </div>
              <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                Ore
              </span>
            </div>

            {/* Minuti */}
            <div className="flex flex-col items-center">
              <div
                className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                style={{
                  width: "clamp(70px, 18vw, 140px)",
                  height: "clamp(70px, 14vw, 120px)",
                }}
              >
                <span
                  className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                  style={{ fontSize: "clamp(1.6rem, 5vw, 3.8rem)" }}
                >
                  {String(mins).padStart(2, "0")}
                </span>
              </div>
              <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                Minuti
              </span>
            </div>

            {/* Secondi */}
            <div className="flex flex-col items-center">
              <div
                className="bg-card border border-border rounded-lg shadow-soft flex items-center justify-center"
                style={{
                  width: "clamp(70px, 18vw, 140px)",
                  height: "clamp(70px, 14vw, 120px)",
                }}
              >
                <span
                  className="block font-display font-normal text-foreground tracking-tight tabular-nums"
                  style={{ fontSize: "clamp(1.6rem, 5vw, 3.8rem)" }}
                >
                  {String(secs).padStart(2, "0")}
                </span>
              </div>
              <span className="block mt-3 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                Secondi
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Separatore cuore */}
      <div
        className="flex items-center justify-center py-6 bg-ivory mt-8"
        style={{ opacity: 1 }}
      >
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
        <span className="mx-4 text-primary/50 text-lg font-script">♥</span>
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
      </div>

      {/* Location Section */}
      <section id="cerimonia" className="section-padding relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
              La cerimonia
            </h2>
            <p className="text-muted-foreground font-body tracking-wide">
              Chiesa di Santa Cecilia
            </p>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border p-8 md:p-12 rounded-lg shadow-elegant text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
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
                className="lucide lucide-map-pin w-7 h-7 text-primary"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 className="font-display text-2xl text-foreground mb-4">
              Chiesa di Santa Cecilia
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground font-body">
                Piazza Santa Cecilia 22, Roma
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
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
                  className="lucide lucide-clock w-4 h-4 text-primary"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="font-body">Ore 16:30</span>
              </div>
            </div>
            <div className="mb-6 rounded-lg overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps?q=Chiesa+di+Santa+Cecilia,+Piazza+Santa+Cecilia+22,+Roma&output=embed"
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa di Santa Cecilia"
                className="hover:opacity-90 transition-opacity duration-300"
                style={{ border: 0 }}
              ></iframe>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://maps.google.com/?q=Chiesa+di+Santa+Cecilia,+Piazza+Santa+Cecilia+22,+Roma"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 px-3 gap-2 border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground rounded-lg"
              >
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
                  className="lucide lucide-map-pin w-4 h-4"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Apri in Maps
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Separatore cuore */}
      <div
        className="flex items-center justify-center py-6 bg-ivory"
        style={{ opacity: 1 }}
      >
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
        <span className="mx-4 text-primary/50 text-lg font-script">♥</span>
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
      </div>

      {/* Ricevimento Section */}
      <section id="ricevimento" className="section-padding relative">
        <div className="max-w-4xl mx-auto relative z-10 px-4">
          <div className="text-center mb-16">
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
              Ricevimento
            </h2>
            <p className="text-muted-foreground font-body tracking-wide">
              Villa dei Consoli
            </p>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border p-8 md:p-12 rounded-lg shadow-elegant text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
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
                className="lucide lucide-map-pin w-7 h-7 text-primary"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 className="font-display text-2xl text-foreground mb-4">
              Villa dei Consoli
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground font-body">
                Via di Colle Reti 2, Frascati (RM)
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
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
                  className="lucide lucide-clock w-4 h-4 text-primary"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="font-body">Dalle 18:30</span>
              </div>
            </div>
            <div className="mb-6 rounded-lg overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps?q=Villa+dei+Consoli,+Via+di+Colle+Reti+2,+Frascati&output=embed"
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa di Villa dei Consoli"
                className="hover:opacity-90 transition-opacity duration-300"
                style={{ border: 0 }}
              ></iframe>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://maps.google.com/?q=Villa+dei+Consoli,+Via+di+Colle+Reti+2,+Frascati"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 px-3 gap-2 border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground rounded-lg"
              >
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
                  className="lucide lucide-map-pin w-4 h-4"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Apri in Maps
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Separatore cuore */}
      <div
        className="flex items-center justify-center py-6 bg-ivory"
        style={{ opacity: 1 }}
      >
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
        <span className="mx-4 text-primary/50 text-lg font-script">♥</span>
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
      </div>

      {/* Programma del giorno (timeline fornita) */}
      <section id="programma" className="section-padding">
        <div className="max-w-5xl mx-auto ">
          <div
            className="text-center mb-16"
            style={{ opacity: 1, transform: "none" }}
          >
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
              Programma del giorno
            </h2>
            <p className="text-muted-foreground font-body tracking-wide">
              La nostra giornata, passo dopo passo
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:flex justify-center">
              <div className="grid grid-cols-7 gap-2">
                {/* ...7 eventi desktop, come fornito... */}
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
                  <div className="timeline-badge mb-4">16:30</div>
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
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Arrivo
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Accoglienza degli invitati
                  </p>
                </div>
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
                  <div className="timeline-badge mb-4">17:00</div>
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
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Cerimonia
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Scambio delle promesse
                  </p>
                </div>
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
                  <div className="timeline-badge mb-4">18:00</div>
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
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Aperitivo
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Brindisi e stuzzichini
                  </p>
                </div>
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
                  <div className="timeline-badge mb-4">20:00</div>
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
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Cena
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Cena nuziale
                  </p>
                </div>
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
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
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Primo ballo
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Il nostro momento
                  </p>
                </div>
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
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
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Festa
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Tutti a ballare!
                  </p>
                </div>
                <div
                  className="flex flex-col items-center text-center group relative"
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
                  <div className="timeline-badge mb-4">02:30</div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border z-0" />
                  <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary mb-4 shadow-soft group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                    {/* svg sparkles */}
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
                      className="lucide lucide-sparkles w-5 h-5"
                    >
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                      <path d="M20 3v4"></path>
                      <path d="M22 5h-4"></path>
                      <path d="M4 17v2"></path>
                      <path d="M5 18H3"></path>
                    </svg>
                  </div>
                  <h3 className="font-display text-base lg:text-lg text-foreground mb-1 leading-tight">
                    Fine festa
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed px-1">
                    Arrivederci e grazie!
                  </p>
                </div>
              </div>
            </div>
            {/* Mobile timeline fornita */}
            <div className="md:hidden relative">
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
                      <span className="timeline-badge">16:30</span>
                      <h3 className="font-display text-lg text-foreground">
                        Arrivo
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Accoglienza degli invitati
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
                      <span className="timeline-badge">17:00</span>
                      <h3 className="font-display text-lg text-foreground">
                        Cerimonia
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Scambio delle promesse
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
                      <span className="timeline-badge">18:00</span>
                      <h3 className="font-display text-lg text-foreground">
                        Aperitivo
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Brindisi e stuzzichini
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
                      <span className="timeline-badge">20:00</span>
                      <h3 className="font-display text-lg text-foreground">
                        Cena
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Cena nuziale
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
                      <h3 className="font-display text-lg text-foreground">
                        Primo ballo
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Il nostro momento
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
                      <h3 className="font-display text-lg text-foreground">
                        Festa
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Tutti a ballare!
                    </p>
                  </div>
                </div>
                {/* Evento 7 */}
                <div
                  className="flex items-start gap-4 pl-1 relative"
                  style={{ opacity: 1, transform: "none" }}
                >
                  <div className="absolute top-0 left-[34px] w-px h-8 bg-border z-0" />
                  <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center text-primary flex-shrink-0 shadow-soft z-10">
                    {/* svg sparkles */}
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
                      className="lucide lucide-sparkles w-5 h-5"
                    >
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                      <path d="M20 3v4"></path>
                      <path d="M22 5h-4"></path>
                      <path d="M4 17v2"></path>
                      <path d="M5 18H3"></path>
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-baseline gap-3 mb-0.5">
                      <span className="timeline-badge">02:30</span>
                      <h3 className="font-display text-lg text-foreground">
                        Fine festa
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                      Arrivederci e grazie!
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Regalos (versione fornita) */}
      <section id="regalo" className="section-padding relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12" style={{ opacity: 1, transform: "none" }}>
            <h2 className="font-script text-5xl md:text-6xl text-foreground mb-6">
              Regali
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed max-w-lg mx-auto">
              La vostra presenza è il regalo più bello che possiamo ricevere.
              <br className="hidden md:block" />
              Se desiderate contribuire al nostro prossimo viaggio insieme,
              potete farlo nel modo che vi è più comodo.
            </p>
          </div>
          <div
            className="card-elegant overflow-hidden !p-0"
            style={{ opacity: 1, transform: "none" }}
          >
            <button
              className="w-full px-6 py-5 p-3flex items-center border border-t justify-between text-left hover:bg-secondary/30 transition-colors"
              onClick={() => setShowAportacion((v) => !v)}
              aria-expanded={showAportacion}
            >
              <span className="font-display text-lg text-foreground">
                Contributo
              </span>
              <div style={{ transform: "none" }}>
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
                  className={`lucide lucide-chevron-down w-5 h-5 text-muted-foreground transition-transform duration-200 ${showAportacion ? "rotate-180" : ""
                    }`}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </div>
            </button>
            {showAportacion && (
              <div className="px-6 pb-6 pt-2 border-t border-border animate-fade-in text-center">
                <p className="text-base text-muted-foreground font-body leading-relaxed mb-6">
                  Se preferite, il regalo può essere in denaro contante.
                  <br />
                  Se vi è più comodo, potete anche effettuare un bonifico:
                </p>
                <div>
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground/60 transition-colors font-body"
                    onClick={() => setShowIban((v) => !v)}
                  >
                    {showIban ? "Nascondi IBAN" : "Mostra IBAN"}
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
            )}
          </div>
        </div>
      </section>

      {/* Separatore cuore DOPO Regalos */}
      <div
        className="flex items-center justify-center py-6 bg-ivory"
        style={{ opacity: 1 }}
      >
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
        <span className="mx-4 text-primary/50 text-lg font-script">♥</span>
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
      </div>

      {/* Bottone RSVP e form espandibile */}
      <section
        id="rsvp"
        className="section-padding bg-ivory"
        ref={rsvpSectionRef}
      >
        <div className="max-w-xl mx-auto text-center mb-8">
          <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
            RSVP
          </h2>
          <p className="text-base text-muted-foreground font-body leading-relaxed mb-6">
            Per confermare la vostra presenza, inserite il vostro nome qui
            sotto.
            <br />
            Non vediamo l’ora di festeggiare con voi.
            <br />
            Grazie per voler condividere con noi questo giorno speciale!
            <br />
            Vi preghiamo di dare conferma entro il 30 aprile 2026
          </p>
          <button
            className="text-sm text-[#7c4a1e] hover:text-[#4e2c0c] underline underline-offset-4 decoration-[#b97d6a] hover:decoration-[#7c4a1e] transition-colors font-body btn"
            onClick={() => setShowRSVP((v) => !v)}
            aria-expanded={showRSVP}
            aria-controls="rsvp-form-section"
          >
            {showRSVP ? "Nascondi" : "Rispondi"}
          </button>
        </div>

        {showRSVP && (
          <div id="rsvp-form-section" className="fade-in max-w-xl mx-auto">
            <RSVP />
          </div>
        )}
      </section>
      {/* Separatore cuore */}
      <div
        className="flex items-center justify-center py-6 bg-ivory"
        style={{ opacity: 1 }}
      >
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
        <span className="mx-4 text-primary/50 text-lg font-script">♥</span>
        <span className="h-px bg-primary/30 w-16 md:w-24"></span>
      </div>
</div>
      {/* Footer */}
      <footer className="py-16 bg-primary text-center">
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
            className="lucide lucide-flower2 w-8 h-8 mx-auto text-primary-foreground/70"
          >
            <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path>
            <circle cx="12" cy="8" r="2"></circle>
            <path d="M12 10v12"></path>
            <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path>
            <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path>
          </svg>
          <p className="font-script text-5xl text-primary-foreground mt-4 mb-2">
            Karl & Reichelle
          </p>
          <p className="text-sm text-primary-foreground/80 font-body tracking-wide">
            5 giugno 2026
          </p>
          <p className="text-xs text-primary-foreground/60 mt-8 font-body">
            Con tutto il nostro amore
          </p>
        </div>
      </footer>
    </>
  );
}