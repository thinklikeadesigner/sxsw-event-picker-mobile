import { RawEvent, CityEvent } from '../../data/types';

const EVENTS_DATA: RawEvent[] = [
  {
    uid: "boston-tw-2026-20260527-001@tech-week.com",
    summary: "Boston Runs on Tech, a networking run for charity",
    description: "",
    dtstart: "20260527T070000",
    dtend: "20260527T083000",
    url: "https://partiful.com/e/oGNKfuBbxjT0G8ebHcyw",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Networking",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-002@tech-week.com",
    summary: "AI & Biotech Runtime",
    description: "",
    dtstart: "20260527T073000",
    dtend: "20260527T090000",
    url: "https://partiful.com/e/FJXCHsTzgGQQQwt1qWGG",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-003@tech-week.com",
    summary: "BOSTON STRONG: Tech Pushup Challenge",
    description: "",
    dtstart: "20260527T073000",
    dtend: "20260527T090000",
    url: "https://partiful.com/e/QqdXzM3VDuw9CXoMJbrC",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Experiential",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-004@tech-week.com",
    summary: "How Do You Build a Borderless Tech Career in the AI Era?",
    description: "",
    dtstart: "20260527T080000",
    dtend: "20260527T093000",
    url: "https://partiful.com/e/wsRxKuFjnimcau9TsjTC",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-005@tech-week.com",
    summary: "AI for Decision Makers: Autonomous Systems and AI Design",
    description: "",
    dtstart: "20260527T080000",
    dtend: "20260527T093000",
    url: "https://partiful.com/e/WVI9NC4M90TGwh5Iw3md",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-006@tech-week.com",
    summary: "The Future of Work is Behavioral: Soft Agents Launch",
    description: "",
    dtstart: "20260527T080000",
    dtend: "20260527T093000",
    url: "https://partiful.com/e/dpB4igv26fzW1uMcrKiQ",
    location: "Kendall Square, Cambridge, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-007@tech-week.com",
    summary: "Verify Your networth",
    description: "",
    dtstart: "20260527T080000",
    dtend: "20260527T093000",
    url: "",
    location: "Cambridge, MA",
    cost: "Invite Only",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-008@tech-week.com",
    summary: "Women who build Boston - From mentorship to sponsorship with Lovable",
    description: "",
    dtstart: "20260527T083000",
    dtend: "20260527T100000",
    url: "https://partiful.com/e/GYflfIUGGMMQ0LWj5KjA",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-009@tech-week.com",
    summary: "Founders & Funders in Food & Ag",
    description: "",
    dtstart: "20260527T083000",
    dtend: "20260527T100000",
    url: "https://partiful.com/e/dWQkRrJbv7CIP1hVclIA",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-010@tech-week.com",
    summary: "Boston Protocol: Hacking Healthcare",
    description: "",
    dtstart: "20260527T083000",
    dtend: "20260527T100000",
    url: "https://partiful.com/e/co1H0pbx1kjHrxbCe4Mz",
    location: "Cambridge, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-011@tech-week.com",
    summary: "Investor Networking Breakfast (with J2 Ventures & J.P. Morgan)",
    description: "",
    dtstart: "20260527T083000",
    dtend: "20260527T100000",
    url: "https://partiful.com/e/Ti9tl54xX64jrR61nRA0",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-012@tech-week.com",
    summary: "Private Founders Breakfast ft. Zendesk Ventures & Will Ventures",
    description: "",
    dtstart: "20260527T083000",
    dtend: "20260527T100000",
    url: "https://partiful.com/e/DL0cyjjWtONMJZvp9R6K",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-013@tech-week.com",
    summary: "Breakfast Mixer",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/vQ3j7n2KyWbdrbHBZgX6",
    location: "Cambridge, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-014@tech-week.com",
    summary: "The Revolution Started Here: Moving Fast and Minting Things",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/GrSlGjHe4vQFMwHwczfE",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-015@tech-week.com",
    summary: "Boston Tech Week Defense Breakfast",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/pwxiFLTVCzq4xx02D44S",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-016@tech-week.com",
    summary: "Applied AI Founders & Builders Breakfast",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/AXnfEzPrICv2bkOmaOjf",
    location: "Cambridge, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-017@tech-week.com",
    summary: "Women's Health Breakfast",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/HHSHwj6EefPW6vGKWE7h",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-018@tech-week.com",
    summary: "Where Does the Talent Go?",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/LbEtriasonbT4NoKbVxw",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "Networking",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-019@tech-week.com",
    summary: "Female Founders & Funders Breakfast",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/WBNgOQ0xCiCtwA6Uf9Gc",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-020@tech-week.com",
    summary: "Defensible AI: Building Trust and Resilience in the Enterprise",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/DIrd1qZz5zkJYUA9jvg3",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-021@tech-week.com",
    summary: "The Business of Video: What's Working Now (and What's Next)",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/2KVSudYlzQpKBweLOwH9",
    location: "Cambridge, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-022@tech-week.com",
    summary: "From Fired to Founder: The AI-Native Company Playbook",
    description: "",
    dtstart: "20260527T090000",
    dtend: "20260527T103000",
    url: "https://partiful.com/e/BtQRRqcR7PpYOVHBbwvF",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-023@tech-week.com",
    summary: "Founders & Fitness",
    description: "",
    dtstart: "20260527T091500",
    dtend: "20260527T104500",
    url: "https://partiful.com/e/zREi1s6DlYHLqfBcLYlh",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "Breakfast",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-024@tech-week.com",
    summary: "Google for Startups: Healthcare & Life Sciences Summit",
    description: "",
    dtstart: "20260527T093000",
    dtend: "20260527T110000",
    url: "https://partiful.com/e/r15W7xfPhpCKh4AeMlDH",
    location: "Cambridge, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-025@tech-week.com",
    summary: "Drupal Pivot",
    description: "",
    dtstart: "20260527T093000",
    dtend: "20260527T110000",
    url: "",
    location: "Cambridge, MA",
    cost: "Invite Only",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-026@tech-week.com",
    summary: "GGW Sharks. Startup Pitch & Networking",
    description: "",
    dtstart: "20260527T100000",
    dtend: "20260527T113000",
    url: "https://partiful.com/e/7fTCCTACRFJ0PRntuzc2",
    location: "Allston, Boston, MA",
    cost: "Free",
    type: "Networking",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-027@tech-week.com",
    summary: "What do Early-Stage B2B Investors Look for in the AI Era?",
    description: "",
    dtstart: "20260527T100000",
    dtend: "20260527T113000",
    url: "https://partiful.com/e/nYwABOB9oay8tl4EvjtG",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-028@tech-week.com",
    summary: "Innovation unConference",
    description: "",
    dtstart: "20260527T100000",
    dtend: "20260527T113000",
    url: "https://partiful.com/e/qOhJqoxxt1DLTPyge9Ez",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-029@tech-week.com",
    summary: "The New MSP Playbook: AI, Security, and Growth",
    description: "",
    dtstart: "20260527T100000",
    dtend: "20260527T113000",
    url: "https://partiful.com/e/l3oP2Ls8nAC5oMYLK7Zq",
    location: "Fenway-Kenmore, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-030@tech-week.com",
    summary: "Trials in Motion",
    description: "",
    dtstart: "20260527T100000",
    dtend: "20260527T113000",
    url: "https://partiful.com/e/2FALmSd7dGutTvgJuJrh",
    location: "Kendall Square, Cambridge, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-031@tech-week.com",
    summary: "Unlocking Federal Funding for Health & Biotech Innovation",
    description: "",
    dtstart: "20260527T103000",
    dtend: "20260527T120000",
    url: "",
    location: "Cambridge, MA",
    cost: "Invite Only",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-032@tech-week.com",
    summary: "Unlocking Federal Funding for Startups",
    description: "",
    dtstart: "20260527T103000",
    dtend: "20260527T120000",
    url: "https://partiful.com/e/bwlE0ODyRCNkphmroLHP",
    location: "Cambridge, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-033@tech-week.com",
    summary: "Boston Builders Brunch & MA-kerspace",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "https://partiful.com/e/CKMOe2wAD5cxuPACKmyl",
    location: "Allston, Boston, MA",
    cost: "Free",
    type: "Brunch",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-034@tech-week.com",
    summary: "Sovereignty vs. security: data and AI in the Global South",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "https://partiful.com/e/ObQT3Ois4T2349SyYWM7",
    location: "Somerville, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-035@tech-week.com",
    summary: "Is Data Still a Moat in the AI World?",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "https://partiful.com/e/g16OAfTQBIqG4XpYqWD1",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-036@tech-week.com",
    summary: "Molecular Universe: The Materials Intelligence Inflection Point",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "",
    location: "Somerville, MA",
    cost: "Invite Only",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-037@tech-week.com",
    summary: "Boston New Technology's Chai Chats",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "https://partiful.com/e/sTyxKPXBJPQytukcZu2n",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-038@tech-week.com",
    summary: "Trustworthy AI Showcase & Matching",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "https://partiful.com/e/XVOrbVgJPkqTMeyAN3sZ",
    location: "Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-039@tech-week.com",
    summary: "Early Career Pathways for Student Entrepreneurs",
    description: "",
    dtstart: "20260527T110000",
    dtend: "20260527T123000",
    url: "https://partiful.com/e/24PCfYD160CRhx1FWL4y",
    location: "Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-040@tech-week.com",
    summary: "AI in Robotics: Are we at an Iron Man Moment?",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/V1l1gw9YT7TN9v3YEaLC",
    location: "Seaport District, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-041@tech-week.com",
    summary: "The AI Table - Family Office Lunch",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/8cRufEmlqml5b3DwktP0",
    location: "Cambridge, MA",
    cost: "Free",
    type: "Lunch",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-042@tech-week.com",
    summary: "Building secure AI for your data: DeepFellow Demo + Q&A",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/b0wDq3V7RJh4GwCOZ67Q",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-043@tech-week.com",
    summary: "Founders' Lunch hosted by Cherry Hill Advisory",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/Gnbt53bYR1lDlSCV432R",
    location: "Brookline, MA",
    cost: "Free",
    type: "Lunch",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-044@tech-week.com",
    summary: "Build the Story. Then Launch.",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/IBqZqNmlGDDRr7NVfyGT",
    location: "Downtown, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-045@tech-week.com",
    summary: "Imagination in Action: AI Showcase & Builder Celebration at Whoop",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/8VYKGKwQisDRLSp7W6xA",
    location: "Fenway-Kenmore, Boston, MA",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-046@tech-week.com",
    summary: "The Builder's Table with Adobe for Startups",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/9XI33jM1rQ9rqZmCcrde",
    location: "Back Bay, Boston, MA",
    cost: "Free",
    type: "Lunch",
    rawBlock: ""
  },
  {
    uid: "boston-tw-2026-20260527-047@tech-week.com",
    summary: "Scaling Founder-led Sales on LinkedIn - #BOSTechWeek",
    description: "",
    dtstart: "20260527T120000",
    dtend: "20260527T133000",
    url: "https://partiful.com/e/CUHQ5mfVdncHE7IYZPzY",
    location: "Virtual (BOS)",
    cost: "Free",
    type: "",
    rawBlock: ""
  },
];

function parseLocalDate(s: string): Date {
  const m = s.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!m) return new Date();
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}

function classifyTags(start: Date): string[] {
  const tags: string[] = [];
  const btStart = new Date(2026, 4, 26);
  const btEnd   = new Date(2026, 5, 1);
  if (start >= btStart && start < btEnd) tags.push('tech-week');
  return tags;
}

export function loadEvents(): CityEvent[] {
  const seen = new Set<string>();
  const events: CityEvent[] = [];
  for (const d of EVENTS_DATA) {
    const key = d.summary.trim() + '|' + d.dtstart;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      uid: d.uid,
      summary: d.summary,
      description: d.description || '',
      start: parseLocalDate(d.dtstart),
      end: parseLocalDate(d.dtend),
      url: d.url,
      location: d.location,
      cost: d.cost,
      type: d.type,
      rawBlock: d.rawBlock,
      index: events.length,
      tags: classifyTags(parseLocalDate(d.dtstart)),
    });
  }
  return events;
}
