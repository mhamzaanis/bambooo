import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, HelpCircle, Settings, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmployeeHeader from "@/components/employee/employee-header";
import EmployeeSidebar from "@/components/employee/employee-sidebar";
import PersonalTab from "@/components/employee/tabs/personal-tab";
import JobTab from "@/components/employee/tabs/job-tab";
import TimeOffTab from "@/components/employee/tabs/timeoff-tab";
import DocumentsTab from "@/components/employee/tabs/documents-tab";
import BenefitsTab from "@/components/employee/tabs/benefits-tab";
import TrainingTab from "@/components/employee/tabs/training-tab";
import AssetsTab from "@/components/employee/tabs/assets-tab";
import MoreTab from "@/components/employee/tabs/more-tab";
import NotesTab from "@/components/employee/tabs/notes-tab";
import EmergencyContactsTab from "@/components/employee/tabs/emergency-contacts-tab";
import OnboardingTab from "@/components/employee/tabs/onboarding-tab";
import OffboardingTab from "@/components/employee/tabs/offboarding-tab";
import TabCustomizationModal from "@/components/employee/modals/tab-customization-modal";
import type { Employee } from "@shared/schema";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_EMPLOYEE_ID = "emp-1";

const allTabs = [
  { id: "personal", label: "Personal", component: PersonalTab },
  { id: "job", label: "Job", component: JobTab },
  { id: "timeoff", label: "Time Off", component: TimeOffTab },
  { id: "documents", label: "Documents", component: DocumentsTab },
  { id: "benefits", label: "Benefits", component: BenefitsTab },
  { id: "training", label: "Training", component: TrainingTab },
  { id: "assets", label: "Assets", component: AssetsTab },
  { id: "notes", label: "Notes", component: NotesTab },
  { id: "emergency", label: "Emergency Contacts", component: EmergencyContactsTab },
  { id: "onboarding", label: "Onboarding", component: OnboardingTab },
  { id: "offboarding", label: "Offboarding", component: OffboardingTab },
];

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("personal");
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [enabledTabs, setEnabledTabs] = useState([
    "personal",
    "job",
    "timeoff",
    "documents",
    "benefits",
    "training",
    "assets",
  ]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("sidebar-collapsed");
      return stored ? stored === "true" : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", String(isSidebarCollapsed));
    } catch {}
  }, [isSidebarCollapsed]);

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", DEFAULT_EMPLOYEE_ID],
  });

  const ActiveTabComponent = allTabs.find((tab) => tab.id === activeTab)?.component;
  
  const visibleTabs = allTabs.filter((tab) => enabledTabs.includes(tab.id));
  const availableTabsInMore = allTabs.filter((tab) => !enabledTabs.includes(tab.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h1>
          <p className="text-gray-600">The requested employee could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/90 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle sidebar"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className="mr-1"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="text-foreground/80 font-semibold text-lg">COMPANY LOGO HERE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 w-64"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <ThemeToggle />
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                data-testid="notifications-button"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>
            <Button variant="ghost" size="icon" data-testid="help-button">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="settings-button">
              <Settings className="h-5 w-5" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90" data-testid="ask-button">
              Ask
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-theme(spacing.16))]">
        {/* Sidebar */}
        <EmployeeSidebar employee={employee} collapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Employee Header with Tabs */}
          <EmployeeHeader
            employee={employee}
            activeTab={activeTab}
            tabs={visibleTabs}
            availableTabsInMore={availableTabsInMore}
            onTabChange={setActiveTab}
            onCustomizeClick={() => setCustomizationModalOpen(true)}
          />

          {/* Tab Content */}
          <div className="p-6">
            <Card className="shadow-sm transition-shadow">
              <CardContent className="p-6 fade-in">
                {ActiveTabComponent && (
                  <ActiveTabComponent
                    employeeId={employee.id}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tab Customization Modal */}
      <TabCustomizationModal
        open={customizationModalOpen}
        onOpenChange={setCustomizationModalOpen}
        allTabs={allTabs}
        enabledTabs={enabledTabs}
        onTabsChange={setEnabledTabs}
      />
    </div>
  );
}