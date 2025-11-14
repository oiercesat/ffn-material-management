export type MaterialStatus = "disponible" | "prêté" | "en_maintenance" | "perdu"
export type MaterialCondition = "excellent" | "bon" | "moyen" | "mauvais"

export interface Material {
  id: string
  name: string
  category: string
  subcategory?: string
  serialNumber?: string
  location: string
  status: MaterialStatus
  condition: MaterialCondition
  purchaseDate?: string
  value?: number
  description?: string
  brand?: string
  model?: string
  reference?: string
  associatedTo?: string
  responsible?: string
  usage?: string
  observations?: string
  quantity: number
  loanedQuantity?: number
  images?: string[]
}

export interface Loan {
  id: string
  materialId: string
  quantity: number
  borrowerName: string
  borrowerContact: string
  loanDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  notes?: string
  conditionAtLoan: MaterialCondition
  conditionAtReturn?: MaterialCondition
}
