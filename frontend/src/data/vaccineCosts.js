/**
 * INDICATIVE adult-vaccine cost and availability in India.
 *
 * These are rough, publicly-reported *private-market* price ranges per dose and
 * general notes on government availability. They are NOT live prices and NOT a
 * quote — actual cost varies widely by city, brand, hospital and year, and
 * stock changes daily. The UI labels this clearly and tells users to confirm
 * with the provider. There is no free public API for real-time stock/price in
 * India, so the finder guides users to real centres (Google Maps / CoWIN)
 * rather than inventing live availability.
 *
 * Government note reflects that most ADULT vaccines in India are self-pay in the
 * private sector; the national programme (UIP/U-WIN) covers specific groups
 * (e.g. Td in pregnancy, rabies post-exposure at government hospitals, JE in
 * endemic districts).
 */

export const COST_DISCLAIMER =
  'Prices are indicative private-market ranges per dose, not live quotes. Actual cost and stock vary by city, brand and clinic — always confirm with the centre before visiting.';

export const vaccineCosts = {
  'influenza-seasonal': {
    privateRange: '₹1,000 – ₹2,500',
    govt: 'Not routinely free for the general adult public; some states/employers run flu drives.',
  },
  'pneumococcal-conjugate-polysaccharide': {
    privateRange: '₹3,500 – ₹6,500 (PCV) · ₹2,500 – ₹4,000 (PPSV23)',
    govt: 'Generally self-pay for adults in the private sector.',
  },
  'tetanus-diphtheria-pertussis-tdap': {
    privateRange: '₹1,500 – ₹3,000 (Tdap) · ₹50 – ₹300 (Td)',
    govt: 'Td is provided free in pregnancy and at government hospitals for wound management.',
  },
  'hepatitis-b': {
    privateRange: '₹300 – ₹800 per dose',
    govt: 'Available free for infants under UIP; adults usually self-pay.',
  },
  'herpes-zoster-shingles': {
    privateRange: '₹10,000 – ₹16,000 per dose (2 doses)',
    govt: 'Not in the government programme; private only.',
  },
  'human-papillomavirus-hpv': {
    privateRange: '₹2,000 – ₹4,000 (Cervavac) · ₹4,000 – ₹10,000 (imported)',
    govt: 'State HPV campaigns exist for adolescent girls; adults usually self-pay.',
  },
  'typhoid-conjugate-tcv': {
    privateRange: '₹1,500 – ₹3,000',
    govt: 'Included in some state immunisation drives; adults usually self-pay.',
  },
  'rabies-prophylaxis': {
    privateRange: '₹300 – ₹600 per dose',
    govt: 'Post-exposure rabies vaccine is often free at government hospitals and ARV clinics.',
  },
  'hepatitis-a': {
    privateRange: '₹1,500 – ₹3,500 per dose',
    govt: 'Private only for most adults.',
  },
  'mmr-adult-catchup': {
    privateRange: '₹300 – ₹800 per dose',
    govt: 'Free for children under UIP; adult catch-up usually self-pay.',
  },
  'varicella-chickenpox': {
    privateRange: '₹1,800 – ₹3,000 per dose',
    govt: 'Private only.',
  },
  'meningococcal-conjugate': {
    privateRange: '₹3,000 – ₹6,000',
    govt: 'Required for Hajj/Umraj travellers (self-pay); otherwise private.',
  },
  'japanese-encephalitis': {
    privateRange: '₹100 – ₹500 (govt programme) · higher for private brands',
    govt: 'Provided free in endemic districts under the government JE programme.',
  },
};

export function costFor(id) {
  return vaccineCosts[id] || null;
}
