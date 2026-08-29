import { Canvas } from '@react-three/fiber';
import BackgroundShader from './components/BackgroundShader';
import ShakerBoard from './components/ShakerBoard';
import './index.css';

function App() {
  return (
    <div className="app-container" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* WebGL Background Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <Canvas orthographic camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 }}>
          <BackgroundShader />
        </Canvas>
      </div>

      {/* Main Interactive Layer */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflowY: 'auto' }}>
        <ShakerBoard />
      </div>
    </div>
  );
}

export default App;
