import React, { createContext, useContext, useState, type ReactNode } from "react";

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
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

type ModelContextType = {
  model: ModelId;
  setModel: (model: ModelId) => void;
  modelInfo: (typeof MODELS)[number];
};

const ModelContext = createContext<ModelContextType>(null!);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");
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
