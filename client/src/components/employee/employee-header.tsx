import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Employee } from "@shared/schema";
import { useState, useEffect } from "react";

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
  const [isScrolled, setIsScrolled] = useState(false);

  // Define the dropdown tabs that were previously in the "More" tab
  const moreDropdownTabs = [
    { id: "notes", label: "Notes" },
    { id: "emergency", label: "Emergency Contacts" },
    { id: "onboarding", label: "Onboarding" },
    { id: "offboarding", label: "Offboarding" },
  ];

  const isMoreTabActive = moreDropdownTabs.some(tab => tab.id === activeTab);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100); // Hide header after 100px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Header - Hidden when scrolled */}
      <div className={`bg-primary text-white transition-all duration-300 ${
        isScrolled ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
      }`}>
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
              
              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`px-4 py-3 text-sm font-medium rounded-none border-b-2 transition-colors flex items-center ${
                      isMoreTabActive
                        ? "bg-white text-primary border-white"
                        : "text-white hover:bg-white/10 border-transparent"
                    }`}
                    data-testid="more-dropdown-trigger"
                  >
                    More
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {moreDropdownTabs.map((tab) => (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={activeTab === tab.id ? "bg-accent" : ""}
                      data-testid={`dropdown-tab-${tab.id}`}
                    >
                      {tab.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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

      {/* Floating Navigation Bar - Shown when scrolled */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5"
                }`}
                onClick={() => onTabChange(tab.id)}
                data-testid={`floating-tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
            
            {/* Floating More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 flex items-center ${
                    isMoreTabActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5"
                  }`}
                  data-testid="floating-more-dropdown-trigger"
                >
                  More
                  <ChevronDown className="ml-1 h-2 w-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {moreDropdownTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={activeTab === tab.id ? "bg-accent" : ""}
                    data-testid={`floating-dropdown-tab-${tab.id}`}
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="w-px h-6 bg-white/20 dark:bg-white/10 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-full px-3 py-2"
              onClick={onCustomizeClick}
              data-testid="floating-customize-button"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
