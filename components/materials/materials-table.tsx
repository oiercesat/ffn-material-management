"use client"

import type { Material } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Edit } from "lucide-react"

interface MaterialsTableProps {
  materials: Material[]
  onLoanMaterial: (material: Material) => void
  onEditMaterial: (material: Material) => void
}

export function MaterialsTable({ materials, onLoanMaterial, onEditMaterial }: MaterialsTableProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun matériel trouvé</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Lieu</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Quantité</TableHead>
          <TableHead>Marque/Modèle</TableHead>
          <TableHead>État</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={material.id}>
            <TableCell className="font-medium">
              <div>
                <div>{material.name}</div>
                {material.serialNumber && (
                  <div className="text-sm text-muted-foreground">S/N: {material.serialNumber}</div>
                )}
                {material.reference && <div className="text-sm text-muted-foreground">Ref: {material.reference}</div>}
              </div>
            </TableCell>
            <TableCell>
                {material.images && material.images.length > 0 ? (
                    <img
                    src={material.images[0]}
                    alt={material.name}
                    className="w-12 h-12 object-cover rounded"
                    />
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-muted text-muted-foreground rounded">
                    N/A
                    </div>
                )}

            </TableCell>
            <TableCell>{material.category}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {material.location}
              </div>
            </TableCell>
            <TableCell>
              {material.responsible}
            </TableCell>
            <TableCell>{material.quantity - material.loanedQuantity}</TableCell>
            <TableCell>
              {material.brand && material.model
                ? `${material.brand} ${material.model}`
                : material.brand || material.model || "-"}
            </TableCell>
            <TableCell>
              <Badge className={
                material.condition === "excellent" ? "bg-green-100 text-green-800" :
                material.condition === "bon" ? "bg-blue-100 text-blue-800":
                material.condition === "moyen" ? "bg-yellow-100 text-yellow-800" :
                material.condition === "mauvais" ? "bg-red-100 text-red-800":
                "bg-blue-100 text-blue-800"// Default to "bon" if condition is unknown
              }>{material.condition}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={
                material.status === "disponible" ? "bg-green-100 text-green-800" :
                material.status === "prêté" ? "bg-blue-100 text-blue-800" :
                material.status === "en_maintenance" ? "bg-yellow-100 text-yellow-800" :
                material.status === "perdu" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800" // Default to gray if status is unknown
              }>{material.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {material.status === "disponible" && material.quantity > 0 && (
                  <Button size="sm" onClick={() => onLoanMaterial(material)}>
                    Prêter
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onEditMaterial(material)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
