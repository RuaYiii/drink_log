import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store/useStore';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fluid CMYK + Continuous CRT Scanline Glitch Shader
const fragmentShader = `
  uniform float uTime;
  uniform float uIntensity; 
  uniform vec2 uResolution;
  uniform vec3 uBaseColor;
  
  varying vec2 vUv;

  const mat2 rot15 = mat2(cos(0.261), -sin(0.261), sin(0.261), cos(0.261));
  const mat2 rot75 = mat2(cos(1.309), -sin(1.309), sin(1.309), cos(1.309));
  const mat2 rot0 = mat2(1.0, 0.0, 0.0, 1.0);
  const mat2 rot45 = mat2(cos(0.785), -sin(0.785), sin(0.785), cos(0.785));

  vec2 random2(vec2 st){
      st = vec2( dot(st,vec2(127.1,311.7)), dot(st,vec2(269.5,183.3)) );
      return -1.0 + 2.0*fract(sin(st)*43758.5453123);
  }

  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      vec2 u = f*f*(3.0-2.0*f);
      return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                       dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                  mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                       dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
  }

  // CRT Barrel Distortion
  vec2 crtWarp(vec2 uv) {
    vec2 pos = uv * 2.0 - 1.0;
    float r = dot(pos, pos);
    pos *= 1.0 + 0.1 * r + 0.02 * r * r; // adjust coefficients for stronger warp
    return pos * 0.5 + 0.5;
  }

  float halftone(vec2 uv, mat2 rot, float scale, float radius) {
    vec2 pos = rot * uv * uResolution.xy;
    vec2 grid = fract(pos / scale) - 0.5;
    float dist = length(grid);
    return smoothstep(radius, radius - 0.05, dist);
  }

  // Random white noise for TV static / grain
  float randomNoise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    // 1. Apply CRT Screen Warp
    vec2 crtUv = crtWarp(vUv);

    // 2. Continuous CRT & Glitch Offsets
    float warpScale = 3.0;
    float timeMod = uTime * 0.5;
    
    // Continuous liquid noise + Click intensity spike
    float totalIntensity = 0.02 + (uIntensity * 0.05);

    vec2 offsetC = vec2(noise(crtUv * warpScale + timeMod), noise(crtUv * warpScale - timeMod + 10.0)) * totalIntensity;
    vec2 offsetM = vec2(noise(crtUv * warpScale + timeMod + 20.0), noise(crtUv * warpScale - timeMod + 30.0)) * totalIntensity;
    vec2 offsetY = vec2(noise(crtUv * warpScale + timeMod + 40.0), noise(crtUv * warpScale - timeMod + 50.0)) * totalIntensity;

    // Continuous Horizontal Tear (VHS Glitch)
    float tear = noise(vec2(crtUv.y * 20.0, uTime * 5.0));
    // Occasional sharp tear lines
    if(sin(crtUv.y * 10.0 + uTime * 10.0) > 0.98) {
      crtUv.x += tear * 0.05; 
    }
    crtUv.x += tear * totalIntensity;

    float scale = 14.0; 
    
    // CMYK Color weights based on target color
    float cWeight = max(0.0, 1.0 - uBaseColor.r) * 0.45;
    float mWeight = max(0.0, 1.0 - uBaseColor.g) * 0.45;
    float yWeight = max(0.0, 1.0 - uBaseColor.b) * 0.45;
    float kWeight = 0.05; 
    
    float minSize = 0.08 + noise(crtUv * 10.0 + uTime) * 0.02;

    float cDot = halftone(crtUv + offsetC, rot15, scale, cWeight + minSize);
    float mDot = halftone(crtUv + offsetM, rot75, scale, mWeight + minSize);
    float yDot = halftone(crtUv + offsetY, rot0,  scale, yWeight + minSize);
    float kDot = halftone(crtUv,           rot45, scale, kWeight + minSize * 0.5);
    
    vec3 finalColor = vec3(0.96, 0.96, 0.95); // Paper background
    finalColor *= 1.0 - (vec3(1.0, 0.0, 0.0) * cDot);
    finalColor *= 1.0 - (vec3(0.0, 1.0, 0.0) * mDot);
    finalColor *= 1.0 - (vec3(0.0, 0.0, 1.0) * yDot);
    finalColor *= 1.0 - (vec3(1.0, 1.0, 1.0) * kDot);

    // 3. Continuous CRT Scanlines Layer (Overlay Shader)
    // High frequency thin scanlines
    float scanline = sin(crtUv.y * uResolution.y * 0.5) * 0.04;
    
    // Slow rolling thick scanbar
    float roll = sin(crtUv.y * 10.0 - uTime * 3.0) * 0.05;
    
    // Apply scanlines
    finalColor -= scanline;
    finalColor -= roll;

    // 4. White Noise / Film Grain
    float grain = randomNoise(crtUv + uTime) * 0.08;
    finalColor -= grain; // Subtract grain for dirty texture

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
  }
`;

export default function BackgroundShader() {
  const meshRef = useRef();
  const materialRef = useRef();
  const shaker = useStore(state => state.shaker);
  
  const targetColor = useMemo(() => {
    const bases = shaker.filter(item => item.type === 'base');
    if (bases.length === 0) return new THREE.Color(0.8, 0.8, 0.8);
    
    let mixedColor = new THREE.Color(0,0,0);
    bases.forEach(base => {
      let c;
      switch (base.id) {
        case 'absinthe': c = new THREE.Color(0.0, 1.0, 0.0); break;
        case 'whisky': c = new THREE.Color(1.0, 1.0, 0.0); break;
        case 'rum': c = new THREE.Color(1.0, 0.0, 0.0); break;
        case 'gin': c = new THREE.Color(0.0, 1.0, 1.0); break; 
        case 'vodka': c = new THREE.Color(0.8, 0.8, 0.8); break; 
        case 'tequila': c = new THREE.Color(1.0, 0.5, 0.0); break; 
        default: c = new THREE.Color(0.5, 0.5, 0.5);
      }
      mixedColor.add(c);
    });
    mixedColor.multiplyScalar(1 / bases.length);
    return mixedColor;
  }, [shaker]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uBaseColor: { value: targetColor.clone() }
  }), []);

  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = 1.0;
    }
  }, [shaker.length]);

  useEffect(() => {
    const handleClick = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uIntensity.value = Math.max(materialRef.current.uniforms.uIntensity.value, 0.5);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      if (materialRef.current.uniforms.uIntensity.value > 0) {
        materialRef.current.uniforms.uIntensity.value -= delta * 1.5;
        if (materialRef.current.uniforms.uIntensity.value < 0) {
          materialRef.current.uniforms.uIntensity.value = 0;
        }
      }
      materialRef.current.uniforms.uBaseColor.value.lerp(targetColor, delta * 2.0);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
