"use client"

import type { Loan, Material, MaterialCondition } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { CONDITION_COLORS } from "@/constants"

interface LoansTableProps {
  loans: Loan[]
  materials: Material[]
  onReturnMaterial: (loanId: string, condition: MaterialCondition) => void
}

export function LoansTable({ loans, materials, onReturnMaterial }: LoansTableProps) {
  const getMaterialName = (materialId: string) => {
    return materials.find((m) => m.id === materialId)?.name || "Matériel inconnu"
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun prêt en cours</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matériel</TableHead>
          <TableHead>Emprunteur</TableHead>
          <TableHead>Date de prêt</TableHead>
          <TableHead>Retour prévu</TableHead>
          <TableHead>État au prêt</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell className="font-medium">{getMaterialName(loan.materialId)}</TableCell>
            <TableCell>
              <div>
                <div>{loan.borrowerName}</div>
                <div className="text-sm text-muted-foreground">{loan.borrowerContact}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(loan.loanDate).toLocaleDateString("fr-FR")}
              </div>
            </TableCell>
            <TableCell>
              <div
                className={`flex items-center ${
                  loan.expectedReturnDate < new Date().toISOString().split("T")[0] ? "text-red-600" : ""
                }`}
              >
                <Clock className="w-4 h-4 mr-1" />
                {new Date(loan.expectedReturnDate).toLocaleDateString("fr-FR")}
                {loan.expectedReturnDate < new Date().toISOString().split("T")[0] && (
                  <AlertTriangle className="w-4 h-4 ml-1 text-red-600" />
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={CONDITION_COLORS[loan.conditionAtLoan]}>{loan.conditionAtLoan}</Badge>
            </TableCell>
            <TableCell>
              <Select onValueChange={(value) => onReturnMaterial(loan.id, value as MaterialCondition)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Retourner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="bon">Bon</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="mauvais">Mauvais</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
