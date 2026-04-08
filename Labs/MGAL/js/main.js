/*
*    main.js
*/

// Canvas / Margin
const MARGIN = { left: 100, right: 10, top: 10, bottom: 140 };
const CANVAS = { width: 600, height: 400 };

const width  = CANVAS.width  - MARGIN.left - MARGIN.right;
const height = CANVAS.height - MARGIN.top  - MARGIN.bottom;

// group
const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width",  CANVAS.width)
    .attr("height", CANVAS.height);

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

// Data
d3.json("data/buildings.json").then(data => {

    data.forEach(d => {
        d.height = +d.height;
    });

    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    const y = d3.scaleLinear()
        .domain([828, 0])
        .range([0, height]);

    // Bars
    const rects = g.selectAll("rect").data(data);

    rects.enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.height))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.height))
        .attr("fill", "gray");

    // Bottom Axis
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "rotate(-40)")
            .attr("x", -5)
            .attr("y", 10)
            .style("text-anchor", "end");

    // Left
    g.append("g")
        .attr("class", "y-axis")
        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => `${d}m`)
        );

    // x - Axis
    g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 135)
    .style("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("The world's tallest buildings");

    // Y - Axis
    g.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Height (m)");

});