import { create } from 'zustand';
import { useMemo } from 'react';

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

// Computed selector for filtered stars
export const useFilteredStars = () => {
  const stars = useConstellationStore(s => s.stars);
  const activeMethodFilters = useConstellationStore(s => s.activeMethodFilters);
  const searchQuery = useConstellationStore(s => s.searchQuery);

  // useMemo requires importing it, but since this is a hook we can just use React.useMemo
  // Wait, we need to import useMemo from 'react' at the top of the file
  return useMemo(() => {
    return stars.filter(star => {
      // Filter by method
      if (!activeMethodFilters.has(star.method)) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchPath = star.path.toLowerCase().includes(query);
        const matchSummary = (star.summary || '').toLowerCase().includes(query);
        const matchDescription = (star.description || '').toLowerCase().includes(query);
        const matchMethod = star.method.toLowerCase().includes(query);

        if (!matchPath && !matchSummary && !matchDescription && !matchMethod) {
          return false;
        }
      }

      return true;
    });
  }, [stars, activeMethodFilters, searchQuery]);
};

