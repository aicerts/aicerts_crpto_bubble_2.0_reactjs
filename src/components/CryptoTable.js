import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import * as _ from 'lodash';
import Image from 'next/image';
import { TableModel } from '../components/Modal';
const apiAssets = process.env.NEXT_PUBLIC_API_ASSETS;

const CryptoTable = ({ tableData }) => {
    const [clickedBubble, setClickedBubble] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false)

    let tableDataLength = tableData.map((item, index) => ({
        ...item,
        serialNumber: index + 1
    }));

    const handleSelect = (selectedOption) => {
        setClickedBubble(selectedOption);
        setIsModalOpen(true);
    };

    tableDataLength = _.orderBy(tableDataLength, ['marketcap'], ['desc']);

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
            <table>  {/* Remove striped, bordered and hover for a cleaner look */}
                <thead className='table-header'> {/* Set background color and text color for header */}
                    <tr >
                        <th>#</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Market Cap</th>
                        <th>24h Volume</th>
                        <th>Hour</th>
                        <th>Day</th>
                        <th>Week</th>
                        <th>Month</th>
                    </tr>
                </thead>
                <tbody>
                    {tableDataLength.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: 'transparent', border: 'none' }}> {/* Set background and border for td cells */}
                            <td>{index + 1}</td>
                            <td>

                                <button className="solid-button currency-name" onClick={() => handleSelect(item)}>
                                    <div className="flex-row gap-m">
                                    <Image
        src={`https://cryptobubbles.net/backend/${item.image}`}
        alt="Logo of Internet Computer"
        title="Logo of Internet Computer"
        width={24}
        height={24}
      />
                                        <span>{item.name}</span>
                                    </div>
                                </button>
                            </td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${convertToString(item.marketcap)}</td>
                            <td>${convertToString(item.volume)}</td>
                            <td style={{ background: item.performance?.hour <= 0 ? '#aa3333' : '#228822' }}>
                                {item.performance?.hour?.toFixed(2)}%
                            </td>
                            <td style={{ background: item.performance?.day < 0 ? '#aa3333' : '#228822' }}>
                                {item.performance?.day?.toFixed(2)}%
                            </td>
                            <td style={{ background: item.performance?.week < 0 ? '#aa3333' : '#228822' }}>
                                {item.performance?.week?.toFixed(2)}%
                            </td>
                            <td style={{ background: item.performance?.month < 0 ? '#aa3333' : '#228822' }}>
                                {item.performance?.month?.toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isModalOpen && <TableModel show={isModalOpen} onClose={() => setIsModalOpen(false)} selectedBubble={clickedBubble} />}
        </div>
    );
}

export default CryptoTable;