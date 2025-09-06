import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon,
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Users,
  Shield,
  GraduationCap,
  UserCheck,
  Building,
  Settings,
  FileText
} from "lucide-react";
import { format, isWeekend, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
  dueDate?: string;
  category: "documentation" | "training" | "setup" | "compliance" | "team-introduction" | "systems-access";
  priority: "low" | "medium" | "high";
  employeeId: string;
  completedDate?: string;
  estimatedHours?: number;
}

// Database response interface
interface DBOnboardingTask {
  id: string;
  task?: string;
  description?: string;
  status?: "pending" | "in-progress" | "completed";
  dueDate?: string | null;
  employeeId: string;
  completedDate?: string | null;
}

const onboardingCategories = {
  "documentation": {
    label: "Documentation",
    icon: FileText,
    color: "bg-muted text-muted-foreground",
    description: "Complete required paperwork and documentation"
  },
  "training": {
    label: "Training",
    icon: GraduationCap,
    color: "bg-muted text-muted-foreground",
    description: "Complete mandatory training sessions"
  },
  "setup": {
    label: "Workspace Setup",
    icon: Settings,
    color: "bg-muted text-muted-foreground",
    description: "Set up workspace and equipment"
  },
  "compliance": {
    label: "Compliance",
    icon: Shield,
    color: "bg-muted text-muted-foreground",
    description: "Complete compliance and safety requirements"
  },
  "team-introduction": {
    label: "Team Introduction",
    icon: Users,
    color: "bg-muted text-muted-foreground",
    description: "Meet your team and key stakeholders"
  },
  "systems-access": {
    label: "Systems Access",
    icon: Building,
    color: "bg-muted text-muted-foreground",
    description: "Get access to required systems and tools"
  }
} as const;

interface OnboardingTabProps {
  employeeId: string;
}

