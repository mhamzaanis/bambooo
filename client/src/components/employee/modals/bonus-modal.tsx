import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Save, X, AlertCircle, Plus, Edit } from "lucide-react";
import type { Bonus, InsertBonus } from "@shared/schema";

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertBonus) => void;
  initialData?: Bonus | null;
  isLoading?: boolean;
  employeeId: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const validateDate = (date: string): boolean => {
  if (!date) return true; // Empty date is valid
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

const validateSalary = (salary: string): boolean => {
  if (!salary) return true; // Empty salary is valid
  // Remove currency symbols and commas, then check if it's a valid number
  const cleanSalary = salary.replace(/[$,]/g, '');
  return !isNaN(parseFloat(cleanSalary)) && parseFloat(cleanSalary) >= 0;
};

const formatSalary = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '');
  if (!cleanValue) return '';
  
  const num = parseFloat(cleanValue);
  if (isNaN(num)) return '';
  
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function BonusModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading, 
  employeeId 
}: BonusModalProps) {
  const [formData, setFormData] = useState<Partial<InsertBonus> & { type?: string; amount?: string; frequency?: string; eligibilityDate?: string; description?: string }>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.type?.trim()) {
      newErrors.type = "Bonus type is required";
    }

    if (!formData.amount?.trim()) {
      newErrors.amount = "Bonus amount is required";
    } else if (!validateSalary(formData.amount)) {
      newErrors.amount = "Please enter a valid bonus amount";
    }

    if (!formData.frequency?.trim()) {
      newErrors.frequency = "Frequency is required";
    }

    if (formData.eligibilityDate && !validateDate(formData.eligibilityDate)) {
      newErrors.eligibilityDate = "Please enter a valid date (YYYY-MM-DD)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const data = {
      ...formData,
      employeeId,
    } as InsertBonus;
    
    onSubmit(data);
  };

  const handleClose = () => {
    setErrors({});
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isEditing ? <Edit className="h-5 w-5 mr-2 text-primary" /> : <Plus className="h-5 w-5 mr-2 text-primary" />}
            {isEditing ? "Edit Bonus Information" : "Add Bonus Information"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Bonus Type *</Label>
              <Select 
                value={formData.type || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select bonus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Performance Bonus">Performance Bonus</SelectItem>
                  <SelectItem value="Signing Bonus">Signing Bonus</SelectItem>
                  <SelectItem value="Retention Bonus">Retention Bonus</SelectItem>
                  <SelectItem value="Holiday Bonus">Holiday Bonus</SelectItem>
                  <SelectItem value="Project Completion">Project Completion</SelectItem>
                  <SelectItem value="Sales Commission">Sales Commission</SelectItem>
                  <SelectItem value="Referral Bonus">Referral Bonus</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                value={formData.amount || ''}
                onChange={(e) => {
                  const formatted = formatSalary(e.target.value);
                  setFormData(prev => ({ ...prev, amount: formatted }));
                }}
                placeholder="$0.00"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select 
                value={formData.frequency || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger className={errors.frequency ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.frequency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eligibilityDate">Eligibility Date</Label>
              <Input
                id="eligibilityDate"
                type="date"
                value={formData.eligibilityDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, eligibilityDate: e.target.value }))}
                className={errors.eligibilityDate ? "border-red-500" : ""}
              />
              {errors.eligibilityDate && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.eligibilityDate}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the bonus criteria and conditions"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
