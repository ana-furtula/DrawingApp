import { BrushTypeEnum } from "./BrushTypeEnum";
import { CanvasPoint } from "./CanvasPoint";
import { HistoryItem } from "./HistoryItem";

export function getCircleRadius(p1: CanvasPoint, p2: CanvasPoint) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function getDistanceBetweenPoints(p1: CanvasPoint, p2: CanvasPoint) {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

export function getRectangle(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x1 - x2),
    height: Math.abs(y1 - y2),
  };
}

export function drawHistoryItem(
  ctx: CanvasRenderingContext2D,
  historyItem: HistoryItem
) {
  switch (historyItem.type) {
    case BrushTypeEnum.PENCIL:
      historyItem.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      break;
    case BrushTypeEnum.RECTANGLE:
      if (historyItem.points.length !== 2) break;
      var rectangle = getRectangle(
        historyItem.points[0].x,
        historyItem.points[0].y,
        historyItem.points[1].x,
        historyItem.points[1].y
      );

      ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      break;
    case BrushTypeEnum.CIRCLE:
      if (historyItem.points.length !== 2) break;
      var radius = getCircleRadius(
        historyItem.points[0],
        historyItem.points[1]
      );
      ctx.arc(
        historyItem.points[0].x,
        historyItem.points[0].y,
        radius,
        0,
        2 * Math.PI
      );
      break;
    case BrushTypeEnum.CROSSMARK:
      ctx.beginPath();
      ctx.moveTo(historyItem.points[0].x, historyItem.points[0].y);
      ctx.lineTo(
        historyItem.points[0].x + historyItem.stickerSize / 2,
        historyItem.points[0].y - historyItem.stickerSize / 2
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(historyItem.points[0].x, historyItem.points[0].y);
      ctx.lineTo(
        historyItem.points[0].x + historyItem.stickerSize / 2,
        historyItem.points[0].y + historyItem.stickerSize / 2
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(historyItem.points[0].x, historyItem.points[0].y);
      ctx.lineTo(
        historyItem.points[0].x - historyItem.stickerSize / 2,
        historyItem.points[0].y - historyItem.stickerSize / 2
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(historyItem.points[0].x, historyItem.points[0].y);
      ctx.lineTo(
        historyItem.points[0].x - historyItem.stickerSize / 2,
        historyItem.points[0].y + historyItem.stickerSize / 2
      );
      ctx.stroke();
      break;
    case BrushTypeEnum.CHECKMARK:
      ctx.beginPath();
      ctx.moveTo(
        historyItem.points[0].x,
        historyItem.points[0].y + historyItem.stickerSize / 2
      );
      ctx.lineTo(
        historyItem.points[0].x + historyItem.stickerSize / 2,
        historyItem.points[0].y - historyItem.stickerSize / 2
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        historyItem.points[0].x,
        historyItem.points[0].y + historyItem.stickerSize / 2
      );
      ctx.lineTo(
        historyItem.points[0].x -
          historyItem.stickerSize / 2 +
          historyItem.stickerSize / 4,
        historyItem.points[0].y
      );
      ctx.stroke();
      break;
    default:
      break;
  }
}
