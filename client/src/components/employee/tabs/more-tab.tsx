import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StickyNote, PhoneCall, UserPlus, UserMinus, Plus, Edit, Trash2 } from "lucide-react";
import type { Note, EmergencyContact, Onboarding, Offboarding, InsertNote, InsertEmergencyContact, InsertOnboarding, InsertOffboarding } from "@shared/schema";

interface MoreTabProps {
  employeeId: string;
}

export default function MoreTab({ employeeId }: MoreTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [showOffboardingForm, setShowOffboardingForm] = useState(false);

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/employees", employeeId, "notes"],
  });

  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/employees", employeeId, "emergency-contacts"],
  });

  const { data: onboarding = [] } = useQuery<Onboarding[]>({
    queryKey: ["/api/employees", employeeId, "onboarding"],
  });

  const { data: offboarding = [] } = useQuery<Offboarding[]>({
    queryKey: ["/api/employees", employeeId, "offboarding"],
  });

  // Notes mutations
  const createNoteMutation = useMutation({
    mutationFn: async (data: InsertNote) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      setShowNoteForm(false);
      toast({ title: "Success", description: "Note added successfully" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      toast({ title: "Success", description: "Note deleted successfully" });
    },
  });

  // Emergency contacts mutations
  const createEmergencyContactMutation = useMutation({
    mutationFn: async (data: InsertEmergencyContact) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/emergency-contacts`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "emergency-contacts"] });
      setShowEmergencyForm(false);
      toast({ title: "Success", description: "Emergency contact added successfully" });
    },
  });

  const deleteEmergencyContactMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/emergency-contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "emergency-contacts"] });
      toast({ title: "Success", description: "Emergency contact deleted successfully" });
    },
  });

  // Onboarding mutations
  const createOnboardingMutation = useMutation({
    mutationFn: async (data: InsertOnboarding) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/onboarding`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      setShowOnboardingForm(false);
      toast({ title: "Success", description: "Onboarding item added successfully" });
    },
  });

  const deleteOnboardingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/onboarding/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "onboarding"] });
      toast({ title: "Success", description: "Onboarding item deleted successfully" });
    },
  });

  // Offboarding mutations
  const createOffboardingMutation = useMutation({
    mutationFn: async (data: InsertOffboarding) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/offboarding`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "offboarding"] });
      setShowOffboardingForm(false);
      toast({ title: "Success", description: "Offboarding item added successfully" });
    },
  });

  const deleteOffboardingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/offboarding/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "offboarding"] });
      toast({ title: "Success", description: "Offboarding item deleted successfully" });
    },
  });

  const handleNoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createNoteMutation.mutate({
      employeeId,
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      createdBy: "Current User",
      createdAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleEmergencyContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createEmergencyContactMutation.mutate({
      employeeId,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      relationship: formData.get("relationship") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
    });
  };

  const handleOnboardingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createOnboardingMutation.mutate({
      employeeId,
      task: formData.get("task") as string,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate") as string,
      status: "Pending",
      completedDate: "",
    });
  };

  const handleOffboardingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createOffboardingMutation.mutate({
      employeeId,
      task: formData.get("task") as string,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate") as string,
      status: "Pending",
      completedDate: "",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <StickyNote className="h-5 w-5 mr-2 text-primary" />
                Notes
              </CardTitle>
              <Button onClick={() => setShowNoteForm(true)} size="sm" data-testid="button-add-note">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNoteForm && (
              <form onSubmit={handleNoteSubmit} className="mb-4 space-y-4">
                <div>
                  <Label htmlFor="noteTitle">Title</Label>
                  <Input
                    id="noteTitle"
                    name="title"
                    placeholder="Note title"
                    required
                    data-testid="input-note-title"
                  />
                </div>
                <div>
                  <Label htmlFor="noteContent">Content</Label>
                  <Textarea
                    id="noteContent"
                    name="content"
                    placeholder="Add your note here..."
                    required
                    data-testid="textarea-note-content"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" data-testid="button-save-note">
                    Save Note
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNoteForm(false)}
                    data-testid="button-cancel-note"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notes available</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 border rounded-lg" data-testid={`note-${note.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{note.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`delete-note-${note.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                    <div className="text-xs text-gray-500">
                      Added on {note.createdAt} by {note.createdBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <PhoneCall className="h-5 w-5 mr-2 text-red-600" />
                Emergency Contacts
              </CardTitle>
              <Button onClick={() => setShowEmergencyForm(true)} size="sm" data-testid="button-add-emergency">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showEmergencyForm && (
              <form onSubmit={handleEmergencyContactSubmit} className="mb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyFirstName">First Name</Label>
                    <Input
                      id="emergencyFirstName"
                      name="firstName"
                      required
                      data-testid="input-emergency-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyLastName">Last Name</Label>
                    <Input
                      id="emergencyLastName"
                      name="lastName"
                      required
                      data-testid="input-emergency-last-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Phone</Label>
                    <Input
                      id="emergencyPhone"
                      name="phone"
                      type="tel"
                      required
                      data-testid="input-emergency-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Select name="relationship" required>
                      <SelectTrigger data-testid="select-emergency-relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyEmail">Email</Label>
                  <Input
                    id="emergencyEmail"
                    name="email"
                    type="email"
                    data-testid="input-emergency-email"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyAddress">Address</Label>
                  <Input
                    id="emergencyAddress"
                    name="address"
                    data-testid="input-emergency-address"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" data-testid="button-save-emergency">
                    Save Contact
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmergencyForm(false)}
                    data-testid="button-cancel-emergency"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {emergencyContacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No emergency contacts available</p>
              ) : (
                emergencyContacts.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg" data-testid={`emergency-contact-${contact.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        {contact.email && <p className="text-sm text-gray-500">{contact.email}</p>}
                        {contact.address && <p className="text-sm text-gray-500">{contact.address}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEmergencyContactMutation.mutate(contact.id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`delete-emergency-${contact.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                Onboarding
              </CardTitle>
              <Button onClick={() => setShowOnboardingForm(true)} size="sm" data-testid="button-add-onboarding">
                <Plus className="h-4 w-4 mr-2" />
                Add Information
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showOnboardingForm && (
              <form onSubmit={handleOnboardingSubmit} className="mb-4 space-y-4">
                <div>
                  <Label htmlFor="onboardingTask">Task</Label>
                  <Input
                    id="onboardingTask"
                    name="task"
                    placeholder="Onboarding task"
                    required
                    data-testid="input-onboarding-task"
                  />
                </div>
                <div>
                  <Label htmlFor="onboardingDueDate">Due Date</Label>
                  <Input
                    id="onboardingDueDate"
                    name="dueDate"
                    type="date"
                    data-testid="input-onboarding-due-date"
                  />
                </div>
                <div>
                  <Label htmlFor="onboardingDescription">Description</Label>
                  <Textarea
                    id="onboardingDescription"
                    name="description"
                    placeholder="Description"
                    data-testid="textarea-onboarding-description"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" data-testid="button-save-onboarding">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOnboardingForm(false)}
                    data-testid="button-cancel-onboarding"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {onboarding.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No onboarding information available</p>
              ) : (
                onboarding.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg" data-testid={`onboarding-${item.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.task}</p>
                        {item.dueDate && (
                          <p className="text-sm text-gray-600">Due: {item.dueDate}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOnboardingMutation.mutate(item.id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`delete-onboarding-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offboarding */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <UserMinus className="h-5 w-5 mr-2 text-orange-600" />
                Offboarding
              </CardTitle>
              <Button onClick={() => setShowOffboardingForm(true)} size="sm" data-testid="button-add-offboarding">
                <Plus className="h-4 w-4 mr-2" />
                Add Information
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showOffboardingForm && (
              <form onSubmit={handleOffboardingSubmit} className="mb-4 space-y-4">
                <div>
                  <Label htmlFor="offboardingTask">Task</Label>
                  <Input
                    id="offboardingTask"
                    name="task"
                    placeholder="Offboarding task"
                    required
                    data-testid="input-offboarding-task"
                  />
                </div>
                <div>
                  <Label htmlFor="offboardingDueDate">Due Date</Label>
                  <Input
                    id="offboardingDueDate"
                    name="dueDate"
                    type="date"
                    data-testid="input-offboarding-due-date"
                  />
                </div>
                <div>
                  <Label htmlFor="offboardingDescription">Description</Label>
                  <Textarea
                    id="offboardingDescription"
                    name="description"
                    placeholder="Description"
                    data-testid="textarea-offboarding-description"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" data-testid="button-save-offboarding">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOffboardingForm(false)}
                    data-testid="button-cancel-offboarding"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {offboarding.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No offboarding information available</p>
              ) : (
                offboarding.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg" data-testid={`offboarding-${item.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.task}</p>
                        {item.dueDate && (
                          <p className="text-sm text-gray-600">Due: {item.dueDate}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOffboardingMutation.mutate(item.id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`delete-offboarding-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
