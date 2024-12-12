document.addEventListener('DOMContentLoaded', function () {
    // storing the chart instances
    let raceChartInstance = null;
    let incomeChartInstance = null;
    let medianIncomeChartInstance = null;

    // map visualization
    var svg = d3.select("#us-map");

    // Define dimensions
    var width = 960;
    var height = 600;

    // Create projection and path generator
    var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1200);
    var path = d3.geoPath().projection(projection);

    // Define color scale for housing problem percentages.
    var data = d3.map();
    var color = d3.scaleLinear()
        .domain([21.44, 43.49])
        .range(["white", "red"])
        .clamp(true);

    // State name to abbreviation mapping
    const stateAbbreviations = {
        "Alabama": "AL",
        "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        "Connecticut": "CT",
        "Delaware": "DE",
        "Florida": "FL",
        "Georgia": "GA",
        "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "Michigan": "MI",
        "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        "Vermont": "VT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY"
    };

    // Create tooltip to display state name and percentage on mouseover
    var tooltip = d3.select("#map").append("div")
        .attr("class", "tooltip")
        .style("position", "fixed")
        .style("bottom", "10px")
        .style("right", "10px")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "2px solid red")
        .style("padding", "10px")
        .style("border-radius", "3px")
        .style("box-shadow", "0px 0px 10px gray")
        .style("width", "150px")
        .style("height", "70px");

    // Draw the map
    d3.json("data/us-states.json").then(function (data) {
        // Draw states
        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "state")
            .style("fill", function (d) {
                var percent = d.properties.percent;
                return color(percent);
            })
            .style("stroke", "black")
            .on("mouseover", function (d) {
                d3.select(this).style("fill", "orange");
                svg.select(`#label-${stateAbbreviations[d.properties.name]}`)
                    .text(`${d.properties.name} (${d.properties.percent}%)`);
                // On mouseover display tooltip with state name and percentage
                tooltip.style("visibility", "visible")
                .html(`<strong>State:</strong> ${d.properties.name}<br><strong>Percent housing problems:</strong> ${d.properties.percent}%`)
                .style("color", "black");
            })
            .on("mouseout", function (d) {
                d3.select(this).style("fill", function () {
                    var percent = d.properties.percent;
                    return color(percent);
                });
                svg.select(`#label-${stateAbbreviations[d.properties.name]}`)
                    .text(stateAbbreviations[d.properties.name]);
                tooltip.style("visibility", "hidden"); // Hide tooltip on mouseout
            })
            .on("click", function (d) {
                var stateName = d.properties.name;
                if (selectedStates.has(stateName)) {
                    selectedStates.delete(stateName);
                } else {
                    selectedStates.add(stateName);
                }
                updateMapAndChartSelection();
            });

        // Add state labels with abbreviations
        svg.selectAll("text")
            .data(data.features)
            .enter()
            .append("text")
            .attr("id", d => `label-${stateAbbreviations[d.properties.name]}`)
            .attr("x", function (d) {
                return path.centroid(d)[0];
            })
            .attr("y", function (d) {
                return path.centroid(d)[1];
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .text(function (d) {
                return stateAbbreviations[d.properties.name];
            });

        // Add legend
        var legendWidth = 300;
        var legendHeight = 20;
        var legendSvg = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - 20}, 20)`);

        var legendGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");

        legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "white");
        legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "red");

        legendSvg.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        legendSvg.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .text("Housing Problem Percentage");

        var legendScale = d3.scaleLinear()
            .domain([21.44, 43.49])
            .range([0, legendWidth]);

        var legendAxis = d3.axisBottom(legendScale)
            .tickValues([21.44, 30, 35, 40, 43.49])
            .tickFormat(d => `${d}%`);

        legendSvg.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);
    }).catch(function (error) {
        console.error("Error loading GeoJSON data:", error);
    });

    function updateMapAndChartSelection() {
        svg.selectAll("path")
            .style("fill", function (d) {
                var percent = d.properties.percent;
                var stateName = d.properties.name;
                if (selectedStates.has(stateName)) {
                    return "orange";
                } else {
                    return color(percent);
                }
            });

        if (incomeChartInstance) {
            const incomeChartLabels = incomeChartInstance.data.labels;
            incomeChartInstance.data.datasets[0].backgroundColor = incomeChartLabels.map(function (label) {
                return selectedStates.has(label) ? 'orange' : '#36A2EB';
            });
            incomeChartInstance.update();
        }
    }
  
    // loading income and race data
    Promise.all([
        fetch('data/income.json').then(response => response.json()),
        fetch('data/race.json').then(response => response.json())
    ])
    .then(function([incomeData, raceData]) {
        // mapping state data by state name for quick lookup
        const stateIncomeData = incomeData.reduce((acc, d) => {
            acc[d.NAME] = d;
            return acc;
        }, {});
  
        const stateRaceData = raceData.reduce((acc, d) => {
            acc[d.NAME] = d;
            return acc;
        }, {});
  
        // populating the dropdown with state names
        const states = Object.keys(stateIncomeData);
        const select = document.getElementById('stateSelect');
  
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            select.appendChild(option);
        });
  
        // initially display the charts for the first state
        updateCharts(states[0]);
  
        // event listener for dropdown change
        select.addEventListener('change', function() {
            updateCharts(select.value);
        });
  
        // update both charts based on the selected state
        function updateCharts(selectedState) {
            // Destroy existing charts if they exist
            if (raceChartInstance) {
                raceChartInstance.destroy();
            }
            if (incomeChartInstance) {
                incomeChartInstance.destroy();
            }
  
            // income and race data for the selected state
            const income = stateIncomeData[selectedState];
            const race = stateRaceData[selectedState];
  
            // 1. Update Racial Composition Chart (Pie Chart)
            const raceCategories = [
                'White alone',
                'Black or African American alone',
                'American Indian and Alaska Native alone',
                'Asian alone',
                'Native Hawaiian and Other Pacific Islander alone',
                'Some other race alone',
                'Two or more races'
            ];
  
            const racePercentages = raceCategories.map(category => race[category + ' (not Hispanic) as a %']);
  
            const raceChartData = {
                labels: raceCategories,
                datasets: [{
                    label: 'Racial Composition (%)',
                    data: racePercentages,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#66b3ff'
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            };
  
            const raceChartOptions = {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.raw + '%';
                            }
                        }
                    }
                }
            };
  
            const raceCtx = document.getElementById('raceChart').getContext('2d');
            raceChartInstance = new Chart(raceCtx, {
                type: 'pie',  // 'pie' chart type
                data: raceChartData,
                options: raceChartOptions
            });
  
            // 2. updating Income Chart (Bar Chart) with Income Ranges
            const incomeBrackets = [
                "Less than $14,999",
                "$15,000 to $24,999",
                "$25,000 to $34,999",
                "$35,000 to $44,999",
                "$45,000 to $59,999",
                "$60,000 to $74,999",
                "$75,000 to $99,999",
                "$100,000 to $124,999",
                "$125,000 to $149,999",
                "$150,000 or more"
            ];
  
            // extracting the percentage data for each income range from the income object
            const incomePercentages = incomeBrackets.map(bracket => income[bracket]);
  
            const incomeChartData = {
                labels: incomeBrackets,
                datasets: [{
                    label: 'Income Bracket (%)',
                    data: incomePercentages,
                    backgroundColor: '#36A2EB', // Blue color for the income chart
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            };
  
            const incomeChartOptions = {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.raw + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } }
                }
            };
  
            const incomeCtx = document.getElementById('incomeChart').getContext('2d');
            incomeChartInstance = new Chart(incomeCtx, {
                type: 'bar',  // income chart as a bar chart
                data: incomeChartData,
                options: incomeChartOptions
            });
        }
  
        // 3. bar chart for median income across all states
        const stateNames = incomeData.map(d => d.NAME);
        const medianIncomes = incomeData.map(d => d['Median Household Income In The Past 12 Months']);

        console.log('State Names:', stateNames);
        console.log('Median Incomes:', medianIncomes);

        const medianIncomeCtx = document.getElementById('medianIncomeChartGG').getContext('2d');
        // Declare medianIncomeChartInstance at the top of script if needed for re-renders
        if (medianIncomeChartInstance) {
            medianIncomeChartInstance.destroy(); // Destroy existing chart to avoid conflicts
        }
        medianIncomeChartInstance = new Chart(medianIncomeCtx, {
            type: 'bar',
            data: {
                labels: incomeData.map(d => d.NAME), // State names
                datasets: [{
                    label: 'Median Income ($)',
                    data: incomeData.map(d => d['Median Household Income In The Past 12 Months']),
                    backgroundColor: '#36A2EB', // Initial color for all bars
                    borderColor: '#fff',
                    borderWidth: 1,
                    hoverBackgroundColor: 'orange', // Hover effect
                    hoverBorderColor: 'orange'
                }]
            },
            options: {
                responsive: true,
                onClick: function(e, activeElements) {
                    if (activeElements.length > 0) {
                        const clickedIndex = activeElements[0].index;
                        const clickedState = this.data.labels[clickedIndex];
                        if (selectedStates.has(clickedState)) {
                            selectedStates.delete(clickedState);
                        } else {
                            selectedStates.add(clickedState);
                        }
                        updateMapAndChartSelection(); // Update selection on both map and chart
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'States'
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Median Income ($)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `$${value.toLocaleString()}`; // Format as currency
                            }
                        }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `$${tooltipItem.raw.toLocaleString()}`; // Format tooltip as currency
                            }
                        }
                    }
                }
            }
        });
        }).catch(function(error) {
        console.error("Error loading data:", error);
    });
  });

