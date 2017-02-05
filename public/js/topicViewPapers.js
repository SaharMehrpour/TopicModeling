/**
 * This module creates and updates an svg table of papers for a topic in a topic view
 */
/**
 * @param papers
 * @param paperTopics
 * @constructor
 */
function TopicViewPapers(papers, paperTopics) {

    var self = this;

    self.table = d3.select("#topic_view_papers > table");

    self.paperTopics = paperTopics;
    self.papers = papers;

    var width = parseInt(window.innerWidth)*.2*0.3;

    self.dimensions = {
        "barsCellWidth": width, "barsCellHeight": 20
    };

    self.xTop = 10;

}

/**
 * This function update the svg table given a topic ID
 * @param topicID
 * @param year
 */
TopicViewPapers.prototype.update = function(topicID,year) {

    var self = this;

    self.paperTopics.sort(function (a, b) {

        return d3.descending(a[topicID], b[topicID]);
    });

    var topDocs;

    if (year !== undefined) {
        topDocs = self.paperTopics
            .filter(function (d) {

                var paper = self.papers.filter(function (g) {
                    return g["Paper Id"] === d["paperID"];
                });

                if (paper.length === 0) return;
                return paper[0]["Year"] == year;
            })
            .filter(function (d, i) {
                return (/*i < self.xTop &&*/ d[topicID] > 0);
            });
    }

    else {
        topDocs = self.paperTopics
            .filter(function (d) {
                return (/*i < self.xTop &&*/ d[topicID] > 0);
            });
    }

    var rows = self.table.select("tbody").selectAll("tr")
        .data(topDocs);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("tr")
        .on("click", function (d) {  // clicking a row in a table will do this
            location.hash = "#/doc/" + d["paperID"];
        });

    var cells = enterRows.merge(rows).selectAll("td")
        .data(function (d) {
            return [
                {'type': 'doc_name', 'value': d["paperID"]}, // data for column 1
                {'type': 'bars', 'value': d[topicID]},  // data for column 2
                {'type': 'percentage', 'value': d[topicID]}  // data for column 3
                // add the data for more columns
            ];
        });

    var enterCells = cells.enter().append("td");
    cells = enterCells.merge(cells);

    // 1st Column

    var docName = cells.filter(function (d) {
        return d.type == 'doc_name'
    })
    //.attr("width", self.dimensions.topicCellwidth)
        .each(function (d) {
            d3.select(this)
                .text(function () {
                    return self.paperInfo(d.value);
                });
        });


    // 2nd Column

    var weightColorScale = d3.scaleLinear()
        .range(['#ece2f0', '#016450'])
        .domain([0, 1]);
    //.domain([0, d3.max(self.topicWords[topicID]["weights"], function (g) {
    //    return +g;
    //})]);

    var weightXScale = d3.scaleLinear()
        .range([0, self.dimensions.barsCellWidth])
        .domain([0, 1]);
    //.domain([0, d3.max(self.topicWords[topicID]["weights"], function (g) {
    //    return +g;
    //})]);

    var bars = cells.filter(function (d) {
        return d.type == 'bars';
    }).each(function (d) {

        d3.select(this).selectAll("svg").remove();

        var group = d3.select(this).append("svg")
            .attr("width", self.dimensions.barsCellWidth)
            .attr("height", self.dimensions.barsCellHeight)
            .append("g");

        group.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", function () {
                return weightXScale(+d.value);
            })
            .attr("height", self.dimensions.barsCellHeight)
            .attr("fill", function () {
                return weightColorScale(+d.value);
            });
    });

    // 3rd Column

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
 * This function return the information of a paper given an ID
 * @param paperID
 * @returns {string}
 */
TopicViewPapers.prototype.paperInfo = function(paperID) {
    var self = this;
    var s = self.papers
        .filter(function (d) {
            return d["Paper Id"] == paperID;
        });
    if (s.length == 0) return "no entry for '" + paperID + "' in paper.csv dataset";
    if (s.length > 1) return "redundant entry for '" + paperID + "' in paper.csv dataset";

    var title = s[0]["Title"] + ", " + s[0]["Conference"] + " " + s[0]["Year"];
    if (s[0]["Session"] !== "")
        title = title + ", Session: " + s[0]["Session"];
    return title;

};