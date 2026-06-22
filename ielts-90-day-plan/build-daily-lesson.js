const fs = require("fs");
const path = require("path");

const planPath = path.join(__dirname, "index.html");
const outputPath = path.join(__dirname, "daily-lesson.json");

const html = fs.readFileSync(planPath, "utf8");

function extractArray(name) {
  const marker = `const ${name} = [`;
  const start = html.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find ${name}`);
  }
  let index = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(start + marker.length - 1, index + 1);
      }
    }
  }
  throw new Error(`Failed to parse ${name}`);
}

function extractValue(name) {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find ${name}`);
  }
  let index = start + marker.length;
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;
  let started = false;

  for (; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      inString = true;
      stringChar = char;
      started = true;
      continue;
    }
    if (char === "{" || char === "[") {
      depth += 1;
      started = true;
      continue;
    }
    if (char === "}" || char === "]") {
      depth -= 1;
      if (started && depth === 0) {
        return html.slice(start + marker.length, index + 1);
      }
      continue;
    }
    if (!started && char === ";") {
      throw new Error(`Could not parse ${name}`);
    }
  }
  throw new Error(`Failed to parse ${name}`);
}

const vocabItems = eval(extractArray("vocabItems")); // local data from the page
const cycleData = eval(extractArray("cycleData"));
const frames = eval(extractArray("frames"));

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function categoryMeaning(category) {
  if (category === "speaking") {
    return {
      en: "This speaking word helps you sound clearer and more natural.",
      zh: "这个口语词可以帮助你说得更清楚、更自然。",
    };
  }
  if (category === "listening") {
    return {
      en: "This listening word helps you catch answers, numbers, and details.",
      zh: "这个听力词可以帮助你抓住答案、数字和细节。",
    };
  }
  if (category === "reading") {
    return {
      en: "This reading word helps you understand questions and paraphrases faster.",
      zh: "这个阅读词可以帮助你更快看懂题目和改写。",
    };
  }
  if (category === "writing") {
    return {
      en: "This writing word helps you build strong IELTS paragraphs and ideas.",
      zh: "这个写作词可以帮助你写出更强的雅思段落和观点。",
    };
  }
  return {
    en: "This exam word helps you speak, write, read, or listen more effectively.",
    zh: "这个考试词可以帮助你更有效地说、写、读或听。",
  };
}

function getKualaLumpurDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return `${map.year}-${map.month}-${map.day}`;
}

const dateKey = getKualaLumpurDateKey();
const hash = hashString(dateKey);
const vocab = vocabItems[hash % vocabItems.length];
const cycle = cycleData[hash % cycleData.length];
const frame = frames[hash % frames.length];
const meaning = categoryMeaning(vocab.category);

const lesson = {
  dateKey,
  seedDateKey: dateKey,
  source: "workflow",
  vocab,
  cycle,
  frame,
  meaningEn: meaning.en,
  meaningZh: meaning.zh,
  promptEn: `Use this frame: ${frame.en}`,
  promptZh: `使用这个句型：${frame.zh}`,
  sourceEn: "This lesson is auto-picked from the word bank and refreshes every day.",
  sourceZh: "这节课会从词汇库里自动抽取，并每天刷新。",
};

fs.writeFileSync(outputPath, `${JSON.stringify(lesson, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
