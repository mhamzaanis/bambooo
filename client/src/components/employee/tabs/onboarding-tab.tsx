import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar,
  CheckSquare
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dueDate?: string;
  assignedTo?: string;
  category: string;
  priority: "low" | "medium" | "high";
  employeeId: string;
}

interface OnboardingTabProps {
  employeeId: string;
}

export default function OnboardingTab({ employeeId }: OnboardingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: onboardingTasks = [] } = useQuery<OnboardingTask[]>({
    queryKey: ["/api/employees", employeeId, "onboarding"],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: "1",
          title: "Complete Employee Handbook Review",
          description: "Review and acknowledge the employee handbook",
          status: "completed" as const,
          dueDate: "2025-09-01",
          category: "Documentation",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "2",
          title: "IT Equipment Setup",
          description: "Receive and set up laptop, phone, and access credentials",
          status: "completed" as const,
          dueDate: "2025-09-01",
          category: "IT",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "3",
          title: "Benefits Enrollment",
          description: "Choose health insurance, dental, and other benefits",
          status: "in-progress" as const,
          dueDate: "2025-09-10",
          category: "HR",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "4",
          title: "Team Introduction Meeting",
          description: "Meet with team members and key stakeholders",
          status: "pending" as const,
          dueDate: "2025-09-08",
          category: "Social",
          priority: "medium" as const,
          employeeId,
        },
        {
          id: "5",
          title: "Security Training",
          description: "Complete mandatory security awareness training",
          status: "pending" as const,
          dueDate: "2025-09-15",
          category: "Training",
          priority: "high" as const,
          employeeId,
        },
      ];
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { taskId: string; status: OnboardingTask["status"] }) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}/onboarding/${data.taskId}`, {
        status: data.status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: OnboardingTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: OnboardingTask["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge variant="default" className="bg-orange-100 text-orange-800">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: OnboardingTask["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const completedTasks = onboardingTasks.filter(task => task.status === "completed").length;
  const totalTasks = onboardingTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleTaskStatusChange = (taskId: string, newStatus: OnboardingTask["status"]) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const groupedTasks = onboardingTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, OnboardingTask[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Onboarding</h2>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Onboarding Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedTasks} of {totalTasks} tasks completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {onboardingTasks.filter(task => task.status === "in-progress").length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {onboardingTasks.filter(task => task.status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {task.assignedTo}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {task.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskStatusChange(task.id, "in-progress")}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === "in-progress" && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                        {task.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskStatusChange(task.id, "in-progress")}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {onboardingTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No onboarding tasks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
