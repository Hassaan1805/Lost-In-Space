import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SaturnSequenceProps {
  saturnPosition: THREE.Vector3;
}

const SaturnModel = () => {
  const { scene } = useGLTF('/textures/planets/saturn/saturn_planet.glb');

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    // Center and scale to 160 units (bounding box includes rings)
    clone.position.sub(center);
    clone.scale.setScalar(160 / largestDimension);

    // Tilt the axis slightly (Saturn has a 26.7 degree axial tilt)
    clone.rotation.z = THREE.MathUtils.degToRad(26.7);
    clone.rotation.x = THREE.MathUtils.degToRad(15); // Tilt a bit towards camera to see rings

    return clone;
  }, [scene]);

  return <primitive object={model} />;
};

export const SaturnSequence = ({ saturnPosition }: SaturnSequenceProps) => {
  const saturnGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (saturnGroupRef.current) {
      // Very slow rotation
      saturnGroupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group position={saturnPosition}>
      <group ref={saturnGroupRef}>
        <SaturnModel />
      </group>
    </group>
  );
};
