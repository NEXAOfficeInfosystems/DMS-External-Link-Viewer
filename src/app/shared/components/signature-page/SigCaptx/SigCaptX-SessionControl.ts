/* **************************************************************************
  SigCaptX-SessionControl.ts
   
  This Typescript file contains functions to start up the connection with the SigCaptX service. 
  
  Copyright (c) 2021 Wacom Co. Ltd. All rights reserved.
  
   v1.0
  
***************************************************************************/
import { SignaturePageComponent } from '../signature-page.component';
import { LICENCEKEY, SERVICEPORT, TIMEOUT } from './SigCaptX-Globals';
import { SigCapture } from './capture';
import { WacomGSS_SignatureSDK, JSONreq } from './wgssSigCaptX';
import { ToastrService } from 'ngx-toastr';

declare global {
  interface window {
    JSONreq: any;
    sdkPtr: any;
  }
}

export class SessionControl {
  static timeout: any;
  constructor(private toastrService: ToastrService) { }
  static showSuccessMessage(message: string): void {
    const toastrService = SessionControl.prototype.toastrService; // Use the injected instance
    if (toastrService) {
      toastrService.success(message);
    } else {
      console.warn('ToastrService is not available.');
    }
  }

  /* This static is called if connection with the SigCaptX service has to be re-initiated because for whatever reason it has stopped or failed */
  static actionWhenRestarted() {
    SigCapture.sigCtl = null;
    SigCapture.dynCapt = null;

    // if(null != SigCapture.HTMLTagIds.imageBox.firstChild)
    // {
    //   SigCapture.HTMLTagIds.imageBox.removeChild(SigCapture.HTMLTagIds.imageBox.firstChild);
    // }
    // this.timeout = setTimeout(SessionControl.timedDetect, TIMEOUT);

    // pass the starting service port  number as configured in the registry
    // console.log("Starting up WacomGSS_SignatureSDK");
    window.JSONreq = JSONreq;

    let wgssSignatureSDK = new WacomGSS_SignatureSDK(SessionControl.onDetectRunning, SERVICEPORT);

    window.sdkPtr = wgssSignatureSDK;
    // console.log( window.sdkPtr );
    // console.log(window.sdkPtr.running);
  }

  static timedDetect() {
    if (window.sdkPtr.running) {
      // console.log("Signature SDK Service detected.");
      SessionControl.start();
    }
    else {
      // console.log("Signature SDK Service not detected.");
    }
  }

  static onDetectRunning() {
    // console.log("jkgu8yg up WacomGSS_SignatureSDK");
    if (window.sdkPtr.running) {
      // console.log("Signature SDK Service detected.")
      SignaturePageComponent.deviceDetected = true;

      // clearTimeout(this.timeout);
      // console.log("Starting...")
      SessionControl.start();
    }
    else {

      SignaturePageComponent.prototype.showErrorMessage("Signature SDK Service not detected.", "Error");
    }
  }

  static start() {
    if (window.sdkPtr.running) {
      // console.log("Checking components ...");
      SigCapture.sigCtl = new window.sdkPtr.SigCtl(SessionControl.onSigCtlConstructor);
    }
  }

  static onSigCtlConstructor(sigCtlV, status) {
    if (SigCapture.callbackStatusOK("SigCtl Constructor", status)) {
      sigCtlV.PutLicence(LICENCEKEY, SessionControl.onSigCtlPutLicence);
    }
  }

  static onDynCaptConstructor(dynCaptV, status) {
    if (SigCapture.callbackStatusOK("DynCapt Constructor", status)) {
      SigCapture.sigCtl.GetSignature(SessionControl.onGetSignature);
    }
  }

  static onSigCtlPutLicence(sigCtlV, status) {
    if (SigCapture.callbackStatusOK("SigCtl PutLicence", status)) {
      SigCapture.dynCapt = new window.sdkPtr.DynamicCapture(SessionControl.onDynCaptConstructor);
    }
  }

  static onGetSignature(sigCtlV, sigObjV, status) {
    if (SigCapture.callbackStatusOK("SigCapt GetSignature", status)) {
      sigCtlV.GetProperty("Component_FileVersion", SessionControl.onSigCtlGetFileVersion);
    }
  }

  static onGetSigCaptXVersion(version, status) {
    if (SigCapture.callbackStatusOK("SigCaptX GetVersion", status)) {
      // console.log("SigCaptX  v" + version);
      SigCapture.sigCtl.GetProperty("Component_FileVersion", SessionControl.onSigCtlGetFileVersion);
    }
  }

  static onSigCtlGetFileVersion(sigCtlV, property, status) {
    if (SigCapture.callbackStatusOK("SigCtl GetProperty", status)) {
      // console.log("DLL: flSigCOM.dll  v" + property.text);
      SigCapture.dynCapt.GetProperty("Component_FileVersion", SessionControl.onDynCaptGetFileVersion);
    }
  }

  static onDynCaptGetFileVersion(dynCaptV, property, status) {
    if (SigCapture.callbackStatusOK("DynCapt GetProperty", status)) {
      // console.log("DLL: flSigCapt.dll v" + property.text);
      // console.log("Test application ready.");
      // console.log("Press 'Capture' to capture a signature.");
      /*
      if('static' === typeof callback)
      {
        callback();
      }
      */
    }
  }
}