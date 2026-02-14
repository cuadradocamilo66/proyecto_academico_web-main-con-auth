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
import type { DiaryEntry } from "@/lib/data"

interface DeleteDiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: DiaryEntry | null
  onConfirm: () => void
}

export function DeleteDiaryDialog({ open, onOpenChange, entry, onConfirm }: DeleteDiaryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará el registro de diario del tema <strong>{entry?.topic}</strong> de forma permanente.
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
