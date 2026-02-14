"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Observation } from "@/lib/data"

interface DeleteObservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  observation: Observation | null
  onConfirm: () => void
}

export function DeleteObservationDialog({ open, onOpenChange, observation, onConfirm }: DeleteObservationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar observación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará la observación de <strong>{observation?.studentName}</strong> de forma permanente.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
