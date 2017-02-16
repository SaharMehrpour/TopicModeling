(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        //Creating instances for each view

        d3.csv("data/Papers.csv", function (error, papers) {
            d3.json("data/Topic_words.json", function (error, topicWords) {
                d3.csv("data/Topic_labels.csv", function (error, topicLabels) {
                    d3.csv("data/Paper_topics.csv", function (error, paperTopics) {
                        d3.csv("data/Topic_years.csv", function (error, topicYears) {
                            d3.csv("data/paper_authors.csv", function (error, paperAuthors) {

                                var menuChart = new MenuChart(topicLabels);

                                var modelViewList = new ModelViewList(topicWords, topicLabels,
                                    paperTopics, topicYears);

                                var topicView = new TopicView(topicWords, topicLabels, topicYears, papers, paperTopics);

                                var paperView = new PaperView(papers, paperTopics, topicLabels, topicWords);

                                var bibView = new BibView(papers);

                                var wordIndexView = new WordIndexView(topicWords);

                                var authorView = new AuthorView(paperAuthors, paperTopics, papers, topicLabels);

                                var authorListView = new AuthorListView(paperAuthors);

                                var wordView = new WordView(topicLabels, topicWords);

                                var urlChangingHandler = new UrlChangingHandling(menuChart, modelViewList
                                    , topicView, paperView, bibView, wordIndexView, authorView, authorListView
                                    , wordView);

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

                                //location.hash = "#/secPriveMeta"; // initial page

                                menuChart.init();
                            });
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