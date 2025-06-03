"use client"

import type { Material } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Edit } from "lucide-react"
import { STATUS_COLORS, CONDITION_COLORS } from "@/constants"

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
            <TableCell>{material.quantity}</TableCell>
            <TableCell>
              {material.brand && material.model
                ? `${material.brand} ${material.model}`
                : material.brand || material.model || "-"}
            </TableCell>
            <TableCell>
              <Badge className={CONDITION_COLORS[material.condition]}>{material.condition}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={STATUS_COLORS[material.status]}>{material.status}</Badge>
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
