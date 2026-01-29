import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface Pattern {
  id: string;
  svgFile: string;
  title: string;
}

interface PlaylistContextType {
  myFavorite: Pattern[];
  myPattern: Pattern[];
  addToFavorite: (pattern: Pattern) => void;
  removeFromFavorite: (patternId: string) => void;
  isFavorite: (patternId: string) => boolean;
  addToMyPattern: (pattern: Pattern) => void;
  removeFromMyPattern: (patternId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [myFavorite, setMyFavorite] = useState<Pattern[]>([]);
  const [myPattern, setMyPattern] = useState<Pattern[]>([]);

  useEffect(() => {
    // 从存储中加载数据
    AsyncStorage.getItem("myFavorite").then((data) => {
      if (data) {
        setMyFavorite(JSON.parse(data));
      }
    });
    AsyncStorage.getItem("myPattern").then((data) => {
      if (data) {
        setMyPattern(JSON.parse(data));
      }
    });
  }, []);

  const addToFavorite = async (pattern: Pattern) => {
    const newFavorites = [...myFavorite, pattern];
    setMyFavorite(newFavorites);
    await AsyncStorage.setItem("myFavorite", JSON.stringify(newFavorites));
  };

  const removeFromFavorite = async (patternId: string) => {
    const newFavorites = myFavorite.filter((p) => p.id !== patternId);
    setMyFavorite(newFavorites);
    await AsyncStorage.setItem("myFavorite", JSON.stringify(newFavorites));
  };

  const isFavorite = (patternId: string) => {
    return myFavorite.some((p) => p.id === patternId);
  };

  const addToMyPattern = async (pattern: Pattern) => {
    // 检查是否已存在
    if (!myPattern.some((p) => p.id === pattern.id)) {
      const newPatterns = [...myPattern, pattern];
      setMyPattern(newPatterns);
      await AsyncStorage.setItem("myPattern", JSON.stringify(newPatterns));
    }
  };

  const removeFromMyPattern = async (patternId: string) => {
    const newPatterns = myPattern.filter((p) => p.id !== patternId);
    setMyPattern(newPatterns);
    await AsyncStorage.setItem("myPattern", JSON.stringify(newPatterns));
  };

  return (
    <PlaylistContext.Provider
      value={{
        myFavorite,
        myPattern,
        addToFavorite,
        removeFromFavorite,
        isFavorite,
        addToMyPattern,
        removeFromMyPattern,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}

