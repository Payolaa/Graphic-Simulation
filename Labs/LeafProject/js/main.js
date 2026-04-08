/*
*    main.js
*/

// Canvas / Margin
const MARGIN = { left: 100, right: 20, top: 20, bottom: 100 };
const CANVAS = { width: 800, height: 500 };

const width  = CANVAS.width  - MARGIN.left - MARGIN.right;
const height = CANVAS.height - MARGIN.top  - MARGIN.bottom;

const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width",  CANVAS.width)
    .attr("height", CANVAS.height);

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);


var circlesGroup = g.append("g").attr("class", "circles-group");

var timeIndex = 0;

// Escalas
var x = d3.scaleLog()
    .base(10)
    .domain([142, 150000])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, 90])
    .range([height, 0]);

var area = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25 * Math.PI, 1500 * Math.PI]);

var color = d3.scaleOrdinal()
    .range(d3.schemePastel1);

// despues
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

var yAxisGroup = g.append("g")
    .attr("class", "y axis");

// Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d => `$${d3.format(",")(d)}`);

var yAxisCall = d3.axisLeft(y);

xAxisGroup.call(xAxisCall);
yAxisGroup.call(yAxisCall);

// texto x
g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("GDP Per Capita (USD)");

// texto Y
g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Life Expectancy (years)");

// Año texto 
var yearLabel = g.append("text")
    .attr("x", width - 40)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "40px")
    .style("font-weight", "bold")
    .style("fill", "#ccc");

// Data
d3.json("data/data.json").then(function(data) {

    const formattedData = data.map((year) => {
        return {
            year: year.year,
            countries: year["countries"].filter((country) => {
                return (country.income && country.life_exp);
            }).map((country) => {
                country.income     = +country.income;
                country.life_exp   = +country.life_exp;
                country.population = +country.population;
                return country;
            })
        };
    });

    var continents = [...new Set(
        formattedData[0].countries.map(d => d.continent)
    )];
    color.domain(continents);

    var legend = g.append("g")
        .attr("transform", `translate(${width - 120}, 20)`);

    continents.forEach((continent, i) => {
        var row = legend.append("g")
            .attr("transform", `translate(0, ${i * 22})`);

        row.append("circle")
            .attr("r",    7)
            .attr("cx",   0)
            .attr("cy",   0)
            .attr("fill", color(continent));

        row.append("text")
            .attr("x", 14)
            .attr("y", 4)
            .style("font-size", "12px")
            .text(continent);
    });

    update(formattedData[timeIndex]);

    d3.interval(() => {
        timeIndex = (timeIndex + 1) % formattedData.length;
        update(formattedData[timeIndex]);
    }, 1000);

}).catch(error => console.log(error));

// Update function
function update(yearData) {

    yearLabel.text(yearData.year);

    var circles = circlesGroup.selectAll("circle")
        .data(yearData.countries, d => d.country);

    circles.exit().remove();

    // Update
    circles
        .attr("cx",   d => x(d.income))
        .attr("cy",   d => y(d.life_exp))
        .attr("r",    d => Math.sqrt(area(d.population) / Math.PI))
        .attr("fill", d => color(d.continent));

    // Enter new
    circles.enter()
        .append("circle")
        .attr("cx",      d => x(d.income))
        .attr("cy",      d => y(d.life_exp))
        .attr("r",       d => Math.sqrt(area(d.population) / Math.PI))
        .attr("fill",    d => color(d.continent))
        .attr("opacity", 0.7);
}