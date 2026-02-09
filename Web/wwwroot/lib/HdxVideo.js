
'use strict';

/** @const */
var DEBUG_ONLY = false;




var HDX_DO_VIDEO_REDIRECTION = HDX_DO_VIDEO_REDIRECTION || (HDX_DO_VIDEO_REDIRECTION === undefined);
var HDX_DO_PAGE_REDIRECTION = HDX_DO_PAGE_REDIRECTION || false;
var HDX_DO_INPLACE_NAVIGATION = HDX_DO_INPLACE_NAVIGATION || (typeof HDX_DO_PAGE_REDIRECTION === 'string');
var HDX_DO_VIDEO_SUPPRESSION = HDX_DO_VIDEO_SUPPRESSION || false;
var HDX_DO_VIDEO_CLIPPING = HDX_DO_VIDEO_CLIPPING || false;
var HDX_TABID = '';

var hdxMediaStream = hdxMediaStream || {};

if (typeof hdxMediaStream.version === 'undefined') {
hdxMediaStream.version = '1.1.1';

hdxMediaStream.foundVideos = [];
hdxMediaStream.pendingVideos = [];
hdxMediaStream.redirectedVideos = {}; //associative array
hdxMediaStream.videoidx = 0;

hdxMediaStream.origAddEventListener = null;
hdxMediaStream.origRemoveEventListener = null;
hdxMediaStream.origDispatchEvent = null;


hdxMediaStream.stringifyArray = function(arr) {
	var str = '[';
	for (var i = 0; i < arr.length; ++i)
	{
		if (i != 0)
			str += ',';
		str += hdxMediaStream.stringify(arr[i]);
	}
	str += ']';
	return str;
};

hdxMediaStream.stringifyObject = function(obj) {
	var str = '{';
	var first = true;
	for (var prop in obj)
	{
		if (first)
			first = false;
		else
			str = str + ',';

		str = str + '"' + prop + '":';
		if (obj[prop] instanceof Array)
			str = str + hdxMediaStream.stringifyArray(obj[prop]);
		else if (typeof obj[prop] == 'object')
			str = str + hdxMediaStream.stringifyObject(obj[prop]);
		else
			str = str + JSON.stringify(obj[prop]);
	}
	str = str + '}';

	return str;
};

hdxMediaStream.stringify = function(v) {
	if (typeof v == 'object')
		return hdxMediaStream.stringifyObject(v);
	else
		return JSON.stringify(v);
};

hdxMediaStream.getElementAttrNumeric = function(el, attr) {
	var rv = undefined;

	if (el.hasAttribute(attr)) {
		rv = el.getAttribute(attr);
	}

	var style = (el.getComputedStyle) ? el.getComputedStyle(el, null) : el.style;

	if (style[attr] !== '') {
		rv = parseFloat(style[attr]);
	}

	return rv;
};


hdxMediaStream.setWindowTitle = function(title, sender) {
	if ((!window.parent) || (window == window.parent))
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'setWindowTitle: ' + title);
		if (title)
		{ // enqueue or set title
			// save original title
			if (!hdxMediaStream.oldTitle)
			{
				hdxMediaStream.documentTitleMutator.start();
				hdxMediaStream.oldTitle = document.title;
				hdxMediaStream.pendingTitles = [];
				hdxMediaStream.documentTitleMutator.updateDocumentTitle(title);
				sender.postMessage({ /**@expose*/ msgtype: 'winid', /**@expose*/ parameter: undefined}, '*');
			}
			else
			{ // we already have a title... enqueue this one
				hdxMediaStream.pendingTitles.push({title: title, sender: sender});
			}
		}
		else
		{ // move to next available title, or return to original title.
			if (hdxMediaStream.pendingTitles.length)
			{
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'setWindowTitle: Titles remain: ' + hdxMediaStream.pendingTitles.length);
				var nextItem = hdxMediaStream.pendingTitles.shift();
				hdxMediaStream.documentTitleMutator.updateDocumentTitle(nextItem.title);
				nextItem.sender.postMessage({msgtype: 'winid', parameter: undefined}, '*'); //reply to sender
			}
			else
			{
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'setWindowTitle: No titles remain.  Reverting to original title.');
				hdxMediaStream.documentTitleMutator.updateDocumentTitle(hdxMediaStream.oldTitle);
				hdxMediaStream.oldTitle = undefined;
			}
		}
	}
	else
	{
		// send a message to the top window
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'setWindowTitle (referring action to parent): ' + title);
		window.top.postMessage({msgtype: 'title', parameter: title}, '*');
	}
};

// The documentTitleMutator ensures that the title of the document is always set to a value expected by this script.
hdxMediaStream.documentTitleMutator = {
    self: hdxMediaStream.documentTitleMutator,

    expectedTitle: document.title,

    updateDocumentTitle: function (newTitle) {
        self.expectedTitle = newTitle;
        document.title = newTitle;
    },

    start: function () {
        if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'documentTitleMutator.start()');
        if (!self.mutationObserver) {
            if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'documentTitleMutator.start(): starting MutationObserver');
            self.mutationObserver = new MutationObserver(
				function (mutationsList) {
				    if (self.expectedTitle != document.title) {
				        document.title = self.expectedTitle;
				        if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'documentTitleMutator.corrector(): corrected title to: ' + document.title);
				    }
				}
			);
            self.mutationObserver.observe(document, { childList: true, subtree: true });
        }
    }
};

// This listener routine allows for communication between parent window and child iframes across
// domains.  We use it as the normal channel for the setWindowTitle() routine to acknowledge that
// a window title has been successfully set, regardless of whether we're in an iframe or not.
window.addEventListener('message', function(messageEvent) {
	//DEBUG_TRACE('HdxVideo.js] onMessage type: ' + messageEvent['data']['msgtype'] + ' param: ' + messageEvent['data']['parameter']);

	if (!messageEvent['data'] || !messageEvent['data']['msgtype']) {
		// message probably not meant for us
	} else if (messageEvent['data']['msgtype'] == 'title') {
		hdxMediaStream.setWindowTitle(messageEvent['data']['parameter'], messageEvent.source);
	} else if (messageEvent['data']['msgtype'] == 'winid') {
		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'winid'
		});
	} else if (messageEvent['data']['msgtype'] == 'getOrigin') {
		if (!hdxMediaStream.boundingRectListeners)
			hdxMediaStream.boundingRectListeners = [];
		if (hdxMediaStream.boundingRectListeners.indexOf(messageEvent.source) == -1)
			hdxMediaStream.boundingRectListeners.push(messageEvent.source);

		if ((!window.parent) || (window == window.parent)) {
			// root window
			hdxMediaStream.origin = {left: 0, top: 0};

			var frameElements = document.getElementsByTagName('iframe');
			for (var i = 0; i < frameElements.length; ++i) {
				try {
					if (frameElements[i].contentWindow == messageEvent.source) {
						var r = hdxMediaStream.getFrameInsideRect(frameElements[i]);
						messageEvent.source.postMessage({msgtype: 'setOrigin', parameter: {left: r.left, top: r.top}}, '*');
						if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Posted origin to child.');
					}
				} catch (err) {}
			}

		} else {
			// child window... asks parentwindow for updated origin
			window.parent.postMessage({msgtype: 'getOrigin', parameter: false}, '*');
		}
	} else if (messageEvent['data']['msgtype'] == 'setOrigin') {
		if ((!hdxMediaStream.origin) ||
		(hdxMediaStream.origin.left != messageEvent['data']['parameter'].left) ||
		(hdxMediaStream.origin.top != messageEvent['data']['parameter'].top)) {

			hdxMediaStream.origin = messageEvent['data']['parameter'];
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'New origin: {' + hdxMediaStream.origin.left + ', ' + hdxMediaStream.origin.top + '}');

			if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
				hdxMediaStream.WSSendObject({
					/**@expose*/ v: 'origin',
					/**@expose*/ x: hdxMediaStream.origin.left,
					/**@expose*/ y: hdxMediaStream.origin.top
				});
			}
			hdxMediaStream.onOriginChanged();
			hdxMediaStream.onRegionChanged();
		}
	} else if (messageEvent['data']['msgtype'] == 'visibleRegion') {
		//DEBUG_TRACE('HdxVideo.js] Message: visibleRegion');
		if ((!hdxMediaStream.region) ||
			!hdxMediaStream.regionListsEqual(hdxMediaStream.region, messageEvent['data']['parameter']) ) {

			hdxMediaStream.region = messageEvent['data']['parameter'];

			var rectSansScrollbars = {
				left: 0,
				top: 0,
				right: document.documentElement.clientWidth,
				bottom: document.documentElement.clientHeight,
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight
				};

			var sendRegion = hdxMediaStream.intersectRgnRect(hdxMediaStream.region, rectSansScrollbars);

			if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
				hdxMediaStream.WSSendObject({
					/**@expose*/ v: 'region',
					/**@expose*/ c: sendRegion
				});
			}
			hdxMediaStream.onRegionChanged();
		}
	} else if (messageEvent['data']['msgtype'] == 'getClientScreenOffset') {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Message: getClientScreenOffset');

		if (!hdxMediaStream.boundingRectListeners)
			hdxMediaStream.boundingRectListeners = [];
		if (hdxMediaStream.boundingRectListeners.indexOf(messageEvent.source) == -1)
			hdxMediaStream.boundingRectListeners.push(messageEvent.source);

		var child_cso = messageEvent['data']['parameter'];
		var frameElements = document.getElementsByTagName('iframe');
		for (var i = 0; i < frameElements.length; ++i) {
			try {
				if (frameElements[i].contentWindow == messageEvent.source) {
					var child_r = hdxMediaStream.getFrameInsideRect(frameElements[i]);
					hdxMediaStream.sendLocalClientScreenOffset({
						left: child_cso.left - child_r.left,
						top: child_cso.top - child_r.top
					});
				}
			} catch (err) {}
		}
	} else if (messageEvent['data']['msgtype'] == 'setClientScreenOffset') {
		hdxMediaStream.sendGlobalClientScreenOffset(messageEvent['data']['parameter']);
	} else if (messageEvent['data']['msgtype'] == 'clenupReq') {
		//notify child frames
		hdxMediaStream.OnClenupReq();
	} else if (messageEvent['data']['msgtype'] == 'clenupAck') {
		//notify child frames
		hdxMediaStream.OnClenupAck();
    } else if (messageEvent['data']['msgtype'] == 'RedirectionStatus') {
        // The message is meant for the content script.  Ignore it.
	} else {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Unknown message type: ' + messageEvent['data']['msgtype']);
	}
}, false);

hdxMediaStream.onWSMessage = function(messageEvent) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '<<< ' + messageEvent['data']);
	var v = JSON.parse(messageEvent['data']);
	if (v['v'] == 'winid')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: winid: ' + v['title']);
		hdxMediaStream.setWindowTitle(v['title'], window);
	}
	else if (v['v'] == 'play')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: play: ' + v['id']);
		hdxMediaStream.OnPlayNotification(v['id']);
	}
	else if (v['v'] == 'pause')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: pause: ' + v['id']);
		hdxMediaStream.OnPauseNotification(v['id']);
	}
	else if (v['v'] == 'eos')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: eos: ' + v['id']);
		hdxMediaStream.OnEOSNotification(v['id']);
	}
	else if (v['v'] == 'time')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: time: ' + v['id'] + ' - ' + v['time']);
		hdxMediaStream.OnTimeNotification(v['id'], v['time']);
	}
	else if (v['v'] == 'buffered')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: buffered: ' + v['id'] + ' - ' + v['ranges']);
		hdxMediaStream.OnBufferedNotification(v['id'], v['ranges']);
	}
	else if (v['v'] == 'error')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: error: ' + v['id']);
		hdxMediaStream.OnErrorNotification(v['id'], v['svrender']);
	}
	else if (v['v'] == 'pageredir')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: pageredir');
		hdxMediaStream.OnPageRedirCommit();
	}
	else if (v['v'] == 'vidsz')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: vidsz: ' + v['id'] + ' - ' + v['w'] + 'x' + v['h']);
		hdxMediaStream.OnVideoSizeNotification(v['id'], v['w'], v['h']);
	}
	else if (v['v'] == 'duration')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: duration: ' + v['id'] + ' - ' + v['value']);
		hdxMediaStream.OnDurationNotification(v['id'], v['value']);
	}
	else if (v['v'] == 'canplaythrough')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: canplaythrough: ' + v['id']);
		hdxMediaStream.OnCanPlaythroughNotification(v['id']);
	}
	else if (v['v'] == 'src')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: src: ' + v['id'] + ' - ' + v['src']);
		hdxMediaStream.OnSrcNotification(v['id'], v['src']);
	}
	else if (v['v'] == 'nav')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: nav: ' + v['url'] + ' svrender: ' + v['svrender']);
		hdxMediaStream.OnNavNotification(v['url'], v['svrender']);
	}
	else if (v['v'] == 'title')
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: title: ' + v['t']);
		hdxMediaStream.OnTitleNotification(v['t']);
	}
	else if (v['v'] == 'windowopen') {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: windowopen: ' + v['u']);
		hdxMediaStream.OnWindowOpen(v['u']);
	}
	else
	{
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSMessage: Unknown message received!');
	}
};

