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
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'
import { Image as ImageIcon, X, Upload } from "lucide-react"

interface EditMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material | null
  updateMaterial: (id: string, updates: Partial<Material>) => void
}

export function EditMaterialDialog({ open, onOpenChange, material, updateMaterial }: EditMaterialDialogProps) {
  const [formData, setFormData] = useState<Material | null>(material)
  const [imageError, setImageError] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [files, setFiles] = useState<File[] | undefined>()
  const [uploading, setUploading] = useState(false)
  const [showDropzone, setShowDropzone] = useState(false)

  useEffect(() => {
    if (material) {
      setFormData(material)
      setImageError(false)
      setIsImageLoading(true)
      setFiles(undefined)
      setShowDropzone(false)
    }
  }, [material])

  const updateFormField = (field: keyof Material, value: any) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null)
  }

  const handleDrop = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const uploadFileToS3 = async (file: File): Promise<string> => {
    const data = new FormData()
    data.append("file", file)

    const res = await fetch("/api/uploadFile", { method: "POST", body: data })
    if (!res.ok) throw new Error("Erreur upload")

    const result = await res.json()
    return result.url as string
  }

  const handleSubmit = async () => {
    if (formData && formData.id && formData.name && formData.category && formData.location) {
      setUploading(true)

      try {
        let uploadedUrls: string[] = formData.images || []

        // Si de nouveaux fichiers ont été ajoutés
        if (files && files.length > 0) {
          const uploads = await Promise.all(files.map(uploadFileToS3))
          uploadedUrls = [...uploads, ...uploadedUrls]
        }

        const { id, ...updates } = { ...formData, images: uploadedUrls }
        updateMaterial(id, updates)
        onOpenChange(false)
      } catch (err) {
        console.error("Erreur d'upload:", err)
        alert("Erreur lors de l'upload du fichier")
      } finally {
        setUploading(false)
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    if (!formData?.images) return
    const newImages = formData.images.filter((_, index) => index !== indexToRemove)
    updateFormField("images", newImages)
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

            {/* Images existantes */}
            {formData?.images && formData.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-3">Images actuelles</p>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`${formData.name} - ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-slate-200"
                        onError={(e) => {
                          e.currentTarget.src = ""
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zone d'ajout de nouvelles images */}
            {!showDropzone ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowDropzone(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData?.images && formData.images.length > 0 ? "Ajouter d'autres images" : "Ajouter des images"}
              </Button>
            ) : (
              <div className="space-y-3">
                <Dropzone
                  accept={{ 'image/*': [] }}
                  maxFiles={10}
                  maxSize={1024 * 1024 * 10}
                  minSize={1024}
                  onDrop={handleDrop}
                  onError={console.error}
                  src={files}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setShowDropzone(false)
                    setFiles(undefined)
                  }}
                >
                  Annuler l'ajout
                </Button>
              </div>
            )}
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
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Upload..." : "Modifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}