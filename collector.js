

  /*Trace Information */
  var TraceName = "PrimarytracePhaseTtraining/";
  var BAseURI = "https://liris-ktbs01.insa-lyon.fr:8000/fatma/fderbel/";
  var Model_URI = "https://liris-ktbs01.insa-lyon.fr:8000/fatma/fderbel/simple-trace-model#" ;

  var scripts = document.getElementsByTagName('script');
  var thisScript = scripts[scripts.length-1];
  var path = thisScript.src.replace(/\/script\.js$/, '/');
  var Path_SharedWebWorker = path.replace("collector.js","sharedworkeur.js");
  var Path_Config_File = path.replace("collector.js","configurator.json");

document.addEventListener("DOMContentLoaded", function() {
  "use strict";
  console.log ("the tracing is started");
  /******** get information about trace  from server ****************/
  //listenServer();
      /***** Load webworker ******/
   port = connectToWorker();

  /***** solution with Shared web Worker ************/
  /****** Collect information about document  **********/
  send_URL(document.URL) ;
  /******** get configuration  information  ************/
  if (document.getElementsByTagName("iframe")[0]){
    var iframe = document.getElementsByTagName("iframe")[0];
    //iframe.contentWindow.addEventListener("DOMContentLoaded", function(){alert("dom loaded")}, true);
    iframe.onload = function() {
    getfileconfiguration()
    }
  }
  else  {getfileconfiguration();}
});
/**
 * Create the most appropriate supported worker for posting obsels.
 */
function connectToWorker() {
   console.log ("connectToWorker");
    if (window.SharedWorker ) {

        //console.log(workerUrl);
        var worker = new SharedWorker(Path_SharedWebWorker);
        port = worker.port;
        //port.addEventListener('message', workerMessageHandler);
        port.onmessage = workerMessageHandler;
        port.start();
        //worker.onerror = console.error.bind(console);
    } else {
        console.error("simple worker no implemented yet");
        // TODO implement simpleworker.js and uncomment code below
        //workerUrl = scriptUrl.replace('tracingyou.js', 'simpleworker.js');
        //console.log(workerUrl);
        //worker = new Worker(workerUrl);
        //worker.onmessage = workerMessageHandler;
        //port = worker;
    }
    //console.log(port);
    return port;
}

/**
 * Hanlde message received from the worker.
 * Actually, the worker will only send one message,
 * containing the observation rules for this page.
 * @param evt
 */
function workerMessageHandler(evt) {

    console.log (evt.data.mess);
				var messName = evt.data.mess;
        //var messName = messageRecu.mess;
        if (messName === "GetTraceInf") {
          //listenServer();
          var Trace_Information = {TraceName: TraceName, BaseURI: BAseURI, ModelURI: Model_URI};
      		/**** Send to the webworker traceInformation *****/
      	 port.postMessage({mess: "TraceInformation", Trace_Information: Trace_Information});
        }

}

/**

   get information from file configuration

**/

function getfileconfiguration () {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        if (data === null) {return false ; }
        for (var host = 0;host < data.Page.length;host++) {
          if ((document.URL === data.Page[host].URL) || (document.location.host === data.Page[host].HostName)) {
            makeAllListenersForConfiguration(data.Page[host]);
          }
        }
      } else {
      console.log ("erreur get config file ",xhr);
      }
    }
  };
  xhr.open("GET", Path_Config_File, true);
  xhr.send();
}

/**
  Make listener for all event in config file
**/

function makeAllListenersForConfiguration(Data) {
  "use strict";
  console.log ("page collected");
  var event = Data.event;
  for (var i = 0; i < event.length; i++) {
    // browse selector of each event
    for (var j = 0; j < event[i].selectors.length; j++) {
      if (event[i].selectors[j].iframe) {
            var contentIframe = document.getElementsByTagName("iframe")[0].contentWindow;
            var documentiframe = contentIframe.document
            if ((event[i].selectors[j].Selector === undefined) || (event[i].selectors[j].Selector === "")) {
            if ((event[i].typeObsel === undefined) || (event[i].typeObsel === "")) {
              addEvent (contentIframe.document,event[i].type, sendObsel);
            }
            else {
              //  $(document).on(event[i].type, {typeO: event[i].typeObsel}, sendObselWithType);//TODO
              addEvent (contentIframe.document,event[i].type, sendObselWithType);
            }
          }  //$(document).on(event[i].type, sendObsel); //TODO
          else {
            if ((event[i].typeObsel === undefined) || (event[i].typeObsel === "")) {
              //$(event[i].selectors[j].Selector).on (event[i].type, sendObsel);
              console.log (addEvent (contentIframe.document.querySelector(event[i].selectors[j].Selector),event[i].type, sendObsel));
              addEvent (contentIframe.document.querySelector(event[i].selectors[j].Selector),event[i].type, sendObsel);

            }
            else {
              //$(event[i].selectors[j].Selector).on (event[i].type, {typeO: event[i].typeObsel}, sendObselWithType);
              contentIframe.document.querySelector(event[i].selectors[j].Selector).typeO = event[i].typeObsel ;
              addEvent (contentIframe.document.querySelector(event[i].selectors[j].Selector),event[i].type, sendObselWithType);
            }
          }
      }

      else {
          if ((event[i].selectors[j].Selector === undefined) || (event[i].selectors[j].Selector === "")) {
          if ((event[i].typeObsel === undefined) || (event[i].typeObsel === "")) {
            addEvent (document,event[i].type, sendObsel);
          }
          else {
            //  $(document).on(event[i].type, {typeO: event[i].typeObsel}, sendObselWithType);//TODO
            addEvent (document,event[i].type, sendObselWithType);
          }
        }  //$(document).on(event[i].type, sendObsel); //TODO
        else {
          if ((event[i].typeObsel === undefined) || (event[i].typeObsel === "")) {
            //$(event[i].selectors[j].Selector).on (event[i].type, sendObsel);
            console.log (addEvent (document.querySelector(event[i].selectors[j].Selector),event[i].type, sendObsel));
            addEvent (document.querySelector(event[i].selectors[j].Selector),event[i].type, sendObsel);

          }
          else {
            //$(event[i].selectors[j].Selector).on (event[i].type, {typeO: event[i].typeObsel}, sendObselWithType);
            document.querySelector(event[i].selectors[j].Selector).typeO = event[i].typeObsel ;
            addEvent (document.querySelector(event[i].selectors[j].Selector),event[i].type, sendObselWithType);
          }
        }
      }
      }
  }
}

var  getXPath = function (element) {
  "use strict";
  // derived from http://stackoverflow.com/a/3454579/1235487
  while (element && element.nodeType !== 1) {
    element = element.parentNode;
  }
  if (typeof (element) === "undefined") { return "(undefined)"; }
  if (element === null) { return "(null)"; }

  var xpath = "";
  for (true; element && element.nodeType === 1; element = element.parentNode) {
    var id = Array.prototype.indexOf.call(element.parentNode.childNodes, element);
    id = (id > 1  ?  "[" + id + "]"  :  "");
    xpath = "/" + element.tagName.toLowerCase() + id + xpath;
  }
return xpath;
};

var getElementName = function (element) {
  "use strict";
  while (element && element.nodeType !== 1) {
    element = element.parentNode;
  }
  if (typeof (element) === "undefined") { return "(undefined)"; }
  if (element === null) { return "(null)"; }
  var id = Array.prototype.indexOf.call(element.parentNode.childNodes, element);
  id = (id > 1  ?  "[" + id + "]"  :  "");
  var nameE = element.tagName.toLowerCase() + id;
  return nameE;
};

var getElementId = function (element) {
  "use strict";
  while (element && element.nodeType !== 1)  {
    element = element.parentNode;
  }
  if (typeof (element) === "undefined") { return "(undefined)"; }
  if (element === null) { return "(null)"; }
  if (typeof (element.id) !== "undefined") { return element.id; }
  return "#";
};
Date.prototype.format = function(format) { // jshint ignore:line
  "use strict";
  var o = {
  "M+": this.getMonth() + 1, //month
  "d+": this.getDate(),    //day
  "h+": this.getHours(),   //hour
  "m+": this.getMinutes(), //minute
  "s+": this.getSeconds(), //second
  "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
  "S": this.getMilliseconds() //millisecond
  };
  if (/(y+)/.test(format)) {
	   format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
	   if (new RegExp("(" + k + ")").test(format)) {
		     format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
       }
  }
  return format;
};

