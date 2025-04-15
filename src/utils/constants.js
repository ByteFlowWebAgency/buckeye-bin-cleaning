export const SERVICE_PLANS = {
  monthly: "Monthly Service ($30)",
  quarterly: "Quarterly Service ($45)",
  oneTime: "One-Time Service ($60)",
  buckeyeSummerPackage: "Buckeye Summer Package ($100)",
};

export const PRICE_ID_TO_PLAN = {
  price_1R8ELrGMbVFwRLXqhUtIBohJ: {
    id: "monthly",
    display: "Monthly Service ($30)",
  },
  price_1R8ES4GMbVFwRLXq0Kwc7QZO: {
    id: "quarterly",
    display: "Quarterly Service ($45)",
  },
  price_1R8EV4GMbVFwRLXqGIsSuhEB: {
    id: "oneTime",
    display: "One-Time Service ($60)",
  },
  price_1R8EZFGMbVFwRLXqAtRwjnuK: {
    id: "buckeyeSummerPackage",
    display: "Buckeye Summer Package ($100)",
  },
};

export const TIME_SLOTS = {
  morning: "Morning (7am - 11am)",
  afternoon: "Afternoon (11am - 2pm)",
  evening: "Evening (2pm - 5pm)",
};

export const DAYS_OF_WEEK = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
}; 