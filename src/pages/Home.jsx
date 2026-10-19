import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Cpu,
  ShieldCheck,
  Zap,
  Wind,
  Droplets,
  Gauge,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Live Monitoring",
    description:
      "Track environmental readings and monitor sensor activity from one workspace.",
    number: "01",
  },
  {
    icon: BarChart3,
    title: "Environmental Analytics",
    description:
      "Explore historical trends and understand how sensor measurements change over time.",
    number: "02",
  },
  {
    icon: Cpu,
    title: "Device Management",
    description:
      "Inspect connected devices, connection status, battery levels, and sensor health.",
    number: "03",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Monitoring",
    description:
      "Identify device issues quickly with clear status indicators and organized data.",
    number: "04",
  },
];

export default function Home() {
  return (
    <main className="home">
      <nav className="home-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Activity size={21} />
          </span>
          <span>
            IoT <span className="accent">Monitor</span>
          </span>
        </Link>

        <div className="nav-right">
          <span className="nav-status">
            <span className="status-dot" />
            Environmental monitoring
          </span>
          <Link className="btn primary" to="/dashboard">
            Open Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            CONNECTED SENSORS · ENVIRONMENTAL INTELLIGENCE
          </div>

          <h1>
            Understand your environment.
            <span className="gradient-text"> In real time.</span>
          </h1>

          <p className="hero-description">
            A unified monitoring platform for environmental sensor data,
            device health, and historical trends. Get a clearer view of your
            connected sensor network.
          </p>

          <div className="hero-actions">
            <Link className="btn primary large" to="/dashboard">
              View Monitoring Dashboard
              <ArrowRight size={17} />
            </Link>

            <Link className="btn large" to="/analytics">
              Explore Analytics
            </Link>
          </div>

          <div className="trust">
            <span>
              <ShieldCheck size={15} /> Device health visibility
            </span>
            <span>
              <Activity size={15} /> Sensor data monitoring
            </span>
            <span>
              <BarChart3 size={15} /> Historical insights
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-heading">
            <div>
              <span className="visual-kicker">MONITORING OVERVIEW</span>
              <h2>Environmental sensors</h2>
            </div>
            <span className="live-indicator">
              <span className="status-dot" />
              System view
            </span>
          </div>

          <div className="visual-metric">
            <div className="metric-icon temperature-icon">
              <Activity size={21} />
            </div>
            <div>
              <span className="metric-label">TEMPERATURE</span>
              <div className="metric-value">
                28.4<span>°C</span>
              </div>
              <span className="metric-caption">Illustrative preview</span>
            </div>
          </div>

          <div className="visual-divider" />

          <div className="visual-stats">
            <div className="visual-stat">
              <span className="stat-icon">
                <Wind size={18} />
              </span>
              <div>
                <span className="metric-label">AIR QUALITY</span>
                <strong>Sensor data</strong>
              </div>
            </div>

            <div className="visual-stat">
              <span className="stat-icon">
                <Droplets size={18} />
              </span>
              <div>
                <span className="metric-label">HUMIDITY</span>
                <strong>Sensor data</strong>
              </div>
            </div>

            <div className="visual-stat">
              <span className="stat-icon">
                <Gauge size={18} />
              </span>
              <div>
                <span className="metric-label">DEVICE HEALTH</span>
                <strong>Network overview</strong>
              </div>
            </div>
          </div>

          <div className="visual-chart">
            <div className="chart-heading">
              <span>Monitoring activity</span>
              <span>Illustrative graphic</span>
            </div>
            <div className="chart-bars" aria-hidden="true">
              {[38, 52, 43, 69, 58, 82, 65, 91, 73, 86, 62, 96].map(
                (height, index) => (
                  <span
                    key={index}
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
          </div>

          <div className="visual-footer">
            <span className="status-dot" />
            Preview only — actual readings appear in the dashboard
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="section-heading">
          <span className="eyebrow">PLATFORM CAPABILITIES</span>
          <h2>
            Everything important.
            <span className="gradient-text"> Clearly presented.</span>
          </h2>
          <p>
            Designed to make sensor information easier to monitor,
            investigate, and understand.
          </p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, description, number }) => (
            <article className="feature" key={number}>
              <div className="feature-top">
                <span className="feature-icon">
                  <Icon size={22} />
                </span>
                <span className="feature-number">{number}</span>
              </div>

              <h3>{title}</h3>
              <p>{description}</p>

              <Link className="feature-link" to="/dashboard">
                Explore platform <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <Link to="/" className="brand footer-brand">
          <span className="brand-mark">
            <Activity size={17} />
          </span>
          IoT <span className="accent">Monitor</span>
        </Link>
        <span>Environmental IoT monitoring platform</span>
      </footer>
    </main>
  );
}