import {
  NewVoiture,
  GarageEvent,
  InterventionEvent,
  isVoiture,
  isMotorisation,
  PayloadOf,
  ConfigGarage,
  StatutIntervention,
} from "./types";
import { VoitureRepository, InterventionRepository } from "./repository";
import { InterventionService, EstimationService, StatistiqueService } from "./services";

// ─── Configuration du garage (Record) ────────────────────────────────────────

const config: ConfigGarage = {
  nom: "Garage Atlas",
  ville: "Casablanca",
  telephone: "0522-445566",
};
console.log("=== Garage :", config.nom, "—", config.ville, "===\n");

// ─── Dépôts ───────────────────────────────────────────────────────────────────

const voitureRepo = new VoitureRepository();
const interventionRepo = new InterventionRepository();
const interventionService = new InterventionService(interventionRepo);
const estimationService = new EstimationService();
const statistiqueService = new StatistiqueService(voitureRepo);

// ════════════════════════════════════════════════════════════════════════════
// EXERCICE 1 — Ajouter des voitures avec NewVoiture (Omit<Voiture, "id">)
// ════════════════════════════════════════════════════════════════════════════
console.log("── Exercice 1 : Ajout de voitures ──");

const nouvelleDacia: NewVoiture = {
  marque: "Dacia",
  modele: "Logan",
  annee: 2019,
  kilometrage: 87_000,
  motorisation: "Essence",
};

const v1 = voitureRepo.ajouterVoiture(nouvelleDacia);
const v2 = voitureRepo.ajouterVoiture({
  marque: "Renault",
  modele: "Clio",
  annee: 2021,
  kilometrage: 34_500,
  motorisation: "Essence",
});
const v3 = voitureRepo.ajouterVoiture({
  marque: "Peugeot",
  modele: "208",
  annee: 2020,
  kilometrage: 51_200,
  motorisation: "Diesel",
});
const v4 = voitureRepo.ajouterVoiture({
  marque: "Toyota",
  modele: "Yaris Cross",
  annee: 2022,
  kilometrage: 18_000,
  motorisation: "Hybride",
});
const v5 = voitureRepo.ajouterVoiture({
  marque: "Tesla",
  modele: "Model 3",
  annee: 2023,
  kilometrage: 9_400,
  motorisation: "Electrique",
});

console.log("Voitures enregistrées :");
voitureRepo.findAll().forEach((v) =>
  console.log(`  [${v.id}] ${v.marque} ${v.modele} (${v.annee}) — ${v.motorisation} — ${v.kilometrage} km`)
);
console.log();

// ════════════════════════════════════════════════════════════════════════════
// EXERCICE 2 — Filtrer par motorisation (type à accès indexé)
// ════════════════════════════════════════════════════════════════════════════
console.log("── Exercice 2 : Filtrage par motorisation ──");

const voituresEssence = voitureRepo.findByMotorisation("Essence");
console.log(`Voitures Essence (${voituresEssence.length}) :`);
voituresEssence.forEach((v) => console.log(`  ${v.marque} ${v.modele}`));

const voituresElectriques = voitureRepo.findByMotorisation("Electrique");
console.log(`Voitures Electrique (${voituresElectriques.length}) :`);
voituresElectriques.forEach((v) => console.log(`  ${v.marque} ${v.modele}`));
console.log();

// ════════════════════════════════════════════════════════════════════════════
// EXERCICE 3 — Événement d'intervention (Extract, union discriminée)
// ════════════════════════════════════════════════════════════════════════════
console.log("── Exercice 3 : Événements GarageEvent ──");

// Fonction qui n'accepte que le type extrait par Extract
function handleInterventionEvent(event: InterventionEvent): void {
  console.log(
    `Intervention réalisée le ${event.date.toLocaleDateString("fr-FR")} : ` +
      `"${event.intervention.libelle}" — ${event.intervention.cout} DH`
  );
}

const eventIntervention: InterventionEvent = {
  type: "intervention-realisee",
  intervention: { id: 1, voitureId: v1.id, libelle: "Vidange moteur", cout: 350, restreinte: false },
  date: new Date("2025-03-15"),
};
handleInterventionEvent(eventIntervention);

// Autres événements du garage (union discriminée complète)
const events: GarageEvent[] = [
  { type: "voiture-ajoutee", voiture: v1 },
  { type: "voiture-sortie", voitureId: v3.id },
  eventIntervention,
];

events.forEach((e) => {
  switch (e.type) {
    case "voiture-ajoutee":
      console.log(`  → Voiture ajoutée : ${e.voiture.marque} ${e.voiture.modele}`);
      break;
    case "voiture-sortie":
      console.log(`  → Voiture sortie du garage (id=${e.voitureId})`);
      break;
    case "intervention-realisee":
      console.log(`  → Intervention : ${e.intervention.libelle}`);
      break;
  }
});

