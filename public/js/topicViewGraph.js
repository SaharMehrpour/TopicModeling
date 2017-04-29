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

    self.div = d3.select("#topic_graph");
    self.topicYears = topicYears;
    self.topicViewPapers = topicViewPapers;

    var width = parseInt(window.innerWidth)*.7*0.4;

    self.dimensions = {
        svgWidth: width, svgHeight: 420,
        graphWidth: width * 0.9, graphHeight: 350
    };

    self.margins = {
        top: 50, left: 40
    };

    self.padding = 2;
    self.baseYear = 1980;

    self.colors = {categories: '#34888C',topic: '#7CAA2D',
        author: '#CB6318', words: '#962715',
        base: '#ddd', corpus: '#34675C'};

    self.tooltip = d3.select(".tooltip");

}

/**
 * This function updates the time-line based on a new topic ID
 * @param topicID
 */

TopicViewGraph.prototype.update = function(topicID) {

    var self = this;

    // years

    var years = d3.dsvFormat(";").parseRows(self.topicYears[topicID]["years"], function (g) {
        return g;
    })[0];

    self.div.select("svg").remove();

    self.div.append("svg")
        .attr("width", self.dimensions.svgWidth)
        .attr("height", self.dimensions.svgHeight);

    // Scales

    var yearsColorScale = d3.scaleLinear()
        .range([self.colors.base, self.colors.topic])
        .domain([0, d3.max(years, function (g) {
            return +g;
        })]);

    var yAxisScale = d3.scalePoint()
        .domain(years.map(function (d, i) {
            return i;
        }))
        .range([0, self.dimensions.graphHeight])
        .padding(self.padding);

    var yAxis = d3.axisLeft()
        .scale(yAxisScale)
        .ticks(36);

    var xAxisScale = d3.scaleLinear()
        .domain([d3.max(years, function (d) {
            return +d;
        }), 0])
        .range([self.dimensions.graphWidth - self.margins.left, 0]);

    var xAxis = d3.axisTop()
        .scale(xAxisScale)
        .tickFormat(function (e) {
            if (Math.floor(e) !== e)
                return;
            return e;
        });

    // add grid lines

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")
        .attr("class", "grid")
        .call(d3.axisTop()
            .scale(xAxisScale)
            .tickSize(-self.dimensions.graphHeight)
            .tickFormat(""));

    // add Axis

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + ","
            + self.margins.top + ")")
        .call(yAxis)
        .selectAll("text")
        .text(function () {
            return (+d3.select(this).text()) + self.baseYear;
        });

    self.div.select("svg").append("g")
        .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")
        .call(xAxis);

    // add bars

    var group = self.div.select("svg")
        .append("g")
        .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")");

    var rects = group
        .selectAll("rect")
        .data(years);

    rects.enter()
        .append("rect")
        .merge(rects)
        .attr("y", function (d, i) {
            return yAxisScale(i) - yAxisScale(0) / 2 + self.padding;
        })
        .attr("x", 0)
        .attr("width", function (d) {
            return xAxisScale(+d);
        })
        .attr("height", yAxisScale(0) - self.padding)
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
                self.div.selectAll("rect").classed("selectedBar", false);        // Note the change!
                d3.select(this).classed("selectedBar", true);
                d3.select("#topic_view_papers").select("span").text(": " + (self.baseYear + i));
                self.topicViewPapers.update(topicID, self.baseYear + i)
            }
        });

    // add label
    self.div.select("svg")
        .append("text")
        .attr("transform", "translate(" + ((self.dimensions.graphWidth - self.margins.left) / 2) + ",0)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Papers per Year")
        .on("mouseover", function () {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return "The papercount per year, where the papercount </br>"
                    + "is the number of papers that score over a threshold </<br>"
                    + "percentage for the topic.";
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
};

