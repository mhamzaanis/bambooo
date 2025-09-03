import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, Plus, X } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  component?: any;
}

interface TabCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTabs: Tab[];
  enabledTabs: string[];
  onTabsChange: (enabledTabs: string[]) => void;
}

export default function TabCustomizationModal({
  open,
  onOpenChange,
  allTabs,
  enabledTabs,
  onTabsChange,
}: TabCustomizationModalProps) {
  const [localEnabledTabs, setLocalEnabledTabs] = useState(enabledTabs);

  const availableTabs = allTabs.filter(tab => !localEnabledTabs.includes(tab.id));
  const currentTabs = allTabs.filter(tab => localEnabledTabs.includes(tab.id));

  const addTab = (tabId: string) => {
    setLocalEnabledTabs([...localEnabledTabs, tabId]);
  };

  const removeTab = (tabId: string) => {
    if (localEnabledTabs.length > 1) {
      setLocalEnabledTabs(localEnabledTabs.filter(id => id !== tabId));
    }
  };

  const moveTab = (fromIndex: number, toIndex: number) => {
    const newTabs = [...localEnabledTabs];
    const [movedTab] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, movedTab);
    setLocalEnabledTabs(newTabs);
  };

  const handleSave = () => {
    onTabsChange(localEnabledTabs);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalEnabledTabs(enabledTabs);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="tab-customization-modal">
        <DialogHeader>
          <DialogTitle>Customize Tabs</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Available Tabs */}
          {availableTabs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Available Tabs</h3>
              <div className="space-y-2">
                {availableTabs.map((tab) => (
                  <Card
                    key={tab.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    data-testid={`available-tab-${tab.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{tab.label}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addTab(tab.id)}
                          className="text-primary hover:text-primary/80"
                          data-testid={`add-tab-${tab.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Current Tabs */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Tabs</h3>
            <div className="space-y-2">
              {currentTabs.map((tab, index) => (
                <Card
                  key={tab.id}
                  className="cursor-move hover:bg-gray-50 transition-colors"
                  data-testid={`current-tab-${tab.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTab(tab.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={localEnabledTabs.length <= 1}
                        data-testid={`remove-tab-${tab.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button onClick={handleSave} className="flex-1" data-testid="save-tabs">
            Save Changes
          </Button>
          <Button onClick={handleCancel} variant="outline" className="flex-1" data-testid="cancel-tabs">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
