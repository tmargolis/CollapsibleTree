CollapsibleTree
===============

Collapsible Tree visualization extension for Qlik Sense

Each node in the visualization should be added as a dimension. If there are three columns (Parent, Child, Value) then note that children can also be parents. The value specified as a measure will determine the relative sizes of the tree nodes.

This Sense extension relies on [D3.js](http://bl.ocks.org/mbostock/4339083) for rendering and [senseD3utils.js](http://branch.qlik.com/projects/showthread.php?284-D3-Helper-Library-for-Qlik-Sense) for formatting data into the correct JSON structure. All helper libraries are included in this repository.

If you see a node with a "-" as its label, ensure you remove empty lines from your source data or disable "Show null values" in Sense.
