import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface NeptuneSequenceProps {
  neptunePosition: THREE.Vector3;
}

const NeptuneModel = () => {
  const { scene } = useGLTF('/textures/planets/neptune/neptune_v2.glb');

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
    
    // Slight tilt for cinematic angle (Neptune has about 28 degree tilt)
    clone.rotation.x = THREE.MathUtils.degToRad(28);
    clone.rotation.y = THREE.MathUtils.degToRad(-10);

    return clone;
  }, [scene]);

  return <primitive object={model} />;
};

export const NeptuneSequence = ({ neptunePosition }: NeptuneSequenceProps) => {
  const neptuneGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (neptuneGroupRef.current) {
      // Very slow rotation around its global Y axis
      neptuneGroupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group position={neptunePosition}>
      <group ref={neptuneGroupRef}>
        <NeptuneModel />
      </group>
    </group>
  );
};

// Preload the model
useGLTF.preload('/textures/planets/neptune/neptune_v2.glb');
