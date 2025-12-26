
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Telegram Webhook Handler
app.post('/api/telegram/webhook', async (req, res) => {
  const update = req.body;
  console.log('[Backend] Telegram Update Received:', update.update_id);
  
  // Logik pemprosesan mesej & AI di sini (pindah dari frontend)
  // analyzePropertyMedia(update.message.text)...
  
  res.status(200).send('OK');
});

// 2. Airtop Automation Proxy
app.post('/api/automation/publish', async (req, res) => {
  const { propertyData, creds } = req.body;
  
  // Sini kita panggil Airtop API menggunakan Server-Side Secret
  // Menjamin API Key tidak bocor ke browser
  
  res.json({ success: true, message: 'Automation initiated in cloud browser' });
});

// 3. Database API
app.get('/api/properties', async (req, res) => {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(properties);
});

app.listen(PORT, () => {
  console.log(`[EstateFlow-Server] Running on http://localhost:${PORT}`);
});
