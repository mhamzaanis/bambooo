import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, FileText, Trash2, Edit, Search } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  employeeId: string;
  createdBy?: string;
}

interface NotesTabProps {
  employeeId: string;
}

export default function NotesTab({ employeeId }: NotesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteData, setNoteData] = useState({ title: "", content: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/employees", employeeId, "notes"],
    queryFn: async () => {
      console.log(`Fetching notes for employee: ${employeeId}`);
      const response = await apiRequest("GET", `/api/employees/${employeeId}/notes`);
      return response as Note[];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      console.log("Adding note:", data);
      const response = await apiRequest("POST", `/api/employees/${employeeId}/notes`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      setShowNoteForm(false);
      setNoteData({ title: "", content: "" });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; content: string }) => {
      console.log("Updating note:", data);
      const response = await apiRequest("PATCH", `/api/notes/${data.id}`, {
        title: data.title,
        content: data.content,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      setEditingNote(null);
      setShowNoteForm(false);
      setNoteData({ title: "", content: "" });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      console.log("Deleting note:", noteId);
      const response = await apiRequest("DELETE", `/api/notes/${noteId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteData.title.trim() || !noteData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (editingNote) {
      updateNoteMutation.mutate({
        id: editingNote.id,
        title: noteData.title,
        content: noteData.content,
      });
    } else {
      addNoteMutation.mutate(noteData);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setNoteData({ title: note.title || "", content: note.content || "" });
    setShowNoteForm(true);
  };

  const handleCancel = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    setNoteData({ title: "", content: "" });
  };

  const handleDelete = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter((note) =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          Notes ({filteredNotes.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button onClick={() => setShowNoteForm(true)} className="flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>
      </div>

      <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingNote ? "Edit Note" : "Add New Note"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={noteData.title}
                  onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                  placeholder="Enter note title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={noteData.content}
                  onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                  placeholder="Enter note content"
                  rows={6}
                  className="mt-1 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={addNoteMutation.isPending || updateNoteMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm ? "No notes found matching your search" : "No notes found"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Get started by adding your first note"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowNoteForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                      <span>Created: {formatDate(note.createdAt)}</span>
                      {note.createdBy && (
                        <>
                          <span>•</span>
                          <span>By: {note.createdBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
