import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice Search is supported on Google Chrome, Edge, and modern browsers.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('Listening... speak now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSpeechFeedback(`Searching: "${transcript}"`);
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechFeedback(event.error === 'not-allowed' ? 'Microphone permission denied' : 'Could not hear voice');
        setTimeout(() => setSpeechFeedback(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setSpeechFeedback(null), 2500);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechFeedback(null);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={startListening}
        className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
        } ${className}`}
        title={isListening ? 'Listening...' : 'Voice Search'}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {speechFeedback && (
        <div className="absolute top-10 right-0 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-medium shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-1.5">
            {isListening && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />}
            <span>{speechFeedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
