// Radar is queried only server-side. Never store or render precise coordinates.
export async function resolveCoarseRegion(
  ip: string,
): Promise<{ city: string; region: string; country: string } | null> {
  const key = process.env.RADAR_API_KEY;
  if (
    !key ||
    !ip ||
    ip === "unknown" ||
    ip.includes(":") ||
    /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)
  )
    return null;
  try {
    const res = await fetch(
      `https://api.radar.io/v1/geocode/ip?ip=${encodeURIComponent(ip)}`,
      {
        headers: { Authorization: key },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) return null;
    const j = await res.json();
    const m = j?.addresses?.[0];
    if (!m || m.proxy === true || m.vpn === true) return null;
    return {
      city: typeof m.city === "string" ? m.city : "unknown",
      region:
        typeof m.stateCode === "string"
          ? m.stateCode
          : typeof m.state === "string"
            ? m.state
            : "unknown",
      country: typeof m.countryCode === "string" ? m.countryCode : "unknown",
    };
  } catch {
    return null;
  }
}
