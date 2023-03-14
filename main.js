// Set up the dimensions of the chart
const margin = { top: 20, right: 20, bottom: 200, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Set up the SVG element
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set up the scales
const xScale = d3.scaleBand()
  .range([0, width])
  .padding(0.2);

const yScale = d3.scaleLinear()
  .range([height, 0]);

// Load the data
d3.csv("KSEA.csv").then(data => { 
    d3.csv("KNYC.csv").then(data => {  
  // Format the data
  data = data.map(d => {
    return {
      'actual_max_temp': d['actual_max_temp'],
      'record_max_temp_year': d['record_max_temp_year']
    };
  });
  
  // Convert record_max_temp_year to dates
  const parseDate = d3.timeParse("%Y");
  data.forEach(d => {
    d.record_max_temp_year = parseDate(d.record_max_temp_year);
  });

  console.log(data)

  // Update the scales with the data
  xScale.domain(data.map(d => d.record_max_temp_year).sort((a, b) => a - b));
  yScale.domain([0, d3.max(data, d => d.actual_max_temp)])

  // Draw the axes
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%Y"));
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("dx", "-2.0em")
    .attr("dy", "-0.60em");


  const yAxis = d3.axisLeft(yScale);
  svg.append("g")
    .call(yAxis);

    console.log('test')


    
  // Draw the bars
  const bars = svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.record_max_temp_year))
    .attr("y", d => yScale(d.actual_max_temp))
    .attr("width", xScale.bandwidth())
    .attr("height", d => {
        if (isNaN(d.actual_max_temp)) {
          return 0;
        } else {
          return height - yScale(d.actual_max_temp);
        }
      })
    .attr("fill", "steelblue");

console.log('dd poo')

  // Add interactivity to the chart
  d3.select("#data-input").on("change", () => {
    const selectedData = d3.select("#data-input").property("actual_max_temp");
    const filteredData = data.filter(d => d.dataset === selectedData);

    // Uprecord_max_temp_year the scales with the filtered data
    xScale.domain(filteredData.map(d => d.record_max_temp_year));
    yScale.domain([0, d3.max(filteredData, d => d.actual_max_temp)]);

    // Uprecord_max_temp_year the bars with the filtered data
    bars.data(filteredData)
      .transition()
      .duration(500)
      .attr("x", d => xScale(d.record_max_temp_year))
      .attr("y", d => yScale(d.actual_max_temp))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.actual_max_temp));
      
  });
  console.log('dd sexy')
})
});
// Add a dropdown menu to select the data
const dataInput = d3.select("#chart")