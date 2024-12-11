import { useContext, useEffect, useRef, useState } from "react";
import { BrushContext } from "../context/BrushContext";
import { BrushTypeEnum } from "../types/BrushTypeEnum";
import { CanvasPoint } from "../types/CanvasPoint";
import { getCircleRadius, getRectangle } from "../types/funtions";

type DrawingBoardProps = {
  ctx: CanvasRenderingContext2D | undefined | null;
  setCtx: Function;
  zoom: number;
  setCurrentHistory: Function;
  currentHistory: number;
  width: number;
  height: number;
  imageUrl: string;
};

function DrawingBoard({
  ctx,
  setCtx,
  zoom,
  setCurrentHistory,
  currentHistory,
  width,
  height,
  imageUrl,
}: DrawingBoardProps) {
  const [points, setPoints] = useState(Array<CanvasPoint>());

  const brushContext = useContext(BrushContext);
  const brush = brushContext.brush;

  const [painting, setPainting] = useState({
    isPainting: false,
    startX: 0,
    startY: 0,
  });

  const canvasElement = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCtx(canvasElement.current?.getContext("2d"));
    if (canvasElement.current) {
      canvasElement.current.width = canvasElement.current.clientWidth;
      canvasElement.current.height = canvasElement.current.clientHeight;
      // (canvasElement.current.getContext('2d') as any).fillStyle = 'white';
      canvasElement.current
        .getContext("2d")
        ?.fillRect(
          0,
          0,
          canvasElement.current.clientWidth,
          canvasElement.current.clientHeight
        );

      // const image = new Image();
      // image.src = "../example-image.jpg";

      // image.onload = () => {
      //   let loadedImageWidth = image.width;
      //   let loadedImageHeight = image.height;

      //   alert(`${loadedImageWidth}, ${loadedImageHeight}`);
      //   canvasElement.current?.getContext("2d")?.drawImage(image, 0, 0);
      // };
    }
  }, [canvasElement, setCtx]);

  useEffect(() => {
    var currentCanvasElement = canvasElement.current;

    if (ctx && currentCanvasElement) {
      currentCanvasElement.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      currentCanvasElement.addEventListener("touchmove", handleMobileDraw, {
        passive: false,
      });
      currentCanvasElement.addEventListener("touchend", handleTouchEnd, {
        passive: false,
      });
    }

    return () => {
      currentCanvasElement?.removeEventListener("touchstart", handleTouchStart);
      currentCanvasElement?.removeEventListener("touchmove", handleMobileDraw);
      currentCanvasElement?.removeEventListener("touchend", handleTouchEnd);
    };
  });

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (brush.type === BrushTypeEnum.GRAB) return;

    e.preventDefault();

    if (ctx && canvasElement.current) {
      // Reset redo option
      if (currentHistory !== 0) {
        brushContext.setHistory(
          [...brushContext.history].slice(currentHistory)
        );
        setCurrentHistory(0);
      }

      let rect = (e.target as HTMLElement).getBoundingClientRect();
      let x = (e.clientX - rect.left) / zoom;
      let y = (e.clientY - rect.top) / zoom;

      setPainting({
        isPainting: true,
        startX: x,
        startY: y,
      });
      setPoints([]);
    }
  };

  const handleMouseUp = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (brush.type === BrushTypeEnum.GRAB) return;

    let rect = (e.target as HTMLElement).getBoundingClientRect();
    let x = (e.clientX - rect.left) / zoom;
    let y = (e.clientY - rect.top) / zoom;

    var savedPoints = new Array<CanvasPoint>();

    if (brush.type === BrushTypeEnum.PENCIL)
      savedPoints = [...points, { x: x, y: y }];
    else if (
      brush.type === BrushTypeEnum.CROSSMARK ||
      brush.type === BrushTypeEnum.CHECKMARK
    )
      savedPoints = [{ x: x, y: y }];

    if (
      brush.type !== BrushTypeEnum.RECTANGLE &&
      brush.type !== BrushTypeEnum.CIRCLE &&
      savedPoints.length >= 1
    ) {
      brushContext.setHistory([
        {
          type: brush.type,
          color: brush.color,
          width: brush.width,
          stickerSize: brush.stickerSize,
          points: savedPoints,
        },
        ...brushContext.history,
      ]);
    }

    setPainting({
      isPainting: false,
      startX: 0,
      startY: 0,
    });

    setPoints([]);
    if (ctx) {
      ctx.stroke();
      ctx.beginPath();
    }
  };

  const handleMouseLeave = (e: any) => {
    handleDraw(e);
    setPainting({
      isPainting: false,
      startX: 0,
      startY: 0,
    });
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (brush.type === BrushTypeEnum.GRAB) return;
    if (!painting.isPainting) return;

    let rect = (e.target as HTMLElement).getBoundingClientRect();
    let x = (e.clientX - rect.left) / zoom;
    let y = (e.clientY - rect.top) / zoom;

    if (ctx && canvasElement.current) {
      setPoints([...points, { x: x, y: y }]);
      ctx.lineWidth = brush.width;
      ctx.strokeStyle = brush.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (brush.type) {
        case BrushTypeEnum.PENCIL:
          ctx.lineTo(x, y);
          ctx.stroke();
          break;
        case BrushTypeEnum.RECTANGLE:
          if (points.length === 0) break;

          if (points.length > 1) {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history.slice(1),
            ]);
          } else {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history,
            ]);
          }
          break;
        case BrushTypeEnum.CIRCLE:
          if (points.length === 0) break;
          if (points.length > 1) {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history.slice(1),
            ]);
          } else {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history,
            ]);
          }
          break;
        default:
          break;
      }
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (brush.type === BrushTypeEnum.GRAB) return;

    if (ctx && canvasElement.current) {
      let rect = (e.target as HTMLElement).getBoundingClientRect();
      if (e.touches.length === 1) {
        // Reset redo option
        if (currentHistory !== 0) {
          brushContext.setHistory(
            [...brushContext.history].slice(currentHistory)
          );
          setCurrentHistory(0);
        }

        e.preventDefault();
        let x = (e.touches[0].clientX - rect.left) / zoom;
        let y = (e.touches[0].clientY - rect.top) / zoom;

        setPainting({
          isPainting: true,
          startX: x,
          startY: y,
        });
        setPoints([]);
      }
    }
  };

  const handleMobileDraw = (e: TouchEvent) => {
    if (brush.type === BrushTypeEnum.GRAB) return;
    if (!painting.isPainting) return;
    if (e.touches.length === 0) return;

    e.preventDefault();

    let rect = (e.target as HTMLElement).getBoundingClientRect();
    let x = (e.touches[0].clientX - rect.left) / zoom;
    let y = (e.touches[0].clientY - rect.top) / zoom;

    if (ctx && canvasElement.current) {
      setPoints([...points, { x: x, y: y }]);

      ctx.lineWidth = brush.width;
      ctx.strokeStyle = brush.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (brush.type) {
        case BrushTypeEnum.PENCIL:
          ctx.lineTo(x, y);
          ctx.stroke();
          break;
        case BrushTypeEnum.RECTANGLE:
          if (points.length === 0) break;

          if (points.length > 1) {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history.slice(1),
            ]);
          } else {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history,
            ]);
          }
          break;
        case BrushTypeEnum.CIRCLE:
          if (points.length === 0) break;
          if (points.length > 1) {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history.slice(1),
            ]);
          } else {
            brushContext.setHistory([
              {
                points: [points[0], { x: x, y: y }],
                color: brush.color,
                type: brush.type,
                width: brush.width,
                stickerSize: brush.stickerSize,
              },
              ...brushContext.history,
            ]);
          }
          break;
        default:
          break;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (brush.type === BrushTypeEnum.GRAB) return;
    handleMobileDraw(e);
    e.preventDefault();

    var savedPoints = new Array<CanvasPoint>();

    if (brush.type === BrushTypeEnum.PENCIL) savedPoints = [...points];
    else if (
      brush.type === BrushTypeEnum.CROSSMARK ||
      brush.type === BrushTypeEnum.CHECKMARK
    )
      savedPoints = [...points];

    if (
      brush.type !== BrushTypeEnum.RECTANGLE &&
      brush.type !== BrushTypeEnum.CIRCLE &&
      savedPoints.length >= 1
    ) {
      brushContext.setHistory([
        {
          type: brush.type,
          color: brush.color,
          width: brush.width,
          stickerSize: brush.stickerSize,
          points: savedPoints,
        },
        ...brushContext.history,
      ]);
    }

    setPainting({
      isPainting: false,
      startX: 0,
      startY: 0,
    });

    setPoints([]);
    if (ctx) {
      ctx.stroke();
      ctx.beginPath();
    }
  };

  const getScale = (): number => {
    return 1 * zoom;
  };

  return (
    <canvas
      ref={canvasElement}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleDraw}
      onMouseLeave={handleMouseLeave}
      id="canvasElement"
      className="absolute cursor-crosshair origin-top-left"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: "scale(" + getScale() + ")",
        backgroundImage: `url("${imageUrl}")`,
        cursor: brush.type === BrushTypeEnum.GRAB ? "grab" : "crosshair",
      }}
    ></canvas>
  );
}

export default DrawingBoard;
