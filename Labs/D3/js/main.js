/*
*    main.js
*/

var svg = d3.select("#chart-area").append("svg")

	.attr("width", 400)

	.attr("height", 400);


var circle = svg.append("circle")
	.attr("cx", 200)
	.attr("cy", 250)
	.attr("r", 100)
	.attr("fill", "orange")

var rect = svg.append("rect")
	.attr("x", 185)
	.attr("y", 72)
	.attr("width", 20)
	.attr("height", 80)
	.attr("fill","green");