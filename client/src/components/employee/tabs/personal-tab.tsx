import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { User, MapPin, Phone, Link, GraduationCap, FileText, Plus, Save, AlertCircle } from "lucide-react";
import type { Employee, Education, InsertEducation } from "@shared/schema";

interface PersonalTabProps {
  employeeId: string;
}

// Enhanced validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

const validateZipCode = (zipCode: string): boolean => {
  // US ZIP code format: 12345 or 12345-6789
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

const validateSSN = (ssn: string): boolean => {
  // SSN format: XXX-XX-XXXX
  const ssnDigits = ssn.replace(/\D/g, '');
  return ssnDigits.length === 9;
};

const validateURL = (url: string): boolean => {
  if (!url) return true; // Empty URL is valid
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

// Input formatting functions
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const formatSSN = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
};

const formatZipCode = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
};

interface ValidationErrors {
  [key: string]: string;
}

export default function PersonalTab({ employeeId }: PersonalTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [originalData, setOriginalData] = useState<Partial<Employee>>({});

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", employeeId],
  });

  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ["/api/employees", employeeId, "education"],
  });

  // Initialize form data when employee data loads
  useEffect(() => {
    if (employee) {
      const clonedData = JSON.parse(JSON.stringify(employee));
      setFormData(clonedData);
      // Create a separate deep copy for originalData to prevent reference sharing
      setOriginalData(JSON.parse(JSON.stringify(employee)));
      setHasChanges(false);
      setValidationErrors({});
    }
  }, [employee]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: Partial<Employee>) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}`, data);
      return response;
    },
    onSuccess: (updatedEmployee) => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId] });
      setFormData(updatedEmployee);
      setOriginalData(JSON.parse(JSON.stringify(updatedEmployee)));
      setHasChanges(false);
      setValidationErrors({});
      toast({ title: "Success", description: "Employee information updated successfully" });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({ title: "Error", description: "Failed to update employee information", variant: "destructive" });
    },
  });

  const createEducationMutation = useMutation({
    mutationFn: async (data: InsertEducation) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/education`, data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      setShowEducationForm(false);
      setEditingEducation(null);
      toast({ title: "Success", description: "Education added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add education", variant: "destructive" });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Education> }) => {
      const response = await apiRequest("PATCH", `/api/education/${id}`, data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      await queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      setEditingEducation(null);
      setShowEducationForm(false);
      toast({ title: "Success", description: "Education updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update education", variant: "destructive" });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/education/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      toast({ title: "Success", description: "Education deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete education", variant: "destructive" });
    },
  });

  // Helper function to normalize data for comparison
  const normalizeData = (data: any): any => {
    if (data === null || data === undefined) return null;
    if (typeof data === 'string') return data.trim() || '';
    if (typeof data === 'object' && !Array.isArray(data)) {
      const normalized: any = {};
      for (const key in data) {
        normalized[key] = normalizeData(data[key]);
      }
      return normalized;
    }
    return data;
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!formData) {
      return;
    }

    const updatedFormData = { ...formData };
    
    if (field.startsWith("profileData.")) {
      const path = field.split(".");
      
      // Initialize nested objects if they don't exist
      if (!updatedFormData.profileData) {
        updatedFormData.profileData = { personal: {}, address: {}, contact: {}, social: {}, visa: {} };
      }
      
      const section = path[1];
      const property = path[2];
      
      if (!updatedFormData.profileData[section as keyof typeof updatedFormData.profileData]) {
        (updatedFormData.profileData as any)[section] = {};
      }
      
      (updatedFormData.profileData as any)[section][property] = value;
    } else {
      (updatedFormData as any)[field] = value;
    }

    setFormData(updatedFormData);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
    
    // Check if data has changed from original using normalized comparison
    const normalizedUpdated = normalizeData(updatedFormData);
    const normalizedOriginal = normalizeData(originalData);
    const hasDataChanged = JSON.stringify(normalizedUpdated) !== JSON.stringify(normalizedOriginal);
    
    setHasChanges(hasDataChanged);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Required field validations
    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      errors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      errors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Optional field validations (only validate if not empty)
    const phoneFields = [
      { key: "profileData.contact.workPhone", label: "work phone" },
      { key: "profileData.contact.mobilePhone", label: "mobile phone" },
      { key: "profileData.contact.homePhone", label: "home phone" }
    ];

    phoneFields.forEach(({ key, label }) => {
      const value = key.split('.').reduce((obj: any, prop) => obj?.[prop], formData) as string;
      if (value && !validatePhone(value)) {
        errors[key] = `Please enter a valid ${label} number`;
      }
    });

    if (formData.profileData?.contact?.personalEmail && !validateEmail(formData.profileData.contact.personalEmail)) {
      errors["profileData.contact.personalEmail"] = "Please enter a valid personal email address";
    }

    if (formData.profileData?.address?.zipCode && !validateZipCode(formData.profileData.address.zipCode)) {
      errors["profileData.address.zipCode"] = "Please enter a valid ZIP code (12345 or 12345-6789)";
    }

    if (formData.profileData?.personal?.ssn && !validateSSN(formData.profileData.personal.ssn)) {
      errors["profileData.personal.ssn"] = "Please enter a valid SSN (XXX-XX-XXXX)";
    }

    const urlFields = [
      { key: "profileData.social.linkedin", label: "LinkedIn URL" },
      { key: "profileData.social.twitter", label: "Twitter URL" },
      { key: "profileData.social.website", label: "Website URL" }
    ];

    urlFields.forEach(({ key, label }) => {
      const value = key.split('.').reduce((obj: any, prop) => obj?.[prop], formData) as string;
      if (value && !validateURL(value)) {
        errors[key] = `Please enter a valid ${label}`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = () => {
    if (!validateForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the validation errors before saving", 
        variant: "destructive" 
      });
      return;
    }
    updateEmployeeMutation.mutate(formData);
  };

  const handleDiscardChanges = () => {
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData)));
      setHasChanges(false);
      setValidationErrors({});
    }
  };

  const handleEducationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataElement = new FormData(e.currentTarget);
    
    const educationData = {
      employeeId,
      institution: formDataElement.get("institution") as string,
      degree: formDataElement.get("degree") as string,
      fieldOfStudy: formDataElement.get("fieldOfStudy") as string,
      startDate: formDataElement.get("startDate") as string,
      endDate: formDataElement.get("endDate") as string,
      description: formDataElement.get("description") as string,
    };

    // Validate required fields
    if (!educationData.institution.trim()) {
      toast({ title: "Error", description: "Institution is required", variant: "destructive" });
      return;
    }

    if (editingEducation) {
      updateEducationMutation.mutate({ id: editingEducation.id, data: educationData });
    } else {
      createEducationMutation.mutate(educationData);
    }
  };

  const educationColumns = [
    { key: "institution" as keyof Education, header: "Institution" },
    { key: "degree" as keyof Education, header: "Degree" },
    { key: "fieldOfStudy" as keyof Education, header: "Field of Study" },
    { key: "startDate" as keyof Education, header: "Start Date" },
    { key: "endDate" as keyof Education, header: "End Date" },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!employee || !formData) {
    return <div className="flex justify-center items-center h-64">Employee not found</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="firstName" className="flex items-center">
                First Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => {
                  // Only allow letters, spaces, hyphens, and apostrophes
                  const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                  handleFieldChange("firstName", value);
                }}
                data-testid="input-firstName"
                className={validationErrors.firstName ? "border-red-500" : ""}
                required
                maxLength={50}
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="flex items-center">
                Last Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) => {
                  // Only allow letters, spaces, hyphens, and apostrophes
                  const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                  handleFieldChange("lastName", value);
                }}
                data-testid="input-lastName"
                className={validationErrors.lastName ? "border-red-500" : ""}
                required
                maxLength={50}
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.lastName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={formData.profileData?.personal?.preferredName || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                  handleFieldChange("profileData.personal.preferredName", value);
                }}
                data-testid="input-preferredName"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center">
                Email <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleFieldChange("email", e.target.value.toLowerCase())}
                data-testid="input-email"
                className={validationErrors.email ? "border-red-500" : ""}
                required
                maxLength={100}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.profileData?.personal?.gender || ""}
                onValueChange={(value) => handleFieldChange("profileData.personal.gender", value)}
              >
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.profileData?.personal?.dateOfBirth || ""}
                onChange={(e) => handleFieldChange("profileData.personal.dateOfBirth", e.target.value)}
                data-testid="input-dateOfBirth"
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
            </div>
            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                value={formData.profileData?.personal?.maritalStatus || ""}
                onValueChange={(value) => handleFieldChange("profileData.personal.maritalStatus", value)}
              >
                <SelectTrigger data-testid="select-maritalStatus">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                  <SelectItem value="Separated">Separated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ssn">Social Security Number</Label>
              <Input
                id="ssn"
                placeholder="XXX-XX-XXXX"
                value={formData.profileData?.personal?.ssn || ""}
                onChange={(e) => {
                  const formatted = formatSSN(e.target.value);
                  handleFieldChange("profileData.personal.ssn", formatted);
                }}
                data-testid="input-ssn"
                className={validationErrors["profileData.personal.ssn"] ? "border-red-500" : ""}
                maxLength={11}
              />
              {validationErrors["profileData.personal.ssn"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.personal.ssn"]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.profileData?.address?.street || ""}
                onChange={(e) => handleFieldChange("profileData.address.street", e.target.value)}
                data-testid="input-street"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.profileData?.address?.city || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                  handleFieldChange("profileData.address.city", value);
                }}
                data-testid="input-city"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.profileData?.address?.state || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  handleFieldChange("profileData.address.state", value);
                }}
                data-testid="input-state"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="12345 or 12345-6789"
                value={formData.profileData?.address?.zipCode || ""}
                onChange={(e) => {
                  const formatted = formatZipCode(e.target.value);
                  handleFieldChange("profileData.address.zipCode", formatted);
                }}
                data-testid="input-zipCode"
                className={validationErrors["profileData.address.zipCode"] ? "border-red-500" : ""}
                maxLength={10}
              />
              {validationErrors["profileData.address.zipCode"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.address.zipCode"]}
                </p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.profileData?.address?.country || ""}
                onValueChange={(value) => handleFieldChange("profileData.address.country", value)}
              >
                <SelectTrigger data-testid="select-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="workPhone">Work Phone</Label>
              <Input
                id="workPhone"
                type="tel"
                placeholder="(123) 456-7890"
                value={formData.profileData?.contact?.workPhone || formData.phone || ""}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  handleFieldChange("profileData.contact.workPhone", formatted);
                }}
                data-testid="input-workPhone"
                className={validationErrors["profileData.contact.workPhone"] ? "border-red-500" : ""}
                maxLength={14}
              />
              {validationErrors["profileData.contact.workPhone"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.contact.workPhone"]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="mobilePhone">Mobile Phone</Label>
              <Input
                id="mobilePhone"
                type="tel"
                placeholder="(123) 456-7890"
                value={formData.profileData?.contact?.mobilePhone || ""}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  handleFieldChange("profileData.contact.mobilePhone", formatted);
                }}
                data-testid="input-mobilePhone"
                className={validationErrors["profileData.contact.mobilePhone"] ? "border-red-500" : ""}
                maxLength={14}
              />
              {validationErrors["profileData.contact.mobilePhone"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.contact.mobilePhone"]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="homePhone">Home Phone</Label>
              <Input
                id="homePhone"
                type="tel"
                placeholder="(123) 456-7890"
                value={formData.profileData?.contact?.homePhone || ""}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  handleFieldChange("profileData.contact.homePhone", formatted);
                }}
                data-testid="input-homePhone"
                className={validationErrors["profileData.contact.homePhone"] ? "border-red-500" : ""}
                maxLength={14}
              />
              {validationErrors["profileData.contact.homePhone"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.contact.homePhone"]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="personalEmail">Personal Email</Label>
              <Input
                id="personalEmail"
                type="email"
                placeholder="personal@example.com"
                value={formData.profileData?.contact?.personalEmail || ""}
                onChange={(e) => handleFieldChange("profileData.contact.personalEmail", e.target.value.toLowerCase())}
                data-testid="input-personalEmail"
                className={validationErrors["profileData.contact.personalEmail"] ? "border-red-500" : ""}
                maxLength={100}
              />
              {validationErrors["profileData.contact.personalEmail"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.contact.personalEmail"]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2 text-primary" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.profileData?.social?.linkedin || ""}
                onChange={(e) => handleFieldChange("profileData.social.linkedin", e.target.value)}
                data-testid="input-linkedin"
                className={validationErrors["profileData.social.linkedin"] ? "border-red-500" : ""}
                maxLength={200}
              />
              {validationErrors["profileData.social.linkedin"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.social.linkedin"]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="twitter">Twitter Profile</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/username"
                value={formData.profileData?.social?.twitter || ""}
                onChange={(e) => handleFieldChange("profileData.social.twitter", e.target.value)}
                data-testid="input-twitter"
                className={validationErrors["profileData.social.twitter"] ? "border-red-500" : ""}
                maxLength={200}
              />
              {validationErrors["profileData.social.twitter"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.social.twitter"]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="website">Personal Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                value={formData.profileData?.social?.website || ""}
                onChange={(e) => handleFieldChange("profileData.social.website", e.target.value)}
                data-testid="input-website"
                className={validationErrors["profileData.social.website"] ? "border-red-500" : ""}
                maxLength={200}
              />
              {validationErrors["profileData.social.website"] && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors["profileData.social.website"]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              Education
            </CardTitle>
            <Button
              onClick={() => {
                setShowEducationForm(true);
                setEditingEducation(null);
              }}
              size="sm"
              data-testid="button-add-education"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showEducationForm && (
            <form 
              key={editingEducation?.id || 'new'} 
              onSubmit={handleEducationSubmit} 
              className="mb-6 p-4 border rounded-lg space-y-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingEducation ? "Edit Education" : "Add New Education"}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEducationForm(false);
                    setEditingEducation(null);
                  }}
                  data-testid="button-close-education-form"
                >
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="institution" className="flex items-center">
                    Institution <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="institution"
                    name="institution"
                    defaultValue={editingEducation?.institution || ""}
                    required
                    data-testid="input-institution"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    name="degree"
                    defaultValue={editingEducation?.degree || ""}
                    data-testid="input-degree"
                    maxLength={100}
                    placeholder="e.g., Bachelor's, Master's, PhD"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    defaultValue={editingEducation?.fieldOfStudy || ""}
                    data-testid="input-fieldOfStudy"
                    maxLength={100}
                    placeholder="e.g., Computer Science, Business"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingEducation?.startDate || ""}
                    data-testid="input-startDate"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={editingEducation?.endDate || ""}
                    data-testid="input-endDate"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Additional information about your education (achievements, GPA, relevant coursework, etc.)"
                  defaultValue={editingEducation?.description || ""}
                  data-testid="textarea-description"
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEducationForm(false);
                    setEditingEducation(null);
                  }}
                  data-testid="button-cancel-education"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  data-testid="button-save-education"
                  disabled={createEducationMutation.isPending || updateEducationMutation.isPending}
                >
                  {createEducationMutation.isPending || updateEducationMutation.isPending 
                    ? "Saving..." 
                    : (editingEducation ? "Update Education" : "Add Education")
                  }
                </Button>
              </div>
            </form>
          )}

          <DataTable
            columns={educationColumns}
            data={education}
            onEdit={(item) => {
              setEditingEducation(item);
              setShowEducationForm(true);
            }}
            onDelete={(item) => deleteEducationMutation.mutate(item.id)}
            emptyMessage="No education information available. Click 'Add Education' to get started."
          />
        </CardContent>
      </Card>

      {/* Visa Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Visa & Work Authorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="visaType">Visa Type</Label>
              <Select
                value={formData.profileData?.visa?.type || ""}
                onValueChange={(value) => handleFieldChange("profileData.visa.type", value)}
              >
                <SelectTrigger data-testid="select-visaType">
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US Citizen">US Citizen</SelectItem>
                  <SelectItem value="Permanent Resident">Permanent Resident (Green Card)</SelectItem>
                  <SelectItem value="H1B">H1B</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="F1">F1 (Student)</SelectItem>
                  <SelectItem value="J1">J1 (Exchange Visitor)</SelectItem>
                  <SelectItem value="TN">TN (NAFTA)</SelectItem>
                  <SelectItem value="O1">O1 (Extraordinary Ability)</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visaStatus">Work Authorization Status</Label>
              <Select
                value={formData.profileData?.visa?.status || ""}
                onValueChange={(value) => handleFieldChange("profileData.visa.status", value)}
              >
                <SelectTrigger data-testid="select-visaStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Authorized">Authorized to Work</SelectItem>
                  <SelectItem value="Pending">Authorization Pending</SelectItem>
                  <SelectItem value="Expired">Authorization Expired</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visaExpiration">Authorization Expiration Date</Label>
              <Input
                id="visaExpiration"
                type="date"
                value={formData.profileData?.visa?.expiration || ""}
                onChange={(e) => handleFieldChange("profileData.visa.expiration", e.target.value)}
                data-testid="input-visaExpiration"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="sponsorshipRequired">Sponsorship Required</Label>
              <Select
                value={formData.profileData?.visa?.sponsorshipRequired ? "Yes" : "No"}
                onValueChange={(value) => handleFieldChange("profileData.visa.sponsorshipRequired", value === "Yes")}
              >
                <SelectTrigger data-testid="select-sponsorshipRequired">
                  <SelectValue placeholder="Select requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No Sponsorship Required</SelectItem>
                  <SelectItem value="Yes">Sponsorship Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save/Discard Changes - Desktop Floating Card */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50 hidden md:block">
          <Card className="backdrop-blur-xl bg-white/5 dark:bg-black/10 shadow-2xl rounded-2xl border-0">
            <CardContent className="pt-4 pb-4 px-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center text-sm text-gray-800 dark:text-amber-200 font-medium">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  You have unsaved changes
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleDiscardChanges}
                    variant="outline"
                    size="sm"
                    data-testid="button-discard-changes"
                    className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/70 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200"
                  >
                    Discard Changes
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    size="sm"
                    className="backdrop-blur-sm bg-green-500/90 hover:bg-green-600/90 dark:bg-green-600/90 dark:hover:bg-green-700/90 text-white border border-green-400/30 dark:border-green-500/30 shadow-lg shadow-green-500/25"
                    data-testid="button-save-changes"
                    disabled={updateEmployeeMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateEmployeeMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save/Discard Changes - Mobile Sticky Bottom */}
      {hasChanges && (
        <Card className="backdrop-blur-xl bg-white/8 dark:bg-black/15 shadow-2xl sticky bottom-0 z-40 md:hidden border-0">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <div className="text-sm text-gray-800 dark:text-amber-200 text-center flex items-center justify-center font-medium">
                <AlertCircle className="h-4 w-4 mr-2" />
                You have unsaved changes
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDiscardChanges}
                  variant="outline"
                  size="sm"
                  className="flex-1 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/70 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200"
                  data-testid="button-discard-changes-mobile"
                >
                  Discard Changes
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  size="sm"
                  className="flex-1 backdrop-blur-sm bg-green-500/90 hover:bg-green-600/90 dark:bg-green-600/90 dark:hover:bg-green-700/90 text-white border border-green-400/30 dark:border-green-500/30 shadow-lg shadow-green-500/25"
                  data-testid="button-save-changes-mobile"
                  disabled={updateEmployeeMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateEmployeeMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}