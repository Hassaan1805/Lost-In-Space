import React, { createContext, useContext, useRef } from 'react';
import { Vector3, Euler, Quaternion, Matrix4 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';

export type CameraMode = 'orbit' | 'firstPerson' | 'cinematic' | 'scrollLinked' | 'fixed';

export interface CameraModeConfig {
  mode: CameraMode;
  target?: Vector3;
  offset?: Vector3;
  lerpFactor?: number;
  constraints?: {
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minZoom?: number;
    maxZoom?: number;
  };
}

export interface CameraState {
  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  fov: number;
  near: number;
  far: number;
  mode: CameraMode;
  target: Vector3;
  offset: Vector3;
}

const DEFAULT_STATE: CameraState = {
  position: new Vector3(0, 0, 5),
  rotation: new Euler(0, 0, 0),
  quaternion: new Quaternion(),
  fov: 60,
  near: 0.1,
  far: 1000,
  mode: 'orbit',
  target: new Vector3(0, 0, 0),
  offset: new Vector3(0, 0, 5),
};

const CameraContext = createContext<CameraControllerAPI | null>(null);

export const useCameraController = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCameraController must be used within CameraControllerProvider');
  return ctx;
};

export interface CameraControllerAPI {
  setMode: (mode: CameraMode, config?: Partial<CameraModeConfig>) => Promise<void>;
  setTarget: (target: Vector3, lerp?: number) => void;
  setOffset: (offset: Vector3, lerp?: number) => void;
  lookAt: (target: Vector3, duration?: number) => Promise<void>;
  shake: (intensity: number, duration: number) => void;
  getState: () => CameraState;
  onStateChange: (callback: (state: CameraState) => void) => () => void;
  update: (delta: number) => void;
}

class CameraControllerClass implements CameraControllerAPI {
  private cameraRef: React.MutableRefObject<any> = { current: null };
  private state: CameraState = { ...DEFAULT_STATE };
  private subscribers: Set<(state: CameraState) => void> = new Set();
  private currentModeConfig: CameraModeConfig = { mode: 'orbit' };
  private shakeIntensity = 0;
  private shakeTime = 0;
  private shakeDuration = 0;
  private animationFrame: number | null = null;

  setCamera(camera: any) {
    this.cameraRef.current = camera;
    this.syncFromCamera();
  }

  private syncFromCamera() {
    const cam = this.cameraRef.current;
    if (!cam) return;
    this.state.position.copy(cam.position);
    this.state.rotation.copy(cam.rotation);
    this.state.quaternion.copy(cam.quaternion);
    this.state.fov = cam.fov;
    this.state.near = cam.near;
    this.state.far = cam.far;
  }

  private syncToCamera(lerp = 1) {
    const cam = this.cameraRef.current;
    if (!cam) return;

    if (lerp >= 1) {
      cam.position.copy(this.state.position);
      cam.quaternion.copy(this.state.quaternion);
    } else {
      cam.position.lerp(this.state.position, lerp);
      cam.quaternion.slerp(this.state.quaternion, lerp);
    }
    cam.fov = this.state.fov;
    cam.updateProjectionMatrix();
  }

  private notify() {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }

  async setMode(mode: CameraMode, config: Partial<CameraModeConfig> = {}) {
    this.currentModeConfig = { ...this.currentModeConfig, ...config, mode };
    this.state.mode = mode;
    this.notify();
  }

  setTarget(target: Vector3, lerp = 0.1) {
    this.state.target.copy(target);
    if (this.currentModeConfig.mode !== 'fixed') {
      this.updateCameraFromMode(lerp);
    }
  }

  setOffset(offset: Vector3, lerp = 0.1) {
    this.state.offset.copy(offset);
    if (this.currentModeConfig.mode !== 'fixed') {
      this.updateCameraFromMode(lerp);
    }
  }

  private updateCameraFromMode(lerp: number) {
    const { mode, target, offset, constraints } = this.currentModeConfig;
    const effectiveTarget = target || this.state.target;
    const effectiveOffset = offset || this.state.offset;

    switch (mode) {
      case 'orbit':
      case 'scrollLinked':
      case 'cinematic': {
        const desiredPos = effectiveTarget.clone().add(effectiveOffset);
        this.state.position.lerp(desiredPos, lerp);
        const lookAtTarget = effectiveTarget.clone();
        this.state.quaternion.setFromRotationMatrix(
          new Matrix4().lookAt(this.state.position, lookAtTarget, new Vector3(0, 1, 0))
        );
        break;
      }
      case 'firstPerson': {
        this.state.position.copy(effectiveTarget).add(effectiveOffset);
        break;
      }
      case 'fixed':
        break;
    }

    this.applyConstraints();
    this.syncToCamera(lerp);
  }

  private applyConstraints() {
    const { constraints } = this.currentModeConfig;
    if (!constraints) return;

    const dist = this.state.position.distanceTo(this.state.target);
    if (constraints.minDistance && dist < constraints.minDistance) {
      this.state.position.sub(this.state.target).setLength(constraints.minDistance).add(this.state.target);
    }
    if (constraints.maxDistance && dist > constraints.maxDistance) {
      this.state.position.sub(this.state.target).setLength(constraints.maxDistance).add(this.state.target);
    }
  }

  async lookAt(target: Vector3, duration = 1) {
    return new Promise<void>(resolve => {
      const startQuat = this.state.quaternion.clone();
      const targetQuat = new Quaternion().setFromRotationMatrix(
        new Matrix4().lookAt(this.state.position, target, new Vector3(0, 1, 0))
      );
      const startTime = performance.now();

      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        this.state.quaternion.slerpQuaternions(startQuat, targetQuat, eased);
        this.syncToCamera(1);
        this.notify();

        if (t < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  }

  shake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTime = 0;
  }

  private updateShake(delta: number) {
    if (this.shakeTime >= this.shakeDuration) return;
    this.shakeTime += delta;
    const progress = this.shakeTime / this.shakeDuration;
    const currentIntensity = this.shakeIntensity * (1 - progress);

    const shakeOffset = new Vector3(
      (Math.random() - 0.5) * currentIntensity,
      (Math.random() - 0.5) * currentIntensity,
      (Math.random() - 0.5) * currentIntensity
    );
    this.state.position.add(shakeOffset);
    this.syncToCamera(1);
  }

  getState(): CameraState {
    return { ...this.state };
  }

  onStateChange(callback: (state: CameraState) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  update(delta: number) {
    this.updateShake(delta);
    if (this.currentModeConfig.mode !== 'fixed') {
      this.updateCameraFromMode(this.currentModeConfig.lerpFactor || 0.1);
    }
    this.notify();
  }
}

export const CameraController = new CameraControllerClass();

// Provider component - makes CameraController available via React context.
// Place this OUTSIDE the Canvas so both Canvas children and HTML overlays can access it.
interface CameraControllerProviderProps {
  children: React.ReactNode;
}

export const CameraControllerProvider: React.FC<CameraControllerProviderProps> = ({ children }) => {
  return (
    <CameraContext.Provider value={CameraController}>
      {children}
    </CameraContext.Provider>
  );
};

// Bridge component - must be rendered INSIDE the Canvas.
// Connects the R3F camera to the CameraController singleton.
export const CameraBridge: React.FC = () => {
  const { camera } = useThree();
  const initialized = useRef(false);

  if (camera && !initialized.current) {
    CameraController.setCamera(camera);
    initialized.current = true;
  }

  useFrame((_, delta) => {
    CameraController.update(delta);
  });

  return null;
};