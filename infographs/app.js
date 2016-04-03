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
    .attr('d', medianLine)
    .attr('clip-path', 'url(#rect-clip)').style("opacity", "0.8").style("stroke-width", "2").style("stroke", s);
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
  var svgWidth  = 960,
      svgHeight = 500,
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
    var svg = d3.select('body').append('svg')
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


d3.json('dat.json', function (error, rawData) {
  if (error) {
    console.error(error);
    return;
  }

  var data = rawData.map(function (d) {
    return {
      date:  parseDate(d.date),
      tot: d.tot/100,
      var: d.var/100,
    };
  });



  // The schema of data and data4 are:
  // data4.push({"tot" : tot price , "var": std of bill , "date": date of bill } )
  // std can be hardcoded if need be.


  data4 = kalman(data); // Kalman prediction graph

  var dl = [data4, data]; // list of graphs
  var cats = [ "real", "fit"]
  makeChart(dl, cats);


});
