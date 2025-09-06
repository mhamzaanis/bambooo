import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, UserCheck, DollarSign, Award, Plus, Save, X, Edit, AlertCircle, Calendar, Building, Users } from "lucide-react";
import type { EmploymentHistory, Compensation, Bonus, InsertEmploymentHistory, InsertCompensation, InsertBonus, Employee } from "@shared/schema";

interface JobTabProps {
  employeeId: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// Validation functions
const validateDate = (date: string): boolean => {
  if (!date) return true; // Empty date is valid
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

const validateSalary = (salary: string): boolean => {
  if (!salary) return true; // Empty salary is valid
  // Remove currency symbols and commas, then check if it's a valid number
  const cleanSalary = salary.replace(/[$,]/g, '');
  return !isNaN(parseFloat(cleanSalary)) && parseFloat(cleanSalary) >= 0;
};

const formatSalary = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '');
  if (!cleanValue) return '';
  
  const num = parseFloat(cleanValue);
  if (isNaN(num)) return '';
  
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function JobTab({ employeeId }: JobTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [showEmploymentDialog, setShowEmploymentDialog] = useState(false);
  const [showCompensationDialog, setShowCompensationDialog] = useState(false);
  const [showBonusDialog, setShowBonusDialog] = useState(false);
  const [showJobInfoDialog, setShowJobInfoDialog] = useState(false);
  
  // Edit states
  const [editingEmployment, setEditingEmployment] = useState<EmploymentHistory | null>(null);
  const [editingCompensation, setEditingCompensation] = useState<Compensation | null>(null);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  
  // Form data states
  const [employmentFormData, setEmploymentFormData] = useState<Partial<InsertEmploymentHistory>>({});
  const [compensationFormData, setCompensationFormData] = useState<Partial<InsertCompensation>>({});
  const [bonusFormData, setBonusFormData] = useState<Partial<InsertBonus>>({});
  const [jobInfoFormData, setJobInfoFormData] = useState<Partial<Employee>>({});
  
  // Validation states
  const [employmentErrors, setEmploymentErrors] = useState<ValidationErrors>({});
  const [compensationErrors, setCompensationErrors] = useState<ValidationErrors>({});
  const [bonusErrors, setBonusErrors] = useState<ValidationErrors>({});
  const [jobInfoErrors, setJobInfoErrors] = useState<ValidationErrors>({});

  const { data: employee, isLoading: employeeLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", employeeId],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: employmentHistory = [] } = useQuery<EmploymentHistory[]>({
    queryKey: ["/api/employees", employeeId, "employment-history"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: compensation = [] } = useQuery<Compensation[]>({
    queryKey: ["/api/employees", employeeId, "compensation"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: bonuses = [] } = useQuery<Bonus[]>({
    queryKey: ["/api/employees", employeeId, "bonuses"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Initialize job info form data when employee data loads
  useEffect(() => {
    if (employee) {
      setJobInfoFormData({
        jobTitle: employee.jobTitle || '',
        department: employee.department || '',
        location: employee.location || '',
        hireDate: employee.hireDate || '',
      });
    }
  }, [employee]);

  // Mutations for employment history
  const createEmploymentHistoryMutation = useMutation({
    mutationFn: async (data: InsertEmploymentHistory) => {
      console.log('Creating employment history:', data);
      return await apiRequest("POST", `/api/employees/${employeeId}/employment-history`, data);
    },
    onSuccess: async (data) => {
      console.log('Create successful, data:', data);
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      toast({ title: "Success", description: "Employment history added successfully" });
      setShowEmploymentDialog(false);
      setEmploymentFormData({});
      setEmploymentErrors({});
    },
    onError: (error) => {
      console.error("Error creating employment history:", error);
      toast({ title: "Error", description: "Failed to add employment history", variant: "destructive" });
    },
  });

  const updateEmploymentHistoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEmploymentHistory> }) => {
      console.log('Updating employment history:', id, data);
      return await apiRequest("PATCH", `/api/employment-history/${id}`, data);
    },
    onSuccess: async (data) => {
      console.log('Update successful, data:', data);
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      toast({ title: "Success", description: "Employment history updated successfully" });
      setEditingEmployment(null);
      setShowEmploymentDialog(false);
      setEmploymentFormData({});
      setEmploymentErrors({});
    },
    onError: (error) => {
      console.error("Error updating employment history:", error);
      toast({ title: "Error", description: "Failed to update employment history", variant: "destructive" });
    },
  });

  const deleteEmploymentHistoryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting employment history with ID:', id);
      return await apiRequest("DELETE", `/api/employment-history/${id}`);
    },
    onSuccess: async (data) => {
      console.log('Delete successful, data:', data);
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      toast({ title: "Success", description: "Employment history deleted successfully" });
    },
    onError: (error) => {
      console.error("Error deleting employment history:", error);
      toast({ title: "Error", description: "Failed to delete employment history", variant: "destructive" });
    },
  });

