/**
 * This module create a bibliography view for a list of papers
 */
/**
 * @param papers
 * @constructor
 */

function BibView(papers) {

    var self = this;

    self.div = d3.select("#bib_view");
    self.yearNav = d3.select("#year_nav");
    self.paperSection = d3.select("#paper_years_sections");

    self.papers = papers;
    self.papersToShow = papers;

    // sorting papers based on years
    self.papers.sort(function (a, b) {
        return d3.ascending(a["Year"], b["Year"]);
    });

    self.colors = {categories: '#34888C',topic: '#7CAA2D',
        author: '#CB6318', words: '#962715',
        base: '#ddd', corpus: '#34675C'};

    // grouping papers based on years
    var papersYears = d3.nest().key(function (d) {
        return d["Year"];
    }).entries(self.papers);

    // conference selection options
    // adding listeners on check-boxes
    d3.select("#conf_sidebar").selectAll("input")
        .on("change", function () {
            var input = this;
            window.scrollTo(0, 0);

            if (d3.select(input).property("checked")) {
                var dataToAppend = self.papers
                    .filter(function (d) {
                        return d["Conference"] == d3.select(input).attr("value");
                    });
                self.papersToShow = self.papersToShow.concat(dataToAppend);
            }
            else {
                self.papersToShow = self.papersToShow
                    .filter(function (d) {
                        return d["Conference"] != d3.select(input).attr("value");
                    })
            }

            var newPapersYears = d3.nest().key(function (d) {
                return d["Year"];
            }).entries(self.papersToShow);

            newPapersYears.sort(function (a, b) {
                return d3.ascending(a.key, b.key);
            });

            self.populate(newPapersYears);

        });

    self.populate(papersYears);

}

/**
 * This class populate the view by grouped papers
 * @param papersYears
 */
BibView.prototype.populate = function(papersYears) {

    var self = this;

    // Clear existing content in the div
    // useful when repopulating for selected conferences
    self.paperSection.selectAll("div")
        .remove();

    var yearSec = self.paperSection.selectAll("div")
        .data(papersYears);

    var yearsSecEnter = yearSec.enter().append("div")
        .classed("section",true);

    yearsSecEnter.append("h2")
        .attr("id", function (d) {
            return "bib_"+d.key;
        })
        .text(function (d) {
            return d.key;
        });

    yearsSecEnter.each(function (d,i) {
        d3.select(this).selectAll("ul")
            .data(d.values)
            .enter()
            .append("p")
            .text(function (g) {
                return self.paperInfo(g["Paper Id"]);
            })
            .on("click", function (g) {  // clicking a row in a table will do this
                location.hash = "#/paper/" + g["Paper Id"];
            });
    });

    // Year Nav bar
    var ul = self.yearNav.selectAll("ul")
        .data([1])
        .enter()
        .append("ul");

    var items = ul.selectAll("li")
        .data(papersYears)
        .enter()
        .append("li")
        .text(function (d) {
            return d.key;
        })
        .on("click", function (d) {

            var top = document.getElementById("bib_"+d.key).offsetTop; //Getting Y of target element
            window.scrollTo(0, top);
        });


};

/**
 * This function returns information of a paper given an ID
 * @param paperID
 * @returns {string}
 */
BibView.prototype.paperInfo = function(paperID) {
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

/**
 * This function makes the view visible
 */
BibView.prototype.update = function() {

    var self = this;
    self.div.classed("hidden",false);
};
