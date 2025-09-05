import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Plus } from "lucide-react";
import type { TimeOff, InsertTimeOff } from "@shared/schema";

interface TimeOffTabProps {
  employeeId: string;
}

export default function TimeOffTab({ employeeId }: TimeOffTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeOff = [] } = useQuery<TimeOff[]>({
    queryKey: ["/api/employees", employeeId, "time-off"],
  });

  const createTimeOffMutation = useMutation({
    mutationFn: async (data: InsertTimeOff) => {
      const response = await apiRequest("POST", `/api/employees/${employeeId}/time-off`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ title: "Success", description: "Time off request added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add time off request", variant: "destructive" });
    },
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/time-off/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "time-off"] });
      toast({ title: "Success", description: "Time off request deleted successfully" });
    },
  });

  const requestTimeOff = () => {
    createTimeOffMutation.mutate({
      employeeId,
      type: "Vacation",
      startDate: "2024-12-23",
      endDate: "2024-12-27",
      days: "5.0",
      status: "Pending",
      comment: "Holiday vacation",
    });
  };

  const timeOffColumns = [
    {
      key: "startDate" as keyof TimeOff,
      header: "Start Date",
      render: (value: string, item: TimeOff) => {
        if (item.startDate === item.endDate) {
          return item.startDate;
        }
        return `${item.startDate} - ${item.endDate}`;
      },
    },
    { key: "type" as keyof TimeOff, header: "Type" },
    { key: "days" as keyof TimeOff, header: "Days" },
    {
      key: "status" as keyof TimeOff,
      header: "Status",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === "Approved" ? "bg-green-100 text-green-800" :
          value === "Pending" ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "comment" as keyof TimeOff, header: "Comment" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Time Off Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Time Off Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Vacation</h3>
              <div className="text-3xl font-bold text-blue-900">15.5</div>
              <div className="text-sm text-blue-600">days available</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-2">Sick Leave</h3>
              <div className="text-3xl font-bold text-green-900">8.0</div>
              <div className="text-sm text-green-600">days available</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-700 mb-2">Personal</h3>
              <div className="text-3xl font-bold text-purple-900">3.0</div>
              <div className="text-sm text-purple-600">days available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Time Off */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request Time Off</CardTitle>
            <Button onClick={requestTimeOff} data-testid="button-new-request">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Click "New Request" to submit a time off request.
          </div>
        </CardContent>
      </Card>

      {/* Time Off History */}
      <Card>
        <CardHeader>
          <CardTitle>Time Off History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={timeOffColumns}
            data={timeOff}
            onDelete={(item) => deleteTimeOffMutation.mutate(item.id)}
            emptyMessage="No time off requests found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
