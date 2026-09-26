// Synthetic Mock Dataset for Immunization Awareness & Decision Support System
// Zero real PII/PHI. Synthetic data for development, testing, and professional verification.

export const SAMPLE_PROFILES = [
  {
    id: "SYN-USR-001",
    name: "Jane Doe (Synthetic)",
    dob: "1994-06-15",
    age: 32,
    sex: "female",
    country: "USA",
    pregnancyStatus: "pregnant_2nd_trimester",
    medicalConditions: ["asthma"],
    allergies: ["neomycin_severe_anaphylaxis"],
    immunocompromised: false,
    immunoMedications: [],
    occupation: "healthcare_worker",
    travelDestination: "Brazil",
    travelDate: "2026-11-01",
    historyKnown: true,
  },
  {
    id: "SYN-USR-002",
    name: "John Smith (Synthetic)",
    dob: "1958-03-22",
    age: 68,
    sex: "male",
    country: "USA",
    pregnancyStatus: "not_applicable",
    medicalConditions: ["type_2_diabetes", "chronic_kidney_disease"],
    allergies: [],
    immunocompromised: true,
    immunoMedications: ["prednisone_high_dose"],
    occupation: "retired",
    travelDestination: "none",
    travelDate: "",
    historyKnown: false, // Record partially missing!
  }
];

export const INITIAL_VACCINATION_HISTORY = [
  {
    id: "HIST-101",
    userId: "SYN-USR-001",
    vaccineCode: "COVID19_mRNA",
    vaccineName: "COVID-19 mRNA (Spikevax / Comirnaty)",
    doseNumber: 3,
    administrationDate: "2023-09-15",
    status: "completed",
    notes: "3-dose primary + booster completed in 2023"
  },
  {
    id: "HIST-102",
    userId: "SYN-USR-001",
    vaccineCode: "MMR",
    vaccineName: "Measles, Mumps, Rubella (MMR)",
    doseNumber: 2,
    administrationDate: "2002-08-10",
    status: "completed",
    notes: "Childhood series"
  },
  {
    id: "HIST-103",
    userId: "SYN-USR-001",
    vaccineCode: "TDAP",
    vaccineName: "Tetanus, Diphtheria, Acellular Pertussis (Tdap)",
    doseNumber: 1,
    administrationDate: "2018-04-12",
    status: "completed",
    notes: "Over 5 years ago"
  },
  {
    id: "HIST-104",
    userId: "SYN-USR-001",
    vaccineCode: "HEP_B",
    vaccineName: "Hepatitis B",
    doseNumber: 1,
    administrationDate: "2024-01-10",
    status: "partial",
    notes: "Dose 1 received, Dose 2 and 3 unrecorded"
  }
];
