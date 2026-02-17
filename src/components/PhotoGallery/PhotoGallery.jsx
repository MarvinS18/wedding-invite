import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { storage, db } from "../../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import "./PhotoGallery.css";
import translations from "../../translations";
import { weddingDate } from "../../eventConfig.js";

export default function PhotoGallery({ lang = "en" }) {
  const t = translations[lang].photoGallery;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploaderName, setUploaderName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadToaster, setShowUploadToaster] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showUploadBlockedModal, setShowUploadBlockedModal] = useState(false);

  // Mostra toaster per upload con successo
  useEffect(() => {
    if (showUploadToaster) {
      const timer = setTimeout(() => {
        setShowUploadToaster(false);
        setSuccess("");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [showUploadToaster]);

  // Carica le foto da Firestore al montaggio
  useEffect(() => {
    const photosQuery = query(
      collection(db, "weddingPhotos"),
      orderBy("uploadedAt", "desc"),
    );

    const unsubscribe = onSnapshot(photosQuery, (snapshot) => {
      const photosList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPhotos(photosList);
    });

    return () => unsubscribe();
  }, []);

  const videoRef = useRef(null);

  // Autoplay video quando si apre il lightbox
  useEffect(() => {
    if (lightboxOpen && photos[lightboxIndex]?.type === "video" && videoRef.current) {
      // Autoplay del video quando si apre il lightbox
      setTimeout(() => {
        videoRef.current?.play().catch(() => {
          // Fallback se autoplay è bloccato dal browser
        });
      }, 100);
    }
  }, [lightboxOpen, lightboxIndex, photos]);

  useEffect(() => {
    const overlayActive = lightboxOpen;
    if (overlayActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Limite massimo 5 file (foto + video)
    if (selectedFiles.length > 5) {
      setError(t.errors.maxPhotos);
      e.target.value = "";
      return;
    }

    // Validazioni per ogni file
    for (let file of selectedFiles) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type === "video/mp4";

      // Controlla che sia immagine o video
      if (!isImage && !isVideo) {
        setError(t.errors.onlyImages);
        e.target.value = "";
        return;
      }

      // Controlla dimensioni
      const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB foto, 50MB video
      if (file.size > maxSize) {
        setError(t.errors.fileTooBig);
        e.target.value = "";
        return;
      }

      // Controlla durata del video (max 5 minuti = 300 secondi)
      if (isVideo) {
        try {
          const duration = await getVideoDuration(file);
          if (duration > 300) {
            setError(t.errors.videoTooLong);
            e.target.value = "";
            return;
          }
        } catch (err) {
          console.error("Errore nel controllare la durata del video:", err);
          setError(t.errors.uploadError);
          e.target.value = "";
          return;
        }
      }
    }

    setFiles(selectedFiles);
    setError("");
  };

  // Helper per ottenere la durata di un video
  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Impossibile leggere il video"));
      };
      
      video.src = url;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // Controllo: mostra avviso prima del matrimonio
    if (isBeforeWedding) {
      setShowUploadBlockedModal(true);
      return;
    }

    if (files.length === 0 || !uploaderName.trim()) {
      setError(t.errors.nameAndPhoto);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let uploadedCount = 0;
      let photoCount = 0;
      let videoCount = 0;

      // Upload ogni file singolarmente
      for (let file of files) {
        const fileName = `${Date.now()}_${Math.random()}_${file.name}`;
        const storageRef = ref(storage, `weddingPhotos/${fileName}`);
        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        const fileType = file.type.startsWith("image/") ? "image" : "video";

        if (fileType === "image") {
          photoCount++;
        } else {
          videoCount++;
        }

        await addDoc(collection(db, "weddingPhotos"), {
          url: downloadURL,
          uploaderName: uploaderName.trim(),
          uploadedAt: new Date(),
          fileName,
          type: fileType,
        });

        uploadedCount++;
      }

      // Determina il messaggio di successo in base ai tipi di file caricati
      let message;
      if (uploadedCount === 1) {
        message = photoCount === 1 ? t.success.singlePhoto : t.success.singleVideo;
      } else if (photoCount > 0 && videoCount > 0) {
        message = t.success.multipleFiles
          .replace("{photoCount}", photoCount)
          .replace("{videoCount}", videoCount);
      } else if (photoCount > 0) {
        message = t.success.multiplePhotos.replace("{count}", photoCount);
      } else {
        message = t.success.multipleVideos.replace("{count}", videoCount);
      }

      setSuccess(message);
      setShowUploadToaster(true);
      setUploaderName("");
      setFiles([]);
      document.getElementById("fileInput").value = "";
    } catch (err) {
      console.error("Errore upload:", err);
      setError(t.errors.uploadError);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPreviousPhoto = () => {
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNextPhoto = () => {
    setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const displayedPhotos = photos.slice(0, 9);
  const isBeforeWeddingRef = useRef(Date.now() < weddingDate.getTime());
  const isBeforeWedding = isBeforeWeddingRef.current;
  const subtitle = isBeforeWedding
    ? t.preWeddingSubtitle
    : t.postWeddingSubtitle;
  // Forza sempre il formato dd/mm/yyyy
  const dateFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  return (
    <section id="galleria" className="photo-gallery-section scroll-reveal">
      {/* Success Toaster - fixed in alto al centro */}
      {showUploadToaster &&
        ReactDOM.createPortal(
          <div className="toaster-success">{success}</div>,
          document.body,
        )}

      <div
        className="max-w-7xl mx-auto px-4"
        style={{
          filter: lightboxOpen ? "blur(4px)" : "none",
          transition: "filter 180ms ease",
          pointerEvents: lightboxOpen ? "none" : "auto",
        }}
      >
        {/* Titolo */}
        <div className="text-center mb-12">
          <h2 className="font-script text-5xl md:text-6xl text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-base text-muted-foreground font-body leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Compact Upload Bar - visibile solo dal matrimonio in poi */}
        {/* Compact Upload Bar */}
        <div className="compact-upload-bar">
          <div className="upload-bar-content">
            <form onSubmit={handleUpload} className="upload-bar-form">
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => {
                  const value = e.target.value;
                  // Consenti solo lettere e spazi
                  if (/^[a-zA-Z\s]*$/.test(value)) {
                    // Capitalizza la prima lettera
                    const capitalized = value
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ");
                    setUploaderName(capitalized);
                  }
                }}
                placeholder={t.namePlaceholder}
                className="upload-input upload-input-name"
              />

              <label className="upload-file-label">
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*,video/mp4"
                  multiple
                  onChange={handleFileChange}
                  onClick={(e) => {
                    if (isBeforeWedding) {
                      e.preventDefault();
                      setShowUploadBlockedModal(true);
                    }
                  }}
                  className="upload-file-input"
                />
                <span className="upload-file-btn">
                  {files.length > 0
                    ? t.photosSelected.replace("{count}", files.length)
                    : t.choosePhotos}
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="upload-submit-btn"
              >
                {loading ? t.uploadingButton : t.uploadButton}
              </button>
            </form>

            <div className="upload-stats">
              <span className="upload-stats-number">{photos.length}</span>
              <span className="upload-stats-text">{t.photosCount}</span>
            </div>
          </div>

          {error && <p className="upload-message upload-error">{error}</p>}
          {/* Success Toaster spostato in alto, qui non serve più */}
        </div>

        {/* Galleria - appare dal matrimonio in poi */}
        {!isBeforeWedding && (
          <div className="gallery-preview mt-20">
            <div className="text-center mb-8">
              <h3 className="font-script text-4xl md:text-5xl text-foreground mb-2">
                {t.galleryTitle}
              </h3>
              {displayedPhotos.length > 0 && (
                <p className="text-muted-foreground gallery-subtitle">
                  {t.subtitle}
                </p>
              )}
            </div>

            {displayedPhotos.length > 0 ? (
              <>
                <div className="photo-gallery-grid photo-gallery-grid--preview">
                  {displayedPhotos.map((photo, index) => (
                    <button
                      type="button"
                      key={photo.id}
                      className="photo-card"
                      onClick={() => openLightbox(index)}
                    >
                      {photo.type === "video" ? (
                        <>
                          <video
                            src={photo.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="play-icon-wrapper">
                              <span className="play-icon">▶</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <img
                          src={photo.url}
                          alt={`Foto di ${photo.uploaderName}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="photo-info">
                        <p className="font-body font-semibold">
                          {photo.type === "video" ? "🎥" : "📸"} {photo.uploaderName}
                        </p>
                        <p className="text-sm opacity-80">
                          {(() => {
                            const d = photo.uploadedAt?.toDate?.();
                            if (!d) return "";
                            const date = d.toLocaleDateString(
                              "it-IT",
                              dateFormatOptions,
                            );
                            const time = d.toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            return `${date} ${time}`;
                          })()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {photos.length > 0 && (
                  <div className="text-center mt-6">
                    <Link className="view-all-btn" to="/gallery">
                      {t.viewAllPhotos}
                    </Link>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Messaggio "Ancora nessuna foto" solo dal matrimonio in poi */}
        {!isBeforeWedding && displayedPhotos.length === 0 && (
          <div className="text-center py-12 mt-20">
            <p className="text-muted-foreground font-body empty-gallery-message">
              {t.emptyGallery}
            </p>
          </div>
        )}
      </div>

      {lightboxOpen &&
        ReactDOM.createPortal(
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
                    {photos[lightboxIndex].type === "video" ? "🎥" : "📸"} <strong>{photos[lightboxIndex].uploaderName}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const d = photos[lightboxIndex].uploadedAt?.toDate?.();
                      if (!d) return "";
                      const date = d.toLocaleDateString(
                        "it-IT",
                        dateFormatOptions,
                      );
                      const time = d.toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return `${date} ${time}`;
                    })()}
                  </p>
                </div>
                <div className="gallery-modal__controls">
                  <span className="gallery-modal__counter">
                    {t.photoCounter
                      .replace("{current}", lightboxIndex + 1)
                      .replace("{total}", photos.length)}
                  </span>
                  <button
                    type="button"
                    className="gallery-close-btn"
                    onClick={closeLightbox}
                    aria-label={t.closeLabel}
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
                  aria-label={t.previousPhoto}
                >
                  ❮
                </button>

                {photos[lightboxIndex].type === "video" ? (
                  <video
                    ref={videoRef}
                    src={photos[lightboxIndex].url}
                    controls
                    autoPlay
                    className="gallery-modal__image"
                    style={{ width: "100%", height: "auto", maxHeight: "70vh" }}
                  />
                ) : (
                  <img
                    src={photos[lightboxIndex].url}
                    alt={`Foto di ${photos[lightboxIndex].uploaderName}`}
                    className="gallery-modal__image"
                  />
                )}

                <button
                  type="button"
                  className="gallery-modal__nav-btn gallery-modal__nav-btn--next"
                  onClick={goToNextPhoto}
                  aria-label={t.nextPhoto}
                >
                  ❯
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {/* Modal: Upload bloccato prima del matrimonio */}
      {showUploadBlockedModal &&
        ReactDOM.createPortal(
          <div
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 2147483647 }}
          >
            <div
              className="gallery-modal__backdrop"
              onClick={() => setShowUploadBlockedModal(false)}
            ></div>
            <div
              className="gallery-modal__content"
              style={{ maxWidth: "380px", padding: "2rem" }}
            >
              <div
                className="gallery-modal__header"
                style={{
                  marginBottom: "1.5rem",
                  borderBottom: "none",
                  paddingBottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h3
                  className="font-script text-2xl text-foreground"
                  style={{ margin: 0 }}
                >
                  {t.uploadBlockedTitle}
                </h3>
              </div>
              <div style={{ textAlign: "center" }}>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {t.uploadBlockedMessage}{" "}
                  <strong>{t.uploadBlockedDate}</strong>
                </p>
              </div>
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="rsvp-btn primary"
                  onClick={() => setShowUploadBlockedModal(false)}
                >
                  {t.understoodButton}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
