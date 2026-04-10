/*
*    main.js
*/

const margin = { top: 40, right: 20, bottom: 120, left: 60 };
const width  = 500 - margin.left - margin.right;
const height = 500 - margin.top  - margin.bottom;

const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width",  500)
    .attr("height", 500)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("data/buildings.json").then(data => {

    // Strings → numbers
    data.forEach(d => { d.height = +d.height; });

    // X axis
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    // Y axis 
    const y = d3.scaleLinear()
        .domain([0, 828])      
        .range([height, 0]);

    // Color Scle
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.schemeSet3);

    // Bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x",      d => x(d.name))
        .attr("y",      d => y(d.height))
        .attr("width",  x.bandwidth())
        .attr("height", d => height - y(d.height))
        .attr("fill",   d => color(d.name));

    // Axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));
});