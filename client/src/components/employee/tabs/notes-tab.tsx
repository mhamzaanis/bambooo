import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, FileText, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  employeeId: string;
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

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/employees", employeeId, "notes"],
    queryFn: async () => {
      // Mock data for now
      return [];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/notes`, data);
      return response.json();
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; content: string }) => {
      const response = await apiRequest("PATCH", `/api/employees/${employeeId}/notes/${data.id}`, {
        title: data.title,
        content: data.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      setEditingNote(null);
      setNoteData({ title: "", content: "" });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await apiRequest("DELETE", `/api/employees/${employeeId}/notes/${noteId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: () => {
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
    setNoteData({ title: note.title, content: note.content });
    setShowNoteForm(true);
  };

  const handleCancel = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    setNoteData({ title: "", content: "" });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          Notes
        </h2>
        <Button onClick={() => setShowNoteForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {showNoteForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingNote ? "Edit Note" : "Add New Note"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={noteData.title}
                    onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                    placeholder="Enter note title"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={noteData.content}
                    onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                    placeholder="Enter note content"
                    rows={5}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addNoteMutation.isPending || updateNoteMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingNote ? "Update" : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notes found</p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                  {note.updatedAt !== note.createdAt && (
                    <span> • Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                  )}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
