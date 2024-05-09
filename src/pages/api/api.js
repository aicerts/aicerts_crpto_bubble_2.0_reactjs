import axios from 'axios';
import { config } from 'dotenv';
config();

export default async function handler(req, res) {
  try {
    // Parse the page number from the request query, default to 1 if not provided
    const timePeriod = req.query.timePeriod || 'volume_24h';
    const page = parseInt(req.query.page) || 1;
    const limit = 100; // Limit per page

    // Calculate the start index based on the page number
    const start = (page - 1) * limit + 1;

    // Fetch cryptocurrency listings along with information
    const responseListings = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&sort=${timePeriod}`, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.XCMC_PRO_API_KEY,
      },
    });

    if (!responseListings.data) {
      throw new Error('No data received from the API');
    }

    // Extract cryptocurrency IDs from the listings
    const IDs = responseListings.data.data.map(crypto => crypto.id).join(',');

    // Fetch information about each cryptocurrency
    const responseInfo = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${IDs}`, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.XCMC_PRO_API_KEY,
      },
    });

    if (!responseInfo.data) {
      throw new Error('No data received from the API');
    }

    // Fetch cryptocurrency quotes
    const responseQuotes = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${IDs}`, {
      headers: {
        'X-CMC_PRO_API_KEY': '9d5ee920-98da-46ec-84d1-d32b996dac86',
      },
    });

    if (!responseQuotes.data) {
      throw new Error('No data received from the API');
    }

    // Combine data from all three API responses
    const responseData = responseListings.data.data.map(crypto => {
      const id = crypto.id.toString();
      const info = responseInfo.data.data[id];
      const quote = responseQuotes.data.data[id].quote.USD;

      return {
        ...crypto,
        logo: info.logo,
        price: quote.price,
        percent_change_24h: quote.percent_change_24h,
      };
    });

    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
}
