function parser(d) {
    d.pMPG = +d.MPG;
    return d;
}

function mpghist(csvdata) {
    var binsize = 2;
    var minbin = 36;
    var maxbin = 60;
    var numbins = (maxbin - minbin) / binsize;

    // whitespace on either side of the bars in units of MPG
    var binmargin = .2;
    var margin = {top: 10, right: 30, bottom: 50, left: 60};
    var width = 450 - margin.left - margin.right;
    var height = 250 - margin.top - margin.bottom;

    // Set the limits of the x axis
    var xmin = minbin - 1
    var xmax = maxbin + 1

    var	parseDate = d3.time.format("%Y-%m-%d").parse;
    histdata = {};
    for (var i = 0; i < csvdata.length; i++) {
      console.log("£££££££££££££££");
		    histdata[csvdata[i].MPG] = { numfill: 0, meta: "" };
        console.log("*******************");
  	}

	// Fill histdatas with y-axis values and meta data
    // console.log(csvdata[0].)
    console.log(histdata)
    csvdata.forEach(function(d) {
    console.log(d.MPG);
		var bin =  parseDate(d.MPG) ;
    console.log(bin);
		if ((bin.toString() != "NaN") ) {

			histdata[d.MPG].numfill += 1;
			histdata[d.MPG].meta += "<tr><td>" + d.City +
				" " + d.State +
				"</td><td>" +
				d.price + " \u00A3</td></tr>";

		}
    });

    console.log(histdata);

    var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // Parse the date / time
    // var	parseDate = d3.time.format("%Y-%m").parse;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    console.log(height);
    var y = d3.scale.linear().range([height, 0]);


    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y-%m"));
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

    var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .direction('e')
	  .offset([0, 20])
	  .html(function(d) {
	    return '<table id="tiptable">' + d.meta + "</table>";
	});

   console.log("^^^^^^^^^^^^^^^^^^^^^^^^^");

    // put the graph in the "mpg" div
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    data = []
    for(k in histdata){
      console.log(k)
       dict = {"date": k , "value": histdata[k].numfill, "meta": histdata[k].meta}
       data.push(dict)
    }

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
    });

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);


    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value ($)");

  svg.selectAll("#mpghist")
      .data(data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); }).on('mouseover', tip.show)
	  .on('mouseout', tip.hide);;
    console.log(tip)
    svg.call(tip);

}
