import axios from 'axios';

const rootRestUrl = `${window.wpApiSettings.root}mpat/v1/option`;

export default class OptionIO {

  constructor() {
    axios.defaults.headers.common['X-WP-Nonce'] = window.wpApiSettings.nonce;
  }

  get(onSuccess, onError) {
    axios
      .get(rootRestUrl, {})
      .then((v) => {
        if (onSuccess) onSuccess.call(null, v.data);
      })
      .catch((e) => {
        if (onError) onError.call(null, e);
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

  getModel(modelId, onSuccess, onError) {
    axios
      .get(rootRestUrl+'/'+modelId, {})
      .then((v) => {
        if (onSuccess) onSuccess.call(null, v.data);
      })
      .catch((e) => {
        if (onError) onError.call(null, e);
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

  remove(pageId, onSuccess, onError) { // eslint-disable-line
    axios
      .delete(`${rootRestUrl}/${pageId}`)
      .then(onSuccess)
      .catch((e) => {
        if (onError) onError.call(null, e);
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

  post(newPage, onSuccess, onError) { // eslint-disable-line
    axios
      .post(rootRestUrl, newPage)
      .then(onSuccess)
      .catch((e) => {
        if (onError) onError.call(null, e);
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
