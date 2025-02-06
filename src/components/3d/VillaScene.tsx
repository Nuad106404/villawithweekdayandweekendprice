import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { VillaModel } from './VillaModel';
import { LoadingScreen } from '../ui/LoadingScreen';

export function VillaScene() {
  return (
    <div className="h-screen w-full absolute top-0 left-0 -z-10">
      <Canvas>
        <Suspense fallback={<LoadingScreen />}>
          <PerspectiveCamera makeDefault position={[5, 2, 5]} />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
          <VillaModel />
          <Environment preset="sunset" />
          <EffectComposer>
            <Bloom 
              intensity={1.5}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
            />
            <ChromaticAberration offset={[0.001, 0.001]} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}