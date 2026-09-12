import { create } from 'zustand'

type UiState = {
  movementFormOpen: boolean
  openMovementForm: () => void
  closeMovementForm: () => void
}

export const useUiStore = create<UiState>((set) => ({
  movementFormOpen: false,
  openMovementForm: () => set({ movementFormOpen: true }),
  closeMovementForm: () => set({ movementFormOpen: false }),
}))