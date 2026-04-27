'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en' | 'it';

export const dictionary: Record<Language, Record<string, string>> = {
  es: {
    search_placeholder: "Buscar campamento...",
    ver_reviews: "Ver Reviews",
    post_review: "Nueva Review",
    pending_moderation: "Tienes una review en moderación en este camp.",
    close: "Cerrar",
    new_review: "Nueva Review",
    swing_start: "Inicio de Swing (Hs)",
    swing_end: "Fin de Swing (Hs)",
    select_agency: "Seleccionar Agencia...",
    other: "Otro",
    role: "Posición / Rol...",
    hourly_rate: "Sueldo por Hora ($)",
    comment_placeholder: "¿Algún comentario? ¿Qué tal el ambiente?",
    submit_review: "Enviar Review Anónima",
    submitting: "Enviando...",
    review_sent: "Review Enviada",
    review_pending_msg: "Tu review está pendiente de aprobación. ¡Gracias por aportar a la comunidad!",
    all_roles: "TODOS LOS ROLES",
    back: "Volver",
    loading: "Cargando Data...",
    no_reviews: "Aún no hay reseñas aprobadas para este campamento.",
    no_reviews_role: "No hay reseñas para la posición seleccionada.",
    register_camp: "Registrar Camp",
    camp_name: "Nombre del Campamento (ej. Iron Bridge)",
    mining_company: "Empresa Minera",
    add_location: "+ Agregar Ubicación",
    processing: "Procesando...",
    received: "Recibido",
    camp_pending_msg: "Gracias. La aprobación está en review. Aparecerá en el mapa pronto.",
    no_reviews_yet: "Sin reviews aún",
    agency: "Agencia",
    emp_type: "Tipo de Contrato",
    casual: "Casual (Eventual)",
    full_time: "Planta (Full-Time)",
    position: "Rol / Posición",
    hour_rate: "Tarifa / Hora ($)",
    hour_start: "Hora Inicio",
    hour_end: "Hora Fin",
    food: "Comida",
    bed: "Habitacion",
    vibe: "Pibes",
    wifi: "Wifi",
    google_maps_link: "Link a Google Maps (URL exacta)",
  },
  en: {
    search_placeholder: "Search camp...",
    ver_reviews: "View Reviews",
    post_review: "New Review",
    pending_moderation: "You have a pending review here.",
    close: "Close",
    new_review: "New Review",
    swing_start: "Swing Start (Hrs)",
    swing_end: "Swing End (Hrs)",
    select_agency: "Select Agency...",
    other: "Other",
    role: "Role / Position...",
    hourly_rate: "Hourly Rate ($)",
    comment_placeholder: "Any comments? What's the vibe?",
    submit_review: "Submit Anonymous Review",
    submitting: "Submitting...",
    review_sent: "Review Submitted",
    review_pending_msg: "Your review is pending approval. Thanks for contributing!",
    all_roles: "ALL ROLES",
    back: "Back",
    loading: "Loading Data...",
    no_reviews: "No approved reviews for this camp yet.",
    no_reviews_role: "No reviews for the selected role.",
    register_camp: "Register Camp",
    camp_name: "Camp Name (e.g. Iron Bridge)",
    mining_company: "Mining Company",
    add_location: "+ Add Location",
    processing: "Processing...",
    received: "Received",
    camp_pending_msg: "Thanks. Your submission is under review. It will appear on the map soon.",
    no_reviews_yet: "No reviews yet",
    agency: "Agency",
    emp_type: "Employment Type",
    casual: "Casual",
    full_time: "Full-Time",
    position: "Position / Role",
    hour_rate: "Hourly Rate ($)",
    hour_start: "Start Hour",
    hour_end: "End Hour",
    food: "Food",
    bed: "Bed",
    vibe: "Vibe",
    wifi: "Wifi",
    google_maps_link: "Google Maps Link (Exact URL)",
  },
  it: {
    search_placeholder: "Cerca accampamento...",
    ver_reviews: "Vedi Recensioni",
    post_review: "Nuova Recensione",
    pending_moderation: "Hai una recensione in moderazione qui.",
    close: "Chiudi",
    new_review: "Nuova Recensione",
    swing_start: "Inizio Turno (Ore)",
    swing_end: "Fine Turno (Ore)",
    select_agency: "Seleziona Agenzia...",
    other: "Altro",
    role: "Posizione / Ruolo...",
    hourly_rate: "Paga Oraria ($)",
    comment_placeholder: "Qualche commento? Com'è l'atmosfera?",
    submit_review: "Invia Recensione Anonima",
    submitting: "Inviando...",
    review_sent: "Recensione Inviata",
    review_pending_msg: "La tua recensione è in attesa di approvazione. Grazie per il contributo!",
    all_roles: "TUTTI I RUOLI",
    back: "Indietro",
    loading: "Caricamento Dati...",
    no_reviews: "Non ci sono ancora recensioni approvate per questo accampamento.",
    no_reviews_role: "Nessuna recensione per il ruolo selezionato.",
    register_camp: "Registra Campo",
    camp_name: "Nome del Campo (es. Iron Bridge)",
    mining_company: "Compagnia Mineraria",
    add_location: "+ Aggiungi Posizione",
    processing: "Elaborazione...",
    received: "Ricevuto",
    camp_pending_msg: "Grazie. La tua registrazione è in fase di revisione. Apparirà a breve.",
    no_reviews_yet: "Nessuna recensione ancora",
    agency: "Agenzia",
    emp_type: "Tipo di Contratto",
    casual: "Occasionale",
    full_time: "A tempo pieno",
    position: "Ruolo",
    hour_rate: "Paga Oraria ($)",
    hour_start: "Ora di Inizio",
    hour_end: "Ora di Fine",
    food: "Cibo",
    bed: "Riposo",
    vibe: "Atmosfera",
    wifi: "Wifi",
    google_maps_link: "Link Google Maps (URL esatto)",
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('minemaps_lang');
    if (saved && (saved === 'en' || saved === 'es' || saved === 'it')) {
      setLanguageState(saved as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('minemaps_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return dictionary[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
