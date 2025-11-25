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
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'

interface AddMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMaterial: (material: Omit<Material, "id">) => void
}

export function AddMaterialDialog({ open, onOpenChange, onAddMaterial }: AddMaterialDialogProps) {
  const [formData, setFormData] = useState<Omit<Material, "id">>({
    name: "",
    serialNumber: "",
    category: "",
    reference: "",
    location: "",
    status: "disponible",
    condition: "bon",
    quantity: 1,
    loanedQuantity: 0,
  })

  const [showResizeModal, setShowResizeModal] = useState(false)
  const [errorFile, setErrorFile] = useState<File | null>(null)

  const [files, setFiles] = useState<File[] | undefined>()
  const [uploading, setUploading] = useState(false)

  const handleDrop = (files: File[]) => {
    setFiles(files)
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
    if (!formData.name || !formData.category || !formData.location) return

    setUploading(true)

    try {
      let uploadedUrls: string[] = []

      if (files && files.length > 0) {
        const uploads = await Promise.all(files.map(uploadFileToS3))
        uploadedUrls = uploads
      }

      const newMaterial = {
        ...formData,
        images: uploadedUrls,
      }

      onAddMaterial(newMaterial)

      setFormData({
        name: "",
        serialNumber: "",
        category: "",
        reference: "",
        location: "",
        status: "disponible",
        condition: "bon",
        quantity: 1,
        loanedQuantity: 0,
      })
      setFiles(undefined)
      onOpenChange(false)
    } catch (err) {
      console.error("Erreur d'upload:", err)
      alert("Erreur lors de l’upload du fichier")
    } finally {
      setUploading(false)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject('Erreur de lecture du fichier');
        }
      }
      reader.onerror = (error) => reject(error);
    });
  };

  const handleResize = async (file: File | null) => {
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      
      // URL de votre Lambda
      const res = await fetch("http://localhost:4566/restapis/u8kwtam4lj/test/_user_request_/resize", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          width: 800,
          height: 600,
          format: 'jpeg',
          quality: 80
        })
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const json = await res.json();
      console.log("Réponse Lambda:", json);

      if (json.success) {
        // Récupérer l'image redimensionnée depuis S3
        const resizedImageUrl = json.data.s3Url;
        console.log("Image redimensionnée disponible à:", resizedImageUrl);
        
        // Vous pouvez maintenant utiliser cette URL pour afficher l'image
        // ou la télécharger pour l'ajouter à vos files
      }

    } catch (error) {
      console.error("Erreur resize:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
          <DialogDescription>Remplissez les informations du matériel à ajouter à l'inventaire.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* 🧱 Champs inchangés */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du matériel *</Label>
            <Input id="name" value={formData.name} onChange={(e) => updateFormData("name", e.target.value)} placeholder="Ex: Chrono à Bande" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serialNumber">N° de série *</Label>
            <Input id="serialNumber" value={formData.serialNumber} onChange={(e) => updateFormData("serialNumber", e.target.value)} placeholder="Ex: 1234567890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
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
            <Input id="reference" value={formData.reference} onChange={(e) => updateFormData("reference", e.target.value)} placeholder="Ex: Ref12345, etc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Lieu / Emplacement *</Label>
            <Input id="location" value={formData.location} onChange={(e) => updateFormData("location", e.target.value)} placeholder="Ex: Limoges, Bordeaux, etc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => updateFormData("quantity", Number.parseInt(e.target.value))} min="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <Input id="brand" value={formData.brand || ""} onChange={(e) => updateFormData("brand", e.target.value)} placeholder="Ex: ASUS, QUANTUM, etc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input id="model" value={formData.model || ""} onChange={(e) => updateFormData("model", e.target.value)} placeholder="Ex: Startme V, Intel, etc." />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsible">Responsable</Label>
          <Textarea id="responsible" value={formData.responsible || ""} onChange={(e) => updateFormData("responsible", e.target.value)} placeholder="Responsable du matériel (Nom et Prénom)" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">Observations</Label>
          <Textarea id="observations" value={formData.observations || ""} onChange={(e) => updateFormData("observations", e.target.value)} placeholder="Observations ou détails supplémentaires..." />
        </div>

        <Dropzone
          accept={{ 'image/*': [] }}
          maxFiles={10}
          maxSize={1024 * 1024 * 2}
          minSize={1024}
          onDrop={handleDrop}
          onDropRejected={(rejections) => {
            const first = rejections[0];
            const error = first?.errors?.[0];
            const file = first?.file;

            if (error?.code === "file-too-large") {
              setErrorFile(file);
              setShowResizeModal(true);
              return;
            }

            alert(error?.message || "Erreur inconnue");
          }}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Upload..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <Dialog open={showResizeModal} onOpenChange={setShowResizeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Image trop grande</DialogTitle>
            <DialogDescription>
              L’image dépasse la taille maximale autorisée.  
              Souhaitez-vous la redimensionner automatiquement ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResizeModal(false)}>
              Annuler
            </Button>

            <Button
              onClick={() => {
                handleResize(errorFile)
                setShowResizeModal(false)
              }}
            >
              Redimensionner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
