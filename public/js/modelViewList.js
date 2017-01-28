/**
 * This module create the model view of the topics.
 */
/**
 * @param topicWords
 * @param topicNames
 * @param paperTopics
 * @param topicYears
 * @constructor
 */
function ModelViewList(topicWords,topicNames,paperTopics,topicYears) {

    var self = this;

    self.div = d3.select("#model_view");
    //self.menu = d3.select("#model_nav");
    self.table = self.div.select("table");

    self.topicWords = topicWords["tw"];
    self.topicWords.forEach(function (d, i) {
        d.id = i;
    });

    self.topicNames = topicNames;
    self.paperTopics = paperTopics;
    self.topicYears = topicYears;

    self.dimensions = {
        "topicCellwidth": 80, "yearCellWidth": 120, "wordCellWidth": 100, "corpusCellWidth": 80,
        "yearCellHeight": 40, "corpusCellHeight": 20
    };

    self.asc = [false, false, false, false]; // For sorting
    self.corpusThreshold = 0.1;
    self.maxCorpusValue = 10; // max percentage value for corpus, used for visualizing the forth column
    self.maxBarValue = 30; // max value for bars in the table
    self.xTopWords = 10;

    self.init();

}

/**
 * This function populate the svg table
 */
ModelViewList.prototype.init = function() {

    var self = this;

    // sorting option for headers

    var headers = self.table.select("thead")
        .selectAll("th")
        .on("click", function (d, i) {

            self.asc[i] = self.asc[i] ? false : true;

            self.topicWords.sort(function (a, b) {
                if (i == 0) { // sort the first column based on topic names
                    if (self.asc[0])
                        return d3.ascending(self.topicNames[a["id"]]["label"], self.topicNames[b["id"]]["label"]);
                    else
                        return d3.descending(self.topicNames[a["id"]]["label"], self.topicNames[b["id"]]["label"]);
                }
                else if (i == 1) { // sort the second column
                    return;
                }
                else if (i == 2) {  // sort the third column
                    return;
                }
                else if (i == 3) { // sort the third column based on corpus
                    if (self.asc[3])
                        return d3.ascending(self.computeCorpus(a["id"]), self.computeCorpus(b["id"]));
                    else
                        return d3.descending(self.computeCorpus(a["id"]), self.computeCorpus(b["id"]));
                }
            });

            // Update the table
            if (i==0 || i==3)
                self.update();

        });

    self.update();
};

/**
 * This function update the table, initially and when sorted
 */
ModelViewList.prototype.update = function() {
    var self = this;

    self.div.classed("hidden",false);
    //self.menu.classed("hidden",false);

    var rows = self.table.select("tbody").selectAll("tr")
        .data(self.topicWords);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("tr")
        .on("click", function (d, i) {  // clicking a row in a table will do this

            //self.menu.classed("hidden",true);
            location.hash = "#/topic/" + d["id"];
        });

    var cells = enterRows.merge(rows).selectAll("td")
        .data(function (d) {
            return [
                {'type': 'topic_name', 'value': self.topicNames[d["id"]]["label"]}, // data for column 1
                {'type': 'year_bars', 'value': self.topicYears[d["id"]]["years"]},  // data for column 2
                {'type': 'topic_words', 'value': d},   // data for column 3
                {'type': 'corpus', 'value': d["id"]}  // data for column 4
                // add the data for more columns
            ];
        });

    var enterCells = cells.enter().append("td");
    cells = enterCells.merge(cells);

    // 1st Column

    var topicName = cells.filter(function (d) {
        return d.type == 'topic_name'
    })
        .attr("width", self.dimensions.topicCellwidth)
        .each(function (d) {
            d3.select(this)
                .text(function () {
                    return d.value;
                });
        });


    // 2nd Column

    var yearBars = cells.filter(function (d) {
        return d.type == 'year_bars';
    }).each(function (d) {

        var years = d3.dsvFormat(";").parseRows(d.value, function (g) {
            return g;
        })[0];


        var yearsColorScale = d3.scaleLinear()
            .range(["lightsteelblue", "midnightblue"])
            //.domain([0, d3.max(years, function (g) {
            //    return +g;
            //})]);
            .domain([0, self.maxBarValue]);

        var yScale = d3.scaleLinear()
            .range([0, self.dimensions.yearCellHeight])
            //.domain([0, d3.max(years, function (g) {
            //    return +g;
            //})]);
            .domain([0, self.maxBarValue]);

        var xScale = d3.scaleLinear()
            .range([0, self.dimensions.yearCellWidth])
            .domain([0, years.length]);

        d3.select(this).selectAll("svg").remove();

        var group = d3.select(this)
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
    });

    // 3rd Column

    var topicWords = cells.filter(function (d) {
        return d.type == 'topic_words'
    }).each(function (d) {
        d3.select(this)
            .text(function () {
                return self.findTopWord(d.value);
            });
    });

    // 4th Column

    var corpusColorScale = d3.scaleLinear()
        .range(['#ece2f0', '#016450'])
        .domain([0, self.maxCorpusValue]);

    var barScale = d3.scaleLinear()
        .range([0, self.dimensions.corpusCellWidth])
        .domain([0, self.maxCorpusValue]);

    cells.filter(function (d) {
        return d.type == 'corpus';
    }).each(function (d) {

        d3.select(this).selectAll("svg").remove();

        var group = d3.select(this).append("svg")
            .attr("width", self.dimensions.corpusCellWidth)
            .attr("height", self.dimensions.corpusCellHeight)
            .append("g");

        group.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", function () {
                return barScale(+self.computeCorpus(+d.value));
            })
            .attr("height", self.dimensions.corpusCellHeight)
            .attr("fill", function () {
                return corpusColorScale(+self.computeCorpus(+d.value));
            });

        group.append("text")
            .attr("x", 5)
            .attr("y", self.dimensions.corpusCellHeight / 2)
            .attr("dy", ".35em")
            .text(function () {
                return self.computeCorpus(d.value) + "%";
            })
            .attr("class", "corpusText");
    });

    // add more columns

};

/**
 * This function compute the corpus of a topic
 * @param topicIndex
 * @returns {*}
 */
ModelViewList.prototype.computeCorpus = function (topicIndex) {
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
ModelViewList.prototype.findTopWord = function(wordWeight) {
    var self = this;

    var list = [];
    for (var i = 0; i < wordWeight['words'].length; i++)
        list.push({'label': wordWeight['words'][i], 'weight': wordWeight['weights'][i]});

    list.sort(function (a, b) {
        return ((a.weight < b.weight) ? 1 : ((a.weight == b.weight) ? 0 : -1));
    });

    var words = "";
    for (var j = 0; j < self.xTopWords - 1; j++) {
        words += list[j]['label'] + " ";
    }
    words += list[self.xTopWords - 1]['label'];
    return words;

};
