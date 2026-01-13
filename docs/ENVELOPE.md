Effetto lettera (Welcome Envelope)

- File: `src/components/Envelope.jsx` e `src/components/Envelope.css`
- Comportamento: una lettera/envelope appare all'apertura del sito; il contenuto principale rimane nascosto finché la lettera non viene aperta.
- Modifiche principali in `App.jsx`: aggiunta di `const [showEnvelope, setShowEnvelope] = useState(true);`, rendering condizionale di `<Envelope />` e `aria-hidden={showEnvelope}` sulla `main`.

Personalizzazione:
- Durata animazione: modifica la regola `animation` per `letter-up` in `Envelope.css`.
- Timeout fallback: modifica il valore `800` ms in `Envelope.jsx` (setTimeout) se vuoi un comportamento più veloce o più lento.
- Disabilitare l'effetto: imposta `showEnvelope` a `false` o rimuovi il rendering di `<Envelope />`.

Accessibilità:
- Il componente utilizza `role="dialog"` e `aria-modal="true"`; il pulsante è attivabile con tasto `Enter` o `Space`.

Suggerimenti:
- Puoi sostituire la grafica con un'illustrazione o un SVG all'interno di `src/components/Envelope.jsx`.
