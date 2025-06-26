import { DocumentMetaData } from "./documentMetaData";

export interface DocumentView {
  documentId: string;
  isRestricted: boolean;
  extension: string;
  name: string;
  isVersion: boolean;
  isFromPreview?:boolean;
  id?: string;
  categoryId? : string;
  categoryName? : string;
  documentMetaDatas?:DocumentMetaData[];
  description? : string;
  documentType? : string;
  isCheckedIn? : number
  isCheckedOut? : number
  shareId?:string;
  cloudId?:string;
  StepStatus?:string;
  createdDate?:Date;
  type?:string;
  slug?:string;
  documentSize?:DoubleRange;
  createdBy?:string;
  userName?:string;
  companyName?:string;
  isFavourite?:boolean;
  url?:string;
  documentNumber?:string;
  isPersonal?:boolean;
  breadcrumbs?:any;
  isAllowDownload?:boolean;

 
  

}
