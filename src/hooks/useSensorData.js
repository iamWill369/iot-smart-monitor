
import { useCallback, useEffect, useState } from "react";
import { config } from "../config";
import { getLatestSensorData } from "../services/api";

export function useSensorData(autoRefresh = true, deviceId = "ENV-001") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setRefreshing(true);

    try {
      setError("");

      const result = await getLatestSensorData(deviceId);
      setData(result);
   } catch (err) {
  setError(err.message || "Unable to load sensor data");
} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceId]);

  useEffect(() => {
    refresh();

    if (!autoRefresh) {
      return undefined;
    }

    const timer = setInterval(refresh, config.refreshMs);

    return () => clearInterval(timer);
  }, [refresh, autoRefresh]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
}
