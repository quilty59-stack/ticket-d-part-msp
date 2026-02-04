import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Home,
  Plus,
  Users,
  Settings,
  Truck,
  UserCog,
  MapPin,
  FileText,
  LogOut,
  History,
  Building2,
  MapPinned,
  BarChart3,
} from 'lucide-react';
import logoCfd71 from '@/assets/logo-cfd71.png';

const mainNavItems = [
  { title: 'Accueil', url: '/', icon: Home },
  { title: 'Nouveau ticket', url: '/ticket/nouveau', icon: Plus },
  { title: 'Historique', url: '/historique', icon: History },
  { title: 'Statistiques', url: '/statistiques', icon: BarChart3 },
  { title: 'Sites conventionnés', url: '/sites', icon: Building2 },
  { title: 'Sites temporaires', url: '/sites-temporaires', icon: MapPinned },
  { title: 'Sessions de formation', url: '/formations', icon: Users },
];

const adminNavItems = [
  { title: 'Véhicules', url: '/admin/vehicules', icon: Truck },
  { title: 'Personnel', url: '/admin/personnel', icon: UserCog },
  { title: 'Référentiels', url: '/admin/referentiels', icon: MapPin },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoCfd71} 
            alt="CFD71" 
            className={collapsed ? "w-10 h-10 object-contain flex-shrink-0" : "w-20 h-20 object-contain flex-shrink-0"}
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-sidebar-foreground">CFD71</span>
              <span className="text-xs text-sidebar-foreground/70">Tickets de départ</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              {!collapsed && 'Administration'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <div className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {!collapsed && 'Déconnexion'}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
