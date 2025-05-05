import { Pager } from "./Pager";

export interface PaginationView<T> {
  Items?: T;
  Pager: Pager;
}
