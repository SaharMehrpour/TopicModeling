/**
 * Created by saharmehrpour on 10/22/16.
 */

(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        //Creating instances for each visualization

        var menu = new MenuChart();

        d3.csv("data/Papers.csv", function (error, papers) {
            d3.json("data/Topic_words.json", function (error, topicWords) {
                d3.csv("data/Topic_labels.csv", function (error, topicLabels) {
                    d3.csv("data/Paper_topics.csv", function (error, paperTopics) {
                        d3.csv("data/Topic_years.csv", function (error, topicYears) {

                            var menuChart = new MenuChart();

                            var modelViewList = new ModelViewList(topicWords, topicLabels,
                                paperTopics, topicYears);

                            var topicView = new TopicView(topicWords, topicLabels, topicYears,papers);

                            var urlChangingHandler = new UrlChangingHandling(menuChart, modelViewList, topicView);

                            if ("onhashchange" in window) { // event supported?
                                window.onhashchange = function () {
                                    urlChangingHandler.hashChangedHandler(window.location.hash);
                                }
                            }
                            else { // event not supported:
                                var storedHash = window.location.hash;
                                window.setInterval(function () {
                                    if (window.location.hash != storedHash) {
                                        storedHash = window.location.hash;
                                        urlChangingHandler.hashChangedHandler(storedHash);
                                    }
                                }, 100);
                            }

                            location.hash = "#/model/list"; // initial page

                        });
                    });
                });
            });
        });
    }

    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this;
        if(self.instance == null){
            self.instance = new Main();

            //called only once when the class is initialized
            init();
        }
        return instance;
    };

    Main.getInstance();
})();