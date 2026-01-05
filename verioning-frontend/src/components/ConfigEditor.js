import { useState, useEffect } from "react";

export default function ConfigEditor({ config, setConfig,setDisable }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  // Sync editor when config changes from outside
  useEffect(() => {
    setText(JSON.stringify(config, null, 2));
  }, [config]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    setDisable(false);
    try {
      const parsed = JSON.parse(value);
      setConfig(parsed);
      setError(null);
    } catch (err) {
      setDisable(true);
      setError("Invalid JSON");
    }
  };

  return (
    <>
      <textarea
        rows={20}
        style={{ width: "100%", fontFamily: "monospace" }}
        value={text}
        onChange={handleChange}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </>
  );
}