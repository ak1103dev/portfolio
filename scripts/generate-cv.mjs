import { writeFileSync } from "node:fs";

const outputPath = "public/cv.pdf";

const cv = {
  name: "Apichan Chaiyutthasat",
  title: "Software Engineer",
  location: "Bangkok, Thailand",
  email: "apichan.ch@gmail.com",
  links: [
    "github.com/ak1103dev",
    "ak1103dev.medium.com",
    "x.com/ak1103dev",
  ],
  summary:
    "Software engineer building web, mobile, and backend products for engineering teams. Experienced across TypeScript, React, React Native, Node.js, Kubernetes, and production deployment workflows.",
  skills: [
    "TypeScript",
    "JavaScript",
    "React",
    "React Native",
    "Node.js",
    "HTML / CSS",
    "Docker",
    "Kubernetes",
    "Rancher",
    "RKE2",
    "GraphQL",
    "Firebase",
    "Git",
  ],
  experience: [
    {
      role: "Tech Lead",
      company: "Witsawa Corporation",
      period: "Sep 2017 - Present",
      bullets: [
        "Lead product engineering across web, mobile, backend, and deployment work.",
        "Build frontend applications with React, TypeScript, Redux, Rematch, Vue.js, and Firebase.",
        "Develop mobile applications with React Native and publish to Play Store and App Store.",
        "Design and maintain backend APIs with Node.js, LoopBack, Apollo GraphQL, and related services.",
        "Manage production services using Docker, Rancher, Kubernetes, and RKE2.",
        "Guide delivery with Kanban, code review, technical direction, and reusable project foundations.",
      ],
    },
    {
      role: "Freelance Software Engineer",
      company: "Independent",
      period: "Jan 2017 - Sep 2017",
      bullets: [
        "Built frontend web applications with React for client projects.",
        "Developed backend APIs using Node.js, Express.js, and MongoDB.",
        "Integrated payment, shipping, and third-party services such as SiamPay and Shippop.",
        "Worked directly with clients to turn product requirements into usable software.",
      ],
    },
    {
      role: "Fullstack Engineer Intern",
      company: "TakeMeTour",
      period: "Jun 2016 - Dec 2016",
      bullets: [
        "Developed Android application features with React Native.",
        "Built web application features with React and Node.js.",
        "Worked with a microservices architecture using the Spinal framework.",
        "Processed operational log data with Apache Airflow.",
      ],
    },
  ],
  selectedWork: [
    {
      title: "Blog Posts from Medium",
      description:
        "Technical writing about software engineering, product development, and lessons learned while building real systems.",
    },
    {
      title: "Rancher v1 to Rancher v2 Migration",
      description:
        "Moved deployment workflows from Rancher v1 to Rancher v2 with RKE2, improving Kubernetes operations and production deployment reliability.",
    },
  ],
  education: {
    degree: "Bachelor's Degree in Computer Engineering",
    school: "Kasetsart University",
    location: "Bangkok, Thailand",
    period: "2013 - 2017",
  },
  languages: ["Thai (Native)", "English (Professional working proficiency)"],
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const contentWidth = pageWidth - margin * 2;
const bottomMargin = 54;

const pages = [];
let commands = [];
let y = pageHeight - 54;

function escapePdf(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function addRaw(command) {
  commands.push(command);
}

function setColor(hex) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  addRaw(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
  addRaw(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
}

function line(x1, y1, x2, y2, color = "#d8dde6", width = 0.7) {
  setColor(color);
  addRaw(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function text(value, x, baseline, size = 10, font = "F1", color = "#202833") {
  setColor(color);
  addRaw(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${baseline} Tm (${escapePdf(value)}) Tj ET`);
}

function textWidth(value, size, font = "F1") {
  const ratio = font === "F2" ? 0.55 : 0.5;
  return String(value).length * size * ratio;
}

function wrap(value, maxWidth, size = 10, font = "F1") {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (textWidth(next, size, font) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function newPage() {
  pages.push(commands.join("\n"));
  commands = [];
  y = pageHeight - 54;
}

function ensureSpace(height) {
  if (y - height < bottomMargin) {
    newPage();
  }
}

function paragraph(value, options = {}) {
  const {
    x = margin,
    width = contentWidth,
    size = 10,
    font = "F1",
    color = "#394454",
    leading = size + 4,
    after = 8,
  } = options;
  const lines = wrap(value, width, size, font);
  ensureSpace(lines.length * leading + after);
  for (const lineValue of lines) {
    text(lineValue, x, y, size, font, color);
    y -= leading;
  }
  y -= after;
}

function sectionTitle(value) {
  ensureSpace(34);
  y -= 8;
  text(value.toUpperCase(), margin, y, 9, "F2", "#16796b");
  y -= 10;
  line(margin, y, pageWidth - margin, y, "#d8dde6", 0.7);
  y -= 16;
}

function bullet(value) {
  const bulletX = margin + 10;
  const textX = margin + 24;
  const lines = wrap(value, contentWidth - 24, 9.5, "F1");
  ensureSpace(lines.length * 13 + 4);
  text("•", bulletX, y, 9.5, "F1", "#16796b");
  for (const lineValue of lines) {
    text(lineValue, textX, y, 9.5, "F1", "#394454");
    y -= 13;
  }
  y -= 2;
}

function role(item) {
  ensureSpace(72);
  text(`${item.role}, ${item.company}`, margin, y, 11.5, "F2", "#202833");
  text(item.period, pageWidth - margin - textWidth(item.period, 9.5, "F1"), y, 9.5, "F1", "#667085");
  y -= 18;
  for (const itemBullet of item.bullets) {
    bullet(itemBullet);
  }
  y -= 8;
}

setColor("#ffffff");
addRaw(`0 0 ${pageWidth} ${pageHeight} re f`);

text(cv.name, margin, y, 24, "F2", "#111827");
y -= 24;
text(cv.title, margin, y, 13, "F1", "#16796b");
y -= 18;
paragraph(`${cv.location} | ${cv.email} | ${cv.links.join(" | ")}`, {
  size: 9.5,
  color: "#4b5563",
  after: 12,
});
line(margin, y, pageWidth - margin, y, "#cfd6df", 0.9);
y -= 22;

sectionTitle("Profile");
paragraph(cv.summary, { size: 10.5, color: "#394454", leading: 15, after: 4 });

sectionTitle("Technical Skills");
paragraph(cv.skills.join(" | "), { size: 9.8, color: "#394454", leading: 14, after: 2 });

sectionTitle("Experience");
for (const item of cv.experience) {
  role(item);
}

sectionTitle("Selected Work");
for (const work of cv.selectedWork) {
  ensureSpace(48);
  text(work.title, margin, y, 11, "F2", "#202833");
  y -= 16;
  paragraph(work.description, { size: 9.5, color: "#394454", leading: 13, after: 4 });
}

sectionTitle("Education");
ensureSpace(44);
text(cv.education.degree, margin, y, 11, "F2", "#202833");
text(cv.education.period, pageWidth - margin - textWidth(cv.education.period, 9.5, "F1"), y, 9.5, "F1", "#667085");
y -= 15;
text(`${cv.education.school}, ${cv.education.location}`, margin, y, 9.5, "F1", "#394454");
y -= 22;

sectionTitle("Languages");
paragraph(cv.languages.join(" | "), { size: 9.8, color: "#394454", leading: 14, after: 0 });

pages.push(commands.join("\n"));

function pdfObject(value) {
  return `${value}\n`;
}

const objects = [];
objects.push(pdfObject("<< /Type /Catalog /Pages 2 0 R >>"));
objects.push("");
objects.push(pdfObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));
objects.push(pdfObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"));

const pageObjectIds = [];
for (let index = 0; index < pages.length; index += 1) {
  const pageId = objects.length + 1;
  const contentId = pageId + 1;
  pageObjectIds.push(pageId);
  objects.push(pdfObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`));
  const stream = pages[index];
  objects.push(pdfObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`));
}

objects[1] = pdfObject(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`);

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (let index = 0; index < objects.length; index += 1) {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${index + 1} 0 obj\n${objects[index]}endobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let index = 1; index < offsets.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

writeFileSync(outputPath, pdf);
console.log(`Generated ${outputPath} with ${pages.length} page(s).`);
