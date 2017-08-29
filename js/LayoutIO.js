import axios from 'axios';

const rootRestUrl = `${window.wpApiSettings.root}mpat/v1/layout`;

export default class LayoutIO {

  constructor() {
    axios.defaults.headers.common['X-WP-Nonce'] = window.wpApiSettings.nonce;
  }

  get(onSuccess, onError) {
    axios
      .get(rootRestUrl, {})
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

  remove(pageId, onSuccess, onError) { // eslint-disable-line
    axios
      .delete(`${rootRestUrl}/${pageId}`)
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

  post(newPage, onSuccess, onError) { // eslint-disable-line
    axios
      .post(rootRestUrl, newPage)
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
