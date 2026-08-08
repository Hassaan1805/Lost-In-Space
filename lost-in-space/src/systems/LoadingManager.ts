import { useLoader } from '@react-three/fiber';
import { LoadingManager as ThreeLoadingManager } from 'three';
import { useControls } from 'leva';

export const LoadingManager = () => {
  const manager = useMemo(() => new ThreeLoadingManager(), []);

  const { onProgress, onLoad, onError } = useControls('Loading', {
    // Leva controls for debugging loading progress
    showProgress: false,
  });

  manager.onProgress = (url, loaded, total) => {
    if (onProgress) console.log(`Loading ${url}: ${loaded}/${total}`);
  };
  manager.onLoad = () => {
    if (onLoad) console.log('All assets loaded');
  };
  manager.onError = (url) => {
    if (onError) console.error(`Failed to load ${url}`);
  };

  // TODO: Integrate with global UI loading indicator
  return null; // This component only sets up the manager
};

// Helper hook to use the custom loading manager
export const useCustomLoader = <T,>(loader: any, url: string) => {
  const manager = useMemo(() => new ThreeLoadingManager(), []);
  return useLoader(loader, url, manager);
};

import { useMemo } from 'react';