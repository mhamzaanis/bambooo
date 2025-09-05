import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Plus, Save, X, Edit, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import type { TimeOff, InsertTimeOff } from "@shared/schema";

interface TimeOffTabProps {
  employeeId: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface TimeOffBalance {
  vacation: number;
  sick: number;
  personal: number;
}

// Validation functions
const validateDate = (date: string): boolean => {
  if (!date) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
  return !isNaN(parsedDate.getTime()) && parsedDate >= today;
};

const validateDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

const calculateDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
};

const validateDays = (days: string): boolean => {
  if (!days) return false;
  const num = parseFloat(days);
  return !isNaN(num) && num > 0 && num <= 365;
};

// Consistent date formatting function
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function TimeOffTab({ employeeId }: TimeOffTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOff | null>(null);
  const [formData, setFormData] = useState<Partial<InsertTimeOff>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Time off balance state (this would normally come from an API)
  const [timeOffBalance] = useState<TimeOffBalance>({
    vacation: 15.5,
    sick: 8.0,
    personal: 3.0
  });

  const { data: timeOff = [], isLoading } = useQuery<TimeOff[]>({
    queryKey: ["/api/employees", employeeId, "time-off"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const createTimeOffMutation = useMutation({
    mutationFn: async (data: InsertTimeOff) => {
      console.log("Creating time off request:", data);
      const response = await fetch(`/api/employees/${employeeId}/time-off`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Time off created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ title: "Success", description: "Time off request created successfully" });
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create time off:", error);
      // Always refetch to see if it was actually saved
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ 
        title: "Request Status", 
        description: "Please check the table below to confirm if your request was saved.", 
        variant: "destructive" 
      });
    },
  });

  const updateTimeOffMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<InsertTimeOff> }) => {
      console.log("Updating time off request:", data);
      const response = await fetch(`/api/time-off/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.updates),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Time off updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ title: "Success", description: "Time off request updated successfully" });
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to update time off:", error);
      // Always refetch to see if it was actually saved
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ 
        title: "Request Status", 
        description: "Please check the table below to confirm if your changes were saved.", 
        variant: "destructive" 
      });
    },
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/time-off/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ title: "Success", description: "Time off request deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete time off request", variant: "destructive" });
    },
  });

  // Auto-calculate days when start/end dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateDays(formData.startDate, formData.endDate);
      setFormData(prev => ({ ...prev, days: days.toString() }));
      
      // Clear days validation error when auto-calculating
      if (validationErrors.days) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.days;
          return newErrors;
        });
      }
    } else {
      // Clear days when dates are not complete
      setFormData(prev => ({ ...prev, days: "" }));
    }
  }, [formData.startDate, formData.endDate, validationErrors.days]);

  const resetForm = () => {
    setFormData({});
    setEditingTimeOff(null);
    setShowTimeOffForm(false);
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.type) {
      errors.type = "Time off type is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else if (!validateDate(formData.startDate)) {
      errors.startDate = "Please select today or a future date";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (!validateDate(formData.endDate)) {
      errors.endDate = "Please select today or a future date";
    }

    if (formData.startDate && formData.endDate && !validateDateRange(formData.startDate, formData.endDate)) {
      errors.endDate = "End date must be on or after the start date";
    }

    // Days validation is not needed since it's auto-calculated
    if (!formData.days || parseFloat(formData.days) <= 0) {
      errors.general = "Please select valid start and end dates";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const timeOffData: InsertTimeOff = {
      employeeId,
      type: formData.type!,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      days: formData.days!,
      status: formData.status!,
      comment: formData.comment || "",
    };

    if (editingTimeOff) {
      updateTimeOffMutation.mutate({ id: editingTimeOff.id, updates: timeOffData });
    } else {
      createTimeOffMutation.mutate(timeOffData);
    }
  };

  const handleEdit = (item: TimeOff) => {
    setEditingTimeOff(item);
    setFormData({
      type: item.type || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      days: item.days || "",
      status: item.status || "",
      comment: item.comment || "",
    });
    setShowTimeOffForm(true);
    setValidationErrors({});
    
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
  };

  const handleNewRequest = () => {
    resetForm();
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    setFormData({ 
      status: "Pending",
      startDate: today,
      endDate: today
    }); // Default status and current date
    setShowTimeOffForm(true);
    
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
  };

  // Enhanced time off columns with actions
  const timeOffColumns = [
    {
      key: "startDate" as keyof TimeOff,
      header: "Date Range",
      render: (value: string, item: TimeOff) => {
        if (item.startDate === item.endDate) {
          return formatDateForDisplay(item.startDate || "");
        }
        return `${formatDateForDisplay(item.startDate || "")} - ${formatDateForDisplay(item.endDate || "")}`;
      },
    },
    { 
      key: "type" as keyof TimeOff, 
      header: "Type",
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    { 
      key: "days" as keyof TimeOff, 
      header: "Days",
      render: (value: string) => (
        <span className="font-mono">{parseFloat(value || "0").toFixed(1)}</span>
      ),
    },
    {
      key: "status" as keyof TimeOff,
      header: "Status",
      render: (value: string) => {
        const getStatusConfig = (status: string) => {
          switch (status) {
            case "Approved":
              return { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle };
            case "Pending":
              return { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock };
            case "Denied":
              return { bg: "bg-red-100", text: "text-red-800", icon: XCircle };
            default:
              return { bg: "bg-gray-100", text: "text-gray-800", icon: Clock };
          }
        };
        
        const config = getStatusConfig(value);
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <Icon className="h-3 w-3 mr-1" />
            {value}
          </span>
        );
      },
    },
    { 
      key: "comment" as keyof TimeOff, 
      header: "Comment",
      render: (value: string) => (
        <span className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value || "—"}
        </span>
      ),
    },
    {
      key: "actions" as keyof TimeOff,
      header: "Actions",
      render: (value: any, item: TimeOff) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(item)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Time Off Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Time Off Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Vacation</h3>
              <div className="text-3xl font-bold text-blue-900">{timeOffBalance.vacation}</div>
              <div className="text-sm text-blue-600">days available</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-2">Sick Leave</h3>
              <div className="text-3xl font-bold text-green-900">{timeOffBalance.sick}</div>
              <div className="text-sm text-green-600">days available</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-700 mb-2">Personal</h3>
              <div className="text-3xl font-bold text-purple-900">{timeOffBalance.personal}</div>
              <div className="text-sm text-purple-600">days available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Off Request Form */}
      {showTimeOffForm && (
        <Card ref={formRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                {editingTimeOff ? "Edit Time Off Request" : "New Time Off Request"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={validationErrors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select time off type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Bereavement">Bereavement</SelectItem>
                    <SelectItem value="Jury Duty">Jury Duty</SelectItem>
                    <SelectItem value="Military Leave">Military Leave</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.type && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.type}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.status && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.status}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Start Date *
                </Label>
                <div className="relative">
                  <Input
                    ref={(el) => { if (el) (el as any).startDateRef = el; }}
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`${validationErrors.startDate ? "border-red-500" : ""} pl-10 cursor-pointer`}
                    min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                  />
                  <Calendar 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" 
                    onClick={() => {
                      const input = document.getElementById('startDate') as HTMLInputElement;
                      if (input) {
                        input.focus();
                        input.showPicker?.();
                      }
                    }}
                    title="Click to open calendar"
                  />
                </div>
                {validationErrors.startDate && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.startDate}
                  </div>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  End Date *
                </Label>
                <div className="relative">
                  <Input
                    ref={(el) => { if (el) (el as any).endDateRef = el; }}
                    id="endDate"
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className={`${validationErrors.endDate ? "border-red-500" : ""} pl-10 cursor-pointer`}
                    min={formData.startDate || new Date().toISOString().split('T')[0]} // Prevent selecting dates before start date
                  />
                  <Calendar 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" 
                    onClick={() => {
                      const input = document.getElementById('endDate') as HTMLInputElement;
                      if (input) {
                        input.focus();
                        input.showPicker?.();
                      }
                    }}
                    title="Click to open calendar"
                  />
                </div>
                {validationErrors.endDate && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.endDate}
                  </div>
                )}
                {(formData.startDate && formData.endDate && validateDateRange(formData.startDate, formData.endDate)) && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date range: {formatDateForDisplay(formData.startDate)} - {formatDateForDisplay(formData.endDate)}
                  </div>
                )}
              </div>

              {/* Days */}
              <div className="space-y-2">
                <Label htmlFor="days">Number of Days (Auto-calculated)</Label>
                <div className="relative">
                  <Input
                    id="days"
                    type="text"
                    value={formData.days ? `${parseFloat(formData.days).toFixed(1)} day${parseFloat(formData.days) === 1 ? '' : 's'}` : "Select dates to calculate"}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed font-mono"
                    placeholder="Select start and end dates"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-gray-500">Auto</span>
                  </div>
                </div>
                {(formData.startDate && formData.endDate && formData.days) && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Calculated from {formatDateForDisplay(formData.startDate)} to {formatDateForDisplay(formData.endDate)}
                  </div>
                )}
                {validationErrors.general && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.general}
                  </div>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={formData.comment || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Additional comments or reason for time off..."
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t">
              <Button 
                onClick={handleSubmit}
                disabled={createTimeOffMutation.isPending || updateTimeOffMutation.isPending}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingTimeOff ? "Update Request" : "Submit Request"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Time Off Button (when form is hidden) */}
      {!showTimeOffForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Request Time Off</CardTitle>
              <Button onClick={handleNewRequest} data-testid="button-new-request">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Click "New Request" to submit a time off request with all required details.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Off History */}
      <Card>
        <CardHeader>
          <CardTitle>Time Off History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading time off requests...</div>
            </div>
          ) : (
            <DataTable
              columns={timeOffColumns}
              data={timeOff}
              onDelete={(item) => deleteTimeOffMutation.mutate(item.id)}
              emptyMessage="No time off requests found. Click 'New Request' to submit your first request."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}