import type { Material } from "@/types"

export const MATERIAL_CATEGORIES = [
  "Eau Libre",
  "Water Polo",
  "Natation Artistique",
  "Chronométrage",
  "Informatique",
  "Audiovisuel",
  "Autre",
]

export const MATERIAL_CONDITIONS = [
    "excellent",
    "bon",
    "moyen",
    "mauvais",
    ]

export const STATUS_COLORS = {
  disponible: "bg-green-100 text-green-800",
  prêté: "bg-blue-100 text-blue-800",
  en_maintenance: "bg-yellow-100 text-yellow-800",
  perdu: "bg-red-100 text-red-800",
}

export const CONDITION_COLORS = {
  excellent: "bg-green-100 text-green-800",
  bon: "bg-blue-100 text-blue-800",
  moyen: "bg-yellow-100 text-yellow-800",
  mauvais: "bg-red-100 text-red-800",
}

export const INITIAL_MATERIALS: Material[] = [
  {
    id: "1",
    name: "Chrono à Bande",
    category: "Eau Libre",
    location: "Limoges",
    status: "disponible",
    condition: "bon",
    quantity: 1,
  },
  {
    id: "2",
    name: "Bouées Directionnelles",
    category: "Eau Libre",
    location: "Limoges",
    status: "disponible",
    condition: "bon",
    quantity: 6,
  },
  {
    id: "3",
    name: "Talkies Walkies",
    category: "Eau Libre",
    location: "Limoges",
    status: "disponible",
    condition: "bon",
    quantity: 12,
  },
  {
    id: "4",
    name: "PC Bureau",
    category: "Informatique",
    brand: "ASUS",
    model: "Intel",
    serialNumber: "xx11a871",
    reference: "001_24",
    location: "Bordeaux",
    status: "disponible",
    condition: "bon",
    responsible: "Toto",
    observations: "Avec wifi",
    quantity: 1,
  },
]
