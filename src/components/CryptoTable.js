import React from 'react';
import Table from 'react-bootstrap/Table';
const apiAssets = process.env.NEXT_PUBLIC_API_ASSETS;

const CryptoTable = ({tableData}) => {

    // console.log("Table data: ", tableData)
    
    const tableDataLength = tableData.map((item, index) => ({
        ...item,
        serialNumber: index + 1
    }));

    function convertToString(number) {
        // Handle negative numbers
        const absNumber = Math.abs(number);
      
        if (absNumber < 1e6) {
          return number.toString();
        } else if (absNumber < 1e9) {
          return (absNumber / 1e6).toFixed(2) + " million";
        } else if (absNumber < 1e12) {
          return (absNumber / 1e9).toFixed(2) + " billion";
        } else {
          return (absNumber / 1e12).toFixed(2) + " trillion";
        }
      }

    return (
        <div className='crypto-lists'>
            <Table hover variant="dark">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Market Cap</th>
                        <th>Price</th>
                        <th>Hour</th>
                        <th>Day</th>
                        <th>Week</th>
                        <th>Month</th>
                    </tr>
                </thead>
                <tbody>
                    {tableDataLength.map((item, index) => (
                        <tr key={index}>
                            <td>{item.serialNumber}</td>
                            <td>
                                {item.name}
                                {/* <div className='coin'>
                                    <img src={`${apiAssets}${item.ImageUrl}`} alt={item.Name} />
                                </div> */}
                            </td>
                            <td>${convertToString(item.quote.USD.market_cap)}</td>
                            <td>${item.quote.USD.price.toFixed(2)}</td>
                            <td style={{ background: item.quote.USD.percent_change_1h <= 0 ? '#a93235' : '#27872d' }}>
                                % {item.quote.USD.percent_change_1h?.toFixed(2)}
                            </td>
                            <td style={{ background: item.quote.USD.percent_change_24h < 0 ? '#a93235' : '#27872d' }}>
                                % {item.quote.USD.percent_change_24h?.toFixed(2)}
                            </td>
                            <td style={{ background: item.quote.USD.percent_change_7d < 0 ? '#a93235' : '#27872d' }}>
                                % {item.quote.USD.percent_change_7d?.toFixed(2)}
                            </td>
                            <td style={{ background: item.quote.USD.percent_change_30d < 0 ? '#a93235' : '#27872d' }}>
                                % {item.quote.USD.percent_change_30d?.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default CryptoTable;
