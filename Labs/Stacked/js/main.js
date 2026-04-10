/*
*    main.js
*/

var margin = {top: 20, right: 300, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        "," + margin.top + ")");

// Time parser for x-scale
var parseDate = d3.timeParse('%Y');
var formatSi = d3.format(".3s");
var formatNumber = d3.format(".1f"),
formatBillion = (x) => { return formatNumber(x / 1e9); };

// Scales
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal(d3.schemeSpectral[11]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft().tickFormat(formatBillion);

// Area generator
var area = d3.area()
    .x((d)  => { return x(d.data.date); })
    .y0((d) => { return y(d[0]); })
    .y1((d) => { return y(d[1]); });

// Stack generator
var stack = d3.stack();

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis");

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

// Legend container
var legend = g.append("g")
    .attr("transform", "translate(" + (width + 150) + 
        "," + (height - 210) + ")");

d3.csv('data/stacked_area2.csv').then((data) => {

    color.domain(d3.keys(data[0]).filter((key) => { 
        return key !== 'date'; 
    }));

    // Extrct and filter the keys (with no dates)
    var keys = d3.keys(data[0]).filter((key) => { return key !== 'date'; });

    data.forEach((d) => {
        d.date = parseDate(d.date);
        // Values to numbers
        keys.forEach((key) => { d[key] = +d[key]; });
    });

    var maxDateVal = d3.max(data, (d) => {
        var vals = d3.keys(d).map((key) => { 
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });

    x.domain(d3.extent(data, (d) => { return d.date; }));
    y.domain([0, maxDateVal]);

    // Generate axes once scales have been set
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Set the keys, order and offset
    stack
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    // Bind data to the stack and create a group with a path for each layer
    var layer = g.selectAll(".layer")
        .data(stack(data))
        .enter()
        .append("g")
            .attr("class", "layer");

    // Draw the area that each layer has 
    layer.append("path")
        .attr("class", "area")
        .attr("fill", (d) => { return color(d.key); })
        .attr("fill-opacity", 0.8)
        .attr("d", area);

    // Each item has a color key
    var legendItem = legend.selectAll(".legend-item")
        .data(keys.slice().reverse())
        .enter()
        .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => { return "translate(0," + (i * 20) + ")"; });

    // Color square
    legendItem.append("rect")
        .attr("x", -125)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", (d) => { return color(d); });

    legendItem.append("text")
        .attr("x", -105)
        .attr("y", 12)
        .style("font-size", "12px")
        .text((d) => { return d; });

}).catch((error) => {
    console.log(error);
});