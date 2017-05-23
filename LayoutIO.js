import axios from 'axios';

/*
 * This component loads the page_layout information from within JS using the WP REST API
 * and AJAX
 * This is asynchronous the first time it is called, synchronous after that.
 *
 * API:
 * - LayoutIO.get(success, error)
 * You pass it a success function, which gets an array of pages to work on,
 * and an error function, which gets an error message to display
 *
 * - LayoutIO.put(pageId, newContent, error)
 * pageId is the post id of the page, newContent is the updated content
 * in the same format as what comes from get, and error is same as get
 *
 * - LayoutIO.post(newContent, onSuccess, onError)
 *
 * - LayoutIO.reload(onSuccess, onError)
 * to be called to refresh the loaded pages, e.g. after puts and posts
 *
 * Author: JC Dufourd, Telecom ParisTech
 */
export default class LayoutIO {

  static loader = null;
  static pages = null;
  static error = null;
  static rootRestUrl = null;
  static restUrl = null;

  static reload(onSuccess, onError) {
    axios
      .get(LayoutIO.restUrl, {})
      .then((v) => {
        LayoutIO.pages = v.data;
        onSuccess.call(null, v.data);
      })
      .catch((e) => {
        LayoutIO.error = e;
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log('Error', e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', e.message);
        }
      });
  }

  static get(onSuccess, onError) {
    if (LayoutIO.loader === null) {
      LayoutIO.loader = new LayoutIO(onSuccess, onError);
    } else if (LayoutIO.pages) {
      onSuccess.call(null, LayoutIO.pages);
    } else {
      onError.call(null, LayoutIO.error);
    }
  }

  static put(pageId, updated, onError) {
    axios
      .put(`${LayoutIO.rootRestUrl}/${pageId}`, updated)
      .catch(e => {
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log('Error', e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', e.message);
        }
      });
  }

  static post(newPage, onSuccess, onError) {
    axios
      .post(LayoutIO.rootRestUrl, newPage)
      .then(onSuccess)
      .catch((e) => {
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log('Error', e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', e.message);
        }
      });
  }

  constructor(onSuccess, onError) {
    LayoutIO.rootRestUrl = `${window.wpApiSettings.root}mpat/v1/layout`;
    const pp = 'per_page=100'; //100 is max limit (default?)
    LayoutIO.restUrl = `${LayoutIO.rootRestUrl}`;
    if (LayoutIO.rootRestUrl.indexOf('?') > 0) {
      LayoutIO.restUrl = `${LayoutIO.rootRestUrl}&${pp}`;
    } else {
      LayoutIO.restUrl = `${LayoutIO.rootRestUrl}?${pp}`;
    }
    axios.defaults.headers.put['X-WP-Nonce'] = window.wpApiSettings.nonce;
    LayoutIO.reload(onSuccess, onError);
  }
}
