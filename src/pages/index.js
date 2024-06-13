import { useRef, useEffect, useState,useCallback,useMemo } from 'react';
import Link from 'next/link';
import '../../assets/main.css';
import '../../assets/bubble.css';
import PercentageFilter from '../components/D3JS/PercentageFilter';
import CryptoTable from '../components/CryptoTable';
import {CoinModel} from '../components/Modal';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AutoComplete, AutoCompleteGroup, AutoCompleteInput, AutoCompleteItem, AutoCompleteList } from "@choc-ui/chakra-autocomplete"
import Loading from '../components/Loading';
import { Height } from '@mui/icons-material';
import { debounce } from 'lodash';

const D3Bubbles = () => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [percentage, setPercentage] = useState('percent_change_24h');
  const [clickedBubble, setClickedBubble] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bubbles, setBubbles] = useState([]); // Define bubbles state
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [cryptoData, setCryptoData] = useState([]);
  const [isloading, setLoading] = useState(false);

  const [draggingBubble, setDraggingBubble] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });


  const PADDING = 20; // Adjust this value as needed

  const fetchData = useCallback(async (page, percentage) => {
    try {
      NProgress.start(); // Start the progress bar
      setLoading(true);
      const response = await fetch(`/api/api?page=${page}&sort=${percentage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      NProgress.done(); // Stop the progress bar
      setLoading(false);
    }
  }, []);

 
  const updateDimensions = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  // Debounced function for window resize
  const debouncedUpdateDimensions = useCallback(
    debounce(() => {
      updateDimensions();
    }, 300), // Adjust debounce delay as needed
    []
  );

  useEffect(() => {
    updateDimensions(); // Set initial dimensions
    window.addEventListener('resize', debouncedUpdateDimensions);

    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
    };
  }, [debouncedUpdateDimensions, updateDimensions]);

  useEffect(() => {
    NProgress.start();
    cryptoFetch();
    const intervalId = setInterval(() => {
      cryptoFetch();
      NProgress.done();
    }, 60000); // 1 minute interval

    return () => clearInterval(intervalId);
  }, [percentage]);

  const cryptoFetch = useCallback(async () => {
    try {
      NProgress.start();
      const response = await fetch(`/api/crypto-api`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      let hundred = jsonData.slice(0, 99);
      setCryptoData(hundred);
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      NProgress.done();
    }
  }, []);


  useEffect(() => {
    NProgress.start();
    cryptoFetch();
    const intervalId = setInterval(() => {
      cryptoFetch();
      NProgress.done();
    }, 60000); // 1 minute interval

    return () => clearInterval(intervalId);
  }, [percentage]);

  const onPageChange = (page) => {
    setCurrentPage(page);
    fetchData(page, percentage);
  };

  const onPercentageChange = (percentage) => {
    setPercentage(percentage);
    fetchData(1, percentage);
  };

  useEffect(() => {
    const preLoadCryptoImages = async () => {
      setLoading(true);
      const promises = cryptoData.map(async (bubble) => {
        const logo = new Image();
        logo.src = `https://cryptobubbles.net/backend/${bubble.image}`;
        logo.alt = bubble.name;

        await new Promise((resolve, reject) => {
          logo.onload = () => resolve(logo);
          logo.onerror = () => reject(new Error(`Error loading image: ${logo.src}`));
        });

        return logo;
      });
      const loadedImages = await Promise.all(promises);
      const updatedBubbles = cryptoData.map((d, index) => ({
        ...d,
        radius: calculateRadius(d),
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        imageObj: loadedImages[index],
      }));
      setBubbles(updatedBubbles);
      setLoading(false);
    };
    preLoadCryptoImages();
  }, [cryptoData, width, height]);

  const calculateRadius = useMemo(() => {
    return (bubble, maxRadius = width * 0.1) => {
      let baseRadius = 0;
      if (percentage === 'percent_change_24h') {
        baseRadius = width * 0.016;
      } else if (percentage === 'percent_change_1h') {
        baseRadius = width * 0.024;
      } else if (percentage === 'percent_change_7d') {
        baseRadius = width * 0.014;
      } else if (percentage === 'percent_change_30d') {
        baseRadius = width * 0.013;
      }

      const padding = 2;

      const increaseFactor = {
        'percent_change_24h': 4,
        'percent_change_1h': 20,
        'percent_change_7d': 2,
        'percent_change_30d': 1,
      }[percentage] || 8;

      let percentageChange = 0;
      if (bubble.performance) {
        if (percentage === 'percent_change_24h') {
          percentageChange = bubble.performance.day;
        } else if (percentage === 'percent_change_1h') {
          percentageChange = bubble.performance.hour;
        } else if (percentage === 'percent_change_7d') {
          percentageChange = bubble.performance.week;
        } else if (percentage === 'percent_change_30d') {
          percentageChange = bubble.performance.month;
        }
      }

      const radiusChange = Math.abs(percentageChange) * increaseFactor;
      let radius = Math.max(baseRadius + padding + radiusChange, 10);

      if (maxRadius !== null) {
        radius = Math.min(radius, maxRadius);
      }
      return radius;
    };
  }, [percentage, width]);

  const handleClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    bubbles.forEach((bubble) => {
      const dx = x - bubble.x;
      const dy = y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= bubble.radius) {
        setClickedBubble(bubble);
        setIsModalOpen(true);
        // Set clicked bubble border to white
        bubble.border = 'white';
      } else {
        // Reset border color for other bubbles on click
        bubble.border = 'transparent';
      }
    });
  };

  const percentageChange = useCallback(
    (bubble) => {
      if (percentage === 'percent_change_24h') {
        return bubble.performance.day;
      } else if (percentage === 'percent_change_1h') {
        return bubble.performance.hour;
      } else if (percentage === 'percent_change_7d') {
        return bubble.performance.week;
      } else if (percentage === 'percent_change_30d') {
        return bubble.performance.month;
      }
    },
    [percentage]
  );

  const text = useCallback(
    (bubble) => {
      if (percentage === 'percent_change_24h') {
        return `${parseFloat(bubble.performance.day).toFixed(1)}%`;
      } else if (percentage === 'percent_change_1h') {
        return `${parseFloat(bubble.performance.hour).toFixed(1)}%`;
      } else if (percentage === 'percent_change_7d') {
        return `${parseFloat(bubble.performance.week).toFixed(1)}%`;
      } else if (percentage === 'percent_change_30d') {
        return `${parseFloat(bubble.performance.month).toFixed(1)}%`;
      }
    },
    [percentage]
  );


 
  useEffect(() => {
    if (bubbles.length > 0) {
      const canvas = canvasRef.current;
      let context;
      let width;
      let height;
      let animationFrameId;
  
      if (canvas) {
        context = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;
      }
  
      const offscreenCanvas = new OffscreenCanvas(width, height);
      const offscreenContext = offscreenCanvas.getContext('2d');
  
      const update = () => {
        if (bubbles.length === 0) return;
  
        offscreenContext.clearRect(0, 0, width, height);
        const minSpacing = 10;
  
        for (let i = 0; i < bubbles.length; i++) {
          const bubble = bubbles[i];
            bubble.x += bubble.vx * 0.001;
            bubble.y += bubble.vy * 0.001;
        
            // bubble.vx *= 0.999;
            // bubble.vy *= 0.999;
  
          if (bubble.x + bubble.radius > width - PADDING || bubble.x - bubble.radius < PADDING) {
            bubble.vx *= -1;
          }
          if (bubble.y + bubble.radius > height - PADDING || bubble.y - bubble.radius < PADDING) {
            bubble.vy *= -1;
          }
  
          if (bubble.x + bubble.radius > width - PADDING) {
            bubble.x = width - PADDING - bubble.radius;
          } else if (bubble.x - bubble.radius < PADDING) {
            bubble.x = PADDING + bubble.radius;
          }
          if (bubble.y + bubble.radius > height - PADDING) {
            bubble.y = height - PADDING - bubble.radius;
          } else if (bubble.y - bubble.radius < PADDING) {
            bubble.y = PADDING + bubble.radius;
          }
        }
  
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const bubble1 = bubbles[i];
            const bubble2 = bubbles[j];
            const dx = bubble2.x - bubble1.x;
            const dy = bubble2.y - bubble1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = bubble1.radius + bubble2.radius + minSpacing;
  
            if (distance < minDistance) {
              const angle = Math.atan2(dy, dx);
              const targetX = bubble1.x + Math.cos(angle) * minDistance;
              const targetY = bubble1.y + Math.sin(angle) * minDistance;
              const ax = (targetX - bubble2.x) * 0.009;
              const ay = (targetY - bubble2.y) * 0.009;
              bubble1.vx -= ax;
              bubble1.vy -= ay;
              bubble2.vx += ax;
              bubble2.vy += ay;
            }
          }
        }
  
        for (let i = 0; i < bubbles.length; i++) {
          const bubble = bubbles[i];
          offscreenContext.beginPath();
          offscreenContext.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  
          const shadowGradient = offscreenContext.createRadialGradient(bubble.x, bubble.y, bubble.radius * 0.75, bubble.x, bubble.y, bubble.radius);
          const percentChange = percentageChange(bubble);
          const greenIntensity = Math.max(40, 70 + Math.abs(percentChange) * 10);
          const redIntensity = Math.max(40, 100 + Math.abs(percentChange) * 10);
  
          if (percentChange > 0) {

            if (percentChange < 10) {
              shadowGradient.addColorStop(0, `rgb(63,162,63,0)`)
              shadowGradient.addColorStop(1, `rgba(63, 162, 63, 1)`)
            } else if(percentChange < 5) {
              shadowGradient.addColorStop(0, `rgb(90, 50, 50,0.1)`)
              shadowGradient.addColorStop(1, `rgba(90, 50, 50, 1)`)

            }
            shadowGradient.addColorStop(0, `rgb(0, ${greenIntensity}, 0,0.1)`); // Dark green
            shadowGradient.addColorStop(1, `rgba(0, ${greenIntensity}, 0)`); // Light green with some transparency
          } else {
            if (percentChange > -10) {
              shadowGradient.addColorStop(0, `rgb(129, 77, 77,0)`)
              shadowGradient.addColorStop(1, `rgba(129, 77, 77, 1)`)
            }
            // Red gradient for negative change
            shadowGradient.addColorStop(0, `rgb(${redIntensity}, 0, 0, 0.2)`); // Dark red
            shadowGradient.addColorStop(1, `rgba(${redIntensity}, 0, 0)`); // Light red with some transparency
          }

  
          offscreenContext.fillStyle = shadowGradient;
          offscreenContext.fill();
          offscreenContext.closePath();
  
          const fontSizePercentage = bubble.radius * 0.4;
          offscreenContext.font = `${fontSizePercentage}px Arial`;
          offscreenContext.fillStyle = 'white';
          offscreenContext.textAlign = 'center';
          offscreenContext.textBaseline = 'middle';
          const percentageText = text(bubble);
          offscreenContext.fillText(percentageText.toUpperCase(), bubble.x, bubble.y);
  
          const fontSizeSymbol = bubble.radius * 0.3;
          offscreenContext.font = `${fontSizeSymbol}px Arial`;
          offscreenContext.fillText(bubble.symbol.slice(0, 3), bubble.x, bubble.y + fontSizeSymbol * 1.5);
  
          if (bubble.imageObj && bubble.imageObj.complete) {
            const imageSizeScale = 0.5;
            const imageWidth = bubble.radius * imageSizeScale;
            const imageHeight = bubble.radius * imageSizeScale;
            const imageY = bubble.y - bubble.radius * 0.8;
            offscreenContext.drawImage(bubble.imageObj, bubble.x - imageWidth / 2, imageY, imageWidth, imageHeight);
          }
        }
  
        // Draw the offscreen canvas to the main canvas
        context.clearRect(0, 0, width, height);
        context.drawImage(offscreenCanvas, 0, 0);
  
        animationFrameId = requestAnimationFrame(update);
      };
  
      update();
  
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [bubbles]);

  const handleCollisions = () => {
    let collisionHandled = true; // Flag to track if collisions have been handled

    for (let i = 0; i < bubbles.length && !collisionHandled; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        if (isColliding(bubbles[i], bubbles[j])) {
          const angle = Math.atan2(bubbles[j].y - bubbles[i].y, bubbles[j].x - bubbles[i].x);
          bubbles[i].x -= Math.cos(angle);
          bubbles[i].y -= Math.sin(angle);
          bubbles[j].x += Math.cos(angle);
          bubbles[j].y += Math.sin(angle);
          collisionHandled = false; // Set the flag to true after handling collisions once
          break; // Exit the inner loop
        }
      }
    }
  };

  const isColliding = (bubble1, bubble2) => {
    const distance = Math.sqrt((bubble1.x - bubble2.x) ** 2 + (bubble1.y - bubble2.y) ** 2);
    return distance < bubble1.radius + bubble2.radius;
  };


  const handleMouseDown = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    bubbles.forEach((bubble) => {
      const dx = mouseX - bubble.x;
      const dy = mouseY - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= bubble.radius) {
        setDraggingBubble(bubble);
        setDragOffset({ x: dx, y: dy });
      }
    });
  };

  const handleMouseMove = (event) => {
    if (draggingBubble) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      draggingBubble.x = mouseX - dragOffset.x;
      draggingBubble.y = mouseY - dragOffset.y;
    }
  };

  const handleMouseUp = () => {
    setDraggingBubble(null);
    setDragOffset({ x: 0, y: 0 });
  };


  const handleSelect = (selectedOption) => {
    setClickedBubble(selectedOption);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='nav'>
        <Link href="/">
          <h1 className='logo'>
            <img
              src="/media.png"
              alt='Crypto Bubble'
            />
          </h1>
        </Link>

        <div id="filters">
          <div>
            <AutoComplete rollNavigation >
              <AutoCompleteInput className="input" varient="filled" placeholder="Search..." />
              <AutoCompleteList>
                <AutoCompleteGroup title="Coins" showDivider>
                  {bubbles.map((name, oid) => (
                    <AutoCompleteItem
                      key={name.id}
                      value={name.name}
                      textTransform="capitalize"
                      align="center"
                      onClick={() => handleSelect(name)}
                    >
                      <h1 style={{ color: 'white', fontSize: '1rem' }}>{name.name}</h1>
                    </AutoCompleteItem>
                  ))}
                </AutoCompleteGroup>
              </AutoCompleteList>
            </AutoComplete>
          </div>
          {/* <PageFilter onPageChange={onPageChange} /> */}
        </div>
      </div>

      <PercentageFilter onPercentageChange={onPercentageChange} />
      {isloading ? (<Loading />) : (<div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: "#222"}}>
        <canvas
          ref={canvasRef}
          width={width} // Use 400 as a default width
          height={850} // Use 400 as a default height
          style={{ margin: 0 }}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
        <CryptoTable tableData={cryptoData} />
      </div>)}

      {isModalOpen && <CoinModel show={isModalOpen} onClose={() => setIsModalOpen(false)} selectedBubble={clickedBubble} />}
    </>
  );
};

export default D3Bubbles;