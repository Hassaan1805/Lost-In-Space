import { useLoader } from '@react-three/fiber';
import { LoadingManager as ThreeLoadingManager } from 'three';
import { useMemo } from 'react';

// Singleton Three.js loading manager
const loadingManager = new ThreeLoadingManager();

loadingManager.onProgress = (url, loaded, total) => {
  console.log(`Loading ${url}: ${loaded}/${total}`);
};
loadingManager.onLoad = () => {
  console.log('All assets loaded');
};
loadingManager.onError = (url) => {
  console.error(`Failed to load ${url}`);
};

export const LoadingManager = () => {
  // This component ensures the singleton is initialized in the React tree.
  return null;
};

// Helper hook to use the shared loading manager
export const useCustomLoader = <T,>(loader: any, url: string) => {
  return useLoader(loader, url, (loaderInstance) => {
    loaderInstance.manager = loadingManager;
  });
};