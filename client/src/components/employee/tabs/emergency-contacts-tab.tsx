import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, Users, Trash2, Phone, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  employeeId: string;
}

interface EmergencyContactsTabProps {
  employeeId: string;
}

export default function EmergencyContactsTab({ employeeId }: EmergencyContactsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactData, setContactData] = useState({
    name: "",
    relationship: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    address: "",
  });

  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/employees", employeeId, "emergency-contacts"],
    queryFn: async () => {
      // Mock data for now
      return [];
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: Omit<EmergencyContact, "id" | "employeeId">) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/emergency-contacts`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "emergency-contacts"] });
      setShowContactForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Emergency contact added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add emergency contact",
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: { id: string } & Omit<EmergencyContact, "id" | "employeeId">) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}/emergency-contacts/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "emergency-contacts"] });
      setEditingContact(null);
      setShowContactForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Emergency contact updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update emergency contact",
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await apiRequest("DELETE", `/api/employees/${employeeId}/emergency-contacts/${contactId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "emergency-contacts"] });
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete emergency contact",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setContactData({
      name: "",
      relationship: "",
      primaryPhone: "",
      secondaryPhone: "",
      email: "",
      address: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.name.trim() || !contactData.relationship.trim() || !contactData.primaryPhone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in required fields (name, relationship, and primary phone)",
        variant: "destructive",
      });
      return;
    }

    if (editingContact) {
      updateContactMutation.mutate({
        id: editingContact.id,
        ...contactData,
      });
    } else {
      addContactMutation.mutate(contactData);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactData({
      name: contact.name,
      relationship: contact.relationship,
      primaryPhone: contact.primaryPhone,
      secondaryPhone: contact.secondaryPhone || "",
      email: contact.email || "",
      address: contact.address || "",
    });
    setShowContactForm(true);
  };

  const handleCancel = () => {
    setShowContactForm(false);
    setEditingContact(null);
    resetForm();
  };

  const relationshipOptions = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Partner",
    "Friend",
    "Relative",
    "Other",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Emergency Contacts</h2>
        <Button onClick={() => setShowContactForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {showContactForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select value={contactData.relationship} onValueChange={(value) => setContactData({ ...contactData, relationship: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="primaryPhone">Primary Phone *</Label>
                  <Input
                    id="primaryPhone"
                    type="tel"
                    value={contactData.primaryPhone}
                    onChange={(e) => setContactData({ ...contactData, primaryPhone: e.target.value })}
                    placeholder="Enter primary phone"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                  <Input
                    id="secondaryPhone"
                    type="tel"
                    value={contactData.secondaryPhone}
                    onChange={(e) => setContactData({ ...contactData, secondaryPhone: e.target.value })}
                    placeholder="Enter secondary phone"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={contactData.address}
                    onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addContactMutation.isPending || updateContactMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingContact ? "Update" : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No emergency contacts found</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContactMutation.mutate(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.primaryPhone}</span>
                    <span className="text-muted-foreground">(Primary)</span>
                  </div>
                  {contact.secondaryPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.secondaryPhone}</span>
                      <span className="text-muted-foreground">(Secondary)</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="text-sm text-muted-foreground">
                      {contact.address}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
