"use client"

import { useEffect, useState } from "react"
import type { Material } from "@/types"
import {MATERIAL_CATEGORIES, MATERIAL_CONDITIONS} from "@/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMaterials } from "@/hooks/use-materials"

interface EditMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material | null
  updateMaterial: (id: string, updates: Partial<Material>) => void
}

export function EditMaterialDialog({ open, onOpenChange, material, updateMaterial }: EditMaterialDialogProps) {
  const [formData, setFormData] = useState<Material | null>(material)

  useEffect(() => {
    if (material) {
      setFormData(material)
    }
  }, [material])

  const updateFormField = (field: keyof Material, value: any) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null)
  }

  const handleSubmit = () => {
    if (formData && formData.id && formData.name && formData.category && formData.location) {
      const { id, ...updates } = formData
      updateMaterial(id, updates)
      onOpenChange(false)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le matériel</DialogTitle>
          <DialogDescription>Modifiez les informations du matériel sélectionné.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du matériel *</Label>
            <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormField("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie"/>
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu / Emplacement *</Label>
            <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormField("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => updateFormField("quantity", Number.parseInt(e.target.value))}
                min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <Input
                id="brand"
                value={formData.brand || ""}
                onChange={(e) => updateFormField("brand", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input
                id="model"
                value={formData.model || ""}
                onChange={(e) => updateFormField("model", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsable</Label>
            <Input
                id="responsible"
                value={formData.responsible || ""}
                onChange={(e) => updateFormField("responsible", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">État</Label>
            <Select value={formData.condition} onValueChange={(value) => updateFormField("condition", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'état"/>
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_CONDITIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>


        <div className="space-y-2">
          <Label htmlFor="observations">Observations</Label>
          <Textarea
              id="observations"
              value={formData.observations || ""}
              onChange={(e) => updateFormField("observations", e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Modifier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