hdxMediaStream.onWSOpen = function() {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSOpen:');

	var uri = (typeof HDX_DO_PAGE_REDIRECTION === 'string') ? HDX_DO_PAGE_REDIRECTION : document.location.href;
	//var eUri = encodeURI(uri);

	if (HDX_TABID)
		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'tabid',
			/**@expose*/ id: HDX_TABID
		});

	hdxMediaStream.WSSendObject({
		/**@expose*/ v: 'pageurl',
		/**@expose*/ url: uri
	});

	hdxMediaStream.getOrigin();
	hdxMediaStream.onVisibilityChange();
	hdxMediaStream.onResize();
};

hdxMediaStream.onWSClose = function(closeEvent) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSClose: code=' + closeEvent.code + ' clean=' + closeEvent.wasClean + ' ' + closeEvent.reason);
	try {
		hdxMediaStream.suspendRedirection();
	} catch (exc) {
		console.log('[HdxVideo.js] suspendRedirection(): exception closing WebSocket: ' + exc.message);
	}
};

hdxMediaStream.onWSError = function() {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onWSError:');
	try {
		hdxMediaStream.suspendRedirection(true);
	} catch (exc) {
		console.log('[HdxVideo.js] suspendRedirection(): exception on WebSocket error: ' + exc.message);
	}
};

hdxMediaStream.WSSendObject = function(obj) {
	var strObj = hdxMediaStream.stringify(obj);
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '>>> ' + strObj);
	try {
		hdxMediaStream.websocket.send(strObj);
	} catch (exc) {
		console.log('[HdxVideo.js] WSSendObject(): exception: ' + exc.message);
	}
};

hdxMediaStream.redirectionStates = {
	LOADING: 1,
	REDIRECTED: 2,
	SUSPENDED: 3,
};

hdxMediaStream.suspendRedirection = function(svrender) {
	for (var key in hdxMediaStream.redirectedVideos) {
		hdxMediaStream.redirectedVideos[key].hdxvid.setError(2); // MEDIA_ERR_NETWORK
		hdxMediaStream.redirectedVideos[key].hdxvid.unhook(true);
		delete hdxMediaStream.redirectedVideos[key].hdxvid;
		hdxMediaStream.pendingVideos = hdxMediaStream.pendingVideos.concat(hdxMediaStream.redirectedVideos[key]);
	}
	hdxMediaStream.redirectedVideos = {};

	for (var key in hdxMediaStream.pendingVideos) { // unhook pending videos, too.
		if (hdxMediaStream.pendingVideos[key].hdxEventHandlerHook)
			hdxMediaStream.pendingVideos[key].hdxEventHandlerHook.unintercept();
	}

	if (hdxMediaStream.pageRedirectionState == hdxMediaStream.redirectionStates.LOADING) {
		// still loading
		if (!svrender) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Clearing content due to SVLM.');
			document.body.innerHTML = '';
		}
	} else if (hdxMediaStream.pageRedirectionState == hdxMediaStream.redirectionStates.REDIRECTED) {
		if (svrender) {
			//TODO: put this back once 'reload' is fixed in BHO:
			sessionStorage.setItem('hdxMediaStream.fallback', 'true');
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Setting hdxMediaStream.fallback = true');
			window.location.reload(true);
		}
	}

	hdxMediaStream.pageRedirectionState = hdxMediaStream.redirectionStates.SUSPENDED;
	document.body.style.display = '';
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Showing content -- suspendRedirection.');

    // HDX-16786: Send a message to the content script informing it of the state of redirection.
    window.postMessage({ msgtype: "RedirectionState", text: "SUSPENDED" }, "*");

	hdxMediaStream.allowOnload();
}

hdxMediaStream.printWindowPosition = function() {
	// print "screen" position of actual window.
	//DEBUG_TRACE('HdxVideo.js] Window: (' + ((window.screenLeft) ? (window.screenLeft) : (window.screenX)) + ', ' + ((window.screenTop) ? (window.screenTop) : (window.screenY)) + ')');
};

hdxMediaStream.sendEvent = function(vid, evtName) {
	try {
		var evt = document.createEvent('Event');
		evt.initEvent(evtName, true, true);
		vid.dispatchEvent(evt);
	} catch (ex) {
		console.log('[HdxVideo.js] sendEvent(): exception dispatching "' + evtName + '" event: ' + ex.message);
	}
};

hdxMediaStream.OnPlayNotification = function(videoid) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnPlayNotification: initiated playback...');
		if (vid.hdxvid.paused && this.reqstate == '')
			hdxMediaStream.sendEvent(vid, 'play'); // server-initiated
		if (this.reqstate == 'play')
			this.reqstate = ''; // got the response we were expecting
		vid.hdxvid.paused = false;
		vid.hdxvid.playing = true;
		vid.hdxvid.ended = false;
		vid.hdxvid.hasPlayedOnce = true;
		vid.hdxvid.resyncTimer();
		hdxMediaStream.sendEvent(vid, 'playing');
	}
};

hdxMediaStream.OnPauseNotification = function(videoid) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnPauseNotification: pausing playback...');
		if (!vid.hdxvid.paused && this.reqstate == '')
			hdxMediaStream.sendEvent(vid, 'pause'); // server-initiated
		if (this.reqstate == 'pause')
			this.reqstate == ''; // got the response we were expecting
		vid.hdxvid.paused = true;
		vid.hdxvid.playing = false;
		vid.hdxvid.resyncTimer();
	}
};

hdxMediaStream.OnEOSNotification = function(videoid) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnEOSNotification: ended playback...');
		vid.hdxvid.paused = true;
		vid.hdxvid.playing = false;
		vid.hdxvid.ended = true;
		hdxMediaStream.sendEvent(vid, 'pause');
		hdxMediaStream.sendEvent(vid, 'ended');
		if (vid.loop)
			vid.play();
		else
			vid.hdxvid.resyncTimer();
	}
};

hdxMediaStream.OnTimeNotification = function(videoid, time) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnTimeNotification: ' + time);
		vid.hdxvid.reportedPosition = time;
		vid.hdxvid.reportedPositionTime = new Date();
		vid.hdxvid.resyncTimer();
		hdxMediaStream.sendEvent(vid, 'timeupdate');
	}
};

hdxMediaStream.OnBufferedNotification = function(videoid, ranges) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnBufferedNotification: ' + ranges);
		vid.hdxvid.reportedBufferedRanges = ranges;
		hdxMediaStream.sendEvent(vid, 'progress');
	}
};

hdxMediaStream.OnErrorNotification = function(videoid, svrender) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnErrorNotification(' + videoid + '): ' + svrender);

	if (videoid) {
		var vid = hdxMediaStream.redirectedVideos[videoid];
		if (vid) {
			if (!svrender) {
				hdxMediaStream.sendEvent(vid, 'error');
				hdxMediaStream.sendEvent(vid, 'abort');
			}
			vid.hdxvid.unhook(svrender);
		}
	} else {
		hdxMediaStream.suspendRedirection(svrender);
	}
};

hdxMediaStream.recomputeSize = function(hdxvid) {
	if (typeof hdxvid.attrWidth === 'undefined' && typeof hdxvid.attrHeight === 'undefined') {
		hdxvid.computedWidth = hdxvid.videoWidth;
		hdxvid.computedHeight = hdxvid.videoHeight;
	} else if (typeof hdxvid.attrWidth === 'undefined') {
		hdxvid.computedWidth = hdxvid.attrHeight * hdxvid.videoWidth / (hdxvid.videoHeight ? hdxvid.videoHeight : 1);
		hdxvid.computedHeight = hdxvid.attrHeight;
	} else if (typeof hdxvid.attrHeight === 'undefined') {
		hdxvid.computedWidth = hdxvid.attrWidth;
		hdxvid.computedHeight = hdxvid.attrWidth * hdxvid.videoHeight / (hdxvid.videoWidth ? hdxvid.videoWidth : 1);
	} else {
		hdxvid.computedWidth = hdxvid.attrWidth;
		hdxvid.computedHeight = hdxvid.attrHeight;
	}

	hdxvid.origProps.width.set.bind(hdxvid.target)(hdxvid.computedWidth);
	hdxvid.origProps.height.set.bind(hdxvid.target)(hdxvid.computedHeight);

	hdxMediaStream.sendEvent(hdxvid.target, 'resize');
};

hdxMediaStream.OnVideoSizeNotification = function(videoid, width, height) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnVideoSizeNotification:');
		vid.hdxvid.videoWidth = width;
		vid.hdxvid.videoHeight = height;

		hdxMediaStream.recomputeSize(vid.hdxvid);
	}
};

hdxMediaStream.OnDurationNotification = function(videoid, duration) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnDurationNotification:');
		vid.hdxvid.duration = duration;
		hdxMediaStream.sendEvent(vid, 'durationchange');

		vid.hdxvid.makeVisible(true);
	}
};

hdxMediaStream.OnCanPlaythroughNotification = function(videoid) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnCanPlaythroughNotification:');
		hdxMediaStream.sendEvent(vid, 'loadedmetadata');
		hdxMediaStream.sendEvent(vid, 'loadeddata');
		hdxMediaStream.sendEvent(vid, 'progress');
		hdxMediaStream.sendEvent(vid, 'canplay');
		hdxMediaStream.sendEvent(vid, 'canplaythrough');
	}
};

hdxMediaStream.OnSrcNotification = function(videoid, src) {
	var vid = hdxMediaStream.redirectedVideos[videoid];
	if (vid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnSrcNotification: ' + src);
		vid.hdxvid.currentSrc = src;
	}
};

hdxMediaStream.splitURL = function(url) {
	var matches = url.match(/^([^:\\\/]*(?::\/\/)?)([^\\\/]*)(.*)/);
	return [matches[1], matches[2], matches[3]];
};

hdxMediaStream.OnNavNotification = function(url, svrender) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnNavNotification: ' + url);
	if (!HDX_DO_INPLACE_NAVIGATION) {
		if (svrender) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnNavNotification: svrender-initiated nav to: ' + url + '  current: ' + window.location.href);
			window.location = url;
		} else if (window.location.href != url) {
			var from = hdxMediaStream.splitURL(window.location.href);
			var to = hdxMediaStream.splitURL(url);
			if (from[0] == '' || from[1] == '' || from[0] != to[0] || from[1] != to[1]) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnNavNotification: hard nav to: ' + url + '  current: ' + window.location.href);
				window.location = url;
			} else {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnNavNotification: soft nav to: ' + url + '  current: ' + window.location.href);
				history.pushState({url:url}, url, url);
			}
		}
	}
};

hdxMediaStream.OnTitleNotification = function(title) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnTitleNotification: ' + title);

	var deTitle = decodeURI(title);
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnTitleNotification: ' + deTitle);

	hdxMediaStream.documentTitleMutator.updateDocumentTitle(deTitle);
};

hdxMediaStream.OnWindowOpen = function (url) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnWindowOpen: ' + url);
	window.open(url, '_blank', '', false);
};

hdxMediaStream.popstateHandler = function (event) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'popstateHandler: ' + hdxMediaStream.stringify(event.state));
	if (event.state && event.state.url)
		window.location = event.state.url;
	else
		window.location.reload();
};

hdxMediaStream.redirectVideo = function(video) {
	var idx = ++hdxMediaStream.videoidx;
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'redirectVideo(): ' + idx);
	hdxMediaStream.redirectedVideos[idx] = video;

	// commit to discarding the events we've already captured, and all future events until we unhook.
	if (video.hdxEventHandlerHook)
		video.hdxEventHandlerHook.discardCapturedEvents();

	hdxMediaStream.WSSendObject({
		/**@expose*/ v: 'add',
		/**@expose*/ id: idx
	});

	var proxy = new hdxMediaStream.HdxVideo(video, idx);

	var attrSource = video.hdxvid.origSrc;
	if (attrSource) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Video ' + idx + ' source (attr): ' + attrSource);

		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'src',
			/**@expose*/ id: idx,
			/**@expose*/ src: attrSource,
			/**@expose*/ type: video.getAttribute('type')
		});
	}

	var sources = video.getElementsByTagName('source');
	for (var i = 0; i < sources.length; i++) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Video ' + idx + ' source (element): ' + sources[i].src);

		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'src',
			/**@expose*/ id: idx,
			/**@expose*/ src: sources[i].src,
			/**@expose*/ type: sources[i].getAttribute('type')
		});
	}

	hdxMediaStream.sendEvent(video, 'loadstart');

	hdxMediaStream.WSSendObject({
		/**@expose*/ v: 'srcset',
		/**@expose*/ id: idx
	});

	hdxMediaStream.WSSendObject({
		/**@expose*/ v: 'controls',
		/**@expose*/ id: idx,
		/**@expose*/ controls: !!(proxy.controls)
	});

	if (video.autoplay)
		proxy.target.play();
};

