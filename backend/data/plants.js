// Base plant data
export const plants = [
  { id: 1, name: "Sunfield Alpha", location: "Arizona, USA", capacity: "75.2 MWp", baseProduction: 45, baseRevenue: 120 },
  { id: 2, name: "Desert Sun Beta", location: "Nevada, USA", capacity: "62.8 MWp", baseProduction: 38, baseRevenue: 95 },
  { id: 3, name: "Solar Peak Gamma", location: "California, USA", capacity: "89.4 MWp", baseProduction: 52, baseRevenue: 145 },
  { id: 4, name: "Helios Delta", location: "Texas, USA", capacity: "54.1 MWp", baseProduction: 32, baseRevenue: 88 },
  { id: 5, name: "Radiant Epsilon", location: "New Mexico, USA", capacity: "71.6 MWp", baseProduction: 42, baseRevenue: 112 },
  { id: 6, name: "Solstice Zeta", location: "Utah, USA", capacity: "48.3 MWp", baseProduction: 28, baseRevenue: 75 },
  { id: 7, name: "Aurora Eta", location: "Colorado, USA", capacity: "66.9 MWp", baseProduction: 39, baseRevenue: 105 },
  { id: 8, name: "Phoenix Theta", location: "Florida, USA", capacity: "82.5 MWp", baseProduction: 48, baseRevenue: 130 },
  { id: 9, name: "Lumina Iota", location: "Georgia, USA", capacity: "57.2 MWp", baseProduction: 34, baseRevenue: 92 },
  { id: 10, name: "Zenith Kappa", location: "North Carolina, USA", capacity: "73.8 MWp", baseProduction: 44, baseRevenue: 118 }
];

// Cleaning schedule data
export const cleaningSchedule = [
  { plantId: 1, nextCleaning: "2025-10-21", lastCleaned: "2025-10-13" },
  { plantId: 2, nextCleaning: "2025-10-23", lastCleaned: "2025-10-10" },
  { plantId: 3, nextCleaning: "2025-10-19", lastCleaned: "2025-10-08" },
  { plantId: 4, nextCleaning: "2025-10-25", lastCleaned: "2025-10-15" },
  { plantId: 5, nextCleaning: "2025-10-22", lastCleaned: "2025-10-12" },
  { plantId: 6, nextCleaning: "2025-10-28", lastCleaned: "2025-10-18" },
  { plantId: 7, nextCleaning: "2025-10-20", lastCleaned: "2025-10-09" },
  { plantId: 8, nextCleaning: "2025-10-24", lastCleaned: "2025-10-14" },
  { plantId: 9, nextCleaning: "2025-10-26", lastCleaned: "2025-10-16" },
  { plantId: 10, nextCleaning: "2025-10-27", lastCleaned: "2025-10-17" }
];

// Cleaning events history
export const cleaningEventsHistory = [
  { date: "Oct 15, 2025", moneySaved: "+1,512.8", soilingOnDate: "22.6%", cleaningEffectiveness: "99%", isPositive: true },
  { date: "Oct 8, 2025", moneySaved: "+1,245.3", soilingOnDate: "18.4%", cleaningEffectiveness: "97%", isPositive: true },
  { date: "Oct 1, 2025", moneySaved: "-234.5", soilingOnDate: "8.2%", cleaningEffectiveness: "95%", isPositive: false },
  { date: "Sep 24, 2025", moneySaved: "+987.6", soilingOnDate: "15.8%", cleaningEffectiveness: "98%", isPositive: true },
  { date: "Sep 17, 2025", moneySaved: "+1,876.2", soilingOnDate: "24.1%", cleaningEffectiveness: "99%", isPositive: true },
  { date: "Sep 10, 2025", moneySaved: "-156.8", soilingOnDate: "6.5%", cleaningEffectiveness: "94%", isPositive: false },
  { date: "Sep 3, 2025", moneySaved: "+2,134.7", soilingOnDate: "28.3%", cleaningEffectiveness: "99%", isPositive: true }
];
