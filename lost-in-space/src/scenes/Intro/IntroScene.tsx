import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { LightingManager } from '../../systems/LightingManager';
import { useCameraController } from '../../systems/CameraController';
import * as THREE from 'three';

const createStarPositions = (count: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 50 + Math.random() * 300;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
};

const createStarSizes = (count: number) => {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    sizes[i] = 0.5 + Math.random() * 1.5;
  }
  return sizes;
};

const createStarColors = (count: number) => {
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const variation = 0.8 + Math.random() * 0.2;
    colors[i * 3] = variation;
    colors[i * 3 + 1] = variation;
    colors[i * 3 + 2] = variation;
  }
  return colors;
};

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = earthRef.current;
    if (!mesh) return;

    const animate = (timestamp: number) => {
      mesh.rotation.y += 0.0001;
      requestAnimationFrame(animate);
    };
    animate(0);
  }, []);

  return (
    <group ref={earthRef}>
      <mesh
        receiveShadow
        castShadow
        position={[0, 0, -80]}
        scale={12}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#1a3a5c"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh
        position={[0, 0, -80]}
        scale={12.15}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#4a90d9"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const Starfield = () => {
  const starsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array());

  useEffect(() => {
    const points = starsRef.current;
    if (!points) return;

    const pos = points.geometry.attributes.position;
    positionsRef.current = new Float32Array(pos.array);

    const animate = (timestamp: number) => {
      for (let i = 0; i < pos.count; i++) {
        const idx = i * 3;
        pos.array[idx + 2] += 0.02;
        if (pos.array[idx + 2] > 100 && positionsRef.current) {
          pos.array[idx + 2] = positionsRef.current[idx + 2] - 200;
        }
      }
      pos.needsUpdate = true;
      requestAnimationFrame(animate);
    };
    animate(0);
  }, []);

  const starCount = 8000;

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[createStarPositions(starCount), 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[createStarSizes(starCount), 1]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[createStarColors(starCount), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        sizeAttenuation
        transparent
        opacity={0.9}
        vertexColors
        depthWrite={false}
      />
    </points>
  );
};

const CameraUpdater = ({ cameraController }: { cameraController: ReturnType<typeof useCameraController> }) => {
  useFrame((_, delta) => {
    cameraController.update(delta);
  });
  return null;
};

const IntroContent = () => {
  const cameraController = useCameraController();

  useEffect(() => {
    const target = new THREE.Vector3(0, 0, -80);
    const offset = new THREE.Vector3(0, 5, 50);

    const animate = (timestamp: number) => {
      cameraController.setTarget(target, 0.01);
      cameraController.setOffset(offset, 0.01);
      requestAnimationFrame(animate);
    };
    animate(0);
  }, [cameraController]);

  return (
    <>
      <Starfield />
      <Earth />
      <LightingManager />
      <CameraUpdater cameraController={cameraController} />
    </>
  );
};

export const IntroScene = () => {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ position: [0, 5, 50], fov: 50 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        (gl as THREE.WebGLRenderer).setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.setClearColor(0x000000, 1);
      }}
    >
      <Suspense fallback={<Html center>Loading...</Html>}>
        <IntroContent />
      </Suspense>
    </Canvas>
  );
};