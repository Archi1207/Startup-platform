'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create floating cubes
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x8b5cf6,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8
    });

    const cubes: THREE.Mesh[] = [];
    const cubeCount = 8;

    for (let i = 0; i < cubeCount; i++) {
      const cube = new THREE.Mesh(geometry, material.clone());
      cube.material.color.setHSL(i / cubeCount, 0.7, 0.5);
      
      const angle = (i / cubeCount) * Math.PI * 2;
      const radius = 3;
      cube.position.x = Math.cos(angle) * radius;
      cube.position.y = Math.sin(angle * 2) * 1.5;
      cube.position.z = Math.sin(angle) * radius;
      
      cube.scale.setScalar(0.5 + Math.random() * 0.5);
      scene.add(cube);
      cubes.push(cube);
    }

    // Add central sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      metalness: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    camera.position.z = 8;

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Animate cubes
      cubes.forEach((cube, i) => {
        const angle = (i / cubeCount) * Math.PI * 2 + time * 0.5;
        const radius = 3 + Math.sin(time + i) * 0.5;
        cube.position.x = Math.cos(angle) * radius;
        cube.position.y = Math.sin(angle * 2 + time) * 1.5;
        cube.position.z = Math.sin(angle) * radius;
        
        cube.rotation.x = time * 0.5;
        cube.rotation.y = time * 0.3;
      });

      // Animate sphere
      sphere.rotation.y = time * 0.2;
      sphere.scale.setScalar(1 + Math.sin(time) * 0.1);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full rounded-2xl overflow-hidden border border-white/20"
    />
  );
}