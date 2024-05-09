import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Parse the page number from the request query, default to 1 if not provided
    const timePeriod = req.query.timePeriod || 'percent_change_24h';
    const page = parseInt(req.query.page) || 1;
    const limit = 100; // Limit per page

    // Calculate the start index based on the page number
    const start = (page - 1) * limit + 1;

    // Fetch cryptocurrency listings
    const responseListings = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&sort=${timePeriod}`, {
      headers: {
        'X-CMC_PRO_API_KEY': '9d5ee920-98da-46ec-84d1-d32b996dac86',
      },
    });

    if (!responseListings.data) {
      throw new Error('No data received from the API');
    }

    // Extract cryptocurrency IDs from the listings
    const ID = responseListings.data.data.map(crypto => crypto.id).join(',');

    // Fetch information about each cryptocurrency
    const responseInfo = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ID}`, {
      headers: {
        'X-CMC_PRO_API_KEY': '9d5ee920-98da-46ec-84d1-d32b996dac86',
      },
    });

    if (!responseInfo.data) {
      throw new Error('No data received from the API');
    }

    // Map logo URLs to cryptocurrency IDs
  const logos = {};
  Object.keys(responseInfo.data.data).forEach(id => {
    const crypto = responseInfo.data.data[id];
    logos[id] = crypto.logo;
  });

  // Combine cryptocurrency data with logo URLs
  const responseData = responseListings.data.data.map(crypto => ({
    ...crypto,
    logo: logos[crypto.id],
  }));

    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
}
