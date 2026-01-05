import ReactDiffViewer from "react-diff-viewer";
import "./diff.css";

export default function DiffViewer({
  data,
  leftJson,
  rightJson,
  show,
  diffLoading,
}) {
  const canShowDiff =show && leftJson !== undefined && rightJson !== undefined;
  return (
    <div>
      {show && (
        <div className="diff-container">
          {/* JSON Diff */}
          <ReactDiffViewer
            oldValue={JSON.stringify(leftJson, null, 2)}
            newValue={JSON.stringify(rightJson, null, 2)}
            splitView
            showDiffOnly={false}
            useDarkTheme
          />

          {/* Semantic Changes */}
          <h3>Semantic Changes</h3>

          {diffLoading ? (
            <p>Loading changes...</p>
          ) : (
            <ul className="semantic-list">
              {data.length === 0 && <li>No changes detected</li>}

              {data &&
                data.map((d, i) => (
                  <li key={i} className={d.type.toLowerCase()}>
                    <strong>{d.type}</strong>
                    <div>
                      Path: <code>{d.path}</code>
                    </div>

                    {d.oldValue !== undefined && (
                      <div>Old: {String(d.oldValue)}</div>
                    )}

                    {d.newValue !== undefined && (
                      <div>New: {String(d.newValue)}</div>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
