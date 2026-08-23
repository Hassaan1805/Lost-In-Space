import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface UranusSequenceProps {
  uranusPosition: THREE.Vector3;
}

const UranusModel = () => {
  const { scene } = useGLTF('/textures/planets/uranus/uranus.glb');

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    // Center and scale to match the 160 units logic used by other gas giants
    clone.position.sub(center);
    clone.scale.setScalar(160 / largestDimension);
    
    // Tilt the axis (Uranus has a 98 degree axial tilt, almost completely sideways)
    clone.rotation.z = THREE.MathUtils.degToRad(98);
    // Add a slight tilt to the other axes for a cinematic angle
    clone.rotation.x = THREE.MathUtils.degToRad(15);
    clone.rotation.y = THREE.MathUtils.degToRad(-10);

    return clone;
  }, [scene]);

  return <primitive object={model} />;
};

export const UranusSequence = ({ uranusPosition }: UranusSequenceProps) => {
  const uranusGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (uranusGroupRef.current) {
      // Very slow rotation around its global Y axis
      uranusGroupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group position={uranusPosition}>
      <group ref={uranusGroupRef}>
        <UranusModel />
      </group>
    </group>
  );
};

// Preload the model
useGLTF.preload('/textures/planets/uranus/uranus.glb');
