import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderExperience } from "@/components/reader-experience";
import { getStory, stories } from "@/lib/stories";

export function generateStaticParams() {
  return stories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  return { title: story ? `${story.title} | Muslima Stories` : "Story not found" };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  return <ReaderExperience story={story} />;
}
