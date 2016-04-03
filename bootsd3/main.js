ResizableTreemap = function() {

    var data = [],
        json = null,
        chartWidth = 0,
        chartHeight = 0,
        domNode = null,
        svg = null,
        rootGroup = null,
        color = d3.scale.ordinal().range(colorbrewer.RdBu[9]),
        treemap = d3.layout.treemap(),
        dispatch = d3.dispatch("pageDown", "pageUp");

    function resizabletreemap(selection) {
        // initial setup
        domNode = selection.node(); // item dom node
        rootGroup = selection.append("svg");
        treemap.size([chartWidth, chartHeight])
            .sticky(false)
            .value(function(d) {
                return d.size;
            });
        data = treemap.nodes(json);
        cellSelection = rootGroup.selectAll("g").data(data)
            .enter().append("g")
            .classed("cell", true);
        cellSelection.append("rect")
            .classed("background", true);
        cellSelection.append('foreignObject')
            .attr("class", "foreignObject")
            .append("xhtml:body")
            .attr("class", "labelbody")
            .append("div")
            .attr("class", "label")
            .text(function(d) {
                return d.name;
            });
        selection.each(function() {
            new ResizeSensor(this, _.bind(function() {
                _.throttle(handleResize, 100)();
                //handleResize();
            }, this));
            _.defer(_.bind(function() {
                handleResize(); // call to do first rendering
            }, this));
        });


        function handleResize() {
            chartWidth = parseInt(d3.select(domNode).style("width"));
            chartHeight = parseInt(d3.select(domNode).style("height"));
            data = treemap.size([chartWidth, chartHeight])
                .nodes(json);
            d3.select(domNode)
                .attr("width", chartWidth + "px")
                .attr("height", chartHeight + "px");
            rootGroup.selectAll(".cell")
                .each(function() {
                    d3.select(this).call(position);
                });
        }


        function position() {
            this.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            this.select(".background")
                .attr("width", function(d) {
                    return Math.max(0.01, d.dx);
                })
                .attr("height", function(d) {
                    return d.dy;
                })
                .style("fill", function(d) {
                    return color(d.name);
                });
            this.select(".foreignObject")
                .attr("transform", "translate(0,0)")
                .attr("width", function(d) {
                    return Math.max(0.01, d.dx);
                })
                .attr("height", function(d) {
                    return Math.max(0.01, d.dy);
                })
                .select(".label")
                .text(function(d) {
                    return d.name;
                });
        }

        resizabletreemap.handleResize = handleResize; // make handleResize function publicly visible
        handleResize(); // call handleResize() to start
    }

    resizabletreemap.handleResize = function(evt) { // placeholder function that is overridden at runtime
        return resizabletreemap;
    };

    resizabletreemap.json = function(_) {
        if (!arguments.length) return json;
        json = _;
        return resizabletreemap;
    };

    d3.rebind(resizabletreemap, dispatch, "on");
    return resizabletreemap;
};

$(function() {
    var resizableWindow = $(".resizable");
    d3.json("http://www.billdwhite.com/wordpress/wp-content/data/flare.json", function(error, data) {
        resizableWindow = resizableWindow.resizable({
            minHeight: 175,
            minWidth: 225
        }).draggable()[0];
        var treemap = ResizableTreemap();
        treemap.json(data);
        d3.select(resizableWindow).select(".visualization").call(treemap);
    });
});
