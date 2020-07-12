  
const viewConfiguration = {
    defaultViewMode: "FIT_PAGE",
    embedMode:"FULL_WINDOW",
    showPageControls:true,
    dockPageControls:true,
    showAnnotationsTools:true,
    showLeftHandPanel:false,
    showDownloadPDF:true,
    showPrintPDF:true,
    enableFormFilling:false
};

// the dafault PDF to render
const fileDetails = {
  fileURL:"https://basil08.github.io/PDFViewer/sample.pdf",
  fileName:"sample.pdf"
}

let init = () => {
  // setup event handlers for each button
  document.getElementById("full-window-btn").onclick = () => {
    setViewMode('FULL_WINDOW');
    // revert back to full window style for the body and div elements
    document.getElementsByTagName('body').style = "margin: 0px";
    document.getElementById('adobe-dc-pdf-view').style = "";
  };
  document.getElementById("inline-btn").onclick = () => {
    setViewMode('IN_LINE');
    // revert back to inline style for the body and div elements
    document.getElementsByTagName('body').style = "margin: 0px";
    document.getElementById('adobe-dc-pdf-view').style = "";
  };
  document.getElementById("sized-btn").onclick = () => {
    setViewMode('SIZED_CONTAINER');
    // revert to sized container style
    document.getElementsByTagName('body').style = "margin:100px 0 0 200px";
    document.getElementById('adobe-dc-pdf-view').style = "height: 476px; width: 600px; border: 1px solid #dadada";
  };

  document.getElementById("file-load-btn").onclick = () => {
    setFileDetails();
  };
  // call previewFile for the 1st time when sdk is ready
  document.addEventListener("adobe_dc_view_sdk.ready" , () => {
    previewFile(fileDetails);
  });
};


// Assume all urls are correct!
let isValidURL = (url) => {
  let validURLRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/
  // let validURLRegex = /^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/
  return validURLRegex.test(url) && url.endsWith(".pdf");
}

/*
 *  Set up new view mode by setting viewConfiguration object's embedMode property
 *  Also calls previewFile() to render PDF freshly
 */
let setViewMode = (newEmbedMode) => {
  if(newEmbedMode){
    viewConfiguration.embedMode = newEmbedMode;
  }
  previewFile(fileDetails);
};

let setFileDetails = () => {
  let url = document.getElementById("file-url-box").value;
  if(!url){
    document.getElementById("box-help").textContent = "Please specified a URL";
    document.getElementById("box-help").style.color = "#ff0000";
  }
  else if(!isValidURL(url)){
    document.getElementById("box-help").textContent = "Invalid URL path";
    document.getElementById("box-help").style.color = "#ff0000";
  }
  else{
    document.getElementById("box-help").textContent = "";
    document.getElementById("box-help").style.color = "#000000";
    fileDetails.fileURL = url;
    fileDetails.fileName = url.slice(url.lastIndexOf("/") + 1);     // kind of lousy, but alright for the purpose
    previewFile(fileDetails);
  }
}

/*
 * Constructs and calls preview file with specified url
 * Also registers a callback with each Adobe event and sends that
 * event's data to Google Analytics. 
 */
let previewFile = function(fileDetails){
  var adobeDCView = new AdobeDC.View({
    clientId:"33fb79e7874542ce968eef99bbfeac22",
    divId:"adobe-dc-pdf-view",
  });

  adobeDCView.previewFile({
    content:{
      location:{
        url:fileDetails.fileURL,
      },
    },
    metaData:{
      fileName:fileDetails.fileName,
    }
  }, viewConfiguration);

  adobeDCView.registerCallback(
    AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
    (event) => {                // the callback for all Adobe Events
      switch(event.type){
        case "DOCUMENT_OPEN":           // send relevant ones to ga
          ga("send", "event", {
            eventCategory: "Adobe DC View SDK",
            eventAction: "Document Open",
            eventLabel:`event.data.fileName`
          });
          // ga('send','event','DOCUMENT_OPEN', event.data.fileName, 'Document was opened.');
          break;
        case "PAGE_VIEW":
           ga("send", "event", {
                  eventCategory: "Adobe DC View SDK", 
                  eventAction: "Page View",
                  eventLabel:`${event.data.pageNumber} of ${event.data.fileName}` 
              });
          // ga('send','event','PAGE_VIEW',`${event.data.pageNumber} of ${event.data.fileName}`, 'view page');
          break;
        case "DOCUMENT_DOWNLOAD":
          ga("send", "event", {
                eventCategory: "Adobe DC View SDK", 
                eventAction: "Document Download",
                eventLabel: event.data.fileName
          });
          // ga('send','event','DOCUMENT_DOWNLOAD',event.data.fileName,'Document download');
          break;
        case "TEXT_COPY":
          ga("send", "event",{
                eventCategory: "Adobe DC View SDK", 
                eventAction: "Text Copy",
                eventLabel:`${event.data.copiedText} from ${event.data.fileName}`
          });
          // ga('send','event','TEXT_COPY',`${event.data.copiedText} from ${event.data.fileName}`, 'text copied');
          break;
        default:                // ignore all the rest for now..
      }
    },
    {
      enablePDFAnalytics:true,      // there is something more also
      enableFilePreviewEvents:true
    });  
};


// kick-start everything
init();

// call previewFile for the 1st time when sdk is ready
//   document.addEventListener("adobe_dc_view_sdk.ready" , () => {
//     previewFile(fileDetails);
// });
// previewFile(fileDetails);
  
