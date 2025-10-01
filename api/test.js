export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({ 
    status: 'success', 
    message: 'API functions are working',
    timestamp: new Date().toISOString(),
    environment: {
      hasDbUrl: !!(process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL),
      hasDbToken: !!(process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN),
      nodeVersion: process.version
    }
  });
}
