import React, { useState, useRef } from "react";
import "./Envelope.css";

const coverImg = "/images/envelope simple white and brown wax.avif";
const videoSrc = "/videos/Timeline 3.mp4";

export default function Envelope({ onOpen }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  function startVideo() {
    if (playing) return;
    setPlaying(true);

    const v = videoRef.current;
    if (!v) return;

    // niente setTimeout: proviamo a partire subito
    const p = v.play();
    if (p?.catch) p.catch(() => {});
  }

  function enterSite() {
    onOpen?.();
  }

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div
        className="intro-center"
        onClick={!playing ? startVideo : undefined} // tap ovunque
      >
        {/* ✅ VIDEO sempre montato sotto */}
        <video
          ref={videoRef}
          className="intro-video"
          src={videoSrc}
          playsInline
          preload="auto"
          onEnded={enterSite}
        />

        {/* ✅ COVER sopra che fa fade-out */}
        <div className={`intro-cover ${playing ? "is-hidden" : ""}`}>
          <img src={coverImg} alt="Apri l'invito" />
        </div>
      </div>
    </div>
  );
}
