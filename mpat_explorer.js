/*
 * take a site info and make it into a D3.js package
 */
function d3ize(wsgraph) {
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

/*
 * find the components in a page, for the page table
 */
function components(obj) {
  let res = '';
  for (let a in obj.page.meta.mpat_content.content) { //eslint-disable-line
    if (!obj.page.meta.mpat_content.content.hasOwnProperty(a)) continue; //eslint-disable-line
    const x = obj.page.meta.mpat_content.content[a];
    for (let b in x) { //eslint-disable-line
      if (!x.hasOwnProperty(b)) continue; //eslint-disable-line
      const y = x[b];
      res += ',';
      res += y.type;
    }
  }
  if (res !== '') {
    res = res.substring(1);
  }
  return res;
}

function lt(u) {
  const i = u.lastIndexOf('/');
  if (i < 0) return u;
  return `<a href='${u}'>${u.substring(i + 1)}</a>`;
}

/*
 * find the media in a page, for the page table
 */
function media(obj) {
  let res = '';
  for (let a in obj.page.meta.mpat_content.content) { //eslint-disable-line
    if (!obj.page.meta.mpat_content.content.hasOwnProperty(a)) continue; //eslint-disable-line
    const x = obj.page.meta.mpat_content.content[a];
    for (let b in x) { //eslint-disable-line
      if (!x.hasOwnProperty(b)) continue; //eslint-disable-line
      const y = x[b];
      switch (y.type) {
        case 'link':
          if (y.data && y.data.thumbnail) {
            res += ',';
            res += lt(y.data.thumbnail);
          }
          break;
        case 'image':
          if (y.data && y.data.imgUrl) {
            res += ',';
            res += lt(y.data.imgUrl);
          }
          break;
        case 'video':
          if (y.data && y.data.thumbnail) {
            res += ',';
            res += lt(y.data.thumbnail);
          }
          if (y.data && y.data.url) {
            res += ',';
            res += lt(y.data.url);
          }
          break;
        case 'launcher':
          if (y.data && y.data.listArray) {
            for (let ii = 0; ii < y.data.listArray.length; ii++) {
              const u = y.data.listArray[ii].thumbnail;
              if (u) {
                res += ',';
                res += lt(u);
              }
            }
          }
          break;
        case 'gallery':
          if (y.data && y.data.images) {
            for (let ii = 0; ii < y.data.images.length; ii++) {
              const u = y.data.images[ii].attachmentUrl;
              if (u) {
                res += ',';
                res += lt(u);
              }
            }
          }
          break;
        default:
          break;
      }
    }
  }
  if (res !== '') {
    res = res.substring(1);
  }
  return res;
}

/*
 * find links in a page object, for the page table
 */
function findLinks(obj) {
  const res = [];
  if (obj.page.post_parent !== 0) {
    res.push({ type: 'back', url: 'page://'+obj.page.post_parent });
  }
  for (let a in obj.page.meta.mpat_content.content) { //eslint-disable-line
    if (!obj.page.meta.mpat_content.content.hasOwnProperty(a)) continue; //eslint-disable-line
    const x = obj.page.meta.mpat_content.content[a];
    for (let b in x) { //eslint-disable-line
      if (!x.hasOwnProperty(b)) continue; //eslint-disable-line
      const y = x[b];
      switch (y.type) {
        case 'link':
        case 'redbutton':
          if (y.data && y.data.url) {
            res.push({ type: y.type, url: y.data.url });
          }
          break;
        case 'list':
        case 'menu':
        case 'launcher':
          if (y.data && y.data.listArray) {
            for (let ii = 0; ii < y.data.listArray.length; ii++) {
              const u = y.data.listArray[ii].appUrl;
              if (u) {
                res.push({ type: y.type, url: u });
              }
            }
          }
          break;
        default:
          break;
      }
    }
  }
  return res;
}

/*
 * find the zones in a layout, for the layout table
 */
function zones(o) {
  let res = '';
  const zones = o.layout; //eslint-disable-line
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    res += zone.x * 10;
    res += ',';
    res += zone.y * 10;
    res += '+';
    res += zone.w * 10;
    res += 'x';
    res += zone.x * 10;
    if (zone.static) {
      res += '[S]';
    }
    if (i !== zones.length - 1) res += '<br/>';
  }
  return res;
}

function ident(label, obj) {
  switch (label) {
    case 'page':
      return obj.page.post_title;
    case 'page_layout':
      return obj.page_layout.post_title;
    default:
      break;
  }
  return '';
}

/*
 * create the web site graph from the D3-compatible object
 */
function d3process(d3g) {
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
                .attr('height', height);
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
}

/*
 * general function
 */
function process(o) {
  const ip = document.getElementById('insertionPoint');
  const vv = document.getElementById('infoTable');
  const v1 = document.getElementById('layoutTable');
  let pageCounter = 0;
  let layoutCounter = 0;
  let websitegraph = [];
  /*
   * loop on the info from PHP to build the JS data structure
   */
  for (let i = 0; i < o.length; i++) {
    const v = document.createElement('tr');
    const obj = o[i];
    if (obj.page) {
      const lnks = findLinks(obj);
      const l = lnks.join(',');
      websitegraph.push({ id: obj.page.ID, title: obj.page.post_title, links: lnks });
      v.innerHTML = `<td>${obj.page.post_title} (${obj.page.ID})</td><td>Components: ${components(obj)}<br/>Media: ${media(obj)}<br/>Links: ${l}</td>`;
      vv.appendChild(v);
      pageCounter++;
    }
    if (obj.page_layout) {
      const l = obj.page_layout;
      v.innerHTML = `<td>${l.post_title} (${l.ID})</td><td>${zones(l.meta.mpat_content)}</td>`;
      v1.appendChild(v);
      layoutCounter++;
    }
    if (obj.mpat_application_manager) {
      document.getElementById('navmodel').textContent +=
        obj.mpat_application_manager.navigation_model;
    }
  }
  // fill the page table
  document.getElementById('pages').textContent += '' + pageCounter; //eslint-disable-line
  // fill the layout table
  document.getElementById('layouts').textContent += '' + layoutCounter; //eslint-disable-line
  // create a complete info package on the application with all known details
  // shown as a JSON object after the tables
  const pre = document.createElement('details');
  let sum = document.createElement('summary');
  sum.textContent = 'Complete info';
  pre.appendChild(sum);
  const bq = document.createElement('blockquote');
  pre.appendChild(bq);
  for (let i = 0; i < o.length; i++) {
    const obj = o[i];
    const odet = document.createElement('details');
    sum = document.createElement('summary');
    odet.appendChild(sum);
    const keys = Object.keys(obj);
    const label = keys[0];
    sum.innerHTML = `<i>${label}</i> <b>${ident(label, obj)}</b>`;
    const bq1 = document.createElement('blockquote');
    odet.appendChild(bq1);
    const rest = document.createElement('pre');
    if (keys.length === 1) {
      rest.textContent = JSON.stringify(obj[keys[0]], null, 2);
    } else {
      rest.textContent = JSON.stringify(obj, null, 2);
    }
    bq1.appendChild(rest);
    bq.appendChild(odet);
  }
  ip.appendChild(pre);
  // raw JSON object for debug purposes
  ip.appendChild(document.createElement('br'));
  const det1 = document.createElement('details');
  ip.appendChild(det1);
  sum = document.createElement('summary');
  sum.textContent = 'Raw JSON';
  det1.appendChild(sum);
  const bq2 = document.createElement('blockquote');
  det1.appendChild(bq2);
  const pre2 = document.createElement('pre');
  pre2.textContent = JSON.stringify(o, null, 2);
  bq2.appendChild(pre2);
  ip.appendChild(document.createElement('br'));
  // insert the web site map at the end
  const det2 = document.createElement('h3');
  ip.appendChild(det2);
  det2.textContent = 'Website graph';
  const d3g = d3ize(websitegraph);
  d3process(d3g);
}

process(window.MPATExplorer);


