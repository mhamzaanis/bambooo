import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Upload, Search, Grid3X3, UploadCloud, File, PenTool, Folder } from "lucide-react";
import type { Document, InsertDocument } from "@shared/schema";

interface DocumentsTabProps {
  employeeId: string;
}

export default function DocumentsTab({ employeeId }: DocumentsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/employees", employeeId, "documents"],
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/documents`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "documents"] });
      toast({ title: "Success", description: "Document uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
    },
  });

  const uploadDocument = () => {
    createDocumentMutation.mutate({
      employeeId,
      category: "Employee Uploads",
      name: "Sample Document",
      fileName: "sample.pdf",
      uploadDate: new Date().toISOString().split('T')[0],
    });
  };

  const documentCategories = [
    {
      name: "Employee Uploads",
      icon: UploadCloud,
      count: documents.filter(d => d.category === "Employee Uploads").length,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Resumes and Applications",
      icon: File,
      count: documents.filter(d => d.category === "Resumes and Applications").length,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Signed Documents",
      icon: PenTool,
      count: documents.filter(d => d.category === "Signed Documents").length,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Tasklist Attachments",
      icon: Folder,
      count: documents.filter(d => d.category === "Tasklist Attachments").length,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      name: "Workflow Attachments",
      icon: Folder,
      count: documents.filter(d => d.category === "Workflow Attachments").length,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Documents
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 w-64"
                  data-testid="search-documents"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <Button onClick={uploadDocument} data-testid="button-upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" size="icon" data-testid="button-grid-view">
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Document Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {documentCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.name}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-primary/40 transition-colors cursor-pointer"
                  data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.count} items</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drag and drop files to upload</h3>
            <p className="text-gray-500 mb-4">or click to browse files</p>
            <Button onClick={uploadDocument} data-testid="button-browse-files">
              Browse Files
            </Button>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">5 folders</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
