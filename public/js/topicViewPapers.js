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
    self.list = d3.select("#topic_view_papers");

    self.paperTopics = paperTopics;
    self.papers = papers;

    var width = parseInt(window.innerWidth) * .2 * 0.3;

    self.dimensions = {
        "barsCellWidth": width, "barsCellHeight": 20
    };

    self.xTop = 10;

    self.colors = {categories: '#34888C',topic: '#7CAA2D',
        author: '#CB6318', words: '#962715',
        base: '#ddd', corpus: '#34675C'};

    self.tooltip = d3.select(".tooltip");
}

/**
 * This function return the information of a paper given an ID
 * @param paperID
 * @returns {string}
 */
TopicViewPapers.prototype.paperInfo = function(paperID) {
    var self = this;
    var s = self.papers
        .filter(function (d) {
            return d["Paper Id"] === paperID;
        });
    if (s.length === 0) return "no entry for '" + paperID + "' in paper.csv dataset";
    if (s.length > 1) return "redundant entry for '" + paperID + "' in paper.csv dataset";

    var title = s[0]["Title"] + ", " + s[0]["Conference"] + " " + s[0]["Year"];
    if (s[0]["Session"] !== "")
        title = title + ", Session: " + s[0]["Session"];
    return title;

};

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
                return +paper[0]["Year"] === year;
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

    var rows = self.list
        .selectAll(".rows")
        .data(topDocs);

    rows.exit().remove();
    rows.enter()
        .append("div")
        .classed("rows", true)
        .on("click", function (d) {  // clicking a row in a table will do this
            location.hash = "#/paper/" + d["paperID"];
        })
        .merge(rows)
        .selectAll(".cells")
        .data(function (d) {
            return [
                {'type': 'percentage', 'value': d[topicID]}, // data for column 2
                {'type': 'bars', 'value': d[topicID]},  // data for column 1
                {'type': 'doc_name', 'value': d["paperID"]} // data for column 3
                // add the data for more columns
            ];
        })
        .enter()
        .append("div")
        .classed("cells", true);

    var cells = self.list.selectAll(".cells");

    // 1st Column

    var percentage = cells.filter(function (d) {
        return d.type === 'percentage'
    })
    //.attr("width", self.dimensions.topicCellwidth)
        .each(function (d) {
            d3.select(this)
                .text(function () {
                    return d3.format(".3n")(d.value * 100) + "%";
                });
        });

    // 2nd column

    var weightColorScale = d3.scaleLinear()
        .range([self.colors.base, self.colors.topic])
        .domain([0, 1]);

    var weightXScale = d3.scaleLinear()
        .range([0, self.dimensions.barsCellWidth])
        .domain([0, 1]);

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
    var docName = cells.filter(function (d) {
        return d.type === 'doc_name'
    })
    //.attr("width", self.dimensions.topicCellwidth)
        .each(function (d) {
            d3.select(this)
                .text(function () {
                    return self.paperInfo(d.value);
                })
                .classed("title", true);
        });

    d3.select("#topic_view").select(".column2")
        .select(".headers")
        .selectAll(".cells")
        .on("mouseover", function (d, i) {
            var text = "";
            if (i === 1) return;
            if (i === 0) {
                text = "The percentage of the paper</br>"
                    + "which belongs in the topic. </br>";
            }
            if (i === 2) {
                text = "Papers in the corpus that score over <br>"
                + "a threshold percentage for the topic.";
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