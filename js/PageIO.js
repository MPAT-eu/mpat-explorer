import axios from 'axios';

/*
 * This component loads the page information from within JS using the WP REST API
 * and AJAX
 * This is shared by the components Menu, Clone as well as the Preview window.
 *
  * Author: JC Dufourd, Telecom ParisTech
 */
const pagesRestUrl = `${window.wpApiSettings.root}${window.wpApiSettings.versionString}pages`;
const restUrl = `${pagesRestUrl}?per_page=100`;

export default class PageIO {
  
  constructor() {
    axios.defaults.headers.common['X-WP-Nonce'] = window.wpApiSettings.nonce;
  }

  /*
   * reloads the pages unconditionnaly
   */
  get(onSuccess, onError) {
    axios
      .get(restUrl, {})
      .then((v) => {
        onSuccess.call(null, v.data);
      })
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

  /*
   * reloads the pages unconditionnaly
   */
  getPage(pageId, onSuccess, onError) {
    axios
      .get(pagesRestUrl+'/'+pageId, {})
      .then((v) => {
        onSuccess.call(null, v.data);
      })
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

  // updates an existing page
  put(pageId, updated, onSuccess, onError) { // eslint-disable-line
    axios
      .put(`${pagesRestUrl}/${pageId}`, updated)
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

  // updates an existing page
  remove(pageId, onSuccess, onError) { // eslint-disable-line
    axios
      .delete(`${pagesRestUrl}/${pageId}`)
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

  // creates a new page (e.g. when cloning)
  post(newPage, onSuccess, onError) { // eslint-disable-line
    axios
      .post(pagesRestUrl, newPage)
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
}
