"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookText, Mic, Image as ImageIcon, PlusCircle, Loader2, AlertTriangle, BrainCircuit, Search } from 'lucide-react';
import { analyzeSentiment, AnalyzeSentimentInput, AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { detectTriggers, DetectTriggersInput, DetectTriggersOutput } from '@/ai/flows/detect-triggers';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface JournalEntry {
  id: string;
  date: Date;
  text: string;
  sentiment?: AnalyzeSentimentOutput;
  triggers?: DetectTriggersOutput;
}

export default function JournalPage() {
  const [entryText, setEntryText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('neuroNestJournalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries).map((entry: any) => ({...entry, date: new Date(entry.date)})));
    }
  }, []);

  useEffect(() => {
    // Save entries to localStorage
    localStorage.setItem('neuroNestJournalEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = async () => {
    if (!entryText.trim()) {
      toast({ title: "Empty Entry", description: "Please write something before saving.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const sentimentInput: AnalyzeSentimentInput = { text: entryText };
      const sentimentOutput = await analyzeSentiment(sentimentInput);

      const triggersInput: DetectTriggersInput = { journalEntry: entryText };
      const triggersOutput = await detectTriggers(triggersInput);

      const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        date: new Date(),
        text: entryText,
        sentiment: sentimentOutput,
        triggers: triggersOutput,
      };
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      setEntryText('');
      toast({ title: "Entry Saved", description: "Your journal entry has been saved and analyzed." });
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({ title: "Error", description: "Could not save or analyze entry. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.sentiment?.emotion && entry.sentiment.emotion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.triggers?.triggerWords && entry.triggers.triggerWords.some(word => word.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  const getSentimentBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score > 0.3) return "default"; // Positive
    if (score < -0.3) return "destructive"; // Negative
    return "secondary"; // Neutral
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Daily Journal"
        description="Reflect on your day, thoughts, and feelings. Your private space to express yourself."
        icon={BookText}
        actions={
          <Button onClick={handleSaveEntry} disabled={isLoading || !entryText.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Save Entry
          </Button>
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
          <CardDescription>What's on your mind today?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Start writing here..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            rows={8}
            className="mb-4 focus:ring-primary focus:border-primary"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isLoading} onClick={() => toast({title: "Voice Input", description:"Voice input feature coming soon!"})}>
              <Mic className="mr-2 h-4 w-4" /> Voice
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading} onClick={() => toast({title: "Drawing Input", description:"Drawing input feature coming soon!"})}>
              <ImageIcon className="mr-2 h-4 w-4" /> Draw
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Past Entries</CardTitle>
          <CardDescription>Review your reflections and insights.</CardDescription>
          <div className="pt-4">
            <Input 
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
             <div className="text-center py-8">
                <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                    {entries.length === 0 ? "You haven't written any entries yet." : "No entries match your search."}
                </p>
                {entries.length === 0 && <p className="text-sm text-muted-foreground">Start by writing your first entry above!</p>}
            </div>
          ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {filteredEntries.map(entry => (
                <Card key={entry.id} className="bg-card/50_ border-border_ shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{format(entry.date, "MMMM d, yyyy - h:mm a")}</CardTitle>
                      {entry.sentiment && (
                        <Badge variant={getSentimentBadgeVariant(entry.sentiment.score)} className="capitalize text-xs">
                          {entry.sentiment.emotion} ({entry.sentiment.score.toFixed(2)})
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{entry.text}</p>
                  </CardContent>
                  {entry.triggers && entry.triggers.triggersDetected && (
                    <CardFooter className="flex-col items-start gap-2 pt-4 border-t mt-4">
                      <div className="flex items-center text-destructive text-sm font-medium">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Potential Triggers Detected:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entry.triggers.triggerWords.map(word => (
                          <Badge key={word} variant="destructive" className="text-xs">{word}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic">{entry.triggers.summary}</p>
                    </CardFooter>
                  )}
                   {entry.sentiment && (
                     <CardFooter className="flex-col items-start gap-2 pt-4 border-t mt-2">
                        <div className="flex items-center text-primary text-sm font-medium">
                            <BrainCircuit className="mr-2 h-4 w-4" /> AI Analysis:
                        </div>
                        <p className="text-xs text-muted-foreground">Sentiment: {entry.sentiment.sentiment} (Score: {entry.sentiment.score.toFixed(2)})</p>
                        <p className="text-xs text-muted-foreground">Primary Emotion: {entry.sentiment.emotion}</p>
                     </CardFooter>
                   )}
                </Card>
              ))}
            </div>
          </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
