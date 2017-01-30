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
function TopicViewWords(topicWords) {

    var self = this;

    self.table = d3.select("#topic_view_table");

    self.topicWords = topicWords["tw"];

    self.dimensions = {
        "wordCellwidth": 70, "weightCellWidth": 90, "weightCellHeight": 20
    };

}

/**
 * This function updates the list of words given a topic ID
 * @param topicID
 */
TopicViewWords.prototype.update = function(topicID) {
    var self = this;

    // TODO: sort topicWords

    var rows = self.table.select("tbody").selectAll("tr")
        .data(self.topicWords[topicID]["words"]);

    rows.exit().remove();

    var enterRows = rows.enter()
        .append("tr")
        .on("click", function (d) {  // clicking a row in a table will do this
            // TODO: clear this later!
            //location.hash = "#/word/" + d;
            location.hash = "#/author/authorID";
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