  // Mutations for compensation
  const createCompensationMutation = useMutation({
    mutationFn: async (data: InsertCompensation) => {
      return await apiRequest("POST", `/api/employees/${employeeId}/compensation`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      toast({ title: "Success", description: "Compensation added successfully" });
      setShowCompensationDialog(false);
      setCompensationFormData({});
      setCompensationErrors({});
    },
    onError: (error) => {
      console.error("Error creating compensation:", error);
      toast({ title: "Error", description: "Failed to add compensation", variant: "destructive" });
    },
  });

  const updateCompensationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCompensation> }) => {
      return await apiRequest("PATCH", `/api/compensation/${id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      toast({ title: "Success", description: "Compensation updated successfully" });
      setEditingCompensation(null);
      setShowCompensationDialog(false);
      setCompensationFormData({});
      setCompensationErrors({});
    },
    onError: (error) => {
      console.error("Error updating compensation:", error);
      toast({ title: "Error", description: "Failed to update compensation", variant: "destructive" });
    },
  });

  const deleteCompensationMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting compensation with ID:', id);
      return await apiRequest("DELETE", `/api/compensation/${id}`);
    },
    onSuccess: async (data) => {
      console.log('Compensation delete successful, data:', data);
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      toast({ title: "Success", description: "Compensation deleted successfully" });
    },
    onError: (error) => {
      console.error("Error deleting compensation:", error);
      toast({ title: "Error", description: "Failed to delete compensation", variant: "destructive" });
    },
  });

  // Mutations for bonuses
  const createBonusMutation = useMutation({
    mutationFn: async (data: InsertBonus) => {
      return await apiRequest("POST", `/api/employees/${employeeId}/bonuses`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "bonuses"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "bonuses"] });
      toast({ title: "Success", description: "Bonus added successfully" });
      setShowBonusDialog(false);
      setBonusFormData({});
      setBonusErrors({});
    },
    onError: (error) => {
      console.error("Error creating bonus:", error);
      toast({ title: "Error", description: "Failed to add bonus", variant: "destructive" });
    },
  });

  const updateBonusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBonus> }) => {
      return await apiRequest("PATCH", `/api/bonuses/${id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "bonuses"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "bonuses"] });
      toast({ title: "Success", description: "Bonus updated successfully" });
      setEditingBonus(null);
      setShowBonusDialog(false);
      setBonusFormData({});
      setBonusErrors({});
    },
    onError: (error) => {
      console.error("Error updating bonus:", error);
      toast({ title: "Error", description: "Failed to update bonus", variant: "destructive" });
    },
  });

  const deleteBonusMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting bonus with ID:', id);
      return await apiRequest("DELETE", `/api/bonuses/${id}`);
    },
    onSuccess: async (data) => {
      console.log('Bonus delete successful, data:', data);
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "bonuses"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "bonuses"] });
      toast({ title: "Success", description: "Bonus deleted successfully" });
    },
    onError: (error) => {
      console.error("Error deleting bonus:", error);
      toast({ title: "Error", description: "Failed to delete bonus", variant: "destructive" });
    },
  });

  // Mutation for updating job info
  const updateJobInfoMutation = useMutation({
    mutationFn: async (data: Partial<Employee>) => {
      return await apiRequest("PATCH", `/api/employees/${employeeId}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId] });
      toast({ title: "Success", description: "Job information updated successfully" });
      setShowJobInfoDialog(false);
      setJobInfoErrors({});
    },
    onError: (error) => {
      console.error("Error updating job info:", error);
      toast({ title: "Error", description: "Failed to update job information", variant: "destructive" });
    },
  });

  // Validation functions
  const validateEmploymentForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!employmentFormData.effectiveDate) {
      errors.effectiveDate = "Effective date is required";
    } else if (!validateDate(employmentFormData.effectiveDate)) {
      errors.effectiveDate = "Please enter a valid date (YYYY-MM-DD)";
    }

    if (!employmentFormData.status?.trim()) {
      errors.status = "Employment status is required";
    }

    if (!employmentFormData.department?.trim()) {
      errors.department = "Department is required";
    }

    if (!employmentFormData.jobTitle?.trim()) {
      errors.jobTitle = "Job title is required";
    }

    setEmploymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCompensationForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!compensationFormData.effectiveDate) {
      errors.effectiveDate = "Effective date is required";
    } else if (!validateDate(compensationFormData.effectiveDate)) {
      errors.effectiveDate = "Please enter a valid date (YYYY-MM-DD)";
    }

    if (!compensationFormData.payRate?.trim()) {
      errors.payRate = "Pay rate is required";
    } else if (!validateSalary(compensationFormData.payRate)) {
      errors.payRate = "Please enter a valid salary amount";
    }

    if (!compensationFormData.payType?.trim()) {
      errors.payType = "Pay type is required";
    }

    if (!compensationFormData.changeReason?.trim()) {
      errors.changeReason = "Change reason is required";
    }

    setCompensationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBonusForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!bonusFormData.type?.trim()) {
      errors.type = "Bonus type is required";
    }

    if (!bonusFormData.amount?.trim()) {
      errors.amount = "Bonus amount is required";
    } else if (!validateSalary(bonusFormData.amount)) {
      errors.amount = "Please enter a valid bonus amount";
    }

    if (!bonusFormData.frequency?.trim()) {
      errors.frequency = "Frequency is required";
    }

    if (bonusFormData.eligibilityDate && !validateDate(bonusFormData.eligibilityDate)) {
      errors.eligibilityDate = "Please enter a valid date (YYYY-MM-DD)";
    }

    setBonusErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateJobInfoForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!jobInfoFormData.jobTitle?.trim()) {
      errors.jobTitle = "Job title is required";
    }

    if (!jobInfoFormData.department?.trim()) {
      errors.department = "Department is required";
    }

    if (jobInfoFormData.hireDate && !validateDate(jobInfoFormData.hireDate)) {
      errors.hireDate = "Please enter a valid date (YYYY-MM-DD)";
    }

    setJobInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleEmploymentSubmit = async () => {
    if (!validateEmploymentForm()) return;

    const data = {
      ...employmentFormData,
      employeeId,
    } as InsertEmploymentHistory;

    if (editingEmployment) {
      updateEmploymentHistoryMutation.mutate({ id: editingEmployment.id!, data });
    } else {
      createEmploymentHistoryMutation.mutate(data);
    }
  };

  const handleCompensationSubmit = async () => {
    if (!validateCompensationForm()) return;

    const data = {
      ...compensationFormData,
      employeeId,
    } as InsertCompensation;

    if (editingCompensation) {
      updateCompensationMutation.mutate({ id: editingCompensation.id!, data });
    } else {
      createCompensationMutation.mutate(data);
    }
  };

  const handleBonusSubmit = async () => {
    if (!validateBonusForm()) return;

    const data = {
      ...bonusFormData,
      employeeId,
    } as InsertBonus;

    if (editingBonus) {
      updateBonusMutation.mutate({ id: editingBonus.id!, data });
    } else {
      createBonusMutation.mutate(data);
    }
  };

  const handleJobInfoSubmit = async () => {
    if (!validateJobInfoForm()) return;
    updateJobInfoMutation.mutate(jobInfoFormData);
  };

  // Edit handlers
  const handleEditEmployment = (employment: EmploymentHistory) => {
    setEditingEmployment(employment);
    setEmploymentFormData(employment);
    setShowEmploymentDialog(true);
  };

  const handleEditCompensation = (comp: Compensation) => {
    setEditingCompensation(comp);
    setCompensationFormData(comp);
    setShowCompensationDialog(true);
  };

  const handleEditBonus = (bonus: Bonus) => {
    setEditingBonus(bonus);
    setBonusFormData(bonus);
    setShowBonusDialog(true);
  };

  // Cancel handlers
  const handleCancelEmploymentForm = () => {
    setShowEmploymentDialog(false);
    setEditingEmployment(null);
    setEmploymentFormData({});
    setEmploymentErrors({});
  };

  const handleCancelCompensationForm = () => {
    setShowCompensationDialog(false);
    setEditingCompensation(null);
    setCompensationFormData({});
    setCompensationErrors({});
  };

  const handleCancelBonusForm = () => {
    setShowBonusDialog(false);
    setEditingBonus(null);
    setBonusFormData({});
    setBonusErrors({});
  };

  const handleCancelJobInfoForm = () => {
    setShowJobInfoDialog(false);
    setJobInfoErrors({});
    // Reset form data to original employee data
    if (employee) {
      setJobInfoFormData({
        jobTitle: employee.jobTitle || '',
        department: employee.department || '',
        location: employee.location || '',
        hireDate: employee.hireDate || '',
      });
    }
  };

  // Table columns
  const employmentHistoryColumns = [
    { key: "effectiveDate" as keyof EmploymentHistory, header: "Effective Date" },
    { key: "status" as keyof EmploymentHistory, header: "Employment Status" },
    { key: "location" as keyof EmploymentHistory, header: "Location" },
    { key: "division" as keyof EmploymentHistory, header: "Division" },
    { key: "department" as keyof EmploymentHistory, header: "Department" },
    { key: "jobTitle" as keyof EmploymentHistory, header: "Job Title" },
    { key: "reportsTo" as keyof EmploymentHistory, header: "Reports To" },
  ];

  const compensationColumns = [
    { key: "effectiveDate" as keyof Compensation, header: "Effective Date" },
    { key: "payRate" as keyof Compensation, header: "Pay Rate" },
    { key: "payType" as keyof Compensation, header: "Pay Type" },
    { key: "overtime" as keyof Compensation, header: "Overtime" },
    { key: "changeReason" as keyof Compensation, header: "Change Reason" },
    { key: "comment" as keyof Compensation, header: "Comment" },
  ];

  const bonusColumns = [
    { key: "type" as keyof Bonus, header: "Type" },
    { key: "amount" as keyof Bonus, header: "Amount" },
    { key: "frequency" as keyof Bonus, header: "Frequency" },
    { key: "eligibilityDate" as keyof Bonus, header: "Eligibility Date" },
    { key: "description" as keyof Bonus, header: "Description" },
  ];

  if (employeeLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Current Job Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Current Job Information
            </CardTitle>
            <Button 
              onClick={() => setShowJobInfoDialog(true)} 
              size="sm" 
              variant="outline"
              data-testid="button-edit-job-info"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showJobInfoForm ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                <p className="mt-1 text-sm text-foreground font-medium">
                  {employee?.jobTitle || "Not specified"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                <p className="mt-1 text-sm text-foreground font-medium">
                  {employee?.department || "Not specified"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="mt-1 text-sm text-foreground font-medium">
                  {employee?.location || "Not specified"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Hire Date</Label>
                <p className="mt-1 text-sm text-foreground font-medium">
                  {employee?.hireDate || "Not specified"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={jobInfoFormData.jobTitle || ''}
                    onChange={(e) => setJobInfoFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Enter job title"
                  />
                  {jobInfoErrors.jobTitle && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {jobInfoErrors.jobTitle}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={jobInfoFormData.department || ''} 
                    onValueChange={(value) => setJobInfoFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Customer Success">Customer Success</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                  {jobInfoErrors.department && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {jobInfoErrors.department}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={jobInfoFormData.location || ''} 
                    onValueChange={(value) => setJobInfoFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                      <SelectItem value="New York, NY">New York, NY</SelectItem>
                      <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                      <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                      <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={jobInfoFormData.hireDate || ''}
                    onChange={(e) => setJobInfoFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                  />
                  {jobInfoErrors.hireDate && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {jobInfoErrors.hireDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelJobInfoForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleJobInfoSubmit}
                  disabled={updateJobInfoMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateJobInfoMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Employment History
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => setShowEmploymentDialog(true)} size="sm" data-testid="button-add-employment-history">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={employmentHistoryColumns}
            data={employmentHistory}
            onEdit={handleEditEmployment}
            onDelete={(item) => deleteEmploymentHistoryMutation.mutate(item.id!)}
            emptyMessage="No employment history available"
          />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentEffectiveDate">Effective Date *</Label>
                  <Input
                    id="employmentEffectiveDate"
                    type="date"
                    value={employmentFormData.effectiveDate || ''}
                    onChange={(e) => setEmploymentFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                  {employmentErrors.effectiveDate && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {employmentErrors.effectiveDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <Select 
                    value={employmentFormData.status || ''} 
                    onValueChange={(value) => setEmploymentFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  {employmentErrors.status && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {employmentErrors.status}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="employmentLocation">Location</Label>
                  <Input
                    id="employmentLocation"
                    value={employmentFormData.location || ''}
                    onChange={(e) => setEmploymentFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentDivision">Division</Label>
                  <Select 
                    value={employmentFormData.division || ''} 
                    onValueChange={(value) => setEmploymentFormData(prev => ({ ...prev, division: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                      <SelectItem value="Latin America">Latin America</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentDepartment">Department *</Label>
                  <Select 
                    value={employmentFormData.department || ''} 
                    onValueChange={(value) => setEmploymentFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                  {employmentErrors.department && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {employmentErrors.department}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="employmentJobTitle">Job Title *</Label>
                  <Input
                    id="employmentJobTitle"
                    value={employmentFormData.jobTitle || ''}
                    onChange={(e) => setEmploymentFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Enter job title"
                  />
                  {employmentErrors.jobTitle && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {employmentErrors.jobTitle}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="employmentReportsTo">Reports To</Label>
                  <Input
                    id="employmentReportsTo"
                    value={employmentFormData.reportsTo || ''}
                    onChange={(e) => setEmploymentFormData(prev => ({ ...prev, reportsTo: e.target.value }))}
                    placeholder="Enter manager name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="employmentComment">Comment</Label>
                <Textarea
                  id="employmentComment"
                  value={employmentFormData.comment || ''}
                  onChange={(e) => setEmploymentFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Add any additional comments"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelEmploymentForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleEmploymentSubmit}
                  disabled={createEmploymentHistoryMutation.isPending || updateEmploymentHistoryMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createEmploymentHistoryMutation.isPending || updateEmploymentHistoryMutation.isPending ? 'Saving...' : editingEmployment ? 'Update' : 'Save'} Entry
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Compensation
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => setShowCompensationDialog(true)} size="sm" data-testid="button-add-compensation">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showCompensationForm ? (
            <DataTable
              columns={compensationColumns}
              data={compensation}
              onEdit={handleEditCompensation}
              onDelete={(item) => deleteCompensationMutation.mutate(item.id!)}
              emptyMessage="No compensation information available"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compensationEffectiveDate">Effective Date *</Label>
                  <Input
                    id="compensationEffectiveDate"
                    type="date"
                    value={compensationFormData.effectiveDate || ''}
                    onChange={(e) => setCompensationFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                  {compensationErrors.effectiveDate && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {compensationErrors.effectiveDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="compensationPayRate">Pay Rate *</Label>
                  <Input
                    id="compensationPayRate"
                    value={compensationFormData.payRate || ''}
                    onChange={(e) => {
                      const formatted = formatSalary(e.target.value);
                      setCompensationFormData(prev => ({ ...prev, payRate: formatted }));
                    }}
                    placeholder="$0.00"
                  />
                  {compensationErrors.payRate && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {compensationErrors.payRate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="compensationPayType">Pay Type *</Label>
                  <Select 
                    value={compensationFormData.payType || ''} 
                    onValueChange={(value) => setCompensationFormData(prev => ({ ...prev, payType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                      <SelectItem value="Commission">Commission</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  {compensationErrors.payType && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {compensationErrors.payType}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="compensationOvertime">Overtime Status</Label>
                  <Select 
                    value={compensationFormData.overtime || ''} 
                    onValueChange={(value) => setCompensationFormData(prev => ({ ...prev, overtime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select overtime status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Exempt">Exempt</SelectItem>
                      <SelectItem value="Non-Exempt">Non-Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="compensationChangeReason">Change Reason *</Label>
                  <Select 
                    value={compensationFormData.changeReason || ''} 
                    onValueChange={(value) => setCompensationFormData(prev => ({ ...prev, changeReason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select change reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New Hire">New Hire</SelectItem>
                      <SelectItem value="Promotion">Promotion</SelectItem>
                      <SelectItem value="Annual Review">Annual Review</SelectItem>
                      <SelectItem value="Merit Increase">Merit Increase</SelectItem>
                      <SelectItem value="Market Adjustment">Market Adjustment</SelectItem>
                      <SelectItem value="Role Change">Role Change</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {compensationErrors.changeReason && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {compensationErrors.changeReason}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="compensationComment">Comment</Label>
                <Textarea
                  id="compensationComment"
                  value={compensationFormData.comment || ''}
                  onChange={(e) => setCompensationFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Add any additional comments"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelCompensationForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleCompensationSubmit}
                  disabled={createCompensationMutation.isPending || updateCompensationMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createCompensationMutation.isPending || updateCompensationMutation.isPending ? 'Saving...' : editingCompensation ? 'Update' : 'Save'} Entry
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bonus Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Bonus Information
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => setShowBonusDialog(true)} size="sm" data-testid="button-add-bonus">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showBonusForm ? (
            <DataTable
              columns={bonusColumns}
              data={bonuses}
              onEdit={handleEditBonus}
              onDelete={(item) => deleteBonusMutation.mutate(item.id!)}
              emptyMessage="No bonus information available"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bonusType">Bonus Type *</Label>
                  <Select 
                    value={bonusFormData.type || ''} 
                    onValueChange={(value) => setBonusFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bonus type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Performance Bonus">Performance Bonus</SelectItem>
                      <SelectItem value="Signing Bonus">Signing Bonus</SelectItem>
                      <SelectItem value="Retention Bonus">Retention Bonus</SelectItem>
                      <SelectItem value="Holiday Bonus">Holiday Bonus</SelectItem>
                      <SelectItem value="Project Completion">Project Completion</SelectItem>
                      <SelectItem value="Sales Commission">Sales Commission</SelectItem>
                      <SelectItem value="Referral Bonus">Referral Bonus</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {bonusErrors.type && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {bonusErrors.type}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bonusAmount">Amount *</Label>
                  <Input
                    id="bonusAmount"
                    value={bonusFormData.amount || ''}
                    onChange={(e) => {
                      const formatted = formatSalary(e.target.value);
                      setBonusFormData(prev => ({ ...prev, amount: formatted }));
                    }}
                    placeholder="$0.00"
                  />
                  {bonusErrors.amount && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {bonusErrors.amount}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bonusFrequency">Frequency *</Label>
                  <Select 
                    value={bonusFormData.frequency || ''} 
                    onValueChange={(value) => setBonusFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-time">One-time</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                  {bonusErrors.frequency && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {bonusErrors.frequency}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bonusEligibilityDate">Eligibility Date</Label>
                  <Input
                    id="bonusEligibilityDate"
                    type="date"
                    value={bonusFormData.eligibilityDate || ''}
                    onChange={(e) => setBonusFormData(prev => ({ ...prev, eligibilityDate: e.target.value }))}
                  />
                  {bonusErrors.eligibilityDate && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {bonusErrors.eligibilityDate}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bonusDescription">Description</Label>
                <Textarea
                  id="bonusDescription"
                  value={bonusFormData.description || ''}
                  onChange={(e) => setBonusFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the bonus criteria and conditions"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelBonusForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleBonusSubmit}
                  disabled={createBonusMutation.isPending || updateBonusMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createBonusMutation.isPending || updateBonusMutation.isPending ? 'Saving...' : editingBonus ? 'Update' : 'Save'} Entry
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