hdxMediaStream.doPageRedirection = function() {
	if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
		hdxMediaStream.pageRedirectionState = hdxMediaStream.redirectionStates.LOADING;

        // HDX-16786: Send a message to the content script informing it of the state of redirection.
        window.postMessage({ msgtype: "RedirectionState", text: "LOADING" }, "*");

        hdxMediaStream.pendingVideos = []; // redirecting the page means we will ignore any videos found on it

		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'pageredir'
		});
	}
};

hdxMediaStream.OnPageRedirCommit = function() {
	console.log('[HdxVideo.js] Redirecting page -- 화이팅! ' + window.location);
	hdxMediaStream.pageRedirectionState = hdxMediaStream.redirectionStates.REDIRECTED;
	//initiate cleanup for all child frames
	hdxMediaStream.initiateCleanup();

    // HDX-16786: Send a message to the content script informing it of the state of redirection.
    window.postMessage({ msgtype: "RedirectionState", text: "REDIRECTED" }, "*");
};


hdxMediaStream.initiateCleanup = function () {
	//need this to stop ack upline
	hdxMediaStream.cleanupOriginator = true;
	hdxMediaStream.cleanupAckCount = 0;
	//send message to myself to request cleanup
	window.postMessage({ msgtype: 'clenupReq', parameter: undefined }, '*');
};


hdxMediaStream.OnClenupReq = function () {
	var frames = window.frames;
	if (frames == null || !frames.length) {
		hdxMediaStream.cleanupAckCount++;
		window.postMessage({ msgtype: 'clenupAck', parameter: undefined }, '*');
		return;
	}

	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '1-1 cleanupAckCount=' + hdxMediaStream.cleanupAckCount + ' frames.length=' + frames.length);

	//notify all child frames
	var i;
	for (i = 0; i < frames.length; i++) {
		try {
			var wnd = null;
			if (frames[i].contentWindow) {
				wnd = frames[i].contentWindow;
			} else if (frames[i].window) {
				wnd = frames[i].window;
			}

			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'processing child frame: i=' + i);

			if (wnd != null && typeof wnd != "undefined" && typeof wnd.location != "undefined" && !hdxMediaStream.isTrivialUrl(wnd.location)) {
				wnd.postMessage({ msgtype: 'clenupReq', parameter: undefined }, '*');
				hdxMediaStream.cleanupAckCount++;
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'postMessage clenupReq to child frame window: ' + wnd.location);
			}
		}
		catch(ex) {
			console.log('[HdxVideo.js] OnClenupReq(): exception notifying child frames');
		}
	}

	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '1-2 cleanupAckCount=' + hdxMediaStream.cleanupAckCount);
		
	//if all child frames are trivial, then send ack immediately
	if (!hdxMediaStream.cleanupAckCount) {
		hdxMediaStream.cleanupAckCount++;
		window.postMessage({ msgtype: 'clenupAck', parameter: undefined }, '*');
		return;
	}
};

hdxMediaStream.isTrivialUrl = function (url) {
	var rv = false;
	var about = 'about:';
	var js = 'javascript:';
	var szUrl = String(url);

	if (szUrl.substring(0, about.length) == about || szUrl.substring(0, js.length) == js)
		rv = true;

	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'url=' + url + ' isTrivialUrl=' + rv);

	return rv;
};

hdxMediaStream.OnClenupAck = function () {
	hdxMediaStream.cleanupAckCount--;
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'waiting for more child frames to ack back: cleanupAckCount=' + hdxMediaStream.cleanupAckCount + ' cleanupOriginator=' + hdxMediaStream.cleanupOriginator);

	//ack back to parent if all my child frames acked back
	if (!hdxMediaStream.cleanupAckCount) {
		if (!hdxMediaStream.cleanupOriginator) {
			//close myself
			if (hdxMediaStream.websocket) {
				if (typeof window.location != "undefined")
					if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'closing ws for url:' + window.location);
				hdxMediaStream.websocket.close();
			}

			window.parent.window.postMessage({ msgtype: 'clenupAck', parameter: undefined }, '*');
		}
		//reset since we are done
		hdxMediaStream.cleanupOriginator = false;

		//now safe to wipe out current document
		document.body.innerHTML = "<h1><div align='center'> Redirecting......</div></h1>";
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Clearing content -- OnPageRedirCommit.');
		hdxMediaStream.pageRedirectionState = hdxMediaStream.redirectionStates.REDIRECTED;
		document.body.style.display = '';

        // HDX-16786: Send a message to the content script informing it of the state of redirection.
        window.postMessage({ msgtype: "RedirectionState", text: "REDIRECTED" }, "*");

		// If oldTitle is still defined, then this means that it was not restored yet and pendingTitles still contains
		// OIDs sent via 'winid' by WebSocket Agent.  By the time redirection starts, pendingTitles should have been
		// emptied and the original title should have been restored.  Here we remedy the situation be clearing
		// pendingTitles and by restoring oldTitle.
		if (hdxMediaStream.oldTitle && ((!window.parent) || (window == window.parent))) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Resetting title on top-level page');
			hdxMediaStream.pendingTitles = [];
			hdxMediaStream.documentTitleMutator.updateDocumentTitle(hdxMediaStream.oldTitle);
		}
	}
};

hdxMediaStream.sendVideoPosition = function(vid, timerEvent) {

	if (!vid.hdxvid)
		return;

	if (timerEvent) {
		vid.hdxvid.pendingSendRect = null; // timer expired... send updated rect
	}

	if (!vid.hdxvid.pendingSendRect) { // send only if there's no existing timer
		vid.hdxvid.pendingSendRect = setTimeout(function(){ hdxMediaStream.sendVideoPosition(vid, true); }, 100);

		var videoRect = hdxMediaStream.getVideoClientRect(vid);

		var pixelRatio = hdxMediaStream.getPixelRatio();

		if (videoRect.left != vid.hdxvid.lastPos.left ||
			videoRect.top != vid.hdxvid.lastPos.top ||
			videoRect.width != vid.hdxvid.lastPos.width ||
			videoRect.height != vid.hdxvid.lastPos.height ||
			pixelRatio != vid.hdxvid.lastPixelRatio)
		{
			vid.hdxvid.lastPos = videoRect;
			vid.hdxvid.lastPixelRatio = pixelRatio;

			// print "document-client" position of element:
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Video[' + vid.hdxvid.videoid + ']: ((' + videoRect.left + ', ' + videoRect.top + '), (' + (videoRect.right - videoRect.left) + ', ' + (videoRect.bottom - videoRect.top) + '))');

			var videoRectScaled = hdxMediaStream.scaleRect(videoRect, pixelRatio);

			// or: videoRect2 = {left: videoRect.left, top: videoRect.top, width: videoRect.width, height: videoRect.height};

			if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
				hdxMediaStream.WSSendObject({
					/**@expose*/ v: 'pos',
					/**@expose*/ id: vid.hdxvid.videoid,
					/**@expose*/ rect: videoRectScaled
				});
			}
		}
	}
};

hdxMediaStream.queryVideoPositions = function() {
	if (HDX_DO_PAGE_REDIRECTION && !hdxMediaStream.pageRedirectionState && !hdxMediaStream.infallback)
		hdxMediaStream.doPageRedirection();

	var i;
	for (i = 0; i < hdxMediaStream.pendingVideos.length; )
	{
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
			hdxMediaStream.redirectVideo(hdxMediaStream.pendingVideos[i]);
			hdxMediaStream.pendingVideos.splice(i, 1);
		} else {
			i++;
		}
	}

	for (var key in hdxMediaStream.redirectedVideos)
	{
		hdxMediaStream.sendVideoPosition(hdxMediaStream.redirectedVideos[key], false);
	}
};

hdxMediaStream.rectToString = function(r) {
	return '{{' + r.left + ', ' + r.top + '}, {' + r.right + ', ' + r.bottom + '}} (' + r.width + ', ' + r.height + ')';
};

hdxMediaStream.subtractRects = function(r1, r2) {
	var rv = [];

	var topRect = {
		left: r1.left,
		top: r1.top,
		right: r1.right,
		bottom: Math.min(r1.bottom, r2.top)
	};
	topRect.width = topRect.right - topRect.left;
	topRect.height = topRect.bottom - topRect.top;
	//console.log('[HdxVideo.js]    Top: ' + hdxMediaStream.rectToString(topRect));
	if (topRect.width > 0 && topRect.height > 0)
		rv.push(topRect);

	var leftRect = {
		left: r1.left,
		top: Math.max(r1.top, r2.top),
		right: Math.min(r1.right, r2.left),
		bottom: Math.min(r1.bottom, r2.bottom)
	};
	leftRect.width = leftRect.right - leftRect.left;
	leftRect.height = leftRect.bottom - leftRect.top;
	//console.log('[HdxVideo.js]   Left: ' + hdxMediaStream.rectToString(leftRect));
	if (leftRect.width > 0 && leftRect.height > 0)
		rv.push(leftRect);

	var bottomRect = {
		left: r1.left,
		top: Math.max(r1.top, r2.bottom),
		right: r1.right,
		bottom: r1.bottom
	};
	bottomRect.width = bottomRect.right - bottomRect.left;
	bottomRect.height = bottomRect.bottom - bottomRect.top;
	//console.log('[HdxVideo.js] Bottom: ' + hdxMediaStream.rectToString(bottomRect));
	if (bottomRect.width > 0 && bottomRect.height > 0)
		rv.push(bottomRect);

	var rightRect = {
		left: Math.max(r1.left, r2.right),
		top: Math.max(r1.top, r2.top),
		right: r1.right,
		bottom: Math.min(r1.bottom, r2.bottom)
	};
	rightRect.width = rightRect.right - rightRect.left;
	rightRect.height = rightRect.bottom - rightRect.top;
	//console.log('[HdxVideo.js]  Right: ' + hdxMediaStream.rectToString(rightRect));
	if (rightRect.width > 0 && rightRect.height > 0)
		rv.push(rightRect);

	//console.log('[HdxVideo.js]     ' + hdxMediaStream.rectToString(r1));
	//console.log('[HdxVideo.js]    -' + hdxMediaStream.rectToString(r2));
	//for (var i in rv)
	//	console.log('[HdxVideo.js]    =' + hdxMediaStream.rectToString(rv[i]));

	return rv; // r1 - r2
};

hdxMediaStream.intersectRects = function(r1, r2) {
	var rv = {
		left: r1.left > r2.left ? r1.left : r2.left,
		top: r1.top > r2.top ? r1.top : r2.top,
		right: r1.right < r2.right ? r1.right : r2.right,
		bottom: r1.bottom < r2.bottom ? r1.bottom : r2.bottom
		};
	rv.width = rv.right - rv.left;
	rv.height = rv.bottom - rv.top;
	return (rv.width > 0 && rv.height > 0) ? rv : null;
};

hdxMediaStream.rectListSubtractRect = function(rList, r) {
	var rv = {intersected: false, rects: []};

	for (var i = 0; i < rList.length; ++i)
	{
		var rects = hdxMediaStream.subtractRects(rList[i], r);
		rv.rects = rv.rects.concat(rects);
		if (rects.length == 1) {
			if (rects[0].width != rList[i].width || rects[0].height != rList[i].height)
				rv.intersected = true;
		} else {
			rv.intersected = true;
		}
	}

	return rv;
};

hdxMediaStream.consolidateRegions = function(clipList) {
	var rv = clipList;

	if (rv.length > 1)
	{
		var keepsorting = true;
		while (keepsorting)
		{
			keepsorting = false;

			// sort horizontal, then vertical
			rv.sort(function(a, b) {
				return (a.left != b.left) ? (a.left - b.left) : (a.top - b.top);
				});

			// merge all the rectangles
			var newList = [];
			var prevRect = rv[0];
			for (var i = 1; i < rv.length; ++i)
			{
				if (prevRect.left == rv[i].left && prevRect.width == rv[i].width && prevRect.bottom == rv[i].top)
				{
					//merge
					prevRect.bottom = rv[i].bottom;
					prevRect.height = prevRect.bottom - prevRect.top;
					keepsorting = true;
				}
				else
				{
					newList.push(prevRect);
					prevRect = rv[i];
				}
			}
			newList.push(prevRect);
			rv = newList;

			// sort vertical, then horizontal
			rv.sort(function(a, b) {
				return (a.top != b.top) ? (a.top - b.top) : (a.left - b.left);
				});

			// merge all the rectangles
			newList = [];
			prevRect = rv[0];
			for (var i = 1; i < rv.length; ++i)
			{
				if (prevRect.top == rv[i].top && prevRect.height == rv[i].height && prevRect.right == rv[i].left)
				{
					//merge
					prevRect.right = rv[i].right;
					prevRect.width = prevRect.right - prevRect.left;
					keepsorting = true;
				}
				else
				{
					newList.push(prevRect);
					prevRect = rv[i];
				}
			}
			newList.push(prevRect);
			rv = newList;
		}
	}

	return rv;
};

