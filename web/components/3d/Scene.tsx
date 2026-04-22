"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";

interface SceneProps {
    children: React.ReactNode;
}

export function Scene({ children }: SceneProps) {
    return (
        <div className="w-full h-full min-h-[500px] relative">
            <Canvas
                shadows
                camera={{ position: [0, 2, 5], fov: 45 }}
                className="w-full h-full"
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <spotLight
                        position={[10, 10, 10]}
                        angle={0.15}
                        penumbra={1}
                        shadow-mapSize={2048}
                        castShadow
                    />
                    <Environment preset="city" />

                    <group position={[0, -1, 0]}>
                        {children}
                    </group>

                    <ContactShadows
                        resolution={1024}
                        scale={10}
                        blur={1}
                        opacity={0.5}
                        far={1}
                        color="#000000"
                    />
                    <OrbitControls
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2}
                        minDistance={3}
                        maxDistance={8}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
