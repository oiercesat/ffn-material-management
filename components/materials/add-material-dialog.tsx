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
  const [resizedImageUrl, setResizedImageUrl] = useState<string | null>(null)

  const handleDrop = (files: File[]) => {
    setFiles(files)
  }

  const uploadFileToS3 = async function uploadFile(file: File): Promise<string> {
    const apiURL = process.env.NEXT_PUBLIC_UPLOAD_API;

    if (!apiURL) {
      throw new Error("API URL is not configured");
    }

    const res = await fetch(apiURL, {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
      }
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    
    if (json.error) {
      throw new Error(json.error);
    }

    return json.publicUrl || json.location || json.fileName;
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.location) return

    setUploading(true)

    try {
      let uploadedUrls: string[] = []

      // Ajouter l'URL de l'image redimensionnée si elle existe
      if (resizedImageUrl) {
        uploadedUrls.push(resizedImageUrl)
      }

      // Upload seulement les fichiers qui ne sont pas encore dans S3
      if (files && files.length > 0) {
        const uploads = await Promise.all(files.map(uploadFileToS3))
        uploadedUrls.push(...uploads)
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
      setResizedImageUrl(null)
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
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleResize = async (file: File | null) => {
    if (!file) return;

    try {
      console.log("🚀 Début du redimensionnement pour:", file.name);
      const base64 = await fileToBase64(file);
      
      console.log("📤 Envoi de la requête vers Lambda...");
      
      const resizeUrl = process.env.NEXT_PUBLIC_AWS_RESIZE_URL;
      if (!resizeUrl) {
        throw new Error("URL de redimensionnement non configurée");
      }
      
      const res = await fetch(resizeUrl, {
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

      console.log("📥 Statut de la réponse:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erreur API:", errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const json = await res.json();
      console.log("✅ Réponse Lambda:", json);

      if (json.success && json.data.s3Url) {
        const resizedImageUrl = json.data.s3Url;
        console.log("🖼️ Image redimensionnée disponible à:", resizedImageUrl);
        
        // Stocker l'URL de l'image redimensionnée qui est déjà dans S3
        setResizedImageUrl(resizedImageUrl);
        
        setErrorFile(null);
        
      } else {
        throw new Error("Réponse Lambda invalide");
      }

    } catch (error) {
      console.error("❌ Erreur resize:", error);
      alert(`Erreur lors du redimensionnement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDeleteResizedImage = async () => {
    if (!resizedImageUrl) return;

    try {
      console.log("🗑️ Suppression de l'image redimensionnée:", resizedImageUrl);
      
      const deleteUrl = process.env.NEXT_PUBLIC_AWS_DELETE_URL;
      if (!deleteUrl) {
        throw new Error("URL de suppression non configurée");
      }
      
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: resizedImageUrl
        })
      });

      console.log("📥 Statut de la suppression:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erreur API suppression:", errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const json = await res.json();
      console.log("✅ Réponse Lambda suppression:", json);

      if (json.message && json.message.includes('deleted successfully')) {
        console.log("🖼️ Image supprimée avec succès du bucket S3");
        setResizedImageUrl(null);
      } else {
        throw new Error("Échec de la suppression");
      }

    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] my-4 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
          <DialogDescription>Remplissez les informations du matériel à ajouter à l'inventaire.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1 space-y-4">
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

        {/* Affichage de l'image redimensionnée */}
        {resizedImageUrl && (
          <div className="space-y-2">
            <Label>Image redimensionnée (déjà dans S3)</Label>
            <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-lg">
              <img 
                src={resizedImageUrl} 
                alt="Image redimensionnée" 
                className="w-16 h-16 object-cover rounded-md border"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Image redimensionnée avec succès</p>
                <p className="text-xs text-green-600">Cette image est prête pour l'upload</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDeleteResizedImage()}
                className="text-red-600 hover:text-red-700"
              >
                Supprimer
              </Button>
            </div>
          </div>
        )}

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
          disabled={!!resizedImageUrl} // Désactiver si une image redimensionnée existe
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>

        {resizedImageUrl && (
          <p className="text-xs text-amber-600 text-center">
            💡 La dropzone est désactivée car vous avez déjà une image redimensionnée. Supprimez-la pour ajouter d'autres images.
          </p>
        )}
        </div>

        <DialogFooter className="flex-shrink-0">
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
