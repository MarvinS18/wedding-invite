import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase-config";
import "./PhotoGallery.css";

export default function FullGallery() {
  const [photos, setPhotos] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const photosQuery = query(
      collection(db, "weddingPhotos"),
      orderBy("uploadedAt", "desc")
    );
    const unsubscribe = onSnapshot(photosQuery, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPhotos(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    sessionStorage.setItem("envelopeSeen", "1");
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goToPreviousPhoto = () => {
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNextPhoto = () => {
    setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="photos" className="photo-gallery-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="gallery-preview mt-12">
          <div className="text-center mb-8" style={{ position: "relative" }}>
            <Link
              to="/"
              state={{ skipIntro: true }}
              className="view-all-btn"
              style={{
                position: "absolute",
                left: "2rem",
                top: "50%",
                transform: "translateY(-50%)",
                display: "inline-flex",
                fontSize: "1.2rem",
                width: "40px",
                height: "40px",
                padding: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </Link>
            <h3 className="font-script text-4xl md:text-5xl text-foreground mb-2">
              Tutte le foto
            </h3>
            <p className="text-sm text-muted-foreground">
              I vostri momenti speciali
            </p>
          </div>

          {photos.length > 0 ? (
            <div className="photo-gallery-grid">
              {photos.map((photo, index) => (
                <button
                  type="button"
                  key={photo.id}
                  className="photo-card"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.url}
                    alt={`Foto di ${photo.uploaderName}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="photo-info">
                    <p className="font-body font-semibold">
                      📸 {photo.uploaderName}
                    </p>
                    <p className="text-sm opacity-80">
                      {photo.uploadedAt?.toDate?.().toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body">
                Ancora nessuna foto. Sii il primo a condividere! 📸
              </p>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && photos.length > 0 && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          style={{ zIndex: 2147483647 }}
        >
          <div
            className="gallery-modal__backdrop"
            onClick={closeLightbox}
          ></div>
          <div className="gallery-modal__content">
            <div className="gallery-modal__header">
              <div>
                <p className="text-sm font-body">
                  📸 <strong>{photos[lightboxIndex].uploaderName}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  {photos[lightboxIndex].uploadedAt
                    ?.toDate?.()
                    .toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="gallery-modal__controls">
                <span className="gallery-modal__counter">
                  {lightboxIndex + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  className="gallery-close-btn"
                  onClick={closeLightbox}
                  aria-label="Chiudi"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="gallery-modal__image-container">
              <button
                type="button"
                className="gallery-modal__nav-btn gallery-modal__nav-btn--prev"
                onClick={goToPreviousPhoto}
                aria-label="Foto precedente"
              >
                ❮
              </button>

              <img
                src={photos[lightboxIndex].url}
                alt={`Foto di ${photos[lightboxIndex].uploaderName}`}
                className="gallery-modal__image"
              />

              <button
                type="button"
                className="gallery-modal__nav-btn gallery-modal__nav-btn--next"
                onClick={goToNextPhoto}
                aria-label="Prossima foto"
              >
                ❯
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
