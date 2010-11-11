preferences.rulerUnits = Units.PIXELS;var RGBColor = new SolidColor();RGBColor.red = 255;RGBColor.green = 255;RGBColor.blue = 255;var c = {	canceled: false,	cancelfunc: null, // キャンセル用関数をフックしておくための変数    doc: null,    uDlg: null,    exportDir: null,        exportLevels: new Array(),    filename: "",            maxzoom: 0,    imgWidth: 0,    imgHeight: 0,    maxPixels: 0,    jpgQuality: 100,    defaultSquare: 256}/** * select the target folder  */function preference(){    c.filename = File.openDialog("切り出す元となる画像を撰択してください。");    if (c.filename ){        fileObj = new File( c.filename );        c.doc = app.open(fileObj);    }else{        return;    }    c.imgWidth = c.doc.width.value;    c.imgHeight = c.doc.height.value;        // Create pannel UIs    c.uDlg = new Window('dialog','イメージを分解',[0, 0, 640, 480]);    c.uDlg.pnlMaxSize    = c.uDlg.add("panel",[20,90,290,160],"最大画像サイズ");    c.uDlg.pnlZoomLevel  = c.uDlg.add("panel",[20,200,290,270],"ズームレベル");    c.uDlg.pnljpgQuality = c.uDlg.add("panel",[20,310,290,380],"JPEG画質");    c.uDlg.pnlExportInfo = c.uDlg.add("panel",[320,90,620,460],"書き出されるファイル");    c.uDlg.t_filename = c.uDlg.add("statictext",[ 30, 20, 620, 60], "File : "+c.filename );    c.uDlg.center();        // MAX IMAGE SIZE    c.maxPixels = Math.max(c.imgWidth,c.imgHeight);     c.maxPixels = c.maxPixels - ( c.maxPixels % c.defaultSquare );        // UI    c.uDlg.t_maxSize = c.uDlg.add( "statictext", [ 220, 122, 270, 140 ], "Max Size" );    c.uDlg.sl_maxSize = c.uDlg.add( "slider", [ 35, 115, 210, 140 ], c.maxPixels, c.defaultSquare, c.maxPixels);    c.uDlg.sl_maxSize.onChange = function (){        c.uDlg.sl_maxSize.value = Math.round( c.uDlg.sl_maxSize.value - ( c.uDlg.sl_maxSize.value % c.defaultSquare ) );        c.uDlg.t_maxSize.text = c.uDlg.sl_maxSize.value+"px";              c.maxPixels = Number( c.uDlg.sl_maxSize.value );                c.uDlg.sl_zoomLevel.maxvalue = Math.floor( c.maxPixels / c.defaultSquare );        c.uDlg.sl_zoomLevel.value = Math.floor( c.maxPixels / c.defaultSquare );        c.uDlg.sl_zoomLevel.onChange();        updateInformation();    }    // ZOOM LEVEL SLIDER    var maxzoom = Math.floor( c.maxPixels/c.defaultSquare );    c.uDlg.t_zoomLevel = c.uDlg.add("statictext", [220, 228, 270, 250 ], "Max Zoom Level");        c.uDlg.sl_zoomLevel = c.uDlg.add("slider", [ 35, 215, 210, 250 ],maxzoom, 2, maxzoom);    c.uDlg.sl_zoomLevel.onChange = function (){        c.uDlg.sl_zoomLevel.value = Math.round(c.uDlg.sl_zoomLevel.value);        c.uDlg.t_zoomLevel.text = c.uDlg.sl_zoomLevel.value;        c.maxzoom = Number(c.uDlg.sl_zoomLevel.value);        updateInformation();    }        // add text ui    c.uDlg.t_exinfo1 = c.uDlg.add( "statictext", [ 338, 122, 600, 142 ], "ピースのサイズ :\t縦 256px    横 256px" );    c.uDlg.t_exinfo2 = c.uDlg.add( "statictext", [ 338, 142, 600, 172 ], "画像の総数 :\t\t0枚" );        c.uDlg.t_exinfo3 = c.uDlg.add( "statictext", [ 338, 182, 600, 450 ], "", { multiline : true } );        // QUALITY LEVEL SLIDER    c.uDlg.t_qualityLevel = c.uDlg.add( "statictext", [ 220, 342, 270, 360 ], "JPG Quality");        c.uDlg.sl_qualityLevel = c.uDlg.add( "slider", [ 35, 335, 210, 360 ], 100, 1, 100);    c.uDlg.sl_qualityLevel.onChange = function (){        c.uDlg.sl_qualityLevel.value = Math.round(c.uDlg.sl_qualityLevel.value);        c.uDlg.t_qualityLevel.text = c.uDlg.sl_qualityLevel.value;        c.jpgQuality = Number(c.uDlg.sl_qualityLevel.value);        updateInformation();    }        c.uDlg.okBtn = c.uDlg.add("button", [ 20, 410, 130, 440 ], "書き出し", { name:"ok" });        c.uDlg.cancelBtn = c.uDlg.add("button", [ 140, 410, 250, 440 ], "キャンセル", { name:"cancel" });    c.cancelfunc = c.uDlg.cancelBtn.onClick;    c.uDlg.cancelBtn.onClick = function(){    	c.canceled = true;    	c.cancelfunc();    };       // c.uDlg.selectBtn = c.uDlg.add("button", [ 140, 410, 250, 440 ], "ファイルを撰択");    //c.uDlg.selectBtn.onClick = function(){    //   return false;     //}            // execute to initialize    c.uDlg.sl_maxSize.onChange();    c.uDlg.sl_zoomLevel.onChange();    c.uDlg.show();}function updateInformation(){    // EXPORT INFORMATION     c.exportLevels = [];        var numImages = 0;    var text = "";    var skipLevels = [];    var averableZoomLevel = Math.floor( c.maxPixels / c.defaultSquare );    var tmpLv = averableZoomLevel-1;    for(var i=0; i<averableZoomLevel-c.maxzoom; i++){       skipLevels.push(tmpLv);       tmpLv -= 2;       if(tmpLv<=1){           tmpLv = averableZoomLevel-2;       }    }        for(i=averableZoomLevel; i>=1; i--){        var doSkip = false;            for(var j=0; j<skipLevels.length; j++){            if(skipLevels[j]==i){                doSkip = true;            }        }        if(doSkip){             text +="レベル "+i+ "\tー\n";             }else{            numImages += (i*i);            text +="レベル "+i+ "\t"+(i*256)+"px ( 256px * "+i+"枚 )\n";            c.exportLevels.push(i);        }    }    c.exportLevels.reverse();    c.uDlg.t_exinfo2.text = "画像の総数 :\t\t"+numImages+" 枚";    c.uDlg.t_exinfo3.text = text;        c.uDlg.t_qualityLevel.text = c.jpgQuality;}/* * initialize */function initialize(){    var resizeRatio = 1;    if( c.imgWidth > c.imgHeight ){         resizeRatio = (c.maxPixels/c.imgWidth); //  yokonaga     }else{        resizeRatio = (c.maxPixels/c.imgHeight); // tatenaga    }    docObj = c.doc.artLayers;    docObj[docObj.length-1].opacity = 100;    c.doc.activeLayer.name = "pic";    var picLayerObj = c.doc.layers["pic"];    var bgLayerObj = c.doc.artLayers.add();    c.doc.activeLayer = bgLayerObj    c.doc.activeLayer.name = "bglayer";    // resize to Maximum size    c.doc.resizeImage( c.imgWidth*resizeRatio, c.imgHeight*resizeRatio, 72, ResampleMethod.BICUBIC);    c.doc.resizeCanvas(  c.maxPixels, c.maxPixels, AnchorPosition.MIDDLECENTER);                  // draw background    c.doc.selection.selectAll();    c.doc.selection.fill(RGBColor,ColorBlendMode.NORMAL, 100, false);        // create top layer    var topPicLayerObj = c.doc.artLayers.add();    c.doc.activeLayer.name = "topPic";    // swap depth    c.doc.activeLayer = picLayerObj;    c.doc.selection.selectAll();    c.doc.selection.copy();    c.doc.activeLayer = topPicLayerObj;    c.doc.paste();    picLayerObj.remove();    // merge topLayer and bgLayer    c.doc.activeLayer = topPicLayerObj;    c.doc.activeLayer.merge();}/** * select the target folder  */function getExportDirctry(){    c.exportDir = Folder.selectDialog("画像の書き出し先フォルダを選んでください");}/** * saveing function  */function doSave(numGrid){	c.doc.selection.selectAll();	c.doc.selection.copy();	var docSize = c.defaultSquare*numGrid;	var tmpDocment = documents.add( c.maxPixels, c.maxPixels );	tmpDocment.paste();	tmpDocment.resizeImage( docSize, docSize, 72, ResampleMethod.BICUBIC);	for(var ix=0; ix<numGrid; ix++)	{			for(var iy=0; iy<numGrid; iy++)		{            var myName = "g_"+numGrid+"_"+ix+"_"+iy+".jpg";            var pointX = ix*c.defaultSquare;            var pointY = iy*c.defaultSquare;			            var selReg = [ [pointX, pointY], [pointX+c.defaultSquare, pointY], [pointX+c.defaultSquare, pointY+c.defaultSquare], [pointX, pointY+c.defaultSquare]];            tmpDocment.selection.select(selReg);            tmpDocment.selection.copy();            tmpDocment.selection.clear();                        var nodeDoc = documents.add(c.defaultSquare,c.defaultSquare);            nodeDoc.paste();						//save            fileObj = new File(c.exportDir+"/"+myName);			                        var exp = new ExportOptionsSaveForWeb();            exp.format = SaveDocumentType.JPEG;            exp.interlaced　= false;            exp.optimized= true;            exp.quality = 70;            nodeDoc.exportDocument(fileObj, ExportType.SAVEFORWEB, exp);                        //close			nodeDoc.close(SaveOptions.DONOTSAVECHANGES);		}	}	//close	tmpDocment.close(SaveOptions.DONOTSAVECHANGES);}/* * save log text */function saveDataLog(){        var saveName = c.exportDir +"/zlv.txt";        var fileObj = new File(saveName);    var isFileOpend = fileObj.open("w");    if (isFileOpend == true){        fileObj.write(c.exportLevels);        fileObj.close();    }else{        alert("ログファイルの作成に失敗しました。ファイルが開けませんでした。");    }}/** * execute */function execute(){    preference();        if(c.canceled){    		c.doc.close(SaveOptions.DONOTSAVECHANGES);        	return;   	}        initialize();    getExportDirctry();           for(var i=0; i<=c.exportLevels.length; i++){         doSave(c.exportLevels[i]);    }    c.doc.close(SaveOptions.DONOTSAVECHANGES);        saveDataLog();    alert("画像の切り出しが終了しました。");}execute();