"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Humanoid() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // Subtle breathing animation
            group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
        }
    });

    return (
        <group ref={group}>
            {/* Head */}
            <mesh position={[0, 1.6, 0]} castShadow>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshStandardMaterial color="#e0ac69" roughness={0.5} />
            </mesh>

            {/* Torso */}
            <mesh position={[0, 1.1, 0]} castShadow>
                <boxGeometry args={[0.4, 0.6, 0.2]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>

            {/* Arms */}
            <mesh position={[-0.3, 1.1, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
                <meshStandardMaterial color="#e0ac69" roughness={0.5} />
            </mesh>
            <mesh position={[0.3, 1.1, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
                <meshStandardMaterial color="#e0ac69" roughness={0.5} />
            </mesh>

            {/* Legs */}
            <mesh position={[-0.15, 0.4, 0]} castShadow>
                <capsuleGeometry args={[0.08, 0.8, 4, 8]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.6} />
            </mesh>
            <mesh position={[0.15, 0.4, 0]} castShadow>
                <capsuleGeometry args={[0.08, 0.8, 4, 8]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.6} />
            </mesh>
        </group>
    );
}
