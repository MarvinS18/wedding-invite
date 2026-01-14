import React from "react";

export default function RSVP() {
  return (
    <section className="section-padding bg-ivory min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">Conferma la tua presenza</h2>
          <p className="text-muted-foreground font-body tracking-wide">
            Compila il modulo per confermare la tua presenza
          </p>
        </div>
        <form className="bg-card/90 backdrop-blur-sm border border-border rounded-sm p-8 space-y-6 shadow-soft">
          <div>
            <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground font-medium" htmlFor="name">Nome e cognome *</label>
            <input className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-2 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary" id="name" required placeholder="Il tuo nome e cognome" defaultValue="" />
          </div>
          <div>
            <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground font-medium">Sarai presente? *</label>
              <select
                id="presenza-select"
                name="presenza"
                required
                className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                defaultValue=""
              >
                <option value="" disabled hidden>Seleziona una risposta</option>
                <option value="si">Sì</option>
                <option value="no">No</option>
              </select>
          </div>
          <div>
            <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground font-medium" htmlFor="preferenze">Quali sono le tue preferenze alimentari?</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary" id="preferenze" placeholder="Scrivi qui le tue preferenze, allergie o intolleranze..." rows={3}></textarea>
          </div>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="mr-2 -ml-1"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>
            Invia conferma
          </button>
        </form>
      </div>
    </section>
  );
}
