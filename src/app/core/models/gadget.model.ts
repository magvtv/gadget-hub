export interface GadgetData {
  [key: string]: string | number | null | undefined;
}

export interface Gadget {
  id?: string;
  name: string;
  data: GadgetData | null;
  createdAt?: string;
  updatedAt?: string;
}
