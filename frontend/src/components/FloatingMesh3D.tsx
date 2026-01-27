
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';

const FloatingMesh3D = () => {
    return (
        <div className="w-full h-full min-h-[500px] pointer-events-none select-none opacity-60">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 15], fov: 35 }}
                gl={{ alpha: true, antialias: true }}
            >
                
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#ffffff" />

                
                <Float
                    speed={1} 
                    rotationIntensity={0.2}
                    floatIntensity={0.2}
                    floatingRange={[-0.1, 0.1]}
                >
                    <group rotation={[0, 0, Math.PI / 4]}>
                        <mesh castShadow receiveShadow>
                            
                            <torusKnotGeometry args={[2.5, 0.6, 128, 32]} />

                            
                            <MeshTransmissionMaterial
                                backside
                                samples={4}
                                resolution={256}
                                thickness={0.2}
                                roughness={0.4} 
                                anisotropy={0.1}
                                chromaticAberration={0.02} 
                                color="#f5f5f5" 
                            />
                        </mesh>
                    </group>
                </Float>

                
                <Environment preset="studio" />
            </Canvas>
        </div>
    );
};

export default FloatingMesh3D;
