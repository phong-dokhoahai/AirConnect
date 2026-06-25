import type { FeaturedPlan, PopularDestination, RegionalPlan } from "./types";

export const popularDestinations: PopularDestination[] = [
  {
    id: "japan",
    name: "Japan",
    flag: "\uD83C\uDDEF\uD83C\uDDF5",
    price: "$8.99",
    image: "\uD83C\uDFEF",
  },
  {
    id: "thailand",
    name: "Thailand",
    flag: "\uD83C\uDDF9\uD83C\uDDED",
    price: "$6.99",
    image: "\uD83C\uDFDD\uFE0F",
  },
  {
    id: "south-korea",
    name: "South Korea",
    flag: "\uD83C\uDDF0\uD83C\uDDF7",
    price: "$9.99",
    image: "\uD83C\uDFD9\uFE0F",
  },
  {
    id: "singapore",
    name: "Singapore",
    flag: "\uD83C\uDDF8\uD83C\uDDEC",
    price: "$7.99",
    image: "\uD83C\uDF03",
  },
  {
    id: "vietnam",
    name: "Vietnam",
    flag: "\uD83C\uDDFB\uD83C\uDDF3",
    price: "$5.99",
    image: "\uD83C\uDF3E",
  },
  {
    id: "united-states",
    name: "United States",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    price: "$12.99",
    image: "\uD83D\uDDFD",
  },
];

export const regionalPlans: RegionalPlan[] = [
  {
    id: "asia",
    name: "Asia",
    countries: 28,
    price: "$15.99",
    icon: "\uD83C\uDF0F",
    colors: ["#FB923C", "#EC4899"],
  },
  {
    id: "europe",
    name: "Europe",
    countries: 42,
    price: "$18.99",
    icon: "\uD83C\uDFF0",
    colors: ["#60A5FA", "#8B5CF6"],
  },
  {
    id: "north-america",
    name: "North America",
    countries: 12,
    price: "$14.99",
    icon: "\uD83D\uDDFA\uFE0F",
    colors: ["#4ADE80", "#14B8A6"],
  },
  {
    id: "middle-east",
    name: "Middle East",
    countries: 18,
    price: "$13.99",
    icon: "\uD83D\uDD4C",
    colors: ["#FBBF24", "#F97316"],
  },
];

export const featuredPlans: FeaturedPlan[] = [
  {
    id: "1",
    flag: "\uD83C\uDDEF\uD83C\uDDF5",
    country: "Japan",
    data: "10GB",
    validity: "15 Days",
    network: "5G",
    price: "$8.99",
    originalPrice: "$11.99",
    savings: "25%",
  },
  {
    id: "2",
    flag: "\uD83C\uDDF9\uD83C\uDDED",
    country: "Thailand",
    data: "8GB",
    validity: "30 Days",
    network: "4G/5G",
    price: "$6.99",
    originalPrice: "$9.99",
    savings: "30%",
  },
  {
    id: "3",
    flag: "\uD83C\uDDF0\uD83C\uDDF7",
    country: "South Korea",
    data: "15GB",
    validity: "20 Days",
    network: "5G",
    price: "$9.99",
    originalPrice: "$14.99",
    savings: "33%",
  },
];
