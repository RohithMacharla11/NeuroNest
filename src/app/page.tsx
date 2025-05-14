import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, BookText, Smile, HeartPulse, BarChart3, MessageSquareHeart, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const quickAccessItems = [
  { title: "New Journal Entry", href: "/journal", icon: BookText, description: "Capture your thoughts and feelings.", dataAiHint: "journal notebook" },
  { title: "Track Your Mood", href: "/mood-tracker", icon: Smile, description: "Log how you're feeling right now.", dataAiHint: "emoji face" },
  { title: "Wellness Toolkit", href: "/wellness", icon: HeartPulse, description: "Access affirmations and exercises.", dataAiHint: "meditation wellness" },
  { title: "View Insights", href: "/insights", icon: BarChart3, description: "Discover patterns in your wellbeing.", dataAiHint: "charts graphs" },
  { title: "Chat with AI", href: "/chat", icon: MessageSquareHeart, description: "Talk to your AI companion.", dataAiHint: "chat bubble" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to NeuroNest"
        description="Your personal space for mental clarity and emotional growth. What would you like to do today?"
        icon={LayoutDashboard}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Jump right into your favorite NeuroNest features.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccessItems.map((item) => (
            <Link href={item.href} key={item.href} passHref>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                  <item.icon className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
                <div className="p-4 pt-0">
                   <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
                    Go to {item.label || item.title.split(' ')[0]} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
            <CardDescription>A gentle reminder for your wellbeing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Image src="https://placehold.co/300x200.png" alt="Calm Scenery" width={300} height={200} className="rounded-lg mb-4" data-ai-hint="calm nature" />
            <p className="text-lg font-medium mb-2">"The best way to predict the future is to create it."</p>
            <p className="text-sm text-muted-foreground mb-4">Take a moment for yourself today. A deep breath, a short walk, or a kind thought can make a big difference.</p>
            <Button asChild>
              <Link href="/wellness/affirmations">Get an Affirmation</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Stay motivated with your streaks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <h4 className="font-medium">Journaling Streak</h4>
                <p className="text-sm text-muted-foreground">Keep it up!</p>
              </div>
              <span className="text-2xl font-bold text-primary">5 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <h4 className="font-medium">Meditation Minutes</h4>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
              <span className="text-2xl font-bold text-primary">45 Mins</span>
            </div>
             <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <h4 className="font-medium">Mood Average</h4>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <Smile className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
