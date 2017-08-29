/*
 * take a site info and make it into a D3.js package
 */

export function d3ize(wsgraph) {
  const d3g = {
    directed: true,
    multigraph: false,
    graph: {},
    nodes: [],
    links: []
  };
  const outsidelinks = [];
  const outsidelinksindex = [];
  for (let i = 0; i < wsgraph.length; i++) {
    const id = wsgraph[i].id;
    const name = wsgraph[i].title;
    d3g.nodes.push({id, name});
  }
  for (let i = 0; i < wsgraph.length; i++) {
    const lnks = wsgraph[i].links;
    for (let j = 0; j < lnks.length; j++) {
      if (lnks[j].url.indexOf('page://') === 0) {
        const id1 = +(lnks[j].url.substring(7));
        let nodeIndex = d3g.nodes.findIndex(node => node.id === id1);
        if (nodeIndex === -1) {
          nodeIndex = d3g.nodes.length;
          d3g.nodes.push({ id: id1, name: `import_${id1}` });
        }
        d3g.links.push(
          {
            value: (lnks[j].type === 'back' ? 2 : 1),
            source: d3g.nodes[i],
            target: d3g.nodes[nodeIndex]
          });
      } else {
        const already = outsidelinks.indexOf(lnks[j].url);
        if (already < 0) {
          const olindex = d3g.nodes.length;
          outsidelinks.push(lnks[j].url);
          outsidelinksindex.push(olindex);
          d3g.nodes.push({ id: olindex, name: lnks[j].url, class: 'outside' });
          d3g.links.push(
            {
              value: (lnks[j].type === 'back' ? 2 : 1),
              source: d3g.nodes[i],
              target: d3g.nodes[olindex]
            });
        } else {
          d3g.links.push(
            {
              value: (lnks[j].type === 'back' ? 2 : 1),
              source: d3g.nodes[i],
              target: d3g.nodes[outsidelinksindex[already]]
            });
        }
      }
    }
  }
  return d3g;
}

let theSvgElement;

/* Constants: */
const plus = 187;
const minus = 189;
const leftArrow = 37; // Key code for the left arrow key.
const upArrow = 38;
const rightArrow = 39;
const downArrow = 40;
const panRate = -50; // Number of pixels to pan per key press.
const zoomRate = 0.8;

function processKeyPress(evt) {
  const viewBox = theSvgElement.getAttribute('viewBox');
  // Grab the object representing the SVG element's viewBox attribute.
  const viewBoxValues = viewBox.split(' ');
  // Create an array and insert each individual view box attribute value (assume they're
  // separated by a single whitespace character).
  /* The array is filled with strings, convert the first two viewBox values to floats: */
  viewBoxValues[0] = parseFloat(viewBoxValues[0]);
  // Represent the x-coordinate on the viewBox attribute.
  viewBoxValues[1] = parseFloat(viewBoxValues[1]);
  // Represent the y coordinate on the viewBox attribute.
  switch (evt.keyCode) {
    case minus:
      const centerX = viewBoxValues[0] + viewBoxValues[2] / 2;
      const centerY = viewBoxValues[1] + viewBoxValues[3] / 2;
      viewBoxValues[2] /= zoomRate;
      viewBoxValues[3] /= zoomRate;
      viewBoxValues[0] = centerX - viewBoxValues[2] / 2;
      viewBoxValues[1] = centerY - viewBoxValues[3] / 2;
      evt.preventDefault();
      break;
    case plus:
      const cX = viewBoxValues[0] + viewBoxValues[2] / 2;
      const cY = viewBoxValues[1] + viewBoxValues[3] / 2;
      viewBoxValues[2] *= zoomRate;
      viewBoxValues[3] *= zoomRate;
      viewBoxValues[0] = cX - viewBoxValues[2] / 2;
      viewBoxValues[1] = cY - viewBoxValues[3] / 2;
      evt.preventDefault();
      break;
    case leftArrow:
      viewBoxValues[0] += panRate;
      // Increase the x-coordinate value of the viewBox attribute by the amount given by panRate.
      evt.preventDefault();
      break;
    case rightArrow:
      viewBoxValues[0] -= panRate;
      // Decrease the x-coordinate value of the viewBox attribute by the amount given by panRate.
      evt.preventDefault();
      break;
    case upArrow:
      viewBoxValues[1] += panRate;
      // Increase the y-coordinate value of the viewBox attribute by the amount given by panRate.
      evt.preventDefault();
      break;
    case downArrow:
      viewBoxValues[1] -= panRate;
      // Decrease the y-coordinate value of the viewBox attribute by the amount given by panRate.
      evt.preventDefault();
      break;
  } // switch
  theSvgElement.setAttribute('viewBox', viewBoxValues.join(' '));
  // Convert the viewBoxValues array into a string with a white
  // space character between the given values.
}

/*
 * create the web site graph from the D3-compatible object
 */
export function d3process(d3g) {
  const nodes = d3g.nodes;
  const links = d3g.links;
  const width = 960;
  const height = 800;
  const force = d3.layout.force()
                  .nodes(d3.values(nodes))
                  .links(links)
                  .size([width, height])
                  .linkDistance(100)
                  .charge(-1000)
                  .on('tick', tick)
                  .start();
  const svg = d3.select('#insertionPoint').append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', '0 0 1000 1000');
  theSvgElement = svg[0][0];
  svg.append('svg:style')
     .text('path { stroke: #666; stroke-width: 1.5px; } ' +
           'path.link { fill: none; } ' +
           'path.linkb { fill: none; stroke-dasharray: 5, 5; } ' +
           'circle { fill: #afa; stroke: #fff; stroke-width: 1.5px; } ' +
           'circle.outside { fill: #88F; stroke: #888; stroke-width: 1.5px; } ' +
           'text { fill: black; stroke: white; stroke-width: 0.4px; font: 16px sans-serif;' +
           'font-weight: 600; pointer-events: none; z-index: 3; } ' +
           'svg { border: 3px solid black; }');
// build the arrow.
  svg.append('svg:defs').selectAll('marker')
     .data(['end'])
     .enter().append('svg:marker')
     .attr('id', String)
     .attr('viewBox', '0 -5 10 10')
     .attr('refX', 15)
     .attr('refY', -1.5)
     .attr('markerWidth', 6)
     .attr('markerHeight', 6)
     .attr('orient', 'auto')
     .append('svg:path')
     .attr('d', 'M0,-5L10,0L0,5');
// add the links and the arrows
  const path = svg.append('svg:g').selectAll('path')
                  .data(force.links())
                  .enter().append('svg:path')
                  .attr('class', d => (d.value === 2 ? 'linkb' : 'link'))
                  .attr('marker-end', 'url(#end)');
// define the nodes
  const node = svg.selectAll('.node')
                  .data(force.nodes())
                  .enter().append('g')
                  .attr('class', 'node')
                  .call(force.drag);
// add the nodes
  node.append('circle')
      .attr('class', d => d.class)
      .attr('r', 5);
// add the text
  node.append('text')
      .attr('x', 12)
      .attr('dy', '.35em')
      .text(d => d.name);
// add the curvy lines
  function tick() {
    path.attr('d', function u(d) {
      let dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      return 'M' +
        d.source.x + ',' +
        d.source.y + 'A' +
        dr + ',' + dr + ' 0 0,1 ' +
        d.target.x + ',' +
        d.target.y;
    });
    node
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')'; });
  }
  window.addEventListener('keydown', processKeyPress, true);
}

