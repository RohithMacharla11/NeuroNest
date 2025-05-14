
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookText,
  Smile,
  Sparkles,
  MessageSquareHeart,
  Settings,
  HeartPulse,
  BarChart3,
  Brain,
  Wind,
  CircleHelp,
  ShieldAlert
} from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookText },
  { href: '/mood-tracker', label: 'Mood Tracker', icon: Smile },
  { href: '/wellness', label: 'Wellness Toolkit', icon: HeartPulse, 
    subItems: [
      { href: '/wellness/affirmations', label: 'Affirmations', icon: Sparkles },
      { href: '/wellness/mindfulness', label: 'Mindfulness', icon: Wind },
      { href: '/wellness/meditations', label: 'Meditations', icon: Brain },
    ]
  },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/chat', label: 'AI Companion', icon: MessageSquareHeart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Image src="https://placehold.co/40x40.png?bg=008080&fc=FFFFFF" alt="NeuroNest Logo" width={40} height={40} className="rounded-md" data-ai-hint="brain logo"/>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-semibold text-primary">NeuroNest</span>
            <span className="text-xs text-muted-foreground">Your Mind's Sanctuary</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) =>
            item.subItems ? (
              <SidebarGroup key={item.href}>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href) && item.href !== '/'}
                    tooltip={{children: item.label, side: "right", align: "center"}}
                  >
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {item.subItems.map(subItem => (
                   <SidebarMenuItem key={subItem.href} className="pl-6">
                     <SidebarMenuButton
                       asChild
                       isActive={pathname === subItem.href}
                       tooltip={{children: subItem.label, side: "right", align: "center"}}
                     >
                       <Link href={subItem.href} className="flex items-center w-full">
                         <subItem.icon className="mr-2 h-4 w-4" />
                         <span>{subItem.label}</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                ))}
              </SidebarGroup>
            ) : (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{children: item.label, side: "right", align: "center"}}
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:items-center">
            <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto">
                <CircleHelp className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">Help & Support</span>
            </Button>
            <Button variant="destructive" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto">
                <ShieldAlert className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">Emergency Mode</span>
            </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
