import "./VersionList.css";

export default function VersionList({
  versions,
  setFrom,
  setTo,
  from,
  to,
}) {
  const handleFrom = (id) => {
    if (to === id) return; // prevent same value in both
    setFrom(id);
  };

  const handleTo = (id) => {
    if (from === id) return;
    setTo(id);
  };

  return (
    <div className="version-container">
      <ul className="version-list">
        {versions.map((v) => (
          <li key={v.versionId} className="version-item">
            <span className="version-id">{v.versionId}</span>

            <button
              className={`btn from-btn ${from === v.versionId ? "active" : ""}`}
              disabled={to === v.versionId}
              onClick={() => handleFrom(v.versionId)}
            >
              From
            </button>

            <button
              className={`btn to-btn ${to === v.versionId ? "active" : ""}`}
              disabled={from === v.versionId}
              onClick={() => handleTo(v.versionId)}
            >
              To
            </button>
          </li>
        ))}
      </ul>

      <div className="selection-box">
        <div className="column">
          <h4>From</h4>
          <div className="value">{from || "-"}</div>
        </div>

        <div className="column">
          <h4>To</h4>
          <div className="value">{to || "-"}</div>
        </div>
      </div>
    </div>
  );
}
