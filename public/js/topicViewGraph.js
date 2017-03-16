/**
 * This module creates and updates the time-line for the topic view
 */
/**
 * @param topicYears
 * @param topicViewPapers
 * @constructor
 */
function TopicViewGraph(topicYears,topicViewPapers) {

    var self = this;

    self.div = d3.select("#topic_view_graph");
    self.topicYears = topicYears;
    self.topicViewPapers = topicViewPapers;

    var width = parseInt(window.innerWidth)*.7*0.7;

    self.dimensions = {
        svgWidth: width, svgHeight : 350,
        graphWidth: 0.8*width, graphHeight: 300
    };

    self.margins = {
        top: 20, left: 25
    };

    self.padding = 2;
    self.baseYear = 1980;

}

/**
 * This function updates the time-line based on a new topic ID
 * @param topicID
 */

TopicViewGraph.prototype.update_2 = function(topicID) {

    var self = this;

    // TODO: fix the width of the graph when window is changed

    var years = d3.dsvFormat(";").parseRows(self.topicYears[topicID]["years"], function (g) {
        return g;
    })[0];

    var yearsColorScale = d3.scaleLinear()
        .range(["lightsteelblue", "#003366"])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    var yScale = d3.scaleLinear()
        .range([0, self.dimensions.graphHeight])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

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
        .padding(self.padding);

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
        .scale(yAxisScale)
        .tickFormat(function (e) {
            if (Math.floor(e) != e)
                return;
            return e;
        });

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")
        .call(yAxis);
    //.selectAll("text")
    //.text(function () {
    //    return d3.select(this).text() + "%";
    //});


    /*
     // add grid lines
     var gridlines = self.div.select("svg").append("g")
     .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")
     .attr("class", "grid")
     .call(yAxis
     .tickSize(-self.dimensions.graphWidth)
     .tickFormat(""));
     */

    // add bars

    var rects = group
        .selectAll("rect")
        .data(years);

    rects.enter()
        .append("rect")
        .merge(rects)
        .attr("x", function (d, i) {
            return xAxisScale(i) -  xAxisScale(0)/2 + self.padding;
        })
        .attr("y", 0)
        .attr("height", function (d) {
            return yScale(+d);
        })
        .attr("width", xAxisScale(0) - self.padding)
        .attr("fill", function (d) {
            return yearsColorScale(+d);
        })
        .on("click", function (d, i) {
            if (d3.select(this).classed("selectedBar")) {
                d3.select(this).classed("selectedBar", false);
                d3.select("#topic_view_papers").select("span").text("");
                self.topicViewPapers.update(topicID)
            }
            else {
                self.div.selectAll("rect").classed("selectedBar", false);
                d3.select(this).classed("selectedBar", true);
                d3.select("#topic_view_papers").select("span").text(": " + (self.baseYear + i));
                self.topicViewPapers.update(topicID, self.baseYear + i)
            }
        });

};

TopicViewGraph.prototype.updateGraph_ = function(topicID) {

    var self = this;

    var div = d3.select("#topic_graph");
    var width = parseInt(window.innerWidth)*.7;
    var dimensions = {
        "svgWidth": width * 1.1, "svgHeight" : 300,
        "graphWidth": width, "graphHeight": 250
    };
    var margins = {
        "top": 20, "bottom": 25, "left": 25, "right": 25
    };
    var padding = 2;

    // years

    var years = d3.dsvFormat(";").parseRows(self.topicYears[topicID]["years"], function (g) {
        return g;
    })[0];

    // Scales

    var yearsColorScale = d3.scaleLinear()
        .range(["lightgrey", "darkgrey"])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    var yScale = d3.scaleLinear()
        .range([0, dimensions.graphHeight])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    div.select("svg").remove();

    var group = div
        .append("svg")
        .attr("width", dimensions.svgWidth)
        .attr("height", dimensions.svgHeight)
        .append("g")
        .attr("transform", "translate(" + margins.left
            + ", " + (dimensions.graphHeight + margins.top) + " ) scale(1,-1)");

    // add Axis

    var xAxisScale = d3.scalePoint()
        .domain(years.map(function (d, i) {
            return i;
        }))
        .range([0, dimensions.graphWidth])
        .padding(padding);

    var xAxis = d3.axisBottom()
        .scale(xAxisScale)
        .ticks(36);

    div.select("svg").append("g")
        .attr("transform", "translate(" + margins.left + ","
            + (dimensions.graphHeight + margins.top) + ")")
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
        .range([dimensions.graphHeight, 0]);

    var yAxis = d3.axisLeft()
        .scale(yAxisScale)
        .tickFormat(function (e) {
            if (Math.floor(e) != e)
                return;
            return e;
        });

    div.select("svg").append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .call(yAxis);

    // add bars

    var rects = group
        .selectAll("rect")
        .data(years);

    rects.enter()
        .append("rect")
        .merge(rects)
        .attr("x", function (d, i) {
            return xAxisScale(i) -  xAxisScale(0)/2 + padding;
        })
        .attr("y", 0)
        .attr("height", function (d) {
            return yScale(+d);
        })
        .attr("width", xAxisScale(0) - padding)
        .attr("fill", function (d) {
            return yearsColorScale(+d);
        })
        /*
        .on("click", function (d, i) {
            if (d3.select(this).classed("selectedBar")) {
                d3.select(this).classed("selectedBar", false);
                d3.select("#topic_view_papers").select("span").text("");
                self.topicViewPapers.update(topicID)
            }
            else {
                self.div.selectAll("rect").classed("selectedBar", false);
                d3.select(this).classed("selectedBar", true);
                d3.select("#topic_view_papers").select("span").text(": " + (self.baseYear + i));
                self.topicViewPapers.update(topicID, self.baseYear + i)
            }
        })*/;
};

TopicViewGraph.prototype.update = function(topicID) {

    var self = this;

    var div = d3.select("#topic_graph_2");
    var width = parseInt(window.innerWidth) * 0.7 * .4;
    var dimensions = {
        svgWidth: width, svgHeight: 400,
        graphWidth: width * 0.9, graphHeight: 350
    };
    var margins = {top: 20, left: 40};
    var padding = 2;

    // years

    var years = d3.dsvFormat(";").parseRows(self.topicYears[topicID]["years"], function (g) {
        return g;
    })[0];

    div.select("svg").remove();

    div.append("svg")
        .attr("width", dimensions.svgWidth)
        .attr("height", dimensions.svgHeight);

    // Scales

    var yearsColorScale = d3.scaleLinear()
        .range(["lightgrey", "darkred"])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    var yAxisScale = d3.scalePoint()
        .domain(years.map(function (d, i) {
            return i;
        }))
        .range([0, dimensions.graphHeight])
        .padding(padding);

    var yAxis = d3.axisLeft()
        .scale(yAxisScale)
        .ticks(36);

    var xAxisScale = d3.scaleLinear()
        .domain([d3.max(years, function (d) {
            return +d;
        }), 0])
        .range([dimensions.graphWidth - margins.left, 0]);

    var xAxis = d3.axisTop()
        .scale(xAxisScale)
        .tickFormat(function (e) {
            if (Math.floor(e) != e)
                return;
            return e;
        });

    // add grid lines

    div.select("svg").append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .attr("class", "grid")
        .call(d3.axisTop()
            .scale(xAxisScale)
            .tickSize(-dimensions.graphHeight)
            .tickFormat(""));

    // add Axis

    div.select("svg").append("g")
        .attr("transform", "translate(" + margins.left + ","
            + margins.top + ")")
        .call(yAxis)
        .selectAll("text")
        .text(function () {
            return (+d3.select(this).text()) + self.baseYear;
        });

    div.select("svg").append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .call(xAxis);

    // add bars

    var group = div.select("svg")
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    var rects = group
        .selectAll("rect")
        .data(years);

    rects.enter()
        .append("rect")
        .merge(rects)
        .attr("y", function (d, i) {
            return yAxisScale(i) - yAxisScale(0) / 2 + padding;
        })
        .attr("x", 0)
        .attr("width", function (d) {
            return xAxisScale(+d);
        })
        .attr("height", yAxisScale(0) - padding)
        .attr("fill", function (d) {
            return yearsColorScale(+d);
        })
        .on("click", function (d, i) {
            if (d3.select(this).classed("selectedBar")) {
                d3.select(this).classed("selectedBar", false);
                d3.select("#topic_view_papers").select("span").text("");
                self.topicViewPapers.update(topicID)
            }
            else {
                div.selectAll("rect").classed("selectedBar", false);        // Note the change!
                d3.select(this).classed("selectedBar", true);
                d3.select("#topic_view_papers").select("span").text(": " + (self.baseYear + i));
                self.topicViewPapers.update(topicID, self.baseYear + i)
            }
        });
};

