import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  BarChart,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  User,
  CalendarDays
} from "lucide-react";
import type { Employee } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EmployeeSidebarProps {
  employee: Employee;
  collapsed?: boolean;
}

export default function EmployeeSidebar({ employee, collapsed = false }: EmployeeSidebarProps) {
  const directReports = [
    "Maja Andev",
    "Eric Asture", 
    "Cheryl Barnet",
    "Jake Bryan",
    "Jennifer Caldwell"
  ];

  const navItems = [
    { icon: Home, label: "Home", testId: "nav-home", variant: "ghost" as const },
    { icon: Users, label: "Employees", testId: "nav-employees", variant: "default" as const },
    { icon: Calendar, label: "Calendar", testId: "nav-calendar", variant: "ghost" as const },
    { icon: FileText, label: "Files", testId: "nav-files", variant: "ghost" as const },
    { icon: Clock, label: "Time Tracking", testId: "nav-time-tracking", variant: "ghost" as const },
    { icon: BarChart, label: "Reports", testId: "nav-reports", variant: "ghost" as const },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const button = (
      <Button 
        variant={item.variant}
        className={cn(
          "w-full",
          item.variant === "default" 
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
          collapsed ? "justify-center px-2" : "justify-start"
        )} 
        data-testid={item.testId}
      >
        <item.icon className="h-5 w-5" />
        {!collapsed && <span className="ml-3">{item.label}</span>}
      </Button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-background border-r border-border min-h-[calc(100vh-theme(spacing.16))] overflow-y-auto transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-80"
      )}>
        {/* Navigation Icons */}
        <div className={cn(
          "p-4 space-y-2 flex-shrink-0",
          collapsed ? "px-2" : "px-4"
        )}>
          {navItems.map((item) => (
            <NavButton key={item.testId} item={item} />
          ))}
        </div>

        {!collapsed && (
          <>
            <div className="border-t border-border flex-shrink-0"></div>

            {/* Employee Vitals */}
            <div className="p-4 flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-3">Vitals</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2" data-testid="vital-phone">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-mobile">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.profileData?.contact?.mobilePhone || employee.phone}</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-email">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-time">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">8:18 AM local time</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-location">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.location}</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-position">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.jobTitle}</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-work-type">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Full-Time</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-department">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.department}</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-region">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">North America</span>
                </div>
                <div className="flex items-center space-x-2" data-testid="vital-employee-id">
                  <span className="text-muted-foreground">#</span>
                  <span className="text-foreground">5</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-2">Hire Date</h4>
                <div className="flex items-center space-x-2 text-sm" data-testid="hire-date">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{employee.hireDate}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1" data-testid="tenure">
                  2y • 10m • 22d
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-2">Direct Reports</h4>
                <div className="space-y-2 text-sm">
                  {directReports.map((name, index) => (
                    <div key={index} className="flex items-center space-x-2" data-testid={`direct-report-${index}`}>
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{name}</span>
                    </div>
                  ))}
                  <Button variant="link" className="text-primary hover:underline text-sm p-0 h-auto" data-testid="show-more-reports">
                    5 More...
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Spacer to ensure border extends full height when collapsed */}
        {collapsed && <div className="flex-1 min-h-0"></div>}
      </div>
    </TooltipProvider>
  );
}
