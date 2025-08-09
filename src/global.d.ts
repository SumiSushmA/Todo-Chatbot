declare module '@heroicons/react/outline';
declare module '@heroicons/react/solid';

// ---- SpeechRecognition API typings ----
type SpeechRecognitionLang = string;

interface SpeechRecognition extends EventTarget {
  lang: SpeechRecognitionLang;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => any) | null;
  onerror: ((e: Event) => any) | null;
  onend: ((e: Event) => any) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}

declare var SpeechRecognition: { new (): SpeechRecognition } | undefined;
declare var webkitSpeechRecognition: { new (): SpeechRecognition } | undefined;
