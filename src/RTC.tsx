// src/RTC.tsx
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

interface RTCProps {
  handleVisionResult: (detectedObjects: any[]) => void;
}

const RTC = forwardRef<any, RTCProps>(({ handleVisionResult }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);

  useEffect(() => {
    // Access the webcam
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    getMedia();
  }, []);

  // Capture image from video stream
  const captureImage = () => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png'); // Base64 image
      setCapturedImage(imageData);
      return imageData;
    }
    return null;
  };

  // Send captured image to the backend for object detection
  const sendToVisionAPI = async () => {
    const image = captureImage();
    if (image) {
      try {
        const response = await axios.post('https://testframe2-onyt.onrender.com/api/detectObjects', {
          image,
        });
        const objects = response.data;
        setDetectedObjects(objects);
        handleVisionResult(objects);
      } catch (error) {
        console.error('Error sending image to backend:', error);
      }
    }
  };

  const getImageDimensions = () => {
    if (videoRef.current) {
      return {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };
    }
    return { width: 0, height: 0 };
  };

  // Use useImperativeHandle to expose sendToVisionAPI to the parent component
  useImperativeHandle(ref, () => ({
    sendToVisionAPI,
    getImageDimensions,
  }));

  return (
<div style={{ display: 'flex', gap: '20px' }}>
    {/* Video feed */}
    <div style={{ flex: 1 }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
    </div>

    {/* Captured image and detected objects */}
    <div style={{ flex: 1 }}>
      {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />}
      
      {detectedObjects.length > 0 && (
        <div>
          <h3>Detected Objects:</h3>
          <ul>
            {detectedObjects.map((obj, index) => (
              <li key={index}>
                {obj.name} - Confidence: {Math.round(obj.score * 100)}%
                <br />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);
});

export default RTC;

