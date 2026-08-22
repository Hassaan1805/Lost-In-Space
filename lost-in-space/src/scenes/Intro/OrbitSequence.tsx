import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollController } from '../../systems/ScrollController';

// The original intro/Earth journey occupies the first 400vh. The following
// 80vh is a deliberate hold for the Phase 3 orbital navigation before Phase 4.
export const EARTH_JOURNEY_END = 400 / 600;
export const PHASE_FOUR_START = 480 / 600;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothStep = (value: number) => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

const createOrbitPoints = (radius: number, tilt: THREE.Euler) => {
  const points = new Float32Array(129 * 3);

  for (let index = 0; index <= 128; index += 1) {
    const angle = (index / 128) * Math.PI * 2;
    const point = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0,
    ).applyEuler(tilt);

    points[index * 3] = point.x;
    points[index * 3 + 1] = point.y;
    points[index * 3 + 2] = point.z;
  }

  return points;
};

const SatelliteModel = () => {
  const { scene } = useGLTF('/models/spacecraft/satellite.glb');

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    clone.position.sub(center);
    clone.scale.setScalar(4.2 / largestDimension);

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={model} />;
};

interface OrbitSequenceProps {
  earthPosition: THREE.Vector3;
}

export const OrbitSequence = ({ earthPosition }: OrbitSequenceProps) => {
  const scrollController = useScrollController();
  const orbitGroupRef = useRef<THREE.Group>(null);
  const satelliteRigRef = useRef<THREE.Group>(null);
  const primaryOrbitMaterial = useRef<THREE.LineBasicMaterial>(null);
  const secondaryOrbitMaterial = useRef<THREE.LineBasicMaterial>(null);
  const [loadSatellite, setLoadSatellite] = useState(false);

  const primaryOrbitPoints = useMemo(
    () => createOrbitPoints(22, new THREE.Euler(0.6, -0.15, -0.4)),
    [],
  );
  const secondaryOrbitPoints = useMemo(
    () => createOrbitPoints(26, new THREE.Euler(-0.45, 0.3, 0.72)),
    [],
  );

  useEffect(() => scrollController.onStateChange((state) => {
    if (state.progress >= PHASE_FOUR_START - 0.025) {
      setLoadSatellite(true);
    }
  }), [scrollController]);

  useFrame(() => {
    const journeyProgress = scrollController.getProgress();
    const orbitProgress = clamp01(
      (journeyProgress - PHASE_FOUR_START) / (1 - PHASE_FOUR_START),
    );
    const reveal = smoothStep(orbitProgress * 1.35);

    if (orbitGroupRef.current) {
      orbitGroupRef.current.visible = reveal > 0.001;
      orbitGroupRef.current.scale.setScalar(0.9 + reveal * 0.1);
      orbitGroupRef.current.rotation.y = reveal * 0.18;
    }

    if (primaryOrbitMaterial.current) {
      primaryOrbitMaterial.current.opacity = reveal * 0.52;
    }
    if (secondaryOrbitMaterial.current) {
      secondaryOrbitMaterial.current.opacity = reveal * 0.2;
    }

    if (satelliteRigRef.current) {
      // Keep the satellite on the camera-facing part of the orbit for the
      // whole chapter. A full sweep reads as a disappearance once it passes
      // behind Earth, while this smaller drift keeps the orbital asset present.
      const angle = 0.65 + orbitProgress * 0.55;
      const radius = 22;
      const point = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      ).applyEuler(new THREE.Euler(0.6, -0.15, -0.4));

      satelliteRigRef.current.position.copy(point);
      satelliteRigRef.current.lookAt(0, 0, 0);
      satelliteRigRef.current.rotateY(Math.PI / 2);
      satelliteRigRef.current.scale.setScalar(reveal);
    }
  });

  return (
    <group ref={orbitGroupRef} position={earthPosition} visible={false}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[primaryOrbitPoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={primaryOrbitMaterial} color="#72eaff" transparent opacity={0} />
      </line>

      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[secondaryOrbitPoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={secondaryOrbitMaterial} color="#b9f5ff" transparent opacity={0} />
      </line>

      <group ref={satelliteRigRef}>
        <Suspense fallback={null}>
          {loadSatellite && <SatelliteModel />}
        </Suspense>
      </group>
    </group>
  );
};
