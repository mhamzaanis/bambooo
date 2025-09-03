import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Employee } from '@shared/schema';

interface DataStore {
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee) => void;
  updateEmployeeField: (field: string, value: any) => void;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: Date;
  }>;
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      currentEmployee: null,
      
      setCurrentEmployee: (employee) => {
        set({ currentEmployee: employee });
      },
      
      updateEmployeeField: (field, value) => {
        const { currentEmployee } = get();
        if (!currentEmployee) return;

        const updatedEmployee = { ...currentEmployee };
        
        if (field.startsWith("profileData.")) {
          const path = field.split(".");
          let current = updatedEmployee.profileData || {};
          
          // Initialize nested objects if they don't exist
          if (!updatedEmployee.profileData) {
            updatedEmployee.profileData = { personal: {}, address: {}, contact: {}, social: {}, visa: {} };
          }
          
          const section = path[1];
          const property = path[2];
          
          if (!updatedEmployee.profileData[section as keyof typeof updatedEmployee.profileData]) {
            (updatedEmployee.profileData as any)[section] = {};
          }
          
          (updatedEmployee.profileData as any)[section][property] = value;
        } else {
          (updatedEmployee as any)[field] = value;
        }

        set({ currentEmployee: updatedEmployee });
      },

      notifications: [],
      
      addNotification: (message, type = 'info') => {
        const notification = {
          id: Date.now().toString(),
          message,
          type,
          timestamp: new Date(),
        };
        
        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, 5000);
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'bamboo-hr-data',
      partialize: (state) => ({
        currentEmployee: state.currentEmployee,
      }),
    }
  )
);

// Helper functions for common operations
export const useEmployeeData = () => {
  const store = useDataStore();
  
  return {
    employee: store.currentEmployee,
    updateField: store.updateEmployeeField,
    setEmployee: store.setCurrentEmployee,
  };
};

export const useNotifications = () => {
  const store = useDataStore();
  
  return {
    notifications: store.notifications,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
  };
};
