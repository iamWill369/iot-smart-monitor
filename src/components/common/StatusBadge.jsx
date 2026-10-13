export default function StatusBadge({ status = "online", children }) {
  return <span className={`status ${status}`}><i/>{children}</span>;
}