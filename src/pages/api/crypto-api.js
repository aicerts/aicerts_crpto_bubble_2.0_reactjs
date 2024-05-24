// pages/api/crypto-api.js

import axios from 'axios';

import { config } from 'dotenv';
config();

export default async function handler(req, res) {
  try {
    const response = await axios.get(`${process.env.CRYPTO_BACKEND}/v1/crypto/fetch-crypto`);
    
    if (!response.data) {
      throw new Error('No data received from the API');
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
}
