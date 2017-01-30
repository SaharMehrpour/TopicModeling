/**
 * Created by sahar on 2017-01-27.
 */
/**
 * This module creates a view for visualizing information
 * of an author
 */

/**
 * @param paperAuthors
 * @constructor
 */
function AuthorView(paperAuthors) {

    var self = this;
    self.div = d3.select("#author_view");
    self.authorNameHeader = self.div.select("h3");
    self.table = self.div.select("table");
    self.authorColDiv = d3.select("#author_col");

    self.paperAuthors = paperAuthors;

}

/**
 * This function update a view given an author ID
 * @param authorID
 */
AuthorView.prototype.update = function (authorID) {

    var self = this;
    self.div.classed("hidden", false);

    // header
    // TODO: find the name an author given authorID
    self.authorNameHeader.text("Name of the author based on authorID: " + authorID);

    // paper list and collaborators list, all topic IDs, header data
    var papers = self.findPaperIDs(authorID);
    var collaborators = self.findCollaborators(authorID);
    var allTopicIDs = self.findTopicIDsForPapers(papers);
    var header_data = ["Papers"].concat(allTopicIDs);

    var collaborators_list = self.authorColDiv.select("ul")
        .selectAll("li")
        .data(collaborators);


    // TODO: correct style -> cursor:hand;
    collaborators_list.enter()
        .append("li")
        .merge(collaborators_list)
        .on("click", function (d) {
            location.hash = "#/author/" + d["id"];
        })
        .attr("class", "collaborators_list")
        .text(function (d) {
            return d["name"];
        });

    collaborators_list.exit().remove();

    // table of paper-topics
    // header
    var header = self.table
        .select("thead > tr")
        .selectAll("th");

    header.data(header_data)
        .enter()
        .append("th")
        .merge(header)
        .text(function (d) {
            return d;
        })
        .classed("first_column", function (d, i) {
            return (i == 0);
        });

    header.exit().remove();

    // body

    var rows = self.table
        .select("tbody")
        .selectAll("tr")
        .data(papers);

    var cells = rows.enter()
        .append("tr")
        .on("click", function (d) { // on click for a row
            location.hash = "#/paper/" + d;
        })
        .selectAll("td")
        .data(function (d) {
            return self.findTopicsForPapers(d, allTopicIDs);
        });

    cells.enter()
        .append("td")
        .merge(cells)
        .attr("class", function (g, i) {
            if (i == 0)
                return "first_column";
            return "middle_column";
        })
        .html(function (g, i) {
            if (i == 0)
                return g["value"];
            if (g["value"])
                return "✓";
        })
};

/**
 * This function returns a list of topic IDs the author has a paper about
 * @param authorID
 * @returns {string[]}
 */
AuthorView.prototype.findPaperIDs = function (authorID) {
    // TODO: find all paper IDs for the author
    var papers = ["paperID 1", "paperID 2", "paperID 3"];
    return papers;
};

/**
 * This function returns a list of authors who share a paper with the targeted author
 * @param authorID
 * @returns {*[]}
 */
AuthorView.prototype.findCollaborators = function (authorID) {
    // TODO: find all authors share a paper with the author
    var list_of_collab = [{"name": "co-author name 1", "id": "collabID1"},
        {"name": "co-author name 2", "id": "collabID2"},
        {"name": "co-author name 3", "id": "collabID3"}];
    return list_of_collab;
};

/**
 * This function returns a list of topic IDs for a given list of papers
 * @param paperList
 * @returns {string[]}
 */
AuthorView.prototype.findTopicIDsForPapers = function (paperList) {
    // TODO: only merge the list of topics for papers
    var list_of_topics = ["topicID1", "topicID2", "topicID3", "topicID4", "topicID5", "topicID6"];
    return list_of_topics;
};

/**
 * This function returns an array of the paper title and a whether a specific topic
 * in the given list exists in the paper or not (e.i. true/false).
 * @param paperID
 * @param topicIDs
 * @returns {*[]}
 */
AuthorView.prototype.findTopicsForPapers = function (paperID, topicIDs) {
    // TODO: find a title of the paper given 'paperID'
    var paper = "get paper title from the paperID: " + paperID;

    var list = [{"value": paper}];
    for (var id in topicIDs) {
        // TODO: for paperID the topic with 'id' exists?
        list.push({"value" : true});
    }
    return list;
};
