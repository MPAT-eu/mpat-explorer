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