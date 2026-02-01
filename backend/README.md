# Solar Analytics Backend

Node.js backend with simulated real-time data streaming for the Solar Analytics Dashboard.

## Features

- **REST API**: Standard endpoints for fetching solar plant data
- **Server-Sent Events (SSE)**: Real-time streaming updates every 3 seconds
- **Data Simulation**: Realistic simulation of solar plant metrics including:
  - Production values that vary with time of day (solar curve)
  - Soiling that accumulates over time since last cleaning
  - Performance ratio that degrades with soiling
  - Revenue correlated with production

## Quick Start

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### REST Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/plants` | Get all plants data |
| `GET /api/plants/:id` | Get single plant |
| `GET /api/plants/:id/kpis` | Get plant KPIs |
| `GET /api/kpis` | Get company-wide KPIs |
| `GET /api/charts/power` | Actual vs Expected power data |
| `GET /api/charts/performance-ratio` | PR trend data |
| `GET /api/charts/soiling` | Soiling trend data |
| `GET /api/cleaning-events` | Cleaning history |
| `GET /api/dashboard` | All dashboard data (combined) |
| `GET /api/plant-overview/:id` | Full plant overview data |

### Streaming Endpoints (SSE)

| Endpoint | Description |
|----------|-------------|
| `GET /api/stream/dashboard` | Live dashboard updates |
| `GET /api/stream/plant/:id` | Live plant-specific updates |

### Simulation Control

| Endpoint | Description |
|----------|-------------|
| `POST /api/simulation/advance` | Manually advance simulation |
| `POST /api/simulation/reset` | Reset simulation to start |
| `GET /api/simulation/status` | Get simulation status |

## Simulation Details

The simulation mimics real solar plant behavior:

1. **Time of Day**: Production follows a solar curve (peak at noon)
2. **Soiling Accumulation**: Soiling increases daily since last cleaning
3. **Performance Degradation**: PR decreases as soiling increases
4. **Random Variations**: Small random variations make data feel realistic

Updates are broadcast every 3 seconds to connected SSE clients.
