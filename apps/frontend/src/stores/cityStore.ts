import { create } from 'zustand';

export interface TrafficData {
  overall_density: number;
  trend: string;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  wind_speed: number;
}

export interface PowerData {
  grid: string;
  status: string;
  usage: number;
}

export interface AlertData {
  event: string;
  camera: string;
  location: string;
  confidence: number;
}

export interface PredictionData {
  prediction: string;
  probability: number;
}

interface CityState {
  traffic: TrafficData | null;
  weather: WeatherData | null;
  power: PowerData | null;
  alerts: AlertData[];
  prediction: PredictionData | null;
  setTraffic: (data: TrafficData) => void;
  setWeather: (data: WeatherData) => void;
  setPower: (data: PowerData) => void;
  addAlert: (data: AlertData) => void;
  setPrediction: (data: PredictionData | null) => void;
}

const useCityStore = create<CityState>((set) => ({
  traffic: null,
  weather: null,
  power: null,
  alerts: [],
  prediction: null,

  setTraffic: (data) => set({ traffic: data }),
  setWeather: (data) => set({ weather: data }),
  setPower: (data) => set({ power: data }),
  addAlert: (data) => set((state) => ({
    alerts: [data, ...state.alerts].slice(0, 10) // Keep last 10
  })),
  setPrediction: (data) => set({ prediction: data })
}));

export default useCityStore;
