require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const vision = require('@google-cloud/vision');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Allow large images

// Initialize Google Vision Client using service account credentials
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,  // Path to your service account key
});

app.post('/api/detectObjects', async (req, res) => {
  try {
    const { image } = req.body;

    const [result] = await client.annotateImage({
      image: { content: image.split(',')[1] },  // Remove the base64 prefix
      features: [{ type: 'OBJECT_LOCALIZATION' }],
    });

    res.json(result.localizedObjectAnnotations); // Return detected objects
  } catch (error) {
    console.error('Error calling Vision API:', error);
    res.status(500).send('Error processing image');
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
