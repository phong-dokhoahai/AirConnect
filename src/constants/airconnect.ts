export type Plan = {
  id: string;
  country: string;
  flag: string;
  data: string;
  validity: string;
  network: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  networks: string[];
};

export type ESIMStatus = "active" | "ready" | "expired";

export type ESIM = {
  id: string;
  country: string;
  flag: string;
  planName: string;
  data: string;
  validity: string;
  network: string;
  status: ESIMStatus;
  dataUsed: number;
  dataTotal: number;
  daysRemaining: number;
  daysTotal: number;
  expiryDate: string;
  orderId: string;
  activationCode: string;
  smdpAddress: string;
  supportedNetworks: string[];
};

export const destinations = [
  { id: "japan", name: "Japan", flag: "JP", price: "$8.99", visual: "Tokyo" },
  {
    id: "thailand",
    name: "Thailand",
    flag: "TH",
    price: "$6.99",
    visual: "Beach",
  },
  {
    id: "south-korea",
    name: "South Korea",
    flag: "KR",
    price: "$9.99",
    visual: "Seoul",
  },
  {
    id: "singapore",
    name: "Singapore",
    flag: "SG",
    price: "$7.99",
    visual: "City",
  },
  {
    id: "vietnam",
    name: "Vietnam",
    flag: "VN",
    price: "$5.99",
    visual: "Rice fields",
  },
  {
    id: "united-states",
    name: "United States",
    flag: "US",
    price: "$12.99",
    visual: "Coast",
  },
];

export const regionalPlans = [
  {
    id: "asia",
    name: "Asia",
    countries: 28,
    price: "$15.99",
    tone: "bg-orange-500",
  },
  {
    id: "europe",
    name: "Europe",
    countries: 42,
    price: "$18.99",
    tone: "bg-blue-500",
  },
  {
    id: "north-america",
    name: "North America",
    countries: 12,
    price: "$14.99",
    tone: "bg-emerald-500",
  },
  {
    id: "middle-east",
    name: "Middle East",
    countries: 18,
    price: "$13.99",
    tone: "bg-amber-500",
  },
  {
    id: "global",
    name: "Global",
    countries: 150,
    price: "$49.99",
    tone: "bg-violet-500",
  },
];

export const plans: Plan[] = [
  {
    id: "1",
    flag: "JP",
    country: "Japan",
    data: "10GB",
    validity: "15 Days",
    network: "5G",
    price: "$8.99",
    originalPrice: "$11.99",
    savings: "25%",
    networks: ["NTT Docomo", "SoftBank", "KDDI"],
  },
  {
    id: "2",
    flag: "TH",
    country: "Thailand",
    data: "8GB",
    validity: "30 Days",
    network: "4G/5G",
    price: "$6.99",
    originalPrice: "$9.99",
    savings: "30%",
    networks: ["AIS", "TrueMove H", "dtac"],
  },
  {
    id: "3",
    flag: "KR",
    country: "South Korea",
    data: "15GB",
    validity: "20 Days",
    network: "5G",
    price: "$9.99",
    originalPrice: "$14.99",
    savings: "33%",
    networks: ["SK Telecom", "KT", "LG U+"],
  },
  {
    id: "4",
    flag: "SG",
    country: "Singapore",
    data: "12GB",
    validity: "30 Days",
    network: "5G",
    price: "$7.99",
    originalPrice: "$10.99",
    savings: "27%",
    networks: ["Singtel", "StarHub", "M1"],
  },
];

export const esims: ESIM[] = [
  {
    id: "1",
    flag: "JP",
    country: "Japan",
    planName: "Standard Plan",
    data: "10GB",
    validity: "30 Days",
    network: "5G",
    status: "active",
    dataUsed: 2.8,
    dataTotal: 10,
    daysRemaining: 18,
    daysTotal: 30,
    expiryDate: "Jun 28, 2026",
    orderId: "JP-2026-123456",
    activationCode: "LPA:1$airconnect.example$japan-standard-123",
    smdpAddress: "airconnect.example",
    supportedNetworks: ["NTT Docomo", "SoftBank", "KDDI"],
  },
  {
    id: "2",
    flag: "EU",
    country: "Europe",
    planName: "Premium Plan",
    data: "20GB",
    validity: "60 Days",
    network: "4G/5G",
    status: "ready",
    dataUsed: 0,
    dataTotal: 20,
    daysRemaining: 60,
    daysTotal: 60,
    expiryDate: "Aug 9, 2026",
    orderId: "EU-2026-445001",
    activationCode: "LPA:1$airconnect.example$europe-premium-445",
    smdpAddress: "airconnect.example",
    supportedNetworks: ["Orange", "Vodafone", "Telefonica"],
  },
  {
    id: "3",
    flag: "TH",
    country: "Thailand",
    planName: "Unlimited Plan",
    data: "Unlimited",
    validity: "7 Days",
    network: "4G",
    status: "expired",
    dataUsed: 100,
    dataTotal: 100,
    daysRemaining: 0,
    daysTotal: 7,
    expiryDate: "May 15, 2026",
    orderId: "TH-2026-883200",
    activationCode: "LPA:1$airconnect.example$thailand-unlimited-883",
    smdpAddress: "airconnect.example",
    supportedNetworks: ["AIS", "TrueMove H", "dtac"],
  },
];

export const user = {
  name: "John Smith",
  email: "johnsmith@email.com",
  phone: "+1 (415) 555-0192",
  avatar: "JS",
  tier: "Explorer",
  points: 4250,
  nextTierPoints: 6000,
  nextTier: "Adventurer",
  memberSince: "May 2026",
};

export const countries = [
  { id: "japan", name: "Japan", flag: "🇯🇵" },
  { id: "thailand", name: "Thailand", flag: "🇹🇭" },
  { id: "south-korea", name: "South Korea", flag: "🇰🇷" },
  { id: "singapore", name: "Singapore", flag: "🇸🇬" },
  { id: "vietnam", name: "Vietnam", flag: "🇻🇳" },
];
