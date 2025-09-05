import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, UserCheck, DollarSign, Award, Plus } from "lucide-react";
import type { EmploymentHistory, Compensation, InsertEmploymentHistory, InsertCompensation } from "@shared/schema";

interface JobTabProps {
  employeeId: string;
}

export default function JobTab({ employeeId }: JobTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employmentHistory = [] } = useQuery<EmploymentHistory[]>({
    queryKey: ["/api/employees", employeeId, "employment-history"],
  });

  const { data: compensation = [] } = useQuery<Compensation[]>({
    queryKey: ["/api/employees", employeeId, "compensation"],
  });

  const createEmploymentHistoryMutation = useMutation({
    mutationFn: async (data: InsertEmploymentHistory) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/employment-history`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      toast({ title: "Success", description: "Employment history added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add employment history", variant: "destructive" });
    },
  });

  const createCompensationMutation = useMutation({
    mutationFn: async (data: InsertCompensation) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/compensation`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      toast({ title: "Success", description: "Compensation added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add compensation", variant: "destructive" });
    },
  });

  const deleteEmploymentHistoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employment-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "employment-history"] });
      toast({ title: "Success", description: "Employment history deleted successfully" });
    },
  });

  const deleteCompensationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/compensation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "compensation"] });
      toast({ title: "Success", description: "Compensation deleted successfully" });
    },
  });

  const addSampleEmploymentHistory = () => {
    createEmploymentHistoryMutation.mutate({
      employeeId,
      effectiveDate: "2022-10-11",
      status: "Full Time",
      location: "Salt Lake City",
      division: "North America",
      department: "Operations", 
      jobTitle: "HR Administrator",
      reportsTo: "John Manager",
      comment: "Initial hire",
    });
  };

  const addSampleCompensation = () => {
    createCompensationMutation.mutate({
      employeeId,
      effectiveDate: "2022-10-11", 
      payRate: "$65,000.00",
      payType: "Salary",
      overtime: "Exempt",
      changeReason: "New Hire",
      comment: "Initial compensation for new hire",
    });
  };

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
    { key: "payType" as keyof Compensation, header: "Pay Rate" },
    { key: "payType" as keyof Compensation, header: "Pay Type" },
    { key: "payRate" as keyof Compensation, header: "Pay Rate" },
    { key: "overtime" as keyof Compensation, header: "Overtime" },
    { key: "changeReason" as keyof Compensation, header: "Change Reason" },
    { key: "comment" as keyof Compensation, header: "Comment" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Employment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Employment Status
            </CardTitle>
            <Button onClick={addSampleEmploymentHistory} size="sm" data-testid="button-add-employment-status">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={employmentHistoryColumns}
            data={employmentHistory}
            onDelete={(item) => deleteEmploymentHistoryMutation.mutate(item.id)}
            emptyMessage="No employment history available"
          />
        </CardContent>
      </Card>

      {/* Job Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-primary" />
              Job Information
            </CardTitle>
            <Button onClick={addSampleEmploymentHistory} size="sm" data-testid="button-add-job-info">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={employmentHistoryColumns}
            data={employmentHistory}
            onDelete={(item) => deleteEmploymentHistoryMutation.mutate(item.id)}
            emptyMessage="No job information available"
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
            <Button onClick={addSampleCompensation} size="sm" data-testid="button-add-compensation">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={compensationColumns}
            data={compensation}
            onDelete={(item) => deleteCompensationMutation.mutate(item.id)}
            emptyMessage="No compensation information available"
          />
        </CardContent>
      </Card>

      {/* Potential Bonus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Potential Bonus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No bonus information available
          </div>
          <div className="text-center">
            <Button variant="outline" data-testid="button-add-bonus">
              Add Bonus Information
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
