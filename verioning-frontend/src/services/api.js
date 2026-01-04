const API = "http://localhost:4000";

export const fetchConfig = () =>
  fetch(`${API}/config`).then(r => r.json());

export const saveConfig = async (config) => {
  try {
    console.log(config);
    const response = await fetch(`${API}/config/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config), // send directly
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to save config");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("saveConfig error:", error);
  }
};
  

export const fetchVersions = () =>
  fetch(`${API}/config/versions`).then(r => r.json());


export const fetchVersionByID = (id) => {
  return fetch(`${API}/config/versions/:${id}`)
    .then(r => {
      if (!r.ok) throw new Error("Failed to fetch version");
      console.log(r);
      return r.json();
    });
};

export const fetchDiff = (from, to) =>
  fetch(`${API}/config/diff?from=${from}&to=${to}`).then(r => r.json());
