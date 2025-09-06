import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, Upload, Search, Grid3X3, List, UploadCloud, File, PenTool, 
  Folder, Download, Trash2, Plus, Calendar, FileType
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Document, InsertDocument } from "@shared/schema";

interface DocumentsTabProps {
  employeeId: string;
}

export default function DocumentsTab({ employeeId }: DocumentsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for UI controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: "",
    name: "",
    fileName: ""
  });

  const { data: documents = [], isLoading, error, refetch } = useQuery<Document[]>({
    queryKey: ["documents", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return response.json();
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to upload document: ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      // Invalidate and refetch the documents query
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
      // Also refetch immediately to ensure UI updates
      refetch();
      setShowUploadDialog(false);
      setUploadForm({ category: "", name: "", fileName: "" });
      toast({ title: "Success", description: "Document uploaded successfully" });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to upload document", 
        variant: "destructive" 
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete document: ${errorData}`);
      }
      
      return response.ok;
    },
    onSuccess: () => {
      console.log('Delete successful');
      // Invalidate and refetch the documents query
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
      // Also refetch immediately to ensure UI updates
      refetch();
      toast({ title: "Success", description: "Document deleted successfully" });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete document", 
        variant: "destructive" 
      });
    },
  });

  const handleUpload = () => {
    console.log('Upload button clicked');
    console.log('Form data:', uploadForm);
    
    if (!uploadForm.category || !uploadForm.name || !uploadForm.fileName) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const documentData = {
      employeeId,
      category: uploadForm.category,
      name: uploadForm.name,
      fileName: uploadForm.fileName,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    
    console.log('Submitting document data:', documentData);
    createDocumentMutation.mutate(documentData);
  };

  // Filter and search documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const documentCategories = [
    {
      name: "Employee Uploads",
      icon: UploadCloud,
      count: documents.filter(d => d.category === "Employee Uploads").length,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      name: "Resumes and Applications",
      icon: File,
      count: documents.filter(d => d.category === "Resumes and Applications").length,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      name: "Signed Documents",
      icon: PenTool,
      count: documents.filter(d => d.category === "Signed Documents").length,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      name: "Tasklist Attachments",
      icon: Folder,
      count: documents.filter(d => d.category === "Tasklist Attachments").length,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      name: "Workflow Attachments",
      icon: Folder,
      count: documents.filter(d => d.category === "Workflow Attachments").length,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Debug info */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <p className="text-destructive">Error loading documents: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Documents ({filteredDocuments.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-documents"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {documentCategories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowUploadDialog(true)} data-testid="button-upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Document Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {documentCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              return (
                <div
                  key={category.name}
                  className={`border rounded-lg p-4 hover:border-primary/40 transition-colors cursor-pointer ${
                    isSelected ? 'border-primary bg-primary/5' : 'bg-card border-border'
                  }`}
                  onClick={() => setSelectedCategory(isSelected ? "all" : category.name)}
                  data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <div className={`w-12 h-12 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} items</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Documents List */}
          {filteredDocuments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                {selectedCategory === "all" ? "All Documents" : selectedCategory}
              </h3>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <FileType className="h-8 w-8 text-muted-foreground mr-3" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{doc.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocumentMutation.mutate(doc.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Category</span>
                          <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Date</span>
                          <span>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center">
                        <FileType className="h-6 w-6 text-muted-foreground mr-3" />
                        <div className="flex-1">
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{doc.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocumentMutation.mutate(doc.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 mb-6">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery || selectedCategory !== "all" ? "No documents found" : "No documents yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Upload your first document to get started"}
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          )}

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Drag and drop files to upload</h3>
            <p className="text-muted-foreground mb-4">or click to browse files</p>
            <Button onClick={() => setShowUploadDialog(true)} data-testid="button-browse-files">
              Browse Files
            </Button>
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">
                {documentCategories.length} categories available
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to the employee's file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={uploadForm.category} onValueChange={(value) => 
                setUploadForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="name">Document Name</Label>
              <Input
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name"
              />
            </div>

            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm(prev => ({ ...prev, fileName: e.target.value }))}
                placeholder="e.g., document.pdf"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={createDocumentMutation.isPending}>
              {createDocumentMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
