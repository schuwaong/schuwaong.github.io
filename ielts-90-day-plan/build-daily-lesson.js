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
const advancedDailyWords = eval(extractArray("advancedDailyWords"));
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
      en: "This speaking word helps Becky sound clearer and more natural.",
      zh: "这个口语词可以帮助 Becky 说得更清楚、更自然。",
    };
  }
  if (category === "listening") {
    return {
      en: "This listening word helps Becky catch answers, numbers, and details.",
      zh: "这个听力词可以帮助 Becky 抓住答案、数字和细节。",
    };
  }
  if (category === "reading") {
    return {
      en: "This reading word helps Becky understand questions and paraphrases faster.",
      zh: "这个阅读词可以帮助 Becky 更快看懂题目和改写。",
    };
  }
  if (category === "writing") {
    return {
      en: "This writing word helps Becky build stronger IELTS paragraphs and ideas.",
      zh: "这个写作词可以帮助 Becky 写出更强的雅思段落和观点。",
    };
  }
  if (category === "study") {
    return {
      en: "This study word helps Becky talk about learning and progress more precisely.",
      zh: "这个学习词可以帮助 Becky 更准确地表达学习和进步。",
    };
  }
  return {
    en: "This is a stronger IELTS word. Learn the meaning, shadow the example, then use it in one sentence.",
    zh: "这是一个更高分的雅思词。先理解意思，跟读例句，再用它造一句。",
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
const vocab = advancedDailyWords[hash % advancedDailyWords.length] || vocabItems[hash % vocabItems.length];
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
  promptEn: `China drill: read the Chinese meaning, shadow the example twice, then make one Becky-style sentence with "${vocab.term}" using ${frame.en}`,
  promptZh: `中文母语者练法：先看中文意思，跟读例句两遍，再用 "${vocab.term}" 和 ${frame.zh} 写一句 Becky 自己的话。`,
  sourceEn: "This harder word is auto-picked for Becky and refreshes every day with a China-friendly output drill.",
  sourceZh: "这个高分词会每天自动为 Becky 刷新，并配中文母语者适用的输出练习。",
};

fs.writeFileSync(outputPath, `${JSON.stringify(lesson, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
