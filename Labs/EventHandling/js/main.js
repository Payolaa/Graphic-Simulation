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

// States
var timeIndex = 0;
var interval = null;
var isPlaying = false;
var selectedContinent = "all";

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

// Axis
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

var yAxisGroup = g.append("g")
    .attr("class", "y axis");

xAxisGroup.call(
    d3.axisBottom(x)
        .tickValues([400, 4000, 40000])
        .tickFormat(d => `$${d3.format(",")(d)}`)
);
yAxisGroup.call(d3.axisLeft(y));

// Texto de labels
g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("GDP Per Capita (USD)");

g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Life Expectancy (years)");

var yearLabel = g.append("text")
    .attr("x", width - 40)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "40px")
    .style("font-weight", "bold")
    .style("fill", "#303B80");

var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(d => `
        <strong>${d.country}</strong><br/>
        Continent: ${d.continent}<br/>
        Income: $${d3.format(",")(d.income)}<br/>
        Life Expectancy: ${d.life_exp} yrs<br/>
        Population: ${d3.format(",")(d.population)}
    `);

g.call(tip);

// Data
d3.json("data/data.json").then(function(data) {

    const formattedData = data.map((year) => {
        return {
            year: year.year,
            countries: year["countries"].filter((country) => {
                return (country.income && country.life_exp);
            }).map((country) => {
                country.income = +country.income;
                country.life_exp = +country.life_exp;
                country.population = +country.population;
                return country;
            })
        };
    });

    var continents = [...new Set(
        formattedData[0].countries.map(d => d.continent)
    )];
    color.domain(continents);

    continents.forEach(continent => {
        $("#continent-select").append(
            `<option value="${continent}">${continent}</option>`
        );
    });

    var legend = g.append("g")
        .attr("transform", `translate(${width - 120}, 20)`);

    continents.forEach((continent, i) => {
        var row = legend.append("g")
            .attr("transform", `translate(0, ${i * 22})`);

        row.append("circle")
            .attr("r", 7).attr("cx", 0).attr("cy", 0)
            .attr("fill", color(continent));

        row.append("text")
            .attr("x", 14).attr("y", 4)
            .style("font-size", "12px")
            .text(continent);
    });

    $("#year-slider").slider({
        min: 0,
        max: formattedData.length - 1,
        step: 1,
        value: 0,
        slide: function(event, ui) {
            if (isPlaying) pauseInterval();
            timeIndex = ui.value;
            update(formattedData[timeIndex]);
        }
    });

    // Play button
    $("#play-btn").on("click", function() {
        if (isPlaying) {
            pauseInterval();
        } else {
            playInterval();
        }
    });

    // Reset button
    $("#reset-btn").on("click", function() {
        pauseInterval();
        timeIndex = 0;
        $("#year-slider").slider("value", 0);
        update(formattedData[timeIndex]);
    });

    // Filter / drop down
    $("#continent-select").on("change", function() {
        selectedContinent = $(this).val();
        update(formattedData[timeIndex]);
    });

    function playInterval() {
        isPlaying = true;
        $("#play-icon").html("&#9646;&#9646; Pause");
        interval = d3.interval(() => {
            timeIndex = (timeIndex + 1) % formattedData.length;
            $("#year-slider").slider("value", timeIndex);
            update(formattedData[timeIndex]);
        }, 1000);
    }

    function pauseInterval() {
        isPlaying = false;
        $("#play-icon").html("&#9654; Play");
        if (interval) {
            interval.stop();
            interval = null;
        }
    }

    update(formattedData[timeIndex]);

}).catch(error => console.log(error));

function update(yearData) {
    var filtered = selectedContinent === "all"
        ? yearData.countries
        : yearData.countries.filter(d => d.continent === selectedContinent);

    // Update year label and slider display
    yearLabel.text(yearData.year);
    $("#year-display").text(yearData.year);

    var circles = circlesGroup.selectAll("circle")
        .data(filtered, d => d.country);

    circles.exit().remove();

    // Update existing
    circles
        .attr("cx",   d => x(d.income))
        .attr("cy",   d => y(d.life_exp))
        .attr("r",    d => Math.sqrt(area(d.population) / Math.PI))
        .attr("fill", d => color(d.continent));

    // Enter new — attach tooltip here
    circles.enter()
        .append("circle")
        .attr("cx", d => x(d.income))
        .attr("cy", d => y(d.life_exp))
        .attr("r", d => Math.sqrt(area(d.population) / Math.PI))
        .attr("fill", d => color(d.continent))
        .attr("opacity", 0.7)
        .on("mouseover", tip.show)
        .on("mouseout",  tip.hide);
}