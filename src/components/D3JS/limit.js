import React, { useState } from 'react';

const PageFilter = ({ onPageChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeOption, setActiveOption] = useState('1');

  const handlePageChange = (page) => {
    setActiveOption(page)
    onPageChange(page); // Call the onPageChange function passed as a prop
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="page-filter">
      <button className="toggle-button" onClick={toggleDropdown}>
        Filter by page
      </button>
      {dropdownOpen && (
        <ul className="page-list">
          <li><button className={activeOption === 1 ? 'active' : ''} onClick={() => handlePageChange(1)}>1 - 100</button></li>
          <li><button className={activeOption === 2 ? 'active' : ''} onClick={() => handlePageChange(2)}>101 - 200</button></li>
          <li><button className={activeOption === 3 ? 'active' : ''} onClick={() => handlePageChange(3)}>201 - 300</button></li>
          <li><button className={activeOption === 4 ? 'active' : ''} onClick={() => handlePageChange(4)}>301 - 400</button></li>
          <li><button className={activeOption === 5 ? 'active' : ''} onClick={() => handlePageChange(5)}>401 - 500</button></li>
          <li><button className={activeOption === 6 ? 'active' : ''} onClick={() => handlePageChange(6)}>501 - 600</button></li>
          <li><button className={activeOption === 7 ? 'active' : ''} onClick={() => handlePageChange(7)}>601 - 700</button></li>
          <li><button className={activeOption === 8 ? 'active' : ''} onClick={() => handlePageChange(8)}>701 - 800</button></li>
          <li><button className={activeOption === 9 ? 'active' : ''} onClick={() => handlePageChange(9)}>801 - 900</button></li>
          <li><button className={activeOption === 10 ? 'active' : ''} onClick={() => handlePageChange(10)}>901 - 1000</button></li>
        </ul>
      )}
    </div>
  );
};

export default PageFilter;
