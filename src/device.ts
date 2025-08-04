import { v4 as uuid } from "uuid";

export function getDeviceId(): string | null {
  return localStorage.getItem("@device_id");
}

export function getOrCreateDeviceId(): string {
  const existingDeviceId = getDeviceId();

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const newDeviceId = uuid();

  localStorage.setItem("@device_id", newDeviceId);

  return newDeviceId;
}

export function getIsDeviceTrusted(): boolean {
  return localStorage.getItem("@is_device_trusted") === "true";
}

export function setIsDeviceTrusted(value: boolean) {
  localStorage.setItem("@is_device_trusted", String(value));
}
