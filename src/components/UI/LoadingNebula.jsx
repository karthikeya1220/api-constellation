import { useConstellationStore } from '../../store';
import '../../styles/loading-nebula.css';

export default function LoadingNebula() {
  const isLoading = useConstellationStore(s => s.isLoading);

  if (!isLoading) return null;

  return (
    <div className="loading-nebula">
      <div className="nebula-container">
        <div className="nebula-orb nebula-1"></div>
        <div className="nebula-orb nebula-2"></div>
        <div className="nebula-orb nebula-3"></div>
        <div className="nebula-text">Mapping the universe...</div>
      </div>
    </div>
  );
}
