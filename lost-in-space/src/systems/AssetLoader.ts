import { useLoader } from '@react-three/fiber';
import { TextureLoader, CubeTextureLoader, GLTFLoader } from 'three';

export const AssetLoader = {
  // TODO: Replace with actual asset paths when available
  loadTexture: (path: string) => useLoader(TextureLoader, path),
  loadCubeTexture: (paths: string[]) => useLoader(CubeTextureLoader, paths),
  loadGLTF: (path: string) => useLoader(GLTFLoader, path),
};