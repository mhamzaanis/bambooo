import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Save, X, AlertCircle, Plus, Edit } from "lucide-react";
import type { Compensation, InsertCompensation } from "@shared/schema";

interface CompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertCompensation) => void;
  initialData?: Compensation | null;
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

export default function CompensationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading, 
  employeeId 
}: CompensationModalProps) {
  const [formData, setFormData] = useState<Partial<InsertCompensation> & { effectiveDate?: string; payRate?: string; payType?: string; overtime?: string; changeReason?: string; comment?: string }>({});
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

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
    } else if (!validateDate(formData.effectiveDate)) {
      newErrors.effectiveDate = "Please enter a valid date (YYYY-MM-DD)";
    }

    if (!formData.payRate?.trim()) {
      newErrors.payRate = "Pay rate is required";
    } else if (!validateSalary(formData.payRate)) {
      newErrors.payRate = "Please enter a valid salary amount";
    }

    if (!formData.payType?.trim()) {
      newErrors.payType = "Pay type is required";
    }

    if (!formData.changeReason?.trim()) {
      newErrors.changeReason = "Change reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const data = {
      ...formData,
      employeeId,
    } as InsertCompensation;
    
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
            {isEditing ? "Edit Compensation" : "Add Compensation"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                className={errors.effectiveDate ? "border-red-500" : ""}
              />
              {errors.effectiveDate && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.effectiveDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payRate">Pay Rate *</Label>
              <Input
                id="payRate"
                value={formData.payRate || ''}
                onChange={(e) => {
                  const formatted = formatSalary(e.target.value);
                  setFormData(prev => ({ ...prev, payRate: formatted }));
                }}
                placeholder="$0.00"
                className={errors.payRate ? "border-red-500" : ""}
              />
              {errors.payRate && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.payRate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payType">Pay Type *</Label>
              <Select 
                value={formData.payType || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, payType: value }))}
              >
                <SelectTrigger className={errors.payType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select pay type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                  <SelectItem value="Commission">Commission</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              {errors.payType && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.payType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime Status</Label>
              <Select 
                value={formData.overtime || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, overtime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select overtime status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exempt">Exempt</SelectItem>
                  <SelectItem value="Non-Exempt">Non-Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="changeReason">Change Reason *</Label>
              <Select 
                value={formData.changeReason || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, changeReason: value }))}
              >
                <SelectTrigger className={errors.changeReason ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select change reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Hire">New Hire</SelectItem>
                  <SelectItem value="Promotion">Promotion</SelectItem>
                  <SelectItem value="Annual Review">Annual Review</SelectItem>
                  <SelectItem value="Merit Increase">Merit Increase</SelectItem>
                  <SelectItem value="Market Adjustment">Market Adjustment</SelectItem>
                  <SelectItem value="Role Change">Role Change</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.changeReason && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.changeReason}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={formData.comment || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Add any additional comments"
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
