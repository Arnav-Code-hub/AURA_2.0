"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";

interface SceneProps {
    children?: React.ReactNode;
    className?: string;
}

export function Scene({ children, className }: SceneProps) {
    return (
        <div className={`w-full h-full relative ${className}`}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 1.5, 6], fov: 35 }}
                gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    {/* Dramatic Dark Studio Lighting */}
                    <ambientLight intensity={0.2} />

                    {/* Main Key Light */}
                    <spotLight
                        position={[5, 5, 5]}
                        angle={0.25}
                        penumbra={1}
                        intensity={2}
                        castShadow
                        shadow-mapSize={1024}
                    />

                    {/* Rim Light for separation from dark bg */}
                    <spotLight
                        position={[-5, 5, -5]}
                        angle={0.25}
                        penumbra={1}
                        intensity={2}
                        color="#blue"
                    />

                    {/* Soft Fill */}
                    <Environment preset="night" />

                    {/* Model Container */}
                    <group position={[0, -0.8, 0]}>
                        {children}
                    </group>

                    <ContactShadows
                        resolution={1024}
                        scale={10}
                        blur={2}
                        opacity={0.5}
                        far={1}
                        color="#000000"
                    />

                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 2}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
