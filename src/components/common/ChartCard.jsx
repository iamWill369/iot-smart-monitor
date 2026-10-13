export default function ChartCard({ title, subtitle, controls, children }) {
  return <article className="card chart-card"><div className="card-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{controls}</div><div className="chart-wrap">{children}</div></article>;
}