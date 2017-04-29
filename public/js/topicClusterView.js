/**
 * Created by saharmehrpour on 3/16/17.
 */

/**
 * @param topicWords
 * @param topicNames
 * @param paperTopics
 * @param topicYears
 * @constructor
 */
function TopicClusterView(topicWords,topicNames,paperTopics,topicYears,topicCategories) {

    var self = this;

    self.div = d3.select("#cluster_view");
    self.clusterDiv = self.div.select("#clusters_div");
    self.topicDiv = self.div.select("#topics_div");

    self.topicWords = topicWords["tw"];
    self.topicWords.forEach(function (d, i) {
        d.id = i;
    });

    self.topicNames = topicNames;
    self.paperTopics = paperTopics;
    self.topicYears = topicYears;
    self.topicCategories = topicCategories;

    self.displayedTopics = [];

    self.dimensions = {
        "topicCellwidth": 80, "yearCellWidth": 120, "wordCellWidth": 100, "corpusCellWidth": 80,
        "yearCellHeight": 40, "corpusCellHeight": 20
    };

    self.asc = [false, false, false, false]; // For sorting
    self.corpusThreshold = 0.1;
    self.maxCorpusValue = 10; // max percentage value for corpus, used for visualizing the forth column
    self.maxBarValue = 30; // max value for bars in the table
    self.maxBarValueCluster = 95; // max value for bars in the table
    self.xTopWords = 10;


    self.table = self.div.select("#topic_table");
    self.tooltip = d3.select(".tooltip");

    self.colors = {categories: '#34888C',topic: '#7CAA2D',
        author: '#CB6318', words: '#962715',
        base: '#ddd', corpus: '#34675C'};

    self.init();

}

/**
 * This function init the svg table
 */
