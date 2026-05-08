"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

function CityBuildings() {
  const count = 500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Use state to generate positions safely inside useEffect
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 400; // Seed-based logic will be better but keeping simple for MVP
        const z = (Math.random() - 0.5) * 400;
        const height = Math.random() * 20 + 5;

        dummy.position.set(x, height / 2, z);
        dummy.scale.set(2, height, 2);
        dummy.updateMatrix();

        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      setReady(true);
    }
  }, [count, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={ready}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.2} transparent opacity={0.6} wireframe={true} />
    </instancedMesh>
  );
}

function TrafficVehicles() {
  const count = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Store initial positions in ref to avoid react state updates during animation loop
  const positionsRef = useRef<{x: number, y: number, z: number, speed: number, dirX: number, dirZ: number}[]>([]);

  useEffect(() => {
    positionsRef.current = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: 0.5,
      z: (Math.random() - 0.5) * 200,
      speed: Math.random() * 0.5 + 0.1,
      dirX: Math.random() > 0.5 ? 1 : -1,
      dirZ: Math.random() > 0.5 ? 1 : -1,
    }));
  }, [count]);

  useFrame(() => {
    if (meshRef.current && positionsRef.current.length > 0) {
      positionsRef.current.forEach((pos, i) => {
        // Move along roads (simplified)
        pos.x += pos.speed * pos.dirX;
        if (Math.abs(pos.x) > 100) pos.dirX *= -1;

        dummy.position.set(pos.x, pos.y, pos.z);
        dummy.scale.set(0.5, 0.5, 1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
    </instancedMesh>
  );
}

function DroneRoutes() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-50, 20, -50),
    new THREE.Vector3(0, 30, 20),
    new THREE.Vector3(50, 15, 50),
    new THREE.Vector3(20, 25, -30),
    new THREE.Vector3(-50, 20, -50) // closed loop
  ]), []);

  const droneRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (droneRef.current) {
      const t = (state.clock.getElapsedTime() * 0.1) % 1;
      const point = curve.getPoint(t);
      droneRef.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* Route Line */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.2, 8, true]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} wireframe />
      </mesh>

      {/* Drone */}
      <mesh ref={droneRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#ffb800" emissive="#ffb800" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

export default function MapScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 50, 100], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 50, 10]} intensity={1.5} color="#00e5ff" />

        <group position={[0, 0, 0]}>
            <CityBuildings />
            <TrafficVehicles />
            <DroneRoutes />
            <gridHelper args={[400, 40, '#7c3aed', '#1e1b4b']} position={[0,0.1,0]} />
        </group>

        <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1} // Prevent looking completely under ground
            minDistance={20}
            maxDistance={200}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
