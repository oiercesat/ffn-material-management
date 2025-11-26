"use client"

import {createContext, useContext, useEffect, useState} from "react"
import type {Material} from "@/types"
import {apiClient} from "@/lib/api/client";

type MaterialsContextType = {
    materials: Material[]
    addMaterial: (material: Omit<Material, "id">) => void
    updateMaterial: (id: string, updates: Partial<Material>) => void
    deleteMaterial: (id: string) => void
    getMaterialById: (id: string) => Material | undefined
    getFilteredMaterials: (category: string, searchTerm: string) => Material[]
    getStats: () => { total: number; available: number; loaned: number }
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined)

export function MaterialsProvider({children}: { children: React.ReactNode }) {
    const [materials, setMaterials] = useState<Material[]>([])

    const addMaterial = (material: Omit<Material, "id">) => {
        const newMaterial: Material = {
            ...material,
            id: Date.now().toString(),
        }
        apiClient.createMaterial(material)
        setMaterials((prev) => [...prev, newMaterial])
    }

    const updateMaterial = (id: string, updates: Partial<Material>) => {
        apiClient.updateMaterial(id, updates)
        setMaterials((prev) =>
            prev.map((material) => (material.id === id ? {...material, ...updates} : material))
        )
    }

    const deleteMaterial = (id: string) => {
        apiClient.deleteMaterial(id)
        setMaterials((prev) => prev.filter((material) => material.id !== id))
    }

    const getMaterialById = (id: string) => {
        apiClient.getMaterialById(id)
        return materials.find((material) => material.id === id)
    }

    const getFilteredMaterials = (category: string, searchTerm: string) => {
        return materials.filter((material) => {
            const matchesCategory = category === "all" || material.category === category
            const matchesSearch =
                material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (material.brand && material.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (material.model && material.model.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchesCategory && matchesSearch
        })
    }

    const getStats = () => {
        const total = materials.reduce((acc, m) => acc + m.quantity, 0)
        const loaned = materials.reduce((acc, m) => acc + (m.loanedQuantity || 0), 0)
        const available = total - loaned

        return {total, available, loaned}
    }

    useEffect(() => {
        apiClient.getMaterials().then(response => {
            if (response.data) {
                setMaterials(response.data as Material[])
            }
        })
    }, []);

    return (
        <MaterialsContext.Provider
            value={{
                materials,
                addMaterial,
                updateMaterial,
                deleteMaterial,
                getMaterialById,
                getFilteredMaterials,
                getStats,
            }}
        >
            {children}
        </MaterialsContext.Provider>
    )
}

export function useMaterials() {
    const context = useContext(MaterialsContext)
    if (!context) {
        throw new Error("useMaterials must be used within a MaterialsProvider")
    }
    return context
}
