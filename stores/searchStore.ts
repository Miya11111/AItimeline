import { Tweet } from './tabStore';
import { create } from 'zustand';

type SearchStore = {
  searchQuery: string;
  searchResults: Tweet[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Tweet[]) => void;
  addSearchResults: (results: Tweet[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  addSearchResults: (results) =>
    set((state) => ({ searchResults: [...results, ...state.searchResults] })),
  setIsSearching: (isSearching) => set({ isSearching }),
  clearSearch: () => set({ searchQuery: '', searchResults: [], isSearching: false }),
}));
