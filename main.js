// Set up the dimensions of the chart
const margin = { top: 20, right: 20, bottom: 150, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Set up the SVG element
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const colors = ["steelblue", "orange", "green"];

// Create the x axis
svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`);

// Create the y axis
svg.append("g")
  .attr("class", "y-axis");

// Add a dropdown menu to select the data
const dataInput = d3.select("#chart")
  .append("select")
  .attr("id", "data-input")
  .on("change", updateChart);

dataInput.selectAll("option")
  .data(["Seattle", "New York City", "Houston"])
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);

// Move the dropdown to the top right corner of the page
const dropdownWidth = dataInput.node().getBoundingClientRect().width;
dataInput.style("position", "absolute")
  .style("top", "50px")
  .style("right", `${10 + dropdownWidth}px`);

function updateChart() {
    const selectedData = d3.select("#data-input").property("value");
    let dataFile;
    let color;

    // Add a conditional statement for "KHOU.csv"
    if (selectedData === "Seattle") {
        dataFile = "KSEA.csv";
        color = colors[0];
    } else if (selectedData === "New York City") {
        dataFile = "KNYC.csv";
        color = colors[1];
    } else if (selectedData === "Houston") {
        dataFile = "KHOU.csv";
        color = colors[2];
    }
  
    // Load the data
    d3.csv(dataFile).then(data => {
      // Format the data
      data = data.map(d => {
        return {
          'record_max_temp': d['record_max_temp'],
          'record_max_temp_year': d['record_max_temp_year']
        };
      });
  
      // Convert record_max_temp_year to dates
      const parseDate = d3.timeParse("%Y");
      data.forEach(d => {
        d.record_max_temp_year = parseDate(d.record_max_temp_year);
      });
  
      // Set up the scales
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.record_max_temp_year).sort((a, b) => a - b))
        .range([0, width])
        .padding(0.2);
  
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.record_max_temp)])
        .range([height, 0]);
  

    // Draw the axes
const xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.timeFormat("%Y"))
  .tickSizeOuter(0)
  .tickPadding(10);
svg.select(".x-axis")
  .transition()
  .duration(500)
  .call(xAxis)
  .selectAll("text")
  .attr("transform", "rotate(-90)")
  .attr("dx", "-2.0em")
  .attr("dy", "-0.60em")
  .style("text-anchor", "end"); // set the text anchor to the end of the label

const yAxis = d3.axisLeft(yScale)
  .tickSizeOuter(0)
  .tickPadding(10);
svg.select(".y-axis")
  .transition()
  .duration(500)
  .call(yAxis);

// Add x-axis label
svg.append("text")
  .attr("class", "x-axis-label")
  .attr("x", width / 2)
  .attr("y", height + 70)
  .style("text-anchor", "middle")
  .text("Year")

// Add y-axis label
svg.append("text")
  .attr("class", "y-axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -50)
  .style("text-anchor", "middle")
  .text("Temperature (°F)");

  
// Draw the bars
const bars = svg.selectAll("rect")
    .data(data);

bars.enter()
    .append("rect")
    .merge(bars)
    .transition()
    .duration(500)
    .attr("x", d => xScale(d.record_max_temp_year))
    .attr("y", d => yScale(d.record_max_temp))
    .attr("width", xScale.bandwidth())
    .attr("height", d => {
        if (isNaN(d.record_max_temp)) {
        return 0;
        } else {
        return height - yScale(d.record_max_temp);
        }
    })
    .attr("fill", color);

bars.exit().remove();

});
}
