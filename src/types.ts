// ─── Types de base ───────────────────────────────────────────────────────────

export type Motorisation = "Essence" | "Diesel" | "Hybride" | "Electrique";

export interface Voiture {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  motorisation: Motorisation;
}

export interface Intervention {
  id: number;
  voitureId: number;
  libelle: string;
  cout: number;
  restreinte: boolean;
}

// Exercice 1 : NewVoiture exclut l'id (attribué automatiquement par le repository)
export type NewVoiture = Omit<Voiture, "id">;

// ─── Enum StatutIntervention ─────────────────────────────────────────────────

export enum StatutIntervention {
  EnAttente = "EN_ATTENTE",
  EnCours = "EN_COURS",
  Terminee = "TERMINEE",
  Annulee = "ANNULEE",
}

// ─── GarageEvent : union discriminée ────────────────────────────────────────

export type GarageEvent =
  | { type: "voiture-ajoutee"; voiture: Voiture }
  | { type: "intervention-realisee"; intervention: Intervention; date: Date }
  | { type: "voiture-sortie"; voitureId: number };

// Exercice 3 : Extract pour isoler un seul membre de l'union
export type InterventionEvent = Extract<GarageEvent, { type: "intervention-realisee" }>;

// ─── Type conditionnel avec infer ────────────────────────────────────────────
// Extrait le payload d'un GarageEvent selon son type discriminant
export type PayloadOf<T extends GarageEvent> =
  T extends { type: "voiture-ajoutee"; voiture: infer V }
    ? V
    : T extends { type: "intervention-realisee"; intervention: infer I; date: infer D }
    ? { intervention: I; date: D }
    : T extends { type: "voiture-sortie"; voitureId: infer Id }
    ? Id
    : never;

// ─── Utilitaires de types divers ─────────────────────────────────────────────

// Readonly tuple pour les motorisations autorisées (utilisé dans le type guard)
export const MOTORISATIONS_VALIDES = ["Essence", "Diesel", "Hybride", "Electrique"] as const satisfies readonly Motorisation[];

// Index signature : statistiques par motorisation
export type StatsMotorisation = { [motorisation: string]: number };

// Configuration du garage avec Record
export type ConfigGarage = Record<"nom" | "ville" | "telephone", string>;

// Utilitaires Pick / Partial exposés pour la documentation
export type VoitureResume = Pick<Voiture, "marque" | "modele" | "annee">;
export type VoiturePartielle = Partial<Voiture>;

// Exclude : toutes les motorisations sauf Electrique
export type MotorisationThermique = Exclude<Motorisation, "Electrique">;

// ─── Type guards ─────────────────────────────────────────────────────────────

// Exercice 6 (renforcé) : vérifie que la valeur est une Motorisation valide
export function isMotorisation(value: unknown): value is Motorisation {
  return (MOTORISATIONS_VALIDES as readonly unknown[]).includes(value);
}

// Version renforcée de isVoiture utilisant isMotorisation
export function isVoiture(value: unknown): value is Voiture {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["id"] === "number" &&
    typeof v["marque"] === "string" &&
    typeof v["modele"] === "string" &&
    typeof v["annee"] === "number" &&
    typeof v["kilometrage"] === "number" &&
    isMotorisation(v["motorisation"])
  );
}
