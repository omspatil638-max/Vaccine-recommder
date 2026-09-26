"""Answer vocabularies shared by the API and the UI. Not medical rules."""

TRI = ("yes", "no", "unsure")

SAFETY_FACTS = {
    "current_illness": "Are you unwell right now with a moderate or severe illness (with or without a fever)?",
    "current_shingles": "Do you have shingles right now?",
    "recent_blood_product": "In the last 11 months, have you had a blood transfusion, blood product, or antibody treatment (immune globulin)?",
    "thrombocytopenia": "Have you ever had a low platelet count (thrombocytopenia)?",
    "antivirals_24h": "In the last day, have you taken acyclovir, famciclovir or valacyclovir (herpes antiviral medicines)?",
    "neuro_unstable": "Do you have a nervous system condition that is getting worse or isn't controlled, such as uncontrolled seizures?",
    "family_immunodeficiency": "Do immune system problems run in your family (for example, a parent or sibling born with a weak immune system)?",
}

ALLERGY_CATEGORIES = ("food", "medication", "vaccine_ingredient", "environment", "other")
ALLERGY_SEVERITIES = ("anaphylaxis", "non_severe", "unknown")
ALLERGY_SUBSTANCES = {
    "egg": "Egg",
    "gelatin": "Gelatin",
    "yeast": "Yeast",
    "neomycin": "Neomycin (an antibiotic)",
    "polysorbate": "Polysorbate",
    "latex": "Latex",
    "peanut": "Peanut or tree nuts",
    "milk": "Milk",
    "shellfish": "Shellfish",
    "penicillin": "Penicillin",
    "insect": "Insect stings",
    "other": "Something else",
}

REACTION_KINDS = {
    "anaphylaxis": "A severe allergic reaction (such as anaphylaxis)",
    "gbs_6_weeks": "Guillain-Barré syndrome within 6 weeks",
    "encephalopathy_7_days": "Encephalopathy (coma, reduced consciousness or long seizures) within 7 days",
    "arthus": "A severe local reaction with swelling (Arthus reaction)",
    "fainting": "Fainting",
    "other": "Something else",
    "unsure": "I'm not sure what it was",
}

# Products a user may know they received. Used for history, not for decisions,
# except where a rule names products (pneumococcal).
PRODUCTS = {
    "tdap": {"tdap": "Tdap", "td": "Td", "unknown": "Not sure which"},
    "pneumococcal": {
        "pcv20": "PCV20 (Prevnar 20)", "pcv21": "PCV21 (Capvaxive)", "pcv15": "PCV15 (Vaxneuvance)",
        "pcv13": "PCV13 (Prevnar 13)", "ppsv23": "PPSV23 (Pneumovax 23)", "unknown": "Not sure which",
    },
    "td": {"td": "Td", "tt": "TT (older tetanus vaccine)", "unknown": "Not sure which"},
}

US_REGIONS = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico",
]

IN_REGIONS = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
]

JURISDICTIONS = [
    {"code": "US", "name": "United States", "regions": US_REGIONS, "regionLabel": "State"},
    {"code": "IN", "name": "India", "regions": IN_REGIONS, "regionLabel": "State or union territory"},
    {"code": "OTHER", "name": "Another country", "regions": [], "regionLabel": "Region"},
]
