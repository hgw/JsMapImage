/* Copyright (c) 2009 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 *
 * Version: 3.0.2
 * 
 * Requires: 1.2.2+
 */
(function(c){var a=["DOMMouseScroll","mousewheel"];c.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var d=a.length;d;){this.addEventListener(a[--d],b,false)}}else{this.onmousewheel=b}},teardown:function(){if(this.removeEventListener){for(var d=a.length;d;){this.removeEventListener(a[--d],b,false)}}else{this.onmousewheel=null}}};c.fn.extend({mousewheel:function(d){return d?this.bind("mousewheel",d):this.trigger("mousewheel")},unmousewheel:function(d){return this.unbind("mousewheel",d)}});function b(f){var d=[].slice.call(arguments,1),g=0,e=true;f=c.event.fix(f||window.event);f.type="mousewheel";if(f.wheelDelta){g=f.wheelDelta/120}if(f.detail){g=-f.detail/3}d.unshift(f,g);return c.event.handle.apply(this,d)}})(jQuery);

/* 
jquery.event.drag.js ~ v1.5 ~ Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)  
Liscensed under the MIT License ~ http://threedubmedia.googlecode.com/files/MIT-LICENSE.txt
*/
(function(E){E.fn.drag=function(L,K,J){if(K){this.bind("dragstart",L)}if(J){this.bind("dragend",J)}return !L?this.trigger("drag"):this.bind("drag",K?K:L)};var A=E.event,B=A.special,F=B.drag={not:":input",distance:0,which:1,dragging:false,setup:function(J){J=E.extend({distance:F.distance,which:F.which,not:F.not},J||{});J.distance=I(J.distance);A.add(this,"mousedown",H,J);if(this.attachEvent){this.attachEvent("ondragstart",D)}},teardown:function(){A.remove(this,"mousedown",H);if(this===F.dragging){F.dragging=F.proxy=false}G(this,true);if(this.detachEvent){this.detachEvent("ondragstart",D)}}};B.dragstart=B.dragend={setup:function(){},teardown:function(){}};function H(L){var K=this,J,M=L.data||{};if(M.elem){K=L.dragTarget=M.elem;L.dragProxy=F.proxy||K;L.cursorOffsetX=M.pageX-M.left;L.cursorOffsetY=M.pageY-M.top;L.offsetX=L.pageX-L.cursorOffsetX;L.offsetY=L.pageY-L.cursorOffsetY}else{if(F.dragging||(M.which>0&&L.which!=M.which)||E(L.target).is(M.not)){return }}switch(L.type){case"mousedown":E.extend(M,E(K).offset(),{elem:K,target:L.target,pageX:L.pageX,pageY:L.pageY});A.add(document,"mousemove mouseup",H,M);G(K,false);F.dragging=null;return false;case !F.dragging&&"mousemove":if(I(L.pageX-M.pageX)+I(L.pageY-M.pageY)<M.distance){break}L.target=M.target;J=C(L,"dragstart",K);if(J!==false){F.dragging=K;F.proxy=L.dragProxy=E(J||K)[0]}case"mousemove":if(F.dragging){J=C(L,"drag",K);if(B.drop){B.drop.allowed=(J!==false);B.drop.handler(L)}if(J!==false){break}L.type="mouseup"}case"mouseup":A.remove(document,"mousemove mouseup",H);if(F.dragging){if(B.drop){B.drop.handler(L)}C(L,"dragend",K)}G(K,true);F.dragging=F.proxy=M.elem=false;break}return true}function C(M,K,L){M.type=K;var J=E.event.handle.call(L,M);return J===false?false:J||M.result}function I(J){return Math.pow(J,2)}function D(){return(F.dragging===false)}function G(K,J){if(!K){return }K.unselectable=J?"off":"on";K.onselectstart=function(){return J};if(K.style){K.style.MozUserSelect=J?"":"none"}}})(jQuery);

/*
 * stdZoomPlugin
 * 
 *
 */
