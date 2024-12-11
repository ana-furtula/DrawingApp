import { BrushTypeEnum } from "./BrushTypeEnum";
import { CanvasPoint } from "./CanvasPoint";

export type HistoryItem = {
  points: Array<CanvasPoint>;
  type: BrushTypeEnum;
  color: string;
  width: number;
  stickerSize: number;
};
