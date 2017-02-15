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
function AuthorView(paperAuthors, paperTopics, papers, topicLabels) {

    var self = this;
    self.div = d3.select("#author_view");
    self.authorNameHeader = self.div.select("h3");
    self.table = self.div.select("table");
    self.authorColDiv = d3.select("#author_col");

    self.paperAuthors = paperAuthors;
    self.paperTopics = paperTopics;
    self.papers = papers;
    self.topicLabels = topicLabels;

    self.tooltip = d3.select(".tooltip");
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
        .classed("rotate", function (d,i) {
            return i != 0;
        })
        .classed("first_column", function (d, i) {
            return (i == 0);
        })
        .classed("middle_column", function (d,i) {
            return i != 0;
        })
        .on("mouseover",function (d,i) {
            if(i==0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return self.topicLabels[d]["label"];
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d,i) {
            if(i==0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        .on("click", function (d,i) {
            if (i!=0)
                location.hash = "#/topic/" + d;
        })
        .append("div")
        .append("span")
        .merge(header)
        .text(function (d,i) {
            if (i==0) return d;
            var label = self.topicLabels[d]["label"];
            if(label.length > 16)
                return label.slice(0,12) + '...';
            return label;
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
                return g["title"];
            if (g["topicValue"]!=0)
                return "✓";
        })
        .on("mouseover",function (g,i) {
            if(i==0) return;
            if (g["topicValue"]==0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return self.topicLabels[g["topicID"]]["label"]
                    + '</br>' + d3.format(".3n")(g["topicValue"]*100) + "%";
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(g,i) {
            if(i==0) return;
            if (g["topicValue"]==0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

    // Create Pie charts

    var arc = d3.arc()
        .outerRadius(40)
        .innerRadius(0);

    // Topic Pie Chart

    var pieTopics = d3.pie()
        .sort(null)
        .value(function(d) { return d["value"]; });

    var colorbrewerLimit = d3.max([3,d3.min([9,allTopicIDs.length])]);

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
        .data(pieTopics(allTopicIDs))
        .enter().append("g")
        .attr("class", "arc");

    topicPieGroup.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) {
            return colorTopic(i);
        })
        .on("mouseover",function (d) {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return self.topicLabels[d["data"]["key"]]["label"];
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        .on("click", function (d) {
            location.hash = "#/topic/" + d["data"]["key"];
        });

    // Conferences Pie Chart
    // TODO: add tooltip based on "key"

    var pieConf = d3.pie()
        .sort(null)
        .value(function(d) { return d["value"]; });

    var confs = self.papers.filter(function (d) {
        return paperIDs.indexOf(d["Paper Id"]) != -1
    }).map(function (g) {
        return g["Conference"];
    });

    var confData = d3.nest()
        .key(function (d) {
            return d;
        })
        .rollup(function (leaves) {
            return leaves.length
        })
        .entries(confs);

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
        .data(pieConf(confData))
        .enter().append("g")
        .attr("class", "arc");

    confPieGroup.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) { return colorConf(i); })
        .on("mouseover",function (d) {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return d["data"]["key"];
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

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
 * changed to list of corpus.
 * @param paperID
 * @param topicIDs
 * @returns {*[]}
 */
AuthorView.prototype.findTopicsForPapers = function (paperID, topicIDs) {
    var self = this;
    var paperInfo = self.papers.filter(function (d) {
        return d["Paper Id"] == paperID;
    });

    var list = [{"title": paperInfo[0]["Title"]}];

    var paperTopic = self.paperTopics.filter(function (d) {
        return d["paperID"] == paperID;
    })[0];

    for (var index = 0; index < topicIDs.length; index++) {
        list.push({"topicValue": paperTopic[topicIDs[index]["key"]], "topicID" : topicIDs[index]["key"]});// != 0});
    }

    return list;
};
