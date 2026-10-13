import { TrendingUp } from "lucide-react";

export default function MetricCard({ icon: Icon, title, value, unit, caption = "Live reading" }) {
  return <article className="metric-card">
    <div className="metric-header"><span className="metric-title">{title}</span><span className="metric-icon"><Icon size={18}/></span></div>
    <div className="metric-value">{value}<span>{unit}</span></div>
    <div className="metric-caption"><TrendingUp size={12}/> {caption}</div>
  </article>;
}