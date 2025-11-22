import { create } from 'zustand'

interface UiStore {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
}

export const useUiStore = create<UiStore>((set) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
}))

