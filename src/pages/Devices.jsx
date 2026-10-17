
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { Loading, ErrorState } from "../components/common/State";
import { getDevices } from "../services/api";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await getDevices();

      if (!Array.isArray(data)) {
        throw new Error("Invalid device data received.");
      }

      setDevices(data);
    } catch (e) {
      setError(e.message || "Failed to load devices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () =>
      devices.filter(
        (d) =>
          (filter === "all" || d.status === filter) &&
          `${d.name} ${d.id} ${d.location}`
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [devices, q, filter]
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
              className="btn"
             onClick={() => {
  console.log("DEVICES REFRESH CLICKED");
  load();
}}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          }
        />
        <ErrorState message={error} retry={load} />
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
            className="btn"
            onClick={load}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        }
      />

      {error && (
        <div className="alert" role="alert">
          Could not refresh devices: {error}
          <button
            className="btn"
            onClick={load}
            disabled={loading}
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
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search devices..."
            aria-label="Search devices"
          />
        </div>

        <select
          className="select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.name}</strong>
                    <small>{d.id}</small>
                  </td>

                  <td>{d.location}</td>

                  <td>
                    <StatusBadge
                      status={
                        d.status === "offline"
                          ? "error"
                          : d.status
                      }
                    >
                      {d.status}
                    </StatusBadge>
                  </td>

                  <td>
                    <div className="meter-label">
                      {d.battery}%
                    </div>
                    <div className="progress">
                      <i
                        style={{
                          width: `${d.battery}%`,
                        }}
                      />
                    </div>
                  </td>

                  <td>{d.signal}%</td>

                  <td>
                    {d.lastSeen
                      ? new Date(d.lastSeen).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    <Link
                      className="icon-btn"
                      to={`/devices/${d.id}`}
                      aria-label={`View ${d.name} details`}
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
            {devices.filter((d) => d.status === "online").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>ATTENTION</span>
          <strong>
            {devices.filter((d) => d.status !== "online").length}
          </strong>
        </div>
      </div>
    </section>
  );
}
