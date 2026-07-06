export type PluginToUIMessage = {
  type: 'SELECTION_INFO';
  count: number;
};

export type UIToPluginMessage = {
  type: 'REQUEST_SELECTION_INFO';
};
