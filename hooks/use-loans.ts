"use client"

import {useState} from "react"
import type {Loan, Material, MaterialCondition} from "@/types"

export function useLoans() {
    const [loans, setLoans] = useState<Loan[]>([])

    const addLoan = (loan: Omit<Loan, "id">) => {
        const newLoan: Loan = {
            ...loan,
            id: Date.now().toString(),
        }
        setLoans((prev) => [...prev, newLoan])

    }

    const returnMaterial = (
        loanId: string,
        returnCondition: MaterialCondition,
        materials: Material[],
        updateMaterial: (id: string, updates: Partial<Material>) => void
    ) => {
        const updatedLoan = loans.find((l) => l.id === loanId)
        if (!updatedLoan) return

        // Met à jour le prêt
        setLoans((prev) =>
            prev.map((loan) =>
                loan.id === loanId
                    ? {
                        ...loan,
                        actualReturnDate: new Date().toISOString().split("T")[0],
                        conditionAtReturn: returnCondition,
                    }
                    : loan
            )
        )

        // Met à jour le matériel via setMaterials
        const material = materials.find((m) => m.id === updatedLoan.materialId)
        if (!material) return

        const updatedMaterial: Material = {
            ...material,
            condition: returnCondition,
            loanedQuantity: Math.max((material.loanedQuantity || 0) - updatedLoan.quantity, 0),
            status: "disponible",
        }

        updateMaterial(updatedMaterial.id, {
            condition: updatedMaterial.condition,
            loanedQuantity: updatedMaterial.loanedQuantity,
            status: updatedMaterial.status,
        })
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
