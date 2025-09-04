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
  UserX,
  Archive
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OffboardingTask {
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

interface OffboardingTabProps {
  employeeId: string;
}

export default function OffboardingTab({ employeeId }: OffboardingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exitNotes, setExitNotes] = useState("");

  const { data: offboardingTasks = [] } = useQuery<OffboardingTask[]>({
    queryKey: ["/api/employees", employeeId, "offboarding"],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: "1",
          title: "Conduct Exit Interview",
          description: "Schedule and conduct exit interview with HR",
          status: "pending" as const,
          dueDate: "2025-09-20",
          category: "HR",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "2",
          title: "Return IT Equipment",
          description: "Collect laptop, phone, access cards, and other company property",
          status: "pending" as const,
          dueDate: "2025-09-25",
          category: "IT",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "3",
          title: "Knowledge Transfer",
          description: "Document processes and transfer knowledge to team members",
          status: "pending" as const,
          dueDate: "2025-09-22",
          category: "Operations",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "4",
          title: "Disable System Access",
          description: "Revoke access to all systems and applications",
          status: "pending" as const,
          dueDate: "2025-09-25",
          category: "IT",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "5",
          title: "Final Payroll Processing",
          description: "Calculate final pay, vacation accrual, and benefits",
          status: "pending" as const,
          dueDate: "2025-09-30",
          category: "Payroll",
          priority: "high" as const,
          employeeId,
        },
        {
          id: "6",
          title: "Benefits Termination",
          description: "Process COBRA notifications and benefit terminations",
          status: "pending" as const,
          dueDate: "2025-09-27",
          category: "Benefits",
          priority: "medium" as const,
          employeeId,
        },
      ];
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { taskId: string; status: OffboardingTask["status"] }) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}/offboarding/${data.taskId}`, {
        status: data.status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "offboarding"] });
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

  const saveExitNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}/offboarding/notes`, {
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exit notes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save exit notes",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: OffboardingTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: OffboardingTask["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge variant="default" className="bg-orange-100 text-orange-800">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: OffboardingTask["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const completedTasks = offboardingTasks.filter(task => task.status === "completed").length;
  const totalTasks = offboardingTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleTaskStatusChange = (taskId: string, newStatus: OffboardingTask["status"]) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const handleSaveExitNotes = () => {
    saveExitNotesMutation.mutate(exitNotes);
  };

  const groupedTasks = offboardingTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, OffboardingTask[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserX className="h-6 w-6" />
          Offboarding
        </h2>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Offboarding Progress
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
                  {offboardingTasks.filter(task => task.status === "in-progress").length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {offboardingTasks.filter(task => task.status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exit Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exitNotes">Exit Interview Notes & Comments</Label>
              <Textarea
                id="exitNotes"
                value={exitNotes}
                onChange={(e) => setExitNotes(e.target.value)}
                placeholder="Enter exit interview notes, feedback, and any other relevant information..."
                rows={5}
              />
            </div>
            <Button onClick={handleSaveExitNotes} disabled={saveExitNotesMutation.isPending}>
              Save Notes
            </Button>
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

      {offboardingTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No offboarding tasks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
