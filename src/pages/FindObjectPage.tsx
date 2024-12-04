// src/pages/DetectedObjectsPage.tsx
import React, { useState, useEffect } from 'react';
import RTC from '../RTC';
import SpeechToText from '../speech';
import { isPolygonCovering75PercentOfBox, Point } from '../bpoly';
import { calculatePolygonCenter } from '../polygonUtils';
import { getMovementDirection } from '../movementUtils';
import { Button, Typography, Container, Box, List, ListItem, Paper } from '@mui/material';

interface BoundingPolygon {
  normalizedVertices: { x: number; y: number }[];
}
interface DetectedObject {
  name: string;
  score: number;
  boundingPoly: BoundingPolygon;
}

const DetectedObjectsPage: React.FC = () => {
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [matchedObjects, setMatchedObjects] = useState<DetectedObject[]>([]);
  const [matchedByPolygon, setMatchedByPolygon] = useState<DetectedObject[]>([]);
  const [movementDirection, setMovementDirection] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState({ width: 640, height: 480 });

const [isLoopRunning, setIsLoopRunning] = useState<boolean>(false);

const startLoopManually = () => {
    setIsLoopRunning(true);
  };
const stopLoopManually = () => {
    setIsLoopRunning(false);
  };

  useEffect(() => {
    if (rtcRef.current) {
      const { width, height } = rtcRef.current.getImageDimensions();
      setImageDimensions({ width, height });
    }
  }, []);

  const imageWidth = imageDimensions.width;
  const imageHeight = imageDimensions.height;

  const centralBox: Point[] = [
    { x: 0.4, y: 0.4 },
    { x: 0.6, y: 0.4 },
    { x: 0.6, y: 0.6 },
    { x: 0.4, y: 0.6 },
  ];

  const imageCenter = {
    x: imageWidth / 2,
    y: imageHeight / 2,
  };

  // Handle detected objects
  const handleVisionResult = (objects: DetectedObject[]) => {
    setDetectedObjects(objects);
    compareObjectsAndSpeech(objects, transcript);

    // Calculate movement direction for the first detected object
    if (objects.length > 0) {
      const firstObject = objects[0];
      const objectCenter = calculatePolygonCenter(
        firstObject.boundingPoly.normalizedVertices,
        imageWidth,
        imageHeight
      );
      const direction = getMovementDirection(objectCenter, imageCenter);
      setMovementDirection(direction);

 const isCovering75Percent = isPolygonCovering75PercentOfBox(
      firstObject.boundingPoly.normalizedVertices,
      centralBox,
      75
    );

    if (direction === 'Object is centered') {
        if (isCovering75Percent) {
          setIsLoopRunning(false); // Stop the loop automatically
          setMovementDirection('Object is centered and covering 75%'); // Update message
        } else {
          setMovementDirection('Move closer'); // Prompt to move closer
        }
      } else {
        setMovementDirection(direction); // Update with movement direction
      }
    }
  };

  // Handle transcript from speech-to-text
  const handleTranscript = (text: string) => {
    setTranscript(text);
    compareObjectsAndSpeech(detectedObjects, text);
  };

  // Compare detected objects with transcript
  const compareObjectsAndSpeech = (objects: DetectedObject[], speechText: string) => {
    const matches = objects.filter((obj) =>
      speechText.toLowerCase().includes(obj.name.toLowerCase())
    );

    setMatchedObjects(matches);
    checkPolygonMatches(matches);
  };

  const checkPolygonMatches = (matchedBySpeech: DetectedObject[]) => {
    const polygonMatches = matchedBySpeech.filter((obj) => {
      const polygon = obj.boundingPoly.normalizedVertices;
      return isPolygonCovering75PercentOfBox(polygon, centralBox, 75);
    });
    setMatchedByPolygon(polygonMatches);
  };

  // Set up interval to capture and analyze images every 2 seconds
  useEffect(() => {
    if (!isLoopRunning) return; // Stop the interval if the loop is stopped

    const intervalId = setInterval(() => {
      sendToVisionAPI();
    }, 2000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [isLoopRunning]);






  
  // Capture and analyze image (mocked RTC capture function)
  const sendToVisionAPI = async () => {
    // Call the capture and analyze function within RTC
    if (rtcRef.current) {
      rtcRef.current.sendToVisionAPI();
    }
  };

  const rtcRef = React.useRef<any>(null);

  

  return (
    
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Frame Your Photo Perfectly!
        </Typography>
  
        <Box display="flex" justifyContent="center" gap={2} my={2}>
          <Button variant="contained" color="error" onClick={stopLoopManually}>
            Stop Loop
          </Button>
          <Button variant="contained" color="primary" onClick={startLoopManually}>
            Start Loop
          </Button>
        </Box>
  
        <Box my={4}>
          <RTC ref={rtcRef} handleVisionResult={handleVisionResult} />
        </Box>
  
        <SpeechToText handleTranscript={handleTranscript} />
  
        {detectedObjects.length > 0 && (
          <Box my={4}>
            <Typography variant="h5">Detected Objects:</Typography>
            <Paper elevation={3} sx={{ mt: 2 }}>
              <List>
                {detectedObjects.map((obj, index) => (
                  <ListItem key={index}>{obj.name}</ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
        {matchedByPolygon.length > 0 && (
  <Box my={4}>
    <Typography variant="h5">Objects Matched by Polygon:</Typography>
    <Paper elevation={3} sx={{ mt: 2 }}>
      <List>
        {matchedByPolygon.map((obj, index) => (
          <ListItem key={index}>
            <Typography variant="body1">
              <strong>{obj.name}</strong> - Confidence: {Math.round(obj.score * 100)}%
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  </Box>
)}
        {matchedObjects.length > 0 && (
          <Box my={4}>
            <Typography variant="h5">Matched Objects (Based on Speech):</Typography>
            <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
              <List>
                {matchedObjects.map((obj, index) => {
                  const objectCenter = calculatePolygonCenter(
                    obj.boundingPoly.normalizedVertices,
                    imageWidth,
                    imageHeight
                  );
                  const direction = getMovementDirection(objectCenter, imageCenter);
  
                  return (
                    <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body1">
                        <strong>{obj.name}</strong> - Confidence: {Math.round(obj.score * 100)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Movement Direction: {direction}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Box>
        )}
  
        <Box my={4}>
          <Typography variant="h5">Movement Direction:</Typography>
          <Typography variant="body1">{movementDirection || 'Object is centered'}</Typography>
        </Box>
      </Container>
    );
  };

export default DetectedObjectsPage;