// Démonstration de PayloadOf (type conditionnel avec infer)
type PayloadVoitureAjoutee = PayloadOf<{ type: "voiture-ajoutee"; voiture: typeof v1 }>;
// PayloadVoitureAjoutee est inféré comme `Voiture`

// ERREUR DE COMPILATION (volontairement commentée) :
// handleInterventionEvent({ type: "voiture-ajoutee", voiture: v1 });
// → Argument of type '{ type: "voiture-ajoutee"; voiture: Voiture; }' is not
//   assignable to parameter of type 'InterventionEvent'.
console.log();

// ════════════════════════════════════════════════════════════════════════════
// EXERCICE 4 — @ValidateCout : reject un coût négatif
// ════════════════════════════════════════════════════════════════════════════
console.log("── Exercice 4 : Décorateur @ValidateCout ──");

// Cas valide
try {
  const i1 = interventionService.enregistrer({
    voitureId: v1.id,
    libelle: "Vidange moteur",
    cout: 350,
    restreinte: false,
  });
  console.log(`  Intervention enregistrée : "${i1.libelle}" — ${i1.cout} DH (statut : ${StatutIntervention.Terminee})`);
} catch (err) {
  console.error("  Erreur inattendue :", err);
}

interventionService.enregistrer({
  voitureId: v2.id,
  libelle: "Remplacement plaquettes",
  cout: 780,
  restreinte: false,
});

interventionService.enregistrer({
  voitureId: v4.id,
  libelle: "Diagnostic batterie hybride",
  cout: 600,
  restreinte: true,
});

// Cas invalide : coût négatif
try {
  interventionService.enregistrer({
    voitureId: v3.id,
    libelle: "Remboursement test",
    cout: -200,
    restreinte: false,
  });
} catch (err) {
  if (err instanceof Error) {
    console.log(`  Erreur attrapée : ${err.message}`);
  }
}
console.log();

// ════════════════════════════════════════════════════════════════════════════
// EXERCICE 5 — @Cache : mémoïsation des appels à estimerValeur
// ════════════════════════════════════════════════════════════════════════════
console.log("── Exercice 5 : Décorateur @Cache ──");

// 1er appel : calcul effectif
const val1 = estimationService.estimerValeur(2019, 87_000);
console.log(`  Valeur estimée Dacia Logan 2019 : ${val1} DH`);

// 2e appel avec les mêmes arguments : résultat depuis le cache, @Measure ne s'exécute pas
const val2 = estimationService.estimerValeur(2019, 87_000);
console.log(`  Même appel en cache : ${val2} DH`);

// 3e appel avec des arguments différents : nouveau calcul
const val3 = estimationService.estimerValeur(2023, 9_400);
console.log(`  Valeur estimée Tesla Model 3 2023 : ${val3} DH`);
console.log();

// ════════════════════════════════════════════════════════════════════════════
// EXERCICE 6 — isMotorisation + isVoiture renforcé
// ════════════════════════════════════════════════════════════════════════════
console.log("── Exercice 6 : Type guards renforcés ──");

// isMotorisation
console.log(`  isMotorisation("Hybride")     → ${isMotorisation("Hybride")}`);     // true
console.log(`  isMotorisation("Hydrogene")   → ${isMotorisation("Hydrogene")}`);   // false
console.log(`  isMotorisation(42)            → ${isMotorisation(42)}`);             // false

// isVoiture — objet valide
const objetValide = { id: 10, marque: "Seat", modele: "Ibiza", annee: 2018, kilometrage: 62_000, motorisation: "Diesel" };
console.log(`  isVoiture(objetValide)        → ${isVoiture(objetValide)}`);         // true

// isVoiture — motorisation invalide "Hydrogene"
const objetHydrogene = { id: 11, marque: "BMW", modele: "iX5", annee: 2024, kilometrage: 1_000, motorisation: "Hydrogene" };
console.log(`  isVoiture(motorisation=Hydrogene) → ${isVoiture(objetHydrogene)}`); // false

// isVoiture — objet incomplet
const objetIncomplet = { marque: "Ford", modele: "Focus" };
console.log(`  isVoiture(objetIncomplet)     → ${isVoiture(objetIncomplet)}`);      // false
console.log();

// ─── Récapitulatif statistiques ───────────────────────────────────────────────
console.log("── Statistiques du garage ──");
const stats = statistiqueService.compterParMotorisation();
console.log("  Voitures par motorisation :", stats);

const [nbVoitures, nbInterventions] = statistiqueService.resume(interventionRepo);
console.log(`  Total : ${nbVoitures} voitures, ${nbInterventions} interventions`);
