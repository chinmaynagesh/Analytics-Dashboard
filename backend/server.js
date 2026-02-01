import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import {
  getPlantData,
  getCompanyKPIs,
  getActualVsExpectedData,
  getPerformanceRatioData,
  getSoilingData,
  getSoilingStats,
  getPlantKPIs,
  getCleaningEvents,
  advanceSimulation,
  getCurrentTick,
  resetSimulation
} from './data/simulator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Store active SSE connections
const sseClients = new Set();

// ============================================
// REST API ENDPOINTS
// ============================================

// Get all plants data
app.get('/api/plants', (req, res) => {
  res.json(getPlantData());
});

// Get single plant data
app.get('/api/plants/:id', (req, res) => {
  const plantId = parseInt(req.params.id);
  const plants = getPlantData();
  const plant = plants.find(p => p.id === plantId);
  
  if (!plant) {
    return res.status(404).json({ error: 'Plant not found' });
  }
  
  res.json(plant);
});

// Get plant KPIs
app.get('/api/plants/:id/kpis', (req, res) => {
  const plantId = parseInt(req.params.id);
  res.json(getPlantKPIs(plantId));
});

// Get company-wide KPIs
app.get('/api/kpis', (req, res) => {
  res.json(getCompanyKPIs());
});

// Get actual vs expected power data
app.get('/api/charts/power', (req, res) => {
  res.json(getActualVsExpectedData());
});

// Get performance ratio data
app.get('/api/charts/performance-ratio', (req, res) => {
  res.json(getPerformanceRatioData());
});

// Get soiling trend data
app.get('/api/charts/soiling', (req, res) => {
  res.json({
    chartData: getSoilingData(),
    stats: getSoilingStats()
  });
});

// Get cleaning events
app.get('/api/cleaning-events', (req, res) => {
  res.json(getCleaningEvents());
});

// Get all dashboard data in one call
app.get('/api/dashboard', (req, res) => {
  res.json({
    plants: getPlantData(),
    kpis: getCompanyKPIs(),
    tick: getCurrentTick()
  });
});

// Get all plant overview data in one call
app.get('/api/plant-overview/:id', (req, res) => {
  const plantId = parseInt(req.params.id);
  const plants = getPlantData();
  const plant = plants.find(p => p.id === plantId);
  
  if (!plant) {
    return res.status(404).json({ error: 'Plant not found' });
  }
  
  res.json({
    plant,
    kpis: getPlantKPIs(plantId),
    powerChart: getActualVsExpectedData(),
    prChart: getPerformanceRatioData(),
    soilingChart: {
      chartData: getSoilingData(),
      stats: getSoilingStats()
    },
    cleaningEvents: getCleaningEvents(),
    tick: getCurrentTick()
  });
});

// ============================================
// GEMINI AI CHAT ENDPOINT
// ============================================

// System prompt for the solar assistant
const SYSTEM_PROMPT = `You are SolarOS AI, an intelligent assistant for a solar plant monitoring and management platform. You help users with:

1. **Solar Plant Analysis**: Analyzing performance data, production metrics, and efficiency of solar plants
2. **Soiling Management**: Understanding soiling levels, predicting soiling impacts, and optimizing cleaning schedules
3. **Maintenance Planning**: Scheduling maintenance, predicting equipment issues, and managing cleaning events
4. **Revenue Optimization**: Calculating revenue impact of soiling, recommending cleaning ROI, and forecasting production
5. **Performance Monitoring**: Tracking performance ratios (PR), actual vs expected production, and plant health

You have access to data from multiple solar plants. Be helpful, concise, and provide actionable insights. When discussing numbers, be specific and use appropriate units (kWh, MW, %, USD).

If asked about specific plant data, provide realistic estimates based on typical solar plant operations. Mention that for real-time data, users should check the dashboard.

Keep responses focused and under 200 words unless more detail is specifically requested.`;

