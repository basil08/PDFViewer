
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
		function(event){
			switch(event.type){
				case "DOCUMENT_OPEN":
					console.log("Document is opened.");
					ga('send','event','DOCUMENT_OPEN', event.data.fileName, 'Document was opened.');
					break;
				case "PAGE_VIEW":
					console.log("You are viewing");
					ga('send','event','PAGE_VIEW',`${event.data.pageNumber} of ${event.data.fileName}`, 'view page');
					break;
				case "DOCUMENT_DOWNLOAD":
					console.log("Document is being downloaded");
					ga('send','event','DOCUMENT_DOWNLOAD',event.data.fileName,'Document download');
					break;
				case "TEXT_COPY":
					console.log("Text is being copied.");
					ga('send','event','TEXT_COPY',`${event.data.copiedText} from ${event.data.fileName}`, 'text copied');
					break;
				default:
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
	}
	document.getElementById("inline-btn").onclick = function(){
		setViewMode('IN_LINE');
	}
	document.getElementById("sized-btn").onclick = function(){
		setViewMode('SIZED_CONTAINER');
	}
	document.addEventListener("adobe_dc_view_sdk.ready" , previewFile);
}


var setViewMode = function(newEmbedMode){
	if(newEmbedMode){
		viewConfiguration.embedMode = newEmbedMode;
		//DEBUG:
		console.log("New Embed Mode: "+viewConfiguration.embedMode);
	}
	// this shouldn't be called here..maybe
	previewFile();
}

init();
// https://basil08.github.io/NSEA-question-paper-2017.pdf
// NSEA-question-paper-2017.pdf