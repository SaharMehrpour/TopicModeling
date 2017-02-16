/**
 * Created by saharmehrpour on 2/15/17.
 */

/**
 * This module create a view for visualizing information of a word
 */

/**
 * Constructor for creating a Word View
 * @param topicLabels
 * @param topicWords
 * @constructor
 */
function WordView(topicLabels, topicWords) {

    var self = this;

    self.topicLabels = topicLabels;
    self.topicWords = topicWords["tw"];

    self.div = d3.select("#word_view");

    self.svg = self.div.append("div")
        .append("svg")
        .attr("id", "word_svg");
        //.attr("viewBox","0 0 700 1000"); // something like a zoom

    var width = parseInt(window.innerWidth)*0.7;

    self.dimensions = {row_height : 100 , row_distance : 70 , row_width : width};
    self.tooltip = d3.select(".tooltip");
}

/**
 * Update the view based on a given word/word ID
 * @param wordID
 */
WordView.prototype.update = function(wordID) {

    var self = this;

    self.div.classed("hidden", false);

    self.div.select("#word_header").html(wordID); // word view header

    var topics = self.findTopicsForWord(wordID);

    // fix the size of svg

    self.svg.style("height", function () {
        return (topics.length + 1 ) * (self.dimensions.row_height + self.dimensions.row_distance);
    });

    // find the max weight

    var maxWeight = d3.max(topics, function (topic) {
        return d3.max(topic["weights"])
    });

    //scales

    var yScale = d3.scaleLinear()
        .domain([0, maxWeight])  // min and max word weights
        .range([0, self.dimensions.row_height]);

    var xScale = d3.scaleLinear()
        .domain([0, 50]) // number of words in each topic
        .range([0, self.dimensions.row_width - 20]);


    // line function

    var topicWordLine = d3.area()
        .x(function (g, i) {
            return xScale(i);
        })
        .y0(self.dimensions.row_height)
        .y1(function (g) {
            return self.dimensions.row_height - yScale(+g["weight"]);
        });

    // append a group for each topic

    var groups = self.svg.selectAll("g")
        .data(topics);

    groups.exit().remove();

    groups.enter().append("g")
        .merge(groups);

    self.svg.selectAll("g")
        .attr("transform", function (d, i) {
            //if (i == 0) return "translate(10," + self.dimensions.row_distance + ")";
            return "translate(10," + (i * self.dimensions.row_height + (i + 1) * self.dimensions.row_distance) + ")"
        });

    // append a path to each group

    var paths = self.svg.selectAll("g")
        .data(topics)
        .selectAll("path")
        .data(function (d) {
            return [d];
        });

    paths.exit().remove();

    paths.enter()
        .append("path")
        .merge(paths)
        .attr("d", function (g) {
            return topicWordLine(g["words_weights"]);
        });

    // append circles corresponding to words of a topic to each group

    var circles = self.svg.selectAll("g")
        .data(topics)
        .selectAll("circle")
        .data(function (d) {
            return d["words_weights"];
        });

    circles.exit().remove();

    circles.enter()
        .append("circle")
        .merge(circles)
        .attr("cx", function (g, i) {
            return xScale(i);
        })
        .attr("cy", function (g) {
            return self.dimensions.row_height - yScale(+g["weight"])
        })
        .classed("word_circle", function (g) {
            return g["word"] == wordID;
        })
        .on("mouseover", function (g, i) {
            if (g["topicValue"] == 0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            self.tooltip.html(function () {
                return g["word"] + " (word " + (i + 1) + ")";
            })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (g, i) {
            if (i == 0) return;
            if (g["topicValue"] == 0) return;
            self.tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        .on("click", function (g) {
            location.hash = "#/word/" + g["word"];
        });

    // append a text for topic label for each group

    var topicTitle = self.svg.selectAll("g")
        .data(topics)
        .selectAll("text")
        .data(function (d) {
            return [d];
        });

    topicTitle.exit().remove();

    topicTitle.enter()
        .append("text")
        .merge(topicTitle)
        .text(function (g) {
            return g["topic_label"];
        })
        .attr("x", 0)
        .attr("y", function () {
            return self.dimensions.row_height + 20;
        })
        .attr("class", "topic_title")
        .on("click", function (g) {
            location.hash = "#/topic/" + g["topicID"];
        });
        /*
        .on("mouseover", function () {
            d3.select(this.parentNode)
                .selectAll(".word")
                .style("opacity", 1);
        })
        .on("mouseout", function () {
            d3.select(this.parentNode)
                .selectAll(".word")
                .style("opacity", 0);
        });
        */

    // append texts above circles

    var texts = self.svg.selectAll("g")
        .data(topics)
        .selectAll(".word")
        .data(function (d) {
            return d["words_weights"];
        });

    texts.exit().remove();

    texts.enter()
        .append("text")
        .merge(texts)
        .attr("x", function (g, i) {
            return xScale(i);
        })
        .attr("y", function (g) {
            return self.dimensions.row_height - yScale(+g["weight"])
        })
        .html(function (g) {
            return g["word"];
        })
        .attr("transform", function (g, i) {
            return "translate(2,-5) " +
                "rotate(310," + xScale(i) + "," + (self.dimensions.row_height - yScale(+g["weight"])) + ")";
        })
        .attr("class", "word ")
        .classed("word_circle", function (g) {
            return g["word"] == wordID;
        })
        .on("click", function (g) {
            location.hash = "#/word/" + g["word"];
        });
        //.style("opacity", 0); // initially they are invisible

};

/**
 * return a list of json objects:
 * topicID (==id): the id of the topic containing the word
 * topic_label: label of that topic
 * word_rank: rank of the word in the topic
 * words: list of all words
 * weights: weight of all words
 * weights_words: array of {"word":word, "weight":weight} used in drawing!
 * @param wordID
 * @returns {*|Array.<T>}
 */
WordView.prototype.findTopicsForWord = function(wordID) {

    var self = this;

    var topics = self.topicWords.filter(function (d) {
        return d["words"].indexOf(wordID) > -1
    });

    // add more info
    topics.forEach(function (d) {
        d["topicID"] = d["id"];
        d["topic_label"] = self.topicLabels.filter(function (g) {
            return g["index"] == d["id"];
        })[0]["label"];
        d["word_rank"] = d["words"].indexOf(wordID);
        d["words_weights"] = [];
        for (var index = 0; index < d["words"].length; index++)
            d["words_weights"].push({"word": d["words"][index], "weight": d["weights"][index]})
    });

    // sort topics based on the rank of the word
    topics.sort(function (a, b) {
        return d3.ascending(a["word_rank"], b["word_rank"]);
    });

    return topics;

};