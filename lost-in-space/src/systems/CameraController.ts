import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler } from 'three';

export const CameraController = ({
  target = new Vector3(0, 0, 0),
  offset = new Vector3(0, 0, 5),
  lerpFactor = 0.1,
}: {
  target?: Vector3;
  offset?: Vector3;
  lerpFactor?: number;
}) => {
  const { camera } = useThree();

  useFrame(() => {
    const desiredPosition = target.clone().add(offset);
    camera.position.lerp(desiredPosition, lerpFactor);
    camera.lookAt(target);
  });

  return null; // This component only controls camera
};