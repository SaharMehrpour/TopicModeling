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

    self.createAlphabetIndex();

    var items = self.div
        .select("#word_index")
        .selectAll("li").data(words);

    items.enter().append("li").text(function (d) {
            return d.key;
        })
        .on("click", function (g) {  // clicking a row in a table will do this
            location.hash = "#/word/" + g.key;
        })
        .style("display",function (g) { // default display
            if(g.key.charAt(0).toUpperCase().charAt(0) == 'A')
                return null;
            return "none";
        });

    // Search Option:

    d3.select("#wordInput")
        .on("keyup", function () {
            var filter = document.getElementById("wordInput").value.toUpperCase();

            // Search box is empty?
            if (filter == "") {

                // reset display of the words to default:
                self.div.select("#word_index")
                    .selectAll("li")
                    .style("display", function (g) {
                        if(g.key.charAt(0).toUpperCase() == 'A')
                            return null;
                        return "none";
                    });

                // set 'A' as the selected character
                self.div.select("#alphabet_index")
                    .selectAll("li")
                    .classed("selected",function (d,i) {
                        return i==0;
                    });
                return
            }

            self.div.select("#word_index")
                .selectAll("li")
                .each(function (d) {
                    if (d["key"].toUpperCase().indexOf(filter) > -1) {
                        d3.select(this).style("display", null);
                    }
                    else {
                        d3.select(this).style("display", "none")
                    }
                });

            // un-select the characters at the top
            self.div.select("#alphabet_index")
                .selectAll("li")
                .classed("selected",false);
        })

};

/**
 * This function update the view by making it visible
 */
WordIndexView.prototype.update = function() {

    var self = this;

    self.div.classed("hidden",false);
};

/**
 * This function creates an alphabet list on top
 * @param words
 */
WordIndexView.prototype.createAlphabetIndex = function () {

    var self = this;

    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphabet.push('Special');

    self.div.select("#alphabet_index")
        .selectAll("li")
        .data(alphabet)
        .enter()
        .append("li")
        .html(function (d) {
            return d;
        })
        .classed("selected", function (d, i) {
            return i == 0;
        })
        .on("click", function (d) {
            self.div.select("#alphabet_index")
                .selectAll("li")
                .classed("selected", false);
            d3.select(this)
                .classed("selected", true);

            self.div.select("#word_index")
                .selectAll("li")
                .style("display", function (g) {
                    if (d == 'Special') {
                        if (/[^A-Za-z]/.test(g.key.charAt(0)))
                            return null;
                        return "none";
                    }
                    if (g.key.charAt(0).toUpperCase() == d)
                        return null;
                    return "none";
                });

        });
};