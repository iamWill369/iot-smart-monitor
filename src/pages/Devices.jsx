
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, RefreshCw } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { Loading, ErrorState } from "../components/common/State";
import { getDevices } from "../services/api";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // Allow the loading state to render before the request completes.
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const data = await getDevices();

      if (!Array.isArray(data)) {
        throw new Error("Invalid device data received.");
      }

      setDevices(data);
    } catch (err) {
      setError(err?.message || "Failed to load devices.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      devices.filter(
        (device) =>
          (filter === "all" || device.status === filter) &&
          `${device.name} ${device.id} ${device.location}`
            .toLowerCase()
            .includes(q.toLowerCase().trim())
      ),
    [devices, filter, q]
  );

  if (loading && devices.length === 0) {
    return (
      <section className="content">
        <PageHeader
          title="Devices"
          subtitle="Connected sensor fleet and connectivity"
        />
        <Loading />
      </section>
    );
  }

  if (error && devices.length === 0) {
    return (
      <section className="content">
        <PageHeader
          title="Devices"
          subtitle="Connected sensor fleet and connectivity"
          action={
            <button
              type="button"
              className="btn"
              onClick={() => load()}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? "spin" : ""}
              />
              {loading ? "Loading..." : "Retry"}
            </button>
          }
        />
        <ErrorState message={error} retry={() => load()} />
      </section>
    );
  }

  return (
    <section className="content">
      <PageHeader
        title="Devices"
        subtitle="Connected sensor fleet and connectivity"
        action={
          <button
            type="button"
            className="btn"
            onClick={() => load(true)}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      {error && (
        <div className="alert" role="alert">
          Could not refresh devices: {error}
          <button
            type="button"
            className="btn"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            Retry
          </button>
        </div>
      )}

      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search devices..."
            aria-label="Search devices"
          />
        </div>

        <select
          className="select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter devices by status"
        >
          <option value="all">All states</option>
          <option value="online">Online</option>
          <option value="warning">Warning</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <article className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Location</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Signal</th>
                <th>Last Seen</th>
                <th aria-label="Device actions" />
              </tr>
            </thead>

            <tbody>
              {rows.map((device) => (
                <tr key={device.id}>
                  <td>
                    <strong>{device.name}</strong>
                    <small>{device.id}</small>
                  </td>

                  <td>{device.location}</td>

                  <td>
                    <StatusBadge
                      status={
                        device.status === "offline"
                          ? "error"
                          : device.status
                      }
                    >
                      {device.status}
                    </StatusBadge>
                  </td>

                  <td>
                    <div className="meter-label">
                      {device.battery}%
                    </div>
                    <div className="progress">
                      <i
                        style={{ width: `${device.battery}%` }}
                      />
                    </div>
                  </td>

                  <td>{device.signal}%</td>

                  <td>
                    {device.lastSeen
                      ? new Date(device.lastSeen).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    <Link
                      className="icon-btn"
                      to={`/devices/${device.id}`}
                      aria-label={`View ${device.name} details`}
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    No devices match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <div className="three-col fleet-cards">
        <div className="stat-card">
          <span>TOTAL NODES</span>
          <strong>{devices.length}</strong>
        </div>

        <div className="stat-card">
          <span>ONLINE</span>
          <strong>
            {devices.filter((device) => device.status === "online").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>ATTENTION</span>
          <strong>
            {devices.filter((device) => device.status !== "online").length}
          </strong>
        </div>
      </div>
    </section>
  );
}
