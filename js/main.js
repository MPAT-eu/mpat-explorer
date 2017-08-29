import { findLinks, components, ident, media, zones } from './mpat_explorer';
import { d3ize, d3process } from './graph';
import PageIO from './PageIO';
import LayoutIO from './LayoutIO';
import ModelIO from './ModelIO';
import MediaIO from './MediaIO';
import OptionIO from './OptionIO';

function preprocess(o) {
  window.MPAT = {
    pages: {},
    pageArray: [],
    layouts: {}
  };
  o.forEach((obj) => {
    if (obj.page) {
      window.MPAT.pages['p' + obj.page.ID] = obj.page;
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
  sum.textContent = mpatExplorerI18n.completeInfo;
  pre.appendChild(sum);
  const bq = document.createElement('blockquote');
  pre.appendChild(bq);
  // const det1 = document.createElement('details');
  // bq.appendChild(det1);
  // bq.appendChild(document.createElement('br'));
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
    if (label === 'custom_css') {
      rest.textContent = obj.custom_css.post_content;
    } else if (keys.length === 1) {
      rest.textContent = JSON.stringify(obj[keys[0]], null, 2);
    } else {
      rest.textContent = JSON.stringify(obj, null, 2);
    }
    bq1.appendChild(rest);
    bq.appendChild(odet);
  }
  ip.appendChild(pre);
  // raw JSON object for debug purposes
  // sum = document.createElement('summary');
  // sum.textContent = 'Raw JSON';
  // det1.appendChild(sum);
  // const bq2 = document.createElement('blockquote');
  // det1.appendChild(bq2);
  // const pre2 = document.createElement('pre');
  // pre2.textContent = JSON.stringify(o, null, 2);
  // bq2.appendChild(pre2);
  // ip.appendChild(document.createElement('br'));
  // insert the web site map at the end
  const det2 = document.createElement('h3');
  ip.appendChild(det2);
  det2.textContent = mpatExplorerI18n.websiteGraph;
  const det3 = document.createElement('p');
  ip.appendChild(det3);
  det3.textContent = mpatExplorerI18n.zoom;
  const d3g = d3ize(websitegraph);
  d3process(d3g);
  const hr = document.createElement('hr');
  hr.style.cssText = 'width: 50%; margin: 30px;';
  ip.appendChild(hr);
  const bu = document.createElement('button');
  bu.id = "btn-cleanall";
  bu.title = mpatExplorerI18n.emptyDatabase;
  bu.textContent = mpatExplorerI18n.emptyDB;
  bu.addEventListener('click', empty);
  ip.appendChild(bu);
  const bu2 = document.createElement('button');
  bu2.id = "btn-debugdb";
  bu2.title = mpatExplorerI18n.debugDatabase;
  bu2.textContent = mpatExplorerI18n.debugDB;
  bu2.addEventListener('click', debugDb);
  ip.appendChild(bu2);
  const but2 = document.getElementById('explorerPutPage');
  but2.addEventListener('click', explorerPutPage);
  const selector = document.getElementById('page-id-field');
  window.MPAT.pageArray.forEach((page) => {
    const name = page.post_title || page.ID;
    const opt = document.createElement('option');
    selector.appendChild(opt);
    opt.value = page.ID;
    opt.textContent = name;
  });
  selector.addEventListener('change', explorerGetPage);
  const selector2 = document.getElementById('model-id-field');
  commonModelIO.get(
    (models) => {
      models.forEach((model) => {
        const name = model.post_title || model.ID;
        const opt = document.createElement('option');
        selector2.appendChild(opt);
        opt.value = model.ID;
        opt.textContent = name;
      });
    },
    (e) => { }
  );
  selector2.addEventListener('change', explorerGetModel);
  const but3 = document.getElementById('explorerPutModel');
  but3.addEventListener('click', explorerPutModel);
  const selector3 = document.getElementById('option-id-field');
  selector3.addEventListener('change', explorerGetOption);
  const but4 = document.getElementById('explorerPutOption');
  but4.addEventListener('click', explorerPutOption);
}

const commonPageIO = new PageIO();
const commonLayoutIO = new LayoutIO();
const commonModelIO = new ModelIO();
const commonMediaIO = new MediaIO();
const commonOptionIO = new OptionIO();
let currentPage = null;
let currentModel = null;
let currentOption = null;

function explorerGetPage() {
  currentModel = null;
  currentOption = null;
  const pageId = document.getElementById('page-id-field').value;
  if (pageId > 0) {
    commonPageIO.getPage(
      pageId,
      (page) => {
        currentPage = page;
        delete page.mpat_content.layout;
        document.getElementById('mpat-text-editing').value =
          JSON.stringify(page.mpat_content, null, 4);
      },
      (error) => {
        document.getElementById('mpat-text-editing').value =
          mpatExplorerI18n.errorGettingPage + pageId + "\n" + JSON.stringify(error, null, 2);
      }
    );
  } else {
    window.alert(mpatExplorerI18n.pageIs + pageId);
  }
}

function explorerGetModel() {
  currentPage = null;
  currentOption = null;
  const modelId = document.getElementById('model-id-field').value;
  if (modelId > 0) {
    commonModelIO.getModel(
      modelId,
      (model) => {
        currentModel = model;
        delete model.mpat_content.layout;
        document.getElementById('mpat-text-editing').value =
          JSON.stringify(model.mpat_content, null, 4);
      },
      (error) => {
        document.getElementById('mpat-text-editing').value =
          mpatExplorerI18n.errorGettingModel + modelId + "\n" + JSON.stringify(error, null, 2);
      }
    );
  } else {
    window.alert(mpatExplorerI18n.modelIs + modelId);
  }
}

function explorerGetOption() {
  currentPage = null;
  currentModel = null;
  const optionId = document.getElementById('option-id-field').value;
  if (optionId !== "0") {
    commonOptionIO.getModel(
      optionId,
      (option) => {
        currentOption = option;
        document.getElementById('mpat-text-editing').value =
          JSON.stringify(option, null, 4);
      },
      (error) => {
        document.getElementById('mpat-text-editing').value =
          mpatExplorerI18n.erroGettingOption + optionId + "\n" + JSON.stringify(error, null, 2);
      }
    );
  } else {
    window.alert(mpatExplorerI18n.optionIs + optionId);
  }
}

function explorerPutPage() {
  if (!currentPage) return;
  const pageId = document.getElementById('page-id-field').value;
  currentPage.mpat_content = JSON.parse(document.getElementById('mpat-text-editing').value);
  commonPageIO.put(
    pageId,
    currentPage,
    (res) => {
      document.getElementById('mpat-text-editing').value =
        mpatExplorerI18n.pageUpdated + pageId;
    },
    (error) => {
      document.getElementById('mpat-text-editing').value =
        mpatExplorerI18n.errPutPage + pageId + "\n" + JSON.stringify(error, null, 2);
    }
  );
}

function explorerPutModel() {
  if (!currentModel) return;
  const modelId = document.getElementById('model-id-field').value;
  currentModel.mpat_content = JSON.parse(document.getElementById('mpat-text-editing').value);
  commonModelIO.put(
    modelId,
    currentModel,
    (res) => {
      document.getElementById('mpat-text-editing').value =
        mpatExplorerI18n.modelUpdated + modelId;
    },
    (error) => {
      document.getElementById('mpat-text-editing').value =
        mpatExplorerI18n.errPutModel + modelId + "\n" + JSON.stringify(error, null, 2);
    }
  );
}

function explorerPutOption() {
  if (!currentOption) return;
  const optionId = document.getElementById('option-id-field').value;
  currentOption = JSON.parse(document.getElementById('mpat-text-editing').value);
  commonOptionIO.put(
    optionId,
    currentOption,
    (res) => {
      document.getElementById('mpat-text-editing').value =
        mpatExplorerI18n.optionUpdated + optionId;
    },
    (error) => {
      document.getElementById('mpat-text-editing').value =
        mpatExplorerI18n.errPutOption + optionId + "\n" + JSON.stringify(error, null, 2);
    }
  );
}

function debugDb() {
  window.MPAT.pageArray.forEach((page) => {
    const content = page.meta.mpat_content.content;
    const name = page.post_title || page.ID;
    const toDelete = [];
    let toUpdate = false;
    const layout = window.MPAT.layouts['l' + page.meta.mpat_content.layoutId];
    if (!layout) {
      alert(`${mpatExplorerI18n.Page} ${name} ${mpatExplorerI18n.hasNoLayout}`);
      return;
    }
    const layoutBoxes = layout.meta.mpat_content.layout;
    if (content === undefined) {
      alert(`${mpatExplorerI18n.Page} ${name} ${mpatExplorerI18n.hasNoContent}`);
    } else {
      const contentKeys = Object.keys(content);
      if (!Array.isArray(contentKeys) || contentKeys.length === 0) {
        alert(`${mpatExplorerI18n.Page} ${name} ${mpatExplorerI18n.hasEmptyContent}`);
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
                alert(`${mpatExplorerI18n.Page} ${name} ${mpatExplorerI18n.box} ${boxName} ${mpatExplorerI18n.state} ${stateName} has non string type ${type}`);
              }
              const data = component.data;
              if (data && typeof data !== 'object') {
                alert(`${mpatExplorerI18n.Page} ${name} ${mpatExplorerI18n.box} ${boxName} ${mpatExplorerI18n.state} ${stateName} has non object data ${data}`);
                if (typeof data === 'string') {
                  component.data = { text: data };
                  toUpdate = true;
                }
              }
              const styles = component.styles;
              if (styles && typeof styles !== 'object') {
                alert(`${mpatExplorerI18n.Page} ${name} ${mpatExplorerI18n.box} ${boxName} ${mpatExplorerI18n.state} ${stateName} has non object styles ${styles}`);
              }
            });
          }
        });
      }
      if (toDelete.length > 0 || toUpdate) {
        if (toDelete.length > 0) {
          alert(`Page ${name} has extra boxes ${toDelete.join(' ')}`);
          toDelete.forEach(name => delete page.meta.mpat_content.content[name]);
        }
        commonPageIO.put(
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
            alert(mpatExplorerI18n.errorSavePage + page.ID + ' ' + e);
          }
        );
      }
    }
  });
  alert('end of DB processing');
}

