export type PopularDestination = {
  id: string;
  name: string;
  flag: string;
  price: string;
  image: string;
};

export type RegionalPlan = {
  id: string;
  name: string;
  countries: number;
  price: string;
  icon: string;
  colors: readonly [string, string];
};

export type FeaturedPlan = {
  id: string;
  flag: string;
  country: string;
  data: string;
  validity: string;
  network: string;
  price: string;
  originalPrice: string;
  savings: string;
};