function fillCommonAttributes (e, attributes) {
  "use strict";
  attributes.hasDate = new Date().format("yyyy-MM-dd h:mm:ss");
  attributes.hasType = e.type;
  attributes.hasDocument_URL = document.URL;
  attributes.hasDocument_Title = document.title;
  attributes.ctrlKey = e.ctrlKey;
  attributes.shiftKey = e.shiftKey;
  attributes.hasTarget = getXPath(e.target);
  attributes.hasTarget_targetName = getElementName(e.target);
  if (e.target.id) { attributes.hasTarget_targetId = e.target.id; }
  if (e.target.alt) { attributes.hasTarget_ALT = e.target.alt; }
  if (e.target.value) {attributes.hasTarget_Value = e.target.value;}
  if (e.target.firstChild) {if ((e.target.firstChild.nodeValue) && (e.target.firstChild.nodeValue !== "")) {attributes.hasTarget_TextNode = e.target.firstChild.nodeValue.replace(/[\n]/gi, "");}}
  if (e.keyCode) {attributes.keyCode = e.keyCode;}
  if (e.target.className) {attributes.hasTarget_ClassName = e.target.className.toString();}
  if (e.target.text) {
  var text = e.target.text.replace(/[\n]/gi, "");
  attributes.hasTarget_targetText = text; }
  if (e.target.title) {attributes.hasTarget_Title = e.target.title;}
  if (e.currentTarget) {
    attributes.currentTarget = getXPath(e.currentTarget);
    attributes.hascurrentTarget_currentTargetName = getElementName(e.currentTarget);
    if (e.currentTarget.id) {
      attributes.hasCurrentTarget_currentTargetId = getElementId(e.currentTarget);
    }
    if (e.currentTarget.text) {
      var texte = e.currentTarget.text.replace(/[\n]/gi, "");
      attributes.hasCurrentTarget_currentTargetText = texte;
    }
  }
  if (e.explicitOriginalTarget) {
    attributes.hasOriginalTarget = getXPath(e.explicitOriginalTarget);
    attributes.hasOriginalTarget_originalTargetName = getElementName(e.explicitOriginalTarget);
    if (e.explicitOriginalTarget.id) {
      attributes.hasOriginalTarget_originalTargetId = getElementId(e.explicitOriginalTarget);
    }
    if (e.explicitOriginalTarget.text) {
      attributes.hasOriginalTarget_originalTargetText = e.explicitOriginalTarget.text;
    }
  }
  if (e.target.tagName === "IMG") {
    attributes.hasImgSrc = e.target.src;
  }
}
/**
  other function
**/
var sendObsel =  function(e) {
  "use strict";
  var obsel = {};
  var attribute = {
    'x': e.clientX,
    'y': e.clientY,
  };
  fillCommonAttributes(e, attribute);
  obsel.type  = e.type ;
  obsel.subject = e.type;
  obsel.attributes = attribute;
  port.postMessage({mess: "obsel", OBSEL: obsel});
};

var sendObselWithType =  function(e) {
  "use strict";
  var obsel = {};
  var attribute = {
    'x': e.clientX,
    'y': e.clientY,
  };
  fillCommonAttributes(e, attribute);
  console.log(e.target.typeO);
  obsel.type = e.target.typeO ;
  obsel.subject = e.type;
  obsel.attributes = attribute ;
  port.postMessage({mess: "obsel", OBSEL: obsel});
};

var addEvent = function (el, eventType, handler) {
  "use strict";
  if (el.addEventListener) { // DOM Level 2 browsers
    el.addEventListener(eventType, handler, false);
  } else if (el.attachEvent) { // IE <= 8
    el.attachEvent('on' + eventType, handler);
  } else { // ancient browsers
    el['on' + eventType] = handler;
  }
};

function send_URL(URL) {
  "use strict";
  var attribute = {};
  attribute.hasType="Open_Page";
  attribute.hasSubject="obsel of action open page ";
  attribute.attributes={};
  attribute.attributes.hasDate =new Date().format("yyyy-MM-dd h:mm:ss");
  attribute.attributes.hasDocument_URL = URL;
  attribute.attributes.hasDocument_Title = document.title;
  /**** Send to webworker *****/
  port.postMessage({mess: "obsel", OBSEL: attribute});
}
