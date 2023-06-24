import { EditorSettings } from '../user-config.model.js';

export const editorConfigTable = (config: EditorSettings | undefined) => {
   return Object.entries(config || []).map(([key, value]) => ({
      key,
      value,
   }));
};
