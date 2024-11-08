import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface RTCProps {
  handleVisionResult: (detectedObjects: any[]) => void;  // Function to pass detected objects to parent
  matchedByPolygon: any[];  // Pass the objects matched by polygon check to stop the loop
}

const RTC: React.FC<RTCProps> = ({ handleVisionResult, matchedByPolygon }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [captureInterval, setCaptureInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Access the webcam
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }});
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    getMedia();
  }, []);

  useEffect(() => {
    if (matchedByPolygon.length > 0) {
      // Stop the loop when the object is centered and covers 75% of the box
      if (captureInterval) {
        clearInterval(captureInterval);
        console.log("Loop has stopped because object is close enough and centered.");
      }
    }
  }, [matchedByPolygon, captureInterval]);

  // Capture image from video stream
  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');  // Base64 image
      setCapturedImage(imageData);  // Store captured image in state
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
        const objects = response.data;  // Store detected objects
        setDetectedObjects(objects);
        handleVisionResult(objects);  // Pass detected objects to the parent component
      } catch (error) {
        console.error('Error sending image to backend:', error);
      }
    }
  };

  const startCaptureLoop = () => {
    if (!captureInterval) {
      const interval = setInterval(sendToVisionAPI, 2000); // Capture every 2 seconds
      setCaptureInterval(interval);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
      <br />
      <button onClick={startCaptureLoop}>Start Capture Loop</button>
      {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />}
      {detectedObjects.length > 0 && (
        <div>
          <h3>Detected Objects:</h3>
          <ul>
            {detectedObjects.map((obj, index) => (
              <li key={index}>
                {obj.name} - Confidence: {Math.round(obj.score * 100)}%
                <br />
                <strong>Bounding Box Coordinates:</strong>
                <ul>
                  {obj.boundingPoly.normalizedVertices.map((vertex: any, vIndex: number) => (
                    <li key={vIndex}>
                      x: {vertex.x}, y: {vertex.y}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RTC;
