function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
  var legendWidth  = 200,
      legendHeight = 70;

  // clipping to make sure nothing appears behind legend
  svg.append('clipPath')
    .attr('id', 'axes-clip')
    .append('polygon')
      .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                      (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                      (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                      (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                      (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                      (-margin.left)                 + ',' + (chartHeight + margin.bottom));

  var axes = svg.append('g')
    .attr('clip-path', 'url(#axes-clip)');

  axes.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis);

  axes.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .attr('x', 10 )
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('x','10000!' )
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('total (\u00A3) ');
}

function drawPaths (svg, data, x, y, chartWidth, chartHeight,cats, index) {
  console.log(cats);
  var legendWidth  = 200,
      legendHeight = 70;

  var upperInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.tot + d.var); })
    .y1(function (d) { return y(d.tot); });

  var medianLine = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.tot); });

  var lowerInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d) { return x(d.date) || 1; })
    .y0(function (d) { return y(d.tot); })
    .y1(function (d) { return y(d.tot - d.var); });
  // console.log(lowerInnerArea);
  // lowerInnerArea.fill('black')

  svg.datum(data);
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }




    return color;

}

  s = getRandomColor();
  var legend = svg.append('g')
  .attr('class', 'legend')
  .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');
  //
  // legend.append('rect')
  // .attr('class', 'legend-bg')
  // .attr('width',  legendWidth)
  // .attr('height', legendHeight).style('fill', 'none').style('stroke', 'none');

  legend.append('rect')
  .attr('class', 'inner')
  .attr('width',  75)
  .attr('height', 20)
  .attr('x', 10)
  .attr('y', 25*(i+1)/10).style('fill', s);

  legend.append('text')
  .attr('x', 115)
  .attr('y', 25*(i+1)/10  +15)
  .text(cats[i]).style('fill','black');


  svg.append('path')
    .attr('class', 'area upper inner')
    .attr('d', upperInnerArea)
    .attr('clip-path', 'url(#rect-clip)')
    .style('fill', s).style("fill-opacity", "0.3").style("stroke", "none");

  svg.append('path')
    .attr('class', 'area lower inner')
    .attr('d', lowerInnerArea)
    .attr('clip-path', 'url(#rect-clip)').style('fill', s).style("fill-opacity", "0.3").style("stroke", "none");


  svg.append('path')
    .attr('class', 'median-line')
    .attr('d', medianLine).style("opacity", "0.8").style("stroke-width", "2").style("stroke", s);
  x1=[]
  y1=[]

    for(i in data){
      x1.push(x(data[i].date));
      y1.push( data[i].tot);
    }

att =[x1,y1]
  return att

}



function startTransitions (svg, chartWidth, chartHeight, rectClip, x) {
  rectClip.transition()
    .duration(1000*2)
    .attr('width', chartWidth);

}

function makeChart (dats, cats) {
  var svgWidth  = 500,
      svgHeight = 300,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = svgWidth  - margin.left - margin.right,
      chartHeight = svgHeight - margin.top  - margin.bottom;
    data = dats[0]
    var x = d3.time.scale().range([0, chartWidth])
    .domain(d3.extent(data, function (d) { return d.date; })),
    y = d3.scale.linear().range([chartHeight, 0])
    .domain([0, d3.max(data, function (d) { return d.tot + d.var; })]);

    var xAxis = d3.svg.axis().scale(x).orient('bottom')
    .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
    yAxis = d3.svg.axis().scale(y).orient('left')
    .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(1.5);


    // hERE IS WHERE THE LOCATION OF GRAPH IS ASSIGNED.
    var svg = d3.select('#it2').append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x1 = []
    y1 = []
    for(i in data){
      x1.push(x(data[i].date));
      y1.push( data[i].tot);
    }



    // clipping to start chart hidden and slide it in later
    var rectClip = svg.append('clipPath')
    .attr('id', 'rect-clip')
    .append('rect')
    .attr('width', 0)
    .attr('height', chartHeight);
    for (i in dats){
      data = dats[i]
      addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
      medianLine = drawPaths(svg, data, x, y, chartWidth, chartHeight, cats, i);
      startTransitions (svg, chartWidth, chartHeight, rectClip, x)
    }


}

function kalman(data){
  // Kalman filter prediction
  margin = { top: 20, right: 20, bottom: 40, left: 40 }
  chartWidth  = 960  - margin.left - margin.right;
  var x = d3.time.scale().range([0, chartWidth])
  .domain(d3.extent(data, function (d) { return d.date; }));
  x1 = []
  y1 = []
  y2 = []
  for(i in data){
    x1.push(x(data[i].date));
    y1.push( data[i].tot);
    y2.push( data[i].var);
  }
  // Creates interpolation and prediction of a curve
  var x_0 = $V([y1[0]]);
  var x_02 = $V([y2[0]]);
  var P_0 = $M([[10]]);
  var F_k=$M([[0.97]]);
  var Q_k=$M([[0]]);
  var KM = new KalmanModel(x_0,P_0,F_k,Q_k);
  var KM2 = new KalmanModel(x_02,P_0,F_k,Q_k);

  var z_k = $V([1]);
  var H_k = $M([[1]]);
  var R_k = $M([[4]]);
  // console.log(R_k)
  var KO = new KalmanObservation(z_k,H_k,R_k);
  var KO2 = new KalmanObservation(z_k,H_k,R_k);
  data4 = []
  for (var i=0;i<x1.length-1;i++){
    z_k = $V([y1[i+1]]);
    z_k2 = $V([y2[i+1]])
    KO.z_k=z_k;
    KO2.z_k=z_k2;
    KM.update(KO);
    KM2.update(KO2);
    // console.log("%$$$$$$$$")
    // console.log(JSON.stringify(KM.x_k.elements));
    data4.push({"tot" : KM.x_k.elements[0] , "var": KM2.x_k.elements[0] , "date": data[i].date } )
  }
  cache = data[data.length -1].date
  for(var i = 1; i<3;i++){

    px = KM.update(KO)

    cache =  d3.time.day.offset(cache, i)
    data4.push({"tot" : KM.x_k.elements[0] , "var": 100 , "date": cache } )
  }

  return data4;
}

