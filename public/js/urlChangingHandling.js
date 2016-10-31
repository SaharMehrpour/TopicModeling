/**
 * Created by sahar on 2016-10-26.
 */

function UrlChangingHandling(menuChart,modelViewList,topicView,docView) {
    self = this;

    self.modelViewList = modelViewList;
    self.topicView = topicView;
    self.menuChart = menuChart;
    self.docView = docView;

}

UrlChangingHandling.prototype.hashChangedHandler = function(hash){

    self.menuChart.update(hash);

    d3.selectAll(".main_view").classed("hidden",true);

    var splittedHash = hash.split("/");

    if(splittedHash[1] === 'model'){
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

    else if(splittedHash[1] === 'doc'){
        if(splittedHash.length < 3){
            console.log("error in parsing the URL");
            return;
        }
        var paperID = splittedHash[2];
        self.docView.update(paperID);
    }
};
