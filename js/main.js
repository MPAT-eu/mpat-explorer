import { findLinks, components, ident, media, zones } from './mpat_explorer';
import { d3ize, d3process } from './graph';
import PageIO from './PageIO';
import LayoutIO from './LayoutIO';

function preprocess(o) {
  window.MPAT = {
    pages: {},
    pageArray: [],
    layouts: {}
  };
  o.forEach((obj) => {
    if (obj.page) {
      window.MPAT.pages['p'+obj.page.ID] = obj.page;
      window.MPAT.pageArray.push(obj.page);
    } else if (obj.page_layout) {
      window.MPAT.layouts['l' + obj.page_layout.ID] = obj.page_layout;
    }
  });
}

/*
 * general function
 */
export function process(o) {
  preprocess(o);
  const ip = document.getElementById('insertionPoint');
  const vv = document.getElementById('infoTable');
  const v1 = document.getElementById('layoutTable');
  let pageCounter = 0;
  let layoutCounter = 0;
  const websitegraph = [];
  /*
   * loop on the info from PHP to build the JS data structure
   */
  const url = window.location.href.substring(0, window.location.href.indexOf('admin.php?'));
  const usage = {};
  for (let i = 0; i < o.length; i++) {
    const v = document.createElement('tr');
    const obj = o[i];
    if (obj.page) {
      // fill the page table
      const lnks = findLinks(obj);
      const l = lnks.map(a => a.url).join(',');
      const url2 = `${url}post.php?post=${obj.page.ID}&action=edit`;
      websitegraph.push({ id: obj.page.ID, title: obj.page.post_title, links: lnks });
      v.innerHTML = `<td><a href="${url2}">${obj.page.post_title} (${obj.page.ID})</a></td><td>Components: ${components(obj)}<br/>Media: ${media(obj)}<br/>Links: ${l}</td>`;
      vv.appendChild(v);
      pageCounter++;
      const tag = `p${obj.page.meta.mpat_content.layoutId}`;
      if (!usage[tag]) {
        usage[tag] = [];
      }
      usage[tag].push(i);
    }
    if (obj.mpat_application_manager) {
      document.getElementById('navmodel').textContent +=
        obj.mpat_application_manager.navigation_model;
    }
  }
  for (let i = 0; i < o.length; i++) {
    const v = document.createElement('tr');
    const obj = o[i];
    if (obj.page_layout) {
      // fill the layout table
      const l = obj.page_layout;
      const url2 = `${url}post.php?post=${l.ID}&action=edit`;
      const usageOfThis = usage[`p${l.ID}`];
      let users = '';
      if (usageOfThis) {
        usageOfThis.forEach((j) => {
          const page = o[j].page;
          const url3 = `${url}post.php?post=${page.ID}&action=edit`;
          users += ` <a href="${url3}">${page.post_title} (${page.ID})</a>`;
        });
      }
      if (users === '') users = '--unused--';
      v.innerHTML = `<td><a href="${url2}">${l.post_title} (${l.ID})</a></td><td>${users}</td><td>${zones(l.meta.mpat_content)}</td><td><button type="button" onclick="cloneLayout(${i})">Clone</button></td>`;
      v1.appendChild(v);
      layoutCounter++;
    }
  }
  document.getElementById('pages').textContent += '' + pageCounter; //eslint-disable-line
  document.getElementById('layouts').textContent += '' + layoutCounter; //eslint-disable-line
  // create a complete info package on the application with all known details
  // shown as a JSON object after the tables
  const pre = document.createElement('details');
  let sum = document.createElement('summary');
  sum.textContent = 'Complete info';
  pre.appendChild(sum);
  const bq = document.createElement('blockquote');
  pre.appendChild(bq);
  const det1 = document.createElement('details');
  bq.appendChild(det1);
  bq.appendChild(document.createElement('br'));
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
  const det3 = document.createElement('p');
  ip.appendChild(det3);
  det3.textContent = 'Zoom and pan with cursor keys and +/-. Drag the nodes to modify the graph.';
  const d3g = d3ize(websitegraph);
  d3process(d3g);
  const hr = document.createElement('hr');
  hr.style.cssText = 'width: 50%; margin: 30px;';
  ip.appendChild(hr);
  const bu = document.createElement('button');
  bu.id = "btn-cleanall";
  bu.title = "Empty database";
  bu.textContent = 'Empty DB';
  bu.addEventListener('click', empty);
  ip.appendChild(bu);
  const bu2 = document.createElement('button');
  bu2.id = "btn-debugdb";
  bu2.title = "Debug database";
  bu2.textContent = 'Debug DB';
  bu2.addEventListener('click', debugDb);
  ip.appendChild(bu2);
}

function debugDb() {
  const p = new PageIO();
  window.MPAT.pageArray.forEach((page) => {
    const content = page.meta.mpat_content.content;
    const name = page.post_title || page.ID;
    const toDelete = [];
    const layout = window.MPAT.layouts['l' + page.meta.mpat_content.layoutId];
    if (!layout) {
      alert(`Page ${name} has no layout`);
      return;
    }
    const layoutBoxes = layout.meta.mpat_content.layout;
    if (content === undefined) {
      alert(`Page ${name} has no content`);
    } else {
      const contentKeys = Object.keys(content);
      if (!Array.isArray(contentKeys) || contentKeys.length === 0) {
        alert(`Page ${name} has empty content`);
      } else {
        Object.keys(content).forEach((boxName) => {
          if (!layoutBoxes.find(b => b.i === boxName)) {
            toDelete.push(boxName);
          } else {
            // test the content of the component data
            const boxContent = content[boxName];
            // for each state, check
            Object.keys(boxContent).forEach((stateName) => {
              const component = boxContent[stateName];
              const type = component.type;
              if (typeof type !== 'string') {
                alert(`Page ${name} box ${boxName} state ${stateName} has non string type ${type}`);
              }
              const data = component.data;
              if (data && typeof data !== 'object') {
                alert(`Page ${name} box ${boxName} state ${stateName} has non object data ${data}`);
              }
              const styles = component.styles;
              if (styles && typeof styles !== 'object') {
                alert(`Page ${name} box ${boxName} state ${stateName} has non object styles ${styles}`);
              }
            });
          }
        });
      }
      if (toDelete.length > 0) {
        alert(`Page ${name} has extra boxes ${toDelete.join(' ')}`);
        toDelete.forEach(name => delete page.meta.mpat_content.content[name]);
        p.put(
          page.ID,
          {
            ID: page.ID,
            title: page.post_title,
            parent: page.post_parent,
            status: page.post_status,
            mpat_content: page.meta.mpat_content
          },
          () => {
          },
          (e) => {
            alert('error saving page ' + page.ID + ' ' + e);
          }
        );
      }
    }
  });
  alert('end of DB processing');
}

function empty() {
  const p = new PageIO();
  const l = new LayoutIO();
  p.get(
    (pages) => {
      pages.forEach(page => {
        p.remove(
          page.id,
          () => {},
          (e) => alert("Could not delete page " + page.id)
        )
      });
      l.get(
        (layouts) => {
          layouts.forEach(layout => {
            l.remove(
              layout.ID,
              () => {},
              (e) => alert("Could not delete layout " + layout.id)
            )
          });
          alert('end of DB emptying');
        },
        (e) => alert("Could not read DB for layouts")
      )
    },
    () => {
      alert("Could not read DB for pages");
    }
  )

}
