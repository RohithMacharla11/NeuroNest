
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile, Frown, Meh, Laugh, Angry, Annoyed, BatteryLow, PlusCircle, BarChartHorizontalBig, TrendingUp, TrendingDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

type Mood = 'ecstatic' | 'happy' | 'meh' | 'sad' | 'angry' | 'anxious' | 'tired';

interface MoodLog {
  id: string;
  date: string; // ISO string
  mood: Mood;
  notes?: string;
}

const moodOptions: { mood: Mood; icon: React.ElementType; label: string, color: string }[] = [
  { mood: 'ecstatic', icon: Laugh, label: 'Ecstatic', color: 'hsl(var(--chart-1))' },
  { mood: 'happy', icon: Smile, label: 'Happy', color: 'hsl(var(--chart-2))' },
  { mood: 'meh', icon: Meh, label: 'Meh', color: 'hsl(var(--chart-3))' },
  { mood: 'sad', icon: Frown, label: 'Sad', color: 'hsl(var(--chart-4))' },
  { mood: 'angry', icon: Angry, label: 'Angry', color: 'hsl(var(--chart-5))' },
  { mood: 'anxious', icon: Annoyed, label: 'Anxious', color: 'hsl(var(--accent))' },
  { mood: 'tired', icon: BatteryLow, label: 'Tired', color: 'hsl(var(--muted-foreground))' },
];

const moodScores: Record<Mood, number> = {
  ecstatic: 5,
  happy: 4,
  meh: 3,
  sad: 2,
  angry: 1,
  anxious: 2,
  tired: 2,
};


export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedLogs = localStorage.getItem('neuroNestMoodLogs');
    if (savedLogs) {
      setMoodLogs(JSON.parse(savedLogs).map((log: MoodLog) => ({...log, date: log.date })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('neuroNestMoodLogs', JSON.stringify(moodLogs));
  }, [moodLogs]);

  const handleLogMood = () => {
    if (!selectedMood) {
      toast({ title: "No Mood Selected", description: "Please select a mood to log.", variant: "destructive" });
      return;
    }
    const newLog: MoodLog = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      mood: selectedMood,
    };
    setMoodLogs(prevLogs => [newLog, ...prevLogs.slice(0, 29)]); // Keep last 30 logs for chart
    setSelectedMood(null);
    toast({ title: "Mood Logged", description: `You've logged your mood as ${selectedMood}.` });
  };

  const chartData = moodLogs
    .slice() // Create a copy to avoid mutating original
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
    .slice(-10) // Take the last 10 entries for the chart
    .map(log => ({
      date: format(parseISO(log.date), 'MMM d'),
      moodScore: moodScores[log.mood],
      fill: moodOptions.find(opt => opt.mood === log.mood)?.color || 'hsl(var(--foreground))',
    }));
  
  const chartConfig = {
    moodScore: {
      label: "Mood Score",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  const getMoodTrend = (): { trend: 'up' | 'down' | 'stable', change: number } => {
    if (moodLogs.length < 2) return { trend: 'stable', change: 0 };
    const latestMoods = moodLogs.slice(0, 5).map(log => moodScores[log.mood]); // Last 5 moods
    if (latestMoods.length < 2) return { trend: 'stable', change: 0 };
    
    const averageLatest = latestMoods.reduce((sum, score) => sum + score, 0) / latestMoods.length;
    
    let previousMoods: number[];
    if (moodLogs.length <= 5) { // if less than 5 logs, compare with first log
        previousMoods = [moodScores[moodLogs[moodLogs.length-1].mood]];
    } else { // compare with the 5 logs before the latest 5
        previousMoods = moodLogs.slice(5, 10).map(log => moodScores[log.mood]);
    }
    if (previousMoods.length === 0) return { trend: 'stable', change: 0};
    
    const averagePrevious = previousMoods.reduce((sum, score) => sum + score, 0) / previousMoods.length;

    const change = averageLatest - averagePrevious;
    if (change > 0.5) return { trend: 'up', change };
    if (change < -0.5) return { trend: 'down', change };
    return { trend: 'stable', change };
  };

  const moodTrend = getMoodTrend();


  return (
    <div className="space-y-8">
      <PageHeader
        title="Mood Tracker"
        description="How are you feeling today? Log your mood to understand your emotional patterns."
        icon={Smile}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Log Your Current Mood</CardTitle>
          <CardDescription>Select an emoji that best represents how you feel.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {moodOptions.map(({ mood, icon: Icon, label }) => (
            <Button
              key={mood}
              variant={selectedMood === mood ? 'default' : 'outline'}
              onClick={() => setSelectedMood(mood)}
              className={`flex flex-col items-center justify-center h-24 w-24 sm:h-28 sm:w-28 p-2 rounded-lg transition-all transform hover:scale-105
                ${selectedMood === mood ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm'}`}
              aria-label={`Select mood: ${label}`}
            >
              <Icon className={`h-10 w-10 sm:h-12 sm:w-12 mb-1 ${selectedMood === mood ? 'text-primary-foreground': 'text-primary'}`} />
              <span className={`text-xs sm:text-sm font-medium ${selectedMood === mood ? 'text-primary-foreground': 'text-foreground'}`}>{label}</span>
            </Button>
          ))}
        </CardContent>
        <CardFooter className="flex justify-center pt-6">
          <Button onClick={handleLogMood} disabled={!selectedMood} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Log Mood
          </Button>
        </CardFooter>
      </Card>

      {moodLogs.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Mood Trend</CardTitle>
            <CardDescription>A quick look at your mood scores over the last few entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              {moodTrend.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
              {moodTrend.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
              {moodTrend.trend === 'stable' && <BarChartHorizontalBig className="h-5 w-5 text-yellow-500" />}
              <span>
                Your mood is generally trending {moodTrend.trend}
                {moodTrend.trend !== 'stable' && ` (change: ${moodTrend.change.toFixed(1)})`}.
              </span>
            </div>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tickFormatter={(value) => moodOptions.find(m => moodScores[m.mood] === value)?.label.substring(0,3) || ''} tickLine={false} axisLine={false} tickMargin={8}/>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                  <Bar dataKey="moodScore" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Mood History</CardTitle>
          <CardDescription>Your recent mood logs.</CardDescription>
        </CardHeader>
        <CardContent>
          {moodLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No moods logged yet. Select a mood above to get started!</p>
          ) : (
            <ScrollArea className="h-[300px] pr-3">
              <ul className="space-y-3">
                {moodLogs.map(log => {
                  const moodInfo = moodOptions.find(opt => opt.mood === log.mood);
                  return (
                    <li key={log.id} className="flex items-center justify-between p-3 bg-card hover:bg-secondary/30 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {moodInfo && <moodInfo.icon className="h-6 w-6" style={{color: moodInfo.color}} />}
                        <span className="font-medium capitalize">{log.mood}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{format(parseISO(log.date), "MMM d, yyyy - h:mm a")}</span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
