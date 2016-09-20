



// Shared Variable

var connections = 0; // count active connections
var ModelURI=null;
var header;
var body;
var TraceName=null ;
var BaseURI=null ;
var obselQueue = [];
var obselXhr = null;

/*=======================================================||
The onconnect is an EventHandler representing        ||
				the code                             ||
	to be called when the connect event is raised    ||
=======================================================  ||*/

onconnect=function(e){

/**Import samotraces-core-debug.js**/
/** MessagePort connection is opened between the associated SharedWorker and the main thread.**/

port = e.ports[0];
connections++;
port.postMessage ({mess:'open'+connections});

port.onmessage = function (event) {
	var DataRecu = event.data;
	var messName = DataRecu.mess;
	port.postMessage ({mess:messName});

		// receive TraceInformation
	if (messName==='TraceInformation') {
		TraceName = DataRecu.Trace_Information.TraceName;
		BaseURI  = DataRecu.Trace_Information.BaseURI;
		ModelURI = DataRecu.Trace_Information.ModelURI;
		port.postMessage({mess:"TraceName "+TraceName});
		port.postMessage({mess:"BaseURI "+BaseURI});
    port.postMessage({mess:"Model_URI "+ModelURI});

	}
		// receive Obsel To send it to ktbs
	else if (messName==='obsel') {
		port.postMessage({mess:"obsel received"});
		port.postMessage({mess:"ModelURI "+ModelURI})
    if ((TraceName=== null)||(BaseURI=== null)||(ModelURI=== null)) {
 			// send message to the collecteur to get information about trace
 			port.postMessage({mess:'GetTraceInf'});
 		}
    enqueueObsel(DataRecu.OBSEL);
	}
  else if (messName=== 'DataPage'){
		header=DataRecu.header;
		body = DataRecu.body;
	}
  else if (messName=== 'GetDataPage'){
		port.postMessage({mess:body});
		port.postMessage({mess:'DataIframe',header:header,body:body});
	}

port.start();
};

function enqueueObsel(obsel) {
  port.postMessage({mess:"enqueueObsel"});
  obselQueue.push(createjsonobsel (obsel));
  port.postMessage({mess:JSON.stringify(obselQueue)});
   if (obselQueue.length > 1 && obselXhr === null) {
       sendObsels();
   }
}
/**
 * Sends the obsels in obselQueue to the configured trace.
 * Asssumes that config has been correctly loaded, obselXhr is null and obselQueue is not empty.
 * Also, ensures that a delay of 'config.postDelay' ms is kept between two queries.
 */
function sendObsels() {
    //console.log("sendObsels", obselXhr === null);
    port.postMessage({mess:"sendObseltoKTBs"+JSON.stringify(obselQueue)});
    obselXhr = new XMLHttpRequest();
    obselXhr.open('POST', BaseURI+TraceName,true);
    //obselXhr.withCredentials = true;
    obselXhr.setRequestHeader('content-type', 'application/json');
    // obselXhr.onerror = function () {
    //     port.postMessage({mess:"error posting obsels: no response"});
    //     obselXhr = null;
    // };

		obselXhr.onreadystatechange = function () {
			if (obselXhr.readyState === 4) {
				if(obselXhr.status === 201) {
					port.postMessage({mess:"ok post:"+obselXhr.status});
					setTimeout(function () {
	            port.postMessage({mess:"settime"});
	            obselXhr = null;
	            if (obselQueue.length) sendObsels();
	        },  1000);
				} else {
					port.postMessage({mess:"error posting obsels:"+obselXhr.status});
					obselXhr = null;

				}
			}
		};
		obselXhr.onerror = function(e) {
			port.postMessage({mess:"Error Status: " + e.target.status});
		};
    obselXhr.send(JSON.stringify(obselQueue));

    obselQueue = [];
}

function createjsonobsel (params){
  var json_obsel = {
        // "@context":	[
        // "http://liris.cnrs.fr/silex/2011/ktbs-jsonld-context",
        //        { "m": ModelURI }
        // ],
        "@type":	"m:" + params.type, // fixed: "SimpleObsel", // TODO KTBS BUG TO FIX
        hasTrace:	"",
        subject:	params.hasOwnProperty("subject")?params.subject:this.get_default_subject(),
        //"m:type":	params.type
      };
      //console.log(params.hasOwnProperty("subject")?params.subject:this.get_default_subject(),params.hasOwnProperty("subject"),params.subject,this.get_default_subject());
      if (params.hasOwnProperty("begin")) { json_obsel.begin = params.begin; }
      if (params.hasOwnProperty("end")) { json_obsel.begin = params.end;}
      if (params.hasOwnProperty("attributes")) {
        for (var attr in params.attributes) {
          if (params.attributes.hasOwnProperty(attr))          {json_obsel["m:" + attr] = params.attributes[attr];}
        }
      }
      return json_obsel ;
}

}
