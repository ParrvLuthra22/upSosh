'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/src/store/useAppStore';

interface Point {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  originalX: number;
  originalY: number;
  originalZ: number;
}

const FloatingMesh3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<Point[]>([]);
  const animationRef = useRef<number>(0);
  const { isFormal } = useAppStore();

  // Configuration based on mode
  const config = {
    // Mustard yellow with varying opacity
    primaryColor: '#D4A017',
    secondaryColor: isFormal ? '#FFFFFF' : '#D4A017',
    particleCount: 80,
    connectionDistance: 150,
    mouseInfluence: 100,
    rotationSpeed: 0.0003,
    floatAmplitude: 30,
    floatSpeed: 0.0008,
  };

  const project = useCallback((point: Point, width: number, height: number, time: number) => {
    // Rotate around Y axis slowly
    const rotationY = time * config.rotationSpeed;
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    
    // Gentle breathing effect
    const breathe = Math.sin(time * 0.001) * 0.1 + 1;
    
    const rotatedX = point.x * cosY - point.z * sinY;
    const rotatedZ = point.x * sinY + point.z * cosY;
    
    // Perspective projection
    const perspective = 800;
    const scale = perspective / (perspective + rotatedZ * breathe);
    
    return {
      x: width / 2 + rotatedX * scale,
      y: height / 2 + point.y * scale,
      z: rotatedZ,
      scale,
    };
  }, [config.rotationSpeed]);

  const initPoints = useCallback((width: number, height: number) => {
    const points: Point[] = [];
    const spread = Math.min(width, height) * 0.4;
    
    for (let i = 0; i < config.particleCount; i++) {
      // Create points in a spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = spread * (0.5 + Math.random() * 0.5);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      points.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        originalX: x,
        originalY: y,
        originalZ: z,
      });
    }
    
    return points;
  }, [config.particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      if (pointsRef.current.length === 0) {
        pointsRef.current = initPoints(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    let startTime = Date.now();

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const time = Date.now() - startTime;

      ctx.clearRect(0, 0, width, height);

      const points = pointsRef.current;
      const projectedPoints: { x: number; y: number; z: number; scale: number; index: number }[] = [];

      // Update and project points
      points.forEach((point, index) => {
        // Floating motion
        const floatOffset = index * 0.5;
        point.x = point.originalX + Math.sin(time * config.floatSpeed + floatOffset) * config.floatAmplitude * 0.3;
        point.y = point.originalY + Math.cos(time * config.floatSpeed * 0.7 + floatOffset) * config.floatAmplitude * 0.5;
        point.z = point.originalZ + Math.sin(time * config.floatSpeed * 0.5 + floatOffset) * config.floatAmplitude * 0.2;

        const projected = project(point, width, height, time);
        projectedPoints.push({ ...projected, index });
      });

      // Sort by z-depth for proper rendering
      projectedPoints.sort((a, b) => b.z - a.z);

      // Draw connections first (behind particles)
      ctx.lineCap = 'round';
      
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p1 = projectedPoints[i];
          const p2 = projectedPoints[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.connectionDistance) {
            // Opacity based on distance and depth
            const depthFactor = ((p1.scale + p2.scale) / 2);
            const distanceFactor = 1 - distance / config.connectionDistance;
            const opacity = distanceFactor * depthFactor * 0.15;
            
            // Gradient line from primary to secondary color
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(212, 160, 23, ${opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.5})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = depthFactor * 1.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Mouse interaction - draw lines to nearby particles
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      
      if (mouseX > 0 && mouseY > 0) {
        projectedPoints.forEach((p) => {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.mouseInfluence) {
            const opacity = (1 - distance / config.mouseInfluence) * 0.4;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 160, 23, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        });
      }

      // Draw particles
      projectedPoints.forEach((p, i) => {
        const size = 2 + p.scale * 3;
        const opacity = 0.3 + p.scale * 0.5;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        glowGradient.addColorStop(0, `rgba(212, 160, 23, ${opacity * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(212, 160, 23, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.beginPath();
        ctx.fillStyle = i % 5 === 0 
          ? `rgba(255, 255, 255, ${opacity})` 
          : `rgba(212, 160, 23, ${opacity})`;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initPoints, project, config]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          opacity: 0.9,
          mixBlendMode: 'screen',
        }}
      />
      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
};

export default FloatingMesh3D;
