import { plants, cleaningSchedule, cleaningEventsHistory } from './plants.js';

// Simulation state
let simulationTick = 0;
const TICKS_PER_DAY = 48; // 30-minute intervals

// Helper functions
function randomVariation(base, percentage = 0.1) {
  const variation = base * percentage;
  return base + (Math.random() * variation * 2 - variation);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysLeft(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} Days left` : 'Due';
}

// Generate soiling that increases over time since last cleaning
function calculateSoiling(lastCleaned, tick) {
  const daysSinceCleaning = Math.floor(tick / TICKS_PER_DAY);
  const baseSoiling = 1.5; // Starting soiling %
  const dailyIncrease = 0.8; // % increase per day
  const soiling = baseSoiling + (daysSinceCleaning * dailyIncrease) + randomVariation(0.5, 0.5);
  return Math.min(soiling, 35).toFixed(1); // Cap at 35%
}

// Calculate Performance Ratio based on soiling
function calculatePR(soiling) {
  const basePR = 92;
  const soilingImpact = parseFloat(soiling) * 0.3;
  return (basePR - soilingImpact + randomVariation(2, 0.5)).toFixed(1);
}

// Generate current plant data
export function getPlantData(tick = simulationTick) {
  return plants.map((plant, index) => {
    const schedule = cleaningSchedule[index];
    const soiling = calculateSoiling(schedule.lastCleaned, tick);
    const avgPR = calculatePR(soiling);
    
    // Production varies based on PR and time of day
    const hourOfDay = (tick % TICKS_PER_DAY) / 2;
    const dayFactor = hourOfDay >= 6 && hourOfDay <= 18 
      ? Math.sin((hourOfDay - 6) / 12 * Math.PI) 
      : 0;
    const production = Math.round(plant.baseProduction * dayFactor * (parseFloat(avgPR) / 100) * randomVariation(1, 0.05));
    
    // Revenue correlates with production
    const revenue = Math.round(plant.baseRevenue * (production / plant.baseProduction) * randomVariation(1, 0.03));

    return {
      id: plant.id,
      name: plant.name,
      location: plant.location,
      capacity: plant.capacity,
      avgPR: `${avgPR}%`,
      production: Math.max(0, production),
      productionUnit: `${randomVariation(parseFloat(plant.capacity), 0.1).toFixed(1)} MWp`,
      revenue: Math.max(0, revenue),
      revenueUnit: "K $USD",
      soiling: `${soiling}%`,
      nextCleaning: formatDate(new Date(schedule.nextCleaning)),
      daysLeft: getDaysLeft(schedule.nextCleaning)
    };
  });
}

// Generate company-wide KPIs
export function getCompanyKPIs(tick = simulationTick) {
  const plantData = getPlantData(tick);
  const totalProduction = plantData.reduce((sum, p) => sum + p.production, 0);
  const totalRevenue = plantData.reduce((sum, p) => sum + p.revenue, 0);
  
  // Find next cleaning across all plants
  const nextCleaning = cleaningSchedule
    .map(s => new Date(s.nextCleaning))
    .sort((a, b) => a - b)[0];
  
  const lastCleaned = cleaningSchedule
    .map(s => new Date(s.lastCleaned))
    .sort((a, b) => b - a)[0];

  return {
    totalProduction: (totalProduction * randomVariation(47, 0.02)).toFixed(1),
    totalProductionUnit: "kWh",
    totalRevenue: `${(totalRevenue / 1000 * randomVariation(1.2, 0.05)).toFixed(1)}M`,
    totalRevenueUnit: "$USD",
    nextCleaning: formatDate(nextCleaning),
    lastCleaned: formatDate(lastCleaned),
    activePlants: plants.length,
    avgSystemEfficiency: `${(88 + randomVariation(4, 0.3)).toFixed(1)}%`
  };
}

// Generate actual vs expected power data (hourly simulation)
export function getActualVsExpectedData(tick = simulationTick) {
  const data = [];
  const baseExpected = [0, 0, 0, 0, 0, 0, 12, 35, 58, 78, 92, 102, 108, 106, 98, 85, 68, 48, 25, 8, 0, 0, 0, 0];
  
  // Generate 30-minute intervals from 5:00 to 19:00
  for (let hour = 5; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
      const hourIndex = hour;
      const expected = baseExpected[hourIndex] || 0;
      
      // Add some realistic variation - actual is usually slightly below expected
      const weatherFactor = 0.85 + Math.random() * 0.2; // 85-105% of expected
      const soilingFactor = 0.92 + Math.random() * 0.05; // 92-97% due to soiling
      const actual = Math.round(expected * weatherFactor * soilingFactor);
      
      data.push({
        time: timeStr,
        actual: Math.max(0, actual),
        expected: expected
      });
    }
  }
  
  return data;
}

// Generate performance ratio trend data
export function getPerformanceRatioData(tick = simulationTick) {
  const data = [];
  const basePR = [86, 85.5, 84.8, 85.2, 84.5, 83.8, 84.2, 85.1, 84.7, 83.9, 84.5, 85.3, 84.8, 85.0, 84.6];
  
  for (let day = 1; day <= 15; day++) {
    const dayVariation = (tick + day) % 10 / 10; // Adds time-based variation
    data.push({
      date: day.toString(),
      line1: parseFloat((basePR[day - 1] + randomVariation(0, 2) + dayVariation).toFixed(1)),
      line2: parseFloat((basePR[day - 1] - 2 + randomVariation(0, 1.5) + dayVariation).toFixed(1)),
      line3: parseFloat((basePR[day - 1] + 1 + randomVariation(0, 1.8) + dayVariation).toFixed(1)),
      line4: parseFloat((basePR[day - 1] - 1 + randomVariation(0, 1.2) + dayVariation).toFixed(1))
    });
  }
  
  return data;
}

// Generate soiling trend data
export function getSoilingData(tick = simulationTick) {
  const data = [];
  const dates = ['1/15', '2/1', '2/15', '3/1', '3/15', '4/1', '4/15', '5/1', '5/15', '6/1', '6/15', 
                 '7/1', '7/15', '8/1', '8/15', '9/1', '9/15', '10/1', '10/15', '10/21', '11/1', '11/15', '12/1'];
  
  // Simulate soiling that builds up and drops after cleaning
  let soiling = 2;
  const cleaningDates = ['3/1', '5/15', '8/1', '10/21'];
  
  dates.forEach((date, index) => {
    const isCleaningDate = cleaningDates.includes(date);
    
    if (isCleaningDate) {
      soiling = 2 + Math.random() * 1; // Reset after cleaning
    } else {
      soiling += 0.8 + Math.random() * 0.6; // Gradual increase
    }
    
    const production = 100 - soiling * 0.4; // Production efficiency
    const selected = date === '10/21' ? soiling : null;
    
    data.push({
      date,
      soiling: parseFloat(soiling.toFixed(1)),
      selected: selected ? parseFloat(selected.toFixed(1)) : null,
      production: parseFloat(production.toFixed(1))
    });
  });
  
  return data;
}

// Get soiling stats
export function getSoilingStats(tick = simulationTick) {
  const baseSoiling = 2.3 + (tick % 100) * 0.05;
  return {
    todaySoiling: `${baseSoiling.toFixed(1)}%`,
    selectedDate: "Nov 1, 2025",
    selectedDateCost: Math.round(7904 + randomVariation(500, 0.3)),
    optimizedCleaningCost: Math.round(5881 + randomVariation(300, 0.2)),
    cleaningDateMarker: "10/21"
  };
}

// Get plant-specific KPIs
export function getPlantKPIs(plantId, tick = simulationTick) {
  const plant = plants.find(p => p.id === plantId) || plants[0];
  const schedule = cleaningSchedule[plantId - 1] || cleaningSchedule[0];
  const soiling = calculateSoiling(schedule.lastCleaned, tick);
  const avgPR = calculatePR(soiling);
  
  return {
    avgPR: `${avgPR}%`,
    totalProduction: `${(plant.baseProduction * 425 + randomVariation(1000, 0.1)).toFixed(1)}`,
    totalProductionUnit: "kWh",
    totalRevenue: `${(plant.baseRevenue / 100 * randomVariation(1.2, 0.05)).toFixed(1)}M`,
    totalRevenueUnit: "$USD",
    avgSoiling: `${soiling}%`,
    nextCleaning: formatDate(new Date(schedule.nextCleaning)),
    latestSoilingUpdate: formatDate(new Date(schedule.lastCleaned)),
    actualPower: Math.round(98 + randomVariation(10, 0.3)),
    expectedPower: Math.round(106 + randomVariation(5, 0.2))
  };
}

// Get cleaning events
export function getCleaningEvents() {
  return cleaningEventsHistory.map(event => ({
    ...event,
    // Add slight variation to make it feel live
    moneySaved: event.moneySaved.startsWith('+') 
      ? `+${(parseFloat(event.moneySaved.replace(/[+,]/g, '')) + randomVariation(50, 0.5)).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      : `-${Math.abs(parseFloat(event.moneySaved.replace(/[-,]/g, '')) + randomVariation(20, 0.3)).toFixed(1)}`
  }));
}

// Advance simulation
export function advanceSimulation() {
  simulationTick++;
  return simulationTick;
}

// Get current tick
export function getCurrentTick() {
  return simulationTick;
}

// Reset simulation
export function resetSimulation() {
  simulationTick = 0;
  return simulationTick;
}
