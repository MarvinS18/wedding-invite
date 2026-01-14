import React, { useMemo, useState } from "react";
import "./Rsvp.css";

export default function Rsvp({ lang, t }) {
  // ✅ Gruppi invitati (match ESATTO)
  const groups = useMemo(
    () => [
      ["Mario Rossi"],
      ["Marvin Samiano", "Vanessa Palacio"],
      ["Reichelle", "Karl"],
      ["Melki", "Gizelle"],
    ],
    []
  );

  // ✅ Google Form config (TUO FORM)
  const FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfWTxwfRCPVT0Av-nC_ncGCCePI7H6f63jlyflV93ubecdVBw/formResponse";

  const ENTRY_NAME = "entry.700099219";        // Nome e Cognome
  const ENTRY_ATTENDING = "entry.1743725405";  // Sarai presente?  (Si/No)
  const ENTRY_FOOD = "entry.587703229";        // Preferenze alimentari (testo)

  const [step, setStep] = useState("name"); // name | confirmGroup | attending | food | done
  const [name, setName] = useState("");
  const [group, setGroup] = useState([]); // gruppo trovato (array di nomi)

  const [attending, setAttending] = useState(""); // "Si" | "No"
  const [food, setFood] = useState(""); // testo libero
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function findGroupByName(inputName) {
    const trimmed = inputName.trim();
    return groups.find((g) => g.includes(trimmed)) || null;
  }

  async function sendToGoogleForm({ nameValue, attendingValue, foodValue }) {
    setSending(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append(ENTRY_NAME, nameValue.trim());
      fd.append(ENTRY_ATTENDING, attendingValue); // "Si" | "No"
      fd.append(ENTRY_FOOD, foodValue || "");     // testo libero o vuoto

      await fetch(FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        body: fd,
      });

      setStep("done");
    } catch (err) {
      console.error(err);
      setError(
        lang === "it"
          ? "Errore durante l’invio. Riprova."
          : "Error while sending. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  function checkName(e) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError(
        lang === "it"
          ? "Inserisci nome e cognome."
          : "Please enter name and surname."
      );
      return;
    }

    const matchedGroup = findGroupByName(trimmed);
    if (!matchedGroup) {
      setError(
        lang === "it"
          ? "Nome non presente nella lista invitati. Controlla che sia identico all’invito."
          : "Name not found in the guest list. Please check it matches the invitation."
      );
      return;
    }

    setGroup(matchedGroup);
    setStep("confirmGroup");
  }

  function confirmGroupYes() {
    setError("");
    setStep("attending");
  }

  function confirmGroupNo() {
    setError("");
    setGroup([]);
    setName("");
    setAttending("");
    setFood("");
    setStep("name");
  }

  // ✅ QUI LA MODIFICA: se "No" invia subito e salta food
  async function checkAttending(e) {
    e.preventDefault();
    setError("");

    if (!attending) {
      setError(lang === "it" ? "Seleziona Si o No." : "Select Yes or No.");
      return;
    }

    if (attending === "No") {
      // invio immediato con food vuoto
      await sendToGoogleForm({
        nameValue: name,
        attendingValue: attending,
        foodValue: "",
      });
      return;
    }

    // se "Si" allora chiedi preferenze alimentari
    setStep("food");
  }

  async function submitAll(e) {
    e.preventDefault();
    setError("");

    // qui puoi anche lasciare food vuoto, va bene comunque
    await sendToGoogleForm({
      nameValue: name,
      attendingValue: attending,
      foodValue: food,
    });
  }

  function resetAll() {
    setStep("name");
    setName("");
    setGroup([]);
    setAttending("");
    setFood("");
    setError("");
    setSending(false);
  }

  return (
    <div className="card fade-in-on-scroll rsvp-card">
      <h2 className="section-title">{t?.rsvp?.title ?? "RSVP"}</h2>
      {t?.rsvp?.deadline && (
        <div className="small rsvp-deadline">{t.rsvp.deadline}</div>
      )}

      {/* STEP 1: NAME */}
      {step === "name" && (
        <form onSubmit={checkName} className="rsvp-form" noValidate>
          <p className="small">
            {lang === "it"
              ? "Inserisci il nome esattamente come sull’invito."
              : "Enter your name exactly as on the invitation."}
          </p>

          <label className="rsvp-label">
            {lang === "it" ? "Inserisci Nome e Cognome" : "Name and Surname"}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder={lang === "it" ? "Es. Mario Rossi" : "e.g. Mario Rossi"}
            />
          </label>

          {error && <div className="rsvp-error">{error}</div>}

          <button className="btn" type="submit">
            {lang === "it" ? "Continua" : "Continue"}
          </button>
        </form>
      )}

      {/* STEP 2: CONFIRM GROUP (solo controllo React) */}
      {step === "confirmGroup" && (
        <div className="rsvp-form">
          <h3 className="rsvp-hello">{lang === "it" ? "Ciao 👋" : "Hi 👋"}</h3>

          <p className="small">
            {lang === "it" ? "Sei nel gruppo" : "Are you in the group"}{" "}
            <strong>{group.join(" + ")}</strong>?
          </p>

          <div className="rsvp-actions">
            <button className="btn" type="button" onClick={confirmGroupYes}>
              {lang === "it" ? "Sì" : "Yes"}
            </button>
            <button className="btn ghost" type="button" onClick={confirmGroupNo}>
              {lang === "it" ? "No" : "No"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ATTENDING */}
      {step === "attending" && (
        <form onSubmit={checkAttending} className="rsvp-form" noValidate>
          <h3 className="rsvp-hello">
            {lang === "it" ? `Ciao ${name.trim()} 👋` : `Hi ${name.trim()} 👋`}
          </h3>

          <div className="small">
            {lang === "it" ? "Gruppo:" : "Group:"}{" "}
            <strong>{group.join(" + ")}</strong>
          </div>

          <p className="small">
            {lang === "it" ? "Sarai presente?" : "Will you attend?"}
          </p>

          <div className="rsvp-radio-group">
            <label className="rsvp-radio">
              <input
                type="radio"
                name="attending"
                value="Si"
                checked={attending === "Si"}
                onChange={(e) => setAttending(e.target.value)}
              />
              <span>{lang === "it" ? "Si" : "Yes"}</span>
            </label>

            <label className="rsvp-radio">
              <input
                type="radio"
                name="attending"
                value="No"
                checked={attending === "No"}
                onChange={(e) => setAttending(e.target.value)}
              />
              <span>No</span>
            </label>
          </div>

          {error && <div className="rsvp-error">{error}</div>}

          <div className="rsvp-actions">
            <button
              type="button"
              className="btn ghost"
              disabled={sending}
              onClick={() => {
                setStep("confirmGroup");
                setAttending("");
                setError("");
              }}
            >
              {lang === "it" ? "Indietro" : "Back"}
            </button>

            <button className="btn" type="submit" disabled={sending}>
              {sending
                ? lang === "it"
                  ? "Invio..."
                  : "Sending..."
                : lang === "it"
                ? "Continua"
                : "Continue"}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: FOOD (solo se attending === "Si") */}
      {step === "food" && (
        <form onSubmit={submitAll} className="rsvp-form" noValidate>
          <p className="small">
            {lang === "it"
              ? "Quali sono le tue preferenze alimentari?"
              : "What are your food preferences?"}
          </p>

          <label className="rsvp-label">
            {lang === "it" ? "Preferenze alimentari" : "Food preferences"}
            <input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="input"
              placeholder={
                lang === "it"
                  ? "Es. Vegetariana, senza glutine..."
                  : "e.g. Vegetarian, gluten-free..."
              }
            />
          </label>

          {error && <div className="rsvp-error">{error}</div>}

          <div className="rsvp-actions">
            <button
              type="button"
              className="btn ghost"
              disabled={sending}
              onClick={() => {
                setStep("attending");
                setError("");
              }}
            >
              {lang === "it" ? "Indietro" : "Back"}
            </button>

            <button className="btn" type="submit" disabled={sending}>
              {sending
                ? lang === "it"
                  ? "Invio..."
                  : "Sending..."
                : lang === "it"
                ? "Invia"
                : "Send"}
            </button>
          </div>
        </form>
      )}

      {/* DONE */}
      {step === "done" && (
        <div className="rsvp-form">
          <h3 className="rsvp-hello">
            {lang === "it" ? "Grazie! 💌" : "Thank you! 💌"}
          </h3>
          <p className="small">
            {lang === "it"
              ? "La tua risposta è stata registrata."
              : "Your response has been recorded."}
          </p>

          <button className="btn ghost" type="button" onClick={resetAll}>
            {lang === "it" ? "Invia un’altra risposta" : "Send another response"}
          </button>
        </div>
      )}
    </div>
  );
}
