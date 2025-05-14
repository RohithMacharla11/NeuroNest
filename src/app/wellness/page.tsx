import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeartPulse, Sparkles, Wind, Brain, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const wellnessSections = [
  {
    title: "Daily Affirmations",
    description: "Start your day with positive reinforcement. AI-generated affirmations to uplift your spirit.",
    href: "/wellness/affirmations",
    icon: Sparkles,
    imageSrc: "https://placehold.co/600x400.png",
    dataAiHint: "positive sunrise"
  },
  {
    title: "Mindfulness Exercises",
    description: "Practice staying present with guided mindfulness and breathing exercises.",
    href: "/wellness/mindfulness",
    icon: Wind,
    imageSrc: "https://placehold.co/600x400.png",
    dataAiHint: "calm meditation"
  },
  {
    title: "Guided Meditations",
    description: "Explore a library of meditations tailored to your needs and emotional state.",
    href: "/wellness/meditations",
    icon: Brain,
    imageSrc: "https://placehold.co/600x400.png",
    dataAiHint: "serene nature"
  },
];

export default function WellnessPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Wellness Toolkit"
        description="Discover tools and exercises designed to support your emotional wellbeing."
        icon={HeartPulse}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wellnessSections.map((section) => (
          <Card key={section.title} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <section.icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </div>
               <Image src={section.imageSrc} alt={section.title} width={600} height={400} className="rounded-md aspect-video object-cover" data-ai-hint={section.dataAiHint} />
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{section.description}</CardDescription>
            </CardContent>
            <CardContent>
              <Button asChild variant="default" className="w-full">
                <Link href={section.href}>
                  Explore {section.title.split(' ')[0]} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Daily Challenge Cards</CardTitle>
          <CardDescription>Engage with CBT prompts and reflection tasks to build resilience.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image src="https://placehold.co/400x250.png" alt="Challenge Card" width={400} height={250} className="rounded-lg mx-auto mb-4" data-ai-hint="challenge task" />
          <p className="text-lg font-medium mb-2">Today's Challenge: Active Listening</p>
          <p className="text-sm text-muted-foreground mb-4">
            Practice fully listening to someone without interrupting. Try to understand their perspective before responding.
          </p>
          <Button variant="outline">Mark as Complete (Coming Soon)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
