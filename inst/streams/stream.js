// !preview r2d3 data=list(sources = list("FileStreamSource[file]", "Other[file]"), sinks = list("FileSink[file]"), demo = TRUE)

var barWidth = 10;
var margin = 20;
var remotesCircle = 10;
var remotesMargin = margin + remotesCircle;
var remotesHeight = 80;

var sourceCircles = svg.selectAll(".source")
  .data(data.sources)
  .enter()
  .append("g")
    .attr("class", "source")
    .attr("transform", function(d, i) {
      return "translate(" + (remotesMargin + i * 24) + ", " + remotesMargin + ")";
    })
    .append("circle");

sourceCircles.attr("cx", "0").attr("cy", "0").attr("r", "10")
  .attr("stroke", function (d, i) {
    return (i == data.sources.length - 1) ? "orange" : "white";
  })
  .attr("stroke-width", "2")
  .attr("fill", "orange")
  .on("mouseover", function (d, i) {
    sourceCircles.attr("stroke", "white");
    d3.select(this).attr("stroke", "orange");
    sourceText.text(d);
  });

var sourceText = svg
  .append("text")
    .attr("y", 35).attr("x", 24 + data.sources.length * 24)
    .attr("class", "label")
    .text(function(d) { return data.sources[data.sources.length - 1]; });

var rowsPerSecondIn = svg
  .append("text")
    .attr("y", 60).attr("x", 24 + data.sources.length * 24)
    .attr("class", "rps")
    .text("0 rps");

rowsPerSecondIn.append("title").text("rows per second");

var sinkCircles = svg.selectAll(".sink")
  .data(data.sinks)
  .enter()
  .append("g")
    .attr("class", "sink")
    .attr("transform", function(d, i) {
      return "translate(" + (remotesMargin + i * 24) + ","  + (height - remotesMargin) + ")";
    })
    .append("circle");

sinkCircles.attr("cx", "0").attr("cy", "0").attr("r", "10")
  .attr("stroke", function (d, i) {
    return (i == data.sinks.length - 1) ? "steelblue" : "white";
  })
  .attr("stroke-width", "2")
  .attr("fill", "steelblue")
  .on("mouseover", function (d, i) {
    sinkCircles.attr("stroke", "white");
    d3.select(this).attr("stroke", "steelblue");
    sinkText.text(d);
  });

var sinkText = svg
  .append("text")
    .attr("y", height - 25).attr("x", 24 + data.sinks.length * 24)
    .attr("class", "label sinkText")
    .text(function(d) { return data.sources[data.sinks.length - 1]; });

var rowsPerSecondOut = svg
  .append("text")
    .attr("y", height - 50).attr("x", 24 + data.sinks.length * 24)
    .attr("class", "rps")
    .text("0 rps");

rowsPerSecondOut.append("title").text("rows per second");

function StreamStats() {
  var rpmIn = [];
  var rpmOut = [];

  var maxIn = 100;
  var maxOut = 100;

  this.add = function(rps) {
    if (maxIn < rps.in) maxIn = rps.in;
    if (maxOut < rps.out) maxOut = rps.out;

    rpmIn.unshift(rps.in);
    rpmOut.unshift(rps.out);
  };

  this.rpmIn = function() {
    return rpmIn;
  };

  this.rpmOut = function() {
    return rpmOut;
  };

  this.maxIn = function() {
    return maxIn;
  };

  this.maxOut = function() {
    return maxOut;
  };
}

var chartIn = svg.append("g");
var chartOut = svg.append("g");

function udpateChart(stats) {
  var chartHeight = height - 2 * remotesHeight;

  var dataIn = chartIn.selectAll('rect')
    .data(stats.rpmIn());

  dataIn
    .enter()
      .append('rect')
    .merge(dataIn)
      .attr('width', barWidth)
      .attr('height', function(d, i) { return chartHeight / 2 * d / stats.maxIn();})
      .attr('x', function(d, i) { return margin + i * barWidth; })
      .attr('y', function(d, i) { return remotesHeight + chartHeight / 2 - chartHeight / 2 * d / stats.maxIn(); })
      .attr('fill', 'orange');

  var dataOut = chartOut.selectAll('rect')
    .data(stats.rpmOut());

  dataOut.
    enter()
      .append('rect')
    .merge(dataOut)
      .attr('width', barWidth)
      .attr('height', function(d, i) { return chartHeight / 2 * d / stats.maxOut();})
      .attr('x', function(d, i) { return margin + i * barWidth; })
      .attr('y', function(d, i) { return remotesHeight + chartHeight / 2; })
      .attr('fill', 'steelblue');
}

var stats = new StreamStats();

function updateStats(data) {
  stats.add(data.rps);

  rowsPerSecondIn.text(data.rps.in + " rps");
  rowsPerSecondOut.text(data.rps.out + " rps");

  udpateChart(stats);
}

if (typeof(Shiny) !== "undefined") {
  Shiny.addCustomMessageHandler("sparklyr_stream_view", updateStats);
}

if (data.demo) {
  setInterval(function() {
    var stats = {
      rps: {
        in: Math.floor(Math.random() * 100),
        out: Math.floor(Math.random() * 100)
      }
    };

    updateStats(stats);
  }, 1000);
}