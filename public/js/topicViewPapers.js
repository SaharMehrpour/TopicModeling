/**
 * Created by sahar on 2016-10-26.
 */

/**
 * Constructor for the TopicViewPaper
 */
function TopicViewPapers(papers, paperTopics) {

    var self = this;

    self.table = d3.select("#topic_view_papers > table");

    self.paperTopics = paperTopics;
    self.papers = papers;

    self.xTop = 10;

}


TopicViewPapers.prototype.update = function(topicID) {

    var self = this;

    self.paperTopics.sort(function (a, b) {

        return d3.descending(a[topicID], b[topicID]);
    });

    var topDocs = self.paperTopics
        .filter(function (d, i) {
            return i < self.xTop;
        });

    var rows = self.table.select("tbody").selectAll("tr")
        .data(topDocs);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("tr")
        .on("click", function (d) {  // clicking a row in a table will do this
            // TODO: do something!
            location.hash = "#/doc/" + d["paper"];
        });

    var cells = enterRows.merge(rows).selectAll("td")
        .data(function (d) {
            return [
                {'type': 'doc_name', 'value': d["paper"]}, // data for column 1
                {'type': 'percentage', 'value': d[topicID]}  // data for column 2
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


TopicViewPapers.prototype.paperInfo = function(paperID) {
    var self = this;
    var s = self.papers
        .filter(function (d) {
            return d["Paper Id"] == paperID;
        });
    if (s.length == 0) return "no entry for '" + paperID + "' in paper.csv dataset";;
    if (s.length > 1) return "redundant entry for '" + paperID + "' in paper.csv dataset";
    return s[0]["Title"] + ", " + s[0]["Conference"] + ", " + s[0]["Session"] + ", " + s[0]["Year"];

};