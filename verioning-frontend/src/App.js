import { useEffect, useState } from "react";
import { fetchConfig, fetchVersions } from "./services/api";
import ConfigEditor from "./components/ConfigEditor";
import VersionList from "./components/VersionList";
import DiffViewer from "./components/DiffViewer";
import axios from "axios";
import "./App.css";

export default function App() {
  const [config, setConfig] = useState({});
  const [versions, setVersions] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // success/error message
  const [error, setError] = useState(false);
  const [fetchAll, setFetchAll] = useState(false);
  const [show, setShow] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [leftJson, setLeftJson] = useState(null);
  const [rightJson, setRightJson] = useState(null);
  const [diffReady, setDiffReady] = useState(false);
  const[disable,setDisable]=useState(false);

  useEffect(() => {
    fetchConfig().then(setConfig);
    fetchVersions().then(setVersions);
  }, [fetchAll]);
  useEffect(() => {
    if (leftJson && rightJson) {
      console.log("Both JSONs are ready");
    }
  }, [leftJson, rightJson]);
  const compare = async () => {
    if (!from || !to) {
      alert("Please select both versions");
      return;
    }

    if (from === to) {
      alert("From and To versions must be different");
      return;
    }
    try {
      setDiffReady(false);
      setDiffLoading(true);
      setShow(true);

      const [v1, v2, diff] = await Promise.all([
        fetchDataById(from),
        fetchDataById(to),
        fetchDiff(from, to),
      ]);

      setLeftJson(v1?.config || {});
      setRightJson(v2?.config || {});
      setData(diff.data);
      setDiffReady(true);
    } finally {
      setDiffLoading(false);
    }
  };
  const fetchDiff = async (from, to) => {
    try {
      const data = await axios.get(
        `http://localhost:4000/config/diff?from=${from}&to=${to}`
      );

      return data;
    } catch (err) {
      console.error(err);
    }
  };
  const fetchDataById = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/config/versions/${id}`
      );

      return res.data;
    } catch (e) {
      console.error(e);
    }
  };
  const reset = () => {
    setData(null);
    setFrom(null);
    setTo(null);
  };
  const saveConfig = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setError(false);
      if(!config){
        alert("Please enter the value");
      }
      const response = await fetch(`http://localhost:4000/config/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save config-409");
      }

      const data = await response.json();
      setMessage("✅ Config saved successfully");
    } catch (err) {
      console.error("saveConfig error:", err);
      setError(true);
      setMessage(err.message);
    } finally {
      setLoading(false);
      setFetchAll(!fetchAll);
    }
    setTimeout(() => {
      setMessage(null);
      setError(false);
    }, 3000);
  };

  return (
    <div className="app-container">
      <h2>Config Editor</h2>

      <ConfigEditor config={config} setConfig={setConfig} setDisable={setDisable} />

      <button onClick={saveConfig} disabled={disable}>
        {loading ? "Saving..." : "Save"}
      </button>

      {message && (
        <p className="message" style={{ color: error ? "red" : "green" }}>
          {message}
        </p>
      )}

      <h2>Versions</h2>

      <div className="version-section">
        <VersionList
          versions={versions}
          setFrom={setFrom}
          setTo={setTo}
          from={from}
          to={to}
        />

        <div className="actions">
          <button onClick={compare}>Compare</button>
          <button className="reset" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <h2>Diff</h2>

      {diffReady && (
        <div className="diff-section">
          <DiffViewer
            data={data}
            show={show}
            diffLoading={diffLoading}
            leftJson={leftJson}
            rightJson={rightJson}
          />
        </div>
      )}
    </div>
  );
}
