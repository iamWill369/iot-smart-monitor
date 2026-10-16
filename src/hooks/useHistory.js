
import { useCallback, useEffect, useState } from "react";
import { getHistoricalSensorData } from "../services/api";

export function useHistory(hours = 24, deviceId = "ENV-001") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getHistoricalSensorData(hours, deviceId);
      setData(result);
    } catch (err) {
      setError(err.message || "Unable to load history");
    } finally {
      setLoading(false);
    }
  }, [hours, deviceId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