TopicClusterView.prototype.init = function() {

    var self = this;

    self.populateCluster();

    // sorting option for header

    self.div.select("#topic_header")
        .select(".rows")
        .selectAll("div")
        .on("click", function (d, i) {
            if (i === 1 || i === 2) return;
            self.asc[i] = !self.asc[i];
            self.displayedTopics.sort(function (a, b) {
                if (i === 0) { // sort the first column based on topic names
                    if (self.asc[0])
                        return d3.ascending(self.topicNames[a["id"]]["label"], self.topicNames[b["id"]]["label"]);
                    else
                        return d3.descending(self.topicNames[a["id"]]["label"], self.topicNames[b["id"]]["label"]);
                }

                else if (i === 3) { // sort the third column based on corpus
                    if (self.asc[3])
                        return d3.ascending(self.computeCorpus(a["id"]), self.computeCorpus(b["id"]));
                    else
                        return d3.descending(self.computeCorpus(a["id"]), self.computeCorpus(b["id"]));
                }

            });
            // Update the table
            if (i === 0 || i === 3)
                self.populateTopic();
        })
        .on("mouseover", function (d, i) {
            var text = "";
            if (i === 0) return;
            if (i === 1) {
                text = "The timeline (1980-2015) shows the papercount per year, </br>"
                    + "where the papercount is the number of papers that score over </br>"
                    + "a threshold percentage for the topic.";
            }
            if (i === 2) {
                text = "The top words that discriminate <br>whether a paper is in the topic.";
            }
            if (i === 3) {
                text = "The percentage of papers in the topic";
            }
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(text)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
};

/**
 * This function populate the cluster table, initially and when sorted
 */
TopicClusterView.prototype.populateCluster = function() {

    var self = this;

    var data = d3.nest()
        .key(function (d) {
            return d["category"]
        })
        .rollup(function (leaves) {
            var topics = [];
            for (var index = 0; index < leaves.length; index++) {
                topics.push(leaves[index]["topic"])
            }
            return topics;
        })
        .entries(self.topicCategories);

    data.sort(function (a, b) {
        return d3.ascending(a.key, b.key)
    });

    var rows = self.clusterDiv.selectAll(".rows")
        .data(data);
    rows.exit().remove();

    var enterRows = rows.enter()
        .append("div")
        .classed("rows", true)
        .on("click", function (d) {  // clicking a row in a table will do this
            self.clusterDiv.selectAll(".rows").style("background-color", null);
            d3.select(this).style("background-color", "#eee");

            var indices = d["value"];
            self.displayedTopics = self.topicWords.filter(function (d, i) {
                return indices.indexOf(i.toString()) !== -1
            });
            self.populateTopic()
        });

    var cells = enterRows.merge(rows).selectAll(".cells")
        .data(function (d) {
            return d3.entries([
                {'type': 'clusterName', 'value': d["key"]}, // data for column 1
                {'type': 'time_line', 'value': d["value"]}  // data for column 2
                // add the data for more columns
            ]);
        });

    var yearsColorScale = d3.scaleLinear()
        .range([self.colors.base, self.colors.categories])
        .domain([0, self.maxBarValueCluster]);

    var yScale = d3.scaleLinear()
        .range([0, self.dimensions.yearCellHeight])
        .domain([0, self.maxBarValueCluster]);

    var xScale = d3.scaleLinear()
        .range([0, self.dimensions.yearCellWidth]);

    var enterCells = cells.enter()
        .append("div");

    enterCells.merge(cells)
        .attr("class", function (g, i) {
            return "cells cell" + (i + 1).toString();
        })
        .each(function (g, i) {
            if (i === 0)
                d3.select(this).html(g.value["value"]);

            if (i === 1) {
                var years = new Array(d3.dsvFormat(";")
                        .parseRows(self.topicYears[+g.value["value"][0]]["years"], function (h) {
                            return h;
                        })[0].length + 1).join('0').split('').map(parseFloat);

                for (var y = 0; y < g.value["value"].length; y++) {
                    var tmp_years = d3.dsvFormat(";")
                        .parseRows(self.topicYears[+g.value["value"][y]]["years"], function (h) {
                            return h;
                        })[0];
                    years = years.map(function (num, idx) {
                        return num + (+tmp_years[idx]);
                    });

                }

                xScale.domain([0, years.length]);

                d3.select(this).selectAll("div").remove();

                var dd = d3.select(this).append("div")
                    .style("padding-right", "10px");

                var group = dd
                    .append("svg")
                    .attr("width", self.dimensions.yearCellWidth)
                    .attr("height", self.dimensions.yearCellHeight)
                    .append("g")
                    .attr("transform", "translate(0, " + self.dimensions.yearCellHeight + " ) scale(1,-1)");

                var rects = group
                    .selectAll("rect")
                    .data(years);

                rects.enter()
                    .append("rect")
                    .attr("x", function (dd, ii) {
                        return xScale(ii);
                    })
                    .attr("y", 0)
                    .attr("height", function (dd) {
                        return yScale(+dd);
                    })
                    .attr("width", xScale(1))
                    .attr("fill", function (dd) {
                        return yearsColorScale(+dd);
                    });
            }
        });
};

/**
 * This function populate the topic table, initially and when sorted
 */
TopicClusterView.prototype.populateTopic = function() {

    var self = this;
/*
    var data = self.topicWords.filter(function (d,i) {
        return indices.indexOf(i.toString())!==-1
    });
*/
    var rows = self.table.selectAll(".rows")
        .data(self.displayedTopics);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("div")
        .classed("rows", true)
        .on("click", function (d) {  // clicking a row in a table will do this
            location.hash = "#/topic/" + d["id"];
        });

    var cells = enterRows.merge(rows).selectAll(".cells")
        .data(function (d) {
            return d3.entries([
                {'type': 'topic_name', 'value': self.topicNames[d["id"]]["label"]}, // data for column 1
                {'type': 'year_bars', 'value': self.topicYears[d["id"]]["years"]},  // data for column 2
                {'type': 'topic_words', 'value': d},   // data for column 3
                {'type': 'corpus', 'value': d["id"]}  // data for column 4
                // add the data for more columns
            ]);
        });


    var yearsColorScale = d3.scaleLinear()
        .range([self.colors.base, self.colors.topic])
        .domain([0, self.maxBarValue]);

    var yScale = d3.scaleLinear()
        .range([0, self.dimensions.yearCellHeight])
        .domain([0, self.maxBarValue]);

    var xScale = d3.scaleLinear()
        .range([0, self.dimensions.yearCellWidth]);

    var corpusColorScale = d3.scaleLinear()
        .range([self.colors.base, self.colors.corpus])
        .domain([0, self.maxCorpusValue]);

    var barScale = d3.scaleLinear()
        .range([0, self.dimensions.corpusCellWidth])
        .domain([0, self.maxCorpusValue]);


    var enterCells = cells.enter()
        .append("div");

    enterCells.merge(cells)
        .attr("class", function (g, i) {
            return "cells cell" + (i + 1).toString();
        })
        .each(function (g, i) {
            if (i === 0)
                d3.select(this).html(g.value["value"]);

            if (i === 1) {
                var years = d3.dsvFormat(";")
                    .parseRows(g.value["value"], function (h) {
                        return h;
                    })[0];

                xScale.domain([0, years.length]);

                d3.select(this).selectAll("div").remove();

                var dd = d3.select(this).append("div")
                    .style("padding-right", "10px");

                var group = dd
                    .append("svg")
                    .attr("width", self.dimensions.yearCellWidth)
                    .attr("height", self.dimensions.yearCellHeight)
                    .append("g")
                    .attr("transform", "translate(0, " + self.dimensions.yearCellHeight + " ) scale(1,-1)");

                var rects = group
                    .selectAll("rect")
                    .data(years);

                rects.enter()
                    .append("rect")
                    .attr("x", function (dd, ii) {
                        return xScale(ii);
                    })
                    .attr("y", 0)
                    .attr("height", function (dd) {
                        return yScale(+dd);
                    })
                    .attr("width", xScale(1))
                    .attr("fill", function (dd) {
                        return yearsColorScale(+dd);
                    });

            }

            if (i === 2) {
                d3.select(this).html(self.findTopWord(g.value["value"]));
            }

            if (i === 3) {
                d3.select(this).selectAll("svg").remove();

                var group = d3.select(this).append("svg")
                    .attr("width", self.dimensions.corpusCellWidth)
                    .attr("height", self.dimensions.corpusCellHeight)
                    .append("g");

                group.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", function () {
                        return barScale(+self.computeCorpus(+g.value["value"]));
                    })
                    .attr("height", self.dimensions.corpusCellHeight)
                    .attr("fill", function () {
                        return corpusColorScale(+self.computeCorpus(+g.value["value"]));
                    });

                group.append("text")
                    .attr("x", 5)
                    .attr("y", self.dimensions.corpusCellHeight / 2)
                    .attr("dy", ".35em")
                    .text(function () {
                        return self.computeCorpus(g.value["value"]) + "%";
                    })
                    .attr("class", "corpusText");
            }

        });


};

/**
 * This function compute the corpus of a topic
 * @param topicIndex
 * @returns {*}
 */
TopicClusterView.prototype.computeCorpus = function (topicIndex) {
    var self = this;

    var papersWithTopic = self.paperTopics.filter(function (d) {
        return +d[topicIndex] >= self.corpusThreshold;
    });

    return d3.format(".3n")(papersWithTopic.length / self.paperTopics.length * 100);
};

/**
 * This function returns xTopWords for a given list of words-weights
 * @param wordWeight
 * @returns {string}
 */
TopicClusterView.prototype.findTopWord = function(wordWeight) {
    var self = this;

    var list = [];
    for (var i = 0; i < wordWeight['words'].length; i++)
        list.push({'label': wordWeight['words'][i], 'weight': wordWeight['weights'][i]});

    list.sort(function (a, b) {
        return ((a.weight < b.weight) ? 1 : ((a.weight === b.weight) ? 0 : -1));
    });

    var words = "";
    for (var j = 0; j < self.xTopWords - 1; j++) {
        words += list[j]['label'] + " ";
    }
    words += list[self.xTopWords - 1]['label'];
    return words;

};


TopicClusterView.prototype.update = function () {
    var self = this;

    self.div.classed("hidden",false);
    //self.menu.classed("hidden",false);
};
