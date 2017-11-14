/**
 *
 * Copyright (c) 2017 MPAT Consortium , All rights reserved.
 * Fraunhofer FOKUS, Fincons Group, Telecom ParisTech, IRT, Lacaster University, Leadin, RBB, Mediaset
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors:
 * Jean-Claude Dufourd (jean-claude.dufourd@telecom-paristech.fr)
 **/
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
        if (onSuccess) onSuccess.call(null, v.data);
      })
      .catch((e) => {
        if (onError) onError.call(null, e);
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
      .get(pagesRestUrl+'/'+pageId, {})
      .then((v) => {
        if (onSuccess) onSuccess.call(null, v.data);
      })
      .catch((e) => {
        if (onError) onError.call(null, e);
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
      .put(`${pagesRestUrl}/${pageId}`, updated)
      .then(onSuccess)
      .catch((e) => {
        if (onError) onError.call(null, e);
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
      .delete(`${pagesRestUrl}/${pageId}`)
      .then(onSuccess)
      .catch((e) => {
        if (onError) onError.call(null, e);
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
      .post(pagesRestUrl, newPage)
      .then(onSuccess)
      .catch((e) => {
        if (onError) onError.call(null, e);
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
