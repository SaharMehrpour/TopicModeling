/**
 * Created by sahar on 2016-10-26.
 */

/**
 * Constructor for the TopicViewPaper
 */
function TopicViewPapers() {

    var self = this;

    self.div = d3.select("#topic_view_papers");

    self.margins = {
        "top": 20, "bottom": 25, "left": 25, "right": 25
    };

    self.padding = 2;
    self.baseYear = 1980;

    self.init();
}


TopicViewPapers.prototype.init = function() {

    var self = this;

};


TopicViewPapers.prototype.update = function(topicID) {

};
