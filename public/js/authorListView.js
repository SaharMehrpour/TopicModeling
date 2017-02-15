/**
 * Created by saharmehrpour on 2/12/17.
 */


function AuthorListView(paperAuthors){
    var self = this;

    self.div = d3.select("#authorList_view");

    self.paperAuthors = paperAuthors;

    self.init()

}

AuthorListView.prototype.init = function () {

    var self = this;

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
    }).on("click", function (g) {  // clicking a row in a table will do this
        location.hash = "#/author/" + g.key;
    }).style("display","none");

    items.exit().remove(); // Not necessary though!

    // Search Option:

    d3.select("#authorInput")
        .on("keyup", function () {
            var filter = document.getElementById("authorInput").value.toUpperCase();
            if(filter == "") {
                self.div.selectAll("li").style("display", "none");
                return
            }
            self.div.selectAll("li")
                .each(function (d) {
                    if(d["key"].toUpperCase().indexOf(filter) > -1) {
                        d3.select(this).style("display",null);
                    }
                    else {
                        d3.select(this).style("display","none")
                    }
                })
        })
};

AuthorListView.prototype.update = function () {
    var self = this;

    self.div.classed("hidden",false);
};