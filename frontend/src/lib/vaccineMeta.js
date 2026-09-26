import { Droplets, Hourglass, ShieldPlus, Users, Wind } from 'lucide-react';

/**
 * Visual grouping for vaccines: one Lucide icon per category, so a vaccine is
 * recognisable at a glance. These are interface groupings for scanning, not
 * medical classifications; the vaccine's own page carries the clinical detail.
 */
export const VACCINE_CATEGORY = {
  respiratory: { label: 'Respiratory infections', icon: Wind },
  routine: { label: 'Routine protection', icon: ShieldPlus },
  spread: { label: 'Illnesses that spread between people', icon: Users },
  bloodborne: { label: 'Infections spread by blood or close contact', icon: Droplets },
  age: { label: 'Age-related', icon: Hourglass },
};

const BY_VACCINE = {
  influenza: 'respiratory',
  pneumococcal: 'respiratory',
  tdap: 'routine',
  td: 'routine',
  mmr: 'spread',
  varicella: 'spread',
  hepb: 'bloodborne',
  hpv: 'bloodborne',
  zoster: 'age',
};

export function vaccineCategory(vaccineId) {
  return VACCINE_CATEGORY[BY_VACCINE[vaccineId] ?? 'routine'];
}
