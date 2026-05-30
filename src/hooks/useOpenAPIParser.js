import { useCallback } from 'react';
import { parseOpenAPI } from '../utils/parseOpenAPI';
import { assignMockFrequency } from '../utils/mockFrequency';
import { groupIntoConstellations } from '../utils/constellationGroup';
import { getStarVisuals } from '../utils/colorMap';
import { useConstellationStore } from '../store';

/**
 * Hook to parse an OpenAPI spec and load it into the store
 */
export function useOpenAPIParser() {
  const loadSpec = useConstellationStore(s => s.loadSpec);
  const setLoading = useConstellationStore(s => s.setLoading);

  const parseAndLoad = useCallback(async (specJson) => {
    setLoading(true);

    try {
      // Parse the OpenAPI spec
      const parseResult = parseOpenAPI(specJson);

      if (parseResult.error) {
        console.error('Parse error:', parseResult.error);
        setLoading(false);
        return parseResult;
      }

      // Assign mock frequencies
      const starsWithFreq = assignMockFrequency(parseResult.stars);

      // Assign visual properties
      const starsWithVisuals = starsWithFreq.map(star => {
        const visuals = getStarVisuals(star);
        return {
          ...star,
          ...visuals,
        };
      });

      // Group into constellations
      const constellations = groupIntoConstellations(starsWithVisuals);

      const finalResult = {
        ...parseResult,
        stars: starsWithVisuals,
        constellations,
      };

      // Load into store
      loadSpec(finalResult);

      console.log('Loaded spec:', finalResult);
      setLoading(false);

      return finalResult;
    } catch (err) {
      console.error('Parser error:', err);
      setLoading(false);
      return {
        stars: [],
        constellations: [],
        apiTitle: 'Unknown',
        apiVersion: '0.0.0',
        baseUrl: '',
        totalEndpoints: 0,
        error: err.message,
      };
    }
  }, [loadSpec, setLoading]);

  return { parseAndLoad };
}

