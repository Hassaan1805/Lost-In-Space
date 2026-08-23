import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface JupiterSequenceProps {
  jupiterPosition: THREE.Vector3;
}

const JupiterModel = () => {
  const { scene } = useGLTF('/textures/planets/jupiter/jupiter.glb');

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    // Center and scale to 120 units
    clone.position.sub(center);
    clone.scale.setScalar(120 / largestDimension);
    
    // Tilt the axis slightly
    clone.rotation.z = THREE.MathUtils.degToRad(3);

    return clone;
  }, [scene]);

  return <primitive object={model} />;
};

export const JupiterSequence = ({ jupiterPosition }: JupiterSequenceProps) => {
  const jupiterGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (jupiterGroupRef.current) {
      // Very slow rotation
      jupiterGroupRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group position={jupiterPosition}>
      <group ref={jupiterGroupRef}>
        <JupiterModel />
      </group>
    </group>
  );
};
