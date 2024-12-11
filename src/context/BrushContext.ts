import { createContext } from "react";
import { BrushTypeEnum } from "../types/BrushTypeEnum";
import { HistoryItem } from "../types/HistoryItem";

export const BrushContext = createContext({
  brush: {
    type: BrushTypeEnum.PENCIL,
    width: 1,
    color: "#d946ef",
    stickerSize: 8,
  },
  setBrush: (brush: {
    type: BrushTypeEnum;
    width: number;
    color: string;
    stickerSize: number;
  }) => {},
  history: Array<HistoryItem>(),
  setHistory: (history: Array<HistoryItem>) => {},
});
