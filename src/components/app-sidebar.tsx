import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  MessageSquare,
  Wrench,
  NotebookPen,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Utilities", url: "/utilities", icon: Wrench },
  { title: "Notes", url: "/notes", icon: NotebookPen },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            H
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-[0.2em] text-foreground">
                HINA OS
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                AI Assistant
              </p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.24em]">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="size-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
