import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

interface FaceAnalysisProps {
  onStatsUpdate: (stats: { blinkRate: number; headPose: { x: number; y: number; z: number } }) => void;
}

export const FaceAnalysis: React.FC<FaceAnalysisProps> = ({ onStatsUpdate }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!canvasRef.current || !webcamRef.current?.video) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // We don't necessarily need to draw the mesh, but we can for visual feedback
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Calculate head pose (simplified)
        // Nose tip is landmark 1, chin is 152, left eye 33, right eye 263
        const nose = landmarks[1];
        const headX = (nose.x - 0.5) * 2; // Horizontal deviation
        const headY = (nose.y - 0.5) * 2; // Vertical deviation
        
        // Blink detection (simplified EAR - Eye Aspect Ratio)
        // Left eye: 159 (top), 145 (bottom)
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const eyeDist = Math.sqrt(Math.pow(leftEyeTop.x - leftEyeBottom.x, 2) + Math.pow(leftEyeTop.y - leftEyeBottom.y, 2));
        
        // This is a very rough approximation for the demo
        const isBlinking = eyeDist < 0.015;

        onStatsUpdate({
          blinkRate: isBlinking ? 40 : 15, // Mocking a rate change on blink detection
          headPose: { x: headX, y: headY, z: 0 }
        });

        // Draw landmarks
        canvasCtx.fillStyle = '#ef4444';
        for (const landmark of landmarks) {
          canvasCtx.beginPath();
          canvasCtx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 1, 0, 2 * Math.PI);
          canvasCtx.fill();
        }
      }
      canvasCtx.restore();
    });

    if (webcamRef.current?.video) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await faceMesh.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setIsLoaded(true);
    }

    return () => {
      faceMesh.close();
    };
  }, []);

  return (
    <div className="relative w-full h-full glass-panel flex items-center justify-center bg-black">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
          <div className="text-red-500 animate-pulse font-mono">INITIALIZING AI VISION...</div>
        </div>
      )}
      <Webcam
        ref={webcamRef}
        className="absolute inset-0 w-full h-full object-cover opacity-100"
        mirrored
        screenshotFormat="image/jpeg"
        screenshotQuality={0.92}
        audio={false}
        disablePictureInPicture={true}
        forceScreenshotSourceSize={false}
        imageSmoothing={true}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        onStream={null}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        width={640}
        height={480}
      />
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Live Feed</span>
      </div>
    </div>
  );
};
