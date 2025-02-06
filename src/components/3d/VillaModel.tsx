import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export function VillaModel() {
  const modelRef = useRef<THREE.Group>();
  const { scene } = useGLTF('/models/luxury_villa.glb');

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <motion.group
      ref={modelRef}
      initial={{ scale: 0, rotateY: -Math.PI }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ duration: 1.5, ease: [0.6, 0.01, -0.05, 0.9] }}
    >
      <primitive object={scene} />
    </motion.group>
  );
}