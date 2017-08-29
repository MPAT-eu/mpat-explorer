import axios from 'axios';

/*
 * This component loads the media information from within JS using the WP REST API
 * and AJAX
 * This is shared by the components Menu, Clone as well as the Preview window.
 *
  * Author: JC Dufourd, Telecom ParisTech
 */
const mediaRestUrl = `${window.wpApiSettings.root}${window.wpApiSettings.versionString}media`;
const restUrl = `${mediaRestUrl}?per_page=100`;

export default class MediaIO {

  constructor() {
    axios.defaults.headers.common['X-WP-Nonce'] = window.wpApiSettings.nonce;
  }

  /*
   * reloads the media unconditionnaly
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
          console.log(mpatExplorerI18n.error, e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(mpatExplorerI18n.error, e.message);
        }
      });
  }

  getPage(pageId, onSuccess, onError) {
    axios
      .get(mediaRestUrl+'/'+pageId, {})
      .then((v) => {
        onSuccess.call(null, v.data);
      })
      .catch((e) => {
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log(mpatExplorerI18n.error, e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(mpatExplorerI18n.error, e.message);
        }
      });
  }

  // updates an existing page
  put(pageId, updated, onSuccess, onError) { // eslint-disable-line
    axios
      .put(`${mediaRestUrl}/${pageId}`, updated)
      .then(onSuccess)
      .catch((e) => {
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log(mpatExplorerI18n.error, e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(mpatExplorerI18n.error, e.message);
        }
      });
  }

  // updates an existing page
  remove(pageId, onSuccess, onError) { // eslint-disable-line
    axios
      .delete(`${mediaRestUrl}/${pageId}`, {data: {force: true}})
      .then(onSuccess)
      .catch((e) => {
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log(mpatExplorerI18n.error, e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(mpatExplorerI18n.error, e.message);
        }
      });
  }

  // creates a new page (e.g. when cloning)
  post(newPage, onSuccess, onError) { // eslint-disable-line
    axios
      .post(mediaRestUrl, newPage)
      .then(onSuccess)
      .catch((e) => {
        onError.call(null, e);
        if (e.response) {
          // The request was made, but the server responded with a status code
          // that falls out of the range of 2xx
          console.log(mpatExplorerI18n.error, e.response.status);
          console.log(e.response.data.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(mpatExplorerI18n.error, e.message);
        }
      });
  }
}
