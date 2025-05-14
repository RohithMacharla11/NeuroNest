"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, PlayCircle, PauseCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  steps?: string[];
  imageHint: string;
  audioSrc?: string; // Optional: link to an audio file
}

const exercises: Exercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'A simple technique to calm your nervous system and reduce stress. Inhale, hold, exhale, hold – each for 4 seconds.',
    duration: 120, // 2 minutes
    steps: [
      "Sit comfortably with your back straight.",
      "Slowly exhale all air from your lungs.",
      "Inhale slowly through your nose for a count of 4.",
      "Hold your breath for a count of 4.",
      "Exhale slowly through your mouth for a count of 4.",
      "Hold your breath again for a count of 4.",
      "Repeat for the desired duration."
    ],
    imageHint: "geometric calming",
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    description: 'Bring awareness to different parts of your body, noticing any sensations without judgment.',
    duration: 300, // 5 minutes
    steps: [
        "Lie down or sit comfortably.",
        "Bring your attention to your feet. Notice any sensations.",
        "Slowly move your awareness up through your legs, torso, arms, and head.",
        "Acknowledge any tension or discomfort without trying to change it.",
        "If your mind wanders, gently bring it back to the part of your body you are focusing on."
    ],
    imageHint: "peaceful body outline",
  },
  {
    id: 'mindful-listening',
    title: 'Mindful Listening',
    description: 'Focus your attention on the sounds around you, without labeling or judging them.',
    duration: 180, // 3 minutes
    steps: [
        "Find a quiet place to sit.",
        "Close your eyes or soften your gaze.",
        "Bring your attention to the sounds around you. Listen to sounds near and far.",
        "Notice each sound as it arises and passes away.",
        "If you get distracted, gently redirect your attention back to listening."
    ],
    imageHint: "sound waves serene",
  }
];

export default function MindfulnessPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
        if (selectedExercise) {
          setProgress(((selectedExercise.duration - (timeLeft - 1)) / selectedExercise.duration) * 100);
        }
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      // Optionally, add a "finished" sound or notification
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, selectedExercise]);

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeLeft(exercise.duration);
    setProgress(0);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    if (selectedExercise) {
      setTimeLeft(selectedExercise.duration);
      setProgress(0);
      setIsPlaying(false); // Optionally, true to restart immediately
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mindfulness & Breathing Exercises"
        description="Find calm and presence with these guided exercises. Select an exercise to begin."
        icon={Wind}
      />

      {selectedExercise && (
        <Card className="shadow-lg sticky top-20 z-10 bg-background/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedExercise.title}</CardTitle>
            <CardDescription>{selectedExercise.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl font-bold text-primary">{formatTime(timeLeft)}</span>
              <div className="flex gap-2">
                <Button onClick={togglePlayPause} variant="outline" size="icon">
                  {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                </Button>
                <Button onClick={resetExercise} variant="outline" size="icon">
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full h-3 mb-6" />
            {selectedExercise.steps && (
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <h4 className="font-medium text-foreground">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                        {selectedExercise.steps.map((step, index) => <li key={index}>{step}</li>)}
                    </ol>
                </div>
            )}
             {selectedExercise.audioSrc && (
                <audio controls src={selectedExercise.audioSrc} className="w-full mt-4">
                    Your browser does not support the audio element.
                </audio>
            )}
          </CardContent>
           <CardFooter>
            <Button variant="ghost" onClick={() => setSelectedExercise(null)}>Close Exercise</Button>
           </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map(exercise => (
          <Card key={exercise.id} className={`shadow-md hover:shadow-lg transition-shadow flex flex-col ${selectedExercise?.id === exercise.id ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
               <Image src={`https://placehold.co/600x300.png?text=${exercise.title.replace(/\s/g,'+')}`} alt={exercise.title} width={600} height={300} className="rounded-md aspect-video object-cover mb-4" data-ai-hint={exercise.imageHint} />
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>{formatTime(exercise.duration)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => startExercise(exercise)} className="w-full" variant={selectedExercise?.id === exercise.id ? "default" : "outline"}>
                {selectedExercise?.id === exercise.id && isPlaying ? 'Playing...' : (selectedExercise?.id === exercise.id ? 'Selected' : 'Start Exercise')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Learn More About Mindfulness</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Mindfulness is the basic human ability to be fully present, aware of where we are and what we’re doing, and not overly reactive or overwhelmed by what’s going on around us. These exercises are a great start. For deeper dives, consider exploring resources from reputable organizations.</p>
          <Button variant="link" asChild>
            <a href="https://www.mindful.org/what-is-mindfulness/" target="_blank" rel="noopener noreferrer">
              Visit Mindful.org <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
