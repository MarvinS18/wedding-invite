import React, { useState, useEffect } from "react";
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

export default function PhotoGallery() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploaderName, setUploaderName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Carica le foto da Firestore al montaggio
  useEffect(() => {
    const photosQuery = query(
      collection(db, "weddingPhotos"),
      orderBy("uploadedAt", "desc")
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validazioni
      if (!selectedFile.type.startsWith("image/")) {
        setError("Per favore seleziona un file immagine");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Il file è troppo grande (max 10 MB)");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !uploaderName.trim()) {
      setError("Inserisci il tuo nome e seleziona una foto");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Upload file a Firebase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `weddingPhotos/${fileName}`);
      await uploadBytes(storageRef, file);

      // Ottieni URL pubblico
      const downloadURL = await getDownloadURL(storageRef);

      // Salva metadata in Firestore
      await addDoc(collection(db, "weddingPhotos"), {
        url: downloadURL,
        uploaderName: uploaderName.trim(),
        uploadedAt: new Date(),
        fileName: file.name,
      });

      setSuccess("Foto caricata con successo! 🎉");
      setFile(null);
      setUploaderName("");
      document.getElementById("fileInput").value = "";
    } catch (err) {
      console.error("Errore upload:", err);
      setError("Errore nel caricamento. Riprova più tardi.");
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

  return (
    <section id="photos" className="photo-gallery-section">
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
            Condividi i tuoi scatti
          </h2>
          <p className="text-base text-muted-foreground font-body leading-relaxed">
            Carica le tue foto del matrimonio e crea una galleria condivisa con
            tutti gli ospiti!
          </p>
        </div>

        {/* Compact Upload Bar */}
        <div className="compact-upload-bar">
          <div className="upload-bar-content">
            <form onSubmit={handleUpload} className="upload-bar-form">
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="Il tuo nome"
                className="upload-input upload-input-name"
              />

              <label className="upload-file-label">
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="upload-file-input"
                />
                <span className="upload-file-btn">
                  {file ? "✓ Foto" : "📷 Scegli"}
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="upload-submit-btn"
              >
                {loading ? "..." : "Carica"}
              </button>
            </form>

            <div className="upload-stats">
              <span className="upload-stats-number">{photos.length}</span>
              <span className="upload-stats-text">foto</span>
            </div>
          </div>

          {error && <p className="upload-message upload-error">{error}</p>}
          {success && (
            <p className="upload-message upload-success">{success}</p>
          )}
        </div>

        {/* Galleria */}
        <div className="gallery-preview mt-20">
          <div className="text-center mb-8">
            <h3 className="font-script text-4xl md:text-5xl text-foreground mb-2">
              Galleria
            </h3>
            <p className="text-sm text-muted-foreground">
              I vostri momenti speciali
            </p>
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
                        {photo.uploadedAt
                          ?.toDate?.()
                          .toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {photos.length > 8 && (
                <div className="text-center mt-6">
                  <Link className="view-all-btn" to="/gallery">
                    Visualizza tutte le foto
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body">
                Ancora nessuna foto. Sii il primo a condividere! 📸
              </p>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
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
