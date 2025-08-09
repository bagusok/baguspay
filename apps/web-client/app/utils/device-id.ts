// ...existing code...
// Synchronous, simple unique device id generator
export function generateDeviceIdSync() {
  const userAgent = navigator.userAgent;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 12);
  const data = `${userAgent}:${timestamp}:${random}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  const shortHash = Math.abs(hash).toString(16);
  return `web_${shortHash}`;
}

export async function generateDeviceId() {
  const userAgent = navigator.userAgent;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 12); // 10 char

  const data = `${userAgent}:${timestamp}:${random}`;
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // Use the first 16 characters of the hash for a shorter ID
  const shortHash = hashHex.substring(0, 16);
  return `web_${shortHash}`;
}
