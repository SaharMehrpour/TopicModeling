/**
 * This module create a view for visualizing information of a paper
 */

/**
 * @param papers
 * @param paperTopics
 * @param topicLabels
 * @param topicWords
 * @constructor
 */
function DocView(papers, paperTopics, topicLabels, topicWords) {

    var self = this;

    self.div = d3.select("#doc_view");
    self.table = self.div.select("table");
    self.title = d3.select("#doc_view_info");

    self.papers = papers;
    self.paperTopics = paperTopics;
    self.topicLabels = topicLabels;
    self.topicWords = topicWords["tw"];

    self.xTop = 10;
    self.xTopWords = 10;

    self.dimensions = {
        "topicNameCellWidth": 90, "weightCellWidth": 120, "weightCellHeight": 20
    };
}

/**
 * This function updates a view given a paper ID
 * @param paperID
 */
DocView.prototype.update = function(paperID) {

    var self = this;

    self.div.classed("hidden", false);

    self.div.select("#tempDoc").remove();

    var paper = self.papers
        .filter(function (d) {
            return d["Paper Id"] == paperID;
        });

    if (paper.length == 0) {
        self.title.select("#paper_title").text(paperID);
        self.title.select("#conf_name").text(
            "no entry for '" + paperID + "' in paper.csv dataset");
        return;
    }
    else if (paper.length > 1) {
        self.title.select("#paper_title").text(paperID);
        self.title.select("#conf_name").text(
            "redundant entry for '" + paperID + "' in paper.csv dataset");
        return;
    }
    else {

        self.title.select("#paper_title").text(paper[0]["Title"]);
        self.title.select("#conf_name").text(paper[0]["Conference"] + " " + paper[0]["Year"]);
        if (paper[0]["Session"] !== "")
            self.title.select("#session_name").text("Session Name: " + paper[0]["Session"]);

        self.title.select("p")
            .select("a")
            .attr("href", paper[0]["Url"])
            .text("View paper");
    }

    var topicsOfPaper = self.paperTopics
        .filter(function (d) {
            return d["paperID"] == paperID;
        });

    // finding xTop topics for the paper

    var topicsValues = [];

    for (var i in topicsOfPaper[0]) {
        if (i !== 'paper')
            topicsValues.push({'id': i, 'value': +topicsOfPaper[0][i]});
    }

    topicsValues.sort(function (a, b) {
        return b['value'] - a['value'];
    });

    var topTopics = topicsValues.filter(function (d, i) {
        return (d['value'] > 0 && i < self.xTop);
    });

//***************

    // Populate the svg table

    var rows = self.table.select("tbody").selectAll("tr")
        .data(topTopics);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("tr");

    rows = enterRows.merge(rows);

    rows.on("click",function (d) {
        location.hash = "#/topic/" + d["id"];
    });

    var cells = rows.selectAll("td")
        .data(function (d) {
            return [
                {'type': 'topic_name', 'value': d['id']}, // data for column 1
                {'type': 'topWords', 'value': d['id']},  // data for column 2
                {'type': 'weight', 'value': d['value']},   // data for column 3
                {'type': 'percentage', 'value': d['value']}   // data for column 4
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
                    return self.topicInfo(d.value);
                });
        });


    // 2nd Column

    var topWords = cells.filter(function (d) {
        return d.type == 'topWords';
    }).each(function (d) {
        d3.select(this)
            .text(function () {
                return self.findTopWord(d.value);
            });
    });

    // 3rd Column

    var weightColorScale = d3.scaleLinear()
        .range(['#ece2f0', '#016450'])
        .domain([0,1]);
        //.domain([0, d3.max(self.topicWords[topicID]["weights"], function (g) {
        //    return +g;
        //})]);

    var weightXScale = d3.scaleLinear()
        .range([0, self.dimensions.weightCellWidth])
        .domain([0,1]);
        //.domain([0, d3.max(self.topicWords[topicID]["weights"], function (g) {
        //    return +g;
        //})]);

    cells.filter(function (d) {
        return d.type == 'weight';
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
    });

    // 4th Column

    var percentage = cells.filter(function (d) {
        return d.type == 'percentage'
    })
    //.attr("width", self.dimensions.topicCellwidth)
        .each(function (d) {
            d3.select(this)
                .text(function () {
                    return d3.format(".3n")(d.value * 100) + "%";
                });
        });

    // add more columns

};

/**
 * This function return the name of the Topic given an ID
 * @param topicID
 * @returns {*}
 */
DocView.prototype.topicInfo = function(topicID) {
    var self = this;
    var s = self.topicLabels
        .filter(function (d) {
            return d["index"] == +topicID;
        });
    if (s.length == 0) return "no entry for '" + topicID + "' in Topic_labels.csv dataset";;
    if (s.length > 1) return "redundant entry for '" + topicID + "' in Topic_labels.csv dataset";
    return s[0]["label"];

};

/**
 * This function find xTopWords for the Topic given an ID
 * @param topicID
 * @returns {string}
 */
DocView.prototype.findTopWord = function(topicID) {

    var self = this;

    var wordWeight = self.topicWords[topicID];

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

/*
DocView.prototype.findTokens = function (topicID) {
    self = this;
    return self.topicWords[topicID]["words"].length;
};
*/