import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Plus, Edit, Trash2 } from "lucide-react";
import type { Training, InsertTraining } from "@shared/schema";

interface TrainingTabProps {
  employeeId: string;
}

export default function TrainingTab({ employeeId }: TrainingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  const { data: training = [] } = useQuery<Training[]>({
    queryKey: ["/api/employees", employeeId, "training"],
  });

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
    onError: () => {
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
      toast({ title: "Success", description: "Training updated successfully" });
    },
    onError: () => {
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
  });

  const handleTrainingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const trainingData = {
      employeeId,
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
      dueDate: formData.get("dueDate") as string,
      completedDate: formData.get("completedDate") as string,
      credits: formData.get("credits") as string,
    };

    if (editingTraining) {
      updateTrainingMutation.mutate({ id: editingTraining.id, data: trainingData });
    } else {
      createTrainingMutation.mutate(trainingData);
    }
  };

  const markAsCompleted = (training: Training) => {
    updateTrainingMutation.mutate({
      id: training.id,
      data: {
        status: "Completed",
        completedDate: new Date().toISOString().split('T')[0],
      },
    });
  };

  const upcomingTraining = training.filter(t => t.status === "Upcoming" || t.status === "Pending");
  const completedTraining = training.filter(t => t.status === "Completed");

  const trainingCategories = [
    {
      name: "Upcoming Training",
      items: [
        { name: "Unlawful Harassment", dueDate: "Dec 2, 2025", status: "Pending" },
      ],
    },
    {
      name: "BambooHR Product Training",
      items: [
        { name: "BambooHR Advantage Package Demo Video", dueDate: "No due date", status: "Pending" },
        { name: "Quarterly Security Training", dueDate: "Nov 18, 2025", status: "Pending" },
      ],
    },
    {
      name: "Quarterly Training",
      items: [
        { name: "Sexual Harassment Training", dueDate: "Nov 10, 2022", status: "Pending" },
      ],
    },
    {
      name: "Required Annual Trainings",
      items: [
        { name: "Annual Security Training", dueDate: "No due date", status: "Pending" },
        { name: "HIPAA Training", dueDate: "No due date", status: "Pending" },
        { name: "OSHA Training", dueDate: "Oct 14, 2022", status: "Pending" },
      ],
    },
  ];

  const completedCategories = [
    {
      name: "General",
      items: [
        { name: "Unlawful Harassment", completedDate: "Dec 2, 2025" },
      ],
    },
    {
      name: "BambooHR Product Training",
      items: [
        { name: "Quarterly Security Training", completedDate: "Aug 19, 2025" },
        { name: "Getting Started in BambooHR", completedDate: "Aug 19, 2025" },
      ],
    },
    {
      name: "COVID-19",
      items: [
        { name: "Working from home during COVID-19", completedDate: "Aug 19, 2025" },
      ],
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2 text-primary" />
          Training
        </h1>
        <div className="flex items-center space-x-3">
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
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    name="credits"
                    defaultValue={editingTraining?.credits || ""}
                    data-testid="input-credits"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" data-testid="button-save-training">
                  {editingTraining ? "Update" : "Add"} Training
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

      {/* Training Categories */}
      {trainingCategories.map((category) => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle className="text-primary">{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  data-testid={`training-item-${category.name.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox />
                    <div>
                      <h4 className="font-medium text-primary hover:text-primary/80 cursor-pointer">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Due {item.dueDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Completed Training */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">Completed Training</CardTitle>
            <div className="flex items-center space-x-2">
              <Select defaultValue="most-recent">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-recent">Most Recent</SelectItem>
                  <SelectItem value="oldest-first">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="2025">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedCategories.map((category) => (
              <div key={category.name} className="space-y-3">
                {category.name !== "General" && (
                  <h3 className="font-medium text-gray-700 text-primary">{category.name}</h3>
                )}
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b border-gray-100"
                    data-testid={`completed-training-${category.name.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                  >
                    <div>
                      <h4 className="font-medium text-primary">{item.name}</h4>
                      <p className="text-sm text-gray-500">Completed {item.completedDate}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                4 Trainings Completed • Hours: 1.00 • Credits: 3.00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
