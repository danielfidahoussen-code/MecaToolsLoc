// Logique de tarification véhicules, partagée entre la liste (Vehicules.jsx)
// et la fiche véhicule (VehicleDetail.jsx).

export const hasTierPricing = (car) => car.price_1_3 != null;

// Grille à 5 paliers (nouveaux véhicules)
export function tierRate(car, days) {
  if (days >= 30) return car.price_30plus;
  if (days >= 21) return car.price_21_29;
  if (days >= 11) return car.price_11_20;
  if (days >= 4) return car.price_4_10;
  return car.price_1_3;
}

export function calcPrice(car, days) {
  if (!days || days <= 0) return 0;
  if (car.min_days && days < car.min_days) return 0;
  if (hasTierPricing(car)) return tierRate(car, days) * days;
  if (days >= 14) return car.price_2weeks * days;
  if (days >= 5 && car.price_5days) return car.price_5days * days;
  if (car.price_day) return car.price_day * days;
  return 0;
}

export function getRateInfo(car, days) {
  if (!days || days <= 0) return null;
  if (car.min_days && days < car.min_days) return { label: `Minimum ${car.min_days} jours pour ce véhicule`, color: 'var(--danger)', invalid: true };
  if (hasTierPricing(car)) {
    const rate = tierRate(car, days);
    const tierLabel = days >= 30 ? '+ de 30 jours' : days >= 21 ? '21 à 29 jours' : days >= 11 ? '11 à 20 jours' : days >= 4 ? '4 à 10 jours' : '1 à 3 jours';
    return { label: `${tierLabel} — ${rate} €/j`, color: '#059669' };
  }
  if (days >= 14) return { label: `Tarif 2 semaines — ${car.price_2weeks} €/j`, color: '#059669' };
  if (days >= 5 && car.price_5days) return { label: `-10% dès 5 jours — ${car.price_5days} €/j`, color: '#d97706' };
  if (car.price_day) return { label: `Tarif journalier — ${car.price_day} €/j`, color: 'var(--gray-500)' };
  return null;
}

// Liste des paliers à afficher (mini-tableau tarifaire sur la fiche)
export function getTiers(car) {
  if (hasTierPricing(car)) {
    return [
      { key: '1-3', label: '1-3j', value: car.price_1_3 },
      { key: '4-10', label: '4-10j', value: car.price_4_10 },
      { key: '11-20', label: '11-20j', value: car.price_11_20 },
      { key: '21-29', label: '21-29j', value: car.price_21_29 },
      { key: '30+', label: '30j+', value: car.price_30plus },
    ].filter(t => t.value > 0);
  }
  return [
    { key: 'day', label: 'Journalier', value: car.price_day },
    { key: '5days', label: '5 jours+', value: car.price_5days },
    { key: '2weeks', label: '2 semaines', value: car.price_2weeks },
  ].filter(t => t.value > 0);
}
