import React, { useRef, useEffect, useState } from 'react';
import Modal from './Modal';
import CryptoTable from './CryptoTable';
// const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// const apiAssets = process.env.NEXT_PUBLIC_API_ASSETS;
// const apiKey = process.env.NEXT_PUBLIC_API_KEY;

const CanvasChart = () => {
    const svgRef = useRef();
    const canvasRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedBubble, setSelectedBubble] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/api');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const jsonData = await response.json();
                setData(jsonData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);  

    // useEffect(() => {
    //     if (!data.length) return;
    
    //     const preloadImages = () => {
    //         data.forEach(bubble => {
    //             const image = new Image();
    //             image.src = `${apiAssets}${bubble.ImageUrl}`; // Append the base URL to ImageUrl
    //             image.alt = bubble.Name;
    //             bubble.imageObj = image; // Store the image object in the data array
    //         });
    //     };
    
    //     preloadImages();
    // }, [data, apiAssets]);

    useEffect(() => {
        if (!data.length) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth * 0.98;
        canvas.height = window.innerHeight * 0.89;

        const bubbles = data.map(d => ({
            ...d,
            radius: Math.max(Math.abs(d.quote.USD.percent_change_24h) * 5, 0),
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            velocityX: Math.random() * 3 - 2 * 2,
            velocityY: Math.random() * 3 - 2 * 2,
        }));

        const handleCollisions = () => {
            let collisionHandled = false; // Flag to track if collisions have been handled
          
            for (let i = 0; i < bubbles.length && !collisionHandled; i++) {
              for (j = i + 1; j < bubbles.length; j++) {
                if (isColliding(bubbles[i], bubbles[j])) {
                  const angle = Math.atan2(bubbles[j].y - bubbles[i].y, bubbles[j].x - bubbles[i].x);
                  bubbles[i].x -= Math.cos(angle);
                  bubbles[i].y -= Math.sin(angle);
                  bubbles[j].x += Math.cos(angle);
                  bubbles[j].y += Math.sin(angle);
                  collisionHandled = true; // Set the flag to true after handling collisions once
                  break; // Exit the inner loop
                }
              }
            }
          };
          
          const isColliding = (bubble1, bubble2) => {
            const distance = Math.sqrt((bubble1.x - bubble2.x) ** 2 + (bubble1.y - bubble2.y) ** 2);
            return distance < bubble1.radius + bubble2.radius;
          };

        const drawBubbles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            bubbles.forEach(bubble => {
                // Ensure that radius is a finite value
                const volumeChange = bubble.quote.USD.percent_change_24h;
                let radius;

                if (volumeChange >= 0) {
                    // Calculate radius between 100 and 200 based on volume change percentage
                    radius = Math.min(Math.max(volumeChange * 10, 60), 60);
                } else {
                    // Use a fixed radius of 100 if volume change is negative
                    radius = 40;
                }
                // const radius = Math.max(Math.sqrt(bubble.MKTCAP) / 10000, 0);
                if (!Number.isFinite(radius)) {
                    return; // Skip drawing this bubble if radius is not a valid number
                }
        
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
        
                // Create shadow gradient based on CHANGEPCT24HOUR
                const shadowGradient = ctx?.createRadialGradient(bubble.x, bubble.y, radius * 0.75, bubble.x, bubble.y, radius);
                if (bubble.quote.USD.percent_change_24h < 0) {
                    // If CHANGEPCT24HOUR is negative, use red shadow
                    shadowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.0)');
                    shadowGradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');
                } else {
                    // Otherwise, use the original shadow color
                    shadowGradient.addColorStop(0, 'rgb(32 241 32 / 0%)');
                    shadowGradient.addColorStop(1, 'rgb(32 241 32 / 40%)');
                }
        
                ctx.fillStyle = shadowGradient;
                ctx.fill();
                ctx.closePath();
        
                // Draw bubble
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = bubble.color;
                ctx.fill();
                ctx.closePath();
        
                // Draw image
                // if (bubble.imageObj.complete) { // Check if image is loaded
                //     const imageWidth = Math.max(Math.abs(bubble.CHANGEPCT24HOUR) * 6);
                //     const imageHeight = imageWidth;
                //     ctx.drawImage(bubble.imageObj, bubble.x - imageWidth / 2, bubble.y - radius / 1 / 1.2, imageWidth, imageHeight);
                // }
        
                // Add Percentage
                ctx.font = `${Math.abs(bubble.quote.USD.percent_change_24h) * 1.5}px Arial`;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textTransform = 'uppercase'; // Set text to uppercase
                const textHeight = Math.abs(bubble.quote.USD.percent_change_24h) * -2.5; // Get the height of the text
                const percentageText = `%${bubble.quote.USD.percent_change_24h.toFixed(1)}`;
                ctx.fillText(percentageText.toUpperCase(), bubble.x, bubble.y + radius + textHeight);
        
                // Add Symbol
                ctx.font = `${Math.abs(bubble.quote.USD.percent_change_24h) * 2}px Arial`;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                const symbolHeight = Math.abs(bubble.quote.USD.percent_change_24h) * -4; // Get the height of the text
                ctx.fillText(bubble.symbol, bubble.x, bubble.y + radius + symbolHeight);
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move bubbles and handle collisions
            bubbles.forEach(bubble => {
                // Save current position
                const prevX = bubble.x;
                const prevY = bubble.y;

                // Move the bubble
                bubble.x += bubble.velocityX;
                bubble.y += bubble.velocityY;

                // Check for collisions with walls and adjust position if needed
                if (bubble.x + bubble.radius > canvas.width) {
                    bubble.x = canvas.width - bubble.radius;
                    bubble.velocityX *= -1;
                } else if (bubble.x - bubble.radius < 0) {
                    bubble.x = bubble.radius;
                    bubble.velocityX *= -1;
                }

                if (bubble.y + bubble.radius > canvas.height) {
                    bubble.y = canvas.height - bubble.radius;
                    bubble.velocityY *= -1;
                } else if (bubble.y - bubble.radius < 0) {
                    bubble.y = bubble.radius;
                    bubble.velocityY *= -1;
                }

                // Check for collisions with other bubbles
                bubbles.forEach(otherBubble => {
                    if (bubble !== otherBubble) {
                        const dx = bubble.x - otherBubble.x;
                        const dy = bubble.y - otherBubble.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < bubble.radius + otherBubble.radius) {
                            // Handle collision by adjusting positions
                            const angle = Math.atan2(dy, dx);
                            const targetX = bubble.x + Math.cos(angle) * (bubble.radius + otherBubble.radius - distance);
                            const targetY = bubble.y + Math.sin(angle) * (bubble.radius + otherBubble.radius - distance);
                            bubble.x = targetX;
                            bubble.y = targetY;
                        }
                    }
                });

                // Interpolate and draw the bubble after adjusting its position
                const smoothX = prevX + (bubble.x - prevX) * 0.2; // Adjust 0.2 to control smoothness
                const smoothY = prevY + (bubble.y - prevY) * 0.2; // Adjust 0.2 to control smoothness
                bubble.x = smoothX;
                bubble.y = smoothY;
                drawBubbles(bubble);
            });

            requestAnimationFrame(animate);
        };
        

        const handleMouseDown = (e) => {
            const mousePos = {
                x: e.clientX - canvas.offsetLeft,
                y: e.clientY - canvas.offsetTop
            };

            let clickedBubble = null;

            bubbles.forEach(bubble => {
                const dx = mousePos.x - bubble.x;
                const dy = mousePos.y - bubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bubble.radius) {
                    bubble.dragging = true;
                    bubble.dragOffsetX = dx;
                    bubble.dragOffsetY = dy;
                    clickedBubble = bubble;
                }
            });
            if (clickedBubble) {
                setSelectedBubble(clickedBubble); // Set selectedBubble state to the clicked bubble
                setIsModalOpen(true); // Open the modal
            }
        };

        const handleMouseMove = (e) => {
            // Check if event object is defined
            if (e) {
                if (selectedBubble && selectedBubble.dragging) {
                    const newX = e.offsetX || e.nativeEvent?.offsetX; // Try both offsetX and nativeEvent.offsetX
                    const newY = e.offsetY || e.nativeEvent?.offsetY;
                    selectedBubble.x = newX;
                    selectedBubble.y = newY;
                }
            }
        };

        const handleMouseEnter = (e) => {
            const mousePos = {
                x: e.clientX - canvas.offsetLeft,
                y: e.clientY - canvas.offsetTop
            };
        
            // Check if the mouse is inside any bubble and change cursor style
            bubbles.forEach(bubble => {
                const dx = mousePos.x - bubble.x;
                const dy = mousePos.y - bubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bubble.radius) {
                    canvas.style.cursor = 'pointer'; // Change cursor style to pointer
                }
            });
        };

        const handleMouseUp = () => {
            bubbles.forEach(bubble => {
                bubble.dragging = true;
            });
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseup', handleMouseEnter);

        drawBubbles();
        animate();

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseup', handleMouseEnter);
        };
    }, [data, isDragging, selectedBubble, dragOffset]);

    return (
        <div>
            <canvas ref={canvasRef} />
             {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} selectedBubble={selectedBubble} />}
            <CryptoTable tableData={data} />
        </div>
    );
}

export default CanvasChart;
