import { useFrame } from '@react-three/fiber';
import { useConstellationStore } from '../store';

let isDragging = false;
let previousPosition = { x: 0, y: 0 };

export const handlePointerDown = (e) => {
  isDragging = true;
  previousPosition = { x: e.clientX, y: e.clientY };
};

export const handlePointerMove = (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousPosition.x;
  const deltaY = e.clientY - previousPosition.y;
  previousPosition = { x: e.clientX, y: e.clientY };

  const store = useConstellationStore.getState();
  const currentTarget = store.cameraTarget;
  // Translate camera x/y, sensitivity 0.05
  const newTarget = [
    currentTarget[0] - deltaX * 0.05,
    currentTarget[1] + deltaY * 0.05,
    currentTarget[2]
  ];
  store.setCameraTarget(newTarget);
};

export const handlePointerUp = () => {
  isDragging = false;
};

export const handleWheel = (e) => {
  const store = useConstellationStore.getState();
  // Zoom: scroll wheel → move camera z, sensitivity 0.05, clamp z [15, 250]
  let newZoom = store.zoomLevel + e.deltaY * 0.05;
  newZoom = Math.max(15, Math.min(250, newZoom));
  store.setZoomLevel(newZoom);
};

export const flyToStar = (position) => {
  const store = useConstellationStore.getState();
  const newZoom = Math.max(15, Math.min(250, store.zoomLevel - 30));
  store.setCameraTarget([position.x, position.y, store.cameraTarget[2]]);
  store.setZoomLevel(newZoom);
};

export const resetCamera = () => {
  const store = useConstellationStore.getState();
  store.setCameraTarget([0, 0, 80]);
  store.setZoomLevel(80);
};

export function useCamera() {
  const cameraTarget = useConstellationStore(s => s.cameraTarget);
  const zoomLevel = useConstellationStore(s => s.zoomLevel);

  useFrame((state) => {
    // All movement lerps at speed 0.12 per frame via useFrame
    state.camera.position.x += (cameraTarget[0] - state.camera.position.x) * 0.12;
    state.camera.position.y += (cameraTarget[1] - state.camera.position.y) * 0.12;
    state.camera.position.z += (zoomLevel - state.camera.position.z) * 0.12;
  });
}
