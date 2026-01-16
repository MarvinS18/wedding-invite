import React, { useRef, useState } from "react";
import "./Envelope.css";

const coverImg = "/images/envelope simple white and brown wax.avif";
const videoSrc = "/videos/Timeline-5.mp4"; 

export default function Envelope({ onOpen, onStart }) {
  const videoRef = useRef(null);

  const [requestedPlay, setRequestedPlay] = useState(false); 
  const [coverHidden, setCoverHidden] = useState(false);   

 function startVideo() {
  if (requestedPlay) return;
  setRequestedPlay(true);

  onStart?.(); // ✅ QUI parte la musica (tap = ok su mobile)

  const v = videoRef.current;
  if (!v) return;

  const p = v.play();
  if (p?.catch) p.catch(() => {});
}

  function enterSite() {
    onOpen?.();
  }

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div className="intro-center" onClick={startVideo}>
        <video
          ref={videoRef}
          className="intro-video"
          src={videoSrc}
          playsInline
          preload="auto"
          muted
          poster={coverImg}                
          onPlaying={() => setCoverHidden(true)} 
          onEnded={enterSite}
        />

        {/* cover sopra finché il video NON è in playing */}
        <div className={`intro-cover ${coverHidden ? "is-hidden" : ""}`}>
          <img src={coverImg} alt="Apri l'invito" />
        </div>
      </div>
    </div>
  );
}
