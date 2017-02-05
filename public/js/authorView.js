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
function AuthorView(paperAuthors, paperTopics, papers) {

    var self = this;
    self.div = d3.select("#author_view");
    self.authorNameHeader = self.div.select("h3");
    self.table = self.div.select("table");
    self.authorColDiv = d3.select("#author_col");

    self.paperAuthors = paperAuthors;
    self.paperTopics = paperTopics;
    self.papers = papers;
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
    self.authorNameHeader.text(authorID);

    // paper list and collaborators list, all topic IDs, header data
    var paperIDs = self.findPaperIDs(authorID);
    var collaborators = self.findCollaborators(authorID, paperIDs);
    var allTopicIDs = self.findTopicIDsForPapers(paperIDs);
    var header_data = ["Papers"].concat(allTopicIDs.map(function (d) {
        return d["key"];
    }));

    var collaborators_list = self.authorColDiv.select("ul")
        .selectAll("li")
        .data(collaborators);


    // TODO: correct style -> cursor:hand;
    collaborators_list.enter()
        .append("li")
        .merge(collaborators_list)
        .on("click", function (d) {
            location.hash = "#/author/" + d["value"];
        })
        .attr("class", "collaborators_list")
        .text(function (d) {
            return d["key"];
        });

    collaborators_list.exit().remove();

    // table of paper-topics
    // header

    self.table
        .select("thead > tr")
        .selectAll("th")
        .remove();

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
        })
        .classed("middle_column", function (d,i) {
            return i != 0;
        });

    header.exit().remove();

    // table body

    self.table
        .select("tbody")
        .selectAll("tr")
        .remove();

    var rows = self.table
        .select("tbody")
        .selectAll("tr")
        .data(paperIDs);

    var cells = rows.enter()
        .append("tr")
        .on("click", function (d) { // on click for a row
            location.hash = "#/doc/" + d;
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
        });

    // Create Pie charts

    var arc = d3.arc()
        .outerRadius(40)
        .innerRadius(0);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d; });

    // Topic Pie Chart
    // TODO: add tooltip based on "key"

    var topicData = allTopicIDs.map(function (d) {
        return d["value"];
    });

    var colorbrewerLimit = d3.max([3,d3.min([9,topicData.length])]);

    var colorTopic = d3.scaleOrdinal()
        .range(colorbrewer.YlGnBu[colorbrewerLimit]);

    var topicPieDiv = d3.select("#topicPie");

    topicPieDiv.selectAll("svg").remove();

    topicPieDiv.selectAll("svg")
        .data(["topic pie"])
        .enter()
        .append("svg");

    // TODO: fix width and height
    var topicPieSVG = topicPieDiv.select("svg")
        .attr("width", "100px")
        .attr("height", "100px")
        .append("g")
        .attr("transform", "translate(50,50)");

    var topicPieGroup = topicPieSVG.selectAll(".arc")
        .data(pie(topicData))
        .enter().append("g")
        .attr("class", "arc");

    topicPieGroup.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) {
            return colorTopic(i);
        });

    // Conferences Pie Chart
    // TODO: add tooltip based on "key"

    var confs = self.papers.filter(function (d) {
        return paperIDs.indexOf(d["Paper Id"]) != -1
    }).map(function (g) {
        return g["Conference"];
    });

    var nest = d3.nest()
        .key(function (d) {
            return d;
        })
        .rollup(function (leaves) {
            return leaves.length
        })
        .entries(confs);

    var confData = nest.map(function (d) {
        return d["value"];
    });

    colorbrewerLimit = d3.max([3,d3.min([9,confData.length])]);

    var colorConf = d3.scaleOrdinal()
        .range(colorbrewer.YlGnBu[colorbrewerLimit]);

    var confPieDiv = d3.select("#confPie");

    confPieDiv.selectAll("svg").remove();

    confPieDiv.selectAll("svg")
        .data(["conference pie"])
        .enter()
        .append("svg");

    // TODO: fix width and height
    var confPieSVG = confPieDiv.select("svg")
        .attr("width", "100px")
        .attr("height", "100px")
        .append("g")
        .attr("transform", "translate(50,50)");

    var confPieGroup = confPieSVG.selectAll(".arc")
        .data(pie(confData))
        .enter().append("g")
        .attr("class", "arc");

    confPieGroup.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) { return colorConf(i); });

};

/**
 * This function returns a list of topic IDs the author has a paper about
 * @param authorID
 * @returns {string[]}
 */
AuthorView.prototype.findPaperIDs = function (authorID) {
    // TODO: author and authorID ?

    var self = this;
    return self.paperAuthors.filter(function (d) {
        return d["author"].indexOf(authorID) != -1; // caution!
    }).map(function (f) {
        return f["paperID"];
    });
};

/**
 * This function returns a list of json: "key": name , "value": id
 * who share a paper with the targeted author
 * @param authorID
 * @returns {*[]}
 */
AuthorView.prototype.findCollaborators = function (authorID, paperIDs) {
    // TODO: author and authorID ?
    // TODO: should return JSON?

    var self = this;

    var collabList = self.paperAuthors.filter(function (d) {
        return (paperIDs.indexOf(d["paperID"]) != -1 && d["author"].indexOf(authorID) == -1); // caution!
    }).map(function (f) {
        return {"name": f["author"], "id": f["author"]};
    }).sort(function (a,b) {
        return d3.ascending(a["name"],b["name"]);
    });

    var nest = d3.nest()
        .key(function (d) {
            return d["name"];
        })
        .rollup(function (leaves) {
            return leaves[0]["id"];
        })
        .entries(collabList);

    return nest;
};

/**
 * This function returns a list of topic IDs: json: "key": topicID, "value":number
 * for a given list of paper IDs
 * @param paperList
 * @returns {string[]}
 */
AuthorView.prototype.findTopicIDsForPapers = function (paperIDList) {
    // TODO: if corpus needed return json

    var self = this;
    var topicIDlist = [];
    var json = [];

    self.paperTopics.filter(function (d) {
        return paperIDList.indexOf(d["paperID"]) != -1;
    }).forEach(function (g) {
        for (var i = 0; i < Object.keys(g).length - 1; i++) {
            if (g[i] != 0) {
                json.push({"topicID": i, "corpus": g[i]});
                topicIDlist.push(i);
            }
        }
    });

    var nest = d3.nest()
        .key(function (d) {
            return d
        }).rollup(function (leaves) {
            return leaves.length;
        }).entries (topicIDlist.sort(function (a,b) {
            return d3.ascending(a,b);
        }));

    return nest;

};

/**
 * This function returns an array of the paper title and a whether a specific topic
 * in the given list exists in the paper or not (e.i. true/false).
 * @param paperID
 * @param topicIDs
 * @returns {*[]}
 */
AuthorView.prototype.findTopicsForPapers = function (paperID, topicIDs) {
    var self = this;
    var paperInfo = self.papers.filter(function (d) {
        return d["Paper Id"] == paperID;
    });

    var list = [{"value": paperInfo[0]["Title"]}];

    var paperTopic = self.paperTopics.filter(function (d) {
        return d["paperID"] == paperID;
    })[0];

    for (var index = 0; index < topicIDs.length; index++) {
        list.push({"value": paperTopic[topicIDs[index]["key"]] != 0});
    }

    return list;
};
