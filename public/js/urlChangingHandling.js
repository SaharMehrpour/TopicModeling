/**
 * This module handles changes in Hash address
 */
/**
 * @param menuChart
 * @param modelViewList
 * @param topicView
 * @param paperView
 * @param bibView
 * @param wordIndexView
 * @param authorView
 * @constructor
 */
function UrlChangingHandling(menuChart,modelViewList,topicView,paperView,bibView
    ,wordIndexView,authorView,authorListView,wordView) {

    var self = this;

    self.modelViewList = modelViewList;
    self.topicView = topicView;
    self.menuChart = menuChart;
    self.paperView = paperView;
    self.bibView = bibView;
    self.wordIndexView = wordIndexView;
    self.authorView = authorView;
    self.authorListView = authorListView;
    self.wordView = wordView;

}

/**
 * This class updates the view based on changes in Hash address
 * @param hash
 */
UrlChangingHandling.prototype.hashChangedHandler = function(hash){

    var self = this;

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    self.tooltip = d3.select(".tooltip").style("opacity", 0);

    self.menuChart.update(hash);

    d3.selectAll(".main_view").classed("hidden",true);
    d3.select("#model_nav").classed("hidden",true);

    var splittedHash = hash.split("/");

    switch(splittedHash[1]){
        case 'secPriveMeta':
            d3.select("#sec_prive_meta").classed('hidden', false);
            break;

        case 'model':
            self.modelViewList.update();
            break;

        case 'bib':
            self.bibView.update();
            break;

        case 'wordIndex':
            self.wordIndexView.update();
            break;

        case 'files':
            d3.select("#file_view").classed('hidden', false);
            break;

        case 'authorList':
            self.authorListView.update();
            break;

        case 'topic':
            if(splittedHash.length < 3){
                console.log("error in parsing the URL");
                return;
            }
            self.topicView.update(+splittedHash[2]); // topicID
            break;

        case 'paper':
            if(splittedHash.length < 3){
                console.log("error in parsing the URL");
                d3.select("#temp_view").html("Please select a paper from the Paper List.")
                    .classed("hidden",false);
                return;
            }
            self.paperView.update(splittedHash[2]); // paperID
            break;

        case 'author':
            if(splittedHash.length < 3){
                console.log("error in parsing the URL");
                d3.select("#temp_view").html("Please select an author from the Author List.")
                    .classed("hidden",false);
                return;
            }
            self.authorView.update(splittedHash[2]); //authorID
            break;

        case 'word':
            if(splittedHash.length < 3){
                console.log("error in parsing the URL");
                d3.select("#temp_view").html("Please select a paper from the Paper List.")
                    .classed("hidden",false);
                return;
            }
            self.wordView.update(splittedHash[2]); //paperID
            break;

    }

};
