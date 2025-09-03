import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, HelpCircle, Settings } from "lucide-react";
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
import TabCustomizationModal from "@/components/employee/modals/tab-customization-modal";
import type { Employee } from "@shared/schema";

const DEFAULT_EMPLOYEE_ID = "emp-1";

const tabs = [
  { id: "personal", label: "Personal", component: PersonalTab },
  { id: "job", label: "Job", component: JobTab },
  { id: "timeoff", label: "Time Off", component: TimeOffTab },
  { id: "documents", label: "Documents", component: DocumentsTab },
  { id: "benefits", label: "Benefits", component: BenefitsTab },
  { id: "training", label: "Training", component: TrainingTab },
  { id: "assets", label: "Assets", component: AssetsTab },
  { id: "more", label: "More", component: MoreTab },
];

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("personal");
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [enabledTabs, setEnabledTabs] = useState(tabs.map(tab => tab.id));

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", DEFAULT_EMPLOYEE_ID],
  });

  const activeTabComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const visibleTabs = tabs.filter(tab => enabledTabs.includes(tab.id));

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-primary font-semibold text-lg">COMPANY LOGO HERE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 w-64"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <Button variant="ghost" size="sm" data-testid="notifications-button">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center relative">
                  <span className="text-white text-xs">2</span>
                </div>
              </Button>
            </div>
            <Button variant="ghost" size="sm" data-testid="help-button">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="settings-button">
              <Settings className="h-5 w-5" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90" data-testid="ask-button">
              Ask
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <EmployeeSidebar employee={employee} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Employee Header with Tabs */}
          <EmployeeHeader
            employee={employee}
            activeTab={activeTab}
            tabs={visibleTabs}
            onTabChange={setActiveTab}
            onCustomizeClick={() => setCustomizationModalOpen(true)}
          />

          {/* Tab Content */}
          <div className="p-6">
            {activeTabComponent && (
              <activeTabComponent employeeId={employee.id} />
            )}
          </div>
        </div>
      </div>

      {/* Tab Customization Modal */}
      <TabCustomizationModal
        open={customizationModalOpen}
        onOpenChange={setCustomizationModalOpen}
        allTabs={tabs}
        enabledTabs={enabledTabs}
        onTabsChange={setEnabledTabs}
      />
    </div>
  );
}
