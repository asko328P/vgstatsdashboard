import { create, ExtractState } from "zustand";

export interface SelectedPlayerState {
  selectedPlayer: string | undefined;
  setSelectedPlayer: (name: string) => void;
  removeSelectedPlayer: () => void;
}

export const useSelectedPlayerStore = create<SelectedPlayerState>((set) => ({
  selectedPlayer: undefined,
  setSelectedPlayer: (name: string) =>
    set((state: any) => ({ selectedPlayer: name })),
  removeSelectedPlayer: () => set({ selectedPlayer: undefined }),
}));