hdxMediaStream.sendRegions = function(vid, clipList) {
	var pixelRatio = hdxMediaStream.getPixelRatio();
	var scaledClipList = [];
	for (var i = 0; i < clipList.length; ++i)
		scaledClipList.push(hdxMediaStream.scaleRect(clipList[i], pixelRatio));

	var send = false;
	if (!vid.hdxvid.regions || vid.hdxvid.regions.length != scaledClipList.length)
	{
		send = true;
	}
	else
	{
		for (var i = 0; i < scaledClipList.length; ++i)
		{
			var r1 = vid.hdxvid.regions[i];
			var r2 = scaledClipList[i];
			if (r1.left != r2.left || r1.top != r2.top || r1.width != r2.width || r1.height != r2.height)
			{
				send = true;
				break;
			}
		}
	}

	if (send && hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
	{
		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'clip',
			/**@expose*/ id: vid.hdxvid.videoid,
			/**@expose*/ c: scaledClipList
		});
		vid.hdxvid.regions = scaledClipList;
	}
};

hdxMediaStream.drawRegions = function(rect, regions) {

	var regionsDiv = document.getElementById('divRegions');
	if (regionsDiv)
	{
		while (regionsDiv.firstChild)
			regionsDiv.removeChild(regionsDiv.firstChild);

		var drawDiv = document.createElement('div');
		drawDiv.style.width = rect.width + 'px';
		drawDiv.style.height = rect.height + 'px';
		drawDiv.style.backgroundColor = '#000033';
		drawDiv.style.padding = 0;
		regionsDiv.appendChild(drawDiv);

		var drawRect = drawDiv.getBoundingClientRect();

		var scroll = {
			x: document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft,
			y: document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop,
			};

		//DEBUG_TRACE('Visible regions:');
		for (var i = 0; i < regions.length; ++i) {
			//DEBUG_TRACE(hdxMediaStream.rectToString(regions[i]));
			var borderWidth = 2;
			var visRgn = document.createElement('div');
			visRgn.style.position = 'absolute';
			visRgn.style.left = scroll.x + regions[i].left + drawRect.left + 'px';
			visRgn.style.top = scroll.y + regions[i].top + drawRect.top + 'px';
			visRgn.style.width = regions[i].width - borderWidth - borderWidth + 'px';
			visRgn.style.height = regions[i].height - borderWidth - borderWidth + 'px';
			visRgn.style.backgroundColor = '#808080';
			visRgn.style.border = 'solid #ff0000';
			visRgn.style.borderWidth = borderWidth + 'px';
			visRgn.style.opacity = 0.5;

			drawDiv.appendChild(visRgn);
		}
	}
};

hdxMediaStream.selectTopmost = function(elA, elB, rectA, rectB) {
// returns whichever element is found to be on top. If it cannot be determined, returns undefined
	var rv = undefined;

	var rA = rectA || hdxMediaStream.getBoundingClientRect(elA);
	var rB = rectB || hdxMediaStream.getBoundingClientRect(elB);
	var intersectRect = hdxMediaStream.intersectRects(rA, rB);

	// clip rectangles to window rectangle
	intersectRect = hdxMediaStream.clipRect(intersectRect, 0, 0, window.innerWidth, window.innerHeight);

	if (intersectRect)
	{
		var checkRects = [intersectRect];
		while (rv === undefined)
		{
			var rect = checkRects.shift();
			if (!rect)
				break;

			var pt = {
				x: (rect.left + rect.right) / 2,
				y: (rect.top + rect.bottom) / 2
				};

			var pickEl = document.elementFromPoint(pt.x, pt.y);
			if (pickEl == elA || pickEl == elB)
			{
				rv = pickEl;
			}
			else if (pickEl)
			{
				// Some third element.  Clip this element out of the rectangle we're checking, and look at the remaining parts.
				var topElRect = hdxMediaStream.getBoundingClientRect(pickEl);

				if (pt.x >= topElRect.left && pt.x <= topElRect.right && pt.y >= topElRect.top && pt.y <= topElRect.bottom)
				{
					// clip to window rectangle
					var topElRectClipped = hdxMediaStream.clipRect(topElRect, 0, 0, window.innerWidth, window.innerHeight);
					var subtractResult = hdxMediaStream.rectListSubtractRect([rect], topElRectClipped);

					if (subtractResult.intersected == true) {
						checkRects = checkRects.concat(subtractResult.rects);
					} else {
						// adjacent, not intersecting... ignore.
						if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Selected adjacent rectangle?  Shouldn&quot;t happen, ideally.');
					}
				}
				else
				{
					//console.log('[HdxVideo.js] elementFromPoint(' + pt.x + ',' + pt.y +
					//	') unexpectedly returned an element not containing the point, rect: ' +
					//	hdxMediaStream.rectToString(topElRect));
				}
			}
			else
			{
				//console.log('[HdxVideo.js] document.elementFromPoint() returns null.');
			}
		}
	}

	return rv;
};

hdxMediaStream.sendIFrameRegions = function(iframe, otherElements) {
	if (!otherElements) {
		otherElements = [];
		if (0 && HDX_DO_VIDEO_CLIPPING) {
			otherElements = document.getElementsByTagName('*');
		}
	}

	var r = hdxMediaStream.getFrameInsideRect(iframe);

	var clipList;
	if (hdxMediaStream.region) {
		clipList = hdxMediaStream.region;
	} else {
		clipList = hdxMediaStream.createRgnForBoundingRect(r);
	}

	for (var j = 0; j < otherElements.length; ++j) {
		if (otherElements[j] == iframe || otherElements[j].className == 'hdxChroma')
			continue; // skip self

		var otherRect = hdxMediaStream.getBoundingClientRect(otherElements[j]);
		if (hdxMediaStream.selectTopmost(iframe, otherElements[j], r, otherRect) == otherElements[j]) {
			clipList = hdxMediaStream.rectListSubtractRect(clipList, otherRect).rects;
			clipList = hdxMediaStream.consolidateRegions(clipList);
		}
	}

	clipList = hdxMediaStream.translateRgn(clipList, -r.left, -r.top);

	//TODO: should we cache the list, and not post a message unless it's changed??
	try {
		iframe.contentWindow.postMessage({msgtype: 'visibleRegion', parameter: clipList}, '*');
	} catch (err) {}
};

hdxMediaStream.pollRoutine = function() {

	hdxMediaStream.queryVideoPositions();
	hdxMediaStream.onScroll(); //TODO: we should be able to rely on events for this

	if (HDX_DO_VIDEO_REDIRECTION)
	{
	var otherElements = [];
	if (HDX_DO_VIDEO_CLIPPING && hdxMediaStream.redirectedVideos.length) {
		otherElements = document.getElementsByTagName('*');
	}

	//console.log('[HdxVideo.js] pollRoutine: elementCount=' + otherElements.length);
	for (var key in hdxMediaStream.redirectedVideos)
	{
		var vid = hdxMediaStream.redirectedVideos[key];
		var vidRect = hdxMediaStream.getBoundingClientRect(vid);

		var clipList = [{left: vidRect.left, top: vidRect.top, right: vidRect.right, bottom: vidRect.bottom, width: vidRect.width, height: vidRect.height}];

		for (var j = 0; j < otherElements.length; ++j)
		{
			if (otherElements[j] == vid || otherElements[j].className == 'hdxChroma')
				continue; // skip self

			var otherRect = hdxMediaStream.getBoundingClientRect(otherElements[j]);
			if (hdxMediaStream.selectTopmost(vid, otherElements[j], vidRect, otherRect) == otherElements[j])
			{
				//var bgcolor = (document.defaultView.getComputedStyle) ? document.defaultView.getComputedStyle(otherElements[j], '').backgroundColor : '';
				//console.log('[HdxVideo.js] On top: ' + otherElements[j]);
				//console.log('[HdxVideo.js]       : {' + intersectRect.left + ', ' + intersectRect.top + ', ' + intersectRect.right + ', ' + intersectRect.bottom + '}');
				//console.log('[HdxVideo.js]       : ' + otherElements[j].outerHTML);
				//if (bgcolor != 'transparent') // check isn't yet reliable, as a parent object may actually be picked
					clipList = hdxMediaStream.rectListSubtractRect(clipList, otherRect).rects;
			}

			//console.log('[HdxVideo.js] ----------');
		}

		//console.log('[HdxVideo.js] ==========');

		for (var i = 0; i < clipList.length; ++i)
		{
			clipList[i].left -= vidRect.left;
			clipList[i].right -= vidRect.left;
			clipList[i].top -= vidRect.top;
			clipList[i].bottom -= vidRect.top;
		}

		clipList = hdxMediaStream.consolidateRegions(clipList);
		hdxMediaStream.sendRegions(vid, clipList);
		hdxMediaStream.drawRegions(vidRect, clipList);
	}
	}
	//console.log('[HdxVideo.js] ##########');

	// check for clipped iframes
	if (hdxMediaStream.boundingRectListeners) {
		var frameElements = document.getElementsByTagName('iframe');
		for (var i = 0; i < frameElements.length; ++i) {
			try {
				if (hdxMediaStream.boundingRectListeners.indexOf(frameElements[i].contentWindow) != -1) {
					hdxMediaStream.sendIFrameRegions(frameElements[i], otherElements);
				}
			} catch (err) {}
		}
	}

};

hdxMediaStream.sendClientSize = function() {
	var pixelRatio = hdxMediaStream.getPixelRatio();
	var w = window.innerWidth;
	var h = window.innerHeight;
	/*var vp = viewport();
	var w = vp.width;
	var h = vp.height;*/
	/*var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;*/

	w *= pixelRatio;
	h *= pixelRatio;

	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'sendClientSize:  w: ' + w + '  h: ' + h);

	if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
		hdxMediaStream.WSSendObject({
		/**@expose*/ v: 'clisz',
		/**@expose*/ w: w,
		/**@expose*/ h: h
		});
	}
};

hdxMediaStream.addEvent = function(obj, name, func)
{
	if (obj.addEventListener) {
		obj.addEventListener(name, func, false);
	} else {
		obj.attachEvent(name, func);
	}
};


hdxMediaStream.EventHandlerHook = function(vid) {
	this.setup(vid);
}

