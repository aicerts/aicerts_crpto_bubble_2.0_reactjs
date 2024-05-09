import React, { useState } from 'react';

const PercentageFilter = ({ onPercentageChange }) => {
    const [activeOption, setActiveOption] = useState('percent_change_24h');

    const handlePercentageChange = (percentage) => {
        setActiveOption(percentage); // Set the active option
        onPercentageChange(percentage); // Call the onPercentageChange function with the selected time period
    };

    return (
        <div className='percentage-filter'>
            <ul>
                <li className={activeOption === 'percent_change_1h' ? 'active' : ''} onClick={() => handlePercentageChange('percent_change_1h')}>Hour</li>
                <li className={activeOption === 'percent_change_24h' ? 'active' : ''} onClick={() => handlePercentageChange('percent_change_24h')}>Day</li>
                {/* {/* <li className={activeOption === 'percent_change_7d' ? 'active' : ''} onClick={() => handlePercentageChange('percent_change_7d')}>Week</li> */}
                {/* <li className={activeOption === 'price' ? 'active' : ''} onClick={() => handlePercentageChange('price')}>Price</li> */}
                {/* <li className={activeOption === 'volume_24h' ? 'active' : ''} onClick={() => handlePercentageChange('volume_24h')}>Volume 24h</li> */}
                <li className={activeOption === 'percent_change_7d' ? 'active' : ''} onClick={() => handlePercentageChange('percent_change_7d')}>Week</li>
                <li className={activeOption === 'percent_change_30d' ? 'active' : ''} onClick={() => handlePercentageChange('percent_change_30d')}>Month</li> 
            </ul>
        </div>
    );
};

export default PercentageFilter;
