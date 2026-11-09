import { Intervention, StatsMotorisation, Motorisation } from "./types";
import { InterventionRepository, VoitureRepository } from "./repository";
import { ValidateCout, Log, Cache, Measure } from "./decorators";

// ─── InterventionService ─────────────────────────────────────────────────────

export class InterventionService {
  private repo: InterventionRepository;

  constructor(repo: InterventionRepository) {
    this.repo = repo;
  }

  // Exercice 4 : @ValidateCout appliqué sur add() via la méthode du service
  @Log
  @ValidateCout
  enregistrer(intervention: Omit<Intervention, "id">): Intervention {
    return this.repo.add(intervention);
  }
}

// ─── EstimationService ───────────────────────────────────────────────────────
// Exercice 5 : @Cache appliqué à estimerValeur

export class EstimationService {
  // Simule un calcul coûteux : valeur estimée d'une voiture
  @Cache
  @Measure
  estimerValeur(annee: number, kilometrage: number): number {
    // Simulation d'un calcul long
    const base = 150_000;
    const depreciationAnnee = (2025 - annee) * 8_000;
    const depreciationKm = kilometrage * 0.5;
    const valeur = Math.max(base - depreciationAnnee - depreciationKm, 5_000);
    return Math.round(valeur);
  }
}

// ─── StatistiqueService ──────────────────────────────────────────────────────

export class StatistiqueService {
  private voitureRepo: VoitureRepository;

  constructor(voitureRepo: VoitureRepository) {
    this.voitureRepo = voitureRepo;
  }

  // Retourne un objet avec index signature { [motorisation: string]: number }
  compterParMotorisation(): StatsMotorisation {
    const stats: StatsMotorisation = {};
    for (const voiture of this.voitureRepo.findAll()) {
      const m: string = voiture.motorisation;
      stats[m] = (stats[m] ?? 0) + 1;
    }
    return stats;
  }

  // Retourne un tuple readonly [totalVoitures, totalInterventions]
  resume(interventionRepo: InterventionRepository): readonly [number, number] {
    return [
      this.voitureRepo.findAll().length,
      interventionRepo.findAll().length,
    ] as const;
  }
}