// EXAMPLE USAGE:

var parseDate  = d3.time.format('%Y-%m-%d').parse;


  data = [
    {
      "date": "2014-08-01",
      "tot": 5350,
      "var": 500

    },
    {
      "date": "2014-08-02",
      "tot": 4439,
      "var": 300

    },
    {
      "date": "2014-08-03",
      "tot": 4247,
      "var": 200

    },
    {
      "date": "2014-08-04",
      "tot": 3293,
      "var": 300

    },
    {
      "date": "2014-08-05",
      "tot": 3942,
      "var": 100

    },
    {
      "date": "2014-08-06",
      "tot": 2744,
      "var": 500

    },
    {
      "date": "2014-08-07",
      "tot": 1807,
      "var": 300

    },
    {
      "date": "2014-08-08",
      "tot": 1855,
      "var": 350
    },
    {
      "date": "2014-08-09",
      "tot": 1830,
      "var": 500
    },
    {
      "date": "2014-08-10",
      "tot": 1828,
      "var": 400

    },
    {
      "date": "2014-08-11",
      "tot": 2246,
      "var": 300

    },
    {
      "date": "2014-08-12",
      "tot": 2051,
      "var": 200

    },
    {
      "date": "2014-08-13",
      "tot": 1700,
      "var": 40

    },
    {
      "date": "2014-08-14",
      "tot": 2161,
      "var": 100

    },
    {
      "date": "2014-08-15",
      "tot": 1765,
      "var": 500

    },
    {
      "date": "2014-08-16",
      "tot": 2036,
      "var": 400

    },
    {
      "date": "2014-08-17",
      "tot": 2079,
      "var": 600

    },
    {
      "date": "2014-08-18",
      "tot": 2108,
      "var": 700

    },
    {
      "date": "2014-08-19",
      "tot": 2143,
      "var": 500

    },
    {
      "date": "2014-08-20",
      "tot": 2086,
      "var": 900

    },
    {
      "date": "2014-08-21",
      "tot": 1767,
      "var": 400

    },
    {
      "date": "2014-08-22",
      "tot": 1756,
      "var": 300

    },
    {
      "date": "2014-08-23",
      "tot": 2123,
      "var": 200

    },
    {
      "date": "2014-08-24",
      "tot": 1967,
      "var": 340

    },
    {
      "date": "2014-08-25",
      "tot": 1537,
      "var": 261

    },
    {
      "date": "2014-08-26",
      "tot": 2182,
      "var": 395

    },
    {
      "date": "2014-08-27",
      "tot": 1932,
      "var": 336

    },
    {
      "date": "2014-08-28",
      "tot": 1268,
      "var": 234

    },
    {
      "date": "2014-08-29",
      "tot": 1225,
      "var": 223

    },
    {
      "date": "2014-08-30",
      "tot": 1393,
      "var": 243

    },
    {
      "date": "2014-08-31",
      "tot": 1175,
      "var": 202

    },
    {
      "date": "2014-09-01",
      "tot": 989,
      "var": 165

    },
    {
      "date": "2014-09-02",
      "tot": 1249,
      "var": 206

    },
    {
      "date": "2014-09-03",
      "tot": 936,
      "var": 151

    },
    {
      "date": "2014-09-04",
      "tot": 1264,
      "var": 203

    },
    {
      "date": "2014-09-05",
      "tot": 1305,
      "var": 210

    },
    {
      "date": "2014-09-06",
      "tot": 798,
      "var": 128

    },
    {
      "date": "2014-09-07",
      "tot": 1314,
      "var": 212

    },
    {
      "date": "2014-09-08",
      "tot": 1042,
      "var": 168

    }
  ];

  var data = data.map(function (d) {
    return {
      date:  parseDate(d.date),
      tot: d.tot/100,
      var: d.var/100,
    };
  });

  console.log(data);
  // fsdkjhkjsdhfkjsdh



  // The schema of data and data4 are:
  // data4.push({"tot" : tot price , "var": std of bill , "date": date of bill } )
  // std can be hardcoded if need be.


  data4 = kalman(data); // Kalman prediction graph

  var dl = [data4, data]; // list of graphs
  var cats = [ "Bayesian Network fit", "real"]
  makeChart(dl, cats);
