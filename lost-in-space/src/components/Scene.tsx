import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import { OrbitControls, Box, Sphere, Html, Center } from '@react-three/drei';
import { LightingManager } from '../systems/LightingManager';
import * as THREE from 'three';

const PlaceholderObjects = () => {
  const redMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff6b6b' }), []);
  const tealMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4ecdc4' }), []);

  return (
    <>
      {/* TODO: Replace with actual models/assets */}
      <Center>
        <Box position={[-2, 0, 0]} args={[1, 1, 1]} material={redMaterial} castShadow receiveShadow />
      </Center>
      <Center>
        <Sphere position={[2, 0, 0]} args={[0.8, 32, 32]} material={tealMaterial} castShadow receiveShadow />
      </Center>
    </>
  );
};

export const Scene = () => {
  const scrollRef = useRef(0);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        (gl as THREE.WebGLRenderer).setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
    >
      <Suspense fallback={<Html center>Loading...</Html>}>
        <LightingManager />
        <PlaceholderObjects />
        <OrbitControls enablePan={false} enableZoom={true} />
      </Suspense>
    </Canvas>
  );
};