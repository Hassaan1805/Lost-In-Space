import { Suspense } from 'react';
import { CameraControllerProvider, CameraBridge } from './systems/CameraController';
import { ScrollControllerProvider } from './systems/ScrollController';
import { SceneManagerCanvas } from './systems/SceneManager';
import { IntroScene } from './scenes/Intro/IntroScene';
import { LoadingScreen } from './components/LoadingScreen';
import { HUD } from './components/HUD';
import { IntroOverlay } from './components/IntroOverlay';
import { EarthStory } from './components/EarthStory';
import { OrbitStory } from './components/OrbitStory';
import { MoonStory } from './components/MoonStory';
import { AudioManager } from './components/AudioManager';
import './style.css';

function App() {
  return (
    <CameraControllerProvider>
      <ScrollControllerProvider>
        <AudioManager />
        
        <div className="scroll-container">
          
          <HUD />
          <IntroOverlay />
          <EarthStory />
          <OrbitStory />
          <MoonStory />

          <div className="canvas-container">
            <SceneManagerCanvas
              cameraConfig={{ position: [0, 5, 50], fov: 50 }}
            >
              <Suspense fallback={<LoadingScreen />}>
                <CameraBridge />
                <IntroScene />
              </Suspense>
            </SceneManagerCanvas>
          </div>
          
        </div>
      </ScrollControllerProvider>
    </CameraControllerProvider>
  );
}

export default App;
