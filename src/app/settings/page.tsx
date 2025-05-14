"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Palette, Bell, ShieldCheck, CloudUpload, LogOut, UserCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface NeuroNestSettings {
  aiTone: 'calm' | 'motivational' | 'friendly' | 'professional';
  enableNotifications: boolean;
  enableCloudBackup: boolean;
  theme: 'light' | 'dark' | 'system'; // For emotion-adaptive UI or general theme
}

const defaultSettings: NeuroNestSettings = {
  aiTone: 'friendly',
  enableNotifications: true,
  enableCloudBackup: false,
  theme: 'system',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<NeuroNestSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('neuroNestSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof NeuroNestSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('neuroNestSettings', JSON.stringify(settings));
    setTimeout(() => { // Simulate API call
        setIsSaving(false);
        toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    }, 500);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Customize your NeuroNest experience to best suit your needs."
        icon={SettingsIcon}
        actions={
            <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <Save className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: AI & Notifications */}
        <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-primary" />
                        <CardTitle>Personalization</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="aiTone" className="text-base font-medium">AI Companion Tone</Label>
                        <p className="text-sm text-muted-foreground mb-2">Choose how you'd like your AI companion to interact with you.</p>
                        <Select
                        value={settings.aiTone}
                        onValueChange={(value: NeuroNestSettings['aiTone']) => handleSettingChange('aiTone', value)}
                        >
                        <SelectTrigger id="aiTone" className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select AI tone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="calm">Calm & Gentle</SelectItem>
                            <SelectItem value="motivational">Motivational & Encouraging</SelectItem>
                            <SelectItem value="friendly">Friendly & Casual</SelectItem>
                            <SelectItem value="professional">Professional & Direct</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="theme" className="text-base font-medium">App Theme</Label>
                         <p className="text-sm text-muted-foreground mb-2">Select your preferred app appearance. (Emotion-adaptive theme coming soon!)</p>
                        <Select
                        value={settings.theme}
                        onValueChange={(value: NeuroNestSettings['theme']) => handleSettingChange('theme', value)}
                        >
                        <SelectTrigger id="theme" className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="enableNotifications" className="text-base font-medium">Enable Mental Check-in Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive subtle nudges for realtime mental check-ins.</p>
                        </div>
                        <Switch
                        id="enableNotifications"
                        checked={settings.enableNotifications}
                        onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                        aria-label="Enable mental check-in notifications"
                        />
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <CardTitle>Data & Privacy</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="enableCloudBackup" className="text-base font-medium">Enable Encrypted Cloud Backup</Label>
                            <p className="text-sm text-muted-foreground">Opt-in to securely back up your journal and mood data to the cloud.</p>
                        </div>
                        <Switch
                        id="enableCloudBackup"
                        checked={settings.enableCloudBackup}
                        onCheckedChange={(checked) => handleSettingChange('enableCloudBackup', checked)}
                        aria-label="Enable encrypted cloud backup"
                        />
                    </div>
                    <Button variant="outline">Manage Data (Coming Soon)</Button>
                     <p className="text-xs text-muted-foreground">NeuroNest prioritizes your privacy. Journal entries are stored locally by default. Cloud backup is end-to-end encrypted.</p>
                </CardContent>
            </Card>
        </div>

        {/* Column 2: Account & App Info */}
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                     <div className="flex items-center gap-2">
                        <Palette className="h-6 w-6 text-primary" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="text-center">
                    <Image src="https://placehold.co/200x150.png" alt="Current Mood Avatar" width={200} height={150} className="rounded-lg mx-auto mb-4" data-ai-hint="avatar character" />
                    <p className="text-sm text-muted-foreground mb-2">Your Mood Avatar (Evolves with your mood - Coming Soon!)</p>
                    <Button variant="outline" disabled>Customize Avatar</Button>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" disabled>Manage Subscription</Button>
                    <Button variant="destructive" className="w-full" disabled>
                        <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>App Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>Version: 1.0.0 (Alpha)</p>
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                    <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
                    <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
