/*globals define*/
define(["jquery", "text!./style.css", "./d3.v3.min", "./senseD3utils"], function($, cssContent) {
    $("<style>").html(cssContent).appendTo("head");
    return {
        initialProperties: {
            version: 1.1,
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 10,
                    qHeight: 500
                }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 1,
                    max: 20
                },
                measures: {
                    uses: "measures",
                    min: 1,
                    max: 2
                },
                sorting: {
                    uses: "sorting"
                },
                settings: {
                    uses: "settings"
                }
            }
        },
        snapshot: {
            canTakeSnapshot: true
        },
        paint: function($element, layout) {

            //create JSON container object
            var myJSON = {"name":layout.title,"children":[]};
            var qData = layout.qHyperCube.qDataPages[0];
          //create matrix variable
            var qMatrix = qData.qMatrix;
            var numDims = layout.qHyperCube.qDimensionInfo.length;
            var numMsrs = layout.qHyperCube.qMeasureInfo.length;
// console.log("hypercube size: ", layout.qHyperCube.qSize);
// console.log("matrix size: ",    qMatrix.length);
// console.log("hypercube: ", layout.qHyperCube);
// console.log("qMatrix: ", qMatrix);

            //use senseD3.createFamily to create JSON object
            // myJSON.children = senseD3.createFamily(qMatrix, numDims);
            myJSON.children = senseD3.createBigFamily(qMatrix, numDims, numMsrs);
// console.log(myJSON);
            //create unique id
            var id = "sb_" + layout.qInfo.qId;
      //if extension has already been loaded, empty it, if not attach unique id
            if (document.getElementById(id)) {
                $("#" + id).empty();
            } else {
                $element.append($('<div />').attr("id", id));
            }
            $("#" + id).width($element.width()).height($element.height());

/////////////////////////
// Collapsible Tree    //
/////////////////////////

            var margin = {top: 20, right: 120, bottom: 20, left: 120},
                width = $("#" + id).width()-5,
                height = $("#" + id).height()-5;
                
            var i = 0,
                duration = 750,
                root;

            var tree = d3.layout.tree()
                .size([height, width]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });

            // Create SVG
            var svg = d3.select("#" + id).append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(100,0)");

            root = myJSON;
            root.x0 = height / 2;
            root.y0 = 0;

            function collapse(d) {
              if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
              }
            }

            // Recursively replace children with _children
            root.children.forEach(collapse);

            // Initialize viz
            update(root);

            /* Update Function is called on init and on node clicks */
            function update(source) {

              // Compute the new tree layout.
              var nodes = tree.nodes(root).reverse(),
                  links = tree.links(nodes);

              var maxDepth = senseD3.findMaxValue("depth", nodes);
// console.log(nodes);
// console.log(maxDepth);
              var maxSize = senseD3.findMaxValue("size", nodes);
              var fullCircleSize = 10;

              // Normalize for fixed-depth.
              nodes.forEach(function(d) { d.y = d.depth * width/(maxDepth+1); });

              // Update the nodes…
              var node = svg.selectAll("g.node")
                  .data(nodes, function(d) { return d.id || (d.id = ++i); });

              // Enter any new nodes at the parent's previous position.
              var nodeEnter = node.enter().append("g")
                  .attr("class", "node")
                  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                  .on("click", click);

              nodeEnter.append("circle")
                  .attr("r", 1e-6)
                  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

              // Add Label
              nodeEnter.append("text")
                  .attr("x", function(d) { return d.children || d._children.length ? "0px" : "10px"; })
                  .attr("dy",  function(d) { return d.children || d._children.length ? "20px" : "3px"; })
                  .attr("text-anchor", function(d) { return d.children || d._children.length ? "middle" : "start"; })
                  .text(function(d) { return d.name; })
                  .style("fill-opacity", 1e-6);

              // Add Hover Text
              nodeEnter.append("title")
                  .text(function(d){
                    if(d.children){
                      return "";
                    }else{
                      return d.size;
                    }
                  })
                  .attr("x", function(d) { return d.children || d._children.length ? "0px" : "10px"; })
                  .attr("dy",  function(d) { return d.children || d._children.length ? "20px" : "3px"; })
                  .attr("text-anchor", function(d) { return d.children || d._children.length ? "middle" : "start"; })
                  .style("fill-opacity", 1e-6);

              // Transition nodes to their new position.
              var nodeUpdate = node.transition()
                  .duration(duration)
                  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

              // Color nodes based on if they are leaves or not
              nodeUpdate.select("circle")
                  .attr("r", function(d){
                    if(typeof d.size !== 'undefined'){
                      return d.size / maxSize * fullCircleSize;
                    }else{
                      return fullCircleSize;
                    }
                  })
                  .style("fill", function(d) {
                    if(d.children){
                      return "lightsteelblue";
                    }else if(d._children == null){
                      return "#fff";
                    }else if(d._children.length){
                      return "lightsteelblue";
                    }else
                      return "#fff";
                  });

              nodeUpdate.select("text")
                  .style("fill-opacity", 1);

              // Transition exiting nodes to the parent's new position.
              var nodeExit = node.exit().transition()
                  .duration(duration)
                  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                  .remove();

              nodeExit.select("circle")
                  .attr("r", 1e-6);

              nodeExit.select("text")
                  .style("fill-opacity", 1e-6);

              // Update the links…
              var link = svg.selectAll("path.link")
                  .data(links, function(d) { return d.target.id; });

              // Enter any new links at the parent's previous position.
              link.enter().insert("path", "g")
                  .attr("class", "link")
                  .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                  });

              // Transition links to their new position.
              link.transition()
                  .duration(duration)
                  .attr("d", diagonal);

              // Transition exiting nodes to the parent's new position.
              link.exit().transition()
                  .duration(duration)
                  .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                  })
                  .remove();

              // Stash the old positions for transition.
              nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
              });
            }

            // Toggle children on click.
            function click(d) {
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else if(d._children.length){
                d.children = d._children;
                d._children = null;
              }
              update(d);
            }



        },
      resize:function($el,layout){
          // this.paint($el,layout);
        }
    };
});
