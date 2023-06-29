export interface Entry {
  form: Form;
  sense?: SenseEntity[] | null;
  $: $;
  listBibl?: ListBibl | null;
  gramGrp?: GramGrpEntity[] | null;
  etym?: Etym | null;
}
export interface Form {
  orth: GramEntityOrOrthOrForm;
  gramGrp?: GramGrpEntity1[] | null;
  $: $1;
  form?: GramEntityOrOrthOrForm1 | null;
  pron?: string | null;
}
export interface GramEntityOrOrthOrForm {
  $: $1;
  $text: string;
}
export interface $1 {
  type: string;
}
export interface GramGrpEntity1 {
  iType?: IType | null;
  gramGrp?: GramGrpEntity2[] | null;
}
export interface IType {
  $: $2;
  $text: string;
}
export interface $2 {
  type: string;
  corresp: string;
}
export interface GramGrpEntity2 {
  gram?: GramEntityOrOrthOrForm[] | null;
  $: $3;
  gramGrp?: GramGrpEntity3[] | null;
}
export interface $3 {
  type: string;
  subtype?: string | null;
}
export interface GramGrpEntity3 {
  gram?: GramEntityOrOrthOrForm[] | null;
  $: $3;
  gramGrp?: GramGrpEntity4[] | null;
}
export interface GramGrpEntity4 {
  gram?: GramEntityOrOrthOrForm[] | null;
  $: $3;
  gramGrp?: GramGrpEntity5[] | null;
}
export interface GramGrpEntity5 {
  gram?: GramEntityOrOrthOrForm[] | null;
  $: $1;
}
export interface GramEntityOrOrthOrForm1 {
  $: $1;
  $text: string;
}
export interface SenseEntity {
  def: string;
  $: $4;
  xr?: Xr | null;
  gramGrp?: GramGrpEntity6[] | null;
  sense?: SenseEntity1[] | null;
}
export interface $4 {
  id: string;
  n: string;
}
export interface Xr {
  ref: string;
  $: $5;
}
export interface $5 {
  type: string;
  id?: string | null;
}
export interface GramGrpEntity6 {
  gramGrp?: GramGrpEntity7[] | null;
  gram?: string[] | null;
}
export interface GramGrpEntity7 {
  gram?: GramEntityOrOrthOrForm[] | null;
  $: $3;
  gramGrp?: GramGrpEntity8[] | null;
}
export interface GramGrpEntity8 {
  gramGrp?: GramGrpEntity9[] | null;
  $: $3;
  gram?: GramEntityOrOrthOrForm[] | null;
}
export interface GramGrpEntity9 {
  gram?: GramEntityOrOrthOrForm[] | null;
  $: $1;
  gramGrp?: GramGrpEntity5[] | null;
}
export interface SenseEntity1 {
  def: string;
  $: $4;
  xr?: Xr1 | null;
  gramGrp?: GramGrpEntity10[] | null;
}
export interface Xr1 {
  ref: string;
  $: $5;
}
export interface GramGrpEntity10 {
  gramGrp?: GramGrpEntity3[] | null;
  gram?: string[] | null;
}
export interface $ {
  id: string;
  sortKey: string;
  n: string;
  type: string;
}
export interface ListBibl {
  bibl: Bibl[];
}
export interface Bibl {
  $: $6;
  biblScope?: string | null;
}
export interface $6 {
  corresp: string;
}
export interface GramGrpEntity {
  gramGrp?: GramGrpEntity5[] | null;
}
export interface Etym {
  mentioned: string;
  $text: string;
}