export default function OnboardingTab({ employeeId }: OnboardingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<OnboardingTask | null>(null);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>();
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [dateError, setDateError] = useState<string>("");

  // Date validation functions
  const validateDueDate = (date: Date | undefined): string => {
    if (!date) return "";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return "Due date cannot be in the past";
    }
    
    return "";
  };

  const isHoliday = (date: Date): boolean => {
    // Simple holiday check - can be expanded
    const holidays = ['2024-12-25', '2024-01-01', '2024-07-04'];
    const dateString = format(date, 'yyyy-MM-dd');
    return holidays.includes(dateString);
  };

  const formatDateForInput = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Fetch onboarding tasks
  const { data: onboardingTasks = [], isLoading, error } = useQuery({
    queryKey: ["/api/employees", employeeId, "onboarding"],
    queryFn: async () => {
      try {
        console.log('Fetching onboarding tasks for employee:', employeeId);
        const response = await fetch(`/api/employees/${employeeId}/onboarding`);
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding tasks');
        }
        const data: DBOnboardingTask[] = await response.json();
        
        // Convert database schema to our OnboardingTask interface
        const dbTasks: OnboardingTask[] = data.map((item: DBOnboardingTask) => ({
          id: item.id,
          title: item.task || 'Untitled Task',
          description: item.description || '',
          status: item.status === "pending" ? "not-started" : item.status || 'not-started',
          dueDate: item.dueDate || undefined,
          category: 'documentation' as const, // Default category since it's not in the database
          priority: 'medium' as const, // Default priority since it's not in the database
          employeeId: item.employeeId,
          completedDate: item.completedDate || undefined,
        }));

        console.log('Fetched onboarding tasks from server:', dbTasks);
        return dbTasks;
      } catch (error) {
        console.error('Error fetching onboarding tasks:', error);
        return [];
      }
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Calculate progress statistics
  const completedTasks = onboardingTasks.filter((task: OnboardingTask) => task.status === "completed").length;
  const inProgressTasks = onboardingTasks.filter((task: OnboardingTask) => task.status === "in-progress").length;
  const pendingTasks = onboardingTasks.filter((task: OnboardingTask) => task.status === "not-started").length;
  const totalTasks = onboardingTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Mutations for CRUD operations
  const createTaskMutation = useMutation({
    mutationFn: async (data: Omit<OnboardingTask, "id" | "employeeId">) => {
      const payload = {
        task: data.title,
        description: data.description,
        dueDate: data.dueDate,
        status: data.status,
        completedDate: data.completedDate,
      };
      const response = await apiRequest("POST", `/api/employees/${employeeId}/onboarding`, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      setShowTaskDialog(false);
      setEditingTask(null);
      setSelectedDueDate(undefined);
      setDueDateOpen(false);
      setDateError("");
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      console.error('Create task error:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<OnboardingTask> }) => {
      const payload = {
        task: updates.title,
        description: updates.description,
        dueDate: updates.dueDate,
        status: updates.status,
        completedDate: updates.completedDate,
      };
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}/onboarding/${taskId}`, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      setShowTaskDialog(false);
      setEditingTask(null);
      setSelectedDueDate(undefined);
      setDueDateOpen(false);
      setDateError("");
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update task error:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("DELETE", `/api/employees/${employeeId}/onboarding/${taskId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete task error:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleTaskSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      dueDate: selectedDueDate ? formatDateForInput(selectedDueDate) : "",
      category: formData.get("category") as OnboardingTask["category"] || "documentation",
      priority: "medium" as OnboardingTask["priority"],
      status: formData.get("status") as OnboardingTask["status"] || "not-started"
    };

    setDateError("");

    if (editingTask) {
      updateTaskMutation.mutate({ taskId: editingTask.id, updates: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleDialogOpen = (task?: OnboardingTask) => {
    if (task) {
      setEditingTask(task);
      setSelectedDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setEditingTask(null);
      setSelectedDueDate(undefined);
    }
    setDateError("");
    setDueDateOpen(false);
    setShowTaskDialog(true);
  };

  const handleDialogClose = () => {
    setShowTaskDialog(false);
    setEditingTask(null);
    setSelectedDueDate(undefined);
    setDateError("");
    setDueDateOpen(false);
  };

  const handleEdit = (task: OnboardingTask) => {
    handleDialogOpen(task);
  };

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: OnboardingTask["status"]) => {
    const updates: Partial<OnboardingTask> = { 
      status: newStatus,
      ...(newStatus === "completed" && { completedDate: new Date().toISOString().split('T')[0] })
    };
    updateTaskMutation.mutate({ taskId, updates });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDueDate(date);
    if (date) {
      const error = validateDueDate(date);
      setDateError(error);
      setDueDateOpen(false); // Close the popover when date is selected
    } else {
      setDateError("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading onboarding tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading onboarding tasks</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center">
            <UserCheck className="h-8 w-8 mr-3 text-foreground" />
            Employee Onboarding
          </h2>
          <p className="text-muted-foreground mt-2">Complete your onboarding checklist to get started</p>
        </div>
        <Button onClick={() => handleDialogOpen()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CheckCircle2 className="h-5 w-5 mr-2 text-foreground" />
            Onboarding Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{completedTasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{inProgressTasks}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{pendingTasks}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="w-full h-3" />
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(onboardingCategories).map(([key, category]) => {
          const categoryTasks = onboardingTasks.filter((task: OnboardingTask) => task.category === key);
          const completedInCategory = categoryTasks.filter((task: OnboardingTask) => task.status === "completed").length;
          const Icon = category.icon;
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {completedInCategory}/{categoryTasks.length}
                  </span>
                  <Badge className={category.color}>
                    {categoryTasks.length === 0 ? "No tasks" : 
                     completedInCategory === categoryTasks.length ? "Complete" : "In Progress"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{category.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Onboarding Task" : "Add New Onboarding Task"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={editingTask?.title}
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={editingTask?.description}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingTask?.category || "documentation"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(onboardingCategories).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingTask?.status || "not-started"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Due Date</Label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDueDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDueDate ? (
                      <span>
                        {format(selectedDueDate, "PPP")}
                        {isWeekend(selectedDueDate) && (
                          <span className="ml-2 text-muted-foreground">(Weekend)</span>
                        )}
                        {isHoliday(selectedDueDate) && (
                          <span className="ml-2 text-destructive">(Holiday)</span>
                        )}
                      </span>
                    ) : (
                      <span>Pick a due date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDueDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Only disable dates in the past (before today)
                      const today = new Date();
                      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                      return date < yesterday;
                    }}
                    initialFocus={false}
                    fixedWeeks={true}
                  />
                  <div className="p-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Weekends and holidays are highlighted</span>
                    </div>
                    {selectedDueDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedDueDate(undefined);
                          setDateError("");
                        }}
                      >
                        Clear Date
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              {dateError && (
                <Alert className="mt-2" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{dateError}</AlertDescription>
                </Alert>
              )}
              
              {selectedDueDate && (isWeekend(selectedDueDate) || isHoliday(selectedDueDate)) && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {isWeekend(selectedDueDate) && "Note: This is a weekend. "}
                    {isHoliday(selectedDueDate) && "Note: This is a holiday. "}
                    Consider if this affects task completion.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!!dateError}>
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {onboardingTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Onboarding Journey!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first onboarding task. We'll help you track your progress as you settle into your new role.
            </p>
            <Button onClick={() => handleDialogOpen()} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Tasks by Category
        <div className="space-y-6">
          {Object.entries(onboardingCategories).map(([categoryKey, category]) => {
            const categoryTasks = onboardingTasks.filter((task: OnboardingTask) => task.category === categoryKey);
            if (categoryTasks.length === 0) return null;
            
            const Icon = category.icon;
            const completedInCategory = categoryTasks.filter((t: OnboardingTask) => t.status === "completed").length;
            
            return (
              <Card key={categoryKey} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3 text-blue-600" />
                      <span>{category.label}</span>
                    </div>
                    <Badge className={category.color}>
                      {completedInCategory}/{categoryTasks.length}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryTasks.map((task: OnboardingTask) => {
                    const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== "completed";
                    const isDueSoon = task.dueDate && !isOverdue && isBefore(new Date(task.dueDate), addDays(new Date(), 3)) && task.status !== "completed";
                    
                    return (
                      <div key={task.id} className={cn(
                        "flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors",
                        task.status === "completed" && "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800"
                      )}>
                        <div className="flex items-center space-x-4 flex-1">
                          <button
                            onClick={() => {
                              if (task.status === "completed") {
                                handleTaskStatusChange(task.id, "in-progress");
                              } else if (task.status === "in-progress") {
                                handleTaskStatusChange(task.id, "completed");
                              } else {
                                handleTaskStatusChange(task.id, "in-progress");
                              }
                            }}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              task.status === "completed" ? "bg-green-500 border-green-500" :
                              task.status === "in-progress" ? "bg-blue-500 border-blue-500" :
                              "border-border hover:border-foreground"
                            )}
                          >
                            {task.status === "completed" && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                            {task.status === "in-progress" && (
                              <Clock className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-medium text-foreground",
                                task.status === "completed" && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </h4>
                              {task.status === "completed" && (
                                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Completed</Badge>
                              )}
                              {task.status === "in-progress" && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
                              )}
                              {task.status === "not-started" && (
                                <Badge className="text-xs bg-gray-100 text-gray-800 border-gray-200">Not Started</Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">Overdue</Badge>
                              )}
                              {isDueSoon && (
                                <Badge className="text-xs bg-orange-100 text-orange-800">Due Soon</Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                {isOverdue && (
                                  <span className="ml-2 text-red-600 font-medium">
                                    ({Math.abs(Math.floor((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)))} days overdue)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            className="hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}