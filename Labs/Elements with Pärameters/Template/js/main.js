/*
*    main.js
*/


var data = [25, 20, 15, 10, 5];


var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400);

    
svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("width", 40)
    .attr("height", function(d) {
        return d;
    })
    .attr("x", function(d, i) {
        return i * 50; 
    })
    .attr("y", function(d) {
        return 400 - d;
    })
    .attr("fill", "steelblue");
