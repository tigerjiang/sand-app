import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface Device {
  id: string;
  name: string;
}

interface DeviceContextType {
  currentDevice: Device | null;
  setCurrentDevice: (device: Device | null) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [currentDevice, setCurrentDeviceState] = useState<Device | null>(null);

  useEffect(() => {
    // 从存储中加载当前设备
    AsyncStorage.getItem("currentDevice").then((data) => {
      if (data) {
        setCurrentDeviceState(JSON.parse(data));
      }
    });
  }, []);

  const setCurrentDevice = async (device: Device | null) => {
    setCurrentDeviceState(device);
    if (device) {
      await AsyncStorage.setItem("currentDevice", JSON.stringify(device));
    } else {
      await AsyncStorage.removeItem("currentDevice");
    }
  };

  return (
    <DeviceContext.Provider value={{ currentDevice, setCurrentDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
}

