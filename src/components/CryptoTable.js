import React from 'react';
import Table from 'react-bootstrap/Table';
import * as _ from 'lodash'
const apiAssets = process.env.NEXT_PUBLIC_API_ASSETS;

const CryptoTable = ({tableData}) => {
    let tableDataLength = tableData.map((item, index) => ({
        ...item,
        serialNumber: index + 1
    }));

    tableDataLength = _.orderBy(tableDataLength,['marketcap'], ['desc']);

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
                            <td>{index + 1}</td>
                            <td>
                                {item.name}
                                {/* <div className='coin'>
                                    <img src={`${apiAssets}${item.ImageUrl}`} alt={item.Name} />
                                </div> */}
                            </td>
                            <td>${convertToString(item.marketcap)}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td style={{ background: item.performance?.hour <= 0 ? '#a93235' : '#27872d' }}>
                                % {item.performance?.hour?.toFixed(2)}
                            </td>
                            <td style={{ background: item.performance?.day < 0 ? '#a93235' : '#27872d' }}>
                                % {item.performance?.day?.toFixed(2)}
                            </td>
                            <td style={{ background: item.performance?.week < 0 ? '#a93235' : '#27872d' }}>
                                % {item.performance?.week?.toFixed(2)}
                            </td>
                            <td style={{ background: item.performance?.month < 0 ? '#a93235' : '#27872d' }}>
                                % {item.performance?.month?.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default CryptoTable;