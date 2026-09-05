import { create } from "zustand";

export interface SelectedMapState {
  selectedMap: string | undefined;
  setSelectedMap: (name: string) => void;
  removeSelectedMap: () => void;
}

export const useSelectedMapStore = create<SelectedMapState>((set) => ({
  selectedMap: undefined,
  setSelectedMap: (name: string) => set({ selectedMap: name }),
  removeSelectedMap: () => set({ selectedMap: undefined }),
}));
