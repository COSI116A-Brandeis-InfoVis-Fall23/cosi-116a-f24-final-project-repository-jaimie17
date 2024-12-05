document.addEventListener('DOMContentLoaded', function () {
    var medianIncomeChartInstance;
    var selectedStates = new Set(); // Store selected states for linking
    var incomeData; // Store the income data to reference for map updates
    var housingProblems; // Store housing problems data

    fetch('data/income.json')
        .then(response => response.json())
        .then(function (data) {
            incomeData = data;

            const stateNames = incomeData.map(d => d.NAME);
            const medianIncomes = incomeData.map(d => d['Median Household Income In The Past 12 Months']);
            housingProblems = incomeData.map(d => d['Percent of all households with any of the 4 housing problems']);

            const medianIncomeCtx = document.getElementById('medianIncomeChartS').getContext('2d');

            if (medianIncomeChartInstance) {
                medianIncomeChartInstance.destroy();
            }

            // Create chart
            medianIncomeChartInstance = new Chart(medianIncomeCtx, {
                type: 'bar',
                data: {
                    labels: stateNames,
                    datasets: [{
                        label: 'Median Income ($)',
                        data: medianIncomes,
                        backgroundColor: stateNames.map(state => selectedStates.has(state) ? 'orange' : 'rgba(75, 192, 192, 0.6)'),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'orange',
                        hoverBorderColor: 'orange'
                    }]
                },
                options: {
                    responsive: true,
                    onClick: function (event, elements) {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const state = stateNames[index];
                            toggleStateHighlight(state); // Toggle highlight on the map and chart
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'States' },
                            ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
                        },
                        y: {
                            title: { display: true, text: 'Median Income ($)' },
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return `$${value.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    plugins: { legend: { display: true, position: 'top' } }
                }
            });
            
            

            
            // Define the SVG container and projection
            const svg = d3.select("#stateMap");
            const projection = d3.geoAlbersUsa().scale(1000).translate([400, 250]);
            const path = d3.geoPath().projection(projection);

            // Define color scale for housing problem percentage
            const housingProblemsColorScale = d3.scaleSequential(d3.interpolateYlGnBu)
                .domain([0, 100]); // Adjust domain based on the data range

            // Create the legend
            const legendWidth = 300;
            const legendHeight = 20;

            const legend = svg.append("g")
                .attr("transform", "translate(20, 20)");

            legend.selectAll("rect")
                .data([0, 25, 50, 75, 100]) // Legend steps
                .enter().append("rect")
                .attr("x", (d, i) => i * (legendWidth / 4))
                .attr("y", 0)
                .attr("width", legendWidth / 4)
                .attr("height", legendHeight)
                .style("fill", d => housingProblemsColorScale(d));

            legend.selectAll("text")
                .data([0, 25, 50, 75, 100]) // Legend labels
                .enter().append("text")
                .attr("x", (d, i) => i * (legendWidth / 4) + (legendWidth / 8))
                .attr("y", legendHeight + 5)
                .attr("text-anchor", "middle")
                .text(d => `${d}%`);

            // Load the GeoJSON data
            d3.json("data/us-states.json").then(function(geoData) {
                // Render the states
                svg.selectAll("path")
                    .data(geoData.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("class", "name")
                    .style("fill", function(d) {
                        const stateName = d.properties.NAME;
                        const stateData = incomeData.find(item => item.NAME === stateName);

                        if (stateData) {
                            const housingProblemPercent = stateData["Percent of all households with any of the 4 housing problems"];
                            return housingProblemsColorScale(housingProblemPercent);
                        } else {
                            return '#006E6D'; // Default color if data is not found
                        }
                    })
                    .style("stroke", "black")
                    .on("mouseover", function(event, d) {
                        d3.select(this).style("fill", "orange");
                    })
                    .on("mouseout", function(event, d) {
                        const stateName = d.properties.NAME;
                        const stateData = incomeData.find(item => item.NAME === stateName);
                        if (stateData) {
                            const housingProblemPercent = stateData["Percent of all households with any of the 4 housing problems"];
                            d3.select(this).style("fill", housingProblemsColorScale(housingProblemPercent));
                        } else {
                            d3.select(this).style("fill", '#006E6D');
                        }
                    })
                    .on("click", function(event, d) {
                        const stateName = d.properties.NAME;
                        toggleStateHighlight(stateName); // Toggle highlight on the map and chart
                    });

                // Add state names to the map
                svg.selectAll("text.state-name")
                    .data(geoData.features)
                    .enter()
                    .append("text")
                    .attr("class", "state-name")
                    .attr("x", function(d) {
                        const centroid = path.centroid(d);
                        return centroid[0];
                    })
                    .attr("y", function(d) {
                        const centroid = path.centroid(d);
                        return centroid[1];
                    })
                    .attr("text-anchor", "middle")
                    .text(function(d) {
                        return d.properties.NAME;
                    })
                    .style("font-size", "10px")
                    .style("fill", "black");

            }).catch(function(error) {
                console.error("Error loading GeoJSON data:", error);
            });

        })
            
    // Custom interpolation function to blend between white and bluish-green
    function interpolateWhiteToBluishGreen(factor) {
        const white = { r: 255, g: 255, b: 255 }; // White color
        const bluishGreen = { r: 0, g: 110, b: 109 }; // Bluish green color

        // Linear interpolation between the two colors
        const r = Math.round(white.r * (1 - factor) + bluishGreen.r * factor);
        const g = Math.round(white.g * (1 - factor) + bluishGreen.g * factor);
        const b = Math.round(white.b * (1 - factor) + bluishGreen.b * factor);

        return `rgb(${r}, ${g}, ${b})`; // Return the interpolated RGB color
    }

    // Color scale for housing problems (from white to bluish-green)
    const housingProblemsColorScale = d3.scaleSequential(interpolateWhiteToBluishGreen)
    .domain([0, 100]); // 0% (white) to 100% (bluish-green)



    // Toggle selection for a state
    function toggleStateHighlight(state) {
        if (selectedStates.has(state)) {
            selectedStates.delete(state);
        } else {
            selectedStates.add(state);
        }
        syncChartAndMapSelection();
    }

    // Sync chart and map selection
    function syncChartAndMapSelection() {
        updateChartSelection();
        updateMapFromChart();
    }

    function updateChartSelection() {
        const stateNames = medianIncomeChartInstance.data.labels;
        const updatedBackgroundColors = stateNames.map(state => selectedStates.has(state) ? 'darkorange' : 'rgba(75, 192, 192, 0.6)');
        medianIncomeChartInstance.data.datasets[0].backgroundColor = updatedBackgroundColors;
        medianIncomeChartInstance.update();
    }

    function updateMapFromChart() {
        d3.selectAll('.state').each(function(d) {
            const stateName = d.properties.NAME;
            const isSelected = selectedStates.has(stateName);
            const stateIndex = incomeData.findIndex(item => item.NAME === stateName);
            const color = isSelected 
                ? 'orange' 
                : (stateIndex !== -1 ? housingProblemsColorScale(housingProblems[stateIndex]) : 'lightblue');
            d3.select(this).style('fill', color);
        });
    }
});
