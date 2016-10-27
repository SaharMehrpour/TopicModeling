/**
 * Created by saharmehrpour on 10/22/16.
 */

/**
 * Constructor for the MenuChart
 */
function MenuChart(){

    var self = this;
    self.init();
};

MenuChart.prototype.init = function() {
    var self = this;

    self.mainNav = d3.select("#main_nav");
    self.modelNav = d3.select("#model_nav");

    //self.mainNav.select("#nav_model").classed("active",true);
    //self.modelNav.select("#nav_model_list").classed("active",true);
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
