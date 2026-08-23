import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollController } from '../../systems/ScrollController';
import { PHASE_FIVE_START } from '../Intro/OrbitSequence';

const FresnelShader = {
  uniforms: {
    'c': { type: 'f', value: 0.1 },
    'p': { type: 'f', value: 2.0 },
    glowColor: { type: 'c', value: new THREE.Color(0x00aaff) },
    viewVector: { type: 'v3', value: new THREE.Vector3() },
    uDim: { type: 'f', value: 1.0 },
  },
  vertexShader: `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float uDim;
    varying float intensity;
    void main() {
      vec3 glow = glowColor * intensity * uDim;
      gl_FragColor = vec4( glow, intensity * 0.5 * uDim );
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
};

export const Earth = ({ position = [0, 0, -80] }: { position?: [number, number, number] }) => {
  const earthRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const scrollController = useScrollController();
  
  // Preload the earth model
  const { scene } = useGLTF('/textures/planets/earth/earth.glb');
  
  // Clone the scene to allow multiple instances or safe mutation
  const earthModel = useMemo(() => scene.clone(), [scene]);
  
  // Optionally, load clouds or nightmap if they aren't embedded in the GLB
  // Depending on how the GLB is set up, this might be redundant. But it's good to have them if the GLB lacks clouds.
  const cloudsTexture = useTexture('/textures/planets/earth/2k_earth_clouds.jpg');

  // Atmosphere shader material
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial(FresnelShader), []);

  // Store original material colors so we can restore them when scrolling back
  const originalColors = useRef<Map<string, THREE.Color>>(new Map());

  useFrame((state) => {
    if (earthRef.current) {
      // Slow rotation for the Earth
      earthRef.current.rotation.y += 0.0005;
    }
    
    if (atmosphereRef.current) {
      // Update fresnel view vector
      atmosphereMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        state.camera.position,
        atmosphereRef.current.getWorldPosition(new THREE.Vector3())
      );
    }

    // --- Phase 5 de-emphasis ---
    const progress = scrollController.getProgress();
    // Smooth ramp: 0 before Phase 5, ramps to 1 over the first 30% of Phase 5
    const moonRamp = Math.min(1, Math.max(0, (progress - PHASE_FIVE_START) / ((1 - PHASE_FIVE_START) * 0.30)));
    // Cubic ease for smooth transition
    const moonBlend = moonRamp * moonRamp * (3 - 2 * moonRamp);
    // dimFactor: 1.0 = full brightness, 0.3 = significantly dimmed
    const dimFactor = 1.0 - moonBlend * 0.7;

    // Dim the atmosphere glow via the shader uniform
    atmosphereMaterial.uniforms.uDim.value = dimFactor;

    // Dim the cloud layer
    if (cloudRef.current) {
      const cloudMat = cloudRef.current.material as THREE.MeshStandardMaterial;
      cloudMat.opacity = 0.3 * dimFactor;
    }

    // Dim the Earth model materials
    if (earthRef.current) {
      earthRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (!mat.color) return;

          const id = child.uuid;
          // Cache the original color on first encounter
          if (!originalColors.current.has(id)) {
            originalColors.current.set(id, mat.color.clone());
          }
          const orig = originalColors.current.get(id)!;
          // Lerp material color toward a darker version
          mat.color.copy(orig).multiplyScalar(dimFactor);
        }
      });
    }
  });

  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Real Earth Model */}
      <group ref={earthRef} scale={12}>
        <primitive object={earthModel} />
        
        {/* Optional Cloud Layer (slightly larger than earth) */}
        <mesh ref={cloudRef} scale={1.01}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            map={cloudsTexture} 
            transparent={true} 
            opacity={0.3} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={13.2}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  );
};

useGLTF.preload('/textures/planets/earth/earth.glb');
