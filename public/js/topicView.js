/**
 * Created by saharmehrpour on 10/25/16.
 */

/**
 * Constructor for the TopicView
 */
function TopicView(topicWords,topicLabels,topicYears,papers,paperTopics) {

    var self = this;

    self.div = d3.select("#topic_view");

    self.topicWords = topicWords["tw"];
    self.topicLabels = topicLabels;
    self.paperTopics = paperTopics;
    self.papers = papers;

    self.title = self.div.select("#topic_view_title > h1");

    self.topicViewTable = new TopicViewTable(topicWords);
    self.topicViewPapers = new TopicViewPapers(papers, paperTopics);
    self.topicViewGraph = new TopicViewGraph(topicYears, self.topicViewPapers);
}

TopicView.prototype.update = function(topicID) {
    var self = this;

    self.div.classed("hidden",false);

    self.title.text(self.topicLabels[topicID]["label"]);

    self.topicViewTable.update(topicID);
    self.topicViewGraph.update(topicID);
    self.topicViewPapers.update(topicID);
};
