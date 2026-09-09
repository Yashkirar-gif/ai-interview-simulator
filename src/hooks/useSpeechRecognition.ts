import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulated += event.results[i][0].transcript;
        }
        setTranscript(accumulated.trim());
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal pause in speech, don't disrupt session
          return;
        }
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          setError('Microphone access denied. You can switch to typing mode.');
        } else {
          setError(event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    
    try {
      setTranscript('');
      setError(null);
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      // Handle the case where start() is called while already running
      if (err.name !== 'InvalidStateError') {
        setError('Failed to start microphone. Please check permissions.');
        setIsListening(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    error, 
    isSupported: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  };
};
