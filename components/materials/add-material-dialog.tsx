"use client"

import { useState } from "react"
import type { Material } from "@/types"
import { MATERIAL_CATEGORIES } from "@/constants"
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

interface AddMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMaterial: (material: Omit<Material, "id">) => void
}

export function AddMaterialDialog({ open, onOpenChange, onAddMaterial }: AddMaterialDialogProps) {
  const [formData, setFormData] = useState<Omit<Material, "id">>({
    name: "",
    category: "",
    location: "",
    status: "disponible",
    condition: "bon",
    quantity: 1,
    loanedQuantity: 0,
  })

  const handleSubmit = () => {
    if (formData.name && formData.category && formData.location) {
      onAddMaterial(formData)
      setFormData({
        name: "",
        category: "",
        location: "",
        status: "disponible",
        condition: "bon",
        quantity: 1,
      })
      onOpenChange(false)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
          <DialogDescription>Remplissez les informations du matériel à ajouter à l'inventaire.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du matériel *</Label>
            <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Ex: Chrono à Bande"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
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
                onChange={(e) => updateFormData("location", e.target.value)}
                placeholder="Ex: Limoges, Bordeaux, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => updateFormData("quantity", Number.parseInt(e.target.value))}
                min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <Input
                id="brand"
                value={formData.brand || ""}
                onChange={(e) => updateFormData("brand", e.target.value)}
                placeholder="Ex: ASUS, QUANTUM, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input
                id="model"
                value={formData.model || ""}
                onChange={(e) => updateFormData("model", e.target.value)}
                placeholder="Ex: Startme V, Intel, etc."
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="observations">Responsable</Label>
          <Textarea
              id="responsable"
              value={formData.responsible || ""}
              onChange={(e) => updateFormData("responsible", e.target.value)}
              placeholder="Responsable du matériel (Nom et Prénom)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">Observations</Label>
          <Textarea
              id="observations"
              value={formData.observations || ""}
              onChange={(e) => updateFormData("observations", e.target.value)}
              placeholder="Observations ou détails supplémentaires..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
