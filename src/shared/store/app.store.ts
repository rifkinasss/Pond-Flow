import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Farm } from "@/shared/types/database.types";

interface AppStore {
  // Active farm yang sedang dipilih user
  activeFarmId: string | null;
  activeFarm: Farm | null;
  setActiveFarm: (farm: Farm | null) => void;

  // Sidebar state (mobile)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeFarmId: null,
      activeFarm: null,
      setActiveFarm: (farm) =>
        set({ activeFarm: farm, activeFarmId: farm?.id ?? null }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "pondflow-app-store",
      partialize: (state) => ({
        activeFarmId: state.activeFarmId,
        activeFarm: state.activeFarm,
      }),
    }
  )
);
