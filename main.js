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
  .data(["Choose City", "Seattle", "New York City", "Houston"])
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);

// Move the dropdown to the top right corner of the page
const dropdownWidth = dataInput.node().getBoundingClientRect().width;
dataInput.style("position", "absolute")
  .style("top", "50px")
  .style("right", `${500 + dropdownWidth}px`);

updateChart();

function updateChart() {
    const selectedData = d3.select("#data-input").property("value");
    let dataFile;
    let color;

    // Add a conditional statement for "KHOU.csv"
    if (selectedData === "Choose City") {
        dataFile = "KSEA.csv";
        color = colors[0];
    } 
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
      'record_max_temp_year': new Date(d['record_max_temp_year'])
    };
  });
  
  
    // Compute the average temperature per year
    const avgTempByYear = d3.rollup(data, 
      group => d3.mean(group, d => d.record_max_temp), 
      d => d.record_max_temp_year.getFullYear()
    );
  
    // Convert the data to an array of objects
    data = Array.from(avgTempByYear, ([year, value]) => ({ year, value }));
  
    // Convert the year string to a Date object
    const parseDate = d3.timeParse("%Y");
    data.forEach(d => {
      d.year = parseDate(d.year);
    });
  
    // Set up the scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]);
  
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
    


    // Draw the axes
    const xAxis = d3.axisBottom(xScale)
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
    const circles = svg.selectAll("circle")
    .data(data);

    circles.enter()
        .append("circle")
        .merge(circles)
    
    circles.transition()
        .duration(500)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.value))
        .attr("r", 5)
        .attr("fill", color);
    
    circles.on('mouseover', function (event, d) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '0.5');
        tooltip.transition()
            .duration('50')
            .text(d.value.toFixed(2) + "°F |   " + d.year)
            .style("visibility", "visible");
            console.log(d)
    });

    circles.exit().remove();
  });
  
}