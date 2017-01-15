/**
 * Constructor for the BibView
 */
function BibView(papers) {

    var self = this;

    self.div = d3.select("#bib_view");
    self.yearNav = d3.select("#year_nav");
    self.paperSection = d3.select("#paper_years_sections");

    self.papers = papers;
    self.papersToShow = papers;

    self.papers.sort(function (a, b) {
        return d3.ascending(a["Year"], b["Year"]);
    });

    var papersYears = d3.nest().key(function (d) {
        return d["Year"];
    }).entries(self.papers);

    d3.select("#conf_sidebar").selectAll("input")
        .on("change", function () {
            var input = this;
            window.scrollTo(0, 0);

            console.log(d3.select(input).property("checked"));

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

            console.log(self.papersToShow.length);

            self.populate(newPapersYears);

        });

    self.populate(papersYears);

}

BibView.prototype.populate = function(papersYears) {

    var self = this;

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
                location.hash = "#/doc/" + g["Paper Id"];
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


BibView.prototype.update = function() {

    var self = this;

    self.div.classed("hidden",false);
};

BibView.prototype.updateConference = function(conf) {

    var self = this;

    self.paperSection.selectAll("div").remove();

    var conf_paper = self.papers.filter(function (d) {
       return d["Conference"] == conf
    });

    conf_paper.sort(function (a,b) {
        return d3.ascending(a["Year"],b["Year"]);
    });

    var papersYears = d3.nest().key(function (d) {
        return d["Year"];
    }).entries(conf_paper);

    self.populate(papersYears);
};
