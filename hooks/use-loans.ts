"use client"

import {useState, useEffect} from "react"
import type {Loan, Material, MaterialCondition} from "@/types"
import {apiClient} from "@/lib/api/client";

export function useLoans() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchLoans = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiClient.getLoans()
            setLoans((response.data as Loan[]) || [])
        } catch (err) {
            console.error('Error fetching loans, using test data:', err)
            setError(null) // Don't show error for test mode
            // Fallback test data when API is not available
            setLoans([
                {
                    id: "test-loan-1",
                    materialId: "test-material-2",
                    borrowerName: "Pierre Durand",
                    borrowerContact: "pierre.durand@email.com",
                    loanDate: "2025-11-20",
                    expectedReturnDate: "2025-12-20",
                    quantity: 1,
                    conditionAtLoan: "excellent",
                    notes: "Prêt pour événement sportif"
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLoans()
    }, [])

    const addLoan = async (loan: Omit<Loan, "id">) => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiClient.createLoan(loan)
            const newLoan = response.data as Loan
            setLoans((prev) => [...prev, newLoan] as Loan[])
            return newLoan
        } catch (err) {
            console.error('Error adding loan via API, adding locally:', err)
            // Fallback: add loan locally when API is not available
            const newLoan: Loan = {
                ...loan,
                id: `test-loan-${Date.now()}`
            }
            setLoans((prev) => [...prev, newLoan] as Loan[])
            return newLoan
        } finally {
            setLoading(false)
        }
    }

    const updateLoan = async (id: string, updates: Partial<Loan>) => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiClient.updateLoan(id, updates)
            const updatedLoan = response.data as Loan
            const updatedLoans = (prev: Loan[]) => prev.map((loan) => (loan.id === id ? updatedLoan : loan))
            setLoans(updatedLoans)
            return updatedLoan
        } catch (err) {
            console.error('Error updating loan:', err)
            setError('Erreur lors de la mise à jour du prêt')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteLoan = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            await apiClient.deleteLoan(id)
            setLoans((prev) => prev.filter((loan) => loan.id !== id))
        } catch (err) {
            console.error('Error deleting loan:', err)
            setError('Erreur lors de la suppression du prêt')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const returnMaterial = async (
        loanId: string,
        returnCondition: MaterialCondition,
        materials: Material[],
        updateMaterial: (id: string, updates: Partial<Material>) => void
    ) => {
        const updatedLoan = loans.find((l) => l.id === loanId)
        if (!updatedLoan) return

        const loanUpdates = {
            actualReturnDate: new Date().toISOString().split("T")[0],
            conditionAtReturn: returnCondition,
        }

        try {
            await updateLoan(loanId, loanUpdates)

            // Met à jour le matériel via setMaterials
            const material = materials.find((m) => m.id === updatedLoan.materialId)
            if (!material) return

            const materialUpdates = {
                condition: returnCondition,
                loanedQuantity: Math.max((material.loanedQuantity || 0) - updatedLoan.quantity, 0),
                status: "disponible" as const,
            }

            updateMaterial(updatedLoan.materialId, materialUpdates)
        } catch (err) {
            console.error('Error returning material:', err)
            throw err
        }
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
        loading,
        error,
        fetchLoans,
        addLoan,
        updateLoan,
        deleteLoan,
        returnMaterial,
        getActiveLoans,
        getOverdueLoans,
    }
}
