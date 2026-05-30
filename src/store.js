import { create } from 'zustand';

export const useConstellationStore = create(set => ({
  stars: [],
  setStars: stars => set({ stars }),
  
  selectedStar: null,
  setSelected: star => set({ selectedStar: star }),
  
  hoveredStarId: null,
  setHovered: id => set({ hoveredStarId: id }),
  
  cameraPos: { x: 0, y: 0, z: 100 },
  setCameraPos: pos => set({ cameraPos: pos }),
  
  activeMethodFilters: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  setMethodFilters: methods => set({ activeMethodFilters: methods }),
  
  searchQuery: '',
  setSearchQuery: query => set({ searchQuery: query }),
  
  isLoading: false,
  setLoading: loading => set({ isLoading: loading }),
}));
