import { Voiture, Intervention, NewVoiture } from "./types";

// ─── Repository générique ────────────────────────────────────────────────────

export class Repository<T extends { id: number }> {
  protected items: T[] = [];
  private nextId = 1;

  add(item: Omit<T, "id">): T {
    const newItem = { ...item, id: this.nextId++ } as T;
    this.items.push(newItem);
    return newItem;
  }

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findAll(): Readonly<T[]> {
    return this.items;
  }

  update(id: number, modifications: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...modifications };
    return this.items[index];
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}

// ─── VoitureRepository ───────────────────────────────────────────────────────

export class VoitureRepository extends Repository<Voiture> {
  // Exercice 2 : type à accès indexé Voiture["motorisation"] pour le paramètre
  findByMotorisation(motorisation: Voiture["motorisation"]): Voiture[] {
    return this.items.filter((v) => v.motorisation === motorisation);
  }

  // Exercice 1 : accepte un NewVoiture, délègue à add() qui gère l'id
  ajouterVoiture(data: NewVoiture): Voiture {
    return this.add(data);
  }
}

// ─── InterventionRepository ──────────────────────────────────────────────────

export class InterventionRepository extends Repository<Intervention> {
  findByVoiture(voitureId: number): Intervention[] {
    return this.items.filter((i) => i.voitureId === voitureId);
  }
}
