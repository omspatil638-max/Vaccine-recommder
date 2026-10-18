/**
 * Educational Rules Engine for SmartVax India
 * 
 * Strict Safety Principles:
 * 1. Deterministic and transparent — strictly derived from published MoHFW, NTAGI, WHO India, and API consensus guidelines.
 * 2. Never diagnoses, prescribes, or calculates dosage.
 * 3. Never treats unknown vaccination history as proof of a missed dose.
 * 4. Always outputs the exact reason why a topic is presented for discussion with a doctor.
 */

export const EDUCATIONAL_RULES = [
  // Age-based rules
  {
    id: "RULE-SENIOR-PNEUMO",
    title: "Pneumococcal Pneumonia Prevention in Older Adults",
    targetVaccineId: "pneumococcal-conjugate-polysaccharide",
    targetVaccineName: "Pneumococcal Vaccine (PCV & PPSV23)",
    conditionMatch: (answers) => answers.ageGroup === "65+" || answers.ageGroup === "50-64",
    whyShown: "You indicated an age of 50 or above. Indian clinical consensus (API) strongly recommends discussing pneumococcal vaccination with your doctor to safeguard against invasive pneumonia and bacteremia.",
    discussionPoints: [
      "Ask your physician whether PCV20 or sequential PCV15 followed by PPSV23 is recommended for you.",
      "Check whether you received any childhood or past pneumococcal shots.",
      "Inquire how this shot helps protect against severe bacterial pneumonia, which is a leading cause of hospitalization in Indian seniors."
    ],
    verifiedSource: "Association of Physicians of India (API) Adult Immunization Consensus & WHO India",
    verificationStatus: "Verified: API Guidelines"
  },
  {
    id: "RULE-SENIOR-SHINGLES",
    title: "Herpes Zoster (Shingles) & Nerve Pain Awareness",
    targetVaccineId: "herpes-zoster-shingles",
    targetVaccineName: "Shingles Vaccine (Recombinant Zoster)",
    conditionMatch: (answers) => answers.ageGroup === "65+" || answers.ageGroup === "50-64",
    whyShown: "You indicated an age of 50 or above. Over 90% of Indian adults carry the dormant chickenpox virus, and immunity wanes naturally with age, leading to a surge in painful shingles after age 50.",
    discussionPoints: [
      "Ask your doctor about the 2-dose recombinant shingles vaccine (Shingrix).",
      "Mention any past episodes of chickenpox or shingles to your clinician.",
      "Discuss how the vaccine prevents postherpetic neuralgia (chronic severe nerve pain that can persist for months or years)."
    ],
    verifiedSource: "API Expert Consensus Statement on Shingles Vaccination in Indian Adults",
    verificationStatus: "Verified: API Guidelines"
  },
  {
    id: "RULE-ROUTINE-FLU",
    title: "Annual Seasonal Influenza (Flu) Protection",
    targetVaccineId: "influenza-seasonal",
    targetVaccineName: "Annual Seasonal Influenza Vaccine",
    conditionMatch: (answers) => true, // Pertinent to all adults, especially seniors, chronic conditions, pregnancy
    whyShown: "Annual influenza vaccination is recommended for all adults in India. It is particularly critical for adults with chronic health conditions, older adults, and during monsoon and winter seasons.",
    discussionPoints: [
      "Ask about the optimal timing for the flu vaccine in your region of India (monsoon timing for western/southern/central zones vs. winter timing for northern India).",
      "Inquire whether a quadrivalent inactivated formulation is recommended for you.",
      "Discuss how annual vaccination protects vulnerable family members and infants at home."
    ],
    verifiedSource: "MoHFW Guidelines on Seasonal Influenza & WHO Global Surveillance",
    verificationStatus: "Verified: MoHFW / WHO Guidelines"
  },
  {
    id: "RULE-ROUTINE-TDAP-BOOSTER",
    title: "10-Year Tetanus & Diphtheria (Td / Tdap) Booster",
    targetVaccineId: "tetanus-diphtheria-pertussis-tdap",
    targetVaccineName: "Tdap / Td (Tetanus, Diphtheria, Pertussis)",
    conditionMatch: (answers) => answers.historyStatus === "booster_due" || answers.historyStatus === "unknown" || answers.historyStatus === "not_sure",
    whyShown: "Tetanus spores are widespread in Indian soil and environments. Immunity from childhood tetanus shots wanes gradually over 10 years, requiring a routine decennial booster.",
    discussionPoints: [
      "Ask your doctor when you last received a tetanus-containing vaccine (e.g. after a cut, injury, or routine check).",
      "Discuss substituting one dose of Tdap (which includes whooping cough protection) instead of plain tetanus toxoid (TT/Td).",
      "Review whether family members around newborn infants should update their whooping cough immunity."
    ],
    verifiedSource: "Ministry of Health & Family Welfare (MoHFW) Adult Immunization Guidance",
    verificationStatus: "Verified: MoHFW Guidelines"
  },

  // Health-condition specific rules
  {
    id: "RULE-DIABETES-HEPB-PNEUMO",
    title: "Immunization Priorities for Adults with Diabetes",
    targetVaccineId: "hepatitis-b",
    targetVaccineName: "Hepatitis B & Pneumococcal Vaccines for Diabetes",
    conditionMatch: (answers) => (answers.conditions || []).includes("diabetes"),
    whyShown: "You selected diabetes. In India (where over 100 million adults live with diabetes), people with diabetes have higher risks of severe pneumococcal pneumonia and higher exposure risk to Hepatitis B through fingerstick glucometers and lancets.",
    discussionPoints: [
      "Ask your diabetologist or physician about Hepatitis B vaccination if you were born before universal childhood Hep B rollout (circa 2005 in India).",
      "Discuss pneumococcal vaccination to protect your lungs against bacterial pneumonia.",
      "Review annual flu shot timing to avoid diabetic ketoacidosis or acute blood sugar destabilization during flu bouts."
    ],
    verifiedSource: "Research Society for the Study of Diabetes in India (RSSDI) & API Clinical Consensus",
    verificationStatus: "Verified: RSSDI / API Guidelines"
  },
  {
    id: "RULE-RESPIRATORY-ASTHMA-COPD",
    title: "Airway Defense: Vaccines for Asthma, COPD & Post-TB Lungs",
    targetVaccineId: "influenza-seasonal",
    targetVaccineName: "Influenza & Pneumococcal Vaccines",
    conditionMatch: (answers) => (answers.conditions || []).includes("respiratory"),
    whyShown: "You selected chronic respiratory conditions (such as asthma, COPD, bronchitis, or post-TB bronchiectasis). Respiratory infections in India trigger acute exacerbations and hospital visits.",
    discussionPoints: [
      "Discuss receiving both the seasonal flu vaccine and the pneumococcal vaccine.",
      "Ask your pulmonologist about scheduling vaccination before seasonal pollution spikes and monsoon weather shifts.",
      "Confirm that modern inactivated flu shots do not worsen underlying asthma or reactive airways."
    ],
    verifiedSource: "Indian Chest Society (ICS) & Association of Physicians of India",
    verificationStatus: "Verified: ICS / API Guidelines"
  },
  {
    id: "RULE-PREGNANCY-CONSIDERATIONS",
    title: "Pregnancy Immunization: Protecting Mother and Infant",
    targetVaccineId: "tetanus-diphtheria-pertussis-tdap",
    targetVaccineName: "Tdap & Inactivated Influenza (Avoid Live Vaccines)",
    conditionMatch: (answers) => (answers.conditions || []).includes("pregnancy") || answers.genderConsideration === "pregnant",
    whyShown: "You indicated pregnancy or pregnancy planning. In India, FOGSI and MoHFW guidelines recommend specific vaccines to transfer protective maternal antibodies across the placenta to the newborn.",
    discussionPoints: [
      "Ask your obstetrician about receiving 1 dose of Tdap between weeks 27 and 36 of your pregnancy.",
      "Confirm receiving the seasonal inactivated flu shot during any trimester.",
      "IMPORTANT SAFETY NOTE: Live attenuated vaccines (such as MMR, Varicella, and live Yellow Fever) are CONTRAINDICATED during active pregnancy and should be evaluated post-delivery."
    ],
    verifiedSource: "Federation of Obstetric and Gynaecological Societies of India (FOGSI) & MoHFW",
    verificationStatus: "Verified: FOGSI / MoHFW Guidelines"
  },
  {
    id: "RULE-YOUNG-WOMEN-HPV",
    title: "HPV Vaccination & Cervical Cancer Prevention",
    targetVaccineId: "human-papillomavirus-hpv",
    targetVaccineName: "HPV (Human Papillomavirus) Vaccine",
    conditionMatch: (answers) => answers.ageGroup === "18-29" || (answers.topics || []).includes("cancer_prevention") || (answers.conditions || []).includes("cervical_cancer_prevention"),
    whyShown: "Cervical cancer is the second most common cancer among Indian women, causing over 75,000 deaths annually in India. The HPV vaccine dramatically reduces oncogenic HPV infection.",
    discussionPoints: [
      "Ask your gynecologist about the HPV vaccine (quadrivalent, 9-valent, or indigenous vaccine).",
      "Learn why HPV vaccination remains beneficial up to age 26 (and up to age 45 after clinical discussion), even if you are already sexually active.",
      "Inquire about combining vaccination with regular cervical cancer screening (Pap smear / HPV DNA testing)."
    ],
    verifiedSource: "FOGSI Good Clinical Practice Guidelines & MoHFW NTAGI HPV Working Group",
    verificationStatus: "Verified: FOGSI / MoHFW Guidelines"
  },
  {
    id: "RULE-UNKNOWN-HISTORY-HANDLING",
    title: "Navigating Unavailable or Uncertain Past Vaccination Records",
    targetVaccineId: "hepatitis-b",
    targetVaccineName: "Serology Titer Testing & Safe Adult Catch-Up",
    conditionMatch: (answers) => answers.historyStatus === "unknown" || answers.historyStatus === "not_sure",
    whyShown: "You mentioned that your childhood vaccination records are unavailable or uncertain. In India, paper vaccination cards were frequently lost, and digitized adult registries are newly evolving.",
    discussionPoints: [
      "Ask your doctor about simple blood tests (such as Hepatitis B surface antibody titer, Rubella IgG, or Varicella IgG) to check your existing immunity without repeating doses unnecessarily.",
      "Remember that an unknown history is NOT proof that you were never vaccinated; your doctor will evaluate your individual history safely.",
      "Discuss a gradual, risk-based catch-up plan for high-priority routine vaccines (like Tdap and Influenza)."
    ],
    verifiedSource: "Clinical Practice Consensus on Adult Immunization in Developing Nations (API)",
    verificationStatus: "Verified: API Guidelines"
  },
  {
    id: "RULE-ANIMAL-EXPOSURE-RABIES",
    title: "Critical Rabies Awareness & Animal Exposure Safety",
    targetVaccineId: "rabies-prophylaxis",
    targetVaccineName: "Rabies Post-Exposure & Pre-Exposure Prophylaxis",
    conditionMatch: (answers) => (answers.topics || []).includes("animal_bites") || (answers.conditions || []).includes("animal_contact"),
    whyShown: "You selected animal exposure or animal bite safety. India accounts for approximately one-third of global rabies deaths. Rabies is 100% fatal once clinical symptoms begin, but 100% preventable with timely vaccination.",
    discussionPoints: [
      "Learn the urgent first-aid rule: IMMEDIATELY wash any animal bite or scratch with soap and running water for at least 15 minutes.",
      "Never apply chillies, turmeric, kerosene, or lime to animal wounds.",
      "Visit an anti-rabies clinic immediately for Rabies Vaccine and Rabies Immunoglobulin (RIG) evaluation.",
      "If you work regularly with animals (veterinarian, shelter worker), ask about pre-exposure vaccination."
    ],
    verifiedSource: "National Rabies Control Programme (NRCP) - MoHFW India",
    verificationStatus: "Verified: MoHFW NRCP Guidelines"
  }
];

export function evaluateQuestionnaire(answers) {
  if (!answers) return [];
  return EDUCATIONAL_RULES.filter((rule) => {
    try {
      return rule.conditionMatch(answers);
    } catch (e) {
      console.warn("Rule matching error:", e);
      return false;
    }
  });
}
