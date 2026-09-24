"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, Ref, TouchEvent as ReactTouchEvent } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReadingPage } from "@/lib/paginate";

type Direction = -1 | 1;
type Flip = { direction: Direction };
type PointerStart = { id: number; direction: Direction; x: number; y: number; time: number; moved: boolean };

export type PageTurnHandle = { turn: (direction: Direction) => void; cancel: () => void };

type Props = {
  pages: ReadingPage[];
  currentIndex: number;
  wide: boolean;
  title: string;
  canBack: boolean;
  canNext: boolean;
  reduceMotion: boolean;
  bookRef: Ref<HTMLDivElement>;
  paperRef: Ref<HTMLDivElement>;
  onCommit: (direction: Direction) => void;
  onFlipSound: (direction: Direction) => void;
  onBusyChange: (busy: boolean) => void;
};

function StoryPaper({ page, pageNumber, title, innerRef }: { page?: ReadingPage; pageNumber: number; title: string; innerRef?: Ref<HTMLDivElement> }) {
  return (
    <div className="paper">
      <div className="paper-top"><span>✦ MUSLIMA STORIES</span><span>{title}</span></div>
      <div className="paper-content" ref={innerRef}>
        {page?.blocks.map((block) => (
          <p key={`${block.paragraphIndex}-${block.start}`} className={`reading-paragraph${block.continued ? " is-continuation" : ""}`}>{block.text}</p>
        ))}
      </div>
      <div className="paper-bottom"><span className="paper-ornament">✦</span><span>{page ? pageNumber : ""}</span></div>
    </div>
  );
}

