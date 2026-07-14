AI-Based Driver Cognitive Load Detection System
A real-time driver safety system that estimates cognitive load (Low/Medium/High) by combining webcam-based facial analysis, simulated driving behavior, and virtual biometric signals through a multi-modal AI model — then adapts alerts and UI to keep drivers focused.
Features

Facial analysis — MediaPipe Face Mesh tracks blink rate and head pose via webcam to detect fatigue and distraction
Simulated driving behavior — captures keyboard input to analyze steering irregularity and reaction delay
Virtual biometric estimation — infers stress from interaction patterns (reaction time, randomness)
Multi-modal AI model — Random Forest classifier fuses facial, behavioral, and biometric features into a live cognitive load score
Adaptive alerts — Text-to-Speech voice warnings and a Focus Driving Mode that simplifies the UI under high stress
Live dashboard — real-time webcam feed, cognitive load indicator, stress trend graphs, and analytics

Tech Stack

Frontend: React (Vite), Tailwind CSS, Recharts
Backend: FastAPI
Computer Vision: OpenCV, MediaPipe
ML: Scikit-learn (Random Forest)
Voice: pyttsx3 / gTTS

Live Demo !!!
https://6a55c29d7df402f1dadcb7b4--incandescent-cassata-5229c3.netlify.app/
