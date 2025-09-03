import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, User } from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeeHeaderProps {
  employee: Employee;
  activeTab: string;
  tabs: Array<{ id: string; label: string }>;
  onTabChange: (tabId: string) => void;
  onCustomizeClick: () => void;
}

export default function EmployeeHeader({
  employee,
  activeTab,
  tabs,
  onTabChange,
  onCustomizeClick,
}: EmployeeHeaderProps) {
  return (
    <div className="bg-primary text-white">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="employee-name">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-primary-foreground/80" data-testid="employee-title">
                {employee.jobTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              className="bg-white text-primary hover:bg-gray-100"
              data-testid="request-change-button"
            >
              Request a Change
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              data-testid="more-options-button"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-white/20">
        <div className="flex items-center justify-between px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`px-4 py-3 text-sm font-medium rounded-none border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-primary border-white"
                    : "text-white hover:bg-white/10 border-transparent"
                }`}
                onClick={() => onTabChange(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={onCustomizeClick}
            data-testid="customize-layout-button"
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize Layout
          </Button>
        </div>
      </div>
    </div>
  );
}
