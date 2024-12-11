import { useEffect, useRef, useState } from "react";
import { BrushTypeEnum } from "../types/BrushTypeEnum";
import { HistoryItem } from "../types/HistoryItem";
import { useDraggable } from "react-use-draggable-scroll";
import { drawHistoryItem } from "../types/funtions";
import { BrushContext } from "../context/BrushContext";
import ControlBar from "./ControlBar";
import DrawingBoard from "./DrawingBoard";
import CustomZoom from "./CustomZoom";

type EditorProps = {
  imageUrl: string;
};

function Editor({ imageUrl }: EditorProps) {
  const minZoom = 1;
  const maxZoom = 2.4;
  const zoomStep = 0.2;
  const mobileZoomStep = 0.02;

  const [brush, setBrush] = useState({
    type: BrushTypeEnum.GRAB,
    width: 3,
    color: "#FF0000",
    stickerSize: 8,
  });

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined | null>(
    null
  );
  const lastZoomValue = useRef(1);
  const [zoom, setZoom] = useState(1);
  const customSetZoom = (value: number) => {
    if (value <= minZoom) {
      setZoom(minZoom);
      lastZoomValue.current = minZoom;
      return;
    }
    if (value >= maxZoom) {
      setZoom(maxZoom);
      lastZoomValue.current = maxZoom;
      return;
    }

    setZoom(value);
    lastZoomValue.current = value;
  };

  const [imageIsReady, setImageIsReady] = useState(false);
  var imageWidth = useRef(0);
  var imageHeight = useRef(0);

  const [history, setHistory] = useState(Array<HistoryItem>());
  const [currentHistory, setCurrentHistory] = useState(0);
  const canvasContainerDiv = useRef<
    HTMLDivElement | undefined
  >() as React.MutableRefObject<HTMLInputElement>;

  const [isMounted, setIsMounted] = useState(false);
  const { events: draggableEvents } = useDraggable(canvasContainerDiv, {
    isMounted: isMounted,
  });

  useEffect(() => {
    var image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      imageWidth.current = image.width;
      imageHeight.current = image.height;

      setImageIsReady(true);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (imageIsReady === false) return;
    if (brush.type === BrushTypeEnum.GRAB) {
      var clickEvent = new Event("mouseup", {
        bubbles: true,
        cancelable: true,
      });
      canvasContainerDiv.current?.dispatchEvent(clickEvent);
      setIsMounted(true);
    } else {
      setIsMounted(false);
    }

    const redraw = () => {
      const toRedraw = history.slice(currentHistory);
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // if (image.current)
        //   ctx.drawImage(image.current, 0, 0, imageWidth, imageHeight);

        toRedraw.reverse().forEach((historyItem) => {
          ctx.lineWidth = historyItem.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = historyItem.color;

          drawHistoryItem(ctx, historyItem);

          ctx.stroke();
          ctx.beginPath();
        });
      }
    };

    redraw();
  }, [currentHistory, ctx, history, brush.type, isMounted, imageIsReady]);

  if (imageIsReady === false)
    return (
      <>
        <div>Loading...</div>
      </>
    );
  else
    return (
      <BrushContext.Provider value={{ brush, setBrush, history, setHistory }}>
        <div style={{ width: `${imageWidth.current}px` }}>
          <ControlBar
            zoom={zoom}
            setZoom={customSetZoom}
            ctx={ctx}
            currentHistory={currentHistory}
            setCurrentHistory={setCurrentHistory}
            setHistory={setHistory}
            minZoom={minZoom}
            maxZoom={maxZoom}
            zoomStep={zoomStep}
          ></ControlBar>

          <CustomZoom
            zoom={zoom}
            setZoom={customSetZoom}
            brushType={brush.type}
            maxZoom={maxZoom}
            minZoom={minZoom}
            mobileZoomStep={mobileZoomStep}
            zoomStep={zoomStep}
            canvasContainerDiv={canvasContainerDiv}
          >
            <div
              className="overflow-auto relative"
              id="canvasContainer"
              style={{
                // width: `300px`,
                // height: `400px`,
                width: `${imageWidth.current}px`,
                height: `${imageHeight.current}px`,
              }}
              {...draggableEvents}
              ref={canvasContainerDiv}
            >
              <DrawingBoard
                ctx={ctx}
                setCtx={setCtx}
                zoom={zoom}
                setCurrentHistory={setCurrentHistory}
                currentHistory={currentHistory}
                width={imageWidth.current}
                height={imageHeight.current}
                imageUrl={imageUrl}
              ></DrawingBoard>
            </div>
          </CustomZoom>
        </div>
      </BrushContext.Provider>
    );
}

export default Editor;
