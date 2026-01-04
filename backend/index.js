import express from "express";
import cors from "cors";
import {
  getLatest,
  getAllVersions,
  getVersionById,
  saveVersion
} from "./versionStore.js";
import { diffEngine } from "./diff.js";

const app = express();
app.use(cors());
app.use(express.json());

/** GET latest config */
app.get("/config", (req, res) => {
  const latest = getLatest();
  res.json(latest ? latest.config : {});
});

/** Save config */
app.post("/config/save", (req, res) => {
  try {
    console.log(req.body,"body");
    const version = saveVersion(req.body);
    res.json(version);
  } catch (e) {
    if (e.message === "NO_CHANGES") {
      return res.status(409).json({ message: "No changes detected" });
    }
    res.status(500).json({ message: e.message });
  }
});

/** List versions */
app.get("/config/versions", (req, res) => {
  res.json(getAllVersions());
});

/** Get version by id */
app.get("/config/versions/:id", (req, res) => {
  const version = getVersionById(req.params.id);
  res.json(version);
});

/** Get diff */
app.get("/config/diff", (req, res) => {
  const { from, to } = req.query;
  const v1 = getVersionById(from);
  const v2 = getVersionById(to);

  if (!v1 || !v2) {
    return res.status(404).json({ message: "Invalid version ids" });
  }

  const diff = diffJSON(v1.config, v2.config);
  // console.log(diff);
  res.json(diff || {});
});
/* ---------- UTIL: stable stringify ---------- */
function stableStringify(obj, space = 2) {
  return JSON.stringify(sortObject(obj), null, space);
}

function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(value[key]);
        return acc;
      }, {});
  }
  return value;
}


function diffJSON(oldObj, newObj, path = "", diffs = []) {
  // removed & modified
  for (const key in oldObj) {
    const p = path ? `${path}.${key}` : key;

    if (!(key in newObj)) {
      diffs.push({ type: "REMOVED", path: p, oldValue: oldObj[key] });
    } else if (
      isObject(oldObj[key]) &&
      isObject(newObj[key]) &&
      !Array.isArray(oldObj[key])
    ) {
      diffJSON(oldObj[key], newObj[key], p, diffs);
    } else if (Array.isArray(oldObj[key]) && Array.isArray(newObj[key])) {
      diffArrayById(oldObj[key], newObj[key], p, diffs);
    } else if (!isEqual(oldObj[key], newObj[key])) {
      diffs.push({
        type: "MODIFIED",
        path: p,
        oldValue: oldObj[key],
        newValue: newObj[key],
      });
    }
  }

  // added
  for (const key in newObj) {
    if (!(key in oldObj)) {
      const p = path ? `${path}.${key}` : key;
      diffs.push({ type: "ADDED", path: p, newValue: newObj[key] });
    }
  }

  return diffs;
}

function diffArrayById(oldArr, newArr, path, diffs, idKey = "id") {
  const oldMap = new Map(oldArr.map(o => [o[idKey], o]));
  const newMap = new Map(newArr.map(o => [o[idKey], o]));

  for (const [id, oldItem] of oldMap) {
    if (!newMap.has(id)) {
      diffs.push({
        type: "REMOVED",
        path: `${path}[${id}]`,
        oldValue: oldItem,
      });
    } else {
      diffJSON(oldItem, newMap.get(id), `${path}[${id}]`, diffs);
    }
  }

  for (const [id, newItem] of newMap) {
    if (!oldMap.has(id)) {
      diffs.push({
        type: "ADDED",
        path: `${path}[${id}]`,
        newValue: newItem,
      });
    }
  }
}

const isObject = v => v && typeof v === "object";
const isEqual = (a, b) =>
  stableStringify(a) === stableStringify(b);


app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
