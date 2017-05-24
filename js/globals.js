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
