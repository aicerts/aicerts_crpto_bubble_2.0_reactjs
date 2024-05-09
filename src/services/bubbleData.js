// bubbleData.js

const filterAPI = process.env.NEXT_PUBLIC_FILTER_API
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

export const DayData = async () => {
    try {
        const response = await fetch(`https://min-api.cryptocompare.com/data/all/coinlist`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.Data.map(item => ({
            UNIT: item.UNIT,
            TIMESTAMP: item.TIMESTAMP,
            TYPE: item.TYPE,
            MARKET: item.MARKET,
            INSTRUMENT: item.INSTRUMENT,                    
            OPEN: item.OPEN,
            HIGH: item.HIGH,
            LOW: item.LOW,
            CLOSE: item.CLOSE,
            VOLUME: item.VOLUME,
        }));
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};