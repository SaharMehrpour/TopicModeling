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

    self.svg = d3.select("#author_topic_list")
        .append("svg")
        .attr("id", "author_topic_svg");
    var width = parseInt(window.innerWidth) * 0.7 * 0.8;
    self.dimensions = {row_height: 150, row_distance: 50, row_width: width, padding_top: 50, padding_right: 50};
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

    // paper list and collaborators list, all topic IDs
    var paperIDs = self.paperAuthors.filter(function (d) {
        return d["author"].indexOf(authorID) != -1; // caution!
        })
        .map(function (f) {
            return f["paperID"];
        });
    var collaborators = self.findCollaborators(authorID, paperIDs);
    var allTopicIDs = self.findTopicIDsForPapers(paperIDs);

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

    self.drawTopicDiagram(authorID, allTopicIDs);

    self.listAllPapers(authorID);

    // Create Pie charts

    var arc = d3.arc()
        .outerRadius(40)
        .innerRadius(0);

    // Conferences Pie Chart

    var pieConf = d3.pie()
        .sort(null)
        .value(function (d) {
            return d["value"];
        });

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

    var colorbrewerLimit = d3.max([3, d3.min([9, confData.length])]);

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
        .style("fill", function (d, i) {
            return colorConf(i);
        })
        .on("mouseover", function (d) { // TODO: set a timeout
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return d["data"]["key"];
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
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

    return d3.nest()
        .key(function (d) {
            return d
        }).rollup(function (leaves) {
            return leaves.length;
        }).entries (topicIDlist.sort(function (a,b) {
            return d3.ascending(a,b);
        }));

};

/**
 * This function creates the topic visualization on the top
 * @param authorID
 * @param allTopicIDs
 */
AuthorView.prototype.drawTopicDiagram = function (authorID, allTopicIDs) {

    var self = this;

    allTopicIDs.sort(function (a,b) {
        return d3.descending(a["value"],b["value"])
    });

    // fix the size of svg

    self.svg.style("height", function () {
        return self.dimensions.row_height + self.dimensions.row_distance;
    });

    // find the max number of paper per topic

    var maxNumber = d3.max(allTopicIDs, function (topic) {
        return topic["value"];
    });

    //scales

    var yScale = d3.scaleLinear()
        .domain([0, maxNumber])  // min and max number of occurrence
        .range([0, self.dimensions.row_height - self.dimensions.padding_top]);

    var xScale = d3.scaleLinear()
        .domain([0, allTopicIDs.length]) // number of topics for the author
        .range([0, self.dimensions.row_width - self.dimensions.padding_right]);

    // line function

    var topicLine = d3.area()
        .x(function (g, i) {
            return xScale(i);
        })
        .y0(self.dimensions.row_height)
        .y1(function (g) {
            return self.dimensions.row_height - yScale(+g["value"]);
        });

    // append a group for each topic

    self.svg.selectAll("g")
        .data([1])
        .enter()
        .append("g")
        .attr("transform", function () {
            return "translate(10," + self.dimensions.row_distance + ")";
        })
        .append("path");

    self.svg.select("path")
        .attr("d", function () {
            return topicLine(allTopicIDs);
        });

    // append circles corresponding to words of a topic to each group

    var circles = self.svg.select("g")
        .selectAll("circle")
        .data(allTopicIDs);

    circles.exit().remove();

    circles.enter()
        .append("circle")
        .merge(circles)
        .attr("cx", function (g, i) {
            return xScale(i);
        })
        .attr("cy", function (g) {
            return self.dimensions.row_height - yScale(+g["value"])
        })
        .attr("r", 5)
        .attr("class","")
        .on("click", function (g) {
            var selected = !d3.select(this).classed("selected_topic");
            d3.select(this).classed("selected_topic", selected);

            // find selected topics

            var idList = [];
            var selectedList = [];

            self.svg.selectAll("circle")
                .each(function (g) {
                    idList.push(g["key"]);
                    selectedList.push(d3.select(this).classed("selected_topic"));
                });

            d3.select("#author_paper_list")
                .selectAll("li")
                .each(function (d) { // for each paper
                    for (var index = 0; index < idList.length; index++) { // for each topic
                        // if the topic is selected and does not exist in the paper
                        if (selectedList[index] && d["topics"][idList[index]] == 0) {
                            d3.select(this).style("display", "none");
                            return;
                        }
                    }
                    // all selected topics exist
                    d3.select(this).style("display", null);
                });
        });

    // append texts above circles

    var texts = self.svg.select("g")
        .selectAll(".topic_text")
        .data(allTopicIDs);

    texts.exit().remove();

    texts.enter()
        .append("text")
        .merge(texts)
        .attr("x", function (g, i) {
            return xScale(i);
        })
        .attr("y", function (g) {
            return self.dimensions.row_height - yScale(+g["value"])
        })
        .html(function (g) {
            var label = self.topicLabels[g["key"]]["label"];
            if(label.length > 16)
                return label.slice(0,12) + '...';
            return label;
        })
        .attr("transform", function (g, i) {
            return "translate(2,-7) " +
                "rotate(310," + xScale(i) + "," + (self.dimensions.row_height - yScale(+g["value"])) + ")";
        })
        .attr("class", "topic_text ")
        .on("mouseover",function (g) {
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return self.topicLabels[g["key"]]["label"];
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
        .on("click", function (g) {
            location.hash = "#/topic/" + g["key"];
        });
};


/**
 * List all the papers of the author
 * @param authorID
 */
AuthorView.prototype.listAllPapers = function (authorID) {

    var self = this;

    var papers = self.paperAuthors.filter(function (d) {
        return d["author"].indexOf(authorID) != -1; // caution!
    }).map(function (p) {
        return {
            "paperID": p["paperID"],
            "title": self.papers.filter(function (d) {
                return d["Paper Id"] == p["paperID"]
            })[0]["Title"],
            "topics": self.paperTopics.filter(function (d) {
                return d["paperID"] == p["paperID"]
            })[0]
        };
    });

    var listItems = d3.select("#author_paper_list")
        .selectAll("li")
        .data(papers);

    listItems.exit().remove();

    listItems.enter()
        .append("li")
        .merge(listItems)
        .text(function (d) {
            return d["title"];
        })
        .on("click", function (d) {
            location.hash = "#/paper/" + d["paperID"];
        })
        .on("mouseover", function (d) {

            self.svg.selectAll(".topic_text")
                .each(function (g) {
                   if(d["topics"][g["key"]]>0)
                       d3.select(this).classed("topic_of_paper",true);
                });
        })
        .on("mouseout", function () {
            self.svg.selectAll(".topic_text")
                .classed("topic_of_paper",false);
        });
};