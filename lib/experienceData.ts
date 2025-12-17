// lib/experienceData.ts — FULL FILE (unchanged structure; add images if desired)
export type ExperienceItem = {
  dates: string;
  role: string;
  org: string;
  summary: string;
  link?: string;
  link_text?: string;
  image?: string | null;
  /** Optional photo strip shown under an entry (URLs). */
  photos?: string[] | null;
};

const raw: ExperienceItem[] = [
  {
    dates: "August 2025 – Present",
    role: "Fulbright Scholar",
    org: "Fulbright Taiwan",
    summary:
      "Isaac is living in New Taipei, Taiwan as a Fulbright Scholar, working in local elementary schools and engaging cross‑culturally with students and staff. He also created and leads a collaboration with ChatGPT for Education/OpenAI and 20 Fulbright Scholars across Taiwan to benchmark education use cases for GPT‑5 in K–12 English classrooms. This initiative, called a “Local Lab,” is the first partnership of its kind.",
    link: "https://fulbright.org/",
    link_text:
      "Fulbright is one of the most competitive fellowship programs in the world. Learn more",
    image: null,
  },
  {
    dates: "March 2025 – Present",
    role: "ChatGPT Lab Member",
    org: "OpenAI",
    summary:
      "Isaac was selected as a member of the first‑ever ChatGPT Lab, a small group of students from across the United States and Canada that provides critical insight to OpenAI on education use and product launches. Through this program, he helped publish OpenAI’s first book, worked directly with product and marketing teams across five major launches, and participated in workshops with other Lab members.",
    link: "https://chatgpt.com/use-cases/students",
    link_text: "He co‑developed 100 uses for ChatGPT in higher education. Learn more",
    image: null,
  },
  {
    dates: "June 2025 – August 2025",
    role: "AI and Emerging Tech Research Fellow",
    org: "Council for State Governments, Center for Innovation",
    summary:
      "Over a few short weeks, Isaac designed, built, and presented the first‑ever state government AI adoption index, measuring (across 900 data inputs) how 56 state and territory governments across the United States are embracing generative artificial intelligence.",
    image: null,
  },
  {
    dates: "May 2024 – August 2025",
    role: "Social Impact Communications and Strategy",
    org: "Boehringer Ingelheim Pharmaceuticals",
    summary:
      "At Boehringer Ingelheim Pharmaceuticals, Isaac directed the corporate foundation’s communications strategy. He spearheaded a comprehensive rebranding initiative, conducted in‑depth data analyses for narrative development, strengthened employee engagement, and collaborated with UX/UI teams to optimize user experiences for both private and public foundation resources.",
    link: "https://www.boehringer-ingelheim.com/annualreport/2024/facts-and-figures/",
    link_text:
      "Boehringer Ingelheim is one of the largest life sciences companies in the world. Learn more",
    image: null,
  },
  {
    dates: "January 2024 – April 2025",
    role: "Freelance Communications Strategy Consultant",
    org: "Isaac Seiler Strategies",
    summary:
      "Isaac founded and ran his own consultancy, taking on 7+ clients and delivering full digital products tailored to their needs. He worked on everything from visual assets to crisis communications, supporting organizations in Arizona, California, and Michigan.",
    link: "https://www.allysonfortustin.com/",
    link_text:
      "Explore one of the campaigns he consulted for (including a site he built)",
    image: null,
  },
  {
    dates: "November 2022 – June 2023",
    role: "Communications Director and Transition Aide",
    org: "United States House of Representatives",
    summary:
      "Isaac was the first staff member for a new congressional office, directing hiring, strategy formation, and complex logistics. He helped build a political brand and stand up an entire congressional operation in under two months. He then built and led a competitive communications program for a frontline member of Congress, becoming the youngest person to serve as Director of Communications in congressional history. He placed stories in outlets including the New York Times and Washington Post, secured cable hits on CNN’s State of the Union with Jake Tapper and Dana Bash, and led earned, owned, and paid media for the office—reaching hundreds of thousands of people each week.",
    link: "https://www.notion.so/Press-Hit-List-25b96844a3ac4a8abac3d749412938cb?source=copy_link",
    link_text: "Browse a sample of press hits and other materials",
    image: null,
  },
  {
    dates: "June 2022 – November 2022",
    role: "Digital Communications, Logistics, and Strategy",
    org: "Hillary Scholten for U.S. Congress",
    summary:
      "Isaac began as a fellow on one of the most high‑profile congressional races of 2022 and quickly moved up to oversee the campaign’s digital program. Through a rapidly scaled social media strategy, he organically reached over 1 million people weekly and generated tens of thousands in grassroots fundraising. In addition, he served as the logistical backbone of the campaign—coordinating logistics for 100+ events, including events with governors, members of Congress, and cabinet secretaries.",
    link: "https://www.vanityfair.com/news/2022/06/democrats-midterms-house-michigan-districts-scholten-meijer",
    link_text: "Read the Vanity Fair piece on the primary campaign",
    image: null,
  },
  {
    dates: "January 2021 – August 2022",
    role: "Research Assistant",
    org: "Institute for Nonprofit News",
    summary:
      "Isaac worked on a small, international research team processing and analyzing quantitative data for the largest consortium of nonprofit news organizations in the world. He also partnered with INN contractors on research into how stakeholders access news on digital and social platforms.",
    link: "https://inn.org/research/inn-index/inn-index-2022/inn-index-2022/",
    link_text: "See the 2022 INN Index report",
    image: null,
  },
];

const order: Record<string, (item: ExperienceItem) => boolean> = {
  "2025": (i) =>
    i.role.includes("Fulbright") ||
    i.role.includes("ChatGPT Lab") ||
    i.role.includes("Emerging Tech"),
  "2024": (i) =>
    i.role.includes("Social Impact") || i.role.includes("Freelance Communications"),
  "2023": (i) => i.role.includes("Communications Director"),
  "2022": (i) => i.role.includes("Digital Communications"),
  "2021": (i) => i.role.includes("Research Assistant"),
};

export const experienceByYear: Record<string, ExperienceItem[]> = Object.fromEntries(
  Object.keys(order).map((y) => [y, raw.filter(order[y as keyof typeof order])]),
);
