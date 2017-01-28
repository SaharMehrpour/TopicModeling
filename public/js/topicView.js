/**
 * This module creates and handles parts of a topic view
 * consisting of a list of words, a time-line graph, and a list of papers
 */
/**
 * @param topicWords
 * @param topicLabels
 * @param topicYears
 * @param papers
 * @param paperTopics
 * @constructor
 */
function TopicView(topicWords,topicLabels,topicYears,papers,paperTopics) {

    var self = this;

    self.div = d3.select("#topic_view");

    self.topicWords = topicWords["tw"];
    self.topicLabels = topicLabels;
    self.paperTopics = paperTopics;
    self.papers = papers;

    self.title = self.div.select("#topic_view_title > h3");

    self.topicViewWords = new TopicViewWords(topicWords);
    self.topicViewPapers = new TopicViewPapers(papers, paperTopics);
    self.topicViewGraph = new TopicViewGraph(topicYears, self.topicViewPapers);
}

/**
 * this function updates the view given a topic ID
 * @param topicID
 */
TopicView.prototype.update = function(topicID) {
    var self = this;

    self.div.classed("hidden",false);

    self.title.text(self.topicLabels[topicID]["label"]);

    self.topicViewWords.update(topicID);
    self.topicViewGraph.update(topicID);
    self.topicViewPapers.update(topicID);
};
