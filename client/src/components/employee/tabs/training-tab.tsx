import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import type { Training, InsertTraining } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TrainingTabProps {
  employeeId: string;
}

export default function TrainingTab({ employeeId }: TrainingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [sortBy, setSortBy] = useState<"most-recent" | "oldest-first" | "alphabetical">("most-recent");
  const [yearFilter, setYearFilter] = useState<"all" | string>("2025");

  const { data: training = [], isLoading, isError, error, refetch } = useQuery<Training[]>({
    queryKey: ["/api/employees", employeeId, "training"],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/training`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch training data");
      }
      return response.json();
    },
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
  });

  // Log data for debugging
  console.log("Training data:", training);
  console.log("Employee ID:", employeeId);
  console.log("Is Loading:", isLoading);
  console.log("Is Error:", isError);
  console.log("Error object:", error);

  const createTrainingMutation = useMutation({
    mutationFn: async (data: InsertTraining) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/training`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "training"] });
      setShowTrainingForm(false);
      setEditingTraining(null);
      toast({ title: "Success", description: "Training added successfully" });
    },
    onError: (err) => {
      console.error("Error creating training:", err);
      toast({ title: "Error", description: "Failed to add training", variant: "destructive" });
    },
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Training> }) => {
      const response = await apiRequest("PATCH", `/api/training/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "training"] });
      setEditingTraining(null);
      toast({ title: "Success", description: "Training updated successfully" });
    },
    onError: (err) => {
      console.error("Error updating training:", err);
      toast({ title: "Error", description: "Failed to update training", variant: "destructive" });
    },
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/training/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "training"] });
      toast({ title: "Success", description: "Training deleted successfully" });
    },
    onError: (err) => {
      console.error("Error deleting training:", err);
      toast({ title: "Error", description: "Failed to delete training", variant: "destructive" });
    },
  });

  const handleTrainingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const trainingData = {
      employeeId,
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
      dueDate: (formData.get("dueDate") as string) || "",
      completedDate: (formData.get("completedDate") as string) || "",
      credits: (formData.get("credits") as string) || "",
    };

    if (editingTraining) {
      updateTrainingMutation.mutate({ id: editingTraining.id, data: trainingData });
    } else {
      createTrainingMutation.mutate(trainingData);
    }
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setShowTrainingForm(true);
  };

  const handleDelete = (trainingId: string) => {
    if (confirm("Are you sure you want to delete this training record?")) {
      deleteTrainingMutation.mutate(trainingId);
    }
  };

  const markAsCompleted = (training: Training) => {
    updateTrainingMutation.mutate({
      id: training.id,
      data: {
        status: "Completed",
        completedDate: new Date().toISOString().split("T")[0],
      },
    });
  };

  // Filter and sort training data
  const pendingTraining = training.filter(t => t.status === "Pending" || t.status === "Upcoming");

  const completedTraining = training
    .filter(t => t.status === "Completed")
    .filter(t => {
      if (!t.completedDate) return true;
      const completedYear = new Date(t.completedDate).getFullYear().toString();
      return yearFilter === "all" || completedYear === yearFilter;
    })
    .sort((a, b) => {
      if (sortBy === "most-recent") {
        return new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime();
      } else if (sortBy === "oldest-first") {
        return new Date(a.completedDate || 0).getTime() - new Date(b.completedDate || 0).getTime();
      } else if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Group training by category
  const groupedPendingTraining = pendingTraining.reduce((acc, training) => {
    const category = training.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(training);
    return acc;
  }, {} as Record<string, Training[]>);

  const groupedCompletedTraining = completedTraining.reduce((acc, training) => {
    const category = training.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(training);
    return acc;
  }, {} as Record<string, Training[]>);

  // Calculate totals
  const totalCompleted = completedTraining.length;
  const totalHours = completedTraining.reduce((sum, t) => sum + (parseFloat(t.credits || "0") || 0), 0);
  const totalCredits = totalHours;

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="h-6 w-6 mr-2 text-primary" />
            Training
          </h1>
        </div>
        <div className="flex justify-center p-8">Loading training data...</div>
      </div>
    );
  }

  if (isError && error) {
    console.error("Training data error:", error);
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="h-6 w-6 mr-2 text-primary" />
            Training
          </h1>
          <Button onClick={() => setShowTrainingForm(true)} data-testid="button-record-training">
            <Plus className="h-4 w-4 mr-2" />
            Record a Training
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading training data: {(error as Error)?.message || "Unknown error"}</p>
            <Button onClick={() => setShowTrainingForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Training Record
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2 text-primary" />
          Training
        </h1>
        <div className="flex items-center space-x-3">
          <Button onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setShowTrainingForm(true)} data-testid="button-record-training">
            <Plus className="h-4 w-4 mr-2" />
            Record a Training
          </Button>
        </div>
      </div>

      {/* Training Form */}
      {showTrainingForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTraining ? "Edit" : "Add"} Training</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrainingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Training Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTraining?.name || ""}
                    required
                    data-testid="input-training-name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingTraining?.category || ""}>
                    <SelectTrigger data-testid="select-training-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="BambooHR Product Training">BambooHR Product Training</SelectItem>
                      <SelectItem value="Quarterly Training">Quarterly Training</SelectItem>
                      <SelectItem value="Required Annual Trainings">Required Annual Trainings</SelectItem>
                      <SelectItem value="COVID-19">COVID-19</SelectItem>
                      <SelectItem value="Safety Training">Safety Training</SelectItem>
                      <SelectItem value="Compliance Training">Compliance Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingTraining?.status || "Pending"}>
                    <SelectTrigger data-testid="select-training-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={editingTraining?.dueDate || ""}
                    data-testid="input-due-date"
                  />
                </div>
                <div>
                  <Label htmlFor="completedDate">Completed Date</Label>
                  <Input
                    id="completedDate"
                    name="completedDate"
                    type="date"
                    defaultValue={editingTraining?.completedDate || ""}
                    data-testid="input-completed-date"
                  />
                </div>
                <div>
                  <Label htmlFor="credits">Credits/Hours</Label>
                  <Input
                    id="credits"
                    name="credits"
                    type="number"
                    step="0.1"
                    defaultValue={editingTraining?.credits || ""}
                    data-testid="input-credits"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  data-testid="button-save-training"
                  disabled={createTrainingMutation.isPending || updateTrainingMutation.isPending}
                >
                  {(createTrainingMutation.isPending || updateTrainingMutation.isPending)
                    ? "Saving..."
                    : editingTraining
                    ? "Update"
                    : "Add"}{" "}
                  Training
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTrainingForm(false);
                    setEditingTraining(null);
                  }}
                  data-testid="button-cancel-training"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Training Categories */}
      {Object.entries(groupedPendingTraining).map(([category, trainings]) => (
        <Card key={`pending-${category}`}>
          <CardHeader>
            <CardTitle className="text-primary">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  data-testid={`training-item-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={training.status === "Completed"}
                      onCheckedChange={() => markAsCompleted(training)}
                      data-testid={`checkbox-training-${training.id}`}
                    />
                    <div>
                      <h4 className="font-medium text-primary hover:text-primary/80 cursor-pointer">
                        {training.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {training.dueDate ? `Due ${new Date(training.dueDate).toLocaleDateString()}` : "No due date"}
                      </p>
                      {training.credits && <p className="text-sm text-gray-500">Credits: {training.credits}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => handleEdit(training)}
                      data-testid={`edit-training-${training.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(training.id)}
                      data-testid={`delete-training-${training.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-800 border-green-300"
                      onClick={() => markAsCompleted(training)}
                      data-testid={`complete-training-${training.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Completed Training */}
      {Object.keys(groupedCompletedTraining).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary">Completed Training</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy} data-testid="select-sort">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-recent">Most Recent</SelectItem>
                    <SelectItem value="oldest-first">Oldest First</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter} data-testid="select-year-filter">
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedCompletedTraining).map(([category, trainings]) => (
                <div key={`completed-${category}`} className="space-y-3">
                  {category !== "General" && (
                    <h3 className="font-medium text-gray-700 text-primary">{category}</h3>
                  )}
                  {trainings.map((training) => (
                    <div
                      key={training.id}
                      className="flex items-center justify-between p-3 border-b border-gray-100"
                      data-testid={`completed-training-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div>
                        <h4 className="font-medium text-primary">{training.name}</h4>
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>
                            Completed{" "}
                            {training.completedDate
                              ? new Date(training.completedDate).toLocaleDateString()
                              : "Date not specified"}
                          </span>
                          {training.credits && <span>Credits: {training.credits}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => handleEdit(training)}
                          data-testid={`edit-completed-training-${training.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(training.id)}
                          data-testid={`delete-completed-training-${training.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {totalCompleted} Trainings Completed • Hours: {totalHours.toFixed(2)} • Credits: {totalCredits.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {training.length === 0 && !isLoading && !isError && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Records Found</h3>
            <p className="text-gray-500 mb-4">
              Employee ID: {employeeId} - Check console for debugging info.
            </p>
            <Button onClick={() => setShowTrainingForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Training
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}