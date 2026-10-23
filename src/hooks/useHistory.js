
import { useCallback, useEffect, useState } from "react";
import { getHistoricalSensorData } from "../services/api";

export function useHistory(hours = 24, deviceId = "ENV-001") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setRefreshing(true);
    setError("");

    try {
      const result = await getHistoricalSensorData(hours, deviceId);
      setData(result);
    } catch (err) {
      setError(err?.message || "Unable to load historical sensor data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hours, deviceId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    reload: load,
  };
}
