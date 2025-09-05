import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

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
      <DialogContent className="max-w-4xl" data-testid="tab-customization-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Customize Tab Layout</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add or remove tabs to customize your dashboard layout. Current tabs will appear in the main navigation bar.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Available Tabs */}
          {availableTabs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Available Tabs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableTabs.map((tab) => (
                  <Card
                    key={tab.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors border-2 border-dashed border-muted-foreground/20 hover:border-primary/40"
                    data-testid={`available-tab-${tab.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{tab.label}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addTab(tab.id)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10 h-6 w-6 p-0"
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
            <h3 className="text-sm font-medium text-foreground mb-3">Current Tabs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentTabs.map((tab) => (
                <Card
                  key={tab.id}
                  className="hover:bg-accent/50 transition-colors border-2 border-primary/20 bg-primary/5"
                  data-testid={`current-tab-${tab.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{tab.label}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTab(tab.id)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-6 w-6 p-0"
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
            {localEnabledTabs.length <= 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                You must have at least one tab enabled.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button onClick={handleCancel} variant="outline" data-testid="cancel-tabs">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="save-tabs">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
