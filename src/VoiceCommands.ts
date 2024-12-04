// src/utils/voiceCommands.ts

declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Speech Recognition API is not supported in this browser.");
  }
  
  export const startVoiceNavigation = () => {
    if (!SpeechRecognition) return;
  
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
  
    recognition.start();
  
    recognition.onresult = (event: any) => {
      const command = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
        .toLowerCase();
  
      // Handle recognized command
      handleVoiceCommand(command);
    };
  
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
  
    return recognition;
  };
  
  const handleVoiceCommand = (command: string) => {
    console.log("Recognized Command:", command);
  
    // Find buttons with matching aria-label or data-command
    const buttons = document.querySelectorAll<HTMLButtonElement>("[aria-label], [data-command]");
    buttons.forEach((button) => {
      const label = button.getAttribute("aria-label");
      const dataCommand = button.getAttribute("data-command");
  
      // Ensure `label` and `dataCommand` are not null before calling `.toLowerCase()`
      if (
        (label && command.includes(label.toLowerCase())) ||
        (dataCommand && command.includes(dataCommand.toLowerCase()))
      ) {
        button.click(); // Simulate a button click
      }
    });
  };
  export const processTranscript = (transcript: string, navigate: (path: string) => void) => {
    console.log('Raw Transcript:', transcript);
  
    // Normalize the transcript: remove spaces, punctuation, and convert to lowercase
    const cleanedTranscript = transcript.replace(/[^\w]/g, '').toLowerCase();
    console.log('Cleaned Transcript:', cleanedTranscript);
  
    // Define the keywords to detect
    const goToKeyword = 'goto';
    const detectedObjectsKeyword = 'detectedobjects';
  
    // Check if the cleaned transcript includes both keywords
    if (cleanedTranscript.includes(goToKeyword) && cleanedTranscript.includes(detectedObjectsKeyword)) {
      console.log('Navigating to /detected-objects');
      navigate('/detected-objects'); // Trigger navigation
    } else {
      console.log('Required keywords not found in transcript.');
    }
  };
  export {};