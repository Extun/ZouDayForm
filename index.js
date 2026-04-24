export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'API de ZouDay COD activa',
    version: '1.0.0'
  });
}
