// @ts-nocheck
'use client';

import React from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';

declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

const FloatingMesh3D = () => {
    return (
        <div className="w-full h-full min-h-[500px] pointer-events-none select-none opacity-60">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 15], fov: 35 }}
                gl={{ alpha: true, antialias: true }}
            >
                {/* Soft Studio Lighting */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#ffffff" />

                {/* The Floating Abstract Form */}
                <Float
                    speed={1.5} // Slow, hypnotic
                    rotationIntensity={0.4}
                    floatIntensity={0.5}
                    floatingRange={[-0.2, 0.2]}
                >
                    <group rotation={[0, 0, Math.PI / 4]}>
                        <mesh castShadow receiveShadow>
                            {/* Abstract Minimal Shape */}
                            <torusKnotGeometry args={[3, 0.8, 128, 32]} />

                            {/* Premium Frosted Glass Material */}
                            <MeshTransmissionMaterial
                                backside
                                samples={4}
                                resolution={512}
                                thickness={0.5}
                                roughness={0.2}
                                anisotropy={0.5}
                                chromaticAberration={0.05}
                                color="#ffffff"
                            />
                        </mesh>
                    </group>
                </Float>

                {/* Subtle Environment for Reflections */}
                <Environment preset="studio" />
            </Canvas>
        </div>
    );
};

export default FloatingMesh3D;
