export type AttributeTypeConstant =
  | typeof Array
  | typeof Boolean
  | typeof Number
  | typeof Object
  | typeof String;

export type AttributeTypeDefault = Array<any> | boolean | number | Object | string;

export type RenderInsertPosition =
  | "replace"
  | "beforebegin"
  | "afterbegin"
  | "beforeend"
  | "afterend";
