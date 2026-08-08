import { SceneManagerProvider } from './systems/SceneManager';
import { CameraControllerProvider } from './systems/CameraController';
import { ScrollControllerProvider } from './systems/ScrollController';
import { IntroScene } from './scenes/Intro/IntroScene';
import './style.css';

function App() {
  return (
    <SceneManagerProvider>
      <CameraControllerProvider>
        <ScrollControllerProvider>
          <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <IntroScene />
          </div>
        </ScrollControllerProvider>
      </CameraControllerProvider>
    </SceneManagerProvider>
  );
}

export default App;