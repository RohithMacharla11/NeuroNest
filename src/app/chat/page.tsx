"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareHeart, Send, User, Bot, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { generateAffirmation, GenerateAffirmationInput } from '@/ai/flows/generate-affirmation'; // Using affirmation as a proxy
import { generateReflectionPrompt } from '@/ai/flows/generate-reflection-prompt';


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiTone, setAiTone] = useState<string>("friendly"); // Default tone from settings or hardcoded
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Function to scroll to the bottom of the chat
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
    // Load AI tone from settings if available
    const savedSettings = localStorage.getItem('neuroNestSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.aiTone) {
        setAiTone(settings.aiTone);
      }
    }
    // Initial AI message
    setMessages([{
        id: Date.now().toString(),
        text: "Hello! I'm your NeuroNest AI companion. How are you feeling today, or what's on your mind?",
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
    setInputText('');
    setIsLoading(true);

    try {
      // Simple logic: if user mentions mood, use affirmation. Otherwise, use reflection prompt.
      // This is a placeholder for a more sophisticated chat AI.
      let aiResponseText = "";
      if (inputText.toLowerCase().includes("feel") || inputText.toLowerCase().includes("mood")) {
        const affirmationInput: GenerateAffirmationInput = { mood: inputText }; // Use user text as mood context
        const affirmationOutput = await generateAffirmation(affirmationInput);
        aiResponseText = affirmationOutput.affirmation;
      } else if (messages.length < 3) { // For very early conversation, give a reflection prompt
        const reflectionOutput = await generateReflectionPrompt();
        aiResponseText = reflectionOutput.prompt;
      } else {
        // More generic response if no clear mood or it's not early convo
        // The generateAffirmation flow might still give a decent generic positive response
        const affirmationInput: GenerateAffirmationInput = { mood: "curious" }; 
        const affirmationOutput = await generateAffirmation(affirmationInput);
        aiResponseText = `That's interesting. ${affirmationOutput.affirmation}`;
      }
      
      // Simulate AI "typing" delay and adaptive tone (conceptually)
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(), // ensure unique ID
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
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
    <div className="flex flex-col h-[calc(100vh-150px)] sm:h-[calc(100vh-180px)]"> {/* Adjust height based on header */}
      <PageHeader
        title="AI Companion Chat"
        description={`Talk with your ${aiTone} AI. I'm here to listen and support you.`}
        icon={MessageSquareHeart}
      />

      <Card className="flex-grow flex flex-col shadow-lg overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Chatting with NeuroNest AI</CardTitle>
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
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow focus:ring-primary focus:border-primary"
              disabled={isLoading}
              aria-label="Chat message input"
              suppressHydrationWarning
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputText.trim()} aria-label="Send message" suppressHydrationWarning>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
