import CryptoJS from "crypto-js";
import { v4 as uuid } from "uuid";

const versions = [];

export function getLatest() {
  return versions[versions.length - 1];
}

export function getAllVersions() {
  return versions.map(v => ({
    
    versionId: v.versionId,
    createdAt: v.createdAt,
    author: v.author,
    comment: v.comment
  }));
}

export function getVersionById(id) {
  return versions.find(v => v.versionId === id);
}

export function saveVersion(config, author = "anonymous", comment = "" ) {
  console.log(config);
  const hash = CryptoJS.SHA256(JSON.stringify(config)).toString();
  const latest = getLatest();

  if (latest && latest.hash === hash) {
    throw new Error("NO_CHANGES");
  }

  const version = {
    versionId: `v${versions.length+1}`,
    createdAt: new Date().toISOString(),
    author,
    comment,
    config,
    hash
  };

  versions.push(version);
  return version;
}
