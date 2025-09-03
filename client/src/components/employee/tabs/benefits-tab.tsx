import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Users, Clock, Plus } from "lucide-react";
import type { Benefit, InsertBenefit } from "@shared/schema";

interface BenefitsTabProps {
  employeeId: string;
}

export default function BenefitsTab({ employeeId }: BenefitsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: benefits = [] } = useQuery<Benefit[]>({
    queryKey: ["/api/employees", employeeId, "benefits"],
  });

  const createBenefitMutation = useMutation({
    mutationFn: async (data: InsertBenefit) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/benefits`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "benefits"] });
      toast({ title: "Success", description: "Benefit added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add benefit", variant: "destructive" });
    },
  });

  const deleteBenefitMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/benefits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "benefits"] });
      toast({ title: "Success", description: "Benefit deleted successfully" });
    },
  });

  const addSampleBenefit = () => {
    createBenefitMutation.mutate({
      employeeId,
      type: "Health",
      plan: "HDHP Plan | Employee",
      status: "Eligible",
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
  };

  const benefitTypes = [
    {
      type: "Health",
      plans: [
        { name: "HDHP Plan | Employee", status: "Eligible" },
        { name: "HDHP 2025 | Employee", status: "Eligible" },
        { name: "FSA Eligible HMO 2025 | Employee", status: "Eligible" },
      ],
      icon: Heart,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      type: "Dental",
      plans: [
        { name: "Dental Basic 2025 | Employee", status: "Eligible" },
        { name: "Dental Plus 2025 | Employee", status: "Eligible" },
      ],
      icon: Heart,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      type: "Vision",
      plans: [
        { name: "Vision Insurance 2025 | Employee", status: "Eligible" },
      ],
      icon: Heart,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      type: "Retirement",
      plans: [
        { name: "401(k) Plan 2025 | Employee", status: "Eligible" },
      ],
      icon: Heart,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      type: "Life",
      plans: [
        { name: "Basic Life 2025 | Employee", status: "Eligible" },
      ],
      icon: Heart,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const benefitColumns = [
    { key: "type" as keyof Benefit, header: "Type" },
    { key: "plan" as keyof Benefit, header: "Plan" },
    { 
      key: "status" as keyof Benefit, 
      header: "Status",
      render: (value: string) => (
        <span className="text-green-600 text-sm font-medium">{value}</span>
      ),
    },
    { key: "enrollmentDate" as keyof Benefit, header: "Enrollment Date" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Benefits Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Benefits Overview
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={addSampleBenefit} size="sm" data-testid="button-add-benefit">
                <Plus className="h-4 w-4 mr-2" />
                Add Benefit
              </Button>
              <span className="text-sm text-gray-500">Showing: All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benefitTypes.map((benefitType) => (
              <div key={benefitType.type} className="space-y-2">
                {benefitType.plans.map((plan, index) => {
                  const IconComponent = benefitType.icon;
                  return (
                    <div
                      key={`${benefitType.type}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      data-testid={`benefit-plan-${benefitType.type.toLowerCase()}-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${benefitType.bgColor} rounded-full flex items-center justify-center`}>
                            <IconComponent className={`h-4 w-4 ${benefitType.iconColor}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{plan.name}</h3>
                            <p className="text-sm text-gray-500">{benefitType.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-green-600 text-sm font-medium">{plan.status}</span>
                          <Button variant="link" size="sm" className="text-primary hover:text-primary/80">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dependents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Dependents
            </CardTitle>
            <Button variant="outline" size="sm" data-testid="button-add-dependent">
              Add Dependent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No dependents on file
          </div>
        </CardContent>
      </Card>

      {/* Benefit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Benefit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={benefitColumns}
            data={benefits}
            onDelete={(item) => deleteBenefitMutation.mutate(item.id)}
            emptyMessage="No benefit history available"
          />
        </CardContent>
      </Card>
    </div>
  );
}
