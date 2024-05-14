import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import '../../assets/main.css';
import '../../assets/bubble.css';
import PageFilter from '../components/D3JS/limit';
import PercentageFilter from '../components/D3JS/PercentageFilter';
import { CryptoTable } from '../components/CryptoTable';
import Modal from '../components/Modal';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const D3Bubbles = () => {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [percentage, setPercentage] = useState('percent_change_24h');
  const [clickedBubble, setClickedBubble] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bubbles, setBubbles] = useState([]); // Define bubbles state


  const [draggingBubble, setDraggingBubble] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  

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

  useEffect(() => {
    fetchData(1, percentage); // Fetch initial page when component mounts
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
    console.log("Data: ", data)

    if (!data.length) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const preloadImages = async () => {
      const promises = data.map(async (bubble) => {
        const logo = new Image();
        logo.src = bubble.logo; // Set the image source URL
        logo.alt = bubble.Name;

        // Wait for the image to load before resolving the promise
        await new Promise((resolve, reject) => {
          logo.onload = () => resolve(logo);
          logo.onerror = () => reject(new Error(`Error loading image: ${logo.src}`));
        });

        return logo;
      });

      // Wait for all images to load before proceeding
      const loadedImages = await Promise.all(promises);

      const updatedBubbles = data.map((d, index) => ({
        ...d,
        radius: Math.min(Math.max(Math.abs(d.quote.USD.volume_change_24h * 20), 40), 60),
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        imageObj: loadedImages[index], // Assign the loaded image object
      }));

      setBubbles(updatedBubbles);
    };

    preloadImages();
  }, [data]);


  const handleClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    bubbles.forEach(bubble => {
      const dx = x - bubble.x;
      const dy = y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= bubble.radius) {
        setClickedBubble(bubble);
        setIsModalOpen(true);
      }
    });
  };


  useEffect(() => {
    if (bubbles.length > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      function update() {
        context.clearRect(0, 0, width, height);

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

              if (distance < bubble.radius + otherBubble.radius) {
                const overlap = bubble.radius + otherBubble.radius - distance;
                const angle = Math.atan2(dy, dx);
                const offsetX = overlap * Math.cos(angle);
                const offsetY = overlap * Math.sin(angle);

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
          if (bubble.quote.USD.volume_change_24h < 0) {
            shadowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.0)');
            shadowGradient.addColorStop(1, 'rgb(255 0 20 / 71%)');
          } else {
            shadowGradient.addColorStop(0, 'rgb(32 241 32 / 0%)');
            shadowGradient.addColorStop(1, 'rgb(0 251 0 / 71%)');
          }
          context.fillStyle = shadowGradient;
          context.fill();

          context.closePath();

          const fontSizePercentage = bubble.radius * .4;
          const fontSizeSymbol = bubble.radius * 0.3;

          context.font = `${fontSizePercentage}px Arial`;
          context.fillStyle = 'white';
          context.textAlign = 'center';
          context.textTransform = 'uppercase';
          const textHeight = bubble.radius * 0.6;
          const percentageText = `%${parseFloat(bubble.quote.USD.percent_change_24h).toFixed(1)}`;
          context.fillText(percentageText.toUpperCase(), bubble.x, bubble.y + textHeight);

          const symbolHeight = bubble.radius * 0.1
          context.font = `${fontSizeSymbol}px Arial`;
          context.fillStyle = 'white';
          context.textAlign = 'center';
          // const symbolHeight = Math.abs(bubble.quote.USD.volume_change_24h) * -0.4;
          context.fillText(bubble.symbol.slice(0, 3), bubble.x, bubble.y + symbolHeight);

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

        requestAnimationFrame(update);
      }

      update();

      return () => {
        cancelAnimationFrame(update);
      };
    }
  }, [bubbles]);

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

  const currentPrice = 6602.60701122;
const percentChange24h = 4.37185;

// Calculate previous price
const previousPrice = currentPrice / (1 + percentChange24h / 100);

// Calculate percentage change
const percentageChange = ((currentPrice - previousPrice) / previousPrice) * 100;

console.log('Previous Price:', previousPrice);
console.log('Percentage Change:', percentageChange);

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
          <PageFilter onPageChange={onPageChange} />
        </div>
      </div>

      <PercentageFilter onPercentageChange={onPercentageChange} />

      <div style={{ width: '100vw', height: '100%', position: 'relative', backgroundColor: "#222" }}>
        <canvas ref={canvasRef} width={1900} height={800} onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ></canvas>
        <CryptoTable tableData={data} />
      </div>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} selectedBubble={clickedBubble} />}
    </>
  );
};

export default D3Bubbles;
