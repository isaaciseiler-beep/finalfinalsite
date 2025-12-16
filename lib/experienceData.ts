// lib/experienceData.ts

export type ExperiencePhoto = {
  src: string;
  /**
   * supports simple italic markup via *...* (rendered as <em> in the UI)
   * example: "Isaac co-authored *100 Chats* along with..."
   */
  caption: string;
};

export type PressHit = {
  href: string;
  publisher: string;
  title: string;
  /** optional override; when omitted the UI will use a screenshot thumbnail */
  image?: string | null;
};

export type ExperienceItem = {
  dates: string;
  role: string;
  org: string;
  summary: string;
  link?: string;
  link_text?: string;
  image?: string | null;

  /** optional media carousel shown in the expanded (timeline) resume view */
  photos?: ExperiencePhoto[];

  /** optional press hits grid (used in Communications Director section) */
  pressHits?: PressHit[];
};

const raw: ExperienceItem[] = [
  {
    dates: "August 2025 – Present",
    role: "Fulbright Scholar",
    org: "Fulbright Taiwan",
    summary:
      "I’m living in New Taipei, Taiwan as a Fulbright Scholar, working in local elementary schools and engaging cross-culturally with students and staff. I also created and lead a collaboration with ChatGPT for Education/OpenAI and 20 Fulbright Scholars across Taiwan to benchmark education use cases for GPT-5 in K–12 English classrooms. This initiative, called a “Local Lab,” is the first partnership of its kind.",
    link: "https://fulbright.org/",
    link_text:
      "Fulbright is one of the most competitive fellowship programs in the world. Learn more →",
    image: null,
  },
  {
    dates: "March 2025 – Present",
    role: "ChatGPT Lab Member",
    org: "OpenAI",
    summary:
      "I was selected as a member of the first-ever ChatGPT Lab, a small group of students from across the United States and Canada that provides critical insight to OpenAI on education use and product launches. Through this program, I helped publish OpenAI’s first book, worked directly with product and marketing teams across five major launches, and participated in workshops with other Lab members.",
    link: "https://chatgpt.com/use-cases/students",
    link_text: "We developed 100 uses for ChatGPT in higher education. Learn more →",
    image: null,
    photos: [
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/100chatsxp.png",
        caption:
          "Isaac co-authored *100 Chats for Studying, Career, and College Life* along with other ChatGPT Lab members.",
      },
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/atlasxp.jpg",
        caption:
          "Isaac delivered critical feedback ahead of the launch of ChatGPT Atlas, OpenAI's browser",
      },
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/backtoschool.jpg",
        caption:
          "Isaac shared student-centered feedback that informed ChatGPT's first back-to-school advertising campaign",
      },
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/pulsexp.webp",
        caption:
          "OpenAI featured Isaac in the launch of ChatGPT Pulse, which proactively does research to deliver personalized updates based on your chats, feedback, and connected apps like your calendar.",
      },
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/studymodexp.png",
        caption:
          "Isaac was part of a small group of students who provided feedback for Study Mode, a ChatGPT setting that enhances student learning and tests on key concepts",
      },
    ],
  },
  {
    dates: "June 2025 – August 2025",
    role: "AI and Emerging Tech Research Fellow",
    org: "Council for State Governments, Center for Innovation",
    summary:
      "Over a few short weeks, I designed, built, and presented the first-ever state government AI adoption index, measuring across 900 data inputs how 56 state and territory governments across the United States are embracing generative artificial intelligence.",
    image: null,
  },
  {
    dates: "May 2024 – August 2025",
    role: "Social Impact Communications and Strategy",
    org: "Boehringer Ingelheim Pharmaceuticals",
    summary:
      "During my tenure at Boehringer, I directed the company’s corporate foundation’s communications strategy. I spearheaded a comprehensive rebranding initiative, conducted in-depth data analyses for narrative development, enhanced employee engagement, and collaborated with UX/UI teams to optimize user experiences for both private and public foundation resources.",
    link: "https://www.boehringer-ingelheim.com/annualreport/2024/facts-and-figures/",
    link_text:
      "Boehringer Ingelheim is one of the largest life sciences companies in the world. Learn more →",
    image: null,
  },
  {
    dates: "January 2024 – April 2025",
    role: "Freelance Communications Strategy Consultant",
    org: "Isaac Seiler Strategies",
    summary:
      "I founded and ran my own consultancy where I took on 7+ clients and delivered full digital products tailored to their needs. I worked on everything from visual assets to crisis communications, supporting organizations in Arizona, California, and Michigan.",
    link: "https://www.allysonfortustin.com/",
    link_text:
      "Check out one of the campaigns I consulted for here, including the website I built →",
    image: null,
    photos: [
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/isaacallyson.jpeg",
        caption:
          "Isaac in Orange County, California with Allyson Damikolas, one of his clients",
      },
    ],
  },
  {
    dates: "November 2022 – June 2023",
    role: "Communications Director and Transition Aide",
    org: "United States House of Representatives",
    summary:
      "I was the first staff member for a new congressional office, directing hiring, strategy formation, and complex logistics. It was my responsibility to build a political brand and create an entire congressional operation in under two months. I then built and led a competitive communications program for a new frontline member of Congress, becoming the youngest person ever to serve as Director of Communications in congressional history. I placed stories in the New York Times, Washington Post, and others, and secured cable hits on CNN’s State of the Union with Jake Tapper and Dana Bash. I led all earned, owned, and paid media for the office, reaching hundreds of thousands of people every week.",
    link: "https://www.notion.so/Press-Hit-List-25b96844a3ac4a8abac3d749412938cb?source=copy_link",
    link_text: "Check out a sample of my press hits and other materials →",
    image: null,
    photos: [
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/isaacwhitehouse.jpeg",
        caption:
          "Isaac at the White House with President Joe Biden and Vice President Kamala Harris",
      },
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/isaaccaphill.jpeg",
        caption:
          "Isaac on the Capitol steps with team members from his congressional office",
      },
    ],
    pressHits: [
      {
        href: "https://thedispatch.com/article/lawmakers-eye-a-fix-for-child-labor-problems/",
        publisher: "The Dispatch",
        title: "Lawmakers Eye a Fix for Child Labor Problems",
        image: null,
      },
      {
        href: "https://slate.com/news-and-politics/2023/03/child-migrant-labor-immigration-hillary-scholten.html",
        publisher: "Slate",
        title: "What Next: Why Child Labor Is an Immigration Issue",
        image: null,
      },
      {
        href: "https://www.nytimes.com/2023/02/27/us/biden-child-labor.html",
        publisher: "The New York Times",
        title: "Biden Administration Plans Crackdown on Migrant Child Labor",
        image: null,
      },
      {
        href: "https://www.washingtonpost.com/politics/2023/02/13/freshman-lawmakers-bipartisan-compromise/",
        publisher: "The Washington Post",
        title: "Hopeful freshman lawmakers run up against the reality of a divided House",
        image: null,
      },
      {
        href: "https://edition.cnn.com/videos/politics/2023/05/07/sotu-panel-scholten-goldberg-finney-short.cnn",
        publisher: "CNN",
        title: "State of the Union panel: Scholten, Goldberg, Finney, Short",
        image: null,
      },
      {
        href: "https://www.riaa.com/riaa-capitol-hill-mixtape-with-congresswoman-hillary-scholten/",
        publisher: "RIAA",
        title: "RIAA Capitol Hill Mixtape with Congresswoman Hillary Scholten",
        image: null,
      },
      {
        href: "https://19thnews.org/2023/05/hillary-scholten-democrats-religious-white-christian-voters/",
        publisher: "The 19th",
        title: "Rep. Hillary Scholten wants Democrats to reclaim faith without fear of extremism",
        image: null,
      },
      {
        href: "https://www.elvocero.net/articulo/congresista-scholten-optimista-sobre-proyecto-de-ley-dignidad-2023",
        publisher: "El Vocero",
        title: "Congresista Scholten optimista sobre proyecto de ley Dignidad 2023",
        image: null,
      },
      {
        href: "https://www.mlive.com/news/grand-rapids/2023/02/theyve-really-gotta-feel-the-pain-rep-scholten-says-of-company-accused-of-hiring-children-for-dangerous-jobs.html",
        publisher: "MLive",
        title:
          "‘They’ve really gotta feel the pain,’ Rep. Scholten says of company accused of hiring children for dangerous jobs",
        image: null,
      },
      {
        href: "https://michiganadvance.com/2023/04/02/scholten-says-shes-found-a-strong-sisterhood-in-congress/",
        publisher: "Michigan Advance",
        title: "Scholten says she’s found a strong sisterhood in Congress",
        image: null,
      },
    ],
  },
  {
    dates: "June 2022 – November 2022",
    role: "Digital Communications, Logistics, and Strategy",
    org: "Hillary Scholten for U.S. Congress",
    summary:
      "I began as a fellow on one of the most high-profile congressional races of 2022 and quickly moved up to oversee the campaign’s digital program. Through a rapidly scaled social media strategy, I organically reached over 1 million people weekly and generated tens of thousands in grassroots fundraising. In addition to these responsibilities, I served as the logistical backbone of the campaign, coordinating logistics for over 100 events, including events with governors, members of Congress, and cabinet secretaries.",
    link: "https://www.vanityfair.com/news/2022/06/democrats-midterms-house-michigan-districts-scholten-meijer",
    link_text: "Read the Vanity Fair piece on the primary campaign →",
    image: null,
    photos: [
      {
        src: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/resume/isaaccampaign.jpeg",
        caption:
          "Isaac during his initial internship on his hometown congressional campaign in Michigan's 3rd District",
      },
    ],
  },
  {
    dates: "January 2021 – August 2022",
    role: "Research Assistant",
    org: "Institute for Nonprofit News",
    summary:
      "I worked on a small, international research team processing and analyzing quantitative data for the largest consortium of nonprofit news organizations in the world. I also worked with INN contractors on research into how stakeholders access news on digital and social platforms.",
    link: "https://inn.org/research/inn-index/inn-index-2022/",
    link_text: "See the 2022 INN Index report →",
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
