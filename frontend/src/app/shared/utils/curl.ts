export function toCurl(req: { method: string; url: string; headers?: Record<string,string>; body?: any }) {
  const parts: string[] = ['curl', '-sS', '-X', req.method.toUpperCase(), `'${req.url}'`];
  const headers = req.headers || {};
  Object.entries(headers).forEach(([k,v]) => parts.push('-H', `'${k}: ${v}'`));
  if (req.body !== undefined) {
    parts.push('-H', `'Content-Type: application/json'`);
    parts.push('--data', `'${JSON.stringify(req.body).replace(/'/g, "'\''")}'`);
  }
  return parts.join(' ');
}


