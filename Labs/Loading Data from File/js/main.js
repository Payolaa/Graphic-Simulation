/*
*    main.js
*/


d3.json("data/ages.json")
.then((data)=>{

	data.forEach((d)=>{
		d.age = +d.age;
	});

	const svg = d3.select("body")
		.append("svg")
		.attr("width", 500)
		.attr("height", 300);

	svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", (d, i) => i * 50 + 50)
		.attr("cy", 150)
		.attr("r", (d) => d.age)
		.attr("fill", (d) => {
	        if (d.age > 10) {
		        return "red";
	        } else {
		        return "blue";
	        }
});


})
.catch((error)=>{
	console.log(error);
});
