import React, { useMemo, useState } from "react";
import "./RSVP.css";
import translations from "../../translations";
import { GUEST_GROUPS } from "./guestList";

export default function RSVP({ lang = "it" }) {
  const t = translations[lang];
  //  Gruppi invitati (match ESATTO)
  // - members: nomi esatti che l’utente può inserire
  const groups = useMemo(() => GUEST_GROUPS, []);

  const API_URL =
    "https://script.google.com/macros/s/AKfycbzqKuqjoWX4L_w3zwXKCLqIKufzsuQ2-BW70peOvejR1KuesmXbLSc-wwD-0NlcLEiu/exec";

  // (Facoltativo) info evento da mostrare nelle card
  const eventInfo = useMemo(
    () => ({
      ceremonyTitle:
        lang === "it" ? "Cerimonia in Chiesa" : "Ceremony in Church",
      ceremonyPlace:
        lang === "it" ? "Chiesa di Santa Cecilia" : "Church of Santa Cecilia",
      ceremonyTime: "16:30",
      receptionTitle: lang === "it" ? "Ricevimento" : "Reception at Location",
      receptionPlace: lang === "it" ? "Villa dei Consoli" : "Villa dei Consoli",
      receptionTime: "18:30",
    }),
    [lang],
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
    "text-sm text-[#6F5648] hover:text-[#5A473B] underline underline-offset-4 decoration-[#8A6E5D] hover:decoration-[#6F5648] transition-colors font-body btn disabled:opacity-50 disabled:pointer-events-none";

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
    const inputLower = inputName.trim().toLowerCase();
    const inputWords = inputLower.split(/\s+/).filter((w) => w.length > 0);

    return (
      groups.find((g) =>
        g.members.some((member) => {
          const memberLower = member.toLowerCase();
          const memberWords = memberLower.split(/\s+/);

          // Controlla se tutte le parole dell'input sono presenti nel nome del membro
          return inputWords.every((inputWord) =>
            memberWords.some((memberWord) => memberWord.includes(inputWord)),
          );
        }),
      ) || null
    );
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
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  }

  function isCompleteAll() {
    return responses.every(
      (r) =>
        (r.ceremony === "Si" || r.ceremony === "No") &&
        (r.reception === "Si" || r.reception === "No"),
    );
  }

  function completedCount() {
    return responses.filter(
      (r) =>
        (r.ceremony === "Si" || r.ceremony === "No") &&
        (r.reception === "Si" || r.reception === "No"),
    ).length;
  }

  // --- step handlers ---
  function checkName(e) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.rsvpForm.errors.enterName);
      return;
    }

    const inputWords = trimmed
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    // Richiedi almeno 2 parole (nome + cognome o nome + secondo nome)
    if (inputWords.length < 2) {
      setError(t.rsvpForm.errors.nameNotFound);
      return;
    }

    const g = findGroupByName(trimmed);
    if (!g) {
      setError(t.rsvpForm.errors.nameNotFound);
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
          : "Please complete Ceremony and Reception for everyone in the group.",
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
      setError(t.rsvpForm.errors.sendError);
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
        <h2 className="font-script rsvp-title">{t.rsvpForm.formTitle}</h2>
      </div>

      {/* STEP 1: NAME */}
      {step === "name" && (
        <form onSubmit={checkName} className="space-y-6" noValidate>
          <div className="flex flex-col items-center">
            <label className={`${labelCls} text-center`} htmlFor="name">
              {t.rsvpForm.nameLabel}
            </label>

            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputCls} text-center rsvp-input`}
              autoComplete="name"
              style={{ borderRadius: "14px", maxWidth: "420px", width: "100%" }}
            />

            {error && <p className="rsvp-error">{error}</p>}
          </div>

          <div className="flex justify-center">
            <button
              className="rsvp-btn primary rsvp-btn--single"
              type="submit"
              disabled={sending}
            >
              {t.rsvpForm.continue}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CONFIRM GROUP */}
      {step === "confirmGroup" && matchedGroup && (
        <div
          className="confirm-group"
          style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          <h3 className="confirm-group__title">
            {t.rsvpForm.greeting} {name.trim()}!
          </h3>

          <p className="confirm-group__text">{t.rsvpForm.groupQuestion}</p>

          <div className="confirm-group__box">
            {matchedGroup.label.split(",").map((member, idx) => (
              <div key={idx} className="confirm-group__member">
                {member.trim()}
              </div>
            ))}
          </div>

          <div className="rsvp-actions confirm right">
            <button
              type="button"
              className="rsvp-btn secondary"
              onClick={confirmGroupNo}
              disabled={sending}
            >
              {t.rsvpForm.no}
            </button>

            <button
              type="button"
              className="rsvp-btn primary"
              onClick={confirmGroupYes}
              disabled={sending}
            >
              {t.rsvpForm.yes}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RSVP GROUP (accordion) */}
      {step === "rsvpGroup" && matchedGroup && (
        <form onSubmit={submitGroup} className="space-y-6" noValidate>
          <div className="space-y-1">
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
                        {done ? t.rsvpForm.complete : t.rsvpForm.toComplete}
                      </div>
                    </div>

                    <div className="rsvp-person__chev" aria-hidden="true">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          transition: 'transform 0.2s',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      >
                        <polyline
                          points="6 9 12 15 18 9"
                          stroke="#444"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
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
                            <option value="">{t.rsvpForm.select}</option>
                            <option value="Si">{t.rsvpForm.yes}</option>
                            <option value="No">{t.rsvpForm.no}</option>
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
                            <option value="">{t.rsvpForm.select}</option>
                            <option value="Si">{t.rsvpForm.yes}</option>
                            <option value="No">{t.rsvpForm.no}</option>
                          </select>
                        </div>
                      </div>

                      {/* Preferenze alimentari */}
                      <div className="rsvp-food">
                        <div className="rsvp-food__label">
                          {t.rsvpForm.foodLabel}
                        </div>

                        <textarea
                          value={r.food}
                          onChange={(e) =>
                            updateResponse(idx, "food", e.target.value)
                          }
                          className="rsvp-textarea"
                          rows={3}
                          placeholder={t.rsvpForm.foodPlaceholder}
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
                            {t.rsvpForm.prev}
                          </button>
                        )}

                        {idx < responses.length - 1 && (
                          <button
                            type="button"
                            className="rsvp-linkbtn"
                            onClick={() => setOpenIdx(idx + 1)}
                          >
                            {t.rsvpForm.next}
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
              {t.rsvpForm.back}
            </button>

            <button
              className="rsvp-btn primary"
              type="submit"
              disabled={sending}
            >
              {sending ? t.rsvpForm.sending : t.rsvpForm.send}
            </button>
          </div>
        </form>
      )}

      {/* SENDING */}
      {step === "sending" && (
        <div className="space-y-4 text-center">
          <h3 className="text-lg text-foreground font-medium">
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
          <h3 className="text-lg text-foreground font-medium">
            {t.rsvpForm.thankYou}
          </h3>

          <p className="text-sm text-muted-foreground">
            {t.rsvpForm.responseRecorded}
          </p>

          <button className={linkBtn} type="button" onClick={resetAll}>
            {t.rsvpForm.sendAnother}
          </button>
        </div>
      )}
    </div>
  );
}