export const PageTurnBook = forwardRef<PageTurnHandle, Props>(function PageTurnBook({
  pages, currentIndex, wide, title, canBack, canNext, reduceMotion, bookRef, paperRef, onCommit, onFlipSound, onBusyChange,
}, ref) {
  const [flip, setFlip] = useState<Flip | null>(null);
  const progress = useMotionValue(0);
  const directionRef = useRef<Direction>(1);
  const busyRef = useRef(false);
  const pointerRef = useRef<PointerStart | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const rotation = useTransform(progress, (value) => (directionRef.current === 1 ? -180 : 180) * value);
  const movingShadow = useTransform(progress, (value) => Math.sin(value * Math.PI) * 0.36);
  const edgeLight = useTransform(progress, (value) => 0.2 + Math.sin(value * Math.PI) * 0.5);

  const clearHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }, []);

  const finish = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
    progress.set(0);
    setFlip(null);
    pointerRef.current = null;
    busyRef.current = false;
    onBusyChange(false);
  }, [onBusyChange, progress]);

  const cancel = useCallback(() => {
    clearHold();
    finish();
  }, [clearHold, finish]);

  const settle = useCallback((destination: 0 | 1, direction: Direction) => {
    clearHold();
    animationRef.current?.stop();
    if (reduceMotion) {
      if (destination === 1) {
        onCommit(direction);
        onFlipSound(direction);
      }
      finish();
      return;
    }
    directionRef.current = direction;
    setFlip({ direction });
    const distance = Math.abs(destination - progress.get());
    animationRef.current = animate(progress, destination, {
      duration: Math.max(0.22, distance * 0.78),
      ease: [0.23, 0.8, 0.22, 1],
      onComplete: () => {
        if (destination === 1) {
          onCommit(direction);
          onFlipSound(direction);
        }
        finish();
      },
    });
  }, [clearHold, finish, onCommit, onFlipSound, progress, reduceMotion]);

  const turn = useCallback((direction: Direction) => {
    if (busyRef.current || !pages.length || (direction === 1 ? !canNext : !canBack)) return;
    busyRef.current = true;
    onBusyChange(true);
    directionRef.current = direction;
    progress.set(0);
    settle(1, direction);
  }, [canBack, canNext, onBusyChange, pages.length, progress, settle]);

  useImperativeHandle(ref, () => ({ turn, cancel }), [turn, cancel]);

  useEffect(() => () => {
    clearHold();
    animationRef.current?.stop();
    onBusyChange(false);
  }, [clearHold, onBusyChange]);

  const preview = useCallback((direction: Direction) => {
    if (!pointerRef.current || reduceMotion) return;
    directionRef.current = direction;
    setFlip({ direction });
    animationRef.current?.stop();
    if (progress.get() < 0.08) {
      animationRef.current = animate(progress, 0.08, { duration: 0.22, ease: "easeOut" });
    }
  }, [progress, reduceMotion]);

  const pointerDown = (event: ReactPointerEvent<HTMLButtonElement>, direction: Direction) => {
    if (busyRef.current || (direction === 1 ? !canNext : !canBack)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    busyRef.current = true;
    onBusyChange(true);
    pointerRef.current = { id: event.pointerId, direction, x: event.clientX, y: event.clientY, time: performance.now(), moved: false };
    directionRef.current = direction;
    progress.set(0);
    holdTimer.current = setTimeout(() => preview(direction), 140);
  };

  const pointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerRef.current;
    if (!start || event.pointerId !== start.id) return;
    const travel = start.direction === 1 ? start.x - event.clientX : event.clientX - start.x;
    if (Math.abs(travel) < 6 && !start.moved) return;
    start.moved = true;
    clearHold();
    directionRef.current = start.direction;
    setFlip({ direction: start.direction });
    animationRef.current?.stop();
    const book = event.currentTarget.closest(".book-outer");
    const width = book ? book.getBoundingClientRect().width / (wide ? 2 : 1) : 1;
    progress.set(Math.max(0, Math.min(travel / width, 1)));
  };

  const pointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerRef.current;
    if (!start || event.pointerId !== start.id) return;
    clearHold();
    const quickTap = !start.moved && performance.now() - start.time < 200;
    const passedMiddle = start.moved && progress.get() >= 0.5;
    pointerRef.current = null;
    settle(quickTap || passedMiddle ? 1 : 0, start.direction);
  };

  const pointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerRef.current;
    if (!start || event.pointerId !== start.id) return;
    pointerRef.current = null;
    settle(0, start.direction);
  };

  const touchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".page-grab")) return;
    swipeStart.current = { x: event.touches[0]?.clientX ?? 0, y: event.touches[0]?.clientY ?? 0 };
  };

  const touchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || busyRef.current) return;
    const horizontal = (event.changedTouches[0]?.clientX ?? start.x) - start.x;
    const vertical = (event.changedTouches[0]?.clientY ?? start.y) - start.y;
    if (Math.abs(horizontal) > 55 && Math.abs(horizontal) > Math.abs(vertical) * 1.3) turn(horizontal < 0 ? 1 : -1);
  };

  const targetIndex = currentIndex + (flip?.direction ?? 0) * (wide ? 2 : 1);
  const leftIndex = flip?.direction === -1 && wide ? targetIndex : currentIndex;
  const rightIndex = flip?.direction === 1 && wide ? targetIndex + 1 : currentIndex + 1;
  const mobileIndex = flip ? targetIndex : currentIndex;
  const frontIndex = flip ? (wide ? (flip.direction === 1 ? currentIndex + 1 : currentIndex) : currentIndex) : currentIndex;
  const backIndex = flip ? (wide ? (flip.direction === 1 ? targetIndex : targetIndex + 1) : targetIndex) : currentIndex;

  return (
    <div className="book-outer" ref={bookRef} onTouchStart={touchStart} onTouchEnd={touchEnd}>
      <div className="book-binding" aria-hidden="true" />
      <div className="book-spread">
        <div className="book-page book-page-left"><StoryPaper page={pages[wide ? leftIndex : mobileIndex]} pageNumber={(wide ? leftIndex : mobileIndex) + 1} title={title} innerRef={paperRef} /></div>
        <div className="book-page book-page-right"><StoryPaper page={pages[rightIndex]} pageNumber={rightIndex + 1} title={title} /></div>
        {flip && !reduceMotion && (
          <motion.div className={`flip-leaf ${flip.direction === 1 ? "flip-forward" : "flip-backward"}`} style={{ rotateY: rotation }} aria-hidden="true">
            <div className="flip-face flip-face-front"><StoryPaper page={pages[frontIndex]} pageNumber={frontIndex + 1} title={title} /><motion.div className="flip-shade" style={{ opacity: movingShadow }} /><motion.div className="flip-edge" style={{ opacity: edgeLight }} /></div>
            <div className="flip-face flip-face-back"><StoryPaper page={pages[backIndex]} pageNumber={backIndex + 1} title={title} /><motion.div className="flip-shade flip-shade-back" style={{ opacity: movingShadow }} /></div>
          </motion.div>
        )}
        {flip && !reduceMotion && <motion.div className={`cast-shadow ${flip.direction === 1 ? "cast-shadow-left" : "cast-shadow-right"}`} style={{ opacity: movingShadow }} aria-hidden="true" />}
        {canBack && <button type="button" className="page-grab page-grab-back" aria-label="Hold or drag to turn to the previous page" aria-disabled={Boolean(flip)} onPointerDown={(event) => pointerDown(event, -1)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel} onClick={() => turn(-1)}><ChevronLeft size={16} /></button>}
        {canNext && <button type="button" className="page-grab page-grab-next" aria-label="Hold or drag to turn to the next page" aria-disabled={Boolean(flip)} onPointerDown={(event) => pointerDown(event, 1)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel} onClick={() => turn(1)}><ChevronRight size={16} /></button>}
      </div>
    </div>
  );
});
