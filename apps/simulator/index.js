const WebSocket = require('ws');

let ws;

function connect() {
  ws = new WebSocket('ws://localhost:8080');

  ws.on('open', () => {
    console.log('Simulator connected to backend');
    startSimulation();
  });

  ws.on('error', (error) => {
    console.error('Simulator connection error:', error.message);
  });

  ws.on('close', () => {
    console.log('Simulator disconnected. Reconnecting in 3s...');
    setTimeout(connect, 3000);
  });
}

function sendEvent(type, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify([type, payload]));
  }
}

function generateTraffic() {
  const density = Math.floor(Math.random() * 100);
  const trend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
  return {
    timestamp: Date.now(),
    overall_density: density,
    trend: trend,
    events: Array.from({ length: 5 }).map(() => ({
      id: Math.random().toString(36).substring(7),
      lat: (Math.random() * 0.1) + 40.7,
      lon: (Math.random() * 0.1) - 74.05,
      speed: Math.random() * 80,
      density: Math.floor(Math.random() * 100)
    }))
  };
}

function generateWeather() {
  const conditions = ['clear', 'rain', 'fog', 'storm'];
  return {
    timestamp: Date.now(),
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    temperature: Math.floor(Math.random() * 30) + 10, // 10 to 40 C
    wind_speed: Math.floor(Math.random() * 50)
  };
}

function generatePowerGrid() {
  return {
    timestamp: Date.now(),
    grid: ['north-sector', 'south-sector', 'east-sector', 'west-sector'][Math.floor(Math.random() * 4)],
    usage: Math.floor(Math.random() * 100),
    status: Math.random() > 0.9 ? 'warning' : 'stable'
  };
}

const incidents = ['fire', 'crowd_surge', 'accident', 'power_failure', 'cyberattack'];
function generateIncident() {
  return {
    timestamp: Date.now(),
    camera: `CAM-${Math.floor(Math.random() * 100)}`,
    event: incidents[Math.floor(Math.random() * incidents.length)],
    confidence: (0.7 + Math.random() * 0.29).toFixed(2), // 0.70 to 0.99
    location: `Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(Math.random() * 10)}`
  };
}

function generateCrowdDensity() {
    return {
        timestamp: Date.now(),
        sector: `Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(Math.random() * 10)}`,
        density: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    }
}

function generatePrediction(traffic, weather) {
    if (traffic.overall_density > 70 && (weather.condition === 'rain' || weather.condition === 'storm')) {
        return {
            timestamp: Date.now(),
            prediction: 'major congestion in 12 minutes',
            probability: 0.85,
            type: 'congestion'
        }
    }
    return null;
}


function startSimulation() {
  let traffic, weather;
  setInterval(() => {
    traffic = generateTraffic();
    sendEvent('traffic_update', traffic);
  }, 2000);

  setInterval(() => {
    weather = generateWeather();
    sendEvent('weather_update', weather);
  }, 10000);

  setInterval(() => {
    sendEvent('power_update', generatePowerGrid());
  }, 5000);

  setInterval(() => {
      sendEvent('crowd_density_update', generateCrowdDensity());
  }, 3000);

  setInterval(() => {
    if (Math.random() > 0.7) { // 30% chance every 8 seconds
      sendEvent('cctv_alert', generateIncident());
    }
  }, 8000);

  setInterval(() => {
      if (traffic && weather) {
          const prediction = generatePrediction(traffic, weather);
          if (prediction) {
              sendEvent('ai_prediction', prediction);
          }
      }
  }, 5000);
}

connect();
