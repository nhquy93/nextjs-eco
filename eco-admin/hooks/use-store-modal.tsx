import { create } from "zustand";

interface useStoreIModal {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useStoreModal = create<useStoreIModal>((set) => ({ isOpen: false, onOpen: () => set({ isOpen: true }), onClose: () => set({ isOpen: false }) }))