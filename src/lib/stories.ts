import data from "@/generated/stories.json";

export type Story = {
  slug: string;
  title: string;
  genre: string;
  author: string;
  year: number;
  cover: string;
  frame: string;
  paragraphs: string[];
  wordCount: number;
};

export const stories: Story[] = data;

export function getStory(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug);
}
