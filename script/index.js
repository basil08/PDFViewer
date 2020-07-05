
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

/*
 * Constructs and calls preview file with specified url
 * Also registers a callback with each Adobe event and sends that
 * event's data to Google Analytics. 
 */
var previewFile = function(){
	var adobeDCView = new AdobeDC.View({
		clientId:"1a60003e5fd949c3b91aff19c242caff",
		divId:"adobe-dc-pdf-view",
	});

	adobeDCView.previewFile({
		content:{
			location:{
				url:"https://basil08.github.io/NSEA-question-paper-2017.pdf",
			},
		},
		metaData:{
			fileName: "NSEA-question-paper-2017.pdf"
		}
	}, viewConfiguration);

	adobeDCView.registerCallback(
		AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
		function(event){								// the callback for all Adobe Events
			switch(event.type){
				case "DOCUMENT_OPEN": 					// send relevant ones to ga
					ga('send','event','DOCUMENT_OPEN', event.data.fileName, 'Document was opened.');
					break;
				case "PAGE_VIEW":
					ga('send','event','PAGE_VIEW',`${event.data.pageNumber} of ${event.data.fileName}`, 'view page');
					break;
				case "DOCUMENT_DOWNLOAD":
					ga('send','event','DOCUMENT_DOWNLOAD',event.data.fileName,'Document download');
					break;
				case "TEXT_COPY":
					ga('send','event','TEXT_COPY',`${event.data.copiedText} from ${event.data.fileName}`, 'text copied');
					break;
				default: 								// ignore all the rest for now..
			}
		},
		{
			enablePDFAnalytics:true,
		}
		);	
}

var init = function(){
	// setup event handlers for each button
	document.getElementById("full-window-btn").onclick = function(){
		setViewMode('FULL_WINDOW');
		// revert back to full window style for the body and div elements
		document.getElementsByTagName('body').style = "margin: 0px";
		document.getElementById('adobe-dc-pdf-view').style = "";
	}
	document.getElementById("inline-btn").onclick = function(){
		setViewMode('IN_LINE');
		// revert back to inline style for the body and div elements
		document.getElementsByTagName('body').style = "margin: 0px";
		document.getElementById('adobe-dc-pdf-view').style = "";
	}
	document.getElementById("sized-btn").onclick = function(){
		setViewMode('SIZED_CONTAINER');
		// revert to sized container style
		document.getElementsByTagName('body').style = "margin:100px 0 0 200px";
		document.getElementById('adobe-dc-pdf-view').style = "height: 476px; width: 600px; border: 1px solid #dadada";
	}
	// call previewFile for the 1st time when sdk is ready
	document.addEventListener("adobe_dc_view_sdk.ready" , previewFile);
}


/*
 *	Set up new view mode by setting viewConfiguration object's embedMode property
 *  Also calls previewFile() to render PDF freshly
 */
var setViewMode = function(newEmbedMode){
	if(newEmbedMode){
		viewConfiguration.embedMode = newEmbedMode;
	}
	previewFile();
}
// kick-start everything
init();
