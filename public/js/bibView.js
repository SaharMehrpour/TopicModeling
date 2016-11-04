/**
 * Created by saharmehrpour on 11/3/16.
 */

/**
 * Constructor for the BibView
 */
function BibView(papers) {

    var self = this;

    self.div = d3.select("#bib_view");
    self.yearNav = d3.select("#year_nav");
    self.paperSection = d3.select("#paper_years_sections");

    self.papers = papers;

    self.init();

}

BibView.prototype.init = function() {

    var self = this;

    self.papers.sort(function (a,b) {
       return d3.ascending(a["Year"],b["Year"]);
    });

    var papersYears = d3.nest().key(function (d) {
        return d["Year"];
    }).entries(self.papers);

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
                location.hash = "#/doc/" + g["Paper Id"];
            });
    });

    // Year Nav bar

    var ul = self.yearNav.append("ul");

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

BibView.prototype.paperInfo = function(paperID) {
    var self = this;

    var s = self.papers
        .filter(function (d) {
            return d["Paper Id"] == paperID;
        });

    if (s.length == 0) return "no entry for '" + paperID + "' in paper.csv dataset";
    if (s.length > 1) return "redundant entry for '" + paperID + "' in paper.csv dataset";

    var title = s[0]["Title"] + ", " + s[0]["Conference"];
    if (s[0]["Session"] !== "")
        title = title + ", " + s[0]["Session"];
    return title + ", " + s[0]["Year"];

};


BibView.prototype.update = function() {

    var self = this;

    self.div.classed("hidden",false);
};