hdxMediaStream.EventHandlerHook.prototype = {
	setup: function(vid) {
		if (DEBUG_ONLY)
			console.log('[HdxVideo.js Events] EventHandlerHook::setup');
		vid.hdxEventHandlerHook = this;

		this.vid = vid;

		this.listeners = [];
		this.events = [];

		this.origHandlers = {};
		this.origProps = {};
		this.interceptedEvents = []; // events we've intercepted and haven't yet decided what to do with
		this.storingEvents = true;
		this.passthrough = false;
		this.dispatching = false; // TRUE while dispatching a message

		this.suppressVideoAudio(vid);
	},
	intercept: function(eventname) {
		//console.log('[HdxVideo.js Events] EventHandlerHook::intercept: ' + eventname);
		var eventHandlerName = 'on' + eventname;
		this.origHandlers[eventHandlerName] = this.vid[eventHandlerName];
		this.vid[eventHandlerName] = this.eventInterceptor(eventname).bind(this);
		this.origProps[eventHandlerName] = hdxMediaStream.GetObjectPropertyDescriptor(this.vid, eventHandlerName);
		Object.defineProperty(this.vid, eventHandlerName, {
			get: this.getterInterceptor(eventname).bind(this),
			set: this.setterInterceptor(eventname).bind(this),
			configurable: true
			});
	},
	unintercept: function() {
		if (DEBUG_ONLY)
			console.log('[HdxVideo.js Events] EventHandlerHook::unintercept');

		this.storingEvents = false;
		this.passthrough = true;

		for (var i = 0; i < this.interceptedEvents.length; ++i) {
			this.dispatchNamedEvent(this.interceptedEvents[i]);
		}
		this.interceptedEvents = [];
	},
	dispatchNamedEvent: function(eventname) {
		//console.log('[HdxVideo.js Events] EventHandlerHook::dispatchNamedEvent: ' + eventname);
		var evt = document.createEvent('Event');
		evt.initEvent(eventname, true, true);
		this.dispatching = true;
		this.vid.dispatchEvent(evt);
		this.dispatching = false;
	},
	eventInterceptor: function() {
		return function(event) {
			//console.log('[HdxVideo.js Events] EventHandlerHook::eventInterceptor: ' + event.type + ' passthrough: ' + this.passthrough + ' dispatching: ' + this.dispatching);

			if (this.suppressVideoAudio(event.srcElement)) return;

			if (this.dispatching) {
				if (this.origHandlers['on' + event.type])
					this.origHandlers['on' + event.type].bind(this.vid)();
			} else {
				if (this.storingEvents) {
					this.interceptedEvents.push(event.type);
				}
				if (this.passthrough) {
					this.dispatchNamedEvent(event.type);
				}
			}
		};
	},
	getterInterceptor: function(eventname) {
		return function() {
			return this.origHandlers['on' + eventname];
		};
	},
	setterInterceptor: function(eventname) {
		return function(value) {
			this.origHandlers['on' + eventname] = value;
		};
	},
	discardCapturedEvents: function() {
		if (DEBUG_ONLY)
			console.log('[HdxVideo.js Events] EventHandlerHook::discardCapturedEvents');
		this.storingEvents = false;
		this.interceptedEvents = [];
	},
	eventListener: function(event) {
		//console.log('[HdxVideo.js Events] hooked evt: ' + event.type + ' phase: ' + event.eventPhase);

		var evts = this.events[event.type];
		if (evts && evts.length > 0) {
			//console.log('[HdxVideo.js Events] evts.length: ' + evts.length);

			if (event.eventPhase == Event.CAPTURING_PHASE || event.eventPhase == Event.AT_TARGET) {
				var listeners = this.listeners[event.type][0];
				//console.log('[HdxVideo.js Events] Capture listeners: ' +  listeners.length);
				for (var i = 0; i < listeners.length; i++) {
					//console.log('[HdxVideo.js Events] Invoking capture event: ' + event.type);
					listeners[i](event);
				}
			}

			if (event.eventPhase == Event.AT_TARGET || event.eventPhase == Event.BUBBLING_PHASE) {
				var listeners = this.listeners[event.type][1];
				//console.log('[HdxVideo.js Events] Bubble listeners: ' +  listeners.length);
				for (var i = 0; i < listeners.length; i++) {
					//console.log('[HdxVideo.js Events] Invoking bubble event: ' + event.type);
					listeners[i](event);
				}
			}

			if (event.eventPhase == Event.AT_TARGET || event.eventPhase == Event.BUBBLING_PHASE) { // <-- should be 1=bubble // OK... I changed it... why did it say 0??
				evts.pop();
			}
		} else {
			if (DEBUG_ONLY)
				console.log('[HdxVideo.js Events] ignoring unexpected event: ' + event.type);

			this.suppressVideoAudio(event.srcElement);
		}
	},

	suppressVideoAudio: function (vid) {
		if (vid && (vid.tagName == 'VIDEO' || vid.tagName == 'AUDIO')) {
			if (HDX_DO_VIDEO_SUPPRESSION || hdxMediaStream.pageRedirectionState == hdxMediaStream.redirectionStates.REDIRECTED) {
				if (DEBUG_ONLY)
					console.log('[HdxVideo.js Events] suppressVideoAudio');
			    try {
			        vid.src = null;
			    } catch(err) {
			        // Not a problem.
			    }

				// Do the following only if not already done successfully previously.
				if (!vid.overlayDiv) {
					// This entire block could fail bacause of the call to insertBefore (see details below).
					try {
						// Create a <div> that will overlay the <video> element and that will contain an <img> that will display
						// the ISO 3864-1 prohibition sign (see https://en.wikipedia.org/wiki/No_symbol) to indicate that the video is suppressed.
						var div = document.createElement("div");
						var img = document.createElement("img");
						img.src =

"data:image/png;base64,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";

						img.style.zIndex = 1001;
						img.style.maxWidth = "50%";
						img.style.maxHeight = "50%";

						div.appendChild(img);

						// Make it initially hidden.
						div.style.visibility = "hidden";
						// Add the <div> as s sibling of the <video> element.  This might fail if the <video> element does not yet have a parent.
						vid.parentNode.insertBefore(div, vid);

						// Make the <video> element sit below the <div>.
						vid.style.zIndex = -1;
						div.style.zIndex = 2147483647;

						// Set some other style attributes of the <div> to make it look nice.
						//div.style.height = "30px";
						div.style.fontSize = "20px";
						div.style.backgroundColor = "rgba(221, 221, 221, 0.3)";
						div.style.color = "#FFF";
						div.style.textAlign = "center";
						//div.innerHTML = "Video Disabled";

						// Finally make the <div> visible.
						div.style.visibility = "visible";

						// Set the the <div> element exactly on top of the <video> element.
						var rect = vid.parent.getBoundingClientRect();
						div.style.position = "absolute";
						div.style.top = rect.top;
						div.style.left = rect.left;

						// Start a MutationObserver that monitors changes in the size of the <video> element, and adjusts the size of the <div> element.
						var observer = new MutationObserver(function (mutations) {
							div.style.width = vid.style.width;
							div.style.height = vid.style.height;
							img.style.width = vid.style.width;
							img.style.height = vid.style.height;
						});
						observer.observe(vid, { childList: true, attributes: true });

						// Attach the <div> to the <video> element so that the "if" statement that guards this code will not allow this code to be executed again.
						vid.overlayDiv = div;
					} catch (e) { }
				}

				// Override the 'src' attribute of the <video> element with a "fake" one.  Thus, it will be impossible for any external code (e.g. the video player)
				// to set it to a new value.  We do this in order to prevent an infinite loop that would occur with the YouTube player.  The problem is as follows:
				// We set src = 'null', the player gets notified via the 'emptied' event, and it sets it again to a valid value.  We then set it to 'null' again,
				// and the sequence repeats in a never-ending loop.  Although the video/audio is suppressed, one undesireable consequence is that the CPU gets pegged
				// and IE becomes unresponsive.  However, with the code below, the loop is broken because the video player can no longer set 'src' to a valid value.
				// It remains set to 'null' and the video/audio stops playing without pegging the CPU.
				Object.defineProperty(vid, 'src', {
					configurable: false,
					value: null
				});
				return (true);
			}
		}
		return (false);
	},

	// replacements for hooked event listener routines
	ourAddEventListener: function(type, listener, capture) {
		if (DEBUG_ONLY)
			console.log('[HdxVideo.js Events] ourAddEventListener: ' + type + ' capture: ' + capture);

		if (!this.listeners[type]) {
			this.listeners[type] = [[]];
		}

		var phase_idx = capture ? 0 : 1;
		if (!this.listeners[type][phase_idx]) {
			this.listeners[type][phase_idx] = [];
			if (DEBUG_ONLY)
				console.log('[HdxVideo.js Events] registering our handler for event: ' + type + ' capture: ' + capture);
			hdxMediaStream.origAddEventListener.apply(this.vid, [type, this.eventListener.bind(this), capture]);
		}

		this.listeners[type][phase_idx].push(listener);
	},
	ourRemoveEventListener: function(type, listener, capture) {
		if (DEBUG_ONLY)
			console.log('[HdxVideo.js Events] ourRemoveEventListener: ' + type + ' capture: ' + capture);

		if (this.listeners[type]) {
			var phase_idx = capture ? 0 : 1;
			var listeners = this.listeners[type][phase_idx];
			if (listeners) {
				var lid = listeners.indexOf(listener);
				if (lid > -1) {
					listeners.splice(lid, 1);
				}
			}
		}
	},
	ourDispatchEvent: function(event) {
		//console.log('[HdxVideo.js Events] ourDispatchEvent: ' + event);

		if (!this.events[event.type]) {
			this.events[event.type] = [];
		}
		this.events[event.type].push(event);

		hdxMediaStream.origDispatchEvent.apply(this.vid, arguments);
	}
};

hdxMediaStream.interceptEventListeners = function() {
	if (DEBUG_ONLY)
		console.log('[HdxVideo.js Events] interceptEventListeners()');

	hdxMediaStream.origAddEventListener = hdxMediaStream.origAddEventListener || HTMLMediaElement.prototype['addEventListener'];
	HTMLMediaElement.prototype['addEventListener'] = function(type, listener, useCapture) {
		//console.log('[HdxVideo.js Events] Replacement addEventListener: ' + type);
		if (!this.hdxEventHandlerHook) {
			hdxMediaStream.interceptEvents(this);
		}
		this.hdxEventHandlerHook.ourAddEventListener(type, listener, useCapture);
	};

	hdxMediaStream.origRemoveEventListener = hdxMediaStream.origRemoveEventListener || HTMLMediaElement.prototype['removeEventListener'];
	HTMLMediaElement.prototype['removeEventListener'] = function(type, listener, useCapture) {
		//console.log('[HdxVideo.js Events] Replacement removeEventListener: ' + type);
		if (!this.hdxEventHandlerHook) {
			hdxMediaStream.interceptEvents(this);
		}
		this.hdxEventHandlerHook.ourRemoveEventListener(type, listener, useCapture);
	};

	hdxMediaStream.origDispatchEvent = hdxMediaStream.origDispatchEvent || HTMLMediaElement.prototype['dispatchEvent'];
	HTMLMediaElement.prototype['dispatchEvent'] = function(event) {
		//console.log('[HdxVideo.js Events] Replacement dispatchEvent: ' + event.type);
		if (!this.hdxEventHandlerHook) {
			hdxMediaStream.interceptEvents(this);
		}
		this.hdxEventHandlerHook.ourDispatchEvent(event);
	};
};

hdxMediaStream.interceptEvents = function(vid) {
	if (DEBUG_ONLY)
		console.log('[HdxVideo.js Events] interceptEvents()');
	if (!vid.hdxEventHandlerHook) {
		var hook = new hdxMediaStream.EventHandlerHook(vid);
		hook.intercept('loadstart');
		hook.intercept('progress');
		hook.intercept('suspend');
		hook.intercept('abort');
		hook.intercept('error');
		hook.intercept('emptied');
		hook.intercept('stalled');
		hook.intercept('loadedmetadata');
		hook.intercept('loadeddata');
		hook.intercept('canplay');
		hook.intercept('canplaythrough');
		hook.intercept('playing');
		hook.intercept('waiting');
		hook.intercept('seeking');
		hook.intercept('seeked');
		hook.intercept('ended');
		hook.intercept('durationchange');
		hook.intercept('timeupdate');
		hook.intercept('play');
		hook.intercept('pause');
		hook.intercept('ratechange');
		hook.intercept('volumechange');
	}
};


hdxMediaStream.findVideoElements = function() {
	if (HDX_DO_VIDEO_REDIRECTION)
	{
		var videos = document.getElementsByTagName('video');
		for (var i = 0; i < videos.length; i++)
		{
			if (hdxMediaStream.foundVideos.indexOf(videos[i]) == -1) {
				hdxMediaStream.foundVideos.push(videos[i]);
				hdxMediaStream.pendingVideos.push(videos[i]);
				hdxMediaStream.interceptEvents(videos[i]);
			}
			//else
			//	console.log('[HdxVideo.js] Video already in array.');
		}

		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Unredirected video count: ' + hdxMediaStream.pendingVideos.length);
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'HDX_DO_PAGE_REDIRECTION: ' + HDX_DO_PAGE_REDIRECTION);
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'infallback: ' + hdxMediaStream.infallback);
	}
	
	if ((hdxMediaStream.pendingVideos.length || HDX_DO_PAGE_REDIRECTION) && !hdxMediaStream.infallback)
		hdxMediaStream.doRedirection();
};

hdxMediaStream.exitFullscreen = function() {
	/* Tell all of our video windows to exit full screen.  They know their 
	   fullscreen state so this will have no effect on those windows not in fullscreen. */
	var videos = document.getElementsByTagName('video');
	for (var i = 0; i < videos.length; i++) {
		if (hdxMediaStream.foundVideos.indexOf(videos[i]) != -1) {
			if (videos[i].exitFullscreen) {
				videos[i].exitFullscreen();
			}
		}
	}

	/* Call the standard full screen function, in case there is some other element that is full screen. */
	if (this.origExitFullscreen) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'exitFullscreen - Found!');
		this.origExitFullscreen();
	}
	else if (this.origMsExitFullscreen) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'msexitFullscreen - Found!');
		this.origMsExitFullscreen();
	}
	else if (this.origMozCancelFullscreen) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'mozCancelFullScreen - Found!');
		this.origMozCancelFullscreen();
	}
	else if (this.origWebkitExitFullscreen) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'webkitexitFullscreen - Found!');
		this.origWebkitExitFullscreen();
	}
	else {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '!! No fullscreen method found !!');
	}
};

hdxMediaStream.onScroll = function(uiEvent) {
	//DEBUG_TRACE('onScroll:');
	hdxMediaStream.queryVideoPositions();

	hdxMediaStream.onOriginChanged();
	hdxMediaStream.onRegionChanged();
};

hdxMediaStream.onResize = function(uiEvent) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onResize:');
	hdxMediaStream.queryVideoPositions();

	//hdxMediaStream.onOriginChanged(); // probably don't need this?
	hdxMediaStream.onRegionChanged(); // definitely need this, though.

	hdxMediaStream.sendClientSize();
};

