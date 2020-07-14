  
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

/* Holds data regarding file for previewFile
 * promise 
 * fileName
 */
const fileDetails = {
  promise:"",
  fileURL:"https:/basil08.github.io/PDFViewer/candida.pdf",
  fileName:"candida.pdf"
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
    document.getElementById('adobe-dc-pdf-view').style = "height: 476px; width: 600px; border: 1px solid #dadada;display:inline-block;";
  };
  document.addEventListener("adobe_dc_view_sdk.ready", ()=>{
    previewFile(fileDetails);
  });
  setFilePickHandler();
};


/*
 * Sets up file handling with file picker
 * Processes files chosen and calls setFilePromise with the corresponding data to populate
 */

let setFilePickHandler = () => {
  const fileToRead = document.getElementById("file-picker");
  fileToRead.addEventListener("change", (event) => {
     const files = fileToRead.files;
     if (files.length > 0) {
        var reader = new FileReader();
        reader.onloadend = (e) => {
            const filePromise = Promise.resolve(e.target.result);
            const fileName = files[0].name;
            setFilePromise(filePromise, fileName);
        };
        reader.readAsArrayBuffer(files[0]);
      }
    }, false);
}

/* 
 * Sets the fileDetails object with relevant value 
 * and calls previewFile 
 */
let setFilePromise = (promise, name) => {
  fileDetails.promise = promise;
  fileDetails.fileName = name;
  fileDetails.fileURL = "";
  previewFile(fileDetails);
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

/*
 * Constructs and calls preview file with specified url
 * Also registers a callback with each Adobe event and sends that
 * event's data to Google Analytics. 
 */
let previewFile = function(fileDetails){
  let adobeDCView = new AdobeDC.View({
    clientId:"1a60003e5fd949c3b91aff19c242caff",
    divId:"adobe-dc-pdf-view",
  });

  adobeDCView.previewFile({
    content:{
      location:{
        url:fileDetails.fileURL,
      },
      promise:fileDetails.promise,
    },
    metaData:{
      fileName:fileDetails.fileName,
    }
  }, viewConfiguration);

  adobeDCView.registerCallback(
    AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
    (event) => {               
      switch(event.type){
        case "DOCUMENT_OPEN":           
          ga("send", "event", {
            eventCategory: "Adobe DC View SDK",
            eventAction: "Document Open",
            eventLabel:`event.data.fileName`
          });
          break;
        case "PAGE_VIEW":
           ga("send", "event", {
                  eventCategory: "Adobe DC View SDK", 
                  eventAction: "Page View",
                  eventLabel:`${event.data.pageNumber} of ${event.data.fileName}` 
              });
          break;
        case "DOCUMENT_DOWNLOAD":
          ga("send", "event", {
                eventCategory: "Adobe DC View SDK", 
                eventAction: "Document Download",
                eventLabel: event.data.fileName
          });
          break;
        case "TEXT_COPY":
          ga("send", "event",{
                eventCategory: "Adobe DC View SDK", 
                eventAction: "Text Copy",
                eventLabel:`${event.data.copiedText} from ${event.data.fileName}`
          });
          break;
        default:                
      }
    },
    {
      enablePDFAnalytics:true,   
      enableFilePreviewEvents:true
    });  
};

// kick-start everything
init();

