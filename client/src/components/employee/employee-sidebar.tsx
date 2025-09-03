import { Button } from "@/components/ui/button";
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

interface EmployeeSidebarProps {
  employee: Employee;
}

export default function EmployeeSidebar({ employee }: EmployeeSidebarProps) {
  const directReports = [
    "Maja Andev",
    "Eric Asture", 
    "Cheryl Barnet",
    "Jake Bryan",
    "Jennifer Caldwell"
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Navigation Icons */}
      <div className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start" data-testid="nav-home">
          <Home className="h-5 w-5 mr-3" />
          Home
        </Button>
        <Button variant="default" className="w-full justify-start bg-primary" data-testid="nav-employees">
          <Users className="h-5 w-5 mr-3" />
          Employees
        </Button>
        <Button variant="ghost" className="w-full justify-start" data-testid="nav-calendar">
          <Calendar className="h-5 w-5 mr-3" />
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start" data-testid="nav-files">
          <FileText className="h-5 w-5 mr-3" />
          Files
        </Button>
        <Button variant="ghost" className="w-full justify-start" data-testid="nav-time-tracking">
          <Clock className="h-5 w-5 mr-3" />
          Time Tracking
        </Button>
        <Button variant="ghost" className="w-full justify-start" data-testid="nav-reports">
          <BarChart className="h-5 w-5 mr-3" />
          Reports
        </Button>
      </div>

      <div className="border-t border-gray-200 mt-4"></div>

      {/* Employee Vitals */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Vitals</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-2" data-testid="vital-phone">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-mobile">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{employee.profileData?.contact?.mobilePhone || employee.phone}</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-email">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-time">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>8:18 AM local time</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-location">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{employee.location}</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-position">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span>{employee.jobTitle}</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-work-type">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>Full-Time</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-department">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span>{employee.department}</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-region">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>North America</span>
          </div>
          <div className="flex items-center space-x-2" data-testid="vital-employee-id">
            <span className="text-gray-400">#</span>
            <span>5</span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Hire Date</h4>
          <div className="flex items-center space-x-2 text-sm" data-testid="hire-date">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>{employee.hireDate}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1" data-testid="tenure">
            2y • 10m • 22d
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Direct Reports</h4>
          <div className="space-y-2 text-sm">
            {directReports.map((name, index) => (
              <div key={index} className="flex items-center space-x-2" data-testid={`direct-report-${index}`}>
                <User className="h-4 w-4 text-gray-400" />
                <span>{name}</span>
              </div>
            ))}
            <Button variant="link" className="text-primary hover:underline text-sm p-0 h-auto" data-testid="show-more-reports">
              5 More...
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
