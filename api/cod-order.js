const fetch = require('node-fetch');

const DROPI_API_URL = 'https://app.dropi.ec/api/v1/orders';
const DROPI_TOKEN = process.env.DROPI_TOKEN;

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { first_name, last_name, phone, email, address, address2, province, city, zip_code, order_note } = req.body;

    // Validar datos
    if (!first_name || !last_name || !phone || !address || !city || !province || !zip_code) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Preparar datos para Dropi
    const dropiOrder = {
      customer_name: `${first_name} ${last_name}`,
      customer_phone: phone,
      customer_email: email || '',
      address: address,
      address2: address2 || '',
      city: city,
      province: province,
      zip_code: zip_code,
      note: order_note || '',
      products: [] // Shopify agregará los productos automáticamente
    };

    // Enviar a Dropi
    const response = await fetch(DROPI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dropiOrder)
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ 
        error: error.message || 'Error en Dropi' 
      });
    }

    const result = await response.json();

    return res.status(200).json({ 
      message: 'Pedido creado exitosamente',
      orderId: result.id 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message 
    });
  }
}
