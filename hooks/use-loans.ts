"use client"

import { useState } from "react"
import type { Loan, MaterialCondition } from "@/types"

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([])

  const addLoan = (loan: Omit<Loan, "id">) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
    }
    setLoans((prev) => [...prev, newLoan])
  }

  const returnMaterial = (loanId: string, returnCondition: MaterialCondition) => {
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === loanId
          ? {
              ...loan,
              actualReturnDate: new Date().toISOString().split("T")[0],
              conditionAtReturn: returnCondition,
            }
          : loan,
      ),
    )
  }

  const getActiveLoans = () => {
    return loans.filter((loan) => !loan.actualReturnDate)
  }

  const getOverdueLoans = () => {
    const today = new Date().toISOString().split("T")[0]
    return loans.filter((loan) => !loan.actualReturnDate && loan.expectedReturnDate < today)
  }

  return {
    loans,
    addLoan,
    returnMaterial,
    getActiveLoans,
    getOverdueLoans,
  }
}
