/*
*    main.js
*/

const MARGIN = { left: 100, right: 20, top: 20, bottom: 100 };
const CANVAS = { width: 600, height: 400 };

const width  = CANVAS.width  - MARGIN.left - MARGIN.right;
const height = CANVAS.height - MARGIN.top  - MARGIN.bottom;

var flag = true;

const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width",  CANVAS.width)
    .attr("height", CANVAS.height);

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);


var x = d3.scaleBand().range([0, width]).padding(0.2);
var y = d3.scaleLinear().range([height, 0]);


var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

var yAxisGroup = g.append("g")
    .attr("class", "y axis");


g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Month");

var yLabel = g.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Revenue");


d3.json("data/revenues.json").then((data) => {

    data.forEach((d) => {
        d.revenue = +d.revenue;
        d.profit  = +d.profit;
    });

    update(data);

    d3.interval(() => {
        flag = !flag;
        update(data);
    }, 1000);

}).catch((error) => {
    console.log(error);
});


function update(data) {
    var value = flag ? "revenue" : "profit";

    x.domain(data.map(d => d.month));
    y.domain([0, d3.max(data, d => d[value])]);

    var xAxisCall = d3.axisBottom(x);
    var yAxisCall = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `$${d / 1000}k`);

    xAxisGroup.call(xAxisCall);
    yAxisGroup.call(yAxisCall);

    xAxisGroup.selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10)
        .style("text-anchor", "end");

    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);

    var rects = g.selectAll("rect").data(data);

    rects.exit().remove();

    rects
        .attr("x",      d => x(d.month))
        .attr("y",      d => y(d[value]))
        .attr("width",  x.bandwidth)
        .attr("height", d => height - y(d[value]))
        .attr("fill", "#f4d03f");

    // Enter new bars
    rects.enter()
        .append("rect")
        .attr("x",      d => x(d.month))
        .attr("y",      d => y(d[value]))
        .attr("width",  x.bandwidth)
        .attr("height", d => height - y(d[value]))
        .attr("fill", "yellow");
}