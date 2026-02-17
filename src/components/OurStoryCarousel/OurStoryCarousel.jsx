import React, { useCallback, useEffect, useRef, useState } from "react";
import "./OurStoryCarousel.css";
import img1 from "../../assets/karlandreichellegallery1.avif";
import img2 from "../../assets/karlandreichellegallery2.avif";
import img3 from "../../assets/chiesabackground.avif";

const images = [img1, img2, img3];
const SLIDES = images.length;

export default function OurStoryCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES);
    }, 4000);
  }, [stopAutoplay]);

  useEffect(() => {
    // Autoplay every 4s
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  return (
    <div
      className="ourstory-carousel"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <button
        className="carousel-arrow left"
        onClick={prev}
        aria-label="Previous image"
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
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <div className="carousel-slide" key={i}>
            <img src={src} alt={`Our story ${i + 1}`} className="carousel-image" />
          </div>
        ))}
      </div>

      <button
        className="carousel-arrow right"
        onClick={next}
        aria-label="Next image"
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
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="carousel-dots" role="tablist" aria-label="Carousel navigation">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === index}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}
