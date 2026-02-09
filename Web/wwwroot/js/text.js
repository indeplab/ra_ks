var textFn="default";
$.fn.linetextset = function(params){
    var place=this;
    var container=$(place).children("text.line-text");
    switch($.pagemenuname()){
        case "concept":
        case "development":
            if(container.length==0){
                container = $(place).linetext({
                    simple:params.simple
                });
            }
            $(container).svgset({
                text:params.name
            });
        break;
        case "database":
            if(container.length==0){
                container = $(place).linetext({
                    simple:params.simple
                });
            }
            var data=[];
            if(params.endfnname){
                data.push({
                    id:0,
                    name: params.endfnname+" 1-*",
                    state:params.endfnstate
                });
            }
            if(params.startfnname){
                data.push({
                    id:0,
                    name: params.startfnname,
                    state:params.startfnstate
                });
            }
            $(container).svgset({
                data:data
            });
        break;
        case "business":
            switch(params.datatype){
                case "line":
                    if(params.number && params.number!=""){
                        if(container.length==0){
                            container = $(place).linetext({
                                simple:params.simple
                            });
                        }
                        $(container).svgset({
                            text:params.number
                        });
                    }
                    else
                        $(container).remove();
                    break;
            }
            break;
        case "interface":
            if(container.length==0){
                container = $(place).linetext({
                    simple:params.simple
                });
            }
            if((params.data == undefined || params.data.length == 0) && (params.datar == undefined || params.datar.length == 0) )
                $(container).svgset({
                    text:params.name + (!$.isempty(params.endfnname)?" ["+params.endfnname+"]":"")
                });
            else{
                var parammenu = $.getviewpageparam(params);
                var data=[];
                if(params.datar && params.datar.length>0){
                    if(params.function=="consumer" && parammenu.direction=="f" || params.function=="supply" && parammenu.direction=="r"){
                        data.push({
                            id:0,
                            name:"IN:",
                            state:"exist"
                        });
                        $(params.data.map(a => Object.assign({}, a))).sortByState().each(function(i,d){
                            data.push(d);
                        });
                        data.push({
                            id:0,
                            name:"OUT:",
                            state:"exist"
                        });
                        $(params.datar.map(a => Object.assign({}, a))).sortByState().each(function(i,d){
                            data.push(d);
                        });
                    }
                    else{
                        data.push({
                            id:0,
                            name:"IN:",
                            state:"exist"
                        });
                        $(params.datar.map(a => Object.assign({}, a))).sortByState().each(function(i,d){
                            data.push(d);
                        });
                        data.push({
                            id:0,
                            name:"OUT:",
                            state:"exist"
                        });
                        $(params.data.map(a => Object.assign({}, a))).sortByState().each(function(i,d){
                            data.push(d);
                        });
                    }
                }
                else
                    $(params.data.map(a => Object.assign({}, a))).sortByState().each(function(i,d){
                        data.push(d);
                    });

                
                if(params.endfnname)
                    data.push({
                        id:0,
                        name:"["+params.endfnname+"]",
                        state:params.endfnstate
                    });
                $(container).svgset({
                    dataprev: (params.datatype3=="template"?params.name + ": ":undefined),
                    dataprevstate: "abstract",
                    data:data
                });
            }
            break;
        case "system":
            if(container.length==0){
                container = $(place).linetext({
                    simple:params.simple
                });
            }
            let intplatform=$.isnull(params.intplatform,"")==""?"P2P":params.intplatform;
            let supplyint=$.isnull(params.supplyint,"");
            let consumerint=$.isnull(params.consumerint,"");
            var txt = (params.datatype3=="template"?params.name + ": ":"");
            txt += (intplatform=="P2P" && (supplyint=="" || consumerint=="" || supplyint==consumerint))?(supplyint==""?consumerint:supplyint):splitNames(params.supplyint,(params.datatype3=="template"?"":params.intplatform),params.consumerint);
            if(params.consumermethod && params.consumermethod!="")
                txt +=" ["+params.consumermethod+"]";
            else if(params.endfnname && params.endfnname!="")
                txt +=" ["+params.endfnname+"]";
                if(typeof txt == undefined || txt=="") 
                txt=params.name;

            $(container).svgset({
                text:txt
            });
            break;
        case "function":
            if(container.length==0){
                container = $(place).linetext({
                    simple:params.simple
                });
            }
            if(params.interface == undefined || params.interface.length == 0)
                $(container).svgset({
                    text:params.name 
                });
            else{
                var data=[];
                $(params.interface.map(a => Object.assign({}, a))).sort(function(a,b){
                    var av=getInt(a.number);
                    var bv=getInt(b.number);
                    if(av<bv) return -1;
                    if(av>bv) return 1;
                    return 0;
                }).each(function(i,d){
                    data.push(d);
                });
                
                $(container).svgset({
                    interface:data
                });
            }
            break;
    }
    var parammenu = $.getviewpageparam(params);
    if(parammenu.text){
        $(container).textMove(
            parammenu.text.x,
            parammenu.text.y,
            parammenu.text.width
        );
    }
    else{
        $(container).textMove();
        /*var rect=$.linegetbox(params);
        $(container).textMove(
            rect.x+(rect.width-getFloat($(container).attr("width")))/2,
            rect.y+(rect.height-getFloat($(container).attr("height")))/2,
            getFloat($(container).attr("width"))
        );*/
        if(!params.simple)
            $(place).linetextsave();
    }
}
$.fn.linetextsave = function(){
    var place=this;
    var container=$(this).find("text.line-text");
    $(place).setviewpageparam({
        text: {
            x:$(container).attr("x"),
            y:$(container).attr("y"),
            width:$(container).attr("width"),
            height:$(container).attr("height")
        }
    });
}
$.linetextOff = function(){
    $("text.line-text").each(function(i,e){
        $(e).linetextOff();
    });
}
$.linetextOn = function(){
    $("text.line-text:not([data-type2='simple'])").each(function(i,e){
        $(e).linetextOn();
    });
}
$.fn.linetextOn = function(){
    var container = this;
    $(container).linetextOff();
    $(container).on("mousemove",function(event){ $(container).textMouseMove(event);});
    $(container).on("mouseleave",function(event){ $(container).textMouseLeave(event);});
    $(container).on("dblclick",function(event){ event.stopPropagation(); $.propertyshow();});
    if(canOperate()){
        var line = $(container).closest("g[data-type='line']");
        if($(line).attr("data-type4")!="lineattr")
            $(container).on("mousedown",function(event){ $(container).textMouseDown(event);});
    }
    else{
        $(container).on("mousedown",function(event){ 
            event.stopPropagation();
            var line = $(container).closest("g[data-type='line']");
            $(line).select(event);
            $.propertysmartshow();
        });
    }
}
$.fn.linetextOff = function(){
    var container = this;
    $(container).off("mousedown");
    $(container).off("mousemove");
    $(container).off("mouseleave");
    $(container).off("dblclick");
}
$.linetextConnect = function(){
    $.linetextOn();
}
$.linetextDisconnect=function(){
    $.linetextOff();
}
$.fn.linetext = function(params){
    var place = this;

    var container = $.svg("text",{
        data:params.data,
        class:"line-text",
        "data-type":'linetext',
        "min-width": "20px"
    });
    $(place).append(container);
    var rect = $(place).find("g[data-type='main']")[0].getBBox();

    $(container).textMove(rect.x+rect.width/2,rect.y+rect.height/2-(params.simple?3*svgMultuplY:0), rect.width/2);

    $(container).linetextOn();
    /*if(!params.simple && canOperate()){
        $(container).on("mousedown",function(event){ $(container).textMouseDown(event);});
        $(container).on("mousemove",function(event){ $(container).textMouseMove(event);});
        $(container).on("mouseleave",function(event){ $(container).textMouseLeave(event);});
        $(container).on("dblclick",function(event){ event.stopPropagation(); $.propertyshow();});
    }
    else{
        $(container).attr({
            "data-type2":'simple'
        });
        $(container).on("mousemove",function(event){ $(container).textMouseMove(event);});
        $(container).on("mouseleave",function(event){ $(container).textMouseLeave(event);});
        $(container).on("mousedown",function(event){ 
            event.stopPropagation();
            var line = $(container).closest("g[data-type='line']");
            $(line).select(event);
            $.propertysmartshow();
        });
        $(container).on("dblclick",function(event){ event.stopPropagation(); $.propertyshow();});
    }*/
    return container;
}
$.fn.textMouseDown=function(event){
    var container = this;
    var place = $(container).parent()[0];
    place = $(place).closest("svg");
    event.stopPropagation();
    if(event.button!=0){
        // зажата правая клавиша
        $(place).trigger("mouseup");
        return;
    }
    $.lineOff();        
    $.linetextOff();
    
    var clientX = getFloat($(container).attr("x"));
    var clientY = getFloat($(container).attr("y"));
    var clientWidth = getFloat($(container)[0].getBBox().width);
    var clientMinWidth = getFloat($(container).attr("min-width"));
    var clientStartX = event.clientX/svgMultuplX - clientX;
    var clientStartY = event.clientY/svgMultuplY - clientY;
    var x=clientX;
    var y=clientY;
    var width=clientWidth;

    if(textFn=="grab")
        $(place).css({cursor:"grabbing"});

    var isMoved = false;
    $(place).on("mousemove",function(event){
        if(event.buttons==0){
            // зажата правая клавиша
            $(place).trigger("mouseup");
            return;
        }
        switch(textFn)
        {
            case "grab":
                y=event.clientY/svgMultuplY - clientStartY;
                x=event.clientX /svgMultuplX- clientStartX;
                break;
            case "e-resize":
                width=event.clientX/svgMultuplX - clientX + (clientWidth-clientStartX);
                break;
            case "w-resize":
                width=clientWidth+clientX-event.clientX/svgMultuplX+clientStartX;
                if(width>=clientMinWidth)
                    x = event.clientX/svgMultuplX-clientStartX;
                break;
        }
        $(container).textMove(x,y,width);
        isMoved=true;
    });
    $(place).on("mouseup",function(event){
        event.stopPropagation();
        $(place).off("mousemove");
        $(place).off("mouseup");
        textFn="default";
        $(place).css({cursor:textFn});
        var line = $(container).closest("g[data-type='line']");
        if(isMoved)
            $(line).linetextsave();
        $.lineOn();
        $.linetextOn();
        if(!isMoved){
            $(line).select(event);
            $.propertysmartshow();
        }
        else
            $.historycloseputtransaction();
    });
};
$.fn.textMove = function(x,y,width){
    var container=this;
    if(x==undefined)
        x = getFloat($(container).attr("x"));
    else
        x=getFloat(x);
    if(y==undefined)
        y = getFloat($(container).attr("y"));
    else
        y=getFloat(y);
    if(width==undefined)
        width = getFloat($(container).attr("width"));
    else
        width=getFloat(width);
    var clientMinWidth = getFloat($(container).attr("min-width"));

    if(width<clientMinWidth)
        width=clientMinWidth;

    $(container).attr({
        x:x,
        y:y// - 2 // delta correct
    });

    var p = $(container).txtwrap(x, width);
    $(container).attr({
        width:(isNaN(width) || p.aw>width?p.aw:width),
        height:p.h
    });
}
$.fn.textMouseMove=function(event){
    var container=this;
    var place = $(container).closest("svg");
    var offset=$(this).offset();
    var offsetX = event.clientX - offset.left;
    var width = getFloat($(container)[0].getBBox().width)*svgMultuplX;
    var delta=width*0.3;

    if(offsetX<delta) textFn="w-resize";
    if(offsetX>=delta && offsetX<=width-delta) textFn="grab";
    if(offsetX>width-delta) textFn="e-resize";

    var cursor = textFn;
    switch(textFn){
        case "e-resize":
        case "w-resize":
            cursor="ew-resize";
            break;
    }
    $(place).css({cursor:cursor});
}
$.fn.textMouseLeave=function(event){
    var place = $(this).closest("svg");
    textFn="default";
    $(place).css({cursor:textFn});
}
$.fn.unwrap = function(){
    var value = "";
    $(this).find("tspan").each(function(i,e){
        value +=$(e).text();
    });
    return value;
}
$.fn.textdata = function(){
    var value = [];
    $(this).find("tspan").each(function(i,e){
        var vl=$(e).text();
        if(vl.indexOf(", ")==vl.length-2) vl=vl.substr(0,vl.length-2);
        value.push({
            id:$(e).attr("data-id"),
            state:$(e).attr("data-state"),
            name:vl
        });
    });
    return value;
}
$.fn.txtoptlen = function(textsize){
    let txt = this;
    var delta = getInt($(txt).css("font-size")+1.5,(textsize??15.5)); 

    let sz={
        h:delta*$(txt).find("tspan").length,
        w:0
    }
    $(txt).find("tspan").each(function(i,e){
        var txtlen = e.getComputedTextLength(); 
        if(txtlen>sz.w) sz.w=txtlen;
    });
    if(sz.h>sz.w){
        sz.ah=(sz.h+sz.w)*0.38;
        sz.aw=(sz.h+sz.w)*0.62;
    }
    else{
        sz.ah=sz.h;
        sz.aw=sz.w
    }
    return sz;
}
$.fn.txtwrap = function(x, maxWidth, align, show){
    var cnt = 0;
    var delta = getInt($(this).css("font-size")+1.5,15.5); 
    var h=delta;
    var maxtxtlen=0;
    var actualWidth=0;
    var fel, prev;
    var txt = this;
    if(isNaN(maxWidth)) maxWidth=0;
    if(!align)
        align="left";
    if(align=="center"){
        $(txt).find("tspan").each(function(i,e){
            var txtlen = e.getComputedTextLength(); 
            if(txtlen>maxtxtlen)
                maxtxtlen=txtlen;
        });    
        if(maxtxtlen>maxWidth)
            maxWidth=maxtxtlen;
    }
    $(txt).find("tspan").each(function(i,e){
        if(i==0) {
            fel=e;
        }
        var txtlen = e.getComputedTextLength(); 
        if(txtlen>maxtxtlen)
            maxtxtlen=txtlen;
        cnt+=txtlen;
        if($(e).text()==' ')
            $(e).text('\u00A0');
        if(i>0 && cnt>maxWidth || (prev && $(prev).text().indexOf('\n')!=-1)){
            if($(e).text()=='\n'){
                $(e).text('\u00A0' + '\n');
            }
            $(e).attr({
                x:x,
                dy:delta/*,
                x: maxWidth/2,
                "text-anchor":"middle"*/
            });
            h+=delta;
            switch(align){
                case "center":
                    $(fel).attr({
                        x:x+(maxWidth-(cnt-txtlen))/2
                    });
                    break;
            }
            fel=e;
        }
        else{
            $(e).removeAttr("x");
            $(e).removeAttr("dy");
        }
        if(cnt>maxWidth)
            cnt=txtlen;
        if(cnt>actualWidth)
            actualWidth=cnt;
        prev=e;
    });
    switch(align){
        case "center":
            $(fel).attr({
                x:x+(maxWidth-(cnt))/2
            });
            break;
    }

    /*$(this).attr({
        textLength: maxWidth
    });*/
    return {h:h,w:maxtxtlen,aw:actualWidth}
}
var split2=function(value){
    var data=[];
    var vl="";
    for(var i=0;i<value.length;i++){
        vl+=value[i];
        if(value[i]==' ' || value[i]=='-' || value[i]=='.' || value[i]=='*' || value[i]=='/' || value[i]==';' || value[i]=='\n'){
            data.push(vl);
            vl="";
        }
    }
    if(vl!="")
        data.push(vl);
    /*if(data.length==0)
        data.push("&nbsp;");*/
    return(data);
}
