import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { Scene, PerspectiveCamera, WebGLRenderer, Clock, AmbientLight, HemisphereLight, DirectionalLight } from 'three';
import { EffectComposer } from 'postprocessing';

// Internal component to run frame callbacks inside Canvas
const FrameLoop = () => {
  useFrame((state, delta) => {
    SceneManager._triggerFrame(delta, state.clock.getElapsedTime());
  });
  return null;
};

// Extend Three.js classes for R3F
extend({ Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, HemisphereLight, DirectionalLight });

// Types
export interface ThreeContextValue {
  renderer: WebGLRenderer | null;
  scene: Scene | null;
  camera: PerspectiveCamera | null;
  clock: Clock;
  composer: EffectComposer | null;
  size: { width: number; height: number };
}

export interface SceneModule {
  key: string;
  assets: string[]; // placeholder asset keys
  camera?: any; // CameraModeConfig placeholder
  lighting?: any; // LightingPreset placeholder
  persistCamera?: boolean;
  persistLighting?: boolean;
  onEnter: (ctx: ThreeContextValue) => Promise<void>;
  onExit: (ctx: ThreeContextValue) => Promise<void>;
  onUpdate: (ctx: ThreeContextValue, delta: number) => void;
  sections: any[]; // SectionConfig placeholder
  transitionIn?: (from: string) => any;
  transitionOut?: (to: string) => any;
}

interface SceneManagerState {
  activeSceneKey: string | null;
  scenes: Map<string, SceneModule>;
}

const defaultThreeContext: ThreeContextValue = {
  renderer: null,
  scene: null,
  camera: null,
  clock: new Clock(),
  composer: null,
  size: { width: 0, height: 0 },
};

const ThreeContext = createContext<ThreeContextValue>(defaultThreeContext);

export const useThreeContext = () => useContext(ThreeContext);

class SceneManagerClass {
  private state: SceneManagerState = {
    activeSceneKey: null,
    scenes: new Map(),
  };
  private threeContextRef: React.MutableRefObject<ThreeContextValue> = { current: defaultThreeContext };
  private frameCallbacks: Set<(delta: number, time: number) => void> = new Set();

  registerScene(module: SceneModule) {
    this.state.scenes.set(module.key, module);
  }

  async setActiveScene(key: string) {
    const next = this.state.scenes.get(key);
    if (!next) throw new Error(`Scene ${key} not registered`);
    const prevKey = this.state.activeSceneKey;
    const prev = prevKey ? this.state.scenes.get(prevKey) : null;

    if (prev?.onExit) await prev.onExit(this.threeContextRef.current);
    if (next.onEnter) await next.onEnter(this.threeContextRef.current);

    this.state.activeSceneKey = key;
  }

  getThreeContext() {
    return this.threeContextRef.current;
  }

  onFrame(cb: (delta: number, time: number) => void) {
    this.frameCallbacks.add(cb);
    return () => this.frameCallbacks.delete(cb);
  }

  // internal
  _setThreeContext(value: ThreeContextValue) {
    this.threeContextRef.current = value;
  }

  _triggerFrame(delta: number, time: number) {
    this.frameCallbacks.forEach(cb => cb(delta, time));
  }
}

export const SceneManager = new SceneManagerClass();

// Provider component - pure context provider, no Canvas
interface SceneManagerProviderProps {
  children: React.ReactNode;
  renderConfig?: {
    pixelRatio?: number;
    antialias?: boolean;
    alpha?: boolean;
  };
}

export const SceneManagerProvider: React.FC<SceneManagerProviderProps> = ({
  children,
  renderConfig = {},
}) => {
  const [threeContext, setThreeContext] = useState<ThreeContextValue>(defaultThreeContext);
  const composerRef = useRef<EffectComposer | null>(null);

  // Sync with singleton
  useEffect(() => {
    SceneManager._setThreeContext(threeContext);
  }, [threeContext]);

  return (
    <ThreeContext.Provider value={threeContext}>
      {children}
    </ThreeContext.Provider>
  );
};

// Canvas component that includes FrameLoop - to be used by the App as the single Canvas
export const SceneManagerCanvas: React.FC<{
  children: React.ReactNode;
  renderConfig?: {
    pixelRatio?: number;
    antialias?: boolean;
    alpha?: boolean;
  };
  cameraConfig?: {
    position?: [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
  };
}> = ({ children, renderConfig = {}, cameraConfig = {} }) => {
  const [threeContext, setThreeContext] = useState<ThreeContextValue>(defaultThreeContext);

  useEffect(() => {
    SceneManager._setThreeContext(threeContext);
  }, [threeContext]);

  return (
    <ThreeContext.Provider value={threeContext}>
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={{
          position: cameraConfig.position ?? [0, 0, 5],
          fov: cameraConfig.fov ?? 60,
          near: cameraConfig.near ?? 0.1,
          far: cameraConfig.far ?? 1000,
        }}
        gl={{
          antialias: renderConfig.antialias ?? true,
          alpha: renderConfig.alpha ?? true,
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl, scene, camera, size }) => {
          (gl as WebGLRenderer).setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.setClearColor(0x000000, 1);
          const clock = new Clock();
          const composer = new EffectComposer(gl);
          setThreeContext({
            renderer: gl,
            scene,
            camera: camera as PerspectiveCamera,
            clock,
            composer,
            size,
          });
        }}
      >
        <FrameLoop />
        {children}
      </Canvas>
    </ThreeContext.Provider>
  );
};