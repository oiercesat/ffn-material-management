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
import { X, Upload } from "lucide-react"

interface EditMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material | null
  updateMaterial: (id: string, updates: Partial<Material>) => void
}

export function EditMaterialDialog({ open, onOpenChange, material, updateMaterial }: EditMaterialDialogProps) {
  const [formData, setFormData] = useState<Material | null>(material)
  const [files, setFiles] = useState<File[] | undefined>()
  const [uploading, setUploading] = useState(false)
  const [showDropzone, setShowDropzone] = useState(false)

  // States pour resize modal
  const [showResizeModal, setShowResizeModal] = useState(false)
  const [errorFile, setErrorFile] = useState<File | null>(null)

  useEffect(() => {
    if (material) {
      setFormData(material)
      setFiles(undefined)
      setShowDropzone(false)
      setShowResizeModal(false)
      setErrorFile(null)
    }
  }, [material])

  const updateFormField = (field: keyof Material, value: any) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null)
  }

  const handleDrop = (newFiles: File[]) => setFiles(newFiles)

  const uploadFileToS3 = async (file: File): Promise<string> => {
    const data = new FormData()
    data.append("file", file)
    const res = await fetch("/api/uploadFile", { method: "POST", body: data })
    if (!res.ok) throw new Error("Erreur upload")
    const result = await res.json()
    return result.url as string
  }

  const handleSubmit = async () => {
    if (!formData || !formData.id || !formData.name || !formData.category || !formData.location) return
    setUploading(true)

    try {
      let uploadedUrls: string[] = formData.images || []

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

  const removeImage = (indexToRemove: number) => {
    if (!formData?.images) return
    const newImages = formData.images.filter((_, i) => i !== indexToRemove)
    updateFormField("images", newImages)
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result?.toString().split(",")[1] as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleResize = async (file: File | null) => {
    if (!file) return

    const base64 = await fileToBase64(file)
    const res = await fetch("/api/resize", {
      method: "POST",
      body: JSON.stringify({ name: file.name, data: base64 })
    })
    const json = await res.json()
    const resizedUrl = json.url

    const resizedFile = await fetch(resizedUrl)
      .then(r => r.blob())
      .then(b => new File([b], file.name, { type: "image/jpeg" }))

    setFiles([resizedFile])
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le matériel</DialogTitle>
          <DialogDescription>Modifiez les informations du matériel sélectionné.</DialogDescription>
        </DialogHeader>

        {/* Section image */}
        <div className="space-y-6 bg-slate-50 rounded-lg p-6 border border-slate-200">
          <Label className="text-base font-semibold mb-3 block">Photo du matériel</Label>

          {formData.images && formData.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`${formData.name} ${idx}`} className="w-32 h-32 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!showDropzone ? (
            <Button variant="outline" className="w-full" onClick={() => setShowDropzone(true)}>
              <Upload className="w-4 h-4 mr-2" />
              {formData.images?.length ? "Ajouter d'autres images" : "Ajouter des images"}
            </Button>
          ) : (
            <div className="space-y-3">
              <Dropzone
                accept={{ 'image/*': [] }}
                maxFiles={10}
                maxSize={1024 * 1024 * 2}
                minSize={1024}
                onDrop={handleDrop}
                onDropRejected={(rejections) => {
                  const first = rejections[0]
                  const error = first?.errors?.[0]
                  const file = first?.file
                  if (error?.code === "file-too-large") {
                    setErrorFile(file)
                    setShowResizeModal(true)
                    return
                  }
                  alert(error?.message || "Erreur inconnue")
                }}
                src={files}
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setShowDropzone(false); setFiles(undefined) }}>
                Annuler l'ajout
              </Button>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du matériel *</Label>
            <Input value={formData.name} onChange={(e) => updateFormField("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serialNumber">N° de série *</Label>
            <Input value={formData.serialNumber} onChange={(e) => updateFormField("serialNumber", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(val) => updateFormField("category", val)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner"/></SelectTrigger>
              <SelectContent>
                {MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">État</Label>
            <Select value={formData.condition} onValueChange={(val) => updateFormField("condition", val)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner"/></SelectTrigger>
              <SelectContent>
                {MATERIAL_CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input value={formData.location} onChange={(e) => updateFormField("location", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input type="number" value={formData.quantity} onChange={(e) => updateFormField("quantity", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <Input value={formData.brand || ""} onChange={(e) => updateFormField("brand", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input value={formData.model || ""} onChange={(e) => updateFormField("model", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsable</Label>
            <Input value={formData.responsible || ""} onChange={(e) => updateFormField("responsible", e.target.value)} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea value={formData.observations || ""} onChange={(e) => updateFormField("observations", e.target.value)} rows={4} />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={uploading}>{uploading ? "Upload..." : "Modifier"}</Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal resize */}
      <Dialog open={showResizeModal} onOpenChange={setShowResizeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Image trop grande</DialogTitle>
            <DialogDescription>L’image dépasse la taille maximale autorisée. Souhaitez-vous la redimensionner automatiquement ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResizeModal(false)}>Annuler</Button>
            <Button onClick={() => { handleResize(errorFile); setShowResizeModal(false) }}>Redimensionner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}