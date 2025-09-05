import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, Users, Trash2, Phone, Mail, Edit, Search, User, MapPin, AlertCircle } from "lucide-react";

interface EmergencyContact {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  employeeId: string;
}

interface EmergencyContactsTabProps {
  employeeId: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const relationshipOptions = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling", 
  "Grandparent",
  "Friend",
  "Guardian",
  "Other Family",
  "Partner",
  "Relative"
];

// Enhanced validation functions
const validateText = (text: string, minLength?: number, maxLength?: number): { isValid: boolean; error?: string } => {
  if (!text) return { isValid: true };
  
  const trimmedText = text.trim();
  
  // Check for valid name characters (letters, spaces, hyphens, apostrophes, dots, commas)
  if (!/^[a-zA-Z\s\-'.,&]+$/.test(trimmedText)) {
    return { isValid: false, error: "Please enter valid text (letters, spaces, and common punctuation only)" };
  }
  
  if (minLength && trimmedText.length < minLength) {
    return { isValid: false, error: `Must be at least ${minLength} characters long` };
  }
  
  if (maxLength && trimmedText.length > maxLength) {
    return { isValid: false, error: `Cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) return { isValid: true };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: "Email address is too long" };
  }
  
  return { isValid: true };
};

const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) return { isValid: true };
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    return { isValid: false, error: "Phone number must be at least 10 digits" };
  }
  
  if (cleanPhone.length > 15) {
    return { isValid: false, error: "Phone number cannot exceed 15 digits" };
  }
  
  return { isValid: true };
};

const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address) return { isValid: true };
  
  const trimmedAddress = address.trim();
  
  // Allow letters, numbers, spaces, and common address punctuation
  if (!/^[a-zA-Z0-9\s\-'.,#\/]+$/.test(trimmedAddress)) {
    return { isValid: false, error: "Please enter a valid address" };
  }
  
  if (trimmedAddress.length < 5) {
    return { isValid: false, error: "Address must be at least 5 characters long" };
  }
  
  if (trimmedAddress.length > 200) {
    return { isValid: false, error: "Address cannot exceed 200 characters" };
  }
  
  return { isValid: true };
};

// Enhanced formatters
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  
  // Limit to 15 digits (international format)
  const limitedValue = cleanValue.substring(0, 15);
  
  // Format based on length
  if (limitedValue.length <= 3) return limitedValue;
  if (limitedValue.length <= 6) return `(${limitedValue.slice(0, 3)}) ${limitedValue.slice(3)}`;
  if (limitedValue.length <= 10) return `(${limitedValue.slice(0, 3)}) ${limitedValue.slice(3, 6)}-${limitedValue.slice(6)}`;
  
  // For numbers longer than 10 digits, assume international format
  return `+${limitedValue.slice(0, -10)} (${limitedValue.slice(-10, -7)}) ${limitedValue.slice(-7, -4)}-${limitedValue.slice(-4)}`;
};

const formatName = (value: string): string => {
  // Remove invalid characters and limit length
  const cleanValue = value.replace(/[^a-zA-Z\s\-'.,&]/g, '').substring(0, 50);
  return cleanValue;
};

export default function EmergencyContactsTab({ employeeId }: EmergencyContactsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  });

  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/employees", employeeId, "emergency-contacts"],
    queryFn: async () => {
      console.log(`Fetching emergency contacts for employee: ${employeeId}`);
      const response = await apiRequest("GET", `/api/employees/${employeeId}/emergency-contacts`);
      return response as EmergencyContact[];
    },
  });

  // Enhanced form validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // First Name validation
    if (!contactData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else {
      const firstNameValidation = validateText(contactData.firstName, 1, 50);
      if (!firstNameValidation.isValid) {
        errors.firstName = firstNameValidation.error!;
      }
    }

    // Last Name validation
    if (!contactData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else {
      const lastNameValidation = validateText(contactData.lastName, 1, 50);
      if (!lastNameValidation.isValid) {
        errors.lastName = lastNameValidation.error!;
      }
    }

    // Relationship validation
    if (!contactData.relationship.trim()) {
      errors.relationship = "Relationship is required";
    }

    // Phone validation
    if (!contactData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const phoneValidation = validatePhoneNumber(contactData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error!;
      }
    }

    // Email validation (optional)
    if (contactData.email.trim()) {
      const emailValidation = validateEmail(contactData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error!;
      }
    }

    // Address validation (optional)
    if (contactData.address.trim()) {
      const addressValidation = validateAddress(contactData.address);
      if (!addressValidation.isValid) {
        errors.address = addressValidation.error!;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input change handler with real-time validation clearing
  const handleInputChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
    
    // Clear the specific field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addContactMutation = useMutation({
    mutationFn: async (data: Omit<EmergencyContact, "id" | "employeeId">) => {
      console.log("Adding emergency contact:", data);
      const response = await apiRequest("POST", `/api/employees/${employeeId}/emergency-contacts`, data);
      return response;
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
    onError: (error) => {
      console.error("Error adding emergency contact:", error);
      toast({
        title: "Error",
        description: "Failed to add emergency contact",
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: { id: string } & Omit<EmergencyContact, "id" | "employeeId">) => {
      console.log("Updating emergency contact:", data);
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/emergency-contacts/${id}`, updateData);
      return response;
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
    onError: (error) => {
      console.error("Error updating emergency contact:", error);
      toast({
        title: "Error",
        description: "Failed to update emergency contact",
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      console.log("Deleting emergency contact:", contactId);
      const response = await apiRequest("DELETE", `/api/emergency-contacts/${contactId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "emergency-contacts"] });
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting emergency contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete emergency contact",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setContactData({
      firstName: "",
      lastName: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
    });
    setValidationErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting",
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
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      relationship: contact.relationship || "",
      phone: contact.phone || "",
      email: contact.email || "",
      address: contact.address || "",
    });
    setValidationErrors({});
    setShowContactForm(true);
  };

  const handleCancel = () => {
    setShowContactForm(false);
    setEditingContact(null);
    resetForm();
  };

  const handleDelete = (contactId: string) => {
    deleteContactMutation.mutate(contactId);
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.relationship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Users className="h-6 w-6 mr-2 text-primary" />
          Emergency Contacts ({filteredContacts.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button onClick={() => setShowContactForm(true)} className="flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={contactData.firstName}
                  onChange={(e) => handleInputChange('firstName', formatName(e.target.value))}
                  placeholder="Enter first name"
                  className="mt-1"
                  maxLength={50}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={contactData.lastName}
                  onChange={(e) => handleInputChange('lastName', formatName(e.target.value))}
                  placeholder="Enter last name"
                  className="mt-1"
                  maxLength={50}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select 
                  value={contactData.relationship} 
                  onValueChange={(value) => handleInputChange('relationship', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.relationship && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.relationship}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={contactData.phone}
                  onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
                {validationErrors.phone && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@email.com"
                  className="mt-1"
                  maxLength={254}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={contactData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  className="mt-1"
                  maxLength={200}
                />
                {validationErrors.address && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={addContactMutation.isPending || updateContactMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {addContactMutation.isPending || updateContactMutation.isPending
                  ? "Saving..."
                  : editingContact 
                    ? "Update Contact" 
                    : "Save Contact"
                }
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm ? "No emergency contacts found matching your search" : "No emergency contacts found"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Add emergency contacts to ensure we can reach someone in case of an emergency"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowContactForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Contact
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {contact.firstName} {contact.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contact.relationship}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(contact)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(contact.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                        disabled={deleteContactMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {formatPhone(contact.phone)}
                    </a>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{contact.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}