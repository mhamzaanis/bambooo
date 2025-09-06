import { useState, useEffect } from "react";
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
import { Briefcase, UserCheck, DollarSign, Award, Plus, Save, X, Edit, AlertCircle, Calendar, Building, Users } from "lucide-react";
import type { EmploymentHistory, Compensation, Bonus, InsertEmploymentHistory, InsertCompensation, InsertBonus, Employee } from "@shared/schema";

// Import modals
import JobInfoModal from "@/components/employee/modals/job-info-modal";
import EmploymentHistoryModal from "@/components/employee/modals/employment-history-modal";
import CompensationModal from "@/components/employee/modals/compensation-modal";
import BonusModal from "@/components/employee/modals/bonus-modal";

interface JobTabProps {
  employeeId: string;
}

export default function JobTab({ employeeId }: JobTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal states
  const [showJobInfoModal, setShowJobInfoModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [showCompensationModal, setShowCompensationModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  
  // Edit states
  const [editingEmployment, setEditingEmployment] = useState<EmploymentHistory | null>(null);
  const [editingCompensation, setEditingCompensation] = useState<Compensation | null>(null);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);

  // Queries - Fixed enabled condition and error handling
  const { data: employee, isLoading: employeeLoading, error: employeeError } = useQuery<Employee>({
    queryKey: ["/api/employees", employeeId],
    enabled: !!employeeId, // Only run if employeeId exists
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: employmentHistory = [], error: employmentError } = useQuery<EmploymentHistory[]>({
    queryKey: ["/api/employees", employeeId, "employment-history"],
    enabled: !!employeeId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: compensation = [], error: compensationError } = useQuery<Compensation[]>({
    queryKey: ["/api/employees", employeeId, "compensation"],
    enabled: !!employeeId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: bonuses = [], error: bonusesError } = useQuery<Bonus[]>({
    queryKey: ["/api/employees", employeeId, "bonuses"],
    enabled: !!employeeId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Handle query errors
  useEffect(() => {
    if (employeeError || employmentError || compensationError || bonusesError) {
      toast({ 
        title: "Error", 
        description: "Failed to load employee data", 
        variant: "destructive" 
      });
    }
  }, [employeeError, employmentError, compensationError, bonusesError, toast]);

  // Mutations for employment history
  const createEmploymentHistoryMutation = useMutation({
    mutationFn: async (data: InsertEmploymentHistory) => {
      console.log('Creating employment history:', data);
      return await apiRequest("POST", `/api/employees/${employeeId}/employment-history`, data);
    },
    onSuccess: async (data) => {
      console.log('Create successful, data:', data);
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      toast({ title: "Success", description: "Employment history added successfully" });
      setShowEmploymentModal(false);
      setEditingEmployment(null);
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
      toast({ title: "Success", description: "Employment history updated successfully" });
      setShowEmploymentModal(false);
      setEditingEmployment(null);
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
      toast({ title: "Success", description: "Compensation added successfully" });
      setShowCompensationModal(false);
      setEditingCompensation(null);
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
      toast({ title: "Success", description: "Compensation updated successfully" });
      setShowCompensationModal(false);
      setEditingCompensation(null);
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
      toast({ title: "Success", description: "Bonus added successfully" });
      setShowBonusModal(false);
      setEditingBonus(null);
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
      toast({ title: "Success", description: "Bonus updated successfully" });
      setShowBonusModal(false);
      setEditingBonus(null);
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
      toast({ title: "Success", description: "Job information updated successfully" });
      setShowJobInfoModal(false);
    },
    onError: (error) => {
      console.error("Error updating job info:", error);
      toast({ title: "Error", description: "Failed to update job information", variant: "destructive" });
    },
  });

  // Modal handlers
  const handleEmploymentSubmit = (data: InsertEmploymentHistory) => {
    if (editingEmployment) {
      updateEmploymentHistoryMutation.mutate({ id: editingEmployment.id!, data });
    } else {
      createEmploymentHistoryMutation.mutate(data);
    }
  };

  const handleCompensationSubmit = (data: InsertCompensation) => {
    if (editingCompensation) {
      updateCompensationMutation.mutate({ id: editingCompensation.id!, data });
    } else {
      createCompensationMutation.mutate(data);
    }
  };

  const handleBonusSubmit = (data: InsertBonus) => {
    if (editingBonus) {
      updateBonusMutation.mutate({ id: editingBonus.id!, data });
    } else {
      createBonusMutation.mutate(data);
    }
  };

  const handleJobInfoSubmit = (data: Partial<Employee>) => {
    updateJobInfoMutation.mutate(data);
  };

  // Edit handlers
  const handleEditEmployment = (employment: EmploymentHistory) => {
    setEditingEmployment(employment);
    setShowEmploymentModal(true);
  };

  const handleEditCompensation = (comp: Compensation) => {
    setEditingCompensation(comp);
    setShowCompensationModal(true);
  };

  const handleEditBonus = (bonus: Bonus) => {
    setEditingBonus(bonus);
    setShowBonusModal(true);
  };

  // Close handlers
  const handleCloseEmploymentModal = () => {
    setShowEmploymentModal(false);
    setEditingEmployment(null);
  };

  const handleCloseCompensationModal = () => {
    setShowCompensationModal(false);
    setEditingCompensation(null);
  };

  const handleCloseBonusModal = () => {
    setShowBonusModal(false);
    setEditingBonus(null);
  };

  const handleCloseJobInfoModal = () => {
    setShowJobInfoModal(false);
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

  // Early return for missing employeeId
  if (!employeeId) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No employee selected</p>
      </div>
    );
  }

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
              onClick={() => setShowJobInfoModal(true)} 
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
              <Button onClick={() => setShowEmploymentModal(true)} size="sm" data-testid="button-add-employment-history">
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
              <Button onClick={() => setShowCompensationModal(true)} size="sm" data-testid="button-add-compensation">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={compensationColumns}
            data={compensation}
            onEdit={handleEditCompensation}
            onDelete={(item) => deleteCompensationMutation.mutate(item.id!)}
            emptyMessage="No compensation information available"
          />
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
              <Button onClick={() => setShowBonusModal(true)} size="sm" data-testid="button-add-bonus">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={bonusColumns}
            data={bonuses}
            onEdit={handleEditBonus}
            onDelete={(item) => deleteBonusMutation.mutate(item.id!)}
            emptyMessage="No bonus information available"
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <JobInfoModal
        isOpen={showJobInfoModal}
        onClose={handleCloseJobInfoModal}
        onSubmit={handleJobInfoSubmit}
        initialData={employee}
        isLoading={updateJobInfoMutation.isPending}
      />

      <EmploymentHistoryModal
        isOpen={showEmploymentModal}
        onClose={handleCloseEmploymentModal}
        onSubmit={handleEmploymentSubmit}
        initialData={editingEmployment}
        isLoading={createEmploymentHistoryMutation.isPending || updateEmploymentHistoryMutation.isPending}
        employeeId={employeeId}
      />

      <CompensationModal
        isOpen={showCompensationModal}
        onClose={handleCloseCompensationModal}
        onSubmit={handleCompensationSubmit}
        initialData={editingCompensation}
        isLoading={createCompensationMutation.isPending || updateCompensationMutation.isPending}
        employeeId={employeeId}
      />

      <BonusModal
        isOpen={showBonusModal}
        onClose={handleCloseBonusModal}
        onSubmit={handleBonusSubmit}
        initialData={editingBonus}
        isLoading={createBonusMutation.isPending || updateBonusMutation.isPending}
        employeeId={employeeId}
      />
    </div>
  );
}