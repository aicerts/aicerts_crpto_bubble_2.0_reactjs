import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip
);

const chartData = {
    labels: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    datasets: [
        {
            label: "Price", // You can keep the label for dataset identification
            data: [0,10,13,15,18,22,100,60,66,28, 65, 59, 80, 81, 56, 12, 25, 69, 30, 21, 16],
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            lineTension: 0.1
        }
    ]
};

const LineChart = () => {
    return (
        <div style={{ width: '100%', height: '200px', position: 'relative' }}>
            <Line
                data={chartData}
                options={{
                    plugins: {
                        legend: {
                            display: false // Hide the legend
                        },
                        tooltip: {
                            enabled: true // Disable default tooltip
                        }
                    },
                    scales: {
                        x: {
                            display: false, // Hide the X-axis
                        },
                        y: {
                            display: false, // Hide the Y-axis
                        }
                    },
                    elements: {
                        point: {
                            radius: 0 // Hide data points
                        },
                        line: {
                            borderWidth: 1 // Customize line width
                        }
                    },
                    layout: {
                        padding: 0 // Remove padding
                    }
                }}
            />
        </div>
    );
};

export default LineChart;
