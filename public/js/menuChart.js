/**
 * Created by saharmehrpour on 10/22/16.
 */

/**
 * Constructor for the MenuChart
 */
function MenuChart(topicLabels) {

    var self = this;

    self.topicLabels = topicLabels;

}

MenuChart.prototype.init = function() {
    var self = this;

    self.mainNav = d3.select("#main_nav");
    self.modelNav = d3.select("#model_nav");

    var topicDropDownDiv = self.mainNav.select("#topic_dropdown_div");

    // populate the menu

    var dropDownItems = topicDropDownDiv
        .selectAll("a")
        .data(self.topicLabels)
        .enter()
        .append("a")
        .attr("href", function (d) {
            return "#/topic/" + (+d["index"] - 1);
        })
        .text(function (d) {
            return d["label"];
        });

    // on click event

    var topicButton = self.mainNav.select(".dropbtn")
        .on("click", function () {
            var button = d3.select(this);
            if (button.classed('open')){
                button.classed('open',false);
                d3.select("#topic_dropdown_div").classed("show",false);
                d3.select("#topic_dropdown_div").selectAll("a").classed("show",false);
            }
            else {
                button.classed('open',true);
                d3.select("#topic_dropdown_div").classed("show",true);
                d3.select("#topic_dropdown_div").selectAll("a").classed("show",true);
            }
        });

    var topicItems = d3.select("#topic_dropdown_div").selectAll("a")
        .on("click", function () {
            self.mainNav.select(".dropbtn").classed('open',false);
            d3.select("#topic_dropdown_div").classed("show",false);
            d3.select("#topic_dropdown_div").selectAll("a").classed("show",false);
        });


};


MenuChart.prototype.update = function(hash) {
    var self = this;

    var splittedHash = hash.split("/");

    self.mainNav.selectAll(".active").classed("active", false);
    self.modelNav.selectAll(".active").classed("active", false);

    self.mainNav.select("#nav_" + splittedHash[1]).classed("active", true);
    if (splittedHash.length > 2) {
        self.modelNav.select("#nav_" + splittedHash[1] + "_" + splittedHash[2]).classed("active", true);
    }
    else {
        self.modelNav.select("#nav_" + splittedHash[1] + "_list").classed("active", true);
    }

};
