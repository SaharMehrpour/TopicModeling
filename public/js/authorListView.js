/**
 * Created by saharmehrpour on 2/12/17.
 */


/**
 * The constructor for the Author List View
 * @param paperAuthors
 * @constructor
 */
function AuthorListView(paperAuthors){
    var self = this;

    self.div = d3.select("#authorList_view");

    self.paperAuthors = paperAuthors;

    self.colors = {categories: '#34888C',topic: '#7CAA2D',
        author: '#CB6318', words: '#962715',
        base: '#ddd', corpus: '#34675C'};

    self.init()

}

/**
 * This function create the list of authors
 */
AuthorListView.prototype.init = function () {

    var self = this;

    self.createAlphabetIndex();

    // unique authors

    var authors = d3.nest().key(function (d) {
        return d
    }).rollup(function (leaves) {
        return leaves.length;
    }).entries(self.paperAuthors.map(function (d) {
        return d["author"];
    }));

    // sort alphabetically

    authors.sort(function (a, b) {
        return d3.ascending(a.key, b.key);
    });

    var items = self.div.select("#author_list")
        .selectAll("li").data(authors);

    items.enter().append("li").text(function (d) {
            return d.key;
        })
        .on("click", function (g) {  // clicking a row in a table will do this
            location.hash = "#/author/" + g.key;
        })
        .style("display",function (g) { // default display
            var name = g.key.split(' ');
            var last = name[name.length - 1];
            if (last.toUpperCase().charAt(0) === 'A')
                return null;
            return "none";
        });

    items.exit().remove(); // Not necessary though!

    // Search Option:

    d3.select("#authorInput")
        .on("keyup", function () {
            var filter = document.getElementById("authorInput").value.toUpperCase();

            // Search box is empty?
            if (filter === "") {

                // reset display of the words to default:
                self.div.select("#author_list")
                    .selectAll("li")
                    .style("display", function (g) {
                        if(g.key.charAt(0).toUpperCase() === 'A')
                            return null;
                        return "none";
                    });

                // set 'A' as the selected character
                self.div.select("#alphabet_list")
                    .selectAll("li")
                    .classed("selected",function (d,i) {
                        return i===0;
                    });
                return
            }

            self.div.select("#author_list")
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
            self.div.select("#alphabet_list")
                .selectAll("li")
                .classed("selected",false);
        })
};

/**
 * This function update the view
 */
AuthorListView.prototype.update = function () {
    var self = this;

    self.div.classed("hidden",false);
};

/**
 * This function creates an alphabet list on top
 * @param words
 */
AuthorListView.prototype.createAlphabetIndex = function () {

    var self = this;

    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    //alphabet.push('Special');

    self.div.select("#alphabet_list")
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
            self.div.select("#alphabet_list")
                .selectAll("li")
                .classed("selected", false);
            d3.select(this)
                .classed("selected", true);

            self.div.select("#author_list")
                .selectAll("li")
                .style("display", function (g) {
                    //if (d == 'Special') {
                    //    if (/[^A-Za-z]/.test(g.key.charAt(0)))
                    //        return null;
                    //    return "none";
                    //}
                    var name = g.key.split(' ');
                    var last = name[name.length - 1];
                    if (last.charAt(0).toUpperCase() === d)
                        return null;
                    return "none";
                });

        });
};