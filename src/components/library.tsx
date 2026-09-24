"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Feather, Sparkles } from "lucide-react";
import type { Story } from "@/lib/stories";

const groups = ["All stories", "Moral tales", "Family", "Friendship", "Fables", "Inspiration"] as const;

function inGroup(story: Story, group: (typeof groups)[number]) {
  if (group === "All stories") return true;
  if (group === "Moral tales") return story.genre === "Moral tale" || story.genre === "Cautionary tale";
  if (group === "Family") return story.genre.includes("Family");
  if (group === "Friendship") return story.genre.includes("Friendship");
  if (group === "Fables") return story.genre.toLowerCase().includes("fable");
  return story.genre.startsWith("Inspirational");
}

export function Library({ stories }: { stories: Story[] }) {
  const [group, setGroup] = useState<(typeof groups)[number]>("All stories");
  const reduceMotion = useReducedMotion();
  const visible = useMemo(() => stories.filter((story) => inGroup(story, group)), [stories, group]);

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="site-header wrap">
        <Link href="/" className="brand" aria-label="Muslima Stories home">
          <span className="brand-mark"><BookOpen size={22} strokeWidth={2.1} /></span>
          <span className="brand-copy"><strong>Muslima Stories</strong><small>Little library · Big lessons</small></span>
        </Link>
        <a href="#library" className="header-link">Explore the library <ArrowRight size={16} /></a>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> STORIES BY MUSLIMA ACHEAMPONG</div>
          <h1 id="hero-title">A little library<br /><em>of big adventures.</em></h1>
          <p>Open a book, turn a page, and step into a world of friendship, family, courage, and lessons to carry with you.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#library">Explore 13 stories <ArrowRight size={19} /></a>
            <span className="hero-year"><Feather size={17} /> Written in 2020</span>
          </div>
          <div className="hero-note"><span className="hero-note-line" />Made for curious readers of every age</div>
        </div>
        <div className="hero-art" aria-label="Illustrated storybook covers">
          <div className="hero-sun" aria-hidden="true" />
          {[stories[2], stories[1], stories[0]].map((story, index) => (
            <motion.div
              key={story.slug}
              className={`hero-book hero-book-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 65, rotate: index === 0 ? -14 : index === 1 ? 9 : 0 }}
              animate={{ opacity: 1, y: 0, rotate: index === 0 ? -13 : index === 1 ? 10 : -2 }}
              transition={{ delay: index * 0.12, duration: 0.7, type: "spring", stiffness: 85 }}
            >
              <Image src={story.cover} alt={`${story.title} book cover`} fill sizes="(max-width: 700px) 44vw, 270px" priority={index === 2} />
            </motion.div>
          ))}
          <div className="hero-sparkle hero-sparkle-one" aria-hidden="true">✦</div>
          <div className="hero-sparkle hero-sparkle-two" aria-hidden="true">✦</div>
        </div>
      </section>

      <section id="library" className="library-section wrap" aria-labelledby="library-title">
        <div className="section-heading">
          <div><div className="eyebrow eyebrow-small">THE STORY SHELF</div><h2 id="library-title">Pick your next read<span>.</span></h2></div>
          <span className="story-count">{stories.length} books to discover</span>
        </div>
        <div className="filter-bar" aria-label="Filter stories by genre">
          {groups.map((item) => (
            <button key={item} type="button" className={`filter-pill ${group === item ? "active" : ""}`} onClick={() => setGroup(item)} aria-pressed={group === item}>{item}</button>
          ))}
        </div>
        <motion.div className="story-grid" layout>
          {visible.map((story, index) => (
            <motion.div key={story.slug} layout initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.28) }}>
              <Link className="story-card" href={`/stories/${story.slug}`} aria-label={`Open ${story.title}`}>
                <div className="card-cover-shell">
                  <div className="card-spine" aria-hidden="true" />
                  <motion.div className="card-cover" whileHover={reduceMotion ? undefined : { rotateY: -13, x: 5, scale: 1.025 }} whileTap={reduceMotion ? undefined : { rotateY: -25, scale: 0.98 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <Image src={story.cover} alt="" fill sizes="(max-width: 640px) 44vw, (max-width: 1000px) 27vw, 20vw" />
                  </motion.div>
                  <span className="card-open-hint"><BookOpen size={14} /> Open book</span>
                </div>
                <div className="card-details"><span className="card-genre">{story.genre}</span><h3>{story.title}</h3><span className="card-author">Muslima Acheampong <span>·</span> 2020</span></div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <footer className="site-footer wrap"><span className="footer-brand">Muslima Stories ✦</span><span>Thirteen stories. Countless little lessons.</span><span>© 2020 Muslima Acheampong</span></footer>
    </main>
  );
}
