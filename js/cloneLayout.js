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
import { explorerData, userPrompt, refresh, userAlert } from './globals';
import LayoutIO from './LayoutIO';

let lio = null;

export default function cloneLayout(layoutIndex) {
  // the index of the layout in the php table is passed
  if (lio === null) {
    lio = new LayoutIO();
  }
  const explorer = explorerData(); // get the php table
  const layout = explorer[layoutIndex].page_layout;
  const newName = userPrompt(mpatExplorerI18n.nameOfCloneLayout);
  if (newName === '') {
    return;
  }
  layout.post_title = newName;
  layout.post_name = newName;
  layout.mpat_content = layout.meta.mpat_content; // different structure between php and rest
  delete layout.ID; // remove existing ID
  delete layout.guid; // remove existing link with old name
  delete layout.meta; // different structure between php and rest
  lio.post(
    layout,
    ((id) => refresh()),
    ((err) => userAlert(err))
  );
}
