'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useXRStore, Screenshot } from '@/store/xr-store';

export interface PhotoModeSceneProps {
  onCapture?: (dataUrl: string, screenshot: Screenshot) => void;
  photoModeEnabled: boolean;
}

/**
 * PhotoModeScene - 3D scene component that runs inside Canvas
 * Handles camera movement and stores refs for screenshot capture
 */
export function PhotoModeScene({ onCapture, photoModeEnabled }: PhotoModeSceneProps) {
  const { camera, scene, gl } = useThree();
  const originalPositionRef = useRef<Vector3>(new Vector3());
  const originalRotationRef = useRef(camera.rotation.clone());

  // Store camera refs when photo mode is enabled
  useEffect(() => {
    if (photoModeEnabled) {
      originalPositionRef.current.copy(camera.position);
      originalRotationRef.current.copy(camera.rotation);
      useXRStore.getState().setCameraRefs({ camera, scene, gl });
    } else {
      camera.position.copy(originalPositionRef.current);
      camera.rotation.copy(originalPositionRef.current);
    }
  }, [photoModeEnabled, camera, scene, gl]);

  // Expose capture function to store
  useEffect(() => {
    if (photoModeEnabled && camera && scene && gl) {
      const handleCapture = () => {
        const dataUrl = gl.domElement.toDataURL('image/png', 1.0);
        const screenshot: Screenshot = {
          id: `photo-${Date.now()}`,
          dataUrl,
          timestamp: Date.now(),
          filter: 'none',
          resolution: '1080p',
        };
        useXRStore.getState().addScreenshot(screenshot);
        onCapture?.(dataUrl, screenshot);
        // Trigger flash
        useXRStore.getState().setFlash(true);
        setTimeout(() => useXRStore.getState().setFlash(false), 150);
      };
      useXRStore.getState().setHandleCapture(() => handleCapture);
    }
  }, [photoModeEnabled, camera, scene, gl, onCapture]);

  return null;
}
