import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "content", "docx");
const art = path.join(root, "public", "books");
const destination = path.join(root, "src", "generated", "stories.json");

const entries = [
  ["afua-the-beautiful-girl", "01 - AFUA NYAMEKYE THE BEAUTIFUL GIRL.docx", "Moral tale", "Afua Beautiful Girl Cover.png", "Afua Main Frame.png"],
  ["the-three-friends", "02 - THE THREE FRIENDS.docx", "Friendship drama", "3 friends Cover.png", "3 Friends Main Frame.png"],
  ["the-three-rivals", "03 - The Three Rivals.docx", "Family drama", "3 Rivals Cover.png", "3 Rivals Main Frame.png"],
  ["the-brothers", "04 - The Brothers.docx", "Family drama", "The Brothers Cover.png", "The Brothers Main Frame.png"],
  ["the-disrespectful-boy", "05 - Franks story Or The Disrespectful Boy.docx", "Moral tale", "Frank Story Cover.png", "Frank Story Main Frame.png"],
  ["the-evil-friends", "06 - The Evil Friends.docx", "Cautionary tale", "Evil Friends Cover.png", "Evil Friends Main Frame.png"],
  ["the-innocent-girl", "07 - The Innocent Girl.docx", "Family drama", "Innocent Girl Cover.png", "Innocent Girl Main Frame.png"],
  ["the-lazy-frog", "08 - The Lazy Frog.docx", "Animal fable", "Lazy Frog Cover.png", "Lazy Frog Main Frame.png"],
  ["the-rejected-boy", "09 - The Rejected Boy.docx", "Inspirational drama", "The Rejected Boy Cover.png", "The Rejected Boy Main Frame.png"],
  ["the-shoemaker", "10 - The Shoemaker, Agya Prampram.docx", "Inspirational tale", "Shoemaker Cover.png", "Shoemaker Main Frame.png"],
  ["the-trouble-maker", "11 - The Trouble Maker.docx", "Moral tale", "Trouble Maker Cover and Main Frame.png", "Trouble Maker Cover and Main Frame.png"],
  ["the-twins", "12 - The Twins.docx", "Family drama", "The Twins Cover and Main Frame.png", "The Twins Cover and Main Frame.png"],
  ["the-wicked-stepmother", "13 - The Wicked Stepmother.docx", "Family fantasy", "Wicked Stepmother Cover and Frame.png", "Wicked Stepmother Cover and Frame.png"],
];

const docxFiles = (await fs.readdir(source)).filter((name) => name.endsWith(".docx"));
if (docxFiles.length !== entries.length) {
  throw new Error(`Expected ${entries.length} DOCX files, found ${docxFiles.length}`);
}

const stories = [];
for (const [slug, file, genre, coverFile, frameFile] of entries) {
  for (const name of [file]) await fs.access(path.join(source, name));
  for (const name of [coverFile, frameFile]) await fs.access(path.join(art, name));
  const { value, messages } = await mammoth.extractRawText({ path: path.join(source, file) });
  const paragraphs = value.split(/\r?\n\s*\r?\n/g).map((part) => part.trim()).filter(Boolean);
  const [title, ...body] = paragraphs;
  if (!title || body.length === 0) throw new Error(`Story is empty: ${file}`);
  if (messages.some((message) => message.type === "error")) throw new Error(`Could not read ${file}: ${messages.map((message) => message.message).join("; ")}`);
  stories.push({
    slug,
    title,
    genre,
    author: "Muslima Acheampong",
    year: 2020,
    cover: `/books/${encodeURIComponent(coverFile)}`,
    frame: `/books/${encodeURIComponent(frameFile)}`,
    paragraphs: body,
    wordCount: body.join(" ").trim().split(/\s+/).length,
  });
}

await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, `${JSON.stringify(stories, null, 2)}\n`, "utf8");
console.log(`Imported ${stories.length} stories and ${stories.reduce((sum, story) => sum + story.wordCount, 0)} words.`);
