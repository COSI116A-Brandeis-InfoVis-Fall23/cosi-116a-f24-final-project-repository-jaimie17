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

    // Draw the map
    d3.json("data/us-states.json").then(function(data) {
        svg.selectAll("path")
            .data(data.features)
            .enter()
        .append("path")
            .attr("d", path)
            .attr("class", "state")
            // Fill state color based on the percentage of housing problems
            .style("fill", function(d) {
                var percent = d.properties.percent;
                return color(percent);
            })
            .style("stroke", "black")
            .on("mouseover", function (event, d) {
                d3.select(this).style("fill", "orange");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", function(d) {
                    var percent = d.properties.percent;
                    return color(percent);
                })
            })
            .on("click", function (event, d) {
                d3.select(this).style("fill", "orange");
            });;
    }).catch(function(error) {
        console.error("Error loading GeoJSON data:", error);
    });
  
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
                'White alone (not Hispanic)',
                'Black or African American alone (not Hispanic)',
                'American Indian and Alaska Native alone (not Hispanic)',
                'Asian alone (not Hispanic)',
                'Native Hawaiian and Other Pacific Islander alone (not Hispanic)',
                'Some other race alone (not Hispanic)',
                'Two or more races (not Hispanic)'
            ];
  
            const racePercentages = raceCategories.map(category => race[category + ' as a %']);
  
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
        const medianIncomes = incomeData.map(d => d['Median Household Income In The Past 12 Months']); // Replace with your actual key

        console.log('State Names:', stateNames);
        console.log('Median Incomes:', medianIncomes);

        const medianIncomeCtx = document.getElementById('medianIncomeChartGG').getContext('2d');
        // Declare medianIncomeChartInstance at the top of your script if needed for re-renders
        if (medianIncomeChartInstance) {
            medianIncomeChartInstance.destroy(); // Destroy existing chart to avoid conflicts
        }
        medianIncomeChartInstance = new Chart(medianIncomeCtx, {
            type: 'bar',
            data: {
                labels: stateNames,
                datasets: [{
                    label: 'Median Income ($)',
                    data: medianIncomes,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'orange', // Hover effect
                    hoverBorderColor: 'orange'
                }]
            },
            options: {
                responsive: true,
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
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    })
    .catch(function(error) {
        console.error("Error loading data:", error);
    });
  });
// hello

