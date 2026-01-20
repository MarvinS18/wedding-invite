import React, { useMemo, useState } from "react";
import "./RSVP.css";

export default function RSVP({ lang = "it", t }) {
  //  Gruppi invitati (match ESATTO)
  // - members: nomi esatti che l’utente può inserire
  const groups = useMemo(
    () => [
      {
        label: "Marvin Samiano, Vanessa Joy Palacio",
        members: ["Marvin Samiano", "Vanessa Palacio"],
      },
      { label: "Reichelle, Karl", members: ["Reichelle", "Karl"] },
      { label: "Melki, Gizelle", members: ["Melki", "Gizelle"] },

      {
        label: "Palacio Family",
        members: ["Noa", "Eva", "Igor", "Diego", "Luna"],
      },
    ],
    []
  );

  const API_URL =
    "https://script.google.com/macros/s/AKfycbzqKuqjoWX4L_w3zwXKCLqIKufzsuQ2-BW70peOvejR1KuesmXbLSc-wwD-0NlcLEiu/exec";

  // (Facoltativo) info evento da mostrare nelle card
  const eventInfo = useMemo(
    () => ({
      ceremonyTitle: "Cerimonia in Chiesa",
      ceremonyPlace: "Chiesa di Santa Cecilia",
      ceremonyTime: "16:30",
      receptionTitle: "Ricevimento in Location",
      receptionPlace: "Villa dei Consoli",
      receptionTime: "18:30",
    }),
    []
  );

  // step: name | confirmGroup | rsvpGroup | sending | done
  const [step, setStep] = useState("name");
  const [name, setName] = useState("");
  const [matchedGroup, setMatchedGroup] = useState(null); // { label, members }
  const [responses, setResponses] = useState([]); // per persona

  const [openIdx, setOpenIdx] = useState(0); // accordion: persona aperta
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // --- styles ---
  const linkBtn =
    "text-sm text-[#7c4a1e] hover:text-[#4e2c0c] underline underline-offset-4 decoration-[#b97d6a] hover:decoration-[#7c4a1e] transition-colors font-body btn disabled:opacity-50 disabled:pointer-events-none";

  const labelCls = "text-sm leading-none text-foreground font-medium";
  const inputCls =
    "flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary";

  const cardCls =
    "bg-card/90 backdrop-blur-sm border border-border rounded-lg p-8 space-y-6 shadow-soft";

  // --- helpers ---
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function findGroupByName(inputName) {
    const trimmed = inputName.trim();
    return groups.find((g) => g.members.includes(trimmed)) || null;
  }

  function normalizeKey(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .replace(/[^\w\s-]/g, "");
  }

  function makeGroupKey(members) {
    const arr = (members || []).map((x) => normalizeKey(x)).sort();
    return arr.join("|");
  }

  function updateResponse(idx, field, value) {
    setResponses((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  }

  function isCompleteAll() {
    return responses.every(
      (r) =>
        (r.ceremony === "Si" || r.ceremony === "No") &&
        (r.reception === "Si" || r.reception === "No")
    );
  }

  function completedCount() {
    return responses.filter(
      (r) =>
        (r.ceremony === "Si" || r.ceremony === "No") &&
        (r.reception === "Si" || r.reception === "No")
    ).length;
  }

  // --- step handlers ---
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

    const g = findGroupByName(trimmed);
    if (!g) {
      setError(
        lang === "it"
          ? "Nome non presente nella lista invitati. Controlla che sia identico all’invito."
          : "Name not found in the guest list. Please check it matches the invitation."
      );
      return;
    }

    setMatchedGroup(g);
    setStep("confirmGroup");
  }

  function confirmGroupYes() {
    setError("");

    const initial = (matchedGroup?.members || []).map((person) => ({
      name: person,
      ceremony: "",
      reception: "",
      food: "",
    }));

    setResponses(initial);
    setOpenIdx(0);
    setStep("rsvpGroup");
  }

  function confirmGroupNo() {
    resetAll();
  }

  async function submitGroup(e) {
    e.preventDefault();
    setError("");

    if (!isCompleteAll()) {
      setError(
        lang === "it"
          ? "Compila Cerimonia e Ricevimento per tutti i membri del gruppo."
          : "Please complete Ceremony and Reception for everyone in the group."
      );
      return;
    }

    setSending(true);
    setStep("sending");
    const startedAt = Date.now();

    try {
      const members = matchedGroup?.members || [];
      const groupKey = makeGroupKey(members);
      const groupLabel = matchedGroup?.label || members.join(" + ");

      const payload = {
        groupKey,
        groupLabel,
        submittedBy: name.trim(),
        responses: responses.map((r) => ({
          name: r.name,
          ceremony: r.ceremony,
          reception: r.reception,
          foodPreferences: (r.food || "").trim(),
        })),
        ts: new Date().toISOString(),
      };

      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const elapsed = Date.now() - startedAt;
      if (elapsed < 1500) await sleep(1500 - elapsed);

      setStep("done");
    } catch (err) {
      console.error(err);
      setError(
        lang === "it"
          ? "Errore durante l’invio. Controlla la connessione e riprova."
          : "Error while sending. Check your connection and try again."
      );
      setStep("rsvpGroup");
    } finally {
      setSending(false);
    }
  }

  function resetAll() {
    setStep("name");
    setName("");
    setMatchedGroup(null);
    setResponses([]);
    setOpenIdx(0);
    setError("");
    setSending(false);
  }

  // --- UI ---
  return (
    <div className={`rsvp ${cardCls}`}>
      {/* Titolo */}
      <div className="text-center">
        <h2 className="font-script rsvp-title">Conferma la tua presenza</h2>
        {t?.rsvp?.deadline && (
          <p className="text-muted-foreground font-body tracking-wide">
            {t.rsvp.deadline}
          </p>
        )}
      </div>

      {/* STEP 1: NAME */}
      {step === "name" && (
        <form onSubmit={checkName} className="space-y-6" noValidate>
          <div className="flex flex-col items-center">
            <label className={`${labelCls} text-center`} htmlFor="name">
              {lang === "it"
                ? "Inserisci nome e cognome"
                : "Name and Surname *"}
            </label>

            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputCls} text-center`}
              autoComplete="name"
              style={{ borderRadius: "14px" }}
            />

            {error && (
              <p className="mt-2 text-[12px] text-[#b97d6a] text-center">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="rsvp-btn primary rsvp-btn--single"
              type="submit"
              disabled={sending}
            >
              {lang === "it" ? "Continua" : "Continue"}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CONFIRM GROUP */}
      {step === "confirmGroup" && matchedGroup && (
        <div className="confirm-group">
          <h3 className="confirm-group__title">
            {lang === "it" ? `Ciao ${name.trim()}!` : "Hi"}
          </h3>

          <p className="confirm-group__text">
            Fai parte di questo gruppo: {matchedGroup.label}
          </p>

          <div className="rsvp-actions confirm right">
            <button
              type="button"
              className="rsvp-btn secondary"
              onClick={confirmGroupNo}
              disabled={sending}
            >
              No
            </button>

            <button
              type="button"
              className="rsvp-btn primary"
              onClick={confirmGroupYes}
              disabled={sending}
            >
              Sì
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RSVP GROUP (accordion) */}
      {step === "rsvpGroup" && matchedGroup && (
        <form onSubmit={submitGroup} className="space-y-6" noValidate>
          <div className="space-y-1">
            {/* <h3 className="text-xl text-foreground font-medium">
              {lang === "it"
                ? `Ciao ${name.trim()} 👋`
                : `Hi ${name.trim()} 👋`}
            </h3> */}
            {/* <p className="text-sm text-muted-foreground">
              {lang === "it" ? "Gruppo:" : "Group:"}{" "}
              <strong className="text-foreground">{matchedGroup.label}</strong>
            </p> */}

            <p className="text-xs text-muted-foreground mt-2">
              {lang === "it"
                ? `Completati: ${completedCount()}/${responses.length}`
                : `Completed: ${completedCount()}/${responses.length}`}
            </p>
          </div>

          {/* Accordion persone */}
          <div className="rsvp-acc">
            {responses.map((r, idx) => {
              const isOpen = openIdx === idx;
              const done =
                (r.ceremony === "Si" || r.ceremony === "No") &&
                (r.reception === "Si" || r.reception === "No");

              return (
                <div
                  key={r.name}
                  className={`rsvp-person ${isOpen ? "is-open" : ""}`}
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                    className="rsvp-person__head"
                  >
                    <div className="rsvp-person__headLeft">
                      <div className="rsvp-person__name font-script">
                        {r.name}
                      </div>
                      <div
                        className={`rsvp-person__status ${
                          done ? "ok" : "todo"
                        }`}
                      >
                        {done
                          ? lang === "it"
                            ? "✅ Completo"
                            : "✅ Complete"
                          : lang === "it"
                          ? "⏳ Da completare"
                          : "⏳ To complete"}
                      </div>
                    </div>

                    <div className="rsvp-person__chev" aria-hidden="true">
                      {isOpen ? "▲" : "▼"}
                    </div>
                  </button>

                  {/* Body */}
                  {isOpen && (
                    <div className="rsvp-person__body">
                      {/* Cerimonia */}
                      <div className="rsvp-row">
                        <div className="rsvp-row__info">
                          <div className="rsvp-row__title">
                            {eventInfo.ceremonyTitle}
                          </div>
                          <div className="rsvp-row__meta">
                            📍 {eventInfo.ceremonyPlace}
                          </div>
                          <div className="rsvp-row__meta">
                            🕒 {eventInfo.ceremonyTime}
                          </div>
                        </div>

                        <div className="rsvp-row__action">
                          <select
                            value={r.ceremony}
                            onChange={(e) =>
                              updateResponse(idx, "ceremony", e.target.value)
                            }
                            className="rsvp-select"
                            required
                          >
                            <option value="">
                              {lang === "it" ? "Seleziona" : "Select"}
                            </option>
                            <option value="Si">
                              {lang === "it" ? "Sì" : "Yes"}
                            </option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>

                      {/* Ricevimento */}
                      <div className="rsvp-row">
                        <div className="rsvp-row__info">
                          <div className="rsvp-row__title">
                            {eventInfo.receptionTitle}
                          </div>
                          <div className="rsvp-row__meta">
                            📍 {eventInfo.receptionPlace}
                          </div>
                          <div className="rsvp-row__meta">
                            🕒 {eventInfo.receptionTime}
                          </div>
                        </div>

                        <div className="rsvp-row__action">
                          <select
                            value={r.reception}
                            onChange={(e) =>
                              updateResponse(idx, "reception", e.target.value)
                            }
                            className="rsvp-select"
                            required
                          >
                            <option value="">
                              {lang === "it" ? "Seleziona" : "Select"}
                            </option>
                            <option value="Si">
                              {lang === "it" ? "Sì" : "Yes"}
                            </option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>

                      {/* Preferenze alimentari */}
                      <div className="rsvp-food">
                        <div className="rsvp-food__label">
                          {lang === "it"
                            ? "Segnalate qui eventuali esigenze alimentari:"
                            : "Dietary requirements (allergies/intolerances):"}
                        </div>

                        <textarea
                          value={r.food}
                          onChange={(e) =>
                            updateResponse(idx, "food", e.target.value)
                          }
                          className="rsvp-textarea"
                          rows={3}
                          placeholder={
                            lang === "it"
                              ? "Allergie, intolleranze o regimi alimentari specifici (es. celiachia, vegetariano, vegano...)"
                              : "Allergies, intolerances or dietary preferences (e.g., gluten-free, vegetarian, vegan...)"
                          }
                        />
                      </div>

                      {/* Navigazione rapida */}
                      <div className="rsvp-nav">
                        {idx > 0 && (
                          <button
                            type="button"
                            className="rsvp-linkbtn"
                            onClick={() => setOpenIdx(idx - 1)}
                          >
                            {lang === "it" ? "← Precedente" : "← Prev"}
                          </button>
                        )}

                        {idx < responses.length - 1 && (
                          <button
                            type="button"
                            className="rsvp-linkbtn"
                            onClick={() => setOpenIdx(idx + 1)}
                          >
                            {lang === "it" ? "Successivo →" : "Next →"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rsvp-actions">
            <button
              type="button"
              className="rsvp-btn secondary"
              disabled={sending}
              onClick={() => {
                setStep("confirmGroup");
                setError("");
              }}
            >
              {lang === "it" ? "Indietro" : "Back"}
            </button>

            <button
              className="rsvp-btn primary"
              type="submit"
              disabled={sending}
            >
              {sending
                ? lang === "it"
                  ? "Invio..."
                  : "Sending..."
                : lang === "it"
                ? "Invia RSVP"
                : "Send RSVP"}
            </button>
          </div>
        </form>
      )}

      {/* SENDING */}
      {step === "sending" && (
        <div className="space-y-4 text-center">
          <h3 className="text-2xl text-foreground font-medium">
            {lang === "it" ? "Ricevuto" : "Received"}
          </h3>

          <p className="text-sm text-muted-foreground">
            {lang === "it"
              ? "Stiamo inviando la tua risposta…"
              : "We’re sending your response…"}
          </p>

          <div className="flex justify-center pt-2">
            <div className="h-5 w-5 rounded-full border-2 border-border border-t-transparent animate-spin" />
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            {lang === "it"
              ? "Non chiudere questa pagina."
              : "Please don’t close this page."}
          </p>
        </div>
      )}

      {/* DONE */}
      {step === "done" && (
        <div className="space-y-4 text-center">
          <h3 className="text-2xl text-foreground font-medium">
            {lang === "it" ? "Grazie! 💌" : "Thank you! 💌"}
          </h3>

          <p className="text-sm text-muted-foreground">
            {lang === "it"
              ? "La tua risposta è stata registrata."
              : "Your response has been recorded."}
          </p>

          <button className={linkBtn} type="button" onClick={resetAll}>
            {lang === "it"
              ? "Invia un’altra risposta"
              : "Send another response"}
          </button>
        </div>
      )}
    </div>
  );
}
