import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const FresnelShader = {
  uniforms: {
    'c': { type: 'f', value: 0.1 },
    'p': { type: 'f', value: 2.0 },
    glowColor: { type: 'c', value: new THREE.Color(0x00aaff) },
    viewVector: { type: 'v3', value: new THREE.Vector3() },
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
    varying float intensity;
    void main() {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4( glow, intensity * 0.5 );
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
  
  // Preload the earth model
  const { scene } = useGLTF('/textures/planets/earth/earth.glb');
  
  // Clone the scene to allow multiple instances or safe mutation
  const earthModel = useMemo(() => scene.clone(), [scene]);
  
  // Optionally, load clouds or nightmap if they aren't embedded in the GLB
  // Depending on how the GLB is set up, this might be redundant. But it's good to have them if the GLB lacks clouds.
  const cloudsTexture = useTexture('/textures/planets/earth/2k_earth_clouds.jpg');

  // Atmosphere shader material
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial(FresnelShader), []);

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
  });

  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Real Earth Model */}
      <group ref={earthRef} scale={12}>
        <primitive object={earthModel} />
        
        {/* Optional Cloud Layer (slightly larger than earth) */}
        <mesh scale={1.01}>
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
