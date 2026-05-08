"use client";
import MapScene from '@/components/map/MapScene';
import HudOverlay from '@/components/hud/HudOverlay';
import { useEffect } from 'react';
import useCityStore from '@/stores/cityStore';

export default function Home() {
  const setTraffic = useCityStore((state) => state.setTraffic);
  const setWeather = useCityStore((state) => state.setWeather);
  const setPower = useCityStore((state) => state.setPower);
  const addAlert = useCityStore((state) => state.addAlert);
  const setPrediction = useCityStore((state) => state.setPrediction);

  useEffect(() => {
    // Connect to WebSocket backend
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Frontend connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const [type, payload] = JSON.parse(event.data);

        switch (type) {
          case 'traffic_update':
            setTraffic(payload);
            break;
          case 'weather_update':
            setWeather(payload);
            break;
          case 'power_update':
            setPower(payload);
            break;
          case 'cctv_alert':
            addAlert(payload);
            break;
          case 'ai_prediction':
            setPrediction(payload);
            // Auto clear prediction after 10s
            setTimeout(() => setPrediction(null), 10000);
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [setTraffic, setWeather, setPower, addAlert, setPrediction]);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black relative">
      <MapScene />
      <HudOverlay />
    </main>
  );
}
