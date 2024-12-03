document.addEventListener('DOMContentLoaded', function () {
  // storing the chart instances
  let raceChartInstance = null;
  let incomeChartInstance = null;


// map visualization
var svg = d3.select("#us-map");

// Define dimensions
var width = 960;
var height = 600;

// Create projection and path generator
var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1200);
var path = d3.geoPath().projection(projection);

d3.json("data/us-states.json").then(function(data) {
    svg.selectAll("path")
        .data(data.features)
        .enter()
    .append("path")
        .attr("d", path)
        .attr("class", "state");
}).catch(function(error) {
    console.error("Error loading GeoJSON data:", error);
});

  // loading ncome and race data
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
  })
});


