const translations = {
  it: {
    // Menu
    menu: {
      confirmAttendance: "Conferma presenza",
      countdown: "Countdown",
      ceremony: "Cerimonia",
      reception: "Ricevimento",
      program: "Programma",
      gifts: "Regalo",
      rsvp: "RSVP",
    },

    // Hero
    hero: {
      confirmAttendance: "Conferma presenza",
    },

    // Countdown
    countdown: {
      title: "Conto alla rovescia",
      subtitle: "Per il grande giorno",
      days: "Giorni",
      hours: "Ore",
      minutes: "Minuti",
      seconds: "Secondi",
    },

    // Cerimonia
    ceremony: {
      title: "La Cerimonia",
      place: "Chiesa di Santa Cecilia",
      address: "Piazza di Santa Cecilia, 22, 00153 Roma RM",
      time: "Ore 16:30",
      openInMaps: "Apri in Maps",
    },

    // Ricevimento
    reception: {
      title: "Il Ricevimento",
      place: "Villa dei Consoli",
      address: "Via di Colle Reti, 2, 00044 Frascati RM",
      time: "Dalle 18:30",
      openInMaps: "Apri in Maps",
    },

    // Programma
    program: {
      title: "Il Programma",
      subtitle: "La nostra giornata, passo dopo passo",
      events: {
        arrival: { time: "16:30", title: "Arrivo", description: "Accoglienza degli invitati" },
        ceremony: { time: "17:00", title: "Cerimonia", description: "Scambio delle promesse" },
        aperitivo: { time: "18:00", title: "Aperitivo", description: "Brindisi e stuzzichini" },
        dinner: { time: "20:00", title: "Cena", description: "Cena nuziale" },
        firstDance: { time: "22:30", title: "Primo ballo", description: "Il nostro momento" },
        party: { time: "23:00", title: "Festa", description: "Tutti a ballare!" },
        end: { time: "02:30", title: "Fine festa", description: "Arrivederci e grazie!" },
      },
    },

    // Regali
    gifts: {
      title: "Un pensiero",
      description: "La vostra presenza è il regalo più bello che possiamo ricevere. Se desiderate contribuire al nostro prossimo viaggio insieme, potete farlo nel modo che vi è più comodo.",
      contribution: "Contributo",
      cashText: "Se preferite, il regalo può essere in denaro contante. Se vi è più comodo, potete anche effettuare un bonifico:",
      showIban: "Mostra IBAN",
      hideIban: "Nascondi IBAN",
    },

    // RSVP
    rsvp: {
      title: "RSVP",
      description: "Per confermare la vostra presenza, inserite il vostro nome qui sotto.\nNon vediamo l'ora di festeggiare con voi.\nGrazie per voler condividere con noi questo giorno speciale!\nVi preghiamo di dare conferma entro il 30 aprile 2026",
      descriptionMobile: "Per confermare la vostra presenza, inserite il vostro nome qui sotto. Non vediamo l'ora di festeggiare con voi. Grazie per voler condividere con noi questo giorno speciale! Vi preghiamo di dare conferma entro il 30 aprile 2026",
      descriptionDesktop: "Per confermare la vostra presenza, inserite il vostro nome qui sotto.\nNon vediamo l'ora di festeggiare con voi.\nGrazie per voler condividere con noi questo giorno speciale!\nVi preghiamo di dare conferma entro il 30 aprile 2026",
      reply: "Rispondi",
      hide: "Nascondi",
    },

    // RSVP Form
    rsvpForm: {
      formTitle: "Conferma la tua presenza",
      nameLabel: "Inserisci nome e cognome",
      continue: "Continua",
      greeting: "Ciao",
      groupQuestion: "Fai parte di questo gruppo:",
      yes: "Sì",
      no: "No",
      select: "Seleziona",
      complete: " Completo",
      toComplete: " Da completare",
      ceremonyQuestion: "Partecipi alla cerimonia?",
      receptionQuestion: "Partecipi al ricevimento?",
      foodLabel: "Segnalate qui eventuali esigenze alimentari:",
      foodPlaceholder: "Allergie, intolleranze o regimi alimentari specifici (es. celiachia, vegetariano, vegano...)",
      prev: " Precedente",
      next: "Successivo ",
      send: "Invia RSVP",
      back: "Indietro",
      sending: "Invio...",
      received: "Ricevuto",
      sendingMessage: "Stiamo inviando la tua risposta",
      dontClose: "Non chiudere questa pagina.",
      thankYou: "Grazie! ",
      responseRecorded: "La tua risposta è stata registrata.",
      sendAnother: "Invia un'altra risposta",
      errors: {
        enterName: "Inserisci nome e cognome.",
        nameNotFound: "Nome non presente nella lista invitati. Controlla che sia identico all'invito.",
        sendError: "Errore durante l'invio. Controlla la connessione e riprova.",
      },
    },

    // Footer
    footer: {
      names: "Karl & Reichelle",
      date: "5 giugno 2026",
      message: "Con tutto il nostro amore",
      contactLead: "Per qualsiasi informazione o necessità,\nnon esitate a contattarci",
    },

    // Music
    music: {
      mute: "Silenzia musica",
      unmute: "Attiva musica",
    },

    // Photo Gallery
    photoGallery: {
      title: "Condividi i tuoi scatti",
      preWeddingSubtitle: "Al giorno del matrimonio, condividi gli scatti migliori con tutti gli ospiti",
      postWeddingSubtitle: "Carica le tue foto del matrimonio e crea una galleria condivisa con tutti gli ospiti!",
      galleryTitle: "Galleria",
      allPhotosTitle: "Tutte le foto",
      subtitle: "I vostri momenti speciali",
      namePlaceholder: "Inserisci il tuo nome",
      choosePhotos: " Scegli",
      photosSelected: " {count} foto",
      uploadButton: "Carica",
      uploadingButton: "...",
      photosCount: "foto",
      viewAllPhotos: "Visualizza tutte le foto",
      emptyGallery: "Ancora nessuna foto. Sii il primo a condividere! ",
      uploadedBy: "📷 {name}",
      closeLabel: "Chiudi",
      previousPhoto: "Foto precedente",
      nextPhoto: "Prossima foto",
      uploadBlockedTitle: "Caricamento non disponibile",
      uploadBlockedMessage: "Il caricamento delle foto sarà disponibile a partire dal giorno del matrimonio",
      uploadBlockedDate: "(5 giugno 2026)",
      understoodButton: "Ho capito",
      photoCounter: "{current} / {total}",
      errors: {
        maxPhotos: "Puoi selezionare massimo 5 foto alla volta",
        onlyImages: "Per favore seleziona solo file immagine",
        fileTooBig: "Uno o più file sono troppo grandi (max 10 MB)",
        nameAndPhoto: "Inserisci il tuo nome e seleziona almeno una foto",
        uploadError: "Errore nel caricamento. Riprova più tardi.",
      },
      success: {
        singlePhoto: "Foto caricata con successo! ",
        multiplePhotos: "{count} foto caricate con successo! ",
      },
    },
  },

  en: {
    // Menu
    menu: {
      confirmAttendance: "Confirm attendance",
      countdown: "Countdown",
      ceremony: "Ceremony",
      reception: "Reception",
      program: "Program",
      gifts: "Gifts",
      rsvp: "RSVP",
    },

    // Hero
    hero: {
      confirmAttendance: "Confirm attendance",
    },

    // Countdown
    countdown: {
      title: "Countdown",
      subtitle: "For the big day",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },

    // Cerimonia
    ceremony: {
      title: "The Ceremony",
      place: "Church of Santa Cecilia",
      address: "Piazza di Santa Cecilia, 22, 00153 Rome RM",
      time: "At 4:30 PM",
      openInMaps: "Open in Maps",
    },

    // Ricevimento
    reception: {
      title: "The Reception",
      place: "Villa dei Consoli",
      address: "Via di Colle Reti, 2, 00044 Frascati RM",
      time: "From 6:30 PM",
      openInMaps: "Open in Maps",
    },

    // Programma
    program: {
      title: "The Program",
      subtitle: "Our day, step by step",
      events: {
        arrival: { time: "16:30", title: "Arrival", description: "Welcoming guests" },
        ceremony: { time: "17:00", title: "Ceremony", description: "Exchange of vows" },
        aperitivo: { time: "18:00", title: "Aperitif", description: "Toasts and appetizers" },
        dinner: { time: "20:00", title: "Dinner", description: "Wedding dinner" },
        firstDance: { time: "22:30", title: "First dance", description: "Our moment" },
        party: { time: "23:00", title: "Party", description: "Let's dance!" },
        end: { time: "02:30", title: "Party ends", description: "Goodbye and thank you!" },
      },
    },

    // Regali
    gifts: {
      title: "A gift",
      description: "Your presence is the greatest gift we can receive. If you wish to contribute to our honeymoon together, you can do so in any way that suits you best.",
      contribution: "Contribution",
      cashText: "If you prefer, the gift can be in cash. If it is more convenient for you, you can also make a bank transfer:",
      showIban: "Show IBAN",
      hideIban: "Hide IBAN",
    },

    // RSVP
    rsvp: {
      title: "RSVP",
      descriptionMobile: "To confirm your attendance, please enter your name below. We can't wait to celebrate with you. Thank you for wanting to share this special day with us! Please confirm by April 30, 2026",
      descriptionDesktop: "To confirm your attendance, please enter your name below.\nWe can't wait to celebrate with you.\nThank you for wanting to share this special day with us!\nPlease confirm by April 30, 2026",
      reply: "Reply",
      hide: "Hide",
    },

    // RSVP Form
    rsvpForm: {
      formTitle: "Confirm your attendance",
      nameLabel: "Insert name and surname ",
      continue: "Continue",
      greeting: "Hi",
      groupQuestion: "Are you part of this group:",
      yes: "Yes",
      no: "No",
      select: "Select",
      complete: " Complete",
      toComplete: " To complete",
      ceremonyQuestion: "Will you attend the ceremony?",
      receptionQuestion: "Will you attend the reception?",
      foodLabel: "Dietary requirements (allergies/intolerances):",
      foodPlaceholder: "Allergies, intolerances or dietary preferences (e.g., gluten-free, vegetarian, vegan...)",
      prev: " Prev",
      next: "Next ",
      send: "Send RSVP",
      back: "Back",
      sending: "Sending...",
      received: "Received",
      sendingMessage: "We're sending your response",
      dontClose: "Please don't close this page.",
      thankYou: "Thank you! ",
      responseRecorded: "Your response has been recorded.",
      sendAnother: "Send another response",
      errors: {
        enterName: "Please enter name and surname.",
        nameNotFound: "Name not found in the guest list. Please check it matches the invitation.",
        sendError: "Error while sending. Check your connection and try again.",
      },
    },

    // Footer
    footer: {
      names: "Karl & Reichelle",
      date: "June 5, 2026",
      message: "With all our love",
      contactLead: "For any information or needs,\nfeel free to contact us",
    },

    // Music
    music: {
      mute: "Mute music",
      unmute: "Unmute music",
    },

    // Photo Gallery
    photoGallery: {
      title: "Share your photos",
      preWeddingSubtitle: "On the wedding day, share your best shots with all the guests",
      postWeddingSubtitle: "Upload your wedding photos and create a shared gallery with all the guests!",
      galleryTitle: "Gallery",
      allPhotosTitle: "All photos",
      subtitle: "Your special moments",
      namePlaceholder: "Insert your name",
      choosePhotos: " Choose",
      photosSelected: " {count} photos",
      uploadButton: "Upload",
      uploadingButton: "...",
      photosCount: "photos",
      viewAllPhotos: "View all photos",
      emptyGallery: "No photos yet. Be the first to share! ",
      uploadedBy: "📷 {name}",
      closeLabel: "Close",
      previousPhoto: "Previous photo",
      nextPhoto: "Next photo",
      uploadBlockedTitle: "Upload not available",
      uploadBlockedMessage: "Photo upload will be available starting from the wedding day",
      uploadBlockedDate: "(June 5, 2026)",
      understoodButton: "Got it",
      photoCounter: "{current} / {total}",
      errors: {
        maxPhotos: "You can select a maximum of 5 photos at a time",
        onlyImages: "Please select only image files",
        fileTooBig: "One or more files are too large (max 10 MB)",
        nameAndPhoto: "Enter your name and select at least one photo",
        uploadError: "Upload error. Please try again later.",
      },
      success: {
        singlePhoto: "Photo uploaded successfully! ",
        multiplePhotos: "{count} photos uploaded successfully! ",
      },
    },
  },
};

export default translations;
