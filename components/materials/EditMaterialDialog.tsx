"use client"

import {useEffect, useState} from "react"
import type {Material} from "@/types"
import {MATERIAL_CATEGORIES, MATERIAL_CONDITIONS} from "@/constants"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Image as ImageIcon, X} from "lucide-react"

interface EditMaterialDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    material: Material | null
    updateMaterial: (id: string, updates: Partial<Material>) => void
}

export function EditMaterialDialog({open, onOpenChange, material, updateMaterial}: EditMaterialDialogProps) {
    const [formData, setFormData] = useState<Material | null>(material)
    const [imageError, setImageError] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(true)

    useEffect(() => {
        if (material) {
            setFormData(material)
            setImageError(false)
            setIsImageLoading(true)
        }
    }, [material])

    const updateFormField = (field: keyof Material, value: any) => {
        setFormData((prev) => prev ? {...prev, [field]: value} : null)
    }

    const handleSubmit = () => {
        if (formData && formData.id && formData.name && formData.category && formData.location) {
            const {id, ...updates} = formData
            updateMaterial(id, updates)
            onOpenChange(false)
        }
    }

    const hasImage = formData?.images && formData.images.length > 0
    const imageUrl = hasImage ? formData.images[0] : null

    if (!formData) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier le matériel</DialogTitle>
                    <DialogDescription>Modifiez les informations du matériel sélectionné.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Section Image */}
                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                        <Label className="text-base font-semibold mb-3 block">Photo du matériel</Label>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                {imageUrl && !imageError ? (
                                    <div className="relative">
                                        {isImageLoading && (
                                            <div
                                                className="absolute inset-0 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
                                                <ImageIcon className="w-12 h-12 text-slate-400"/>
                                            </div>
                                        )}
                                        <img
                                            src={imageUrl}
                                            alt={formData.name}
                                            className="w-48 h-48 object-cover rounded-lg shadow-md border-2 border-slate-200"
                                            onLoad={() => setIsImageLoading(false)}
                                            onError={() => {
                                                setImageError(true)
                                                setIsImageLoading(false)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-48 h-48 bg-slate-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                                        <ImageIcon className="w-16 h-16 text-slate-400 mb-2"/>
                                        <p className="text-sm text-slate-500 text-center px-4">
                                            {imageError ? "Erreur de chargement" : "Aucune image"}
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Formulaire */}
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
                            <Label htmlFor="serialNumber">N° de série *</Label>
                            <Input
                                id="serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => updateFormField("serialNumber", e.target.value)}
                                placeholder="Ex: 1234567890"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Catégorie *</Label>
                            <Select value={formData.category}
                                    onValueChange={(value) => updateFormField("category", value)}>
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
                            <Label htmlFor="reference">Référence</Label>
                            <Input
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => updateFormField("reference", e.target.value)}
                                placeholder="Ex: Ref12345, etc."
                            />
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
                            <Label htmlFor="condition">État</Label>
                            <Select value={formData.condition}
                                    onValueChange={(value) => updateFormField("condition", value)}>
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
                            rows={4}
                        />
                    </div>
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