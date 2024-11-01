import React, { useState, useCallback } from 'react';
import './App.css';
import RTC from './RTC';
import SpeechToText from './speech';
import { isPolygonCovering75PercentOfBox, Point } from './bpoly';
import { calculatePolygonCenter } from './polygonUtils'; // Import polygon center calculation
import { getMovementDirection } from './movementUtils'; // Import movement logic

interface BoundingPolygon {
  normalizedVertices: { x: number; y: number }[];  // Array of vertices
}
interface DetectedObject {
  name: string;
  score: number;
  boundingPoly: BoundingPolygon;
}

function App() {
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [matchedObjects, setMatchedObjects] = useState<DetectedObject[]>([]);
  const [matchedByPolygon, setMatchedByPolygon] = useState<DetectedObject[]>([]);

  const imageWidth = 640; // Assume image/video width
  const imageHeight = 480;

  // Central bounding box as a preset polygon (replace with your actual central box polygon)
  const centralBox: Point[] = [
    { x: 0.4, y: 0.4 },
    { x: 0.6, y: 0.4 },
    { x: 0.6, y: 0.6 },
    { x: 0.4, y: 0.6 }
  ];

  const imageCenter = {
    x: imageWidth / 2,
    y: imageHeight / 2,
  };

  // Handle detected objects
  const handleVisionResult = (objects: DetectedObject[]) => {
    setDetectedObjects(objects);
    compareObjectsAndSpeech(objects, transcript);
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
      return isPolygonCovering75PercentOfBox(polygon, centralBox, 75); // Check if 75% of the polygon is inside the central box
    });
    setMatchedByPolygon(polygonMatches); // Store objects matched by polygon comparison
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frame your photo perfectly!</h1>

        <RTC handleVisionResult={handleVisionResult} matchedByPolygon={matchedByPolygon} />

        <SpeechToText handleTranscript={handleTranscript} />

        {detectedObjects.length > 0 && (
          <div>
            <h2>Detected Objects:</h2>
            <ul>
              {detectedObjects.map((obj, index) => (
                <li key={index}>{obj.name}</li>
              ))}
            </ul>
          </div>
        )}

        {matchedObjects.length > 0 && (
          <div>
            <h2>Matched Objects (based on speech):</h2>
            <ul>
              {matchedObjects.map((obj, index) => {
                const objectCenter = calculatePolygonCenter(obj.boundingPoly.normalizedVertices, imageWidth, imageHeight);
                const direction = getMovementDirection(objectCenter, imageCenter);

                return (
                  <li key={index}>
                    {obj.name} - Confidence: {Math.round(obj.score * 100)}%
                    <br />
                    <strong>Bounding Polygon Coordinates:</strong>
                    <ul>
                      {obj.boundingPoly.normalizedVertices.map((vertex, vIndex) => (
                        <li key={vIndex}>
                          x: {vertex.x.toFixed(2)}, y: {vertex.y.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <strong>Movement Direction:</strong> {direction}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {matchedByPolygon.length > 0 && (
          <div>
            <h2>Objects Covering 75% of Central Box:</h2>
            <ul>
              {matchedByPolygon.map((obj, index) => (
                <li key={index}>
                  {obj.name} - Confidence: {Math.round(obj.score * 100)}%
                  <br />
                  <strong>Bounding Polygon Coordinates:</strong>
                  <ul>
                    {obj.boundingPoly.normalizedVertices.map((vertex, vIndex) => (
                      <li key={vIndex}>
                        x: {vertex.x.toFixed(2)}, y: {vertex.y.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
