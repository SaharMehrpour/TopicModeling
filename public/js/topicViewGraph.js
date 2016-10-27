/**
 * Created by sahar on 2016-10-25.
 */

/**
 * Constructor for the TopicViewGraph
 */
function TopicViewGraph(topicYears) {

    var self = this;

    self.div = d3.select("#topic_view_graph");
    self.topicYears = topicYears;

    self.dimensions = {
        "svgWidth": 750, "svgHeight" : 300,
        "graphWidth": 700, "graphHeight": 250
    };

    self.margins = {
        "top": 20, "bottom": 25, "left": 25, "right": 25
    };

    self.padding = 2;
    self.baseYear = 1980;

}


TopicViewGraph.prototype.update = function(topicID) {

    var self = this;

    var years = d3.dsvFormat(";").parseRows(self.topicYears[topicID]["years"], function (g) {
        return g;
    })[0];

    var yearsColorScale = d3.scaleLinear()
        .range(["lightblue", "darkblue"])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    var yScale = d3.scaleLinear()
        .range([0, self.dimensions.graphHeight])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    var xScale = d3.scaleLinear()
        .range([0, self.dimensions.graphWidth])
        .domain([0, years.length]);

    self.div.select("svg").remove();

    var group = self.div
        .append("svg")
        .attr("width", self.dimensions.svgWidth)
        .attr("height", self.dimensions.svgHeight)
        .append("g")
        .attr("transform", "translate(" + self.margins.left
            + ", " + (self.dimensions.graphHeight + self.margins.top) + " ) scale(1,-1)");


    // add Axis

    var xAxisScale = d3.scalePoint()
        .domain(years.map(function (d, i) {
            return i;
        }))
        .range([0, self.dimensions.graphWidth])
        .padding((self.padding + (xScale(1) / 2)) / xScale(1));

    var xAxis = d3.axisBottom()
        .scale(xAxisScale)
        .ticks(36);

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + ","
            + (self.dimensions.graphHeight + self.margins.top) + ")")
        .call(xAxis)
        .selectAll("text")
        .text(function () {
            return (+d3.select(this).text()) + self.baseYear;
        })
        .attr("transform", "rotate(270) translate(-20, -12)");

    var yAxisScale = d3.scaleLinear()
        .domain([0, d3.max(years, function (d) {
            return +d;
        })])
        .range([self.dimensions.graphHeight, 0]);

    var yAxis = d3.axisLeft()
        .scale(yAxisScale);

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")
        .call(yAxis)
        .selectAll("text")
        .text(function () {
            return d3.select(this).text() + "%";
        });

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")
        .attr("class", "grid")
        .call(yAxis
            .tickSize(-self.dimensions.graphWidth)
            .tickFormat(""));

    // add bars

    var rects = group
        .selectAll("rect")
        .data(years);

    rects.enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xScale(i) + self.padding;
        })
        .attr("y", 0)
        .attr("height", function (d) {
            return yScale(+d);
        })
        .attr("width", xScale(1) - self.padding)
        .attr("fill", function (d) {
            return yearsColorScale(+d);
        });



};


