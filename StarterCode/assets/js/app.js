
// Step 1: Set up our chart
//= ================================
var svgWidth = 1000;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 90
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";

//function to update x-scale upon click on axis label
function xScale(journalData, chosenXAxis) {
  //create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(journalData, d => d[chosenXAxis]) * 0.8,
      d3.max(journalData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  return xLinearScale;
}
// function to update xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//function used to update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
//trying to render abbrs in conjunction with new circles
function renderAbbr(abbrGroup, newXScale, chosenXAxis) {
  abbrGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d.abbr));

  return abbrGroup;
}



// function to update circlesGroup with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  var xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty: ";
  }
  if (chosenXAxis === "income") {
    xlabel = "Income: ";
  }
  else {
    xlabel = "Age: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  
  return circlesGroup;
}




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
    data.abbr = data.abbr;
  });

  
  // step 2 create scale functions
  var xLinearScale = xScale(journalData, chosenXAxis);
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(journalData, d => d.smokes)])
    .range([height, 0]);
  
  //step 3 create axis function
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //step 4 append axes to chart
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // step 5: create circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(journalData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("opacity", ".5")
    .text(function(d) {
      return d.abbr;
  })
  //add abbr
  var abbrGroup = chartGroup.selectAll("texts")
    .data(journalData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dx", function(d){return -7})
    .attr("dy", function(d){return +5})
    .attr("font-size", 10)
    .text(function(d) {
      return d.abbr;
    })
  

  //create group for x axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty Level (%)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  //append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Smokes (%)");

  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  //x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      //get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        //replace chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        //update x scale for new data
        xLinearScale = xScale(journalData, chosenXAxis);

        // updates with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        //update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        //updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        //changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
          .classed("active", false)
          .classed("inactive", true)
        }
    }
    });
})