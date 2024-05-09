import React, { useRef, useEffect, useState } from 'react';
import { select, pointer, drag, max, scaleSqrt, schemeCategory10, forceSimulation, forceX, forceY, forceCollide, scaleOrdinal } from 'd3'; // Import specific functions from d3
import axios from 'axios';
import Modal from './Modal';
import CryptoTable from './CryptoTable';
// import Modal from './Modal';
// import CryptoTable from './CryptoTable';

const CanvasChart = () => {
    const svgRef = useRef();
    const canvasRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedBubble, setSelectedBubble] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Fetch data from local JSON file
        fetch('/services/data.json')
            .then(response => response.json())
            .then(jsonData => {
                const modifiedData = jsonData.map(item => ({
                    id: item.id,
                    symbol: item.symbol,
                    image: item.image,
                    id: item.id,
                    symbol: item.symbol,
                    image: item.image,
                    name: item.name,
                    current_price: item.current_price,
                    market_cap: item.market_cap,
                    market_cap_rank: item.market_cap_rank,
                    total_volume: item.total_volume,
                    high_24h: item.high_24h,
                    low_24h: item.low_24h,
                    price_change_24h: item.price_change_24h,
                    price_change_percentage_24h: item.price_change_percentage_24h,
                    market_cap_change_24h: item.market_cap_change_24h,
                    market_cap_change_percentage_24h: item.market_cap_change_percentage_24h,
                    circulating_supply: item.circulating_supply,
                    total_supply: item.total_supply,
                    max_supply: item.max_supply,
                    ath: item.ath,
                    ath_change_percentage: item.ath_change_percentage,
                    ath_date: item.ath_date,
                    atl: item.atl,
                    atl_change_percentage: item.atl_change_percentage,
                    atl_date: item.atl_date,
                    roi: item.roi,
                    last_updated: item.last_updated,
                    x: Math.random() * 800,
                    y: Math.random() * 400,
                    value: item.market_cap,
                    priceChangePercentage24h: item.price_change_percentage_24h,
                }));
                setData(modifiedData);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // useEffect(() => {
    //     if (!data.length) return;

    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     data.forEach(d => {
    //         const radius = Math.max(Math.abs(d.market_cap_change_percentage_24h) * 5, 0); // Ensure non-negative radius

    //         // Draw the bubble with a yellow shadow effect
    //         ctx.beginPath();
    //         ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);

    //         // Gradient for yellow shadow
    //         const gradient = ctx.createRadialGradient(d.x, d.y, radius * 0.75, d.x, d.y, radius);
    //         gradient.addColorStop(0, 'rgba(34, 136, 34, 0.0)'); // Yellow with some transparency at center
    //         gradient.addColorStop(1, 'rgba(34, 136, 34, 0.3)');  // Transparent at outer edge

    //         ctx.fillStyle = gradient;
    //         ctx.fill();
    //         ctx.closePath();


    //         // Draw the bubble
    //         ctx.beginPath();
    //         ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
    //         ctx.fillStyle = d.color; // Fill color of the bubble
    //         ctx.fill();
    //         ctx.closePath();

    //         // Add image
    //         const image = new Image();
    //         image.src = d.image;
    //         image.alt = d.name;
    //         image.onload = () => {
    //             // ctx.drawImage(image, d.x - radius / 2, d.y - radius / 1.3, radius, radius);
    //             const imageWidth = Math.max(Math.abs(d.market_cap_change_percentage_24h) * 2) // Set desired width
    //             const imageHeight = imageWidth; // Set desired height (can be different from width)
    //             ctx.drawImage(image, d.x - imageWidth / 2, d.y - radius / 0.8 / 2, imageWidth, imageHeight);
    //             console.log(imageWidth)
    //         };


    //         // Add text
    //         ctx.font = '16px Arial';
    //         ctx.fillStyle = 'white';
    //         ctx.textAlign = 'center';
    //         ctx.fillText(d.symbol, d.x, d.y);
    //     });

// }, [data]);

    // useEffect(() => {
    //     if (!data.length) return;
    
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    
    //     const bubbles = data.map(d => ({
    //         ...d,
    //         radius: Math.max(Math.abs(d.market_cap_change_percentage_24h) * 5, 0),
    //         x: Math.random() * canvas.width,
    //         y: Math.random() * canvas.height,
    //         velocityX: Math.random() * 2 - 1,
    //         velocityY: Math.random() * 2 - 1,
    //     }));
    
    //     const isColliding = (bubble1, bubble2) => {
    //         const dx = bubble1.x - bubble2.x;
    //         const dy = bubble1.y - bubble2.y;
    //         const distance = Math.sqrt(dx * dx + dy * dy);
    //         return distance < bubble1.radius + bubble2.radius;
    //     };
    
    //     const handleCollisions = () => {
    //         for (let i = 0; i < bubbles.length; i++) {
    //             for (let j = i + 1; j < bubbles.length; j++) {
    //                 if (isColliding(bubbles[i], bubbles[j])) {
    //                     // Calculate angle between bubbles
    //                     const angle = Math.atan2(bubbles[j].y - bubbles[i].y, bubbles[j].x - bubbles[i].x);
    //                     // Move bubbles apart along the collision angle
    //                     bubbles[i].x -= Math.cos(angle);
    //                     bubbles[i].y -= Math.sin(angle);
    //                     bubbles[j].x += Math.cos(angle);
    //                     bubbles[j].y += Math.sin(angle);
    //                 }
    //             }
    //         }
    //     };
    
    //     const drawBubbles = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);
            
    //         bubbles.forEach(bubble => {
    //             const radius = Math.max(Math.abs(bubble.market_cap_change_percentage_24h) * 5, 0); // Ensure non-negative radius
    //             // Draw bubble shadow
    //             ctx.beginPath();
    //             ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    //             const shadowGradient = ctx.createRadialGradient(bubble.x, bubble.y, bubble.radius * 0.75, bubble.x, bubble.y, bubble.radius);
    //             shadowGradient.addColorStop(0, 'rgba(34, 136, 34, 0.0)');
    //             shadowGradient.addColorStop(1, 'rgba(34, 136, 34, 0.3)');
    //             ctx.fillStyle = shadowGradient;
    //             ctx.fill();
    //             ctx.closePath();
        
    //             // Draw bubble
    //             ctx.beginPath();
    //             ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    //             ctx.fillStyle = bubble.color;
    //             ctx.fill();
    //             ctx.closePath();
        
    //             // Add image
    //             const image = new Image();
    //             image.src = bubble.image;
    //             image.alt = bubble.name;
    //             image.onload = () => {
    //                 const imageWidth = Math.max(Math.abs(bubble.market_cap_change_percentage_24h) * 4) // Set desired width
    //                 const imageHeight = imageWidth // Set desired height (can be different from width)
    //                 ctx.drawImage(image, bubble.x - imageWidth / 2, bubble.y - radius / 2 / 2, imageWidth, imageHeight);
    //                 console.log(imageWidth)
    //             };

    //             // Add text
    //             ctx.font = `${Math.abs(bubble.market_cap_change_percentage_24h) * 1.5}px Arial`;
    //             ctx.fillStyle = 'white';
    //             ctx.textAlign = 'center';
    //             ctx.fillText(bubble.name, bubble.x, bubble.y);
    //         });
    //     };
    
    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);
    //         handleCollisions();
    //         bubbles.forEach(bubble => {
    //             // Update bubble position
    //             bubble.x += bubble.velocityX;
    //             bubble.y += bubble.velocityY;
    //             // Ensure bubbles stay within canvas boundaries
    //             if (bubble.x + bubble.radius > canvas.width || bubble.x - bubble.radius < 0) {
    //                 bubble.velocityX *= -1;
    //             }
    //             if (bubble.y + bubble.radius > canvas.height || bubble.y - bubble.radius < 0) {
    //                 bubble.velocityY *= -1;
    //             }
    //         });
    //         drawBubbles();
    //         requestAnimationFrame(animate);
    //     };
    
    //     canvas.addEventListener('mousedown', function (e) {
    //         const mousePos = {
    //             x: e.clientX - canvas.offsetLeft,
    //             y: e.clientY - canvas.offsetTop
    //         };
    //         bubbles.forEach(bubble => {
    //             const dx = mousePos.x - bubble.x;
    //             const dy = mousePos.y - bubble.y;
    //             const distance = Math.sqrt(dx * dx + dy * dy);
    //             if (distance < bubble.radius) {
    //                 bubble.dragging = true;
    //                 bubble.dragOffsetX = dx;
    //                 bubble.dragOffsetY = dy;
    //             }
    //         });
    //     });
    
    //     canvas.addEventListener('mousemove', function (e) {
    //         bubbles.forEach(bubble => {
    //             if (bubble.dragging) {
    //                 bubble.x = e.clientX - canvas.offsetLeft - bubble.dragOffsetX;
    //                 bubble.y = e.clientY - canvas.offsetTop - bubble.dragOffsetY;
    //             }
    //         });
    //     });
    
    //     canvas.addEventListener('mouseup', function () {
    //         bubbles.forEach(bubble => {
    //             bubble.dragging = false;
    //         });
    //     });
    
    //     drawBubbles();
    //     animate();
    
    //     return () => {
    //         canvas?.removeEventListener('mousedown');
    //         canvas?.removeEventListener('mousemove');
    //         canvas?.removeEventListener('mouseup');
    //     };
    
    // }, [data]);

    // useEffect(() => {
    //     if (!data.length) return;
    
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    
    //     const bubbles = data.map(d => ({
    //         ...d,
    //         radius: Math.max(Math.abs(d.market_cap_change_percentage_24h) * 5, 0),
    //         x: Math.random() * canvas.width,
    //         y: Math.random() * canvas.height,
    //         velocityX: Math.random() * 2 - 1,
    //         velocityY: Math.random() * 2 - 1,
    //     }));
    
    //     const isColliding = (bubble1, bubble2) => {
    //         const dx = bubble1.x - bubble2.x;
    //         const dy = bubble1.y - bubble2.y;
    //         const distance = Math.sqrt(dx * dx + dy * dy);
    //         return distance < bubble1.radius + bubble2.radius;
    //     };
    
    //     const handleCollisions = () => {
    //         for (let i = 0; i < bubbles.length; i++) {
    //             for (let j = i + 1; j < bubbles.length; j++) {
    //                 if (isColliding(bubbles[i], bubbles[j])) {
    //                     const angle = Math.atan2(bubbles[j].y - bubbles[i].y, bubbles[j].x - bubbles[i].x);
    //                     bubbles[i].x -= Math.cos(angle);
    //                     bubbles[i].y -= Math.sin(angle);
    //                     bubbles[j].x += Math.cos(angle);
    //                     bubbles[j].y += Math.sin(angle);
    //                 }
    //             }
    //         }
    //     };6
    
    //     const drawBubbles = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);
            
    //         bubbles.forEach(bubble => {
    //             const radius = Math.max(Math.abs(bubble.market_cap_change_percentage_24h) * 5, 0); // Ensure non-negative radius
                
    //             // Draw bubble shadow
    //             ctx.beginPath();
    //             ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    //             const shadowGradient = ctx.createRadialGradient(bubble.x, bubble.y, bubble.radius * 0.75, bubble.x, bubble.y, bubble.radius);
    //             shadowGradient.addColorStop(0, 'rgba(34, 136, 34, 0.0)');
    //             shadowGradient.addColorStop(1, 'rgba(34, 136, 34, 0.3)');
    //             ctx.fillStyle = shadowGradient;
    //             ctx.fill();
    //             ctx.closePath();
    
    //             // Draw bubble
    //             ctx.beginPath();
    //             ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    //             ctx.fillStyle = bubble.color;
    //             ctx.fill();
    //             ctx.closePath();
    
    //             // Add image
    //             const image = new Image();
    //             image.src = bubble.image;
    //             image.alt = bubble.name;
    //             image.onload = () => {
    //                 const imageWidth = Math.max(Math.abs(bubble.market_cap_change_percentage_24h) * 4); // Set desired width
    //                 const imageHeight = imageWidth; // Set desired height (can be different from width)
    //                 ctx.drawImage(image, bubble.x - imageWidth / 2, bubble.y - radius / 2 / 2, imageWidth, imageHeight);
    //             };
    
    //             // Add text
    //             ctx.font = `${Math.abs(bubble.market_cap_change_percentage_24h) * 1.5}px Arial`;
    //             ctx.fillStyle = 'white';
    //             ctx.textAlign = 'center';
    //             ctx.fillText(bubble.symbol, bubble.x, bubble.y);
    //         });
    //     };
    
    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);
    //         handleCollisions();
    //         bubbles.forEach(bubble => {
    //             bubble.x += bubble.velocityX;
    //             bubble.y += bubble.velocityY;
    //             if (bubble.x + bubble.radius > canvas.width || bubble.x - bubble.radius < 0) {
    //                 bubble.velocityX *= -1;
    //             }
    //             if (bubble.y + bubble.radius > canvas.height || bubble.y - bubble.radius < 0) {
    //                 bubble.velocityY *= -1;
    //             }
    //         });
    //         drawBubbles();
    //         requestAnimationFrame(animate);
    //     };
    
    //     const handleMouseDown = (e) => {
    //         const mousePos = {
    //             x: e.clientX - canvas.offsetLeft,
    //             y: e.clientY - canvas.offsetTop
    //         };
    //         bubbles.forEach(bubble => {
    //             const dx = mousePos.x - bubble.x;
    //             const dy = mousePos.y - bubble.y;
    //             const distance = Math.sqrt(dx * dx + dy * dy);
    //             if (distance < bubble.radius) {
    //                 bubble.dragging = true;
    //                 bubble.dragOffsetX = dx;
    //                 bubble.dragOffsetY = dy;
    //             }
    //         });
    //     };
    
    //     const handleMouseMove = (e) => {
    //         bubbles.forEach(bubble => {
    //             if (bubble.dragging) {
    //                 bubble.x = e.clientX - canvas.offsetLeft - bubble.dragOffsetX;
    //                 bubble.y = e.clientY - canvas.offsetTop - bubble.dragOffsetY;
    //             }
    //         });
    //     };
    
    //     const handleMouseUp = () => {
    //         bubbles.forEach(bubble => {
    //             bubble.dragging = false;
    //         });
    //     };
    
    //     canvas.addEventListener('mousedown', handleMouseDown);
    //     canvas.addEventListener('mousemove', handleMouseMove);
    //     canvas.addEventListener('mouseup', handleMouseUp);
    
    //     animate();
    
    //     return () => {
    //         canvas.removeEventListener('mousedown', handleMouseDown);
    //         canvas.removeEventListener('mousemove', handleMouseMove);
    //         canvas.removeEventListener('mouseup', handleMouseUp);
    //     };
    // }, [data]);

    useEffect(() => {
        if (!data.length) return;

        const preloadImages = () => {
            data.forEach(bubble => {
                const image = new Image();
                image.src = bubble.image;
                image.alt = bubble.name;
                bubble.imageObj = image; // Store the image object in the data array
            });
        };

        preloadImages();
    }, [data]);


    useEffect(() => {
        if (!data.length) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
    
        const bubbles = data.map(d => ({
            ...d,
            radius: Math.max(Math.abs(d.market_cap_change_percentage_24h) * 5, 0),
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            velocityX: Math.random() * 2 - 1,
            velocityY: Math.random() * 2 - 1,
        }));
    
        const handleCollisions = () => {
            let collisionHandled = false; // Flag to track if collisions have been handled
        
            for (let i = 0; i < bubbles.length && !collisionHandled; i++) {
                for (let j = i + 1; j < bubbles.length; j++) {
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
    
        const drawBubbles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            bubbles.forEach(bubble => {
                const radius = Math.max(Math.abs(bubble.market_cap_change_percentage_24h) * 5, 0); // Ensure non-negative radius

                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);

                // Create shadow gradient based on market_cap_change_percentage_24h
                const shadowGradient = ctx.createRadialGradient(bubble.x, bubble.y, bubble.radius * 0.75, bubble.x, bubble.y, bubble.radius);
                if (bubble.market_cap_change_percentage_24h < 0) {
                    // If market_cap_change_percentage_24h is negative, use red shadow
                    shadowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.0)');
                    shadowGradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');
                } else {
                    // Otherwise, use the original shadow color
                    shadowGradient.addColorStop(0, 'rgba(34, 136, 34, 0.0)');
                    shadowGradient.addColorStop(1, 'rgba(34, 136, 34, 0.3)');
                }

                ctx.fillStyle = shadowGradient;
                ctx.fill();
                ctx.closePath();
    
                // Draw bubble
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
                ctx.fillStyle = bubble.color;
                ctx.fill();
                ctx.closePath();
    
                // Draw image
                if (bubble.imageObj.complete) { // Check if image is loaded
                    const imageWidth = Math.max(Math.abs(bubble.market_cap_change_percentage_24h) * 3);
                    const imageHeight = imageWidth;
                    ctx.drawImage(bubble.imageObj, bubble.x - imageWidth / 2, bubble.y - radius / 1 / 1.2, imageWidth, imageHeight);
                }
    
                // Add Percentage
                ctx.font = `${Math.abs(bubble.market_cap_change_percentage_24h) * 1.5}px Arial`;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textTransform = 'uppercase'; // Set text to uppercase
                const textHeight = Math.abs(bubble.market_cap_change_percentage_24h) * -1.5; // Get the height of the text
                const percentageText = `%${bubble.price_change_percentage_24h.toFixed(1)}`;
                ctx.fillText(percentageText.toUpperCase(), bubble.x, bubble.y + bubble.radius + textHeight);

                // ctx.fillText(`%${bubble.price_change_percentage_24h.toFixed(1)}`.toUpperCase(), bubble.x, bubble.y + bubble.radius + textHeight );
                

                 // Add Symbol
                 ctx.font = `${Math.abs(bubble.market_cap_change_percentage_24h) * 1.5}px Arial`;
                 ctx.fillStyle = 'white';
                 ctx.textAlign = 'center';
                 const symbolHeight = Math.abs(bubble.market_cap_change_percentage_24h) * -4; // Get the height of the text
                 ctx.fillText(bubble.symbol, bubble.x, bubble.y + bubble.radius + symbolHeight);
            });
        };
    
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            bubbles.forEach(bubble => {
                bubble.x += bubble.velocityX;
                bubble.y += bubble.velocityY;
                if (bubble.x + bubble.radius > canvas.width || bubble.x - bubble.radius < 0) {
                    bubble.velocityX *= -1;
                }
                if (bubble.y + bubble.radius > canvas.height || bubble.y - bubble.radius < 0) {
                    bubble.velocityY *= -1;
                }
            });
            drawBubbles();
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
                    console.log('Bubble clicked:', bubble); // Log the clicked bubble
                    bubble.dragging = true;
                    bubble.dragOffsetX = dx;
                    bubble.dragOffsetY = dy;
                    clickedBubble = bubble;
                }
            });
            if (clickedBubble) {
                setSelectedBubble(clickedBubble); // Set selectedBubble state to the clicked bubble
                console.log('Selected bubble:', clickedBubble); // Log the selected bubble
                setIsModalOpen(true); // Open the modal
            }
        };
    
        const handleMouseMove = (e) => {
            bubbles.forEach(bubble => {
                if (bubble.dragging) {
                    bubble.x = e.clientX - canvas.offsetLeft - bubble.dragOffsetX;
                    bubble.y = e.clientY - canvas.offsetTop - bubble.dragOffsetY;
                }
            });
        };
    
        const handleMouseUp = () => {
            bubbles.forEach(bubble => {
                bubble.dragging = false;
            });
        };
    
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        // canvas.addEventListener('mousedown', function (e) {
        //     const mousePos = {
        //         x: e.clientX - canvas.offsetLeft,
        //         y: e.clientY - canvas.offsetTop
        //     };
        //     bubbles.forEach(bubble => {
        //         const dx = mousePos.x - bubble.x;
        //         const dy = mousePos.y - bubble.y;
        //         const distance = Math.sqrt(dx * dx + dy * dy);
        //         if (distance < bubble.radius) {
        //             bubble.dragging = true;
        //             bubble.dragOffsetX = dx;
        //             bubble.dragOffsetY = dy;
        //         }
        //     });
        // });
    
        // canvas.addEventListener('mousemove', function (e) {
        //     bubbles.forEach(bubble => {
        //         if (bubble.dragging) {
        //             bubble.x = e.clientX - canvas.offsetLeft - bubble.dragOffsetX;
        //             bubble.y = e.clientY - canvas.offsetTop - bubble.dragOffsetY;
        //         }
        //     });
        // });
    
        // canvas.addEventListener('mouseup', function () {
        //     bubbles.forEach(bubble => {
        //         bubble.dragging = false;
        //     });
        // });
    
        drawBubbles();
        animate();
    
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [data]);
    
    return (
        <div>
            <canvas ref={canvasRef} width={1901} height={800} />
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} selectedBubble={selectedBubble} />}
            <CryptoTable tableData={data} />
        </div>
    );
}

export default CanvasChart;
