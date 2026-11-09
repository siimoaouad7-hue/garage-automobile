// ─── @Log ────────────────────────────────────────────────────────────────────
// Affiche le nom de la méthode et ses arguments à chaque appel

export function Log(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (...args: unknown[]) {
    console.log(`[Log] ${propertyKey}() appelée avec :`, args);
    return original.apply(this, args);
  };

  return descriptor;
}

// ─── @Measure ────────────────────────────────────────────────────────────────
// Mesure et affiche le temps d'exécution de la méthode

export function Measure(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (...args: unknown[]) {
    const debut = performance.now();
    const resultat = original.apply(this, args);
    const fin = performance.now();
    console.log(`[Measure] ${propertyKey}() a pris ${(fin - debut).toFixed(3)} ms`);
    return resultat;
  };

  return descriptor;
}

// ─── @RequireAccess ──────────────────────────────────────────────────────────
// Bloque les interventions restreintes si l'utilisateur n'est pas autorisé

export function RequireAccess(autorise: boolean) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const original = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (...args: unknown[]) {
      const intervention = args[0] as { restreinte?: boolean };
      if (intervention?.restreinte && !autorise) {
        throw new Error(
          `[RequireAccess] Accès refusé : l'intervention "${propertyKey}" est restreinte.`
        );
      }
      return original.apply(this, args);
    };

    return descriptor;
  };
}

// ─── @ValidateCout ───────────────────────────────────────────────────────────
// Exercice 4 : rejette une intervention dont le coût est négatif

export function ValidateCout(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (...args: unknown[]) {
    const intervention = args[0] as { cout?: number };
    if (typeof intervention?.cout === "number" && intervention.cout < 0) {
      throw new Error(
        `[ValidateCout] Le coût ne peut pas être négatif (reçu : ${intervention.cout} DH).`
      );
    }
    return original.apply(this, args);
  };

  return descriptor;
}

// ─── @Cache ──────────────────────────────────────────────────────────────────
// Exercice 5 : cache les résultats par instance (WeakMap) et par arguments (Map)

const cacheParInstance = new WeakMap<object, Map<string, unknown>>();

export function Cache(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (...args: unknown[]) {
    // Récupère (ou crée) la Map de cache propre à cette instance
    if (!cacheParInstance.has(this as object)) {
      cacheParInstance.set(this as object, new Map());
    }
    const cache = cacheParInstance.get(this as object)!;
    const cle = JSON.stringify(args);

    if (cache.has(cle)) {
      console.log(`[Cache] ${propertyKey}(${cle}) → résultat en cache`);
      return cache.get(cle);
    }

    const resultat = original.apply(this, args);
    cache.set(cle, resultat);
    console.log(`[Cache] ${propertyKey}(${cle}) → calculé et mis en cache`);
    return resultat;
  };

  return descriptor;
}
