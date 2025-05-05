import { PagerCondition } from "./PagerCondition";

export interface Pager {
  Condition: PagerCondition;
  TotalItems: number;
  CurrentPage: number;
  PageSize: number;
  TotalPages: number;
  StartPage: number;
  EndPage: number;
}
