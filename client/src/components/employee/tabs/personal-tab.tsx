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
import { User, MapPin, Phone, Link, GraduationCap, FileText, Plus, Save } from "lucide-react";
import type { Employee, Education, InsertEducation } from "@shared/schema";

interface PersonalTabProps {
  employeeId: string;
}

export default function PersonalTab({ employeeId }: PersonalTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: employee } = useQuery<Employee>({
    queryKey: ["/api/employees", employeeId],
  });

  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ["/api/employees", employeeId, "education"],
  });

  // Initialize form data when employee data loads
  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setHasChanges(false);
    }
  }, [employee]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: Partial<Employee>) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId] });
      setHasChanges(false);
      toast({ title: "Success", description: "Employee information updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update employee information", variant: "destructive" });
    },
  });

  const createEducationMutation = useMutation({
    mutationFn: async (data: InsertEducation) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/education`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      setShowEducationForm(false);
      toast({ title: "Success", description: "Education added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add education", variant: "destructive" });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Education> }) => {
      const response = await apiRequest("PATCH", `/api/education/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      setEditingEducation(null);
      toast({ title: "Success", description: "Education updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update education", variant: "destructive" });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/education/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "education"] });
      toast({ title: "Success", description: "Education deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete education", variant: "destructive" });
    },
  });

  const handleFieldChange = (field: string, value: any) => {
    if (!formData) return;

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
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    updateEmployeeMutation.mutate(formData);
  };

  const handleDiscardChanges = () => {
    if (employee) {
      setFormData(employee);
      setHasChanges(false);
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

  if (!employee || !formData) {
    return <div>Loading...</div>;
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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                data-testid="input-firstName"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                data-testid="input-lastName"
              />
            </div>
            <div>
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={formData.profileData?.personal?.preferredName || ""}
                onChange={(e) => handleFieldChange("profileData.personal.preferredName", e.target.value)}
                data-testid="input-preferredName"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                data-testid="input-email"
              />
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ssn">SSN</Label>
              <Input
                id="ssn"
                placeholder="XXX-XX-XXXX"
                value={formData.profileData?.personal?.ssn || ""}
                onChange={(e) => handleFieldChange("profileData.personal.ssn", e.target.value)}
                data-testid="input-ssn"
              />
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
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.profileData?.address?.city || ""}
                onChange={(e) => handleFieldChange("profileData.address.city", e.target.value)}
                data-testid="input-city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.profileData?.address?.state || ""}
                onChange={(e) => handleFieldChange("profileData.address.state", e.target.value)}
                data-testid="input-state"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.profileData?.address?.zipCode || ""}
                onChange={(e) => handleFieldChange("profileData.address.zipCode", e.target.value)}
                data-testid="input-zipCode"
              />
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
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="workPhone">Work Phone</Label>
              <Input
                id="workPhone"
                type="tel"
                value={formData.profileData?.contact?.workPhone || formData.phone || ""}
                onChange={(e) => handleFieldChange("profileData.contact.workPhone", e.target.value)}
                data-testid="input-workPhone"
              />
            </div>
            <div>
              <Label htmlFor="mobilePhone">Mobile Phone</Label>
              <Input
                id="mobilePhone"
                type="tel"
                value={formData.profileData?.contact?.mobilePhone || ""}
                onChange={(e) => handleFieldChange("profileData.contact.mobilePhone", e.target.value)}
                data-testid="input-mobilePhone"
              />
            </div>
            <div>
              <Label htmlFor="homePhone">Home Phone</Label>
              <Input
                id="homePhone"
                type="tel"
                value={formData.profileData?.contact?.homePhone || ""}
                onChange={(e) => handleFieldChange("profileData.contact.homePhone", e.target.value)}
                data-testid="input-homePhone"
              />
            </div>
            <div>
              <Label htmlFor="personalEmail">Personal Email</Label>
              <Input
                id="personalEmail"
                type="email"
                value={formData.profileData?.contact?.personalEmail || ""}
                onChange={(e) => handleFieldChange("profileData.contact.personalEmail", e.target.value)}
                data-testid="input-personalEmail"
              />
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
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="LinkedIn URL"
                value={formData.profileData?.social?.linkedin || ""}
                onChange={(e) => handleFieldChange("profileData.social.linkedin", e.target.value)}
                data-testid="input-linkedin"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="Twitter URL"
                value={formData.profileData?.social?.twitter || ""}
                onChange={(e) => handleFieldChange("profileData.social.twitter", e.target.value)}
                data-testid="input-twitter"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="Website URL"
                value={formData.profileData?.social?.website || ""}
                onChange={(e) => handleFieldChange("profileData.social.website", e.target.value)}
                data-testid="input-website"
              />
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
              onClick={() => setShowEducationForm(true)}
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
            <form onSubmit={handleEducationSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    name="institution"
                    defaultValue={editingEducation?.institution || ""}
                    required
                    data-testid="input-institution"
                  />
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    name="degree"
                    defaultValue={editingEducation?.degree || ""}
                    data-testid="input-degree"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    defaultValue={editingEducation?.fieldOfStudy || ""}
                    data-testid="input-fieldOfStudy"
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
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Additional information about your education"
                  defaultValue={editingEducation?.description || ""}
                  data-testid="textarea-description"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" data-testid="button-save-education">
                  {editingEducation ? "Update" : "Add"} Education
                </Button>
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
            emptyMessage="No education information available"
          />
        </CardContent>
      </Card>

      {/* Visa Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Visa Information
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
                  <SelectItem value="H1B">H1B</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="Green Card">Green Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visaStatus">Visa Status</Label>
              <Select
                value={formData.profileData?.visa?.status || ""}
                onValueChange={(value) => handleFieldChange("profileData.visa.status", value)}
              >
                <SelectTrigger data-testid="select-visaStatus">
                  <SelectValue placeholder="Select visa status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visaExpiration">Expiration Date</Label>
              <Input
                id="visaExpiration"
                type="date"
                value={formData.profileData?.visa?.expiration || ""}
                onChange={(e) => handleFieldChange("profileData.visa.expiration", e.target.value)}
                data-testid="input-visaExpiration"
              />
            </div>
            <div>
              <Label htmlFor="sponsorshipRequired">Sponsorship Required</Label>
              <Select
                value={formData.profileData?.visa?.sponsorshipRequired ? "Yes" : "No"}
                onValueChange={(value) => handleFieldChange("profileData.visa.sponsorshipRequired", value === "Yes")}
              >
                <SelectTrigger data-testid="select-sponsorshipRequired">
                  <SelectValue placeholder="Select sponsorship requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save/Discard Changes Buttons */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-yellow-800">
                You have unsaved changes. Click "Save Changes" to save or "Discard Changes" to cancel.
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDiscardChanges}
                  variant="outline"
                  size="sm"
                  data-testid="button-discard-changes"
                >
                  Discard Changes
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
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
      )}
    </div>
  );
}