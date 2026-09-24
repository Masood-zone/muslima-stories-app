"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Feather, House, Sparkles } from "lucide-react";
import type { Story } from "@/lib/stories";
import { paginate, pageAtOffset, type ReadingPage } from "@/lib/paginate";
import { PageTurnBook, type PageTurnHandle } from "@/components/page-turn-book";

type Phase = "opening" | "intro" | "reading";

export function ReaderExperience({ story }: { story: Story }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("opening");
  const [pages, setPages] = useState<ReadingPage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wide, setWide] = useState(false);
  const [turning, setTurning] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const pageTurnRef = useRef<PageTurnHandle>(null);
  const anchorRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("intro"), reduceMotion ? 100 : 930);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  useLayoutEffect(() => {
    if (phase !== "reading") return;
    const book = bookRef.current;
    if (!book) return;
    let frame = 0;
    let mounted = true;
    const recalculate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!mounted || !paperRef.current) return;
        pageTurnRef.current?.cancel();
        const content = paperRef.current;
        const style = getComputedStyle(content);
        const isWide = window.matchMedia("(min-width: 860px)").matches;
        const nextPages = paginate(story.paragraphs, {
          width: content.clientWidth,
          height: content.clientHeight,
          fontSize: parseFloat(style.fontSize),
          fontFamily: style.fontFamily,
          lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize),
        });
        setWide(isWide);
        setPages(nextPages);
        const found = pageAtOffset(nextPages, anchorRef.current);
        setCurrentIndex(isWide ? Math.floor(found / 2) * 2 : found);
      });
    };
    const observer = new ResizeObserver(recalculate);
    observer.observe(book);
    window.addEventListener("resize", recalculate);
    void document.fonts.ready.then(recalculate);
    recalculate();
    return () => { mounted = false; observer.disconnect(); window.removeEventListener("resize", recalculate); cancelAnimationFrame(frame); };
  }, [phase, story.paragraphs]);

  const step = wide ? 2 : 1;
  const lastStart = wide ? Math.floor(Math.max(pages.length - 1, 0) / 2) * 2 : pages.length - 1;
  const canBack = currentIndex > 0;
  const canNext = currentIndex < lastStart;

  const commitTurn = useCallback((nextDirection: -1 | 1) => {
    const target = currentIndex + nextDirection * step;
    if (target < 0 || target > lastStart) return;
    anchorRef.current = pages[target]?.startOffset ?? 0;
    setCurrentIndex(target);
  }, [currentIndex, lastStart, pages, step]);

  const turn = useCallback((nextDirection: -1 | 1) => {
    pageTurnRef.current?.turn(nextDirection);
  }, []);

  useEffect(() => {
    if (phase !== "reading") return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") { event.preventDefault(); turn(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); turn(-1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, turn]);

  const pagePosition = pages.length ? Math.min(currentIndex + 1, pages.length) : 0;
  const progress = pages.length ? Math.min(((currentIndex + step) / pages.length) * 100, 100) : 0;

  return (
    <main className="reader-shell">
      <header className="reader-header wrap">
        <Link href="/" className="reader-home"><span className="brand-mark small"><BookOpen size={19} /></span><strong>Muslima Stories</strong></Link>
        <span className="reader-header-label">A STORY BY MUSLIMA ACHEAMPONG</span>
        <Link href="/" className="return-link"><House size={17} /><span>Library</span></Link>
      </header>

      <AnimatePresence>
        {phase === "opening" && (
          <motion.section key="opening" className="opening-stage" exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: reduceMotion ? 0.01 : 0.35 }} aria-label={`Opening ${story.title}`}>
            <div className="opening-book">
              <div className="opening-frame"><Image src={story.frame} alt="" fill sizes="(max-width: 700px) 70vw, 360px" priority /></div>
              <motion.div className="opening-cover" initial={{ rotateY: 0 }} animate={{ rotateY: reduceMotion ? 0 : -105 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}><Image src={story.cover} alt={`${story.title} cover`} fill sizes="(max-width: 700px) 70vw, 360px" priority /></motion.div>
            </div>
            <p>Opening your story<span className="loading-dots">...</span></p>
          </motion.section>
        )}

        {phase === "intro" && (
          <motion.section key="intro" className="intro-stage wrap" initial={reduceMotion ? false : { opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: reduceMotion ? 0.01 : 0.45 }}>
            <div className="intro-image"><Image src={story.frame} alt={`${story.title} illustration`} fill sizes="(max-width: 800px) 80vw, 400px" priority /></div>
            <div className="intro-content">
              <span className="intro-kicker"><Sparkles size={16} /> BEFORE THE FIRST PAGE</span>
              <h1>{story.title}</h1>
              <p className="intro-lede">Every story has a world waiting inside. Settle in, turn the page, and see where this one takes you.</p>
              <div className="metadata-list">
                <div><span>Genre</span><strong>{story.genre}</strong></div>
                <div><span>Written by</span><strong>{story.author}</strong></div>
                <div><span>Year</span><strong>{story.year}</strong></div>
              </div>
              <button type="button" className="primary-button begin-button" onClick={() => setPhase("reading")}>Begin reading <ArrowRight size={19} /></button>
              <span className="intro-side-note"><Feather size={17} /> A story from the Muslima Stories collection</span>
            </div>
          </motion.section>
        )}

        {phase === "reading" && (
          <motion.section key="reading" className="reading-stage wrap" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.45 }}>
            <div className="reading-heading"><div><span className="reading-eyebrow">NOW READING</span><h1>{story.title}</h1></div><button type="button" className="back-to-intro" onClick={() => setPhase("intro")}><ArrowLeft size={15} /> Story introduction</button></div>
            <PageTurnBook ref={pageTurnRef} pages={pages} currentIndex={currentIndex} wide={wide} title={story.title} canBack={canBack} canNext={canNext} reduceMotion={Boolean(reduceMotion)} bookRef={bookRef} paperRef={paperRef} onCommit={commitTurn} onBusyChange={setTurning} />
            <div className="reader-controls"><button className="turn-button" type="button" onClick={() => turn(-1)} disabled={!canBack || turning}><ChevronLeft size={19} /> Previous</button><div className="reading-progress"><span>Page {pagePosition} {wide && pages.length > currentIndex + 1 ? `– ${currentIndex + 2}` : ""} of {pages.length || "…"}</span><div className="progress-track"><div style={{ width: `${progress}%` }} /></div></div><button className="turn-button" type="button" onClick={() => turn(1)} disabled={!canNext || turning}>Next <ChevronRight size={19} /></button></div>
            {!canNext && pages.length > 0 && <div className="end-message"><Sparkles size={17} /> You reached the end of this story. <Link href="/">Find another book <ArrowRight size={15} /></Link></div>}
            <div className="reader-hint">Tap a page corner, hold and drag its edge, or use the arrow keys to turn pages</div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
