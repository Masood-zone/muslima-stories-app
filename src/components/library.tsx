"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Feather,
  Heart,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
  Monitor,
} from "lucide-react";
import type { Story } from "@/lib/stories";
import { useTheme } from "@/components/theme-provider";
import { playStorySound } from "@/lib/sounds";

const groups = [
  "All stories",
  "Moral tales",
  "Family",
  "Friendship",
  "Fables",
  "Inspiration",
  "Favorites",
] as const;
const FAVORITES_KEY = "muslima-stories:favorites";
const LAST_OPENED_KEY = "muslima-stories:last-opened";
function readString(key: string, fallback: string | null = null) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function readList(key: string) {
  const raw = readString(key, "[]");
  try {
    const value = JSON.parse(raw ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function inGroup(
  story: Story,
  group: (typeof groups)[number],
  favorites: string[],
) {
  if (group === "All stories") return true;
  if (group === "Favorites") return favorites.includes(story.slug);
  if (group === "Moral tales")
    return story.genre === "Moral tale" || story.genre === "Cautionary tale";
  if (group === "Family") return story.genre.includes("Family");
  if (group === "Friendship") return story.genre.includes("Friendship");
  if (group === "Fables") return story.genre.toLowerCase().includes("fable");
  return story.genre.startsWith("Inspirational");
}

function matchesQuery(story: Story, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  const searchText =
    `${story.title} ${story.genre} ${story.author} ${story.title.toLowerCase()} ${story.genre.toLowerCase()} ${story.author.toLowerCase()}`.toLowerCase();
  return searchText.includes(value);
}

export function Library({ stories }: { stories: Story[] }) {
  const [group, setGroup] = useState<(typeof groups)[number]>("All stories");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  const { mode, resolvedTheme, setMode } = useTheme();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const savedFavorites = readList(FAVORITES_KEY);
    const savedLast = readString(LAST_OPENED_KEY, null);
    setFavorites(savedFavorites);
    setLastOpened(savedLast);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastOpened) {
      window.localStorage.setItem(LAST_OPENED_KEY, lastOpened);
    } else {
      window.localStorage.removeItem(LAST_OPENED_KEY);
    }
  }, [lastOpened]);

  const visible = useMemo(
    () =>
      stories.filter(
        (story) =>
          inGroup(story, group, favorites) && matchesQuery(story, query),
      ),
    [stories, group, favorites, query],
  );

  const resumeStory = useMemo(
    () => stories.find((story) => story.slug === lastOpened) ?? null,
    [stories, lastOpened],
  );

  const toggleFavorite = (slug: string) => {
    const adding = !favorites.includes(slug);
    setFavorites((current) =>
      current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug],
    );
    if (adding) playStorySound("favorite");
  };

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="site-header wrap">
        <Link href="/" className="brand" aria-label="Muslima Stories home">
          <span className="brand-mark">
            <BookOpen size={22} strokeWidth={2.1} />
          </span>
          <span className="brand-copy">
            <strong>Muslima Stories</strong>
            <small>Little library · Big lessons</small>
          </span>
        </Link>
        <a href="#library" className="header-link">
          Explore the library <ArrowRight size={16} />
        </a>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} /> STORIES BY MUSLIMA ACHEAMPONG
          </div>
          <h1 id="hero-title">
            A little library
            <br />
            <em>of big adventures.</em>
          </h1>
          <p>
            Open a book, turn a page, and step into a world of friendship,
            family, courage, and lessons to carry with you.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#library">
              Explore 13 stories <ArrowRight size={19} />
            </a>
            <span className="hero-year">
              <Feather size={17} /> Written in 2020
            </span>
          </div>
          <div className="hero-note">
            <span className="hero-note-line" />
            Made for curious readers of every age
          </div>
        </div>
        <div className="hero-art" aria-label="Illustrated storybook covers">
          <div className="hero-sun" aria-hidden="true" />
          {[stories[2], stories[1], stories[0]].map((story, index) => (
            <motion.div
              key={story.slug}
              className={`hero-book hero-book-${index}`}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 65,
                      rotate: index === 0 ? -14 : index === 1 ? 9 : 0,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                rotate: index === 0 ? -13 : index === 1 ? 10 : -2,
              }}
              transition={{
                delay: index * 0.12,
                duration: 0.7,
                type: "spring",
                stiffness: 85,
              }}
            >
              <Image
                src={story.cover}
                alt={`${story.title} book cover`}
                fill
                sizes="(max-width: 700px) 44vw, 270px"
                priority={index === 2}
              />
            </motion.div>
          ))}
          <div className="hero-sparkle hero-sparkle-one" aria-hidden="true">
            ✦
          </div>
          <div className="hero-sparkle hero-sparkle-two" aria-hidden="true">
            ✦
          </div>
        </div>
      </section>

      <section
        id="library"
        className="library-section wrap"
        aria-labelledby="library-title"
      >
        <div className="library-tools">
          <label className="search-box" aria-label="Search stories">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories, themes, or keywords"
            />
          </label>

          <button
            type="button"
            className="theme-toggle"
            aria-label={`Theme: ${mode}. Switch to ${mode === "system" ? "light" : mode === "light" ? "dark" : "system"} mode`}
            title={`Theme: ${mode}`}
            onClick={() =>
              setMode(
                mode === "system"
                  ? "light"
                  : mode === "light"
                    ? "dark"
                    : "system",
              )
            }
          >
            {mode === "system" ? (
              <Monitor size={16} />
            ) : resolvedTheme === "dark" ? (
              <SunMedium size={16} />
            ) : (
              <MoonStar size={16} />
            )}
          </button>
        </div>

        {resumeStory ? (
          <div className="resume-card">
            <div className="resume-copy">
              <span className="eyebrow eyebrow-small">Continue reading</span>
              <h3>{resumeStory.title}</h3>
              <p>{resumeStory.genre}</p>
            </div>
            <Link
              className="primary-button"
              href={`/stories/${resumeStory.slug}`}
            >
              Resume <ArrowRight size={18} />
            </Link>
          </div>
        ) : null}

        <div className="section-heading">
          <div>
            <div className="eyebrow eyebrow-small">THE STORY SHELF</div>
            <h2 id="library-title">
              Pick your next read<span>.</span>
            </h2>
          </div>
          <span className="story-count">
            {visible.length} of {stories.length} books
          </span>
        </div>
        <div className="filter-bar" aria-label="Filter stories by genre">
          {groups
            .filter((item) => item !== "Favorites" || favorites.length > 0)
            .map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-pill ${group === item ? "active" : ""}`}
                onClick={() => setGroup(item)}
                aria-pressed={group === item}
              >
                {item}
              </button>
            ))}
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            <h3>No stories match that search.</h3>
            <p>Try another title, mood, or genre keyword.</p>
          </div>
        ) : null}

        <motion.div className="story-grid" layout>
          {visible.map((story, index) => {
            const favorite = favorites.includes(story.slug);
            return (
              <motion.div
                key={story.slug}
                layout
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.04, 0.28),
                }}
                className="story-card-wrap"
              >
                <button
                  type="button"
                  className={`favorite-button ${favorite ? "is-active" : ""}`}
                  onClick={() => toggleFavorite(story.slug)}
                  aria-label={
                    favorite
                      ? `Remove ${story.title} from favorites`
                      : `Add ${story.title} to favorites`
                  }
                >
                  <Heart size={16} fill={favorite ? "currentColor" : "none"} />
                </button>
                <Link
                  className="story-card"
                  href={`/stories/${story.slug}`}
                  aria-label={`Open ${story.title}`}
                >
                  <div className="card-cover-shell">
                    <div className="card-spine" aria-hidden="true" />
                    <motion.div
                      className="card-cover"
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { rotateY: -13, x: 5, scale: 1.025 }
                      }
                      whileTap={
                        reduceMotion ? undefined : { rotateY: -25, scale: 0.98 }
                      }
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image
                        src={story.cover}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 44vw, (max-width: 1000px) 27vw, 20vw"
                      />
                    </motion.div>
                    <span className="card-open-hint">
                      <BookOpen size={14} /> Open book
                    </span>
                  </div>
                  <div className="card-details">
                    <span className="card-genre">{story.genre}</span>
                    <h3>{story.title}</h3>
                    <span className="card-author">
                      Muslima Acheampong <span>·</span> 2020
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
      <footer className="site-footer">
        <div className="site-footer-inner wrap">
          <div className="footer-brand">Muslima Stories <span aria-hidden="true">✦</span></div>
          <p>Thirteen stories. Countless little lessons.</p>
          <small>© 2020 Muslima Acheampong</small>
        </div>
      </footer>
    </main>
  );
}
