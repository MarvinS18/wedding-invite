import React, { useState, useRef } from "react";
import "./Envelope.css";

const coverImg = "/images/envelope simple white and brown wax.avif"; // la foto iniziale
const videoSrc = "/videos/Timeline 3.mp4";  // video apertura

export default function Envelope({ onOpen }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  function startVideo() {
    setPlaying(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 20);
  }

  function enterSite() {
    if (onOpen) onOpen();
  }

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div className="intro-center">
        {!playing && (
          <button className="intro-cover" onClick={startVideo}>
            <img src={coverImg} alt="Apri l'invito" />
          </button>
        )}

        {playing && (
          <video
            ref={videoRef}
            className="intro-video"
            src={videoSrc}
            playsInline
            preload="auto"
            onEnded={enterSite}
          />
        )}
      </div>
    </div>
  );
}