hdxMediaStream.onVisibilityChange = function(event) {
	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'onVisibilityChange:');

	if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
		hdxMediaStream.WSSendObject({
			/**@expose*/ v: 'vis',
			/**@expose*/ vis: (!document.hidden)
		});
	}
};

hdxMediaStream.getOrigin = function() {
	var rv = undefined;

	if (hdxMediaStream.origin) {
		rv = hdxMediaStream.origin;
	} else {
		if ((!window.parent) || (window == window.parent)) {
			hdxMediaStream.origin = {left: 0, top: 0};
			rv = hdxMediaStream.origin;
		} else {
			window.parent.postMessage({msgtype: 'getOrigin', parameter: false}, '*');
		}
	}

	return rv;
};

hdxMediaStream.sendGlobalClientScreenOffset = function(cso) {
	var ldelta = 0;
	var tdelta = 0;

	if (hdxMediaStream.clientScreenOffset) {
		ldelta = (hdxMediaStream.clientScreenOffset.left > cso.left) ?
			hdxMediaStream.clientScreenOffset.left - cso.left :
			cso.left - hdxMediaStream.clientScreenOffset.left;

		tdelta = (hdxMediaStream.clientScreenOffset.top > cso.top) ?
			hdxMediaStream.clientScreenOffset.top - cso.top :
			cso.top - hdxMediaStream.clientScreenOffset.top;
	}

	if ((!hdxMediaStream.clientScreenOffset) ||
		ldelta > 0.50 || tdelta > 0.50) // Because of scaling, offset changes within a small margin will be ignored
	{
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'clientScreenOffset: {' + cso.left + ', ' + cso.top + '}');

			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'cso',
				/**@expose*/ x: cso.left,
				/**@expose*/ y: cso.top
			});
			hdxMediaStream.clientScreenOffset = cso;
		}

		// blast this notification down to everyone else
		if (hdxMediaStream.boundingRectListeners)
			for (var i = 0; i < hdxMediaStream.boundingRectListeners.length; ++i)
				hdxMediaStream.boundingRectListeners[i].postMessage({msgtype: 'setClientScreenOffset', parameter: cso}, '*');
	}
};

hdxMediaStream.sendLocalClientScreenOffset = function(local_cso) {
	var ldelta = 0;
	var tdelta = 0;

	if (hdxMediaStream.localClientScreenOffset) {
		ldelta = (hdxMediaStream.localClientScreenOffset.left > local_cso.left) ?
			hdxMediaStream.localClientScreenOffset.left - local_cso.left :
			local_cso.left - hdxMediaStream.localClientScreenOffset.left;

		tdelta = (hdxMediaStream.localClientScreenOffset.top > local_cso.top) ?
			hdxMediaStream.localClientScreenOffset.top - local_cso.top :
			local_cso.top - hdxMediaStream.localClientScreenOffset.top;
	}

	if ((!hdxMediaStream.clientScreenOffset) ||
		ldelta > 0.50 || tdelta > 0.50) // Because of scaling, offset changes within a small margin will be ignored
	{
		if ((hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1)) ||
			(hdxMediaStream.boundingRectListeners && hdxMediaStream.boundingRectListeners.length > 0)) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'localClientScreenOffset: {' + local_cso.left + ', ' + local_cso.top + '}');
		}
		hdxMediaStream.localClientScreenOffset = local_cso;

		if ((!window.parent) || (window == window.parent)) {
			// we're already the top window.
			hdxMediaStream.sendGlobalClientScreenOffset(hdxMediaStream.localClientScreenOffset);
		} else {
			// ask our parent for the value
			window.parent.postMessage({msgtype: 'getClientScreenOffset', parameter: local_cso}, '*');
		}
	}
};

hdxMediaStream.getPixelRatio = function() {
	if (hdxMediaStream.lastPixelRatio != window.devicePixelRatio) {
		hdxMediaStream.lastPixelRatio = window.devicePixelRatio;
		// ratio has changed -- let everyone know...
		hdxMediaStream.onOriginChanged();
	}
	return window.devicePixelRatio;
};


hdxMediaStream.insetRect = function(rect, l, t, r, b) {
	return { left: rect.left + l,
		top: rect.top + t,
		right: rect.right ? rect.right - (l + r) : rect.left + rect.width - (l + r),
		bottom: rect.bottom ? rect.bottom - (t + b) : rect.top + rect.height - (t + b),
		width: rect.width - (l + r),
		height: rect.height - (t + b)};
};

hdxMediaStream.getBoundingClientRect = function(el) {
	return el.parentElement ?
		hdxMediaStream.insetRect(el.getBoundingClientRect(), 0, 0, 0, 0) : // makes rect mutable
		{left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};

	/*var rv;
	if (el.ParentElement) {
		var x = 0, y = 0;
		var elit = el;
		while (elit) {
			x += (elit.offsetLeft - elit.scrollLeft + elit.clientLeft); // from internets: https://gist.github.com/caryfuk/3b7bb50831421f1873aa
			y += (elit.offsetTop - elit.scrollTop + elit.clientTop);
			elit = el.offsetParent;
		}
		rv = { left: x,
			top: y,
			right: x + el.offsetWidth,
			bottom: y + el.offsetHeight,
			width: el.offsetWidth,
			height: el.offsetHeight };
	} else {
		rv = {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
	}
	return rv;*/
};

hdxMediaStream.clipRect = function(rect, l, t, r, b) {
	if (!rect)
		return null;

	var rv = {
		left: Math.max(rect.left, l),
		top: Math.max(rect.top, t),
		right: Math.min(rect.right, r),
		bottom: Math.min(rect.bottom, b)
		};
	rv.width = rv.right - rv.left;
	rv.height = rv.bottom - rv.top;
	return (rv.width > 0 && rv.height > 0) ? rv : null;
};

hdxMediaStream.scaleRect = function(rect, pixelRatio) {
	return { left: rect.left * pixelRatio,
		top: rect.top * pixelRatio,
		right: (rect.right ? rect.right : (rect.left + rect.width)) * pixelRatio,
		bottom: (rect.bottom ? rect.bottom : (rect.top + rect.height)) * pixelRatio,
		width: rect.width * pixelRatio,
		height: rect.height * pixelRatio};
};

hdxMediaStream.getFrameInsideRect = function(frame) {
	var pixelRatio = hdxMediaStream.getPixelRatio();

	return hdxMediaStream.insetRect(hdxMediaStream.scaleRect(frame.getBoundingClientRect(), pixelRatio),
		parseInt(getComputedStyle(frame, null).getPropertyValue('border-left-width'), 10) * pixelRatio,
		parseInt(getComputedStyle(frame, null).getPropertyValue('border-top-width'), 10) * pixelRatio,
		parseInt(getComputedStyle(frame, null).getPropertyValue('border-right-width'), 10) * pixelRatio,
		parseInt(getComputedStyle(frame, null).getPropertyValue('border-bottom-width'), 10) * pixelRatio
	);
};

hdxMediaStream.intersectRectRect = function(rect1, rect2) {
	var rv = {};

	rv.left = Math.max(rect1.left, rect2.left);
	//var i_right = ((rect1.left + rect1.width) < (rect2.left + rect2.width)) ? (rect1.left + rect1.width) : (rect2.left + rect2.width);
	//rv.width = i_right - rv.left;
	rv.right = Math.min(rect1.right, rect2.right);
	rv.width = rv.right - rv.left;
	rv.top = Math.max(rect1.top, rect2.top);
	//var i_bottom = ((rect1.top + rect1.height) < (rect2.top + rect2.height)) ? (rect1.top + rect1.height) : (rect2.top + rect2.height);
	//rv.height = i_bottom - rv.top;
	rv.bottom = Math.min(rect1.bottom, rect2.bottom);
	rv.height = rv.bottom - rv.top;

	return rv;
};

// This compares two regions, and if the rectangles in the regions match exactly, returns true.
// Note that the regions may be equal, and composed of different rectangles -- in this case,
// this method will return false, as it is quicker to do a direct comparison, which we will
// have to do frequently.
hdxMediaStream.regionListsEqual = function(rgn1, rgn2) {
	var rv = false;

	if (rgn1.length == rgn2.length) {
		rv = true;
		for (var i = 0; i < rgn1.length; ++i) {
			if ((rgn1[i].left != rgn2[i].left) ||
				(rgn1[i].top != rgn2[i].top) ||
				(rgn1[i].right != rgn2[i].right) ||
				(rgn1[i].bottom != rgn2[i].bottom)) {
				rv = false;
				break;
			}
		}
	}

	return rv;
};

hdxMediaStream.intersectRgnRect = function(rgn, rect) {
	var rv = [];

	for (var i = 0; i < rgn.length; ++i) {
		var intersection = hdxMediaStream.intersectRectRect(rgn[i], rect);
		if ((intersection.right > intersection.left) && (intersection.bottom > intersection.top)) {
			rv.push(intersection);
		}
	}

	return rv;
};

hdxMediaStream.translateRgn = function(rgn, translateX, translateY) {
	var rv = [];

	for (var i = 0; i < rgn.length; ++i) {
		var rect = {};

		rect.left = rgn[i].left + translateX;
		rect.top = rgn[i].top + translateY;
		rect.right = rgn[i].right + translateX;
		rect.bottom = rgn[i].bottom + translateY;
		rect.width = rgn[i].width;
		rect.height = rgn[i].height;

		rv.push(rect);
	}

	return rv;
};

hdxMediaStream.createRgnForBoundingRect = function(rect) {
	var pixelRatio = hdxMediaStream.getPixelRatio();
	var rgn = hdxMediaStream.region ? hdxMediaStream.region : [{
		left: 0, top: 0,
		right: document.documentElement.clientWidth * pixelRatio,
		bottom: document.documentElement.clientHeight * pixelRatio,
		width: document.documentElement.clientWidth * pixelRatio,
		height: document.documentElement.clientHeight * pixelRatio}];

	rgn = hdxMediaStream.intersectRgnRect(rgn, rect);
	rgn = hdxMediaStream.consolidateRegions(rgn);

	return rgn;
};

hdxMediaStream.getVideoClientRect = function(vid) {
	// computes the rectangle of the scaled video within the video element, excluding any added padding to correct for aspect ratio.
	var rect = hdxMediaStream.getBoundingClientRect(vid);
	if (vid.width && vid.height)
	{
		if (vid.width > rect.width)
		{
			var scale = rect.width / vid.width;
			var dif_y = vid.height - (vid.height * scale);
			rect.top += (dif_y / 2);
			rect.height -= dif_y;
			rect.bottom = rect.top + rect.height;
		}
		else if (rect.width > vid.width)
		{
			var dif_x = rect.width - vid.width;
			rect.width = vid.width;
			rect.left += (dif_x / 2);
			rect.right = rect.left + rect.width;
		}

	}
	//DEBUG_TRACE('{l:' + rect.left + ' t:' + rect.top + ' r:' + rect.right + ' b:' + rect.bottom + ' w:' + rect.width + ' h:' + rect.height + '}');

	return rect;
};


hdxMediaStream.onOriginChanged = function() {
	if (hdxMediaStream.boundingRectListeners) {
		var frameElements = document.getElementsByTagName('iframe');
		for (var i = 0; i < frameElements.length; ++i) {
			try {
				if (hdxMediaStream.boundingRectListeners.indexOf(frameElements[i].contentWindow) != -1) {
					var r = hdxMediaStream.getFrameInsideRect(frameElements[i]);
					if (hdxMediaStream.origin)
						frameElements[i].contentWindow.postMessage({msgtype: 'setOrigin', parameter: {left: hdxMediaStream.origin.left + r.left, top: hdxMediaStream.origin.top + r.top}}, '*');
				}
			} catch (err) {}
		}
	}
};

hdxMediaStream.onRegionChanged = function() {
	if (hdxMediaStream.boundingRectListeners) {
		var frameElements = document.getElementsByTagName('iframe');
		for (var i = 0; i < frameElements.length; ++i) {
			try {
				if (hdxMediaStream.boundingRectListeners.indexOf(frameElements[i].contentWindow) != -1) {
					hdxMediaStream.sendIFrameRegions(frameElements[i]);
				}
			} catch (err) {}
		}
	}
};

hdxMediaStream.onMouseMove = function(mouseEvent) {
	/*console.log('[HdxVideo.js] onMouseMove:' +
		'  page: ' + mouseEvent.pageX + ', ' + mouseEvent.pageY +
		'  client: ' + mouseEvent.clientX + ', ' + mouseEvent.clientY +
		'  screen: ' + mouseEvent.screenX + ', ' + mouseEvent.screenY);*/

	if (mouseEvent.screenX != 0 && mouseEvent.screenY != 0) { // sometimes, Chrome sends 0,0 as screen coordinates!
		var pixelRatio = hdxMediaStream.getPixelRatio();

		hdxMediaStream.sendLocalClientScreenOffset({ left: mouseEvent.screenX - (mouseEvent.clientX * pixelRatio),
				top: mouseEvent.screenY - (mouseEvent.clientY * pixelRatio) });
	}
};

hdxMediaStream.installMyEventListeners = function() {
	if (hdxMediaStream['eventListenersInstalled']) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Event listeners already installed.');
		return;
	}

	hdxMediaStream.eventListenersInstalled = true;

	if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Installing event listeners.');
	hdxMediaStream.addEvent(window, 'resize', hdxMediaStream.onResize);
	hdxMediaStream.addEvent(document, 'visibilitychange', hdxMediaStream.onVisibilityChange);
	//TODO: What do we want besides mousemove?
	hdxMediaStream.addEvent(document, 'mousemove', hdxMediaStream.onMouseMove);

	window.addEventListener('popstate', hdxMediaStream.popstateHandler);

	try {
		if (document.exitFullscreen) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'exitFullscreen - Found!');
			this.origExitFullscreen = document.exitFullscreen.bind(document);
			document.exitFullscreen = this.exitFullscreen.bind(this);
		}
		else if (document.msExitFullscreen) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'msexitFullscreen - Found!');
			this.origMsExitFullscreen = document.msExitFullscreen.bind(document);
			document.msExitFullscreen = this.exitFullscreen.bind(this);
		}
		else if (document.mozCancelFullScreen) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'mozCancelFullScreen - Found!');
			this.origMozCancelFullscreen = document.mozCancelFullScreen.bind(document);
			document.mozCancelFullScreen = this.exitFullscreen.bind(this);
		}
		else if (document.webkitExitFullscreen) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'webkitexitFullscreen - Found!');
			this.origWebkitExitFullscreen = document.webkitExitFullscreen.bind(document);
			document.webkitExitFullscreen = this.exitFullscreen.bind(this);
		}
		else {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '!! No fullscreen method found !!');
		}
	}
	catch (err)
	{
		console.log('[HdxVideo.js] installMyEventListeners(): exception' + err.message);
	}

};


hdxMediaStream.GetObjectPropertyDescriptor = function(obj, name) {
	var desc = undefined;
	while (obj != Object.prototype) {
		desc = Object.getOwnPropertyDescriptor(obj, name);
		if (desc !== undefined)
			break;
		obj = obj.__proto__;
	}
	return desc;
};

hdxMediaStream.HDXTimeRanges = function(ranges, duration) {
	this.setup(ranges, duration);
}

hdxMediaStream.HDXTimeRanges.prototype = {
	setup: function(ranges, duration) {
		this.ranges = ranges;
		this.length = this.ranges.length;
		this.duration = duration;
	},
	start: function(idx) {
		return this.ranges[idx].start * this.duration / 100.0; // (should throw a DOMException if out of range)
	},
	end: function(idx) {
		return this.ranges[idx].end * this.duration / 100.0;
	}
};

hdxMediaStream.HdxVideo = function(target, videoid) { // Javascript class creator function for HdxVideo
	this.setup(target, videoid);
}

hdxMediaStream.HdxVideo.prototype = {
	setup: function(target, videoid) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Setting up video swap-in...');
		//this.name = 'Hdx video swap-in';
		this.target = target;
		this.videoid = videoid;
		this.hooks_applied = false;
		this.paused = true;
		this.reqstate = ''; // last requested and as-of-yet unacknowledged state
		this.playing = false;
		this.ended = false;
		this.seeking = false; // TODO: send seeking events when appropriate
		this.error = null;
		this.currentSrc = '';
		this.reportedPosition = 0.0;
		this.reportedPositionTime = new Date();
		this.timer = null;
		this.reportedBufferedRanges = [];
		this.duration = 0.0;
		this.autoplay = target.autoplay;
		if (!target.paused)
			target.pause();
		this.hasPlayedOnce = false;
		this.loop = false;
		this.controls = this.target.controls;

		this.volume = 1.0;
		this.muted = false;

		this.lastPos = {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};

		this.videoWidth = undefined;
		this.videoHeight = undefined;
		this.attrWidth = hdxMediaStream.getElementAttrNumeric(this.target, 'width');
		this.attrHeight = hdxMediaStream.getElementAttrNumeric(this.target, 'height');
		this.computedWidth = 0;
		this.computedHeight = 0;

		this.target.hdxvid = this;
		this.origProps = {};

		this.hook();
	},
	hook: function() {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Applying video hooks...');

		if (!this.hooks_applied) {
			this.origSrc = this.target.src;
			this.origCurrentSrc = this.target.currentSrc;
			this.duration = this.target.duration;

			this.visible = true;                          // Originally, had some default visibility...
			this.origVisibility = this.target.visibility; // and we'll save that...
			this.makeVisible(false);                      // but we will hide it, to prevent user seeing error messages

			this.target.src = '';

			this.origLoad = this.target.load.bind(this.target);
			this.target.load = this.load.bind(this);

			this.origCanPlayType = this.target.canPlayType.bind(this.target);
			this.target.canPlayType = this.canPlayType.bind(this);

			this.origPlay = this.target.play.bind(this.target);
			this.target.play = this.play.bind(this);

			this.origPause = this.target.pause.bind(this.target);
			this.target.pause = this.pause.bind(this);

			if (this.target.requestFullscreen) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'requestFullscreen - Found!');
				this.origRequestFullscreen = this.target.requestFullscreen.bind(this.target);
				this.target.requestFullscreen = this.setFullscreen.bind(this);
			}
			else if (document.documentElement.msRequestFullscreen) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'msRequestFullscreen - Found!');
				this.origMsRequestFullscreen = this.target.msRequestFullscreen.bind(this.target);
				this.target.msRequestFullscreen = this.setFullscreen.bind(this);
			}
			else if (document.documentElement.mozRequestFullScreen) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'mozRequestFullScreen - Found!');
				this.origMozRequestFullscreen = this.target.mozRequestFullScreen.bind(this.target);
				this.target.mozRequestFullScreen = this.setFullscreen.bind(this);
			}
			else if (document.documentElement.webkitRequestFullscreen) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'webkitRequestFullscreen - Found!');
				this.origWebkitRequestFullscreen = this.target.webkitRequestFullscreen.bind(this.target);
				this.target.webkitRequestFullscreen = this.setFullscreen.bind(this);
			}
			else {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + '!! No fullscreen method found !!');
			}

			this.target.exitFullscreen = this.exitFullscreen.bind(this);

			try { // This will not work if the 'paused' property is not 'configurable'... may be a problem.

				this.origProps.error = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'error');
				Object.defineProperty(this.target, 'error', {
					get: this.getError.bind(this),
					set: this.setError.bind(this),
					configurable: true
					});

				this.origProps.src = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'src');
				Object.defineProperty(this.target, 'src', {
					get: this.getSrc.bind(this),
					set: this.setSrc.bind(this),
					configurable: true
					});

				this.origProps.currentSrc = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'currentSrc');
				Object.defineProperty(this.target, 'currentSrc', {
					get: this.getCurrentSrc.bind(this),
					configurable: true
					});

				// crossOrigin

				// networkState

				// preload

				this.origProps.buffered = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'buffered');
				Object.defineProperty(this.target, 'buffered', {
					get: this.getBuffered.bind(this),
					configurable: true
					});

				// readyState

				this.origProps.seeking = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'seeking');
				Object.defineProperty(this.target, 'seeking', {
					get: this.getSeeking.bind(this),
					configurable: true
					});

				this.origProps.currentTime = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'currentTime');
				Object.defineProperty(this.target, 'currentTime', {
					get: this.getCurrentTime.bind(this),
					set: this.setCurrentTime.bind(this),
					configurable: true
					});

				this.origProps.duration = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'duration');
				Object.defineProperty(this.target, 'duration', {
					get: this.getDuration.bind(this),
					configurable: true
					});

				this.origProps.paused = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'paused');
				Object.defineProperty(this.target, 'paused', {
					get: this.isPaused.bind(this),
					configurable: true
					});

				// defaultPlaybackRate

				// playbackRate

				// played

				// seekable

				this.origProps.ended = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'ended');
				Object.defineProperty(this.target, 'ended', {
					get: this.getEnded.bind(this),
					configurable: true
					});

				this.origProps.autoplay = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'autoplay');
				Object.defineProperty(this.target, 'autoplay', {
					get: this.getAutoplay.bind(this),
					set: this.setAutoplay.bind(this),
					configurable: true
					});

				// loop - handled by target video element

				// mediaGroup

				// controller

				this.origProps.controls = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'controls');
				Object.defineProperty(this.target, 'controls', {
					get: this.getControls.bind(this),
					set: this.setControls.bind(this),
					configurable: true
					});

				this.origProps.volume = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'volume');
				Object.defineProperty(this.target, 'volume', {
					get: this.getVolume.bind(this),
					set: this.setVolume.bind(this),
					configurable: true
					});

				this.origProps.muted = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'muted');
				Object.defineProperty(this.target, 'muted', {
					get: this.getMuted.bind(this),
					set: this.setMuted.bind(this),
					configurable: true
					});

				// defaultMuted

				// audioTracks

				// videoTracks

				// textTracks


				//// HTMLVideoElement attributes //// //TODO: only implement these if not audio?

				this.origProps.width = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'width');
				Object.defineProperty(this.target, 'width', {
					get: this.getWidth.bind(this),
					set: this.setWidth.bind(this),
					configurable: true
					});

				this.origProps.height = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'height');
				Object.defineProperty(this.target, 'height', {
					get: this.getHeight.bind(this),
					set: this.setHeight.bind(this),
					configurable: true
					});

				this.origProps.videoWidth = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'videoWidth');
				Object.defineProperty(this.target, 'videoWidth', {
					get: this.getVideoWidth.bind(this),
					configurable: true
					});

				this.origProps.videoHeight = hdxMediaStream.GetObjectPropertyDescriptor(this.target, 'videoHeight');
				Object.defineProperty(this.target, 'videoHeight', {
					get: this.getVideoHeight.bind(this),
					configurable: true
					});

				// poster


				this.origAppendChild = this.origAppendChild || this.target.appendChild.bind(this.target);
				this.target.appendChild = this.appendChild.bind(this);

			} catch (exc) {
				console.log('[HdxVideo.js] hooks() Exception: ' + exc.message);
			}

			this.hooks_applied = true;
		}
	},
	unhook: function(svrender) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Removing video hooks...');

		if (this.target.hdxEventHandlerHook)
			this.target.hdxEventHandlerHook.unintercept();

		if (this.hooks_applied)
		{
			this.target.load = this.origLoad;
			this.target.canPlayType = this.origCanPlayType;
			this.target.play = this.origPlay;
			this.target.pause = this.origPause;

			if (this.origRequestFullscreen)
				this.target.requestFullscreen = this.origRequestFullscreen;

			if (this.origMsRequestFullscreen)
				this.target.msRequestFullscreen = this.origMsRequestFullscreen;

			if (this.origMozRequestFullscreen)
				this.target.mozRequestFullScreen = this.origMozRequestFullscreen;

			if (this.origWebkitRequestFullscreen)
				this.target.webkitRequestFullscreen = this.origWebkitRequestFullscreen;

			if (this.origProps.error)
				Object.defineProperty(this.target, 'error', this.origProps.error);

			if (this.origProps.src)
				Object.defineProperty(this.target, 'src', this.origProps.src);

			if (this.origProps.currentSrc)
				Object.defineProperty(this.target, 'currentSrc', this.origProps.currentSrc);

			// crossOrigin

			// networkState

			// preload

			if (this.origProps.buffered)
				Object.defineProperty(this.target, 'buffered', this.origProps.buffered);

			// readyState

			if (this.origProps.seeking)
				Object.defineProperty(this.target, 'seeking', this.origProps.seeking);

			if (this.origProps.currentTime)
				Object.defineProperty(this.target, 'currentTime', this.origProps.currentTime);

			if (this.origProps.duration)
				Object.defineProperty(this.target, 'duration', this.origProps.duration);

			if (this.origProps.paused)
				Object.defineProperty(this.target, 'paused', this.origProps.paused);

			// defaultPlaybackRate

			// playbackRate

			// played

			// seekable

			if (this.origProps.ended)
				Object.defineProperty(this.target, 'ended', this.origProps.ended);

			if (this.origProps.autoplay)
				Object.defineProperty(this.target, 'autoplay', this.origProps.autoplay);

			// loop - handled by target video element

			// mediaGroup

			// controller

			if (this.origProps.controls)
				Object.defineProperty(this.target, 'controls', this.origProps.controls);

			if (this.origProps.volume)
				Object.defineProperty(this.target, 'volume', this.origProps.volume);

			if (this.origProps.muted)
				Object.defineProperty(this.target, 'muted', this.origProps.muted);

			// defaultMuted

			// audioTracks

			// videoTracks

			// textTracks

			//// HTMLVideoElement attributes ////

			if (this.origProps.width)
				Object.defineProperty(this.target, 'width', this.origProps.width);

			if (this.origProps.height)
				Object.defineProperty(this.target, 'height', this.origProps.height);

			if (this.origProps.videoWidth)
				Object.defineProperty(this.target, 'videoWidth', this.origProps.videoWidth);

			if (this.origProps.videoHeight)
				Object.defineProperty(this.target, 'videoHeight', this.origProps.videoHeight);

			// poster


			//perform browser based server rendering
			if (svrender) {
				if (this.origSrc)
					this.target.src = this.origSrc;
				else if (this.origCurrentSrc)
					this.target.src = this.origCurrentSrc;
			}

			this.makeVisible(true); // restore visibility

			this.target.appendChild = this.origAppendChild;

			this.hooks_applied = false;
		}

	},
	load: function() { // initiates the loading of the media file specified by the src attributes.
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Loading media...');
	},
	canPlayType: function(type) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'original canPlayType(' + type + ') returns: ' + this.origCanPlayType(type));
		var rv;
		if (type.toLowerCase().indexOf('mp4') !== -1)
			rv = (type.toLowerCase().indexOf('codec') === -1) ? 'maybe' : 'probably';
		else
			rv = '';

		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'canPlayType(' + type + ') returns: ' + rv);
		return rv;
	},
	play: function() { // initiates playback of the loaded media file.
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Initiating playback...');

		if (this.paused) {
			this.paused = false;
			this.reqstate = 'play';
			// 'this.playing' doesn't change state until the server says so!
			this.ended = false;
			if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
				hdxMediaStream.WSSendObject({
					/**@expose*/ v: 'play',
					/**@expose*/ id: this.videoid
				});
			this.hasPlayedOnce = true;
			this.resyncTimer();
			hdxMediaStream.sendEvent(this.target, 'play');
		} else {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Already playing...');
		}
	},
	pause: function() {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Pausing playback...');

		if (!this.paused) {
			this.paused = true;
			this.reqstate = 'pause';
			this.playing = false;
			if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
				hdxMediaStream.WSSendObject({
					/**@expose*/ v: 'pause',
					/**@expose*/ id: this.videoid
				});
			this.resyncTimer();
			hdxMediaStream.sendEvent(this.target, 'pause');
		} else {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Already paused...');
		}
	},
	onTimer: function() {
		hdxMediaStream.sendEvent(this.target, 'timeupdate');
	},
	resyncTimer: function() {
		if (this.timer)
			clearInterval(this.timer);
		this.timer = this.playing ? setInterval(this.onTimer.bind(this), 1000) : null;
	},
	makeVisible: function(visible) {
		if (visible) {
			if (!this.visible) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Restoring visibility.');
				this.target.style.visibility = this.origVisibility ? this.origVisibility : 'visible';
				hdxMediaStream.pollRoutine();
			}
		} else {
			this.target.style.visibility = 'hidden';
		}
		this.visible = visible;
	},
	isPaused: function() {
		return this.paused;
	},
	getError: function() {
		return this.error;
	},
	setError: function(error) {
		this.error = {code: error};
	},
	getSrc: function() {
		return this.origSrc;
	},
	setSrc: function(src) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Setting src: \'' + src + '\' : NOT YET IMPLEMENTED');
		this.origSrc = src;
		//TODO: presumably, send the new src to the server, followed by a "srcset" message, to indicate we've sent a new list of (one) sources.
		//TODO: what if this is a relative path??
	},
	getCurrentSrc: function() {
		return this.currentSrc;
	},
	getBuffered: function() {
		return new hdxMediaStream.HDXTimeRanges(this.reportedBufferedRanges, this.duration);
	},
	getSeeking: function() {
		return this.seeking;
	},
	getCurrentTime: function() {
		var computed = this.reportedPosition +
			(this.playing ? (new Date() - this.reportedPositionTime) / 1000.0 : 0);
		if (computed > this.duration)
			computed = this.duration;
		return computed;
	},
	setCurrentTime: function(currentTime) {
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'time',
				/**@expose*/ id: this.videoid,
				/**@expose*/ time: parseFloat(currentTime)
			});
	},
	getDuration: function() {
		return this.duration;
	},
	getAutoplay: function() {
		return this.autoplay;
	},
	setAutoplay: function(autoplay) {
		this.autoplay = autoplay;
		if (this.autoplay && !this.hasPlayedOnce)
			this.target.play();
	},
	getEnded: function() {
		return this.ended;
	},
	setControls: function(controls) {
		this.controls = controls;
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'controls',
				/**@expose*/ id: this.videoid,
				/**@expose*/ controls: !!(controls)
			});
	},
	getControls: function() {
		return this.controls;
	},
	getVolume: function() {
		return this.volume;
	},
	setVolume: function(volume) {
		this.volume = volume;
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'vol',
				/**@expose*/ id: this.videoid,
				/**@expose*/ vol: parseFloat(this.volume)
			});
	},
	getMuted: function() {
		return this.muted;
	},
	setMuted: function(muted) {
		this.muted = muted;
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'mute',
				/**@expose*/ id: this.videoid,
				/**@expose*/ mute: !!(this.muted)
			});
	},
	getWidth: function() {
		return this.attrWidth;
	},
	setWidth: function(width) {
		this.attrWidth = width;
		hdxMediaStream.recomputeSize(this);
	},
	getHeight: function() {
		return this.attrHeight;
	},
	setHeight: function(height) {
		this.attrHeight = height;
		hdxMediaStream.recomputeSize(this);
	},
	getVideoWidth: function() {
		return this.videoWidth;
	},
	getVideoHeight: function() {
		return this.videoHeight;
	},
	setFullscreen: function() {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'fullscreen requested.');
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'fullscreen',
				/**@expose*/ id: this.videoid,
				/**@expose*/ fullscreen: true
			});
	},
	exitFullscreen: function() {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'exit from fullscreen requested.');
		if (hdxMediaStream.websocket && (hdxMediaStream.websocket.readyState == 1))
			hdxMediaStream.WSSendObject({
				/**@expose*/ v: 'fullscreen',
				/**@expose*/ id: this.videoid,
				/**@expose*/ fullscreen: false
			});
	},
	appendChild: function(element) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Appending child element...');
	}
};


