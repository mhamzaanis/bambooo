import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Monitor, Plus } from "lucide-react";
import type { Asset, InsertAsset } from "@shared/schema";

interface AssetsTabProps {
  employeeId: string;
}

export default function AssetsTab({ employeeId }: AssetsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/employees", employeeId, "assets"],
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: InsertAsset) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/assets`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "assets"] });
      setShowAssetForm(false);
      setEditingAsset(null);
      toast({ title: "Success", description: "Asset added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add asset", variant: "destructive" });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Asset> }) => {
      const response = await apiRequest("PATCH", `/api/assets/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "assets"] });
      setEditingAsset(null);
      setShowAssetForm(false);
      toast({ title: "Success", description: "Asset updated successfully" });
    },
    onError: () => {
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
  });

  const handleAssetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const assetData = {
      employeeId,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      serialNumber: formData.get("serialNumber") as string,
      dateAssigned: formData.get("dateAssigned") as string,
    };

    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: assetData });
    } else {
      createAssetMutation.mutate(assetData);
    }
  };

  const addSampleAssets = () => {
    const sampleAssets = [
      {
        employeeId,
        category: "Computer",
        description: "MacBook Pro",
        serialNumber: "AKITB-34234-JKL-00150",
        dateAssigned: "2014-06-02",
      },
      {
        employeeId,
        category: "Monitor",
        description: "AON 32\" Curved Monitor",
        serialNumber: "ERD-847372772",
        dateAssigned: "2018-08-08",
      },
      {
        employeeId,
        category: "Hardware",
        description: "Apple Magic Mouse 2",
        serialNumber: "APL-393949595595",
        dateAssigned: "2018-08-09",
      },
      {
        employeeId,
        category: "Cell Phone",
        description: "iPhone 14 Max",
        serialNumber: "AKITB-34234-JKL-00150",
        dateAssigned: "2024-07-17",
      },
      {
        employeeId,
        category: "Corporate Card",
        description: "Brex Card",
        serialNumber: "7923-0320-1238-3721",
        dateAssigned: "2024-04-01",
      },
    ];

    sampleAssets.forEach(asset => {
      createAssetMutation.mutate(asset);
    });
  };

  const assetColumns = [
    { key: "category" as keyof Asset, header: "Category" },
    { key: "description" as keyof Asset, header: "Description" },
    { key: "serialNumber" as keyof Asset, header: "Serial Number" },
    { key: "dateAssigned" as keyof Asset, header: "Date Assigned" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Monitor className="h-6 w-6 mr-2 text-primary" />
          Assets
        </h1>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-primary" />
              Assets
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAssetForm(true)} data-testid="button-add-asset">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
              {assets.length === 0 && (
                <Button onClick={addSampleAssets} variant="outline" size="sm" data-testid="button-add-sample-assets">
                  Add Sample Assets
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Asset Form */}
          {showAssetForm && (
            <form onSubmit={handleAssetSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingAsset?.description || ""}
                    required
                    data-testid="input-asset-description"
                  />
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    defaultValue={editingAsset?.serialNumber || ""}
                    data-testid="input-serial-number"
                  />
                </div>
                <div>
                  <Label htmlFor="dateAssigned">Date Assigned</Label>
                  <Input
                    id="dateAssigned"
                    name="dateAssigned"
                    type="date"
                    defaultValue={editingAsset?.dateAssigned || ""}
                    data-testid="input-date-assigned"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" data-testid="button-save-asset">
                  {editingAsset ? "Update" : "Add"} Asset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                  data-testid="button-cancel-asset"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <DataTable
            columns={assetColumns}
            data={assets}
            onEdit={(item) => {
              setEditingAsset(item);
              setShowAssetForm(true);
            }}
            onDelete={(item) => deleteAssetMutation.mutate(item.id)}
            emptyMessage="No assets available"
          />
        </CardContent>
      </Card>
    </div>
  );
}
