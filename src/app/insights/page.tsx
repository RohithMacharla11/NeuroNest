"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, CalendarDays, FileText, Brain, Cloud, Activity, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTherapyExport, GenerateTherapyExportInput, GenerateTherapyExportOutput } from '@/ai/flows/generate-therapy-export';
import { generateReflectionPrompt, GenerateReflectionPromptOutput } from '@/ai/flows/generate-reflection-prompt';
import Image from 'next/image';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import { format, subDays, parseISO } from 'date-fns';


interface MoodLog {
  id: string;
  date: string; // ISO string
  mood: string; // Should match moods in MoodTrackerPage for scoring
}

const moodScoresForInsights: Record<string, number> = {
  ecstatic: 5, happy: 4, meh: 3, sad: 2, angry: 1, anxious: 2, tired: 2, // from MoodTrackerPage
};


export default function InsightsPage() {
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null);
  const [moodChartData, setMoodChartData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load mood data for chart
    const savedMoodLogs = localStorage.getItem('neuroNestMoodLogs');
    if (savedMoodLogs) {
      const logs: MoodLog[] = JSON.parse(savedMoodLogs);
      const today = new Date();
      const chartData = Array.from({ length: 7 }).map((_, i) => {
        const day = subDays(today, 6 - i);
        const dayLogs = logs.filter(log => format(parseISO(log.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
        const averageMood = dayLogs.length > 0 
          ? dayLogs.reduce((sum, log) => sum + (moodScoresForInsights[log.mood] || 0), 0) / dayLogs.length
          : null; // Use null for days with no data to create gaps or handle as 0
        return {
          date: format(day, 'MMM d'),
          mood: averageMood,
        };
      });
      setMoodChartData(chartData);
    }
  }, []);
  
  const chartConfig = {
    mood: {
      label: "Avg Mood",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  const handleGenerateExport = async () => {
    setIsLoadingExport(true);
    try {
      // Prepare dummy data or fetch actual data from localStorage/state
      const journalEntries = JSON.parse(localStorage.getItem('neuroNestJournalEntries') || '[]');
      const moodLogs = JSON.parse(localStorage.getItem('neuroNestMoodLogs') || '[]');
      const emotionalData = JSON.stringify({ journalEntries, moodLogs });

      const input: GenerateTherapyExportInput = {
        emotionalData,
        insightsRequested: "mood trends, trigger detection",
        // therapistContext: "Focus on anxiety management.", // Optional
        // aiTone: "professional" // Optional, fetch from settings
      };
      const output: GenerateTherapyExportOutput = await generateTherapyExport(input);
      
      // For now, just show a success message. Actual PDF download needs more setup.
      // You could create a Blob from base64 and trigger download.
      toast({ title: "Therapy Export Generated", description: "Report is ready (simulated). Base64 output in console." });
      console.log("Therapy Export (base64):", output.report.substring(0,100) + "..."); // Log a snippet
      
      // Example of triggering download for a base64 PDF:
      // const byteCharacters = atob(output.report);
      // const byteNumbers = new Array(byteCharacters.length);
      // for (let i = 0; i < byteCharacters.length; i++) {
      //   byteNumbers[i] = byteCharacters.charCodeAt(i);
      // }
      // const byteArray = new Uint8Array(byteNumbers);
      // const blob = new Blob([byteArray], {type: 'application/pdf'});
      // const link = document.createElement('a');
      // link.href = URL.createObjectURL(blob);
      // link.download = 'NeuroNest_Therapy_Export.pdf';
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

    } catch (error) {
      console.error("Error generating therapy export:", error);
      toast({ title: "Error", description: "Could not generate therapy export. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingExport(false);
    }
  };

  const fetchReflectionPrompt = async () => {
    setIsLoadingPrompt(true);
    try {
      const output: GenerateReflectionPromptOutput = await generateReflectionPrompt();
      setReflectionPrompt(output.prompt);
      toast({ title: "Reflection Prompt Ready", description: "A new prompt to guide your thoughts." });
    } catch (error) {
      console.error("Error generating reflection prompt:", error);
      toast({ title: "Error", description: "Could not generate reflection prompt.", variant: "destructive" });
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  useEffect(() => {
    fetchReflectionPrompt(); // Fetch initial prompt
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Emotional Insights"
        description="Understand your emotional landscape better with reports, trends, and AI-powered analysis."
        icon={BarChart3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Therapy Export</CardTitle>
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Generate a PDF report of your emotional trends and insights to share with a therapist or for personal review.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">This report can include mood summaries, identified triggers, and progress towards your emotional goals.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateExport} disabled={isLoadingExport} className="w-full">
              {isLoadingExport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Generate PDF Report
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex items-center justify-between">
                <CardTitle>Gratitude & Reflection</CardTitle>
                <Brain className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>AI-generated prompts to encourage gratitude and deeper reflection.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[100px]">
            {isLoadingPrompt && !reflectionPrompt ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> Loading prompt...
                </div>
            ) : reflectionPrompt ? (
              <p className="text-lg italic text-foreground">"{reflectionPrompt}"</p>
            ) : (
              <p className="text-muted-foreground">Click below to get a new prompt.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={fetchReflectionPrompt} disabled={isLoadingPrompt} variant="outline" className="w-full">
              {isLoadingPrompt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Get New Prompt
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Weekly Mood Timeline</CardTitle>
                <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          <CardDescription>Visualize your mood fluctuations over the past week.</CardDescription>
        </CardHeader>
        <CardContent>
        {moodChartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              accessibilityLayer
              data={moodChartData}
              margin={{
                left: -20,
                right: 12,
                top: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="mood"
                type="natural"
                fill="var(--color-mood)"
                fillOpacity={0.4}
                stroke="var(--color-mood)"
                stackId="a"
                connectNulls // This will connect lines over null data points
              />
            </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
           ) : (
             <p className="text-center text-muted-foreground py-10">Not enough mood data to display timeline. Log your mood regularly!</p>
           )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Trigger Word Cloud</CardTitle>
                <Cloud className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Commonly identified trigger words from your journal entries. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[150px] bg-muted/30 rounded-md">
            <Image src="https://placehold.co/300x150.png?text=Word+Cloud+Placeholder" alt="Trigger Word Cloud Placeholder" width={300} height={150} data-ai-hint="words cloud" />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Stress Peaks Heatmap</CardTitle>
                <Activity className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Identify patterns in when you experience higher stress. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[150px] bg-muted/30 rounded-md">
            <Image src="https://placehold.co/300x150.png?text=Heatmap+Placeholder" alt="Stress Heatmap Placeholder" width={300} height={150} data-ai-hint="heatmap chart" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
