/**
 * This module handles changes in Hash address
 */
/**
 * @param menuChart
 * @param modelViewList
 * @param topicView
 * @param paperView
 * @param bibView
 * @param wordViewIndex
 * @param authorView
 * @constructor
 */
function UrlChangingHandling(menuChart,modelViewList,topicView,paperView,bibView
    ,wordViewIndex,authorView,authorListView) {

    var self = this;

    self.modelViewList = modelViewList;
    self.topicView = topicView;
    self.menuChart = menuChart;
    self.paperView = paperView;
    self.bibView = bibView;
    self.wordViewIndex = wordViewIndex;
    self.authorView = authorView;
    self.authorListView = authorListView;

}

/**
 * This class updates the view based on changes in Hash address
 * @param hash
 */
UrlChangingHandling.prototype.hashChangedHandler = function(hash){

    var self = this;

    document.body.scrollTop = document.documentElement.scrollTop = 0;

    self.menuChart.update(hash);

    d3.selectAll(".main_view").classed("hidden",true);
    d3.select("#model_nav").classed("hidden",true);

    var splittedHash = hash.split("/");

    if(splittedHash[1] === 'secPriveMeta') {

        d3.select("#sec_prive_meta").classed('hidden', false);
    }
    else if(splittedHash[1] === 'model'){
        if(splittedHash.length < 3){
            self.modelViewList.update();
            return;
        }

        switch(splittedHash[2]){
            case 'list':
                self.modelViewList.update();
                break;
            default:
                console.log("error in parsing the URL");
                return;
        }
    }
    else if(splittedHash[1] === 'topic'){
        if(splittedHash.length < 3){
            console.log("error in parsing the URL");
            return;
        }
        var topicID = +splittedHash[2];
        self.topicView.update(topicID);
    }

    else if(splittedHash[1] === 'paper'){
        if(splittedHash.length < 3){
            console.log("error in parsing the URL");
            d3.select("#temp_view").html("Please select a paper from the Paper List.")
                .classed("hidden",false);
            return;
        }
        var paperID = splittedHash[2];
        self.paperView.update(paperID);
    }

    else if(splittedHash[1] === 'bib'){
        var paperID = splittedHash[2];
        self.bibView.update(paperID);
    }

    else if(splittedHash[1] === 'wordIndex'){
        self.wordViewIndex.update();
    }

    else if(splittedHash[1] === 'files'){
        d3.select("#file_view").classed('hidden', false);
    }

    else if(splittedHash[1] === 'author'){
        if(splittedHash.length < 3){
            console.log("error in parsing the URL");
            d3.select("#temp_view").html("Please select an author from the Author List.")
                .classed("hidden",false);
            return;
        }
        var authorID = splittedHash[2];
        self.authorView.update(authorID);
    }

    else if(splittedHash[1] === 'authorList'){
        self.authorListView.update();
    }
};
