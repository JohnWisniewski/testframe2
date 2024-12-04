// src/utils/SpeechHandler.ts
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
  
  export type SpeechCallback = (transcript: string) => void;
  
  class SpeechHandler {
    private recognition: any;
    private isListening: boolean;
  
    constructor() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
      if (!SpeechRecognition) {
        console.warn('SpeechRecognition API is not supported in this browser.');
        this.recognition = null;
        this.isListening = false;
        return;
      }
  
      this.recognition = new SpeechRecognition();
      this.isListening = false;
  
      this.recognition.continuous = true;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
    }
  
    startListening(callback: SpeechCallback) {
      if (!this.recognition) return;
  
      if (this.isListening) {
        console.warn('Speech recognition is already running.');
        return;
      }
  
      this.isListening = true;
  
      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
          .toLowerCase();
        callback(transcript);
      };
  
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
  
      this.recognition.start();
      console.log('Speech recognition started.');
    }
  
    stopListening() {
      if (!this.recognition || !this.isListening) return;
  
      this.recognition.stop();
      this.isListening = false;
      console.log('Speech recognition stopped.');
    }
  }
  
  const speechHandler = new SpeechHandler();
  export default speechHandler;