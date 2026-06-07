export type ExternalLink = {
  id: string;
  title: string;
  summary: string;
  href: string;
  linkLabel: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type RegionOtherContent = {
  aboutTitle: string;
  aboutParagraphs: string[];
  historyTitle: string;
  historyParagraphs: string[];
  snsLinks: ExternalLink[];
  faq: FaqItem[];
  contactTitle: string;
  contactParagraphs: string[];
  privacyTitle: string;
  privacyParagraphs: string[];
  termsTitle: string;
  termsParagraphs: string[];
  operatorLines: string[];
  lastUpdated: string;
};

export type TradingCardEntry = {
  id: string;
  name: string;
  tagline: string;
  image: string;
};

export type RegionTradingCardContent = {
  title: string;
  subtitle: string;
  introParagraphs: string[];
  highlights: string[];
  gameNotice?: string;
  externalLinks: ExternalLink[];
  cards: TradingCardEntry[];
};

export type RoadmapPhase = {
  id: string;
  label: string;
  targetPercent: number;
  targetStores: number;
  timeframe: string;
  summary: string;
};

export type PartnershipLevel = {
  id: string;
  level: string;
  title: string;
  description: string;
  targetRange: string;
};

export type ExpansionPhase = {
  id: string;
  label: string;
  timeframe: string;
  summary: string;
};

export type FrameworkAxis = {
  id: string;
  title: string;
  items: string[];
};

export type RegionRoadmapContent = {
  title: string;
  subtitle: string;
  visionParagraphs: string[];
  finalGoal: {
    headline: string;
    paragraphs: string[];
    directionNote: string;
  };
  expansionPhases: ExpansionPhase[];
  framework: {
    sharedTitle: string;
    shared: FrameworkAxis;
    regionalTitle: string;
    regional: FrameworkAxis;
  };
  regionalGoal: {
    sectionTitle: string;
    headline: string;
    percent: number;
    storeCount: number;
    denominatorLabel: string;
    denominatorCount: number;
    description: string;
    goalSummaryLabel: string;
  };
  currentProgress: {
    headline: string;
    partnerStores: number;
    chanceStores: number;
    tradingCardStores: number;
    phaseTargetPercent: number;
    phaseTargetStores: number;
    note: string;
  };
  denominatorParagraphs: string[];
  phases: RoadmapPhase[];
  partnershipLevels: PartnershipLevel[];
  initiativesParagraphs: string[];
  disclaimerParagraphs: string[];
  lastUpdated: string;
};
