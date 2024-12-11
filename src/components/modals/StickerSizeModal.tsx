import { useContext } from "react";
import { BrushContext } from "../../context/BrushContext";
import Modal from "./Modal";

function StickerSizeModal({
  loc,
  hideModal,
}: {
  loc?: { x: number; y: number };
  hideModal?: Function;
}) {
  const brushContext = useContext(BrushContext);

  const handleStickerSizeChange = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>,
    val: number
  ) => {
    e.stopPropagation();
    if (!val) return;

    brushContext.setBrush({
      type: brushContext.brush.type,
      width: brushContext.brush.width,
      color: brushContext.brush.color,
      stickerSize: val,
    });
  };

  return (
    <Modal hideModal={hideModal}>
      <div
        className="animate-slideFromTop absolute w-max bg-white border border-neutral-300 p-2 rounded-lg"
        style={{ left: loc?.x, top: loc?.y }}
      >
        {[8, 16, 24, 40].map((val) => {
          return (
            <div
              id={"modal_" + val}
              onClick={(e) => handleStickerSizeChange(e, val)}
              key={val}
              className={
                (brushContext.brush.stickerSize === val && "bg-neutral-100") +
                " cursor-pointer hover:bg-neutral-100 py-2 px-3 rounded-lg text-xs flex justify-center items-center gap-4 relative"
              }
            >
              <span>{val}px</span>
              {brushContext.brush.stickerSize === val && (
                <>
                  <div className="absolute h-3 rounded-lg w-1 bg-indigo-600 left-0 -translate-x-1/2"></div>
                </>
              )}
            </div>
          );
        })}
        <hr className="my-2" />
        <div className="w-full px-1 rounded-lg text-xs flex items-center gap-2 relative">
          <input
            onClick={(e) => e.stopPropagation()}
            type="number"
            value={brushContext.brush.stickerSize}
            onChange={(e) =>
              handleStickerSizeChange(e, parseInt(e.target.value))
            }
            className="px-2 w-20 h-6 bg-white border border-neutral-300 rounded-lg"
          />
          <span>px</span>
        </div>
      </div>
    </Modal>
  );
}

export default StickerSizeModal;
