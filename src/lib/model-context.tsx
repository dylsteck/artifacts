import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getSetting, setSetting } from "@/lib/db";

export const MODELS = [
  {
    id: "claude-sonnet-4-6",
    name: "Sonnet 4.6",
    context: "Standard",
  },
  {
    id: "claude-opus-4-6",
    name: "Opus 4.6",
    context: "Extended",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 4.5",
    context: "Standard",
  },
  {
    id: "grok-3",
    name: "Grok 3",
    context: "Extended",
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    context: "Fast",
  },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

type ModelContextType = {
  model: ModelId;
  setModel: (model: ModelId) => void;
  modelInfo: (typeof MODELS)[number];
};

const ModelContext = createContext<ModelContextType>(null!);

const SETTING_KEY = "selectedModel";

export function ModelProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [model, setModelState] = useState<ModelId>("claude-sonnet-4-6");

  // Load persisted model on mount
  useEffect(() => {
    getSetting(db, SETTING_KEY)
      .then((saved) => {
        if (saved && MODELS.some((m) => m.id === saved)) {
          setModelState(saved as ModelId);
        }
      })
      .catch(console.error);
  }, []);

  const setModel = useCallback(
    (newModel: ModelId) => {
      setModelState(newModel);
      setSetting(db, SETTING_KEY, newModel).catch(console.error);
    },
    [db]
  );

  const modelInfo = MODELS.find((m) => m.id === model) ?? MODELS[0];

  return (
    <ModelContext.Provider value={{ model, setModel, modelInfo }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
