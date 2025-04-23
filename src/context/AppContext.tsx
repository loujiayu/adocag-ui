import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  selectedProject: string | null;
  setSelectedProject: (project: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 