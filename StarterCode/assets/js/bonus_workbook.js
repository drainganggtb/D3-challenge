
// Step 1: Set up our chart
//================================
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
  .select("scatter")
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
//function to update y-scale upon click on axis label
function yScale(journalData, chosenYAxis) {
  //create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(journalData, d => d[chosenYAxis]) * 0.8,
      d3.max(journalData, d => d[chosenYAxis]) * 1.2])
    .range([width, 0]);
  return YLinearScale;
}
// function to update xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;

// function to update yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

//function used to update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
//function used to update circles group with a transition to new circles for Y AXIS
function renderCircles(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function to update circlesGroup with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty: ";
  }
  if (chosenXAxis === "income") {
    label = "Income: ";
  }
  else {
    label = "Age: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${d[chosenYAxis]}`);
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
  });

  
  // step 2 create scale functions
  var xLinearScale = xScale(journalData, chosenXAxis);
  var yLinearScale = yScale(journalData, chosenYAxis);
  
  //step 3 create axis function
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //step 4 append axes to chart
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // step 5: create circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(journalData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("opacity", ".5");
  

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

  //create group for y axis labels
  var ylabelsGroup = chartGroup.append("g")
   .attr("transform", "rotate(-90)");

  var smokesLabel = ylabelsGroup.append("text")
   .attr("x", 20)
   .attr("y", 0)
   .attr("value", "smokes") // value to grab for event listener
   .classed("active", true)
   .text("Smokers");

  var obesityLabel = ylabelsGroup.append("text")
   .attr("x", 40)
   .attr("y", 0)
   .attr("value", "obesity") // value to grab for event listener
   .classed("active", true)
   .text("Obesity");

  var healthcareLabel = ylabelsGroup.append("text")
   .attr("x", 60)
   .attr("y", 0)
   .attr("value", "healthcare") // value to grab for event listener
   .classed("active", true)
   .text("Healthcare (as of 2017)");



  //append y axis
  // chartGroup.append("text")
  //   .attr("transform", "rotate(-90)")
  //   .attr("y", 0 - margin.left)
  //   .attr("x", 0 - (height/2))
  //   .attr("dy", "1em")
  //   .classed("axis-text", true)
  //   .text("Temporary single Y axis variable");

  // updateToolTip function above csv import
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
        xAxis = renderXAxis(xLinearScale, xAxis);

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

    //y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    //get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      //replace chosenXAxis with value
      chosenYAxis = value;

      console.log(chosenYAxis)

      //update x scale for new data
      yLinearScale = yScale(journalData, chosenYAxis);

      // updates with transition
      yAxis = renderYAxis(yLinearScale, yAxis);

      //update circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      //updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      //changes classes to change bold text
      if (chosenYAxis === "smokes") {
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      if (chosenYAxis === "obesity") {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      if (chosenYAxis === "healthcare") {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      else {
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true)
      }
    }
  });
  })
  })
}


