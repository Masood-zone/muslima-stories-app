export type PageBlock = {
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
  continued: boolean;
};

export type ReadingPage = {
  blocks: PageBlock[];
  startOffset: number;
  endOffset: number;
};

type PageSize = { width: number; height: number; fontSize: number; fontFamily: string; lineHeight: number };

export function paginate(paragraphs: string[], size: PageSize): ReadingPage[] {
  if (!paragraphs.length || size.width < 40 || size.height < 50) return [];
  const measure = document.createElement("div");
  measure.className = "page-copy measuring-copy";
  Object.assign(measure.style, {
    position: "fixed", left: "-10000px", top: "0", visibility: "hidden",
    width: `${size.width}px`, height: "auto", maxHeight: "none", overflow: "visible",
    fontSize: `${size.fontSize}px`, fontFamily: size.fontFamily, lineHeight: String(size.lineHeight),
  });
  document.body.appendChild(measure);

  const renderedHeight = (blocks: PageBlock[]) => {
    measure.replaceChildren();
    for (const block of blocks) {
      const p = document.createElement("p");
      p.className = `reading-paragraph${block.continued ? " is-continuation" : ""}`;
      p.textContent = block.text;
      measure.appendChild(p);
    }
    return measure.getBoundingClientRect().height;
  };

  const pages: ReadingPage[] = [];
  let blocks: PageBlock[] = [];
  const offsets: number[] = [];
  let runningOffset = 0;
  for (const paragraph of paragraphs) {
    offsets.push(runningOffset);
    runningOffset += paragraph.length + 1;
  }
  const finish = () => {
    if (!blocks.length) return;
    const first = blocks[0];
    const last = blocks[blocks.length - 1];
    pages.push({ blocks, startOffset: offsets[first.paragraphIndex] + first.start, endOffset: offsets[last.paragraphIndex] + last.end });
    blocks = [];
  };

  try {
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const boundaries = [...paragraph.matchAll(/\s+/g)].map((match) => (match.index ?? 0) + match[0].length);
      if (boundaries.at(-1) !== paragraph.length) boundaries.push(paragraph.length);
      let cursor = 0;
      while (cursor < paragraph.length) {
        const block = (end: number): PageBlock => ({ paragraphIndex, start: cursor, end, text: paragraph.slice(cursor, end), continued: cursor > 0 });
        const full = block(paragraph.length);
        if (renderedHeight([...blocks, full]) <= size.height) {
          blocks.push(full);
          cursor = paragraph.length;
          continue;
        }
        const options = boundaries.filter((end) => end > cursor);
        let low = 0;
        let high = options.length - 1;
        let fitting = -1;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2);
          if (renderedHeight([...blocks, block(options[middle])]) <= size.height) {
            fitting = middle;
            low = middle + 1;
          } else high = middle - 1;
        }
        if (fitting < 0 && blocks.length) {
          finish();
          continue;
        }
        const end = options[Math.max(fitting, 0)];
        blocks.push(block(end));
        cursor = end;
        finish();
      }
    });
    finish();
    const fragments = paragraphs.map(() => "");
    const positions = paragraphs.map(() => 0);
    for (const page of pages) {
      for (const part of page.blocks) {
        if (part.start !== positions[part.paragraphIndex] || part.text !== paragraphs[part.paragraphIndex].slice(part.start, part.end)) {
          throw new Error("A reading page contains missing or repeated text.");
        }
        fragments[part.paragraphIndex] += part.text;
        positions[part.paragraphIndex] = part.end;
      }
    }
    if (fragments.some((text, index) => text !== paragraphs[index])) {
      throw new Error("A reading page contains missing or repeated text.");
    }
    return pages;
  } finally {
    measure.remove();
  }
}

export function pageAtOffset(pages: ReadingPage[], offset: number) {
  const containing = pages.findIndex((page) => page.startOffset <= offset && offset < page.endOffset);
  if (containing >= 0) return containing;
  const next = pages.findIndex((page) => page.startOffset > offset);
  return next >= 0 ? next : Math.max(0, pages.length - 1);
}