// Chat endpoint for Gemini AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Get current plant data for context
    const plants = getPlantData();
    const kpis = getCompanyKPIs();
    
    // Create context with current data
    const dataContext = `
Current Solar Plant Data:
- Total Plants: ${plants.length}
- Company KPIs: Production: ${kpis.production?.value || 'N/A'}, Revenue: ${kpis.revenue?.value || 'N/A'}
- Plants: ${plants.map(p => `${p.name} (PR: ${p.pr}%, Soiling: ${p.soiling}%)`).join(', ')}
`;

    // Initialize the model - using gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation history for context
    const formattedHistory = history?.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) || [];

    // Start chat with system context
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${dataContext}\n\nPlease acknowledge that you understand your role as SolarOS AI assistant.` }]
        },
        {
          role: 'model',
          parts: [{ text: "I understand. I'm SolarOS AI, your intelligent solar plant management assistant. I'm ready to help you analyze plant performance, optimize cleaning schedules, and maximize your solar energy production. How can I assist you today?" }]
        },
        ...formattedHistory
      ]
    });

    // Send user message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
});

// ============================================
// SERVER-SENT EVENTS (SSE) FOR REAL-TIME STREAMING
// ============================================

// SSE endpoint for real-time dashboard updates
app.get('/api/stream/dashboard', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial data
  const initialData = {
    type: 'initial',
    data: {
      plants: getPlantData(),
      kpis: getCompanyKPIs(),
      tick: getCurrentTick()
    }
  };
  res.write(`data: ${JSON.stringify(initialData)}\n\n`);
  
  // Add client to set
  sseClients.add(res);
  
  console.log(`Client connected to dashboard stream. Total clients: ${sseClients.size}`);
  
  // Remove client on disconnect
  req.on('close', () => {
    sseClients.delete(res);
    console.log(`Client disconnected. Total clients: ${sseClients.size}`);
  });
});

// SSE endpoint for plant-specific updates
app.get('/api/stream/plant/:id', (req, res) => {
  const plantId = parseInt(req.params.id);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial data
  const plants = getPlantData();
  const plant = plants.find(p => p.id === plantId);
  
  const initialData = {
    type: 'initial',
    data: {
      plant,
      kpis: getPlantKPIs(plantId),
      powerChart: getActualVsExpectedData(),
      tick: getCurrentTick()
    }
  };
  res.write(`data: ${JSON.stringify(initialData)}\n\n`);
  
  // Store plantId with the response for targeted updates
  res.plantId = plantId;
  sseClients.add(res);
  
  req.on('close', () => {
    sseClients.delete(res);
  });
});

// ============================================
// SIMULATION CONTROL
// ============================================

// Advance simulation manually (for testing)
app.post('/api/simulation/advance', (req, res) => {
  const tick = advanceSimulation();
  res.json({ tick, message: 'Simulation advanced' });
});

// Reset simulation
app.post('/api/simulation/reset', (req, res) => {
  const tick = resetSimulation();
  res.json({ tick, message: 'Simulation reset' });
});

// Get simulation status
app.get('/api/simulation/status', (req, res) => {
  res.json({
    tick: getCurrentTick(),
    clients: sseClients.size
  });
});

// ============================================
// AUTO-SIMULATION LOOP
// ============================================

// Broadcast updates to all SSE clients
function broadcastUpdate() {
  const tick = advanceSimulation();
  
  sseClients.forEach(client => {
    try {
      if (client.plantId) {
        // Plant-specific stream
        const plants = getPlantData();
        const plant = plants.find(p => p.id === client.plantId);
        const update = {
          type: 'update',
          data: {
            plant,
            kpis: getPlantKPIs(client.plantId),
            powerChart: getActualVsExpectedData(),
            tick
          }
        };
        client.write(`data: ${JSON.stringify(update)}\n\n`);
      } else {
        // Dashboard stream
        const update = {
          type: 'update',
          data: {
            plants: getPlantData(),
            kpis: getCompanyKPIs(),
            tick
          }
        };
        client.write(`data: ${JSON.stringify(update)}\n\n`);
      }
    } catch (error) {
      console.error('Error sending update to client:', error);
      sseClients.delete(client);
    }
  });
}

// Start auto-simulation - updates every 3 seconds to simulate real-time data
const SIMULATION_INTERVAL = 3000; // 3 seconds
setInterval(broadcastUpdate, SIMULATION_INTERVAL);

console.log(`Auto-simulation running every ${SIMULATION_INTERVAL / 1000} seconds`);

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🌞 Solar Analytics Backend Server                      ║
║                                                            ║
║     Server running on: http://localhost:${PORT}              ║
║                                                            ║
║     REST API Endpoints:                                    ║
║     • GET  /api/plants          - All plants               ║
║     • GET  /api/plants/:id      - Single plant             ║
║     • GET  /api/plants/:id/kpis - Plant KPIs               ║
║     • GET  /api/kpis            - Company KPIs             ║
║     • GET  /api/charts/power    - Power chart data         ║
║     • GET  /api/charts/performance-ratio - PR data         ║
║     • GET  /api/charts/soiling  - Soiling data             ║
║     • GET  /api/cleaning-events - Cleaning history         ║
║     • GET  /api/dashboard       - All dashboard data       ║
║     • GET  /api/plant-overview/:id - Full plant data       ║
║                                                            ║
║     AI Chat Endpoint:                                      ║
║     • POST /api/chat            - Gemini AI chat           ║
║                                                            ║
║     Streaming Endpoints (SSE):                             ║
║     • GET  /api/stream/dashboard   - Live dashboard        ║
║     • GET  /api/stream/plant/:id   - Live plant data       ║
║                                                            ║
║     Simulation Control:                                    ║
║     • POST /api/simulation/advance - Manual tick           ║
║     • POST /api/simulation/reset   - Reset simulation      ║
║     • GET  /api/simulation/status  - Current status        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  Warning: GEMINI_API_KEY not set. Add it to .env file for AI chat to work.');
  } else {
    console.log('✅ Gemini AI configured and ready');
  }
});
