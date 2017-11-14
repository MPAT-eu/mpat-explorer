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
import cloneLayout from './cloneLayout';
import { process } from './main';

export function explorerData() {
  return window.MPATExplorer; // eslint-disable-line
}

export function userPrompt(msg) {
  return window.prompt(msg); // eslint-disable-line
}

export function refresh() {
  window.location.href = window.location.href;
}

export function userAlert(msg) {
  window.alert(msg); // eslint-disable-line
}

window.onload = function onload() {
  process(window.MPATExplorer);
  window.cloneLayout = cloneLayout;
};
