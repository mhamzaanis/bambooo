import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Monitor, Plus, Calendar as CalendarIcon, Edit, Trash2, AlertTriangle, Search } from "lucide-react";
import { format } from "date-fns";
import type { Asset, InsertAsset } from "@shared/schema";

interface AssetsTabProps {
  employeeId: string;
}

export default function AssetsTab({ employeeId }: AssetsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dateError, setDateError] = useState("");

  // Helper function to validate date assigned
  const validateDateAssigned = (dateAssigned: string) => {
    if (!dateAssigned) {
      return { isValid: false, message: "Date assigned is required" };
    }

    const assignedDate = new Date(dateAssigned);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    // Check if date is in the future
    if (assignedDate > today) {
      return {
        isValid: false,
        message: "Date assigned cannot be in the future"
      };
    }

    // Check if date is too far in the past (more than 50 years)
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    
    if (assignedDate < fiftyYearsAgo) {
      return {
        isValid: false,
        message: "Date assigned cannot be more than 50 years ago"
      };
    }

    return { isValid: true, message: "" };
  };

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/employees", employeeId, "assets"],
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: InsertAsset) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/assets`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "assets"] });
      resetForm();
      toast({ title: "Success", description: "Asset added successfully" });
    },
    onError: (error) => {
      console.error("Create asset error:", error);
      toast({ title: "Error", description: "Failed to add asset", variant: "destructive" });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Asset> }) => {
      const response = await apiRequest("PATCH", `/api/assets/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "assets"] });
      resetForm();
      toast({ title: "Success", description: "Asset updated successfully" });
    },
    onError: (error) => {
      console.error("Update asset error:", error);
      toast({ title: "Error", description: "Failed to update asset", variant: "destructive" });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "assets"] });
      toast({ title: "Success", description: "Asset deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete asset error:", error);
      toast({ title: "Error", description: "Failed to delete asset", variant: "destructive" });
    },
  });

  const handleAssetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dateAssigned = formData.get("dateAssigned") as string;
    const dateValidation = validateDateAssigned(dateAssigned);
    
    if (!dateValidation.isValid) {
      setDateError(dateValidation.message);
      toast({ 
        title: "Validation Error", 
        description: dateValidation.message, 
        variant: "destructive" 
      });
      return;
    }

    setDateError("");
    
    const assetData = {
      employeeId,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      serialNumber: formData.get("serialNumber") as string,
      dateAssigned,
    };

    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: assetData });
    } else {
      createAssetMutation.mutate(assetData);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    if (date) {
      const dateValidation = validateDateAssigned(format(date, "yyyy-MM-dd"));
      if (!dateValidation.isValid) {
        setDateError(dateValidation.message);
      } else {
        setDateError("");
      }
    }
  };

  const resetForm = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
    setSelectedDate(undefined);
    setDateError("");
    setShowDatePicker(false);
  };

  // Filter and search assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || asset.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Static list of all asset categories (matches the creation form)
  const availableCategories = [
    "Computer",
    "Monitor", 
    "Hardware",
    "Cell Phone",
    "Corporate Card",
    "Software",
    "Other"
  ];

  const assetColumns = [
    { key: "category" as keyof Asset, header: "Category" },
    { key: "description" as keyof Asset, header: "Description" },
    { key: "serialNumber" as keyof Asset, header: "Serial Number" },
    { 
      key: "dateAssigned" as keyof Asset, 
      header: "Date Assigned",
      render: (value: string) => value ? format(new Date(value), "PPP") : "N/A"
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets by description, category, or serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-primary" />
              Assets ({filteredAssets.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  setShowAssetForm(true);
                  setSelectedDate(undefined);
                  setDateError("");
                }} 
                data-testid="button-add-asset"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Results Info */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAssets.length} of {assets.length} assets
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}

          <DataTable
            columns={assetColumns}
            data={filteredAssets}
            onEdit={(item) => {
              setEditingAsset(item);
              setSelectedDate(item.dateAssigned ? new Date(item.dateAssigned) : undefined);
              setDateError("");
              setShowAssetForm(true);
            }}
            onDelete={(item) => {
              deleteAssetMutation.mutate(item.id);
            }}
            emptyMessage={
              searchTerm || filterCategory !== "all" 
                ? "No assets match your search criteria" 
                : "No assets available. Click 'Add Asset' to get started."
            }
          />
        </CardContent>
      </Card>

      {/* Asset Form Dialog */}
      <Dialog open={showAssetForm} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        } else {
          setShowAssetForm(true);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? "Edit Asset" : "Add New Asset"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAssetSubmit} className="space-y-4">
            {dateError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{dateError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={editingAsset?.category || ""}>
                  <SelectTrigger data-testid="select-asset-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer">Computer</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Cell Phone">Cell Phone</SelectItem>
                    <SelectItem value="Corporate Card">Corporate Card</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingAsset?.description || ""}
                  required
                  placeholder="e.g., MacBook Pro 16-inch"
                  data-testid="input-asset-description"
                />
              </div>
              
              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  defaultValue={editingAsset?.serialNumber || ""}
                  placeholder="e.g., ABC123XYZ789"
                  data-testid="input-serial-number"
                />
              </div>
              
              <div>
                <Label htmlFor="dateAssigned">Date Assigned *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dateAssigned"
                    name="dateAssigned"
                    type="date"
                    value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : editingAsset?.dateAssigned || ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setSelectedDate(date);
                      if (date) {
                        const validation = validateDateAssigned(e.target.value);
                        setDateError(validation.isValid ? "" : validation.message);
                      }
                    }}
                    required
                    className={`flex-1 ${dateError ? 'border-red-500' : ''}`}
                    data-testid="input-date-assigned"
                  />
                  <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setShowDatePicker(true)}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => 
                          date > new Date() || date < new Date("1970-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {dateError && (
                  <p className="text-sm text-red-600 mt-1">{dateError}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                data-testid="button-cancel-asset"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!!dateError}
                data-testid="button-save-asset"
              >
                {editingAsset ? "Update" : "Add"} Asset
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
