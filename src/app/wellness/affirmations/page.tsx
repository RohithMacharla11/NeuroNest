"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw, Share2, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAffirmation, GenerateAffirmationInput, GenerateAffirmationOutput } from '@/ai/flows/generate-affirmation';
import Image from 'next/image';

export default function AffirmationsPage() {
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>("neutral"); // Default mood
  const { toast } = useToast();

  const fetchAffirmation = async (mood?: string) => {
    setIsLoading(true);
    try {
      const input: GenerateAffirmationInput = { mood: mood || currentMood };
      const output: GenerateAffirmationOutput = await generateAffirmation(input);
      setAffirmation(output.affirmation);
      toast({ title: "Affirmation Generated!", description: "A new affirmation is ready for you." });
    } catch (error) {
      console.error("Error generating affirmation:", error);
      toast({ title: "Error", description: "Could not generate affirmation. Please try again.", variant: "destructive" });
      setAffirmation("Failed to load affirmation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch an initial affirmation on load
    fetchAffirmation();
     // Try to get mood from local storage (from mood tracker potentially)
    const savedMoodLogs = localStorage.getItem('neuroNestMoodLogs');
    if (savedMoodLogs) {
      const logs = JSON.parse(savedMoodLogs);
      if (logs.length > 0) {
        setCurrentMood(logs[0].mood); // Use the latest mood
      }
    }
  }, []); // Empty dependency array to run only once on mount

  const handleCopyToClipboard = () => {
    if (affirmation) {
      navigator.clipboard.writeText(affirmation);
      toast({ title: "Copied!", description: "Affirmation copied to clipboard." });
    }
  };

  const handleShare = () => {
    if (affirmation) {
      if (navigator.share) {
        navigator.share({
          title: 'My Daily Affirmation from NeuroNest',
          text: affirmation,
        }).catch(error => console.log('Error sharing', error));
      } else {
        toast({ title: "Share Not Supported", description: "Your browser doesn't support sharing this way. Try copying!" });
      }
    }
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Daily Affirmations"
        description="Embrace positivity with a personalized affirmation generated just for you."
        icon={Sparkles}
        actions={
          <Button onClick={() => fetchAffirmation()} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            New Affirmation
          </Button>
        }
      />

      <Card className="shadow-xl min-h-[300px] flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader>
           <Image src="https://placehold.co/150x150.png" alt="Inspirational Visual" width={150} height={150} className="rounded-full mx-auto mb-4 shadow-md" data-ai-hint="uplifting light" />
          <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
            Your Affirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center px-6 py-8">
          {isLoading && !affirmation ? (
             <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating your affirmation...</p>
             </div>
          ) : affirmation ? (
            <p className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed text-foreground">
              "{affirmation}"
            </p>
          ) : (
            <p className="text-muted-foreground">Click "New Affirmation" to get started.</p>
          )}
        </CardContent>
        {affirmation && !isLoading && (
          <CardFooter className="flex justify-center gap-2 pb-6">
            <Button variant="outline" size="icon" onClick={handleCopyToClipboard} title="Copy to Clipboard">
              <ClipboardCopy className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} title="Share Affirmation">
              <Share2 className="h-5 w-5" />
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Why Affirmations?</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>Positive affirmations are statements that can help you to challenge and overcome self-sabotaging and negative thoughts. When you repeat them often, and believe in them, you can start to make positive changes.</p>
          <p>Use this space to generate affirmations based on how you're feeling (your latest mood is used by default), or just get a random one to brighten your day!</p>
        </CardContent>
      </Card>
    </div>
  );
}
