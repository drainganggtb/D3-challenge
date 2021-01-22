
// Step 1: Set up our chart
//= ================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// step 1 import data from csv
d3.csv("assets/data/data.csv").then(function(journalData) {
  // check to see if data was imported
  console.log(journalData);

  //parse/cast data as numbers
  journalData.forEach(function(data) {
    // for x axis
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    // y axis
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // step 2 create scale functions
  var xLinearScale = d3.scaleLinear()
    .domain([7, d3.max(journalData, d => d.poverty)])
    .range([0, width]);
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(journalData, d => d.smokes)])
    .range([height, 0]);
  
  //step 3 create axis function
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //step 4 append axes to chart
  chartGroup.append("g")
  .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  chartGroup.append("g")
    .call(leftAxis);

  // step 5: create circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(journalData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("opacity", ".5");



})