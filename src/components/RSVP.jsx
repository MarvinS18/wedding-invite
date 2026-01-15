import React, { useMemo, useState } from "react";

export default function RsvpInline({ lang = "it", t }) {
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

  const ENTRY_NAME = "entry.700099219"; // Nome e Cognome (risposta breve)
  const ENTRY_ATTENDING = "entry.1743725405"; // Sarai presente? (Si/No)
  const ENTRY_FOOD = "entry.587703229"; // Allergie e intolleranze (checkbox)
  const ENTRY_ALTRO = "entry.759350124"; // Altre allergie o restrizioni (risposta breve)

  // ✅ opzioni checkbox (DEVONO combaciare con il testo nel Google Form)
  const FOOD_OPTIONS = useMemo(
    () => [
      "Senza glutine / Celiaco",
      "Vegetariano",
      "Senza lattosio",
      "Vegano",
      "Allergia ai frutti secchi",
      "Allergia ai crostacei",
    ],
    []
  );

  const [step, setStep] = useState("name"); // name | confirmGroup | attending | food | done
  const [name, setName] = useState("");
  const [group, setGroup] = useState([]);

  const [attending, setAttending] = useState(""); // "Si" | "No"
  const [food, setFood] = useState([]); // ✅ array (checkbox)
  const [altro, setAltro] = useState(""); // risposta breve
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function findGroupByName(inputName) {
    const trimmed = inputName.trim();
    return groups.find((g) => g.includes(trimmed)) || null;
  }

  function toggleFood(option) {
    setFood((prev) =>
      prev.includes(option)
        ? prev.filter((x) => x !== option)
        : [...prev, option]
    );
  }

  async function sendToGoogleForm({
    nameValue,
    attendingValue,
    foodValues,
    altroValue,
  }) {
    setSending(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append(ENTRY_NAME, nameValue.trim());
      fd.append(ENTRY_ATTENDING, attendingValue);

      // ✅ Checkbox: va inviato 1 valore per ogni opzione selezionata
      (foodValues || []).forEach((opt) => {
        fd.append(ENTRY_FOOD, opt);
      });

      fd.append(ENTRY_ALTRO, altroValue || "");

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
    setFood([]);
    setAltro("");
    setStep("name");
  }

  // ✅ se "No" invia subito e salta food
  async function checkAttending(e) {
    e.preventDefault();
    setError("");

    if (!attending) {
      setError(lang === "it" ? "Seleziona Si o No." : "Select Yes or No.");
      return;
    }

    if (attending === "No") {
      await sendToGoogleForm({
        nameValue: name,
        attendingValue: attending,
        foodValues: [],
        altroValue: "",
      });
      return;
    }

    setStep("food");
  }

  async function submitAll(e) {
    e.preventDefault();
    setError("");

    await sendToGoogleForm({
      nameValue: name,
      attendingValue: attending,
      foodValues: food,
      altroValue: altro,
    });
  }

  function resetAll() {
    setStep("name");
    setName("");
    setGroup([]);
    setAttending("");
    setFood([]);
    setAltro("");
    setError("");
    setSending(false);
  }

  // ✅ stile bottoni identico a "Rispondi/Nascondi"
  const linkBtn =
    "text-sm text-[#7c4a1e] hover:text-[#4e2c0c] underline underline-offset-4 decoration-[#b97d6a] hover:decoration-[#7c4a1e] transition-colors font-body btn disabled:opacity-50 disabled:pointer-events-none";

  const labelCls = "text-sm leading-none text-foreground font-medium";
  const inputCls =
    "flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary";

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-sm p-8 space-y-6 shadow-soft">
      {/* Titolo */}
      <div className="text-center">
        <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
          {t?.rsvp?.title ?? "Conferma la tua presenza"}
        </h2>
        {t?.rsvp?.deadline && (
          <p className="text-muted-foreground font-body tracking-wide">
            {t.rsvp.deadline}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      )}

      {/* STEP 1: NAME */}
      {step === "name" && (
        <form onSubmit={checkName} className="space-y-6" noValidate>
          <div>
            <label className={labelCls} htmlFor="name">
              {lang === "it" ? "Nome e cognome *" : "Name and Surname *"}
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder={
                lang === "it"
                  ? "Inserisci nome e cognome"
                  : "Enter name and surname"
              }
              autoComplete="name"
              style={{ borderRadius: "14px" }}
            />
          </div>

          <div className="flex justify-center">
            <button className={linkBtn} type="submit" disabled={sending}>
              {lang === "it" ? "Continua" : "Continue"}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CONFIRM GROUP */}
      {step === "confirmGroup" && (
        <div className="space-y-6">
          <h3 className="text-xl text-foreground font-medium">
            {lang === "it" ? "Ciao 👋" : "Hi 👋"}
          </h3>

          <p className="text-sm text-muted-foreground">
            {lang === "it" ? "Sei nel gruppo" : "Are you in the group"}{" "}
            <strong className="text-foreground">{group.join(" + ")}</strong>?
          </p>

          <div className="flex flex-row items-center gap-4 mt-9">
            <button
              className={linkBtn}
              type="button"
              onClick={confirmGroupYes}
              disabled={sending}
            >
              {lang === "it" ? "Sì" : "Yes"}
            </button>
            <button
              className={linkBtn}
              type="button"
              onClick={confirmGroupNo}
              disabled={sending}
            >
              {lang === "it" ? "No" : "No"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ATTENDING */}
      {step === "attending" && (
        <form onSubmit={checkAttending} className="space-y-6" noValidate>
          <div className="space-y-1">
            <h3 className="text-xl text-foreground font-medium">
              {lang === "it"
                ? `Ciao ${name.trim()} 👋`
                : `Hi ${name.trim()} 👋`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === "it" ? "Gruppo:" : "Group:"}{" "}
              <strong className="text-foreground">{group.join(" + ")}</strong>
            </p>
          </div>

          <div>
            <p className={labelCls}>
              {lang === "it" ? "Sarai presente? *" : "Will you attend? *"}
            </p>

            <div className="flex gap-8 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attending"
                  value="Si"
                  checked={attending === "Si"}
                  onChange={(e) => setAttending(e.target.value)}
                  className="accent-[#b97d6a]"
                />
                <span>{lang === "it" ? "Sì" : "Yes"}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attending"
                  value="No"
                  checked={attending === "No"}
                  onChange={(e) => setAttending(e.target.value)}
                  className="accent-[#b97d6a]"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              className={linkBtn}
              disabled={sending}
              onClick={() => {
                setStep("confirmGroup");
                setAttending("");
                setError("");
              }}
            >
              {lang === "it" ? "Indietro" : "Back"}
            </button>

            <button className={linkBtn} type="submit" disabled={sending}>
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

      {/* STEP 4: FOOD (checkbox + altro) */}
      {step === "food" && (
        <form onSubmit={submitAll} className="space-y-6" noValidate>
          <div className="space-y-3">
            <p className={labelCls}>
              {lang === "it"
                ? "Allergie e intolleranze alimentari"
                : "Food allergies & intolerances"}
            </p>

            <div className="space-y-3">
              {FOOD_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer text-sm text-neutral-800"
                >
                  <input
                    type="checkbox"
                    checked={food.includes(opt)}
                    onChange={() => toggleFood(opt)}
                    className="h-4 w-4 accent-[#b97d6a]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="altro">
              {lang === "it"
                ? "Altre allergie o restrizioni"
                : "Other allergies / restrictions"}
            </label>
            <input
              id="altro"
              value={altro}
              onChange={(e) => setAltro(e.target.value)}
              className={inputCls}
              placeholder={
                lang === "it"
                  ? "Es. allergia al pesce, ecc..."
                  : "e.g. fish allergy, etc..."
              }
              style={{ borderRadius: "14px" }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              className={linkBtn}
              disabled={sending}
              onClick={() => {
                setStep("attending");
                setError("");
              }}
            >
              {lang === "it" ? "Indietro" : "Back"}
            </button>

            <button className={linkBtn} type="submit" disabled={sending}>
              {sending
                ? lang === "it"
                  ? "Invio..."
                  : "Sending..."
                : lang === "it"
                ? "Invia conferma"
                : "Send"}
            </button>
          </div>
        </form>
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
