
export function Loading({ text = "Loading data..." }) {
  return (
    <div className="state">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, retry }) {
  return (
    <div className="state">
      <strong>{title}</strong>
      <span>{message}</span>
      {retry && <button onClick={retry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ text = "No data available." }) {
  return (
    <div className="state">
      <strong>No data</strong>
      <span>{text}</span>
    </div>
  );
}
