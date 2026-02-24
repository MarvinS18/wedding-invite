import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebase-config";
import "./PhotoGallery.css";
import translations from "../../translations";
import { weddingDate } from "../../eventConfig.js";

const IS_BEFORE_WEDDING = Date.now() < weddingDate.getTime();

export default function FullGallery() {
  // Aggiungi classe al body per nascondere il menu nella full gallery
  useEffect(() => {
    document.body.classList.add("full-gallery-page");
    return () => document.body.classList.remove("full-gallery-page");
  }, []);
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const t = translations[lang].photoGallery;
  const [photos, setPhotos] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [showToaster, setShowToaster] = useState(false);
  // Mostra toaster per eliminazione con successo
  useEffect(() => {
    if (showToaster) {
      const timer = setTimeout(() => {
        setShowToaster(false);
        setDeleteSuccess("");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [showToaster]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const videoRef = useRef(null);
  const videoControlsTimeoutRef = useRef(null);
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  // rimosso dateLocale inutilizzato
  // Forza sempre il formato dd/mm/yyyy
  const dateFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const isBeforeWedding = IS_BEFORE_WEDDING;
  const formatUploader = (name) => t.uploadedBy.replace("{name}", name);

  // Rileva cambio lingua da storage/evento custom
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setLang(newLang);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("languageChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageChange", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const photosQuery = query(
      collection(db, "weddingPhotos"),
      orderBy("uploadedAt", "desc"),
    );
    const unsubscribe = onSnapshot(photosQuery, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPhotos(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    sessionStorage.setItem("envelopeSeen", "1");
    sessionStorage.setItem("returnToSection", "galleria");
  }, []);

  // Autoplay video quando si apre il lightbox
  useEffect(() => {
    if (lightboxOpen && photos[lightboxIndex]?.type === "video" && videoRef.current) {
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

  useEffect(() => {
    if (!showDeleteModal) return;

    const scrollY = window.scrollY;
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.dataset.deleteModalScrollLockBehavior = scrollBehavior || "";
    document.body.dataset.deleteModalScrollLockY = String(scrollY);
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      const lockedY = parseInt(document.body.dataset.deleteModalScrollLockY || "0", 10);
      const lockedBehavior = document.body.dataset.deleteModalScrollLockBehavior || "";
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.dataset.deleteModalScrollLockY = "";
      document.body.dataset.deleteModalScrollLockBehavior = "";
      if (!Number.isNaN(lockedY)) {
        window.scrollTo(0, lockedY);
      }
      document.documentElement.style.scrollBehavior = lockedBehavior;
    };
  }, [showDeleteModal]);

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

  const handleDeleteModeClick = () => {
    setShowDeleteModal(true);
    setNameInput("");
    setDeleteError("");
  };

  const handleVerifyName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setDeleteError(lang === "it" ? "Inserisci un nome" : "Enter a name");
      return;
    }

    const hasPhotos = photos.some((p) => p.uploaderName?.trim() === trimmed);

    if (!hasPhotos) {
      setDeleteError(t.noPhotosToDelete);
      return;
    }

    setVerifiedName(trimmed);
    setDeleteMode(true);
    setShowDeleteModal(false);
    setDeleteError("");
  };

  const handleExitDeleteMode = () => {
    setDeleteMode(false);
    setVerifiedName("");
  };

  const handleDeletePhoto = (photo) => {
    setPhotoToDelete(photo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!photoToDelete) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "weddingPhotos", photoToDelete.id));

      // Delete from Storage
      if (photoToDelete.fileName) {
        const storageRef = ref(
          storage,
          `weddingPhotos/${photoToDelete.fileName}`,
        );
        await deleteObject(storageRef).catch(() => {
          // File might not exist, ignore
        });
      }

      const successMessage = photoToDelete.type === "video" ? t.videoDeleted : t.photoDeleted;
      setDeleteSuccess(successMessage);
      setShowToaster(true);
      setTimeout(() => setDeleteSuccess(""), 3000);
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(t.deleteError);
      setTimeout(() => setDeleteError(""), 3000);
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
    }
  };

  const userPhotos = deleteMode
    ? photos.filter((p) => p.uploaderName?.trim() === verifiedName.trim())
    : [];

  // Conta foto e video separatamente
  const photosToCount = deleteMode ? userPhotos : photos;
  const photoCount = photosToCount.filter(p => p.type !== "video").length;
  const videoCount = photosToCount.filter(p => p.type === "video").length;
  
  const getFileCountText = () => {
    const parts = [];
    
    if (photoCount > 0) {
      if (lang === "it") {
        parts.push(`${photoCount} ${photoCount === 1 ? "foto" : "foto"}`);
      } else {
        parts.push(`${photoCount} ${photoCount === 1 ? "photo" : "photos"}`);
      }
    }
    
    if (videoCount > 0) {
      parts.push(`${videoCount} video`);
    }
    
    return parts.length > 0 ? parts.join(", ") : (lang === "it" ? "Nessun file" : "No files");
  };

  return (
    <section id="photos" className="photo-gallery-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="gallery-preview mt-12">
          <div className="text-center mb-8" style={{ position: "relative" }}>
            <Link
              to="/"
              state={{ skipIntro: true, targetSection: "galleria" }}
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

            {!deleteMode && (
              <button
                type="button"
                onClick={handleDeleteModeClick}
                className="view-all-btn"
                style={{
                  position: "absolute",
                  right: "2rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.85rem",
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label={t.deleteButton}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}

            {deleteMode && (
              <button
                type="button"
                onClick={handleExitDeleteMode}
                style={{
                  position: "absolute",
                  right: "2rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.8rem",
                  width: "auto",
                  height: "36px",
                  padding: "0 0.85rem",
                  background: "#8A6E5D",
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(138, 110, 93, 0.2)",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-50%) translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(138, 110, 93, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(138, 110, 93, 0.2)";
                }}
              >
                {t.deleteModeExit}
              </button>
            )}

            <h3 className="font-script text-5xl md:text-5xl text-foreground mb-2">
              {deleteMode ? t.deleteButton : t.allPhotosTitle}
            </h3>
            {!deleteMode ? (
              <>
                <p className="text-base text-muted-foreground" style={{ marginBottom: '0' }}>
                  {t.subtitle}
                </p>
                <p className="text-sm text-muted-foreground opacity-75" style={{ margin: '0' }}>
                  {getFileCountText()}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getFileCountText()}
              </p>
            )}

            {/* Success Toaster */}
            {showToaster && (
              <div className="toaster-success">{deleteSuccess}</div>
            )}
            {deleteError && !showDeleteModal && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.5rem",
                }}
              >
                {deleteError}
              </p>
            )}
          </div>

          {(deleteMode ? userPhotos : photos).length > 0 ? (
            <div className="photo-gallery-grid">
              {(deleteMode ? userPhotos : photos).map((photo, index) => (
                <div key={photo.id} style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`photo-card${deleteMode ? " wiggle" : ""}`}
                    onClick={() => !deleteMode && openLightbox(index)}
                    style={{ cursor: deleteMode ? "default" : "pointer" }}
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
                        alt={formatUploader(photo.uploaderName)}
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

                  {deleteMode && (
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-5px",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: "#8A6E5D",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(138, 110, 93, 0.2)",
                        zIndex: 10,
                      }}
                      aria-label={t.deleteButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {deleteMode ? (
                <p className="text-muted-foreground font-body empty-gallery-message">
                  No photos
                </p>
              ) : (
                !isBeforeWedding && (
                  <p className="text-muted-foreground font-body empty-gallery-message">
                    {t.emptyGallery}
                  </p>
                )
              )}
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
                  {photos[lightboxIndex].type === "video" ? "🎥" : "📸"} <strong>
                    {photos[lightboxIndex].uploaderName}
                  </strong>
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
        </div>
      )}

      {showDeleteConfirm &&
        ReactDOM.createPortal(
          <div
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 2147483647 }}
          >
            <div
              className="gallery-modal__backdrop"
              onClick={() => setShowDeleteConfirm(false)}
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
                  {t.deletePhotoConfirm}
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  type="button"
                  className="rsvp-btn secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t.deletePhotoNo}
                </button>
                <button
                  type="button"
                  className="rsvp-btn primary"
                  onClick={confirmDelete}
                >
                  {t.deletePhotoYes}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showDeleteModal &&
        ReactDOM.createPortal(
          <div
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 2147483647 }}
          >
            <div
              className="gallery-modal__backdrop"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteError("");
              }}
            ></div>
            <div
              className="gallery-modal__content delete-modal-content"
              style={{ padding: "2rem" }}
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
                  {t.deleteModalTitle}
                </h3>
              </div>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                  {t.deleteModalPrompt}
                </p>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={lang === "it" ? "Il tuo nome" : "Your name"}
                  className="rsvp-input delete-modal-input"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    textAlign: "center",
                    borderRadius: "14px",
                    height: "38px",
                    fontSize: "16px",
                    background: "#fffaf4",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    color: "#3a2f28",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyName();
                  }}
                />
                {deleteError && (
                  <p
                    className="delete-error-message"
                    style={{
                      color: "#dc2626",
                      marginTop: "0.5rem",
                    }}
                  >
                    {deleteError}
                  </p>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  className="rsvp-btn secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError("");
                  }}
                >
                  {t.deleteModalCancel}
                </button>
                <button
                  type="button"
                  className="rsvp-btn primary"
                  onClick={handleVerifyName}
                >
                  {t.deleteModalConfirm}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
