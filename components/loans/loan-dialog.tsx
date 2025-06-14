"use client"

import {useState} from "react"
import type {Loan, Material} from "@/types"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
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
    material: Material
    onOpenChange: (open: boolean) => void
    onAddLoan: (loan: Omit<Loan, "id">) => void
}

export function LoanDialog({open,material, onOpenChange, onAddLoan}: AddMaterialDialogProps) {
    const [formData, setFormData] = useState<Omit<Loan, "id">>({
        materialId: material.id,
        quantity: 1,
        borrowerName: "",
        borrowerContact: "",
        loanDate: new Date().toISOString().split("T")[0],
        expectedReturnDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
        conditionAtLoan: material.condition,
        notes: "",
    })

    const handleSubmit = () => {
        if (formData.loanDate && formData.expectedReturnDate && formData.borrowerName) {
            material.loanedQuantity = (material.loanedQuantity || 0) + formData.quantity
            if (material.quantity - (formData.quantity+material.loanedQuantity) <= 0) {
                material.status = "prêté"
            }
            onAddLoan(formData)
            setFormData({
                materialId: material.id,
                quantity: 1,
                borrowerName: "",
                borrowerContact: "",
                loanDate: new Date().toISOString().split("T")[0],
                expectedReturnDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
                conditionAtLoan: material.condition,
                observations: "",
            })
            onOpenChange(false)
        }
    }

    const updateFormData = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({...prev, [field]: value}))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Prêter un matériel</DialogTitle>
                    <DialogDescription>Remplissez les informations du prêt</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom et prénom de l'emprunteur</Label>
                        <Input
                            id="borrowerName"
                            value={formData.borrowerName}
                            onChange={(e) => updateFormData("borrowerName", e.target.value)}
                            placeholder="Ex: Jean Dupont"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="borrowerContact">Contact de l'emprunteur</Label>
                        <Input
                            id="borrowerContact"
                            value={formData.borrowerContact}
                            onChange={(e) => updateFormData("borrowerContact", e.target.value)}
                            placeholder="Ex: jean.dupond@gmail.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">Date du début d'emprunt</Label>
                        <Input
                            id="loanDate"
                            type="date"
                            value={formData.loanDate}
                            onChange={(e) => updateFormData("loanDate", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedReturnDate">Date de retour prévue</Label>
                        <Input
                            id="expectedReturnDate"
                            type="date"
                            value={formData.expectedReturnDate}
                            onChange={(e) => updateFormData("expectedReturnDate", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={material.quantity}
                            value={formData.quantity}
                            onChange={(e) => updateFormData("quantity", parseInt(e.target.value))}
                        />
                    </div>
                </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations">Observations</Label>
                        <Textarea
                            id="observations"
                            value={formData.notes || ""}
                            onChange={(e) => updateFormData("notes", e.target.value)}
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
