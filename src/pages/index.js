import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import '../../assets/main.css';
import '../../assets/bubble.css';
import PageFilter from '../components/D3JS/limit';
import PercentageFilter from '../components/D3JS/PercentageFilter';
import CryptoTable from '../components/CryptoTable';
import CoinModel from '../components/Modal';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import coins from "../../assets/bubbles.json"
import { AutoComplete, AutoCompleteGroup, AutoCompleteInput, AutoCompleteItem, AutoCompleteList } from "@choc-ui/chakra-autocomplete"
import cryptoBubbles from '../../assets/bubbles.json'

const D3Bubbles = () => {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [percentage, setPercentage] = useState('percent_change_24h');
  const [clickedBubble, setClickedBubble] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bubbles, setBubbles] = useState([]); // Define bubbles state
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [cryptoData, setCryptoData] = useState([]);

  const [draggingBubble, setDraggingBubble] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedItems, setSelectedItems] = useState([]);
  const [pickerItems, setPickerItems] = useState(coins);
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const intervalIdRef = useRef(null);


  const fetchData = async (page, percentage) => {
    try {
      NProgress.start(); // Start the progress bar
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
    }
  };

  const cryptoFetch = async() => {
    try {
      NProgress.start(); //Start the process bar
      const response = await fetch(`/api/crypto-api`);
      if(!response.ok) {
        throw new Error('Network response was not ok')
      }
      const jsonData = await response.json();
      let hundred = jsonData.slice(0,99)
      setCryptoData(hundred);
      console.log(hundred)
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      NProgress.done(); 
    }
  }

  useEffect(() => {
    // fetchData(1, percentage); // Fetch initial page when component mounts
    if (typeof window !== 'undefined') {
      // Client-side-only code
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
    cryptoFetch()


    const intervalId = setInterval(cryptoFetch, 30000); // 30 seconds

    return () => clearInterval(intervalId); 
  }, [percentage]);

  const onPageChange = (page) => {
    setCurrentPage(page); // Update current page state
    fetchData(page, percentage); // Fetch data for the selected page
  };

  const onPercentageChange = (percentage) => {
    setPercentage(percentage);
    fetchData(1, percentage);
  };

  useEffect(() => {
    if (!data.length) return;
    if (!cryptoData.length) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('1d');

    // const preloadImages = async () => {
    //   const promises = data.map(async (bubble) => {
    //     const logo = new Image();
    //     logo.src = bubble.logo; // Set the image source URL
    //     logo.alt = bubble.Name;

    //     // Wait for the image to load before resolving the promise
    //     await new Promise((resolve, reject) => {
    //       logo.onload = () => resolve(logo);
    //       logo.onerror = () => reject(new Error(`Error loading image: ${logo.src}`));
    //     });

    //     return logo;
    //   });
    //   // Wait for all images to load before proceeding
    //   const loadedImages = await Promise.all(promises);

    //   const updatedBubbles = data.map((d, index) => ({
    //     ...d,
    //     // radius: calculateRadius(d.quote.USD.percent_change_24h),
    //     radius: calculateRadius(d),
    //     x: Math.random() * width,
    //     y: Math.random() * height,
    //     vx: Math.random() * 2 - 1,
    //     vy: Math.random() * 2 - 1,
    //     imageObj: loadedImages[index], // Assign the loaded image object
    //   }));
    //   setBubbles(updatedBubbles);
    // };

    const preLoadCryptoImages = async () => {
      const promises = cryptoData.map(async (bubble) => {
        const logo = new Image();
        logo.src = `https://cryptobubbles.net/backend/${bubble.image}` // Set the image source URL
        logo.alt = bubble.name

        await new Promise((resolve, reject) => {
          logo.onload = () => resolve(logo);
          logo.onerror = () => reject(new Error(`Error loading image: ${logo.src}`))
        });

        return logo;
      })
      // Wait for all images to laod before proceeding
      const loadedImages  = await Promise.all(promises);

      const updatedBubbles = cryptoData.map((d, index) => ({
        ...d,
        radius: calculateRadius(d),
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 0.6,
        vy: Math.random() * 0.6,
        imageObj: loadedImages[index],
      }))
      setBubbles(updatedBubbles)
    }


    preLoadCryptoImages();

    
  }, [data]);


  function calculateRadius(bubble, maxRadius = width * 0.12) {
    /**
     * Calculates the radius of a bubble based on a percentage change and an optional maximum radius.

    Args:
        bubble: A dictionary containing the bubble data.
        percentage: The percentage change to use for calculating the radius increase ("percent_change_24h", "percent_change_1h", etc.).
        max_radius: The maximum allowed radius (optional).

    Returns:
        The calculated radius, clamped to the maximum radius if provided.
     * 
     */
    let baseRadius = 0
    if (percentage === 'percent_change_24h') {
      baseRadius =  width * 0.020
    } else if (percentage === 'percent_change_1h') {
      baseRadius = width * 0.020
    } else if (percentage === 'percent_change_7d') {
      baseRadius =  width * 0.020
    } else if (percentage === 'percent_change_30d') {
      baseRadius =  width * 0.016
    }

    const padding = 2;

    const increaseFactor = {
      "percent_change_24h": 5,
      "percent_change_1h": 5,
      "percent_change_7d": 1.5,  // Added factor for 7d change
      "percent_change_30d": 1,  // Added factor for 30d change
    }[percentage] || 8;  // Default factor for other percentages (using bracket notation)
    let percentageChange;
    // if (percentage === 'percent_change_24h') {
    //   percentageChange = bubble.quote.USD.percent_change_24h
    // } else if (percentage === 'percent_change_1h') {
    //   percentageChange = bubble.quote.USD.percent_change_1h
    // } else if (percentage === 'percent_change_7d') {
    //   percentageChange = bubble.quote.USD.percent_change_7d
    // } else if (percentage === 'percent_change_30d') {
    //   percentageChange = bubble.quote.USD.percent_change_30d
    // }
    if (percentage === 'percent_change_24h') {
      percentageChange = bubble.performance.day
    } else if (percentage === 'percent_change_1h') {
      percentageChange = bubble.performance.hour
    } else if (percentage === 'percent_change_7d') {
      percentageChange = bubble.performance.week
    } else if (percentage === 'percent_change_30d') {
      percentageChange = bubble.performance.month
    }

    const radiusChange = Math.abs(percentageChange) * increaseFactor;

    let radius = Math.max(baseRadius + padding + radiusChange, 10);
    // let radius =Math.min(Math.max(Math.abs(radiusChange* 20), 30), 10)

    if (maxRadius !== null) {
      radius = Math.min(radius, maxRadius);  // Clamp radius to maximum
    }
    return radius;
  }

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
        console.log(isModalOpen)
        // Set clicked bubble border to white
        bubble.border = 'white';
      } else {
        // Reset border color for other bubbles on click
        bubble.border = 'transparent';
      }
    });
  };

  const percentageChange = (bubble) => {
    if (percentage === 'percent_change_24h') {
      return bubble.performance.day
    } else if (percentage === 'percent_change_1h') {
      return bubble.performance.hour
    } else if (percentage === 'percent_change_7d') {
      return bubble.performance.week
    } else if (percentage === 'percent_change_30d') {
      return bubble.performance.month
    }
  }

  const text = (bubble) => {
    if (percentage === 'percent_change_24h') {
      return `${parseFloat(bubble.performance.day).toFixed(1)}%`
    } else if (percentage === 'percent_change_1h') {
      return `${parseFloat(bubble.performance.hour).toFixed(1)}%`
    } else if (percentage === 'percent_change_7d') {
      return `${parseFloat(bubble.performance.week).toFixed(1)}%`
    } else if (percentage === 'percent_change_30d') {
      return `${parseFloat(bubble.performance.month).toFixed(1)}%`
    }
  }


  useEffect(() => {
    if (bubbles.length > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      function update() {
        context.clearRect(0, 0, width, height);
        const minSpacing = 10;

        bubbles.forEach(bubble => {
          bubble.x += bubble.vx;
          bubble.y += bubble.vy;

          // if (bubble.x + bubble.radius > width || bubble.x - bubble.radius < 0) {
          //   bubble.vx *= -1;
          // }
          // if (bubble.y + bubble.radius > height || bubble.y - bubble.radius < 0) {
          //   bubble.vy *= -1;
          // }

          // Check if the bubble reaches the boundaries of the canvas
          if (bubble.x + bubble.radius > width) {
            bubble.x = width - bubble.radius; // Adjust x-coordinate to keep the bubble inside
            bubble.vx *= -1; // Reverse the horizontal velocity
          } else if (bubble.x - bubble.radius < 0) {
            bubble.x = bubble.radius; // Adjust x-coordinate to keep the bubble inside
            bubble.vx *= -1; // Reverse the horizontal velocity
          }
          if (bubble.y + bubble.radius > height) {
            bubble.y = height - bubble.radius; // Adjust y-coordinate to keep the bubble inside
            bubble.vy *= -1; // Reverse the vertical velocity
          } else if (bubble.y - bubble.radius < 0) {
            bubble.y = bubble.radius; // Adjust y-coordinate to keep the bubble inside
            bubble.vy *= -1; // Reverse the vertical velocity
          }

          bubbles.forEach(otherBubble => {
            if (otherBubble !== bubble) {
              const dx = otherBubble.x - bubble.x;
              const dy = otherBubble.y - bubble.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < bubble.radius + otherBubble.radius + minSpacing) {
                const overlap = bubble.radius + otherBubble.radius + minSpacing - distance;
                const angle = Math.atan2(dy, dx);
                const offsetX = overlap * Math.cos(angle);
                const offsetY = overlap * Math.sin(angle);

                // Adjust positions to add spacing
                bubble.x -= offsetX / 2;
                bubble.y -= offsetY / 2;
                otherBubble.x += offsetX / 2;
                otherBubble.y += offsetY / 2;
              }
            }
          });

          context.beginPath();
          context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
          const shadowGradient = context.createRadialGradient(bubble.x, bubble.y, bubble.radius * 0.75, bubble.x, bubble.y, bubble.radius);
          // const percentChange = parseFloat(bubble.quote.USD.percent_change_24h);
          const percentChange = percentageChange(bubble);
          const greenIntensity = Math.max(40, 70 + Math.abs(percentChange) * 10);
          const redIntensity = Math.max(40, 100 + Math.abs(percentChange) * 10);

          if (percentChange > 0) {
            if(percentChange < 10) {
              shadowGradient.addColorStop(0, `rgb(63,162,63,0)`)
              shadowGradient.addColorStop(1, `rgba(63, 162, 63, 1)`)
            }
            shadowGradient.addColorStop(0, `rgb(0, ${greenIntensity}, 0,0.1)`); // Dark green
            shadowGradient.addColorStop(1, `rgba(0, ${greenIntensity}, 0)`); // Light green with some transparency
          } else {
            if(percentChange > -10) {
              shadowGradient.addColorStop(0, `rgb(127, 56, 56,0)`)
              shadowGradient.addColorStop(1, `rgba(127, 56, 56, 1)`)
            }
            // Red gradient for negative change
            shadowGradient.addColorStop(0, `rgb(${redIntensity}, 0, 0, 0.2)`); // Dark red
            shadowGradient.addColorStop(1, `rgba(${redIntensity}, 0, 0)`); // Light red with some transparency
          }

          context.fillStyle = shadowGradient;
          context.lineWidth = 2; // Adjust border width as needed
          context.stroke(); // Draw the border
          context.fill();


          context.closePath();

          const fontSizePercentage = bubble.radius * .4;
          const fontSizeSymbol = bubble.radius * 0.3;

          context.font = `${fontSizePercentage}px Arial`;
          context.fillStyle = 'white';
          context.textAlign = 'center';
          context.textTransform = 'uppercase';
          const textHeight = bubble.radius * 0.6;

          // const percentageText = `%${parseFloat(bubble.quote.USD.percent_change_24h).toFixed(1)}`;
          const percentageText = text(bubble);
          context.fillText(percentageText.toUpperCase(), bubble.x, bubble.y + textHeight);

          const symbolHeight = bubble.radius * 0.1
          context.font = `${fontSizeSymbol}px Arial`;
          context.fillStyle = 'white';
          context.textAlign = 'center';
          // const symbolHeight = Math.abs(bubble.quote.USD.volume_change_24h) * -0.4;
          context.fillText(bubble.symbol.slice(0, 3), bubble.x, bubble.y + symbolHeight);

          // Set stroke style for the border
          context.strokeStyle = bubble.border || 'transparent'; // Use 'bubble.border' if set, otherwise transparent
          context.lineWidth = 2; // Adjust border width as needed

          context.stroke(); // Draw the stroke (border)

          // Draw image
          // Determine the scaling factor for the image size based on the bubble radius
          const imageSizeScale = 0.5; // Adjust this value as needed

          // Calculate the image width and height based on the bubble radius
          const imageWidth = bubble.radius * imageSizeScale;
          const imageHeight = bubble.radius * imageSizeScale;

          // Calculate the y-coordinate for positioning the image on top of the bubble
          // Adjust this value based on your requirements to position the image as desired
          const imageY = bubble.y - bubble.radius * 0.8;

          // Draw the image
          if (bubble.imageObj && bubble.imageObj.complete) {
            context.drawImage(bubble.imageObj, bubble.x - imageWidth / 2, imageY, imageWidth, imageHeight);
          }

        });
        handleCollisions();
        requestAnimationFrame(update);
      }

      update();

      return () => {
        cancelAnimationFrame(update);
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
              src="/Logo.png"
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

      <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: "#222", overflow: 'auto' }}>
        <canvas
          ref={canvasRef}
          width={width} // Use 400 as a default width
          height={600}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
        <CryptoTable tableData={data} />
      </div>
      {isModalOpen && <CoinModel show={isModalOpen} onClose={() => setIsModalOpen(false)} selectedBubble={clickedBubble} />}
    </>
  );
};

export default D3Bubbles;
