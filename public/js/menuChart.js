/**
 * This module creates and handles the menu on top of the page
 */
/**
 * @param topicLabels used for topic list
 * @constructor
 */
function MenuChart(topicLabels) {

    var self = this;

    self.topicLabels = topicLabels;

    d3.select("#view_container")
        .on("click", function () {
            self.hideDropDown();
            //document.getElementById("myInput").value = "";  // not working
        });
/*
    d3.select("#myInput")
        .on("keyup", function () {
            var filter = document.getElementById("myInput").value.toUpperCase();
            var items = d3.select("#topic_dropdown_div")
                .selectAll("a")
                .each(function (d,i) {
                    if(d["label"].toUpperCase().indexOf(filter) > -1) {
                        d3.select(this).classed("show","true");  // not working
                    }
                    else {
                        d3.select(this).classed("show","false")
                    }
                })
        })
*/
}

/**
 * This function create the menu and populating the topic list
 */
MenuChart.prototype.init = function() {
    var self = this;

    self.mainNav = d3.select("#main_nav");
    //self.modelNav = d3.select("#model_nav");

    var topicDropDownDiv = self.mainNav.select("#topic_dropdown_div");

    // populate the topic list

    var dropDownItems = topicDropDownDiv
        .selectAll("a")
        .data(self.topicLabels)
        .enter()
        .append("a")
        .attr("href", function (d) {
            return "#/topic/" + d["index"];
        })
        .text(function (d) {
            return d["label"];
        });

    // on click event
    var topicButton = self.mainNav.select(".dropbtn")
        .on("click", function () {
            if (d3.select(this).classed('open')) {
                self.hideDropDown()
            }
            else {
                self.showDropDown()
            }
        });

    var topicItems = d3.select("#topic_dropdown_div").selectAll("a")
        .on("click", function () {
            self.hideDropDown();
        });

    self.mainNav.selectAll("ul>li>a")
        .on("mouseover", function () {
            if (!d3.select(this).classed("dropbtn"))
                self.hideDropDown();
        });
    // TODO: hideDropDown when click somewhere
};

/**
 * This function update the class of the item of menu based on hash
 * @param hash
 */
MenuChart.prototype.update = function(hash) {
    var self = this;

    var splittedHash = hash.split("/");

    self.mainNav.selectAll(".active").classed("active", false);
    //self.modelNav.selectAll(".active").classed("active", false);

    self.mainNav.select("#nav_" + splittedHash[1]).classed("active", true);
/*
    if (splittedHash.length > 2) {
        self.modelNav.select("#nav_" + splittedHash[1] + "_" + splittedHash[2]).classed("active", true);
    }
    else {
        self.modelNav.select("#nav_" + splittedHash[1] + "_list").classed("active", true);
    }
*/
};

/**
 * hide the drop-down menu for the topic list
 */
MenuChart.prototype.hideDropDown = function () {

    var self = this;

    self.mainNav.select(".dropbtn").classed('open',false);
    d3.select("#topic_dropdown_div").classed("show",false);
    d3.select("#topic_dropdown_div").selectAll("a").classed("show",false);
};

/**
 * display the drop-down menu for the topic list
 */
MenuChart.prototype.showDropDown = function () {

    var self = this;

    self.mainNav.select(".dropbtn").classed('open',true);
    d3.select("#topic_dropdown_div").classed("show",true);
    d3.select("#topic_dropdown_div").selectAll("a").classed("show",true);
};