hdxMediaStream.doRedirection = function() {
	hdxMediaStream.installMyEventListeners();

	//TODO: should this check use "readyState == hdxMediaStream.websocket.CLOSED"?
	if (!hdxMediaStream.websocket || hdxMediaStream.websocket.readyState == 2 || hdxMediaStream.websocket.readyState == 3)
	{
		try {
			hdxMediaStream.websocket = new WebSocket('wss://127.0.0.1:9001');
		} catch (exc) {
			console.log('[HdxVideo.js] doRedirection(): exception connecting to WebSocket: ' + exc.message);
			hdxMediaStream.onWSError();
		}
		if (hdxMediaStream.websocket) {
		hdxMediaStream.websocket.onmessage = hdxMediaStream.onWSMessage;
		hdxMediaStream.websocket.onopen = hdxMediaStream.onWSOpen;
		hdxMediaStream.websocket.onclose = hdxMediaStream.onWSClose;
		hdxMediaStream.websocket.onerror = hdxMediaStream.onWSError;
		}
	} else if (hdxMediaStream.websocket.readyState == 1) {
		hdxMediaStream.onWSOpen();
	}
};

hdxMediaStream.DocumentBodySuppressor = function() {
	var m_observer;
	var m_desiredVisibility = null;

	this.start = function() {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'DocumentBodySuppressor.start()');
		if (m_observer) return;

		m_desiredVisibility = null;
		trySetBodyStyle();

		m_observer = new MutationObserver(function (mutations) { trySetBodyStyle(); });
		m_observer.observe(document, { childList: true, subtree: true });
	};

	this.setDesiredVisibility = function(desiredVisibility) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'DocumentBodySuppressor.setDesiredVisibility(): desiredVisibility=' + desiredVisibility);
		m_desiredVisibility = desiredVisibility;
		trySetBodyStyle();
	};

	function trySetBodyStyle() {
		try {
			document.body.style.display = m_desiredVisibility ? '' : 'none';

			if (m_desiredVisibility != null) {
				if (m_desiredVisibility === false) {
					document.body.innerHTML = '';
					if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'DocumentBodySuppressor.trySetBodyStyle(): discarded body');
				}

				m_desiredVisibility = null;
			}

			if (m_observer) {
				if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'DocumentBodySuppressor.trySetBodyStyle(): stopping observer');
				m_observer.disconnect();
				m_observer = null;
			}
		} catch (err) { }
	}
};

hdxMediaStream.onloadRoutines = hdxMediaStream.onloadRoutines || [];

hdxMediaStream.hookOnload = function() {
	hdxMediaStream.onloadMutationObserver = new MutationObserver(function(mutation) {
		if (document.body && document.body.onload) {
			hdxMediaStream.onloadRoutines.push(document.body.onload.bind(document.body));
			hdxMediaStream.origDocumentBodyOnload = document.body.onload;
			document.body.onload = null;
		}
	});
	hdxMediaStream.onloadMutationObserver.observe(document, {childList: true, subtree: true, attributes: true});
};

hdxMediaStream.allowOnload = function() {
	if (hdxMediaStream.onloadMutationObserver) {
		hdxMediaStream.onloadMutationObserver.disconnect();
		document.body.onload = hdxMediaStream.origDocumentBodyOnload;
	}
	for (var r = 0; r < hdxMediaStream.onloadRoutines.length; ++r) {
		try {
			hdxMediaStream.onloadRoutines[r]();
		} catch (err) {
			console.log('[HdxVideo.js] allowOnload(): exception from onload routine: ' + err.message);
		}
	}
	hdxMediaStream.onloadRoutines = [];
};

hdxMediaStream.suppressFx = function() {
		// hook JQuery load routines
		if (typeof $ !== 'undefined' && typeof $.ready !== 'undefined') {
			hdxMediaStream.onloadRoutines.push($.ready.bind($));
			$.ready = function() {if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Not calling original jQuery::ready()');};
		}

		// hook Angular load routines
		if (typeof angular !== 'undefined' && typeof angular.element(document).ready !== 'undefined') {
			hdxMediaStream.onloadRoutines.push(angular.element(document).ready.bind(angular.element(document)));
			angular.element(document).ready = function() {if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Not calling original angular::ready()');};
		}
};

if (window.addEventListener) { // if required level of functionality not present in browser, don't do things that could break the JS

	if (sessionStorage && sessionStorage.getItem('hdxMediaStream.fallback')) {
		console.log('[HdxVideo.js] In page redirection fallback mode.');
		hdxMediaStream.infallback = true;
	}

	if (DEBUG_ONLY) {
		document.addEventListener('click', function(mouseEvent) {
			// Mouse events provide coordinates in page, client, and screen offsets.
			console.log('[HdxVideo.js] onClick: ' +
				'page: ' + mouseEvent.pageX + ',' + mouseEvent.pageY,
				'client: ' + mouseEvent.clientX + ',' + mouseEvent.clientY,
				'screen: ' + mouseEvent.screenX + ',' + mouseEvent.screenY);
		}, false);
	}

	document.addEventListener('DOMNodeInserted', function(mutationEvent) {
		//console.log('[HdxVideo.js] OnDOMNodeInserted: ' + mutationEvent.target.tagName);
		var videoElements = (mutationEvent.target.getElementsByTagName) ? mutationEvent.target.getElementsByTagName('VIDEO') : [];
		if (mutationEvent.target.tagName == 'VIDEO' || videoElements.length) {
			if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'Adding video.');
			hdxMediaStream.findVideoElements();
		}
	}, false);

	window.addEventListener('load', function(uiEvent) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnLoad (window): ' + uiEvent.target);
		hdxMediaStream.findVideoElements();
	}, false);

	window.addEventListener('unload', function (uiEvent) {
		if (DEBUG_ONLY) console.log('[HdxVideo.js] ' + 'OnUnload (window): ' + uiEvent.target);

		if ((!window.parent) || (window == window.parent)) {
			if (sessionStorage && sessionStorage.getItem('hdxMediaStream.fallback') && hdxMediaStream.infallback) {
				sessionStorage.removeItem('hdxMediaStream.fallback');
				console.log('[HdxVideo.js] Unloading page, removing fallback mode');
			}
		}
	}, false);

	if (HDX_DO_PAGE_REDIRECTION && !hdxMediaStream.infallback) {
		hdxMediaStream.hookOnload();

		hdxMediaStream.suppressFx();
		document.addEventListener('DOMContentLoaded', function(event) {hdxMediaStream.suppressFx();});

		var documentBodySuppressor = new hdxMediaStream.DocumentBodySuppressor();
		documentBodySuppressor.start();
	}

	hdxMediaStream.addEvent(window, 'scroll', hdxMediaStream.onScroll);
	hdxMediaStream.interceptEventListeners();

	setInterval(hdxMediaStream.pollRoutine, 300); // poll

}

}
