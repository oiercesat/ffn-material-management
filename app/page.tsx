'use client'

import { useMemo, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Dialog, DialogTrigger} from "@/components/ui/dialog"
import {Plus, Search} from "lucide-react"

import {useMaterials, MaterialsProvider} from "@/providers/MaterialsProvider"
import {useLoans} from "@/hooks/use-loans"
import {MATERIAL_CATEGORIES} from "@/constants"
import type {Material, MaterialCondition} from "@/types"

import {StatsCards} from "@/components/dashboard/stats-cards"
import {MaterialsTable} from "@/components/materials/materials-table"
import {AddMaterialDialog} from "@/components/materials/add-material-dialog"
import {LoansTable} from "@/components/loans/loans-table"
import {LoanDialog} from "@/components/loans/loan-dialog"
import {EditMaterialDialog} from "@/components/materials/EditMaterialDialog"

function MaterialManagementContent() {
    const {materials, addMaterial, getFilteredMaterials, getStats, updateMaterial} = useMaterials()
    const {getActiveLoans, getOverdueLoans, addLoan, returnMaterial} = useLoans()

    const [activeCategory, setActiveCategory] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
    const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
    const [loanMaterial, setLoanMaterial] = useState<Material>({
        id: "",
        name: "",
        category: "",
        location: "",
        status: "disponible",
        condition: "bon",
        quantity: 1,
        brand: "",
        model: "",
    })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

    const stats = getStats()
    const activeLoans = getActiveLoans()
    const overdueLoans = getOverdueLoans()

    const handleLoanMaterial = (material: Material) => {
        setLoanMaterial(material)
        setIsLoanDialogOpen(true)
    }

    const handleEditMaterial = (material: Material) => {
        setSelectedMaterial(material)
        setEditDialogOpen(true)
    }

    const handleReturnMaterial = (loanId: string, condition: MaterialCondition) => {
        returnMaterial(loanId, condition, materials, updateMaterial)
    }


    const filteredMaterials = useMemo(
        () => getFilteredMaterials(activeCategory, searchTerm),
        [materials, activeCategory, searchTerm]
    )

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestion du Matériel de la ligue nouvelle Aquitaine</h1>
                    <p className="text-muted-foreground">Suivez et gérez votre inventaire de matériel sportif et
                        technique</p>
                </div>
                <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2"/>
                            Ajouter du matériel
                        </Button>
                    </DialogTrigger>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <StatsCards
                totalMaterials={stats.total}
                availableMaterials={stats.available}
                loanedMaterials={stats.loaned}
                overdueLoans={overdueLoans.length}
            />

            {/* Main Content */}
            <Tabs defaultValue="materials" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="materials">Inventaire</TabsTrigger>
                    <TabsTrigger value="loans">Prêts en cours</TabsTrigger>
                </TabsList>

                <TabsContent value="materials" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventaire du matériel</CardTitle>
                            <CardDescription>
                                Liste complète de votre matériel avec statut et emplacement
                            </CardDescription>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        placeholder="Rechercher par nom, lieu, marque..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={activeCategory} onValueChange={setActiveCategory}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Toutes catégories"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes catégories</SelectItem>
                                        {MATERIAL_CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MaterialsTable
                                materials={filteredMaterials}
                                onLoanMaterial={handleLoanMaterial}
                                onEditMaterial={handleEditMaterial}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="loans" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prêts en cours</CardTitle>
                            <CardDescription>
                                Matériel actuellement prêté et dates de retour prévues
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoansTable
                                loans={activeLoans}
                                materials={materials}
                                onReturnMaterial={handleReturnMaterial}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Material Dialog */}
            <AddMaterialDialog
                open={isAddMaterialOpen}
                onOpenChange={setIsAddMaterialOpen}
                onAddMaterial={addMaterial}
            />

            {/* Loan Material Dialog */}
            <LoanDialog
                open={isLoanDialogOpen}
                onOpenChange={setIsLoanDialogOpen}
                onAddLoan={addLoan}
                material={loanMaterial}
            />

            {/* Edit Material Dialog */}
            <EditMaterialDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                material={selectedMaterial}
                updateMaterial={updateMaterial}
            />
        </div>
    )
}

// Wrapping the content with the provider
export default function MaterialManagementPage() {
    return (
        <MaterialsProvider>
            <MaterialManagementContent/>
        </MaterialsProvider>
    )
}