(function ($) {
	// Shortcuts (to increase compression)
	var stdZoom = 'stdZoom',
	hover = 'hover',
	TRUE = true,
	FALSE = false,
	stdZoomPublic,
	isIE = !$.support.opacity,
	isIE6 = isIE && !window.XMLHttpRequest,

	// Event Strings (to increase compression)
	ON_ZOOM_CHANGED = 'onZoomChanged',
	ON_ZOOM_OUTED = 'onZoomOuted',
	
	// Cached jQuery Object Variables
	$window,
	
	// Variables for cached values or use across multiple functions
	stdZoomContexts,
	
	defaults = {};


	// ****************
	// HELPER FUNCTIONS
	// ****************
	// find Context Object from $Object
	function fuindContext ($obj) {
		var context = null;
		for(var i=0; i<stdZoomContexts.length; i++){
			if($obj.get(0) == stdZoomContexts[i].$myBox.get(0)){
				context = stdZoomContexts[i];
				break;
			}
		}
		
		return context;
	}
	
	
	// ****************
	// PUBLIC FUNCTIONS
	// Usage format: $.fn.stdZoom.hogehoge();
	// Usage from within an iframe: parent.$.fn.stdZoom.hogehoge();
	// ****************
	stdZoomPublic = $.fn.stdZoom = function (options, custom_callback) {
		if (this.length) {
			this.each(function () {
				var data = $(this).data(stdZoom) ? $.extend({}, $(this).data(stdZoom), options) : $.extend({}, defaults, options);
				$(this).data(stdZoom, data).addClass("stdZoomElement");
			});
		} else {
			$(this).data(stdZoom, $.extend({}, defaults, options));
		}
		
		if(!stdZoomContexts){
			stdZoomContexts = new Array();
		}
		
		
		var context = {
			id:stdZoomContexts.length,
			maxZoomStep: 20,
			zoomStep: 0,
			oldZoomStep: 0,
			blockSize: 256,
			viewrect: { x: 0, y: 0, width: 256, height: 256 },
			def_viewrect: { x: 0, y: 0, width: 256, height: 256 },
			spliteNodes: new Array(20),
			loadIntervalID: 0,
			enterFrameID: 0,
			mouseX: 0, mouseY: 0,
			zoomLevelList: [],
			dir: options.filePath,
			thumb: options.filePath+'g_1_0_0.jpg',
			data: options.zlv,
			$myBox: $(this),
			$thumbnail: null,
			$photoBox: null,
			$wrap: null,
			$dummy: null,	
		}
		
		stdZoomContexts.push(context);

		// loading ZoomLevel Configfile
		$.ajax({
			url: options.zlv,
			cache: false,
			success: function(data){

				context.zoomLevelList = data.split(',');
				
				for( var k=0; k<context.zoomLevelList.length; k++)
					context.zoomLevelList[ k ] = Number( context.zoomLevelList[k] );				
				
				context.maxZoomStep = context.zoomLevelList.length;
				
				for( var i=0; i<context.maxZoomStep; i++)
					context.spliteNodes[i] = new Array(); 
				
				// div node factory
				function $div(name) {
					return $('<div id="stdsm' + name + '"/>');
				}
							
				// create html nodes
				var $wrap = $div("Wrap"+context.id);
				var $thumbnail = $("<img id='stdsmThumbnail"+context.id+"' alt='thumb' />");
				var $photoBox = $div("PhotoBox"+context.id);
				var $dummy = $div("Dummy"+context.id);
				
				context.$wrap = $wrap;
				context.$thumbnail = $thumbnail;
				context.$photoBox = $photoBox;
				context.$dummy = $dummy;
			
				$wrap.css({
					"background-color": "#fff",
					"position": "relative",
					"overflow": "hidden",
					"width": "100%",
					"height": "100%"
				});
				
				$thumbnail.css({
					"display": "block",
					"position": "absolute",
					"border": "solid 0px #000",
					"top": "0px",
					"left": "0px"
				}).attr("src", context.thumb);			
				
				
				$photoBox.css({
					"position": "absolute",
					"top": "0px",
					"left": "0px"
				});
				
				$dummy.css({
					"width": context.blockSize+"px",
					"height": context.blockSize+"px",
					"border": "solid 0px #666",
					"position": "absolute",
					"top": "0px",
					"left": "0px"
				});	
				
				
				$wrap.append($thumbnail);
				$wrap.append($photoBox);
				$wrap.append($dummy);
				
				context.$myBox.html( $wrap );
			
	
				// set Dragging Event
				$dummy.bind( 'drag' , function( event ){
					context.viewrect.y = event.offsetY;
					context.viewrect.x = event.offsetX;
					stdZoomPublic.update(context);
				})
				// set Double Click Event
				.dblclick(function( e ){
					context.zoomStep += 1;
					if( context.zoomStep < 0 ){ 
						context.zoomStep = 0; 
						return;  
					}else if( context.zoomStep>context.maxZoomStep-1){
						context.zoomStep = context.maxZoomStep-1;
						return;
					}
					stdZoomPublic.zoom(context, context.mouseX, context.mouseY);
				})
				// set MouseWheelEvent
				.bind('mousewheel', function(e, delta) {
					
					if(delta<0){
						stdZoomPublic.onZoomOut(context, context.zoomLevelList[ context.zoomStep ] );
						return;
					}
					
					context.zoomStep += (delta>0)? 1:-1;
					
					if(context.zoomStep<0){ 
						context.zoomStep = 0; 
						return; 
					}else if(context.zoomStep>context.maxZoomStep-1){ 
						context.zoomStep = context.maxZoomStep-1; 
						return;
					}
					
					stdZoomPublic.zoom(context, context.mouseX, context.mouseY);
				});
				
				
				$window
				.resize(function(){
					stdZoomPublic.update(context);
				})
				.bind('mousemove', function(e){
					context.mouseX = e.clientX;
					context.mouseY = e.clientY;
				});
					
				context.viewrect.x = $wrap.width()*.5 - context.viewrect.width*.5;
				context.viewrect.y = $wrap.height()*.5 - context.viewrect.height*.5;
				
				stdZoomPublic.update(context);			
				
				context.enterFrameID = setInterval( function(){
					stdZoomPublic.update(context);	
				}, 1000/1);
			}
		});
	
		
		return this;
	};
	
	
	stdZoomPublic.update = function(context){
		var v = context;
		
		v.$dummy.css({top:v.viewrect.y,left:v.viewrect.x});
		v.$thumbnail.css({top:v.viewrect.y,left:v.viewrect.x});
		
		// resize for grid images
		v.$photoBox.css({top:v.viewrect.y,left:v.viewrect.x});	
		
	
		var wrapperX = v.viewrect.x; 
		var wrapperY = v.viewrect.y; 
		var maxWidth = v.$myBox.width();
		var maxHeight = v.$myBox.height();
		
		
		var loadTargets = new Array();
		
		var maxGrid = {x:0, y:0};
		var minGrid = {x:9999, y:9999}
		
		for(var i=0; i<v.spliteNodes[v.zoomStep].length; i++)
		{
			var o = v.spliteNodes[v.zoomStep][i];
			
			if( wrapperX+o.x<0-o.width || (o.x+wrapperX)>maxWidth){
				if(o.visible){
					o.ins.css('display','none');
					o.visible = false;
				}
			}else if( wrapperY+o.y<0-o.height || (o.y+wrapperY)>maxHeight){
				if(o.visible){
					o.ins.css('display','none');
					o.visible = false;
				}
			}else{
				if(!o.visible){
					o.ins.show();
					o.visible = true;
				}
				
				if(!o.hasLoaded){
					loadTargets.push(o);
					maxGrid.x =(o.gx>maxGrid.x)? o.gx:maxGrid.x;	maxGrid.y = (o.gy>maxGrid.y)? o.gy:maxGrid.y;
					minGrid.x = (o.gx<minGrid.x)? o.gx:minGrid.x;	minGrid.y = (o.gy<minGrid.y)? o.gy:minGrid.y;
					o.ins.css('display','none');
					o.visible = false;
				}
			}
		}
		
	
		if(loadTargets.length>0)
		{
			stdZoomPublic.loadimages(context, loadTargets, maxGrid, minGrid, v.dir);			
		}
		
	}
	
	
	stdZoomPublic.loadimages = function(context, loadTargets, maxGrid, minGrid, dir){
		
		// sort . distToCenter 
		var gridWidth = maxGrid.x - minGrid.x;
		var gridHeight = maxGrid.y - minGrid.y;		
		for(i=0; i<loadTargets.length; i++){
			var currentX = loadTargets[i].gx - minGrid.x;
			var currentY = loadTargets[i].gy - minGrid.y;
			var a = gridWidth*.5-currentX;
			var b = gridHeight*.5-currentY;
			var c = Math.sqrt(a*a+b*b);
			loadTargets[i].distToCenter = c;
		}
		
		loadTargets.sort( function(v1,v2){
			if(v1.distToCenter<v2.distToCenter) return -1;
			else return 1;
		});
		
		var loadingCue = new Array();
		
		for(i=0; i<loadTargets.length; i++){
			if(!loadTargets[i].ins.attr('src')){
				loadingCue.push( loadTargets[i] );
			}else if(loadTargets[i].ins.css("display")=="none"){
				$(this).fadeIn(0);
				loadTargets[i].visible = true;
			}	
		}
		
		var cueExecNum = 0;
		for(i=0; i<loadingCue.length; i++){
			var aaa = setTimeout( function(){
				var url = dir+'g_'+loadingCue[cueExecNum].zoom+'_'+loadingCue[cueExecNum].gx+'_'+loadingCue[cueExecNum].gy+'.jpg';
				loadingCue[cueExecNum].ins.attr('src', url).load(function(){
				//	$(this).fadeIn(75);
					$(this).show(0);
				});
				loadingCue[cueExecNum].hasLoaded = true;
				loadingCue[cueExecNum].visible = true;
				
				cueExecNum++;
			}, 50*i );
			
		}
		
	}
	
	
	
	stdZoomPublic.zoom = function(v,  mx_, my_ ){		
		// dispatch Zoom Event
		v.$myBox.trigger(ON_ZOOM_CHANGED, [v.zoomStep]);
				
		var sabunWid = v.def_viewrect.width * v.zoomLevelList[ v.zoomStep ] - v.viewrect.width;
		var sabunHei = v.def_viewrect.height * v.zoomLevelList[ v.zoomStep ] - v.viewrect.height;	
			
		var zoomCenterPointY = ( my_ - v.viewrect.y ) / v.viewrect.height;
		var zoomCenterPointX = ( mx_ - v.viewrect.x ) / v.viewrect.width;
				
		v.viewrect.width = v.def_viewrect.width * v.zoomLevelList[ v.zoomStep ];
		v.viewrect.height = v.def_viewrect.height * v.zoomLevelList[ v.zoomStep ];		
		v.viewrect.x -= sabunWid * zoomCenterPointX;
		v.viewrect.y -= sabunHei * zoomCenterPointY;
			
		
		if(v.oldZoomStep!=v.zoomStep){
			v.$photoBox.html("");
			for(var j=0; j<v.spliteNodes[v.oldZoomStep].length; j++){
				v.spliteNodes[v.oldZoomStep][j].ins.attr("src","");
			}
			
			clearInterval( v.loadIntervalID );
			v.loadIntervalID = setInterval( function(e){
				v.spliteNodes[v.zoomStep] = new Array();
								
				//var colorStep = (100/v.maxZoomStep);
				for(var ix=0; ix<v.zoomLevelList[ v.zoomStep ]; ix++){
					for(var iy=0; iy<v.zoomLevelList[ v.zoomStep ]; iy++){
						
						var $photoBlockNode = $("<img id='"+v.id+"_g_"+v.zoomLevelList[ v.zoomStep ]+"_"+ix+"_"+iy+"' />");
						$photoBlockNode.css({
							"position": "absolute",
							"width": v.blockSize+"px",
							"height": v.blockSize+"px",
							"top": (iy*v.blockSize)+"px",
							"left": (ix*v.blockSize)+"px",
						//	"background-color": "red"
						})//.hide();
						
						v.$photoBox.append($photoBlockNode);
													
						v.spliteNodes[v.zoomStep].push({
							ins: $photoBlockNode,
							src: '',
							visible: true,
							gx: ix,				
							gy: iy,
							x: v.blockSize*ix,	
							y: v.blockSize*iy,
							width: v.blockSize,
							height: v.blockSize,
							zoom: v.zoomLevelList[ v.zoomStep ],
							hasLoaded: false,
							distToCenter: 0	//画面中央までの距離
						});
					}
				}
				
				clearInterval( v.loadIntervalID );
			}, 100);
			
			v.oldZoomStep = v.zoomStep;
			v.$dummy.width(v.viewrect.width).height(v.viewrect.height);
			v.$thumbnail.width(v.viewrect.width).height(v.viewrect.height);
					
			stdZoomPublic.update(v);
		}
		
	}
	
	
	
	// AS API
	stdZoomPublic.zoomIn = function(v){
		if( typeof(v) == "string" ){
			v = fuindContext($(v));
		}		
		
		v.zoomStep += 1;
		if(v.zoomStep<0){ v.zoomStep = 0; return;  }
		else if(v.zoomStep>v.maxZoomStep-1){ v.zoomStep = v.maxZoomStep-1; return;  }
	
		var sabunWid = v.def_viewrect.width*v.zoomLevelList[ v.zoomStep ] - v.viewrect.width;
		var sabunHei = v.def_viewrect.height*v.zoomLevelList[ v.zoomStep ] - v.viewrect.height;	
		var zoomCenterPointY = (v.viewrect.y+v.viewrect.height*.5);
		var zoomCenterPointX = (v.viewrect.x+v.viewrect.width*.5);
		
		stdZoomPublic.zoom(v, zoomCenterPointX, zoomCenterPointY);
		stdZoomPublic.update(v);
	}
	
	
	
	stdZoomPublic.zoomOut = function(v){
		if( typeof(v) == "string" ){
			v = fuindContext($(v));
		}


		v.zoomStep -= 1;
		if(v.zoomStep<0){ v.zoomStep = 0; return;  }
		else if(v.zoomStep>v.maxZoomStep-1){ v.zoomStep = v.maxZoomStep-1; return;  }
		
		var sabunWid = v.def_viewrect.width*v.zoomLevelList[ v.zoomStep ] - v.viewrect.width;
		var sabunHei = v.def_viewrect.height*v.zoomLevelList[ v.zoomStep ] - v.viewrect.height;	
		var zoomCenterPointY = (v.viewrect.y+v.viewrect.height*.5);
		var zoomCenterPointX = (v.viewrect.x+v.viewrect.width*.5);
		
		stdZoomPublic.zoom(v, zoomCenterPointX, zoomCenterPointY);
		stdZoomPublic.update(v);
	}
	
	stdZoomPublic.onZoomOut = function(context, zoomLevel ){
		context.$myBox.trigger(ON_ZOOM_OUTED, [ zoomLevel ]);
	};
						

	// Initialize stdZoom: store common calculations, preload the interface graphics, append the html.
	// This preps stdZoom for a speedy open when clicked, and lightens the burdon on the browser by only
	// having to run once, instead of each time colorbox is opened.
	stdZoomPublic.init = function () {
		// jQuery object generator to save a bit of space
		function $div(id) {
			return $('<div id="stdsm' + id + '"/>');
		}
		
		// Create & Append jQuery Objects
		$window = $(window);
		return;	
	};

	// A method for fetching the current element ColorBox is referencing.
	// returns a jQuery object.
	//stdZoomPublic.element = function(){ return $(element); };

	//stdZoomPublic.settings = defaults;
	// Initializes ColorBox when the DOM has loaded
	$(stdZoomPublic.init);

}(jQuery));

