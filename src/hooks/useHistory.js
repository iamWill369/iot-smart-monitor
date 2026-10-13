import { useCallback, useEffect, useState } from "react";
import { getHistoricalSensorData } from "../services/api";

export function useHistory(hours = 24) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getHistoricalSensorData(hours));
    } catch (err) {
      setError(err.message || "Unable to load history");
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}