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
    self.authorColDiv = self.div.select("#author_col");

    self.paperAuthors = paperAuthors;

}

/**
 * This function update a view given an author ID
 * @param authorID
 */
AuthorView.prototype.update = function (authorID) {

    var self = this;
    self.div.classed("hidden",false);

    //TODO: fill this out
    self.authorNameHeader.text(authorID);

};
