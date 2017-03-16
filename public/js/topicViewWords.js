/**
 * This module creates and updates the list of words and their weights for a topic view
 * given the data set of the topic-words
 *
 * renamed from topicViewTable
 */
/**
 * @param topicWords
 * @constructor
 */
function TopicViewWords(topicWords, topicLabels) {

    var self = this;

    self.table = d3.select("#topic_view_table");

    self.topicWords = topicWords["tw"];
    self.topicLabels = topicLabels;

    var width = parseInt(window.innerWidth)*.2*0.2;
    var width_diagram = parseInt(window.innerWidth)*0.7;

    self.dimensions = {
        "wordCellwidth": 70, "weightCellWidth": width, "weightCellHeight": 20,
        row_height : 100 , row_distance : 70 , row_width : width_diagram
    };

    self.svg = d3.select("#words_diagram");
    self.tooltip = d3.select(".tooltip");
}

/**
 * This function updates the list of words given a topic ID
 * @param topicID
 */
TopicViewWords.prototype.update_2 = function(topicID) {
    var self = this;

    // TODO: sort topicWords

    var rows = self.table.select("tbody").selectAll("tr")
        .data(self.topicWords[topicID]["words"]);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("tr")
        .on("click", function (d) {  // clicking a row in a table will do this
            location.hash = "#/word/" + d;
        });

    var cells = enterRows.merge(rows).selectAll("td")
        .data(function (d,i) {
            return [
                {'type': 'word_name', 'value': self.topicWords[topicID]["words"][i]}, // data for column 1
                {'type': 'word_weight', 'value': self.topicWords[topicID]["weights"][i]}  // data for column 2
                // add the data for more columns
            ];
        });

    var enterCells = cells.enter().append("td");
    cells = enterCells.merge(cells);

    // 1st Column

    var topicName = cells.filter(function (d) {
        return d.type == 'word_name'
    })
        .attr("width", self.dimensions.topicCellwidth)
        .each(function (d) {
            d3.select(this)
                .text(function () {
                    return d.value;
                });
        });


    // 2nd Column

    var weightColorScale = d3.scaleLinear()
        .range(['#ece2f0', '#016450'])
        .domain([0, d3.max(self.topicWords[topicID]["weights"], function (g) {
            return +g;
        })]);

    var weightXScale = d3.scaleLinear()
        .range([0, self.dimensions.weightCellWidth])
        .domain([0, d3.max(self.topicWords[topicID]["weights"], function (g) {
            return +g;
        })]);

    cells.filter(function (d) {
        return d.type == 'word_weight';
    }).each(function (d) {

        d3.select(this).selectAll("svg").remove();

        var group = d3.select(this).append("svg")
            .attr("width", self.dimensions.weightCellWidth)
            .attr("height", self.dimensions.weightCellHeight)
            .append("g");

        group.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", function () {
                return weightXScale(+d.value);
            })
            .attr("height", self.dimensions.weightCellHeight)
            .attr("fill", function () {
                return weightColorScale(+d.value);
            });
        /*
         group.append("text")
         .attr("x", 5)
         .attr("y", self.dimensions.weigthCellHeight / 2)
         .attr("dy", ".35em")
         .text(function () {
         return d.value;
         })
         .attr("class", "corpusText");
         */
    });

    // add more columns

};

TopicViewWords.prototype.update = function (topicID) {

    var self = this;

    var topic = self.topicWords[topicID];

    // add more info

    topic["topicID"] = topic["id"];
    topic["topic_label"] = self.topicLabels.filter(function (g) {
        return g["index"] == topic["id"];
    })[0]["label"];
    topic["words_weights"] = [];
    for (var index = 0; index < topic["words"].length; index++)
        topic["words_weights"].push({"word": topic["words"][index], "weight": topic["weights"][index]})


    // find the max weight

    var maxWeight = d3.max(topic["weights"]);

    //scales

    var yScale = d3.scaleLinear()
        .domain([0, maxWeight])  // min and max word weights
        .range([0, self.dimensions.row_height]);

    var xScale = d3.scaleLinear()
        .domain([0, 50]) // number of words in each topic
        .range([0, self.dimensions.row_width - 20]);


    // line function

    var topicWordLine = d3.area()
        .x(function (g, i) {
            return xScale(i);
        })
        .y0(self.dimensions.row_height)
        .y1(function (g) {
            return self.dimensions.row_height - yScale(+g["weight"]);
        });

    // append a group for each topic

    var groups = self.svg.selectAll("g")
        .data([topic]);

    groups.exit().remove();

    groups.enter().append("g")
        .merge(groups);

    self.svg.selectAll("g")
        .attr("transform", function (d, i) {
            //if (i == 0) return "translate(10," + self.dimensions.row_distance + ")";
            return "translate(10, "+  self.dimensions.row_distance + ")"
        });

    // append a path to each group

    var paths = self.svg
        .select("g")
        .selectAll("path")
        .data([topic]);

    paths.exit().remove();

    paths.enter()
        .append("path")
        .merge(paths)
        .attr("d", function (g) {
            return topicWordLine(g["words_weights"]);
        });

    // append circles corresponding to words of a topic to each group

    var circles = self.svg.selectAll("g")
        .data([topic])
        .selectAll("circle")
        .data(function (d) {
            return d["words_weights"];
        });

    circles.exit().remove();

    circles.enter()
        .append("circle")
        .merge(circles)
        .attr("cx", function (g, i) {
            return xScale(i);
        })
        .attr("cy", function (g) {
            return self.dimensions.row_height - yScale(+g["weight"])
        })
        .attr("r", 2)
        .on("mouseover", function (g, i) {
            if (g["topicValue"] == 0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return g["word"] + " (word " + (i + 1) + ")";
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (g, i) {
            if (i == 0) return;
            if (g["topicValue"] == 0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        .on("click", function (g) {
            location.hash = "#/word/" + g["word"];
        });

    // append texts above circles

    var texts = self.svg.selectAll("g")
        .data([topic])
        .selectAll(".word")
        .data(function (d) {
            return d["words_weights"];
        });

    texts.exit().remove();

    texts.enter()
        .append("text")
        .merge(texts)
        .attr("x", function (g, i) {
            return xScale(i);
        })
        .attr("y", function (g) {
            return self.dimensions.row_height - yScale(+g["weight"])
        })
        .html(function (g) {
            return g["word"].slice(0, Math.min(g["word"].length,20));
        })
        .attr("transform", function (g, i) {
            return "translate(2,-5) " +
                "rotate(310," + xScale(i) + "," + (self.dimensions.row_height - yScale(+g["weight"])) + ")";
        })
        .attr("class", "word ")
        .on("click", function (g) {
            location.hash = "#/word/" + g["word"];
        });
        //.style("opacity", 0); // initially they are invisible

};


