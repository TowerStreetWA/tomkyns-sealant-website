import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { 
  LayoutDashboard, 
  Inbox, 
  Briefcase, 
  LogOut, 
  Menu,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Enquiries", href: "/portal/enquiries", icon: Inbox },
  { label: "Jobs", href: "/portal/jobs", icon: Briefcase },
];

export default function PortalLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <div className="flex flex-col gap-2 p-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
            >
              <Icon size={18} />
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex w-full font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <ShieldCheck className="text-primary h-6 w-6" />
          <span className="font-display font-bold text-foreground truncate">Owner Portal</span>
        </div>
        <div className="flex-1 overflow-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground" 
            onClick={() => signOut({ redirectUrl: "/" })}
            data-testid="button-logout"
          >
            <LogOut size={18} className="mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-8 shrink-0 sticky top-0 z-10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <ShieldCheck className="text-primary h-6 w-6" />
                <span className="font-display font-bold text-foreground">Portal</span>
              </div>
              <NavLinks />
              <div className="p-4 absolute bottom-0 left-0 right-0 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground" 
                  onClick={() => signOut({ redirectUrl: "/" })}
                >
                  <LogOut size={18} className="mr-2" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-xl font-display font-semibold text-foreground">{title}</h1>
        </header>
        
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
