/*
*    main.js
*/

// Canvas
const MARGIN = { left: 100, right: 20, top: 20, bottom: 100 };
const CANVAS = { width: 600, height: 500 };

const width  = CANVAS.width  - MARGIN.left - MARGIN.right;
const height = CANVAS.height - MARGIN.top  - MARGIN.bottom;

// SVG / Margin
const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", CANVAS.width)
    .attr("height", CANVAS.height);

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

// Data
d3.json("data/revenues.json").then(data => {
    data.forEach(d => {
        d.revenue = +d.revenue;
    });

    const x = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, 50000])
        .range([height, 0]);

    g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d.revenue))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.revenue))
        .attr("fill", "#f1c40f");

    // x axis
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Month");

    // y axis
    g.append("g")
        .call(
            d3.axisLeft(y)
                .ticks(10)
                .tickFormat(d => `$${d/1000}k`)
        );
        
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Revenue (dllrs)");

});