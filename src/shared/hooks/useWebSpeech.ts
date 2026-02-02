'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type SpeechLanguage = 'en' | 'fr';
export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface UseWebSpeechOptions {
  language?: SpeechLanguage;
  onError?: (error: string) => void;
  onInterimResult?: (text: string) => void;
}

interface UseWebSpeechReturn {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  status: SpeechStatus;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  toggleVoice: () => boolean;
  setLanguage: (lang: SpeechLanguage) => void;
  language: SpeechLanguage;
  error: string | null;
}

const BROWSER_LANGUAGES: Record<SpeechLanguage, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

// Type declaration for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: unknown;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionConstructor {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useWebSpeech({
  language: initialLanguage = 'en',
  onError,
  onInterimResult,
}: UseWebSpeechOptions = {}): UseWebSpeechReturn {
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    return hasSpeechRecognition && hasSpeechSynthesis;
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState<SpeechLanguage>(initialLanguage);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    if (!hasSpeechRecognition || !hasSpeechSynthesis) {
      return !hasSpeechRecognition
        ? 'Speech recognition is not supported in this browser'
        : 'Speech synthesis is not supported in this browser';
    }
    return null;
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Report error to parent on mount if there is one
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = BROWSER_LANGUAGES[language];

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText);
      }
      if (interimText) {
        setInterimTranscript(interimText);
        onInterimResult?.(interimText);
      } else {
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg = `Speech recognition error: ${event.error}`;
      setError(errorMsg);
      setStatus('error');
      setIsListening(false);
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status !== 'error') {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, language, status, onError, onInterimResult]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      onError?.('Speech recognition is not available');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setError(null);
    recognitionRef.current.start();
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatus('idle');
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isSupported) {
      onError?.('Speech synthesis is not available');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BROWSER_LANGUAGES[language];

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(language));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatus('speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus('idle');
    };

    utterance.onerror = (event) => {
      const errorMsg = `Speech synthesis error: ${event.error}`;
      setError(errorMsg);
      setStatus('error');
      setIsSpeaking(false);
      onError?.(errorMsg);
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, language, onError]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setStatus('idle');
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
      return false;
    }
    startListening();
    return true;
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    isSpeaking,
    status,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoice,
    setLanguage,
    language,
    error,
  };
}
