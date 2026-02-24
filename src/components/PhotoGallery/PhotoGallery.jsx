import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { storage, db } from "../../firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [uploaderName, setUploaderName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUploadToaster, setShowUploadToaster] = useState(false);
  const [showErrorToaster, setShowErrorToaster] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showUploadBlockedModal, setShowUploadBlockedModal] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  // Mostra toaster per errori
  useEffect(() => {
    if (error) {
      setShowErrorToaster(true);
      const timer = setTimeout(() => {
        setShowErrorToaster(false);
        setError("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
  const [showVideoControls, setShowVideoControls] = useState(false);
  const videoControlsTimeoutRef = useRef(null);
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

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
    const current = photos[lightboxIndex];
    if (!lightboxOpen || !current || current.type !== "video") {
      setIsVerticalVideo(false);
    }
  }, [lightboxOpen, lightboxIndex, photos]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const scrollY = window.scrollY;
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.dataset.scrollLockBehavior = scrollBehavior || "";
    document.body.dataset.scrollLockY = String(scrollY);
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      const lockedY = parseInt(document.body.dataset.scrollLockY || "0", 10);
      const lockedBehavior = document.body.dataset.scrollLockBehavior || "";
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.dataset.scrollLockY = "";
      document.body.dataset.scrollLockBehavior = "";
      if (!Number.isNaN(lockedY)) {
        window.scrollTo(0, lockedY);
      }
      document.documentElement.style.scrollBehavior = lockedBehavior;
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
      const isVideo = file.type.startsWith("video/");

      // Controlla che sia immagine o video
      if (!isImage && !isVideo) {
        setError(t.errors.onlyImages);
        e.target.value = "";
        return;
      }

      // Controlla dimensioni
      const maxSize = isImage ? 15 * 1024 * 1024 : 200 * 1024 * 1024; // 15MB foto, 200MB video
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const maxSizeMB = isImage ? "15" : "200";
        setError(`${t.errors.fileTooBig} (${fileSizeMB} MB > ${maxSizeMB} MB)`);
        e.target.value = "";
        return;
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
    setUploadProgress(0);

    try {
      let uploadedCount = 0;
      let photoCount = 0;
      let videoCount = 0;
      const totalFiles = files.length;

      // Upload ogni file singolarmente
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const fileName = `${Date.now()}_${Math.random()}_${file.name}`;
        const storageRef = ref(storage, `weddingPhotos/${fileName}`);

        const metadata = {
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        };

        // Usa uploadBytesResumable per tracciare il progresso
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Promessa che si risolve quando l'upload è completato
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Traccia il progresso
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // Calcola il progresso globale considerando tutti i file
              const globalProgress = Math.round(
                (fileIndex * 100 + progress) / totalFiles
              );
              setUploadProgress(globalProgress);
            },
            (error) => {
              console.error("Errore durante l'upload:", error);
              reject(error);
            },
            async () => {
              // Upload completato
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
              resolve();
            }
          );
        });
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
      setUploadProgress(0);
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

  // Gestione swipe touch
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNextPhoto();
    }
    if (isRightSwipe) {
      goToPreviousPhoto();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Gestione mouse drag per desktop
  const handleMouseDown = (e) => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (touchStart) {
      setTouchEnd(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNextPhoto();
    }
    if (isRightSwipe) {
      goToPreviousPhoto();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
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
    <section id="galleria" className={`photo-gallery-section scroll-reveal ${isBeforeWedding ? 'before-wedding' : ''}`}>
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
          <h2
            className="text-5xl md:text-6xl text-foreground mb-4 gallery-title-custom"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            {t.title}
          </h2>
          <p className="text-base text-muted-foreground font-body leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Upload Guidelines */}
        {!isBeforeWedding && (
          <div className="upload-guidelines-section">
            <div className="upload-guidelines-box">
              <div className="guidelines-header">{t.uploadGuidelines || "Puoi caricare fino a:"}</div>
              <div className="guidelines-content">
                <div className="guideline-item-compact">
                  <span className="guideline-value">5</span> <span className="guideline-label">{t.guidelineFiles}</span>
                </div>
                <div className="guidelines-divider"></div>
                <div className="guideline-item-compact">
                  <span className="guideline-value">1 min</span> <span className="guideline-label">{t.guidelineDuration}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  onClick={(e) => {
                    if (isBeforeWedding) {
                      e.preventDefault();
                      setShowUploadBlockedModal(true);
                    }
                    if (loading) {
                      e.preventDefault();
                    }
                  }}
                  disabled={loading}
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

          {/* Progress Bar - Always rendered OUTSIDE form */}
          <div className={`upload-progress-container ${!loading ? 'invisible' : ''}`}>
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="upload-progress-text">{uploadProgress}%</span>
          </div>

          {/* Error Message */}
          {showErrorToaster && error && (
            <div className="upload-error-container">
              <p className="upload-error-message">{error}</p>
            </div>
          )}
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
                            src={`${photo.url}#t=0.1`}
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
                    <Link className="rsvp-btn primary rsvp-btn--single" to="/gallery">
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
                <button
                  type="button"
                  className="gallery-close-btn"
                  onClick={closeLightbox}
                  aria-label={t.closeLabel}
                >
                  ✕
                </button>
              </div>

              <div 
                className="gallery-modal__image-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: 'grab', userSelect: 'none' }}
              >
                <div
                  className={`gallery-modal__image-wrapper${
                    photos[lightboxIndex]?.type === "video"
                      ? " gallery-modal__image-wrapper--video"
                      : ""
                  }${
                    photos[lightboxIndex]?.type === "video" && !isVerticalVideo
                      ? " gallery-modal__image-wrapper--free"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="gallery-modal__nav-btn gallery-modal__nav-btn--prev"
                    onClick={goToPreviousPhoto}
                    aria-label={t.previousPhoto}
                  >
                    ❮
                  </button>

                  <span className="gallery-modal__counter">
                    {t.photoCounter
                      .replace("{current}", lightboxIndex + 1)
                      .replace("{total}", photos.length)}
                  </span>
                  {photos[lightboxIndex].type === "video" ? (
                    <video
                      ref={videoRef}
                      src={photos[lightboxIndex].url}
                      controls={showVideoControls}
                      autoPlay
                      playsInline
                      controlsList=""
                      className={`gallery-modal__image${
                        isVerticalVideo
                          ? " gallery-modal__image--cover"
                          : " gallery-modal__image--free"
                      } gallery-modal__image--video`}
                      onLoadedMetadata={(e) => {
                        const { videoWidth, videoHeight } = e.currentTarget;
                        setIsVerticalVideo(videoHeight > videoWidth);
                      }}
                      onPlay={() => {
                        setShowVideoControls(true);
                        if (videoControlsTimeoutRef.current) {
                          clearTimeout(videoControlsTimeoutRef.current);
                        }
                        videoControlsTimeoutRef.current = setTimeout(() => {
                          setShowVideoControls(false);
                        }, 2000);
                      }}
                      onMouseMove={() => {
                        setShowVideoControls(true);
                        if (videoControlsTimeoutRef.current) {
                          clearTimeout(videoControlsTimeoutRef.current);
                        }
                        videoControlsTimeoutRef.current = setTimeout(() => {
                          setShowVideoControls(false);
                        }, 2000);
                      }}
                      onTouchMove={() => {
                        setShowVideoControls(true);
                        if (videoControlsTimeoutRef.current) {
                          clearTimeout(videoControlsTimeoutRef.current);
                        }
                        videoControlsTimeoutRef.current = setTimeout(() => {
                          setShowVideoControls(false);
                        }, 2000);
                      }}
                      onPause={() => setShowVideoControls(true)}
                    />
                  ) : (
                    <img
                      src={photos[lightboxIndex].url}
                      alt={`Foto di ${photos[lightboxIndex].uploaderName}`}
                      className="gallery-modal__image"
                      draggable="false"
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

              <div className="gallery-modal__footer">
                <div className="gallery-modal__footer-left">
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
                {photos[lightboxIndex].type === "video" && (
                  <div className="gallery-download-wrap">
                    <a
                      className="gallery-download-link"
                      href={photos[lightboxIndex].url}
                      download
                    >
                      <span className="gallery-download-icon" aria-hidden="true">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 -960 960 960"
                          width="24"
                          fill="currentColor"
                        >
                          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                        </svg>
                      </span>
                    </a>
                  </div>
                )}
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
