import { useCallback, useEffect, useRef, useState } from "react";
import { BrushTypeEnum } from "../types/BrushTypeEnum";

type CustomZoomProps = {
  children: JSX.Element;
  zoom: number;
  setZoom: Function;
  maxZoom: number;
  minZoom: number;
  zoomStep: number;
  mobileZoomStep: number;
  brushType: BrushTypeEnum;
  canvasContainerDiv: React.MutableRefObject<HTMLInputElement>;
};

function CustomZoom({
  children,
  zoom,
  setZoom,
  maxZoom,
  minZoom,
  zoomStep,
  mobileZoomStep,
  brushType,
  canvasContainerDiv,
}: CustomZoomProps) {
  const initialPinchZoomDistance = useRef<number | null>(null);
  const initialPinchZoomCenter = useRef({ x: 0, y: 0 });

  const getDistance = (touches: any) => {
    const [touch1, touch2] = touches;
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };
  const getCenter = (touches: any) => {
    const [touch1, touch2] = touches;
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const scrollCanvasContainerOnZoom = useCallback(
    (
      currentZoom: number,
      newZoom: number,
      eClientX: number,
      eClientY: number
    ) => {
      // Pribavljanje dimenzija i pozicije pokazivača miša
      const rect = canvasContainerDiv.current.getBoundingClientRect();
      const mouseX = eClientX - rect.left; // Pozicija miša u odnosu na div
      const mouseY = eClientY - rect.top;

      // Trenutna scroll pozicija
      const scrollLeft = canvasContainerDiv.current.scrollLeft;
      const scrollTop = canvasContainerDiv.current.scrollTop;

      // Izračunavanje nove pozicije scrolla
      const newScrollLeft =
        (mouseX + scrollLeft) * (newZoom / currentZoom) - mouseX;
      const newScrollTop =
        (mouseY + scrollTop) * (newZoom / currentZoom) - mouseY;

      setTimeout(() =>
        canvasContainerDiv.current.scrollTo({
          left: newScrollLeft,
          top: newScrollTop,
          behavior: "smooth",
        })
      );
    },
    [canvasContainerDiv]
  );

  const scrollCanvasContainerOnMobileZoom = useCallback(
    (currentZoom: number, newZoom: number) => {
      const rect = canvasContainerDiv.current.getBoundingClientRect();
      const deltaX =
        (initialPinchZoomCenter.current.x -
          rect.left +
          canvasContainerDiv.current.scrollLeft) *
        (newZoom / currentZoom);
      const deltaY =
        (initialPinchZoomCenter.current.y -
          rect.top +
          canvasContainerDiv.current.scrollTop) *
        (newZoom / currentZoom);

      // alert(`${newScrollLeft}, ${newScrollTop}`);

      // Ažuriranje skale i scroll-a
      setTimeout(() =>
        canvasContainerDiv.current.scrollTo({
          left: deltaX - (initialPinchZoomCenter.current.x - rect.left),
          top: deltaY - (initialPinchZoomCenter.current.y - rect.top),
        })
      );
    },
    [canvasContainerDiv]
  );

  useEffect(() => {
    const changeZoom = (e: any) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      var isZoomIn = e.deltaY < 0;
      var isZoomOut = e.deltaY > 0;

      if (isZoomIn === false && isZoomOut === false) return;
      if (isZoomIn && zoom === maxZoom) return;
      if (isZoomOut && zoom === minZoom) return;

      let val = isZoomOut === true ? zoomStep * 100 : -zoomStep * 100;
      const value = zoom * 100 - val;
      setZoom(value / 100);

      if (canvasContainerDiv.current)
        scrollCanvasContainerOnZoom(zoom, value / 100, e.clientX, e.clientY);
    };

    var currentCanvasContainer = canvasContainerDiv.current;

    canvasContainerDiv.current.addEventListener("wheel", changeZoom, {
      capture: true,
      passive: false,
    });

    return () => {
      currentCanvasContainer.removeEventListener("wheel", changeZoom, true);
    };
  }, [
    zoom,
    children,
    setZoom,
    maxZoom,
    minZoom,
    zoomStep,
    canvasContainerDiv,
    scrollCanvasContainerOnZoom,
  ]);

  useEffect(() => {
    var currentCanvasContainer = canvasContainerDiv.current;
    if (!currentCanvasContainer) return;

    const handlePinchZoomStart = (e: TouchEvent) => {
      if (brushType !== BrushTypeEnum.GRAB) return;
      if (e.touches.length !== 2) return;
      e.preventDefault();
      e.stopPropagation();

      initialPinchZoomDistance.current = getDistance(e.touches);
      initialPinchZoomCenter.current = getCenter(e.touches);
    };

    const handlePinchZoomMove = (e: TouchEvent) => {
      if (brushType !== BrushTypeEnum.GRAB) return;
      if (e.touches.length !== 2) return;
      if (!initialPinchZoomDistance.current) return;

      e.preventDefault();

      const currentDistance = getDistance(e.touches);

      var newZoomVal = zoom;
      if (currentDistance > initialPinchZoomDistance.current) {
        if (zoom === maxZoom) return;
        newZoomVal += mobileZoomStep;
      } else {
        if (zoom === minZoom) return;
        newZoomVal -= mobileZoomStep;
      }

      setZoom(newZoomVal);

      if (canvasContainerDiv)
        scrollCanvasContainerOnMobileZoom(zoom, newZoomVal);
    };

    const handlePinchZoomEnd = () => {
      initialPinchZoomDistance.current = null;
      initialPinchZoomCenter.current = { x: 0, y: 0 };
    };

    canvasContainerDiv.current.addEventListener(
      "touchstart",
      handlePinchZoomStart,
      false
    );
    canvasContainerDiv.current.addEventListener(
      "touchmove",
      handlePinchZoomMove,
      false
    );
    canvasContainerDiv.current.addEventListener(
      "touchend",
      handlePinchZoomEnd,
      false
    );

    return () => {
      currentCanvasContainer.removeEventListener(
        "touchstart",
        handlePinchZoomStart,
        false
      );
      currentCanvasContainer.removeEventListener(
        "touchmove",
        handlePinchZoomMove,
        false
      );
      currentCanvasContainer.removeEventListener(
        "touchend",
        handlePinchZoomEnd,
        false
      );
    };
  }, [
    zoom,
    setZoom,
    brushType,
    canvasContainerDiv,
    mobileZoomStep,
    scrollCanvasContainerOnMobileZoom,
  ]);

  return <>{children}</>;
}

export default CustomZoom;
