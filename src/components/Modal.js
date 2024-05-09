import React from 'react';
import Link from 'next/link'
import Image from 'next/legacy/image'
import '/assets/modal.css';
import LineChart from '../components/LineChart';
import Modal from 'react-bootstrap/Modal';

const apiAssets = process.env.NEXT_PUBLIC_API_ASSETS;

const CoinModel = ({ selectedBubble, onClose }) => {
  console.log('selected', selectedBubble)
  if (!selectedBubble) return null; // Render nothing if there's no data

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

  const tradeLists = [
    {
      'name': "Biance",
      'link': 'https://www.binance.com/',
      'logo': <React.Fragment>
        <svg viewBox="0 0 2500 2500"><path fill="#fdd430" d="M764.48,1050.52,1250,565l485.75,485.73,282.5-282.5L1250,0,482,768l282.49,282.5M0,1250,282.51,967.45,565,1249.94,282.49,1532.45Zm764.48,199.51L1250,1935l485.74-485.72,282.65,282.35-.14.15L1250,2500,482,1732l-.4-.4,282.91-282.12M1935,1250.12l282.51-282.51L2500,1250.1,2217.5,1532.61Z"></path><path fill="#fdd430" d="M1536.52,1249.85h.12L1250,963.19,1038.13,1175h0l-24.34,24.35-50.2,50.21-.4.39.4.41L1250,1536.81l286.66-286.66.14-.16-.26-.14"></path></svg>
      </React.Fragment>
    },
    {
      'name': "MEXC",
      'link': 'https://www.mexc.com/',
      'logo': <React.Fragment>
        <svg viewBox="0 0 2500 2500"><path d="M2459.7,1566.6l-540.6-937.7c-118.5-195.5-407.5-197.5-521.9,8.3l-567.6,975.2 c-106,178.8,25,403.3,237.1,403.3H2204C2418.1,2015.7,2578.2,1784.9,2459.7,1566.6z" fill="#003087"></path><path d="M1680,1639.4l-33.3-58.2c-31.2-54.1-99.8-170.5-99.8-170.5l-457.4-794.3C971,439.7,690.3,425.1,571.8,647.6 L39.5,1568.7c-110.2,193.4,20.8,444.9,259.9,447h1131.1h482.4h286.9C1906.7,2017.8,1813.1,1866,1680,1639.4L1680,1639.4z" fill="#1972E2"></path><path d="M1680.1,1639.4l-33.3-58.2c-31.2-54.1-99.8-170.5-99.8-170.5l-295.3-519.8l-424.2,723.6 c-106,178.8,25,403.4,237,403.4h363.9h482.4h289C1904.6,2015.7,1813.1,1866,1680.1,1639.4L1680.1,1639.4z" fill="url(#mexc-gradient)"></path></svg>
      </React.Fragment>
    },
    {
      'name': "Bybit",
      'link': 'https://www.bybit.com/',
      'logo': <React.Fragment>
        <svg viewBox="8 8 84 84"><path fill="#F7A600" d="m69.17248,54.28325l0,-22.3572l4.4939,0l0,22.3572l-4.4939,0z"></path><path fill="white" d="m16.79825,60.92435l-9.63407,0l0,-22.35719l9.24666,0c4.49394,0 7.11244,2.44919 7.11244,6.28029c0,2.4799 -1.6817,4.0825 -2.8457,4.6161c1.3894,0.6277 3.1679,2.0404 3.1679,5.0249c0,4.1749 -2.9407,6.4359 -7.04723,6.4359zm-0.74311,-18.4628l-4.39706,0l0,5.1497l4.39706,0c1.90714,0 2.97424,-1.0364 2.97424,-2.5757c0,-1.5376 -1.0671,-2.574 -2.97424,-2.574zm0.29055,9.0749l-4.68761,0l0,5.4952l4.68761,0c2.03739,0 3.00589,-1.2553 3.00589,-2.7638c0,-1.5068 -0.9703,-2.7314 -3.00589,-2.7314z"></path><path fill="white" d="m37.55238,51.75535l0,9.169l-4.4622,0l0,-9.169l-6.9187,-13.18819l4.8813,0l4.3002,9.01159l4.2351,-9.01159l4.8813,0l-6.917,13.18819z"></path><path fill="white" d="m57.20988,60.92435l-9.6341,0l0,-22.35719l9.2467,0c4.4939,0 7.1124,2.44919 7.1124,6.28029c0,2.4799 -1.6817,4.0825 -2.8457,4.6161c1.3894,0.6277 3.168,2.0404 3.168,5.0249c0,4.1749 -2.9408,6.4359 -7.0473,6.4359zm-0.7431,-18.4628l-4.3971,0l0,5.1497l4.3971,0c1.9071,0 2.9742,-1.0364 2.9742,-2.5757c0,-1.5376 -1.0671,-2.574 -2.9742,-2.574zm0.2905,9.0749l-4.6876,0l0,5.4952l4.6876,0c2.0374,0 3.0059,-1.2553 3.0059,-2.7638c0,-1.5068 -0.9685,-2.7314 -3.0059,-2.7314z"></path><path fill="white" d="m88.15018,42.46155l0,18.4645l-4.4939,0l0,-18.4645l-6.0136,0l0,-3.89439l16.5211,0l0,3.89439l-6.0136,0z"></path></svg>
      </React.Fragment>
    },
    {
      'name': "Kucoin",
      'link': 'https://www.kucoin.com/',
      'logo': <React.Fragment>
        <svg viewBox="0 0 24 24"><path fill="#24ae8f" d="m7.9 12 7.1 6.5 4.5-4.1a2 1.9 0 1 1 2.9 2.6l-5.9 5.4a2.1 1.9 0 0 1-2.9 0l-8.5-7.8v4.7a2 1.9 0 1 1-4.1 0v-15a2 1.9 0 1 1 4.1 0v4.7l8.5-7.8a2.1 1.9 0 0 1 2.9 0l5.9 5.4a2 1.9 0 1 1-2.9 2.6l-4.5-4.1zm7.1-1.9a2 1.9 0 1 0 2 1.9 2 1.9 0 0 0-2-1.9z"></path></svg>
      </React.Fragment>
    },
    {
      'name': "Gate.io",
      'link': 'https://www.gate.io/',
      'logo': <React.Fragment>
        <svg viewBox="0 0 229 229"><path fill="#2354e6" d="M114.475154,177.475321 C79.7034538,177.475321 51.5151256,149.282841 51.5151256,114.500713 C51.5151256,79.7209602 79.7034538,51.5237291 114.475154,51.5237291 L114.475154,-0.000950201555 C51.2515057,-0.000950201555 -1.68750626e-14,51.2624237 -1.68750626e-14,114.500713 C-1.68750626e-14,177.736626 51.2515057,229 114.475154,229 C177.696428,229 228.950308,177.736626 228.950308,114.500713 L177.435183,114.500713 C177.435183,149.282841 149.246855,177.475321 114.475154,177.475321"></path><polygon fill="#17E6A1" points="114.474679 114.499287 177.434708 114.499287 177.434708 51.5246793 114.474679 51.5246793"></polygon></svg>
      </React.Fragment>
    },
    {
      'name': "OKX",
      'link': 'https://www.okx.com/',
      'logo': <React.Fragment>
        <svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" fill="#000"></rect><rect x="6" y="6" width="4" height="4" fill="#fff"></rect><rect x="14" y="6" width="4" height="4" fill="#fff"></rect><rect x="10" y="10" width="4" height="4" fill="#fff"></rect><rect x="6" y="14" width="4" height="4" fill="#fff"></rect><rect x="14" y="14" width="4" height="4" fill="#fff"></rect></svg>
      </React.Fragment>
    },
    {
      'name': "Coinbase",
      'link': 'https://www.coinbase.com/',
      'logo': <React.Fragment>
        <svg viewBox="62 62 900 900"><path d="M512.147 692C412.697 692 332.146 611.45 332.146 512C332.146 412.55 412.697 332 512.147 332C601.247 332 675.197 396.95 689.447 482H870.797C855.497 297.2 700.846 152 512.147 152C313.396 152 152.146 313.25 152.146 512C152.146 710.75 313.396 872 512.147 872C700.846 872 855.497 726.8 870.797 542H689.297C675.047 627.05 601.247 692 512.147 692Z" fill="#fff"></path></svg>
      </React.Fragment>
    },
  ]

  return (
  <div className="cryptomodal">
    <div className="cryptomodal-content ">
      <span className="close" onClick={onClose}>&times;</span> {/* Close button to close the modal */}
      <div className='modal-data'>
        <div className='crypto-info'>
          <div className='crypto-image'>
              <div className='crypto-logo'>
                <Image 
                  src={selectedBubble.logo} 
                  layout='fill'
                  objectFit='contain'
                  alt={selectedBubble.name} 
                />
              </div>
              <div className='trade-links'>
                {tradeLists?.map((item, index) => (
                  <div className='trade-item' key={index}>
                    <Link href={item.link} target='_blank'>
                      {item.logo && 
                        <span>{item.logo}</span>
                      }
                      {item.name}
                      <svg fill='#fff' viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
                    </Link>
                  </div>                    
                ))}
              </div>
          </div>
          <div className='details'>
              <ul>
                {/* {selectedBubble.Id && 
                  <li><strong>ID:</strong> {selectedBubble.Id}</li>
                } */}
                {selectedBubble.name &&
                  <li><strong>Coin Name:</strong> {selectedBubble.name}</li>
                }
                {selectedBubble.cmc_rank &&
                  <li><strong>CMC Rank:</strong> {selectedBubble.cmc_rank}</li>
                }
                {selectedBubble.marketcap &&
                  <li><strong>Market Cap:</strong> {convertToString(selectedBubble.marketcap)}</li>
                }
                 {selectedBubble.price &&
                  <li><strong>Price:</strong> ${parseFloat(selectedBubble.price).toFixed(2)}</li>
                }
              </ul>
          </div>
        </div>
        <LineChart />
      </div>
    </div>
  </div>
  );
};

export default CoinModel;