function empty() {
  commonPageIO.get(
    (pages) => {
      pages.forEach(page => {
        commonPageIO.remove(
          page.id,
          () => { },
          (e) => alert(mpatExplorerI18n.couldNotDeletePage+ page.id)
        )
      });
      commonModelIO.get(
        (pages) => {
          pages.forEach(page => {
            commonModelIO.remove(
              page.ID,
              () => { },
              (e) => alert(mpatExplorerI18n.couldNotDeletePage+ page.ID)
            )
          });
          commonLayoutIO.get(
            (layouts) => {
              layouts.forEach(layout => {
                commonLayoutIO.remove(
                  layout.ID,
                  () => { },
                  (e) => alert(mpatExplorerI18n.couldNotDeleteLayout + layout.ID)
                )
              });
              alert(mpatExplorerI18n.endOfDBemptying);
            },
            (e) => alert(mpatExplorerI18n.couldNotReadDB4Layout)
          )
        },
        () => {
          alert(mpatExplorerI18n.couldNotReadDB4Model);
        }
      )
    },
    () => {
      alert(mpatExplorerI18n.couldNotReadDB4Page);
    }
  );
  commonMediaIO.get(
    (medias) => {
      medias.forEach((media) => {
        commonMediaIO.remove(
          media.id,
          () => { },
          (e) => alert(mpatExplorerI18n.couldNotDeleteMedia + media.id)
        )
      });
    }
  );
}
