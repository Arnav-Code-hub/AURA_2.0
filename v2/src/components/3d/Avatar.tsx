"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Avatar() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // Breathing / Floating animation
            group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.03;
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    // Material setup for a "Mannequin" look
    const material = new THREE.MeshStandardMaterial({
        color: "#e5e5e5", // White mannequin
        roughness: 0.2,
        metalness: 0.1,
    });

    return (
        <group ref={group}>
            {/* Head */}
            <mesh position={[0, 1.6, 0]} castShadow material={material}>
                <sphereGeometry args={[0.14, 64, 64]} />
            </mesh>

            {/* Torso */}
            <mesh position={[0, 1.15, 0]} castShadow material={material}>
                <boxGeometry args={[0.35, 0.55, 0.18]} />
            </mesh>

            {/* Arms - Left */}
            <mesh position={[-0.28, 1.15, 0]} castShadow material={material}>
                <capsuleGeometry args={[0.055, 0.55, 4, 16]} />
            </mesh>

            {/* Arms - Left Forearm */}
            <mesh position={[-0.32, 0.65, 0.1]} rotation={[0.2, 0, -0.1]} castShadow material={material}>
                <capsuleGeometry args={[0.05, 0.5, 4, 16]} />
            </mesh>


            {/* Arms - Right */}
            <mesh position={[0.28, 1.15, 0]} castShadow material={material}>
                <capsuleGeometry args={[0.055, 0.55, 4, 16]} />
            </mesh>

            {/* Arms - Right Forearm */}
            <mesh position={[0.32, 0.65, -0.1]} rotation={[-0.2, 0, 0.1]} castShadow material={material}>
                <capsuleGeometry args={[0.05, 0.5, 4, 16]} />
            </mesh>

            {/* Legs */}
            <mesh position={[-0.12, 0.45, 0]} castShadow material={material}>
                <capsuleGeometry args={[0.07, 0.85, 4, 16]} />
            </mesh>
            <mesh position={[0.12, 0.45, 0]} castShadow material={material}>
                <capsuleGeometry args={[0.07, 0.85, 4, 16]} />
            </mesh>
        </group>
    );
}
