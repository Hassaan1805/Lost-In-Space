import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useScrollController } from '../../systems/ScrollController';
import { PHASE_ELEVEN_START } from './OrbitSequence';

export const DistantSun = () => {
  const sunPosition = useMemo(() => new THREE.Vector3(2000, 1000, -35000), []);
  const { scene } = useGLTF('/textures/sun/sun.glb');
  
  // Clone to avoid mutating original if used elsewhere
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const sunRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const scrollController = useScrollController();

  useMemo(() => {
    let zIndexOffset = 0;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Do NOT replace the material type (which strips transparency/depth properties and causes severe z-fighting).
        // Instead, just safely boost the emissive properties of the existing materials.
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.emissive = new THREE.Color('#ffcc66'); // Warm solar glow
              mat.emissiveIntensity = 2.0; 
              
              // Force depth sorting offset to completely eliminate internal z-fighting / twitching
              mat.polygonOffset = true;
              mat.polygonOffsetFactor = zIndexOffset;
              mat.polygonOffsetUnits = zIndexOffset;
              zIndexOffset++;
              
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
  }, [clonedScene]);

  useFrame(() => {
    const progress = scrollController.getProgress();
    let visibilityRatio = 1;

    // Fade and shrink out during the BEYOND phase
    if (progress > PHASE_ELEVEN_START) {
      const fadeProgress = Math.min(1, (progress - PHASE_ELEVEN_START) / (1 - PHASE_ELEVEN_START));
      // Ease out
      visibilityRatio = Math.max(0, 1 - fadeProgress * fadeProgress);
    }

    if (sunRef.current) {
      // Very slow rotation to give life to the sun
      sunRef.current.rotation.y += 0.001;
      // Scale down to disappear
      const coreScale = 200 * visibilityRatio;
      sunRef.current.scale.set(coreScale, coreScale, coreScale);
    }

    if (spriteRef.current) {
      const haloScale = 16000 * visibilityRatio;
      spriteRef.current.scale.set(haloScale, haloScale, 1);
      spriteRef.current.material.opacity = 0.6 * visibilityRatio;
    }
  });

  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, 'rgba(255, 240, 210, 1)');
      gradient.addColorStop(0.1, 'rgba(255, 200, 120, 0.8)');
      gradient.addColorStop(0.4, 'rgba(255, 120, 50, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <group position={sunPosition}>
      {/* 
        The original sun.glb has a radius of roughly 10.
        Scale 200 makes it roughly large but physically distant.
      */}
      <group ref={sunRef} scale={[200, 200, 200]}>
        <primitive object={clonedScene} />
      </group>
      
      {/* Glow Halo - scaled proportionally to the new sun size */}
      <sprite ref={spriteRef} scale={[16000, 16000, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          transparent={true} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.6}
        />
      </sprite>
    </group>
  );
};

useGLTF.preload('/textures/sun/sun.glb');

