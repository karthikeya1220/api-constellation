import { create } from 'zustand';

export const useConstellationStore = create(set => ({
  // Data
  stars: [],
  constellations: [],
  apiTitle: 'API Constellation',
  baseUrl: '',

  // Selection state
  hoveredStarId: null,
  selectedStarId: null,

  // Filter state
  activeMethodFilters: new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  searchQuery: '',

  // Camera
  cameraTarget: [0, 0, 80],
  zoomLevel: 80,

  // Loading
  isLoading: false,

  // Actions
  loadSpec: (parseResult) =>
    set(state => ({
      stars: parseResult.stars,
      constellations: parseResult.constellations,
      apiTitle: parseResult.apiTitle,
      baseUrl: parseResult.baseUrl,
      isLoading: false,
    })),

  setHovered: hoveredStarId => set({ hoveredStarId }),

  setSelected: selectedStarId => set({ selectedStarId }),

  toggleMethodFilter: method =>
    set(state => {
      const newFilters = new Set(state.activeMethodFilters);
      if (newFilters.has(method)) {
        newFilters.delete(method);
      } else {
        newFilters.add(method);
      }
      return { activeMethodFilters: newFilters };
    }),

  setSearchQuery: searchQuery => set({ searchQuery }),

  setCameraTarget: target => set({ cameraTarget: target }),

  setZoomLevel: zoomLevel => set({ zoomLevel }),

  setLoading: isLoading => set({ isLoading }),
}));

