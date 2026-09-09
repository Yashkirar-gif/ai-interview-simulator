// Persistent Device Fingerprinting & Telemetry Helper

const DEVICE_ID_KEY = 'ais_device_id';

export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      const rand = Math.random().toString(36).substring(2, 8);
      const time = Date.now().toString(36).slice(-4);
      deviceId = `dev-${rand}-${time}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (e) {
    return 'dev-anon-fallback';
  }
}

export interface DeviceTelemetry {
  id: string;
  visitCount: number;
  testsTaken: number;
  freeTestUsed: boolean;
  firstSeen?: string;
  lastSeen?: string;
  userName?: string | null;
  userEmail?: string | null;
}

export async function trackDeviceVisit(userMeta?: {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}): Promise<DeviceTelemetry | null> {
  const deviceId = getOrCreateDeviceId();
  try {
    const res = await fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        userAgent: navigator.userAgent,
        userId: userMeta?.userId || null,
        userName: userMeta?.userName || null,
        userEmail: userMeta?.userEmail || null
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.device;
  } catch (err) {
    console.warn('Could not record server visit telemetry:', err);
    return null;
  }
}

export async function fetchDeviceStatus(deviceId: string): Promise<DeviceTelemetry | null> {
  try {
    const res = await fetch(`/api/device/${encodeURIComponent(deviceId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
