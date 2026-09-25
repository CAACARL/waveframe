# Hand Landmarker Model

The hand tracking model file `hand_landmarker.task` needs to be downloaded and placed in this `public/` directory.

## Download Location

Download from MediaPipe:
https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task

## Instructions

1. Download the file from the URL above
2. Place it in the `public/` directory (same level as this file)
3. The file should be at: `public/hand_landmarker.task`

The application will load this model from `${import.meta.env.BASE_URL}hand_landmarker.task`.
