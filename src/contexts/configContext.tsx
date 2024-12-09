import { createContext, useContext, useState } from 'react';

type ConfigContextType = {
  cameraPosition: string;
  setCameraPosition: (cameraPosition: React.SetStateAction<string>) => void;
  cameraWindowSize: string;
  setCameraWindowSize: (cameraWindowSize: React.SetStateAction<string>) => void;
  cameraWindowBorderRadius: string;
  setCameraWindowBorderRadius: (
    cameraWindowBorderRadius: React.SetStateAction<string>,
  ) => void;
  cameraWindowAspect: string;
  setCameraWindowAspect: (
    cameraWindowAspect: React.SetStateAction<string>,
  ) => void;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

type ConfigContextProviderProps = {
  children: React.ReactNode;
};

export const ConfigContextProvider = ({
  children,
}: ConfigContextProviderProps) => {
  const [cameraPosition, setCameraPosition] = useState<string>('bottom-right');
  const [cameraWindowAspect, setCameraWindowAspect] = useState<string>('1:1');
  const [cameraWindowBorderRadius, setCameraWindowBorderRadius] =
    useState<string>('L');
  const [cameraWindowSize, setCameraWindowSize] = useState<string>('M');

  return (
    <ConfigContext.Provider
      value={{
        cameraPosition,
        setCameraPosition,
        cameraWindowSize,
        setCameraWindowSize,
        cameraWindowBorderRadius,
        setCameraWindowBorderRadius,
        cameraWindowAspect,
        setCameraWindowAspect,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useCameraConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);

  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }

  return context;
};
