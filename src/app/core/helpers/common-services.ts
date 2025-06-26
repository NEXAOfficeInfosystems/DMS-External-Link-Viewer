import { HttpClient } from "@angular/common/http";
import { CommonHttpErrorService } from "../services/CommonHttpErrorService";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CommonService {

  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }



      getuuid(): string {
    return Math.random().toString(36).substring(2, 16) + Date.now().toString(36).substring(-8);
  }
}