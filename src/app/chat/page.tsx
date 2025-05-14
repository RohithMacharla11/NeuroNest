
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareHeart, Send, User, Bot, Loader2, ArrowRight, Mic, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { generateChatResponse, GenerateChatResponseInput, GenerateChatResponseOutput } from '@/ai/flows/generate-chat-response';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestedNavigation?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiTone, setAiTone] = useState<string>("friendly");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setBrowserSupportsSpeech(false);
      toast({ title: "Voice Input Not Supported", description: "Your browser doesn't support speech recognition.", variant: "destructive" });
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false; // Listen for a single utterance then stop.
    recognitionInstance.interimResults = true; // Get results as they come.
    try {
        recognitionInstance.lang = navigator.language || 'en-US'; // Use browser's language
    } catch (e) {
        console.warn("Browser language for speech recognition not fully supported, defaulting to en-US");
        recognitionInstance.lang = 'en-US';
    }
    

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInputText(finalTranscript || interimTranscript);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      let errorMsg = "Speech recognition error. Please try again.";
      if (event.error === 'no-speech') {
        errorMsg = "No speech was detected. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorMsg = "Microphone problem. Ensure it's connected and enabled.";
      } else if (event.error === 'not-allowed') {
        errorMsg = "Permission to use microphone was denied. Please enable it in your browser settings.";
      } else if (event.error === 'language-not-supported') {
        errorMsg = `The language (${recognitionInstance.lang}) is not supported for speech recognition.`;
         setBrowserSupportsSpeech(false); // Treat as not supported for this language
      }
      toast({ title: "Voice Error", description: errorMsg, variant: "destructive" });
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);


  const handleToggleListening = async () => {
    if (!recognitionRef.current) {
      if (!browserSupportsSpeech) {
        toast({ title: "Voice Input Not Supported", description: "Your browser doesn't support speech recognition.", variant: "destructive" });
      } else {
        toast({ title: "Voice Recognition Not Ready", description: "Please wait a moment and try again.", variant: "destructive" });
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Ensure microphone permission by a direct request, though SpeechRecognition API handles it too.
        // This can sometimes surface the permission prompt more reliably or catch issues early.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // We don't need to use the stream directly here, just confirm permission.
        // Some browsers/setups might require the stream to be explicitly stopped if not used.
        stream.getTracks().forEach(track => track.stop());


        recognitionRef.current.start();
        setIsListening(true);
        setInputText(''); // Clear input field when starting to listen
      } catch (err: any) {
        console.error("Error accessing microphone:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             toast({ title: "Microphone Access Denied", description: "Please enable microphone permissions in your browser settings.", variant: "destructive" });
        } else {
            toast({ title: "Microphone Error", description: `Could not access microphone: ${err.message}`, variant: "destructive" });
        }
        setIsListening(false);
      }
    }
  };


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('neuroNestSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.aiTone) {
        setAiTone(settings.aiTone);
      }
    }
    setMessages([{
        id: Date.now().toString(),
        text: "Hello! I'm NeuroNest, your AI companion. What's on your mind today, or is there something specific I can help you with in the app?",
        sender: 'ai',
        timestamp: new Date()
    }]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistoryForFlow = messages.slice(-5).map(msg => ({
        sender: msg.sender,
        text: msg.text,
      }));
      
      const input: GenerateChatResponseInput = {
        userInput: currentInput,
        chatHistory: chatHistoryForFlow,
        aiTone: aiTone,
        userLanguage: recognitionRef.current?.lang || navigator.language 
      };

      const output: GenerateChatResponseOutput = await generateChatResponse(input);
      
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: output.responseText,
        sender: 'ai',
        timestamp: new Date(),
        suggestedNavigation: output.suggestedNavigation,
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({ title: "AI Error", description: "Sorry, I couldn't process that. Let's try something else.", variant: "destructive" });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I seem to be having a little trouble responding right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] sm:h-[calc(100vh-180px)]">
      <PageHeader
        title="AI Companion Chat"
        description={`Chat with NeuroNest, your ${aiTone} AI. I'm here to listen, support, and help you navigate the app.`}
        icon={MessageSquareHeart}
      />

      <Card className="flex-grow flex flex-col shadow-lg overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary"/> Chatting with NeuroNest AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/40x40/008080/FFFFFF.png?text=AI" alt="AI Avatar" data-ai-hint="robot face"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === 'ai' && msg.suggestedNavigation && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 bg-background hover:bg-accent text-accent-foreground hover:text-accent-foreground"
                        onClick={() => router.push(msg.suggestedNavigation!)}
                      >
                        Go to {msg.suggestedNavigation.startsWith('/wellness/') ? msg.suggestedNavigation.split('/')[2] : msg.suggestedNavigation.substring(1) || 'page'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src="https://placehold.co/40x40/E6E6FA/000000.png?text=U" alt="User Avatar" data-ai-hint="person silhouette"/>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40/008080/FFFFFF.png?text=AI" alt="AI Avatar" data-ai-hint="robot face"/>
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-secondary text-secondary-foreground shadow-sm rounded-bl-none">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex w-full items-center gap-2"
          >
            <Input
              type="text"
              placeholder={isListening ? "Listening..." : "Type or say something..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow focus:ring-primary focus:border-primary"
              disabled={isLoading}
              aria-label="Chat message input"
              suppressHydrationWarning
              onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={handleToggleListening} 
              variant={isListening ? "destructive" : "outline"} 
              disabled={isLoading || !browserSupportsSpeech} 
              aria-label="Toggle voice input"
              title={!browserSupportsSpeech ? "Voice input not supported by your browser" : (isListening ? "Stop listening" : "Start listening")}
              suppressHydrationWarning
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="submit" size="icon" disabled={isLoading || !inputText.trim()} aria-label="Send message" suppressHydrationWarning>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

