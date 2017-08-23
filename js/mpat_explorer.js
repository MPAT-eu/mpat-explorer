/*
 * find the components in a page, for the page table
 */
export function components(obj) {
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
export function media(obj) {
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
        case 'redbutton':
          if (y.data && y.data.img) {
            res += ',';
            res += lt(y.data.img);
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
export function findLinks(obj) {
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
export function zones(o) {
  let res = '';
  const zones = o.layout || []; //eslint-disable-line
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    res += zone.x * 10;
    res += ',';
    res += zone.y * 10;
    res += '+';
    res += zone.w * 10;
    res += 'x';
    res += zone.h * 10;
    if (zone.static) {
      res += '[S]';
    }
    if (i !== zones.length - 1) res += '<br/>';
  }
  return res;
}

export function ident(label, obj) {
  switch (label) {
    case 'page':
      return obj.page.post_title;
    case 'page_model':
      return obj.page_model.post_title;
    case 'page_layout':
      return obj.page_layout.post_title;
    case 'custom_css':
      return obj.custom_css.ID;
    default:
      break;
  }
  return '';
}
