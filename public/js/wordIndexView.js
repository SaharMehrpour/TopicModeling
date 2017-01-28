/**
 * This module creates the view for the list of words
 */
/**
 * @param topicWords
 * @constructor
 */
function WordIndexView(topicWords) {

    var self = this;

    self.div = d3.select("#wordIndex_view");

    self.topicWords = topicWords["tw"];

    self.init();

}

/**
 * This function populates the view with the list of all words
 */
WordIndexView.prototype.init = function() {

    var self = this;

    // all words, duplicated

    var allWords = [];
    for (var i = 0; i < self.topicWords.length; i++) {
        allWords = allWords.concat(self.topicWords[i]["words"]);
    }

    // unique words

    var words = d3.nest().key(function (d) {
        return d
    }).rollup(function (leaves) {
        return leaves.length;
    }).entries(allWords);


    // sort alphabetically

    words.sort(function (a, b) {
        return d3.ascending(a.key, b.key);
    });

    var items = self.div.selectAll("li").data(words);

    items.enter().append("li").text(function (d) {
        return d.key;
    }).on("click", function (g) {  // clicking a row in a table will do this
        location.hash = "#/word/" + g.key;
    });


};

/**
 * This function update the view by making it visible
 */
WordIndexView.prototype.update = function() {

    var self = this;

    self.div.classed("hidden",false);
};

