import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import mqtt from "mqtt";
import { Buffer } from "buffer";
import process from "process";

global.Buffer = Buffer;
global.process = process;

const HIVE_HOST =
  process.env.EXPO_PUBLIC_MQTT_BROKER_URL || "broker.hivemq.com";
const HIVE_USER = process.env.EXPO_PUBLIC_MQTT_USERNAME || "username123";
const HIVE_PASS = process.env.EXPO_PUBLIC_MQTT_PASSWORD || "password123";

export const useTemperatureSensors = () => {
  const [latestBySensor, setLatestBySensor] = useState<
    Record<number, { temperature: number; ts: string }>
  >({});

  const [connected, setConnected] = useState(false);

  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    connect();
    return () => {
      subscription.remove();
      disconnect();
    };
  }, []);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      if (!clientRef.current) connect();
      else if (!connected) reconnectClient();
    }
    appState.current = nextAppState;
  }

  function connect() {
    try {
      const options = {
        clientId: "expo_mqtt_" + Math.random().toString(16).slice(2, 10),
        username: HIVE_USER,
        password: HIVE_PASS,
        reconnectPeriod: 2000,
        connectTimeout: 30 * 1000,
      };
      const client = mqtt.connect(HIVE_HOST, options);
      clientRef.current = client;

      client.on("connect", () => {
        setConnected(true);
        client.subscribe("bamx/sensors/temperature", { qos: 0 }, (err) => {
          if (err) console.warn("Subscribe error", err);
        });
      });

      client.on("reconnect", () => setConnected(false));
      client.on("close", () => setConnected(false));
      client.on("offline", () => setConnected(false));
      client.on("error", (err) =>
        console.warn("MQTT error", err.message || err)
      );

      client.on("message", (topic, payload) => {
        if (!payload) return;
        const txt = payload.toString();
        let parsed = null;
        try {
          parsed = JSON.parse(txt);
        } catch (e) {
          console.warn("Invalid JSON received:", txt);
          return;
        }

        if (
          typeof parsed.sensor_id !== "number" ||
          typeof parsed.temperature !== "number"
        ) {
          console.warn("Payload doesn't match expected schema:", parsed);
          return;
        }

        const entry = {
          sensor_id: parsed.sensor_id,
          temperature: parsed.temperature,
          ts: new Date().toISOString(),
        };
        setLatestBySensor((prev) => ({
          ...prev,
          [entry.sensor_id]: { temperature: entry.temperature, ts: entry.ts },
        }));
      });
    } catch (err) {
      console.warn("Connect failed:", err);
    }
  }

  function reconnectClient() {
    if (!clientRef.current) connect();
    else {
      try {
        clientRef.current.reconnect();
      } catch (e) {
        console.warn("Reconnect failed", e);
      }
    }
  }

  function disconnect() {
    const c = clientRef.current;
    if (c) {
      try {
        c.end(true);
      } catch (e) {
        console.warn("Disconnect error", e);
      }
      clientRef.current = null;
      setConnected(false);
    }
  }
  return { latestBySensor };
};
