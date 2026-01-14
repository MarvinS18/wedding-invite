/* eslint-disable react-hooks/set-state-in-effect */
// ...existing code...
import React, { useEffect, useState, useRef } from "react";
// Hook per fade-in on scroll
function useFadeInOnScroll(selector = ".fade-in-on-scroll") {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    els.forEach((el) => {
      el.classList.remove("visible"); // reset visible state
      el.classList.add("fade-in");
    });
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [selector]);
}
import "./App.css";
import Envelope from "./components/Envelope";
import Navbar from "./components/Navbar";
import translations from "./translations";

function useCountdown(targetDate) {
  const [t, setT] = useState(getDiff(targetDate));
  useEffect(() => {
    const id = setInterval(() => setT(getDiff(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
  function getDiff(d) {
    const diff = Math.max(0, new Date(d) - new Date());
    const days = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const mins = Math.floor((diff % 36e5) / 6e4);
    const secs = Math.floor((diff % 6e4) / 1000);
    return { days, hours, mins, secs };
  }
}

export default function App() {
  useFadeInOnScroll();
  const target = "2026-06-05T16:00:00";
  const { days, hours, mins, secs } = useCountdown(target);

  const [form, setForm] = useState({
    name: "",
    email: "",
    attending: "",
    guests: 0,
    note: "",
  });
  const [saved, setSaved] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "it");

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = translations[lang] || translations.it;

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("rsvp") || "{}");
    if (s?.name) setForm((f) => ({ ...f, ...s }));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.attending) {
      alert("Compila nome e partecipazione.");
      return;
    }
    localStorage.setItem("rsvp", JSON.stringify({ ...form, ts: new Date().toISOString() }));
    setSaved(true);
  }

  function handleClear() {
    localStorage.removeItem("rsvp");
    setForm({ name: "", email: "", attending: "", guests: 0, note: "" });
    setSaved(false);
  }

  return (
    <>
      {showEnvelope && <Envelope onOpen={() => setShowEnvelope(false)} />}
      <main className="container" id="top" aria-hidden={showEnvelope}>
        <Navbar lang={lang} setLang={setLang} />

        <section className="hero fade-in-on-scroll" aria-labelledby="invito">
          <h1 id="invito" className="names">{t.namesShort}</h1>
          <div className="date">{t.dateLong} — {t.ceremony.place}</div>

          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.9)" }}>{t.welcome}</p>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.9)" }}>{t.heroIntro}</p>

          <div className="countdown" id="countdown" aria-hidden={false}>
            <div><div className="small">{lang === "it" ? "Giorni" : "Days"}</div><div>{String(days).padStart(2, "0")}</div></div>
            <div><div className="small">{lang === "it" ? "Ore" : "Hours"}</div><div>{String(hours).padStart(2, "0")}</div></div>
            <div><div className="small">{lang === "it" ? "Min" : "Min"}</div><div>{String(mins).padStart(2, "0")}</div></div>
            <div><div className="small">{lang === "it" ? "Sec" : "Sec"}</div><div>{String(secs).padStart(2, "0")}</div></div>
          </div>

          <div className="actions">
            <a href="#rsvp" className="btn">{t.buttons.rsvp}</a>
            <a href="#details" className="btn ghost">{t.buttons.details}</a>
          </div>
        </section>

        <div className="grid fade-in-on-scroll">
          <section className="card fade-in-on-scroll" id="details" aria-labelledby="details-title">
            <h2 id="details-title" className="section-title">{t.programTitle}</h2>
            <div className="event-list">
              <article className="event">
                <time dateTime="2026-06-05T16:00">4:00 PM</time>
                <div>
                  <strong>{t.times.ceremony}</strong>
                  <div className="small">{t.ceremony.place} — {t.ceremony.address}</div>
                </div>
              </article>
              <article className="event">
                <time dateTime="2026-06-05T18:30">6:30 PM</time>
                <div>
                  <strong>{t.times.aperitivo}</strong>
                  <div className="small">{t.reception.place} — {t.reception.address}</div>
                </div>
              </article>
              <article className="event">
                <time dateTime="2026-06-05T20:00">8:00 PM</time>
                <div>
                  <strong>{t.times.dinner}</strong>
                  <div className="small">{t.reception.place}</div>
                </div>
              </article>
              <article className="event">
                <time dateTime="2026-06-05T22:00">10:00 PM</time>
                <div>
                  <strong>{t.times.cake}</strong>
                </div>
              </article>
              <article className="event">
                <time dateTime="2026-06-05T22:30">10:30 PM</time>
                <div>
                  <strong>{t.times.firstDance}</strong>
                </div>
              </article>
              <article className="event">
                <time dateTime="2026-06-05T23:30">11:30 PM</time>
                <div>
                  <strong>{t.times.afterparty}</strong>
                </div>
              </article>
            </div>

            <h3 className="section-title" style={{ marginTop: 16 }}>{t.gallery}</h3>
            <div className="gallery" aria-hidden={false}>
              <img src={new URL('./assets/karlandreichellebackgroundtimer.avif', import.meta.url).href} alt="background" />
              <img src={new URL('./assets/karlandreichellegallery1.avif', import.meta.url).href} alt="gallery1" />
              <img src={new URL('./assets/karlandreichellegallery2.avif', import.meta.url).href} alt="gallery2" />
            </div>

            <h3 className="section-title" style={{ marginTop: 16 }}>{t.faq.title}</h3>
            <div className="small">
              <strong>{t.faq.q1}</strong>
              <div>{t.faq.a1}</div>
              <strong style={{ marginTop: 8, display: "block" }}>{t.faq.q2}</strong>
              <div>{t.faq.a2}</div>
              <strong style={{ marginTop: 8, display: "block" }}>{t.faq.q3}</strong>
              <div>{t.faq.a3}</div>
              <strong style={{ marginTop: 8, display: "block" }}>{t.faq.q4}</strong>
              <div>{t.faq.a4}</div>
            </div>
          </section>

          <aside id="rsvp" aria-labelledby="rsvp-title" className="fade-in-on-scroll">
            <div className="card fade-in-on-scroll">
            <h2 id="rsvp-title" className="section-title">{t.rsvp.title}</h2>
            <div className="small" style={{ marginBottom: 12 }}>{t.rsvp.deadline}</div>
              <form id="rsvpForm" onSubmit={handleSubmit} autoComplete="on" noValidate>
                <label htmlFor="name">{lang === "it" ? "Nome e Cognome" : "Name"}</label>
                <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required />

                <label htmlFor="email" style={{ marginTop: 8 }}>{lang === "it" ? "Email" : "Email"}</label>
                <input id="email" name="email" className="input" type="email" value={form.email} onChange={handleChange} />

                <label htmlFor="attending" style={{ marginTop: 8 }}>{lang === "it" ? "Partecipa?" : "Attending?"}</label>
                <select id="attending" name="attending" className="input" value={form.attending} onChange={handleChange} required>
                  <option value="">{lang === "it" ? "Seleziona" : "Select"}</option>
                  <option value="yes">{lang === "it" ? "Sì, sarò presente" : "Yes, I will attend"}</option>
                  <option value="no">{lang === "it" ? "No, non posso" : "No, I cannot"}</option>
                </select>

                <div className="form-row" style={{ marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="guests">{lang === "it" ? "Numero ospiti" : "Number of guests"}</label>
                    <input id="guests" name="guests" className="input" type="number" min="0" value={form.guests} onChange={handleChange} />
                  </div>
                </div>

                <label htmlFor="note" style={{ marginTop: 8 }}>{lang === "it" ? "Note / Allergie" : "Notes / Allergies"}</label>
                <textarea id="note" name="note" value={form.note} onChange={handleChange}></textarea>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn" type="submit">{lang === "it" ? "Invia" : "Send"}</button>
                  <button id="clear" type="button" className="btn ghost" onClick={handleClear}>{lang === "it" ? "Cancella" : "Clear"}</button>
                </div>

                <p id="thanks" className="small" style={{ marginTop: 12, display: saved ? "block" : "none" }}>{lang === "it" ? "Grazie! Abbiamo ricevuto la tua risposta." : "Thank you! We've received your response."}</p>
              </form>
            </div>
            <div className="card split-row fade-in-on-scroll" style={{ marginTop: 18 }}>
              <div>
                <h3 id="dove" className="section-title">{t.ceremony.title}</h3>
                  <div className="small">{t.ceremony.place}<br />{t.ceremony.address}</div>
                  <p className="small" style={{ marginTop: 8 }}>{t.ceremony.how}</p>
                  <div className="transport-grid" style={{ marginTop: 10 }}>
                    <div className="transport-item">
                      <div className="icon">🚗</div>
                      <div className="text small">{t.ceremony.howBy?.car}</div>
                    </div>
                    <div className="transport-item">
                      <div className="icon">🚌</div>
                      <div className="text small">{t.ceremony.howBy?.bus}</div>
                    </div>
                    <div className="transport-item">
                      <div className="icon">🚆</div>
                      <div className="text small">{t.ceremony.howBy?.train}</div>
                    </div>
                  </div>
              </div>
              <div>
                <iframe
                  className="map"
                  title="Mappa Cerimonia"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent("Piazza di Santa Cecilia 22, Roma")}&z=15&output=embed`}
                ></iframe>
              </div>
            </div>

            <div className="card split-row fade-in-on-scroll" style={{ marginTop: 12 }}>
              <div>
                <h3 id="reception" className="section-title">{t.reception.title}</h3>
                <div className="small">{t.reception.place}<br />{t.reception.address}<br /><em>{t.reception.note}</em></div>
                <p className="small" style={{ marginTop: 8 }}>{t.reception.how}</p>
                <div className="transport-grid" style={{ marginTop: 10 }}>
                  <div className="transport-item">
                    <div className="icon">🚗</div>
                    <div className="text small">{t.reception.howBy?.car}</div>
                  </div>
                  <div className="transport-item">
                    <div className="icon">🚌</div>
                    <div className="text small">{t.reception.howBy?.bus}</div>
                  </div>
                  <div className="transport-item">
                    <div className="icon">🚆</div>
                    <div className="text small">{t.reception.howBy?.train}</div>
                  </div>
                </div>
              </div>
              <div>
                <iframe
                  className="map"
                  title="Mappa Ricevimento"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent("Via di Pietra Porzia 38, Frascati")}&z=15&output=embed`}
                ></iframe>
              </div>
            </div>
             <div className="card fade-in-on-scroll">
              <h3 id="attire" className="section-title" style={{ marginTop: 12 }}>{t.attire.title}</h3>
              <div className="small">{t.attire.text}</div>
            </div>
             <div className="card fade-in-on-scroll">
              <h3 id="gifts" className="section-title" style={{ marginTop: 12 }}>{t.gifts.title}</h3>
              <div className="small">{t.gifts.text}</div>
              <div className="small" style={{ marginTop: 8 }}>{t.gifts.beneficiary}<br />{t.gifts.iban}</div>
            </div>
            <div className="card fade-in-on-scroll">
              <h3 className="section-title" style={{ marginTop: 12 }}>{t.contacts.title}</h3>
              <div className="small">{t.contacts.karl}<br />{t.contacts.reichelle}</div>
              <div className="small" style={{ marginTop: 8 }}>{t.contacts.coordinator}</div>
            </div>
          </aside>
        </div>

        <footer className="footer fade-in-on-scroll">
          <div>{t.footerHashtag}</div>
          <div style={{ marginTop: 8 }}>© {t.namesShort} — 2026</div>
        </footer>
      </main>
    </>
  );
}
// ...existing code...