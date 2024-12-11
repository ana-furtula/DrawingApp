import { AiOutlineClear, AiOutlineSelect } from "react-icons/ai";
import {
  BiImport,
  BiSave,
  BiPencil,
  BiSquare,
  BiCircle,
  BiPlus,
  BiMinus,
  BiRedo,
  BiUndo,
  BiX,
  BiCheck,
} from "react-icons/bi";
import { BsBorderWidth } from "react-icons/bs";
import LineWidthModal from "./modals/LineWidthModal";
import ControlButton from "./ControlButton";
import ColorModal from "./modals/ColorModal";
import { useContext, useRef } from "react";
import { BrushContext } from "../context/BrushContext";
import { BrushTypeEnum } from "../types/BrushTypeEnum";
import StickerSizeModal from "./modals/StickerSizeModal";

type ControlBarProps = {
  ctx: CanvasRenderingContext2D | undefined | null;
  zoom: number;
  setZoom: Function;
  setCurrentHistory: Function;
  currentHistory: number;
  setHistory: Function;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
};

function ControlBar({
  ctx,
  zoom,
  setZoom,
  currentHistory,
  setCurrentHistory,
  setHistory,
  minZoom,
  maxZoom,
  zoomStep,
}: ControlBarProps) {
  const brushContext = useContext(BrushContext);
  const brush = brushContext.brush;

  const setBrush = (type: BrushTypeEnum, color: string = brush.color) => {
    if (type) {
      brushContext.setBrush({
        width: brush.width,
        type: type ? type : brush.type,
        color: color,
        stickerSize: brush.stickerSize,
      });
    }
  };

  //   const saveAsPng = () => {
  //     const canvasElement = document.getElementById("canvasElement");

  //     const a = document.createElement("a");
  //     a.href = (canvasElement as HTMLCanvasElement).toDataURL("image/png");
  //     a.download = "image.png";
  //     a.click();
  //   };

  const saveAsJson = () => {
    const link = document.createElement("a");
    const content = JSON.stringify(brushContext.history);
    const file = new Blob([content], { type: "application/json" });
    link.href = URL.createObjectURL(file);
    link.download = `canvas_export_${Date.now()}_${Math.floor(
      Math.random() * 3
    )}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importInput = useRef<HTMLInputElement | null>(null);

  const onImportClick = () => {
    importInput.current?.click();
  };

  const importJson = (e: any) => {
    if (e.target.files.length === 0) return;
    const reader = new FileReader();
    try {
      reader.onload = () => {
        setHistory(JSON.parse(reader.result as string));
        // drawCanvas(getContext());
        // render();
      };
      reader.readAsText(e.target.files[0]);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className="w-full py-2 md:py-0 h-100 md:h-100 bg-neutral-100 border-b border-neutral-300 px-5 items-center text-neutral-600 z-50"
      style={{ position: "sticky", top: 0 }}
    >
      {/* Save, undo, redo, clear canvas */}
      <div className="flex h-full gap-3 justify-center items-center">
        {/* Import canvas */}
        <input
          ref={importInput}
          className="hidden"
          type="file"
          accept="application/json"
          onChange={importJson}
        />
        <button className="button" type="button" onClick={onImportClick}>
          <span className="peer">
            <BiImport className="icon-accessibility"></BiImport>
          </span>
        </button>

        {/* Save image */}
        <ControlButton
          onClick={saveAsJson}
          icon={<BiSave className="icon-accessibility"></BiSave>}
        ></ControlButton>

        {/* Undo history */}
        <ControlButton
          onClick={() =>
            brushContext.history.length !== currentHistory &&
            setCurrentHistory(currentHistory + 1)
          }
          icon={
            <BiUndo
              className={
                "icon-accessibility " +
                (brushContext.history.length === currentHistory &&
                  "icon-inactive")
              }
            ></BiUndo>
          }
        ></ControlButton>

        {/* Redo history */}
        <ControlButton
          onClick={() =>
            currentHistory > 0 && setCurrentHistory(currentHistory - 1)
          }
          icon={
            <BiRedo
              className={
                "icon-accessibility " +
                (currentHistory === 0 && "icon-inactive")
              }
            ></BiRedo>
          }
        ></ControlButton>

        {/* Clear canvas */}
        <ControlButton
          onClick={() => {
            if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            brushContext.setHistory([]);
            setCurrentHistory(0);
          }}
          icon={
            <AiOutlineClear
              className={
                "icon-accessibility " +
                (brushContext.history.length === currentHistory &&
                  "icon-inactive")
              }
            ></AiOutlineClear>
          }
        ></ControlButton>
      </div>

      {/* Scroll values */}
      <div className="flex h-full gap-3 justify-center items-center">
        <button onClick={() => setZoom((zoom * 100 - 10) / 100)}>
          <BiMinus className="icon-accessibility"></BiMinus>
        </button>
        <input
          type="range"
          min={minZoom * 100}
          max={maxZoom * 100}
          step={zoomStep * 100}
          value={zoom * 100}
          onChange={(e) => setZoom((e.target.value as any) / 100)}
        />
        <button onClick={() => setZoom(((zoom + zoomStep) * 100) / 100)}>
          <BiPlus className="icon-accessibility"></BiPlus>
        </button>
      </div>

      {/* Tools */}
      <div
        className="flex h-full gap-3 justify-center items-center order-3 md:order-none"
        style={{ paddingBottom: "10px" }}
      >
        {/* Hand */}
        <ControlButton
          onClick={() => setBrush(BrushTypeEnum.GRAB)}
          activeProp={brush.type === BrushTypeEnum.GRAB}
          icon={
            <AiOutlineSelect className="icon-accessibility"></AiOutlineSelect>
          }
        ></ControlButton>

        {/* Pen */}
        <ControlButton
          onClick={() => setBrush(BrushTypeEnum.PENCIL)}
          activeProp={brush.type === BrushTypeEnum.PENCIL}
          icon={<BiPencil className="icon-accessibility"></BiPencil>}
        ></ControlButton>

        {/* Square */}
        <ControlButton
          onClick={() => setBrush(BrushTypeEnum.RECTANGLE)}
          activeProp={brush.type === BrushTypeEnum.RECTANGLE}
          icon={<BiSquare className="icon-accessibility"></BiSquare>}
        ></ControlButton>

        {/* Circle */}
        <ControlButton
          onClick={() => setBrush(BrushTypeEnum.CIRCLE)}
          activeProp={brush.type === BrushTypeEnum.CIRCLE}
          icon={<BiCircle className="icon-accessibility"></BiCircle>}
        ></ControlButton>

        {/* Cross mark */}
        <ControlButton
          onClick={() => setBrush(BrushTypeEnum.CROSSMARK, "#FF0000")}
          activeProp={brush.type === BrushTypeEnum.CROSSMARK}
          icon={<BiX className="icon-accessibility"></BiX>}
          modal={<StickerSizeModal></StickerSizeModal>}
        ></ControlButton>

        {/* Check mark */}
        <ControlButton
          onClick={() => setBrush(BrushTypeEnum.CHECKMARK, "#008000")}
          activeProp={brush.type === BrushTypeEnum.CHECKMARK}
          icon={<BiCheck className="icon-accessibility"></BiCheck>}
          modal={<StickerSizeModal></StickerSizeModal>}
        ></ControlButton>

        {/* Line width */}
        <ControlButton
          icon={<BsBorderWidth className="icon-accessibility"></BsBorderWidth>}
          modal={<LineWidthModal></LineWidthModal>}
        ></ControlButton>

        {/* Color */}
        <ControlButton
          icon={
            <div
              className="h-6 w-6 border border-neutral-300 rounded-lg cursor-pointer"
              style={{ backgroundColor: brush.color }}
            ></div>
          }
          modal={<ColorModal></ColorModal>}
        ></ControlButton>
      </div>
    </div>
  );
}

export default ControlBar;
