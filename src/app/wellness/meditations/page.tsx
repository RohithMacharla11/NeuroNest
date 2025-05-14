"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Play, Headphones, Filter, Search, Loader2, Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// Placeholder for AI integration
// import { getMeditationRecommendations, GetMeditationRecommendationsInput } from '@/ai/flows/get-meditation-recommendations'; 

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'Stress Relief' | 'Sleep' | 'Focus' | 'Gratitude' | 'Self-Compassion';
  audioSrc: string; // URL to audio file
  imageHint: string;
  isRecommended?: boolean;
}

const allMeditations: Meditation[] = [
  { id: 'stress-1', title: 'Calm Amidst Chaos', description: 'Find your center even when things feel overwhelming.', duration: 10, category: 'Stress Relief', audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', imageHint: 'calm water' },
  { id: 'sleep-1', title: 'Deep Slumber Journey', description: 'Drift off into a peaceful and restorative sleep.', duration: 15, category: 'Sleep', audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', imageHint: 'night sky stars' },
  { id: 'focus-1', title: 'Laser Sharp Concentration', description: 'Enhance your focus and productivity for the task ahead.', duration: 5, category: 'Focus', audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', imageHint: 'focused light' },
  { id: 'gratitude-1', title: 'Heart full of Thanks', description: 'Cultivate a sense of gratitude for the blessings in your life.', duration: 8, category: 'Gratitude', audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', imageHint: 'sunrise warmth' },
  { id: 'self-compassion-1', title: 'Kindness Within', description: 'Treat yourself with the same kindness you offer others.', duration: 12, category: 'Self-Compassion', audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', imageHint: 'gentle flower' },
  { id: 'stress-2', title: 'Release Tension', description: 'Let go of physical and mental stress.', duration: 7, category: 'Stress Relief', audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', imageHint: 'flowing river' },
];


export default function MeditationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredMeditations, setFilteredMeditations] = useState<Meditation[]>(allMeditations);
  const [currentPlaying, setCurrentPlaying] = useState<Meditation | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const { toast } = useToast();

  const categories = ['All', ...new Set(allMeditations.map(m => m.category))];

  useEffect(() => {
    // Simulate AI recommendations
    // This would be replaced by an actual AI call
    setIsLoadingRecommendations(true);
    setTimeout(() => {
        const recommendedIds = [allMeditations[0].id, allMeditations[2].id]; // Example: recommend first and third
        const updatedMeditations = allMeditations.map(m => ({...m, isRecommended: recommendedIds.includes(m.id)}));
        setFilteredMeditations(filterAndSort(updatedMeditations, searchTerm, selectedCategory));
        setIsLoadingRecommendations(false);
    }, 1000);
  }, []);


  const filterAndSort = (meditations: Meditation[], term: string, category: string): Meditation[] => {
    let result = meditations;
    if (category !== 'All') {
      result = result.filter(m => m.category === category);
    }
    if (term) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(term.toLowerCase()) ||
        m.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    // Sort recommended items to the top
    return result.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
  };

  useEffect(() => {
    const baseMeditations = allMeditations.map(m => ({...m, isRecommended: m.isRecommended || false }));
    setFilteredMeditations(filterAndSort(baseMeditations, searchTerm, selectedCategory));
  }, [searchTerm, selectedCategory]);

  const handlePlay = (meditation: Meditation) => {
    setCurrentPlaying(meditation);
    toast({ title: `Playing: ${meditation.title}`, description: "Enjoy your meditation session."});
  };
  

  return (
    <div className="space-y-8">
      <PageHeader
        title="Guided Meditations"
        description="Find peace and clarity with our collection of guided meditations. Dynamic recommendations coming soon!"
        icon={Brain}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Find Your Meditation</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search meditations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded-md bg-background text-sm focus:ring-primary focus:border-primary"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRecommendations && (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <p className="text-muted-foreground">Loading recommendations...</p>
             </div>
          )}
          {!isLoadingRecommendations && filteredMeditations.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No meditations found matching your criteria.</p>
          )}
          {!isLoadingRecommendations && filteredMeditations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeditations.map(meditation => (
                <Card key={meditation.id} className={`shadow-md hover:shadow-lg transition-shadow flex flex-col ${currentPlaying?.id === meditation.id ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="relative">
                    <Image src={`https://placehold.co/600x300.png?text=${meditation.title.replace(/\s/g,'+')}`} alt={meditation.title} width={600} height={300} className="rounded-t-md aspect-[16/9] object-cover" data-ai-hint={meditation.imageHint} />
                    {meditation.isRecommended && (
                        <Badge variant="default" className="absolute top-2 right-2 bg-primary text-primary-foreground">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Recommended
                        </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow pt-4">
                    <CardTitle className="text-lg mb-1">{meditation.title}</CardTitle>
                    <Badge variant="secondary" className="mb-2">{meditation.category}</Badge>
                    <CardDescription className="text-sm text-muted-foreground mb-2">{meditation.duration} min</CardDescription>
                    <p className="text-sm text-muted-foreground line-clamp-2">{meditation.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handlePlay(meditation)} className="w-full" variant={currentPlaying?.id === meditation.id ? "default" : "outline"}>
                      {currentPlaying?.id === meditation.id ? <Headphones className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {currentPlaying?.id === meditation.id ? 'Playing...' : 'Play'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentPlaying && (
        <Card className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl rounded-t-lg border-t-2 border-primary bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Now Playing: {currentPlaying.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls autoPlay src={currentPlaying.audioSrc} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </CardContent>
          <CardFooter>
             <Button variant="ghost" onClick={() => setCurrentPlaying(null)}>Close Player</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
