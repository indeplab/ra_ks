var svgMultuplX = 1;
var svgMultuplY = 1;
var svgStartWidth = 0;
var svgStartHeight = 0;
var svgOffsetX = 0;
var svgOffsetY = 0;
var zoomY = 0;
$.fn.svgset = function(params){
    var el=this;
    $(el).empty();
    var tag=el[0].tagName;
    if(params!=undefined){
        if(params.text!=undefined){
            if(tag=="text"){
               if(params.nowrap){
                   $(el).append(params.text);
               } else {
                    $(split2(params.text)).each(function(i,e){
                        $(el).svg("tspan",{
                            text:e
                        });
                    });
                }
            }
            if(tag=="tspan")
               $(el).append(params.text);
            delete params.text;
        }
        if(params.data!=undefined && tag=="text"){
            if(params.dataprev){
                $(split2(params.dataprev)).each(function(i,e){
                    $(el).svg("tspan",{
                        text:e,
                        "data-state":params.dataprevstate,
                    });
                });
            }
            $.each(params.data,function(i,e){
                $(split2(e.name + (e.securitytype && e.securitytype!=""?" (" + e.securitytype + ")": "") + (i<params.data.length-1 && (params.data[i].id!=0 && params.data[i+1].id!=0 && params.data[i+1].name && params.data[i+1].name.length>0 && params.data[i+1].name[0]!='[')?", ":" "))).each(function(i1,e1){
                    $(el).svg("tspan",{
                        "data-id":e.id,
                        "data-state":e.state,
                        text:e1 
                    });
                });
            });
            delete params.data;
        }
        if(params.interface!=undefined && tag=="text"){
            $.each(params.interface,function(i,e){
                $(split2(e.number + (i<params.interface.length-1?", ":""))).each(function(i1,e1){
                    $(el).svg("tspan",{
                        "data-id":e.id,
                        "data-state":e.state,
                        text:e1 
                    });
                });
            });
            delete params.interface;
        }
        $(el).attr(params);
    }
}
$.svg=function(tag, params){
    tag=tag.replace("<","");
    tag=tag.replace(">","");
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    $(el).svgset(params);
    return(el);
}
$.fn.svg=function(tag, params){
    var el=$.svg(tag,params);
    $(this).append(el);
    return(el);
}
$.fn.svgparse=function(text){
    $("#wait").show();
    var place=this;
    setTimeout(()=>{
        var data;
        try{
            data = JSON.parse(text);
        }
        catch{
            $("#wait").hide();
            if($.pagemenuname()=="business"){
                //пытаемся разобрать диаграмму plantUML
                let content = $(place).find("svg[data-type]:not([data-type='document']), g[data-type='line']");
                if(text.indexOf("@startuml")!=-1 && confirm("Схема определена как диаграма plantUML.\nПродолжить?")){
                    let params = $.currentdocumentget();
                    if(params.viewdata && params.viewdata[$.pagemenu()]){
                        //params.viewdata[$.pagemenu()].notation="bpmn";
                        storedirectlyset(params.id,params,false);
                    }
                    if(content.length>0){
                        deleteondocument(content,{
                            success:function(){
                                if(!$(place).importfrompu(text))
                                    alert("Неверный формат диаграммы");
                            }
                        });
                    }
                    else if(!$(place).importfrompu(text))
                        alert("Неверный формат диаграммы");

                }
                /*else if(confirm("Интерпретировать текст как описание функционального процесса?")){
                    // разбор таблица или текст
                    let caption="";
                    let description="";
                    let stage = "";
                    text.split('\n').forEach(e=>{
                        let values = e.split('\t');
                        if(values.length<2) return;
                        let cap = values[0].toLowerCase();
                        if(cap=="сценарий") caption = values[1].trim();
                        else if(cap.indexOf("описание")!=-1) description=values[1].trim();
                        else if(cap.indexOf("этап")!=-1 && cap.indexOf("сценари")!=-1) stage=values[1].trim();
                    });
                    //console.log(stage);
                    if(caption!="" && stage!=""){
                        let viewname = $.pagemenu();
                        doc.viewdata[viewname].name = caption;
                        doc.viewdata[viewname].description = description;
                        storedirectlyset(doc.id,doc);
                        $.propertyset();
                        $("div[data-menu='business'] a[data-type='" + viewname + "']").attr({
                            title: caption
                        });
                        $("div[data-menu='business'] a[data-type='" + viewname + "'] span").text(caption);
                        $("title").html(caption);
                        text = stage;
                    }
                    // Вызов сервиса ИИ
                    $("#wait").show();
                    let result = getPlantUml(text);
                    if(content.length>0){
                        $(content).setselected();
                        deleteondocument(content,null,{
                            success:function(){
                                if(!$(place).importfrompu(result))
                                    alert("Неверный формат диаграммы");
                            }
                        });
                    }
                    else if(!$(place).importfrompu(result))
                        alert("Неверный формат диаграммы");
                    $("#wait").hide();
                }*/
            }
            else
                alert("Ошибка разбора контента");
            return;
        }
        if(!typeof(data)=="object") return;
        $.historycloseputtransaction();
        var list=[];
        let shiftParammenu = function(e,parammenu,dx,dy){
            if(!parammenu) return e;
            //debugger;
            switch(e.datatype){
                case "line":
                    if(parammenu.text)
                    {
                        if(parammenu.text.x) parammenu.text.x=getFloat(parammenu.text.x)+dx;
                        if(parammenu.text.y) parammenu.text.y=getFloat(parammenu.text.y)+dy;
                    } 
                    if(parammenu.points){
                        var points="";
                        $.each(parammenu.points.split(','),function(i,e2){
                            var point=e2.trim().split(" ");
                            if(point.length>0){
                                points+=(points.length>0?",":"") + (getFloat(point[0])+dx).toString() + " " + (getFloat(point[1])+dy).toString();
                            }
                        });
                        parammenu.points=points;
                    }
                    break;
                default:
                    //debugger;
                    if(parammenu.x) parammenu.x=getFloat(parammenu.x)+dx;
                    if(parammenu.y) parammenu.y=getFloat(parammenu.y)+dy;
                    if($.pagemenuname()=="business"){
                        if (e?.container) {
                            function getFloatObj(x,t=['x','y','w','h']) {
                                return Object.keys(x).reduce((a, c) => ({
                                    ...a,
                                    [c]: (t.includes(c)) ? getFloat(x[c]) : x[c],
                                }), {});
                            }
                            const cvp = $.getviewpageparam($.storeget(e.container),$.pagemenu());
                            const { w: cw, h: ch } = getFloatObj(cvp,['w','h']);
                            const pw = getFloat(parammenu.x)+getFloat(parammenu.w);
                            const ph = getFloat(parammenu.y)+getFloat(parammenu.h);
                            let dw = 0;
                            let dh = 0;
                            const t = 25;
                            if (pw > cw) {
                                dw = (pw + t) - cw;
                                cvp.w = pw + t;
                            }
                            if (ph > ch) {
                                dh = (ph + t) - ch;
                                cvp.h = ph + t;
                            }
                            $("#"+e.container).setviewpageparam(cvp);
                            if (dw) {
                                $("#"+e.container).attr("width",cvp.w);
                                const rect = $("#"+e.container).children("rect");
                                const rw = getFloat($(rect).attr("width")) + dw;
                                $(rect).attr("width",rw);
                                const elementtype = $("#"+e.container).children("use.element-type");
                                const re = getFloat($(elementtype).attr("x")) + dw;
                                $(elementtype).attr("x",re);
                                const params = getFloatObj($("#"+e.container).getviewpageparam());
                                $("#"+e.container).moveneighbors($.extend(params,{
                                    dx:0,
                                    dy:0,
                                    dw:20,
                                    dh:0,
                                }));
                                $("svg[data-type='element']").each(function(i,e){
                                    $(e).logicsave();
                                })
                            }
                            if (dh) {
                                const rh = getFloat($("#"+e.container).children("rect").attr("height")) + dh;
                                $("svg[data-type='element']").each(function(i,e){
                                    $(e).logicMove({h:rh});
                                    const p = $(e).storeget();
                                    const pm = $.pagemenu();
                                    const vp = $.getviewpageparam(p,pm);
                                    vp.h = rh;
                                    $(e).setviewpageparam(vp);
                                })
                            }
                        }
                    }
                    break;
            }
        }
        $.each(data, function(i,e){
            if(e.datatype=="element" && $.pagemenuname()=="system"){
                delete e.data;
                delete e.functions;
            }
            if(e.datatype=="element" && $.pagemenuname()=="business"){
                let parammenu;
                if(e.viewdata && Object.keys(e.viewdata).length>0){
                    let key=Object.keys(e.viewdata)[0];
                    parammenu=$.getviewpageparam(e,key);
                }
                if(i==0){
                    // первый элемент, проверяем, нужно ли позиционировать другие элементы канваса
                    var last = $("svg[data-type='document']").children("[data-type='element']").last();
                    if(last.length!=0){
                        let lp = $(last).getviewpageparam();
                        var delta=1;
                        if(!isemptyobject(lp) && !isemptyobject(parammenu)){
                            dx=getFloat(parammenu.x)-getFloat(lp.x)+getFloat(lp.w)+delta,
                            dy=getFloat(parammenu.y)-getFloat(lp.y);
                            $.each(data,function(i1,e1){
                                if(e1.datatype!="element" && !e1.container)
                                    shiftParammenu(e,parammenu,dx,dy);
                            });
                        }
                    }
                }
                let e1=$.storeget(e.id);
                if(!isemptyobject(e1)) e=e1;
                // только если нет такой swimline добавляем
                if(!$.hasviewpageparam(e,$.pagemenu())){
                    e.viewdata[$.pagemenu()]=$.extend({},parammenu??{},{
                        order:$(place).lastentityindex()
                    });
                }
            }
            else
            {
                var id=e.id;
                e.id = $.newguid();
                // переопределяем контейнер потомков
                $(data).each(function(i1,e1){
                    if(e1.container==id) e1.container=e.id;
                    if(e1.parentel==id) e1.parentel=e.id;
                    if(e1.datatype=="line"){
                        if(e1.endel==id) e1.endel=e.id;
                        if(e1.startel==id) e1.startel=e.id;
                    }
                    if(e.datatype=="element"){
                        $.each(e.components,function(ic,ec){
                            if(ec.id==id) ec.id=e.id;
                        });
                    }
                });
                let menu=$.pagemenu();
                if($.hasviewpageparam(e,menu)){
                    // сдвигаем координаты
                    var delta = 5;
                    let param=$.getviewpageparam(e)//.viewdata[menu];
                    let docpos = $.getviewpageparam($.documentget());
                    const isNotElementOnBusinessPage = true;//e.datatype!="element" && $.pagemenuname()=="business";
                    shiftParammenu(
                        e,
                        param,
                        !isNotElementOnBusinessPage ? docpos.x+(docpos.dx/(2*(docpos.sw/window.innerWidth))) : 20,
                        !isNotElementOnBusinessPage ? docpos.y+(docpos.dy/(2.3*(docpos.sh/window.innerHeight))) : 20,
                    );
                    //shiftParammenu(e,param,delta,delta);
                    /*switch(e.datatype){
                        case "line":
                            if(param.text)
                            {
                                if(param.text.x) param.text.x=getFloat(param.text.x)+delta;
                                if(param.text.y) param.text.y=getFloat(param.text.y)+delta;
                            } 
                            if(param.points){
                                var points="";
                                $.each(param.points.split(','),function(i,e2){
                                    var point=e2.trim().split(" ");
                                    if(point.length>0){
                                        points+=(points.length>0?",":"") + (getFloat(point[0])+delta).toString() + " " + (getFloat(point[1])+delta).toString();
                                    }
                                });
                                param.points=points;
                            }
                            break;
                        default:
                            if(param.y) param.y=getFloat(param.y)+delta;
                            if(param.x) param.x=getFloat(param.x)+delta;
                            break;
                    }*/
                    param.order=$(place).lastentityindex();
                }
                else{
                    //копируем старые в новый viewpoint
                    if(e.viewdata && Object.keys(e.viewdata).length>0){
                        let key=Object.keys(e.viewdata)[0];
                        e.viewdata[$.pagemenu()]=$.extend({}, e.viewdata[key],{
                            order:$(place).lastentityindex()
                        });
                        delete e.viewdata[key];
                    }
                }
            }
            if(!e.container)
                list.push(e);
        });
        $.each(list.sort(function(a,b){
            return $.logicsort(a,b);
        }),function(i,e){
            $.svgparse(e,data);
        });
        //$(place).svgfitcanvas();
        $.clearselected();
        $.each(list,function(i,e){
            $(`#${e.id}`).addClass("selected");
        });
        $.historycloseputtransaction();
        $("#wait").hide();
    },50);
}
$.svgparse=function(params,data){
    if(params.datatype=="element" && $.pagemenuname()=="business"){
        if($("#"+params.id).length==0){
            $.logicaddswimline(params);
        }
    }
    else{
        if(pagemenuCanContainsLogic(params.datatype)){
            $.storeset(params);
        }
    }
    var list=[];
    $.each(data,function(i,p){
        if(params.id!=p.id && p.container == params.id){
            if(!params.cancontain)
            {
                delete p.container;
                storedirectlyset(p.id,p,undefined,false);
            }
            list.push(p);
        }
    });
    $.each(list.sort(function(a,b){
        return $.logicsort(a,b);
    }),function(i,e){
        $.svgparse(e,data);
    });
}
$.isemptyschema = function(size){
    if(!size) size=$.getsize();
    return(size.minX==Infinity||size.minY==Infinity || size.maxX==-Infinity||size.maxY==-Infinity);
}
$.getsize = function(zoom, pagemenu){
    var minX=Infinity;
    var minY=Infinity;
    var maxX=-Infinity;
    var maxY=-Infinity;
    var lastindex=-Infinity;
    var linepointdelta=10;
    zoom=(zoom?zoom:1);
    pagemenu=(pagemenu?pagemenu:$.pagemenu());
    var containerid=$("svg[data-type='document']").storeget();

    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        var parammenu = $.getviewpageparam(param,pagemenu);
        if((!param.container || param.container==containerid) && !isemptyobject(parammenu) && param.datatype!="document"){
            switch(param.datatype){
                case "line":
                    if(parammenu.points){
                        $.each(parammenu.points.split(','),function(i,e){
                            var point=e.trim().split(" ");
                            if(point.length>0){
                                x=getFloat(point[0]);
                                y=getFloat(point[1]);
                                minX=Math.min(minX,x-linepointdelta);
                                maxX=Math.max(maxX,x+linepointdelta);
                                minY=Math.min(minY,y-linepointdelta);
                                maxY=Math.max(maxY,y+linepointdelta);
                            }
                        });
                    }
                    if(parammenu.text && pagemenu.substr(0,"business")==-1){
                        var x=getFloat(parammenu.text.x);
                        var y=getFloat(parammenu.text.y);
                        var w=getFloat(parammenu.text.width);
                        var h=getFloat(parammenu.text.height);
                        minX=Math.min(minX,x-w/2);
                        maxX=Math.max(maxX,x+w/2);
                        minY=Math.min(minY,y-h/2);
                        maxY=Math.max(maxY,y+h/2);
                    }
                break;
                default:
                    var _x1=getFloat(parammenu.x);
                    var _x2=_x1+getFloat(parammenu.w);
                    var _y1=getFloat(parammenu.y);
                    var _y2=_y1+getFloat(parammenu.h);
                    minX=Math.min(minX,_x1,_x2);
                    maxX=Math.max(maxX,_x1,_x2);
                    minY=Math.min(minY,_y1,_y2);
                    maxY=Math.max(maxY,_y1,_y2);
                    break;
            }
            var index = getInt(parammenu.order);
            if(index>lastindex)
                lastindex=index;   
        }
    });
    return {
        minX:minX*zoom,
        minY:minY*zoom,
        maxX:maxX*zoom,
        maxY:maxY*zoom,
        lastIndex:lastindex
    };
}
$.fn.svggetsize = function(zoom){
    zoom=(zoom?zoom:1);
    var place = this;
    var minX=Infinity;
    var minY=Infinity;
    var maxX=-Infinity;
    var maxY=-Infinity;
    $(place).children("g[data-type='line']").find("g line, g path, text").each(function(i,e){
        var box = $(e)[0].getBBox();
        minX=Math.min(minX,box.x,box.x+box.width);
        maxX=Math.max(maxX,box.x,box.x+box.width);
        minY=Math.min(minY,box.y,box.y+box.height);
        maxY=Math.max(maxY,box.y,box.y+box.height);
    });
    $(place).children("svg[data-type2='logic']").each(function(i,e){
        var _x1=getFloat($(e).attr("x"));
        var _x2=_x1+getFloat($(e).attr("width"));
        var _y1=getFloat($(e).attr("y"));
        var _y2=_y1+getFloat($(e).attr("height"));
        minX=Math.min(minX,_x1,_x2);
        maxX=Math.max(maxX,_x1,_x2);
        minY=Math.min(minY,_y1,_y2);
        maxY=Math.max(maxY,_y1,_y2);
    });
    return {
        minX:minX*zoom,
        minY:minY*zoom,
        maxX:maxX*zoom,
        maxY:maxY*zoom
    };
}
$.fn.svginit = function(){
    var place=this;
    $(place).svgsize();
    svgOffsetX=getFloat($(place).offset().left);
    svgOffsetY=getFloat($(place).offset().top);
    svgMultuplX = 1;
    svgMultuplY = 1;
    $(place)[0].removeAttribute("viewBox")
    $(place).svgviewbox(0);
    /*$(place).attr({
        "mx" : svgMultuplX,
        "my" : svgMultuplY
    });*/
    $(place).setviewpageparam({
        mx:svgMultuplX,
        my:svgMultuplY,
        sw:svgStartWidth,
        sh:svgStartHeight
    });
}
$.fn.svgfitcanvas = function(){
    var place = this;
    var size = $(place).svggetsize();
    var minX=size.minX;
    var minY=size.minY;
    var maxX=size.maxX;
    var maxY=size.maxY;
    if(minX!=Infinity){
        // padding
        maxX=(maxX-minX)+20*svgMultuplX;
        maxY=(maxY-minY)+20*svgMultuplY;
        minX-=10*svgMultuplX;
        minY-=10*svgMultuplY;
 
        var zoom=Math.min((window.innerWidth-svgOffsetX)/maxX, (window.innerHeight-svgOffsetY)/maxY);
        if(zoom>1.3)
            zoom=1.3;
        //console.log(zoom);
        var x1 = svgStartWidth/zoom;
        var y1 = svgStartHeight/zoom;
        svgMultuplX = svgStartWidth/x1;
        svgMultuplY = svgStartHeight/y1;
        /*$(place).attr({
            "mx" : svgMultuplX,
            "my" : svgMultuplY
        });*/
        $(place).setviewpageparam({
            mx:svgMultuplX,
            my:svgMultuplY,
            sw:svgStartWidth,
            sh:svgStartHeight
        }, false);
        $(place).svgviewbox(minX-((window.innerWidth-svgOffsetX)-maxX*svgMultuplX)/2/svgMultuplX, minY-((window.innerHeight-svgOffsetY)-maxY*svgMultuplY)/2/svgMultuplY, x1, y1, false);
    }
    return {
        minX:minX-((window.innerWidth-svgOffsetX)-maxX*svgMultuplX)/2/svgMultuplX,
        minY:minY-((window.innerHeight-svgOffsetY)-maxY*svgMultuplY)/2/svgMultuplY,
        maxX:x1,
        maxY:y1
    };
}
$.fn.svgsize = function(){
    svgStartWidth = getFloat(screen.width);//screen.width // document.documentElement.clientWidth
    svgStartHeight = getFloat(screen.height);//screen.height //document.documentElement.clientHeight
    svgOffsetX=getFloat($(this).offset().left);
    svgOffsetY=getFloat($(this).offset().top);
    $(this).css({
        width:svgStartWidth,
        height:svgStartHeight
    });
    zoomY = svgStartHeight/svgStartWidth;
}
$.fn.svgcanvas=function(){
    var place = this;
    $(place).svgsize();

    $(window).resize(function(event){
        //$(place).svgsize();
    });
    $(window).on("wheel", $.throttle(function (event) {
        //var scrollDelta=10;
        //var zoomDelta=40;
            // скролим только канвас
        //console.log(event.target.tagName);
        if (event.target == undefined
            || (!["svg", "rect", "tspan", "use", "line", "g", "circle"].includes(event.target.tagName))) {
                        //event.target.id="canvas";
            //$(window).trigger("wheel");
            return;
        }
        var vb=$(place).svgviewbox();

        var zoomDelta = Math.min(vb[2], vb[3]) / 5;
        var scrollDelta = zoomDelta / 5;

        var x=getFloat(vb[0]);
        var y=getFloat(vb[1]);
        var x1=getFloat(vb[2]);
        var y1=getFloat(vb[3]);
       
        var e = window.event;
        let kh = e.clientY/window.innerHeight;
        let scaleX = 0.5*0.725/1000;
 
        if(e.deltaY<0 && x1-zoomDelta>0 && y1-zoomDelta>0){
            if(e.shiftKey){ //to left
                x+=scrollDelta;
            } else
            if(!e.ctrlKey){
                y-=scrollDelta;
            } else{
                x+=(zoomDelta * e.clientX * scaleX); // x+=zoomDelta/2;
                y+=(zoomDelta * zoomY/2)*kh; // y+=zoomDelta * zoomY/2;
                x1-=zoomDelta;
                y1-=zoomDelta * zoomY;
            }
        };
        if(e.deltaY>0 && x1+zoomDelta>0 && y1+zoomDelta>0){
            if(e.shiftKey){ //to left
                x-=scrollDelta;
            } else
            if(!e.ctrlKey){
                y+=scrollDelta;
            } else{
                x-=(zoomDelta * e.clientX * scaleX); // x-=zoomDelta/2;
                y-=(zoomDelta * zoomY/2)*kh; // y-=zoomDelta * zoomY/2;
                x1+=zoomDelta;
                y1+=zoomDelta * zoomY;
            }
        };        $(place).svgviewbox(x,y,x1,y1,false);
        svgMultuplX = svgStartWidth/x1;
        svgMultuplY = svgStartHeight/y1;
        $(place).setviewpageparam({
            mx:svgMultuplX,
            my:svgMultuplY,
            sw:svgStartWidth,
            sh:svgStartHeight
        },false);
    }, 50));
}
$.fn.svgviewbox = function(x,y,dx,dy,putinhistory){
    var vb=$(this).get(0).getAttribute("viewBox");
    if(x==undefined){
        if(vb) return vb.split(" ");
        var data=[];
        data.push(0);
        data.push(0);
        data.push($(this).css("width"));
        data.push($(this).css("height"));
        return data;
    }
    $(this)[0].setAttribute("viewBox",
        (x==undefined?(vb==undefined?0:vb[0]):x).toString() + " " +
        (y==undefined?(vb==undefined?0:vb[1]):y).toString() + " " +
        (dx==undefined || dx<0?(vb==undefined?getFloat($(this).css("width")):vb[2]):dx).toString() + " " +
        (dy==undefined || dy<0?(vb==undefined?getFloat($(this).css("height")):vb[3]):dy).toString()
    );
    $(this).setviewpageparam({
        x:(x==undefined?(vb==undefined?0:vb[0]):x),
        y:(y==undefined?(vb==undefined?0:vb[1]):y),
        dx:(dx==undefined || dx<0?(vb==undefined?getFloat($(this).css("width")):vb[2]):dx),
        dy:(dy==undefined || dy<0?(vb==undefined?getFloat($(this).css("height")):vb[3]):dy)
    },putinhistory);
}
function intersectsegment (x1,y1,x2,y2,minX,minY,maxX,maxY) {  
    // Completely outside.
    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
        return false;

    var m = (y2 - y1) / (x2 - x1);
    var y = m * (minX - x1) + y1;
    if (y > minY && y < maxY) return true;
    y = m * (maxX - x1) + y1;
    if (y > minY && y < maxY) return true;
    var x = (minY - y1) / m + x1;
    if (x > minX && x < maxX) return true;
    x = (maxY - y1) / m + x1;
    if (x > minX && x < maxX) return true;
    return false;
}
var intersectline = function(a,points){
    var x1;
    var y1;
    var x2;
    var y2;

    var ax1 = getFloat(a.x);
    var ay1 = getFloat(a.y);
    var ax2 = getFloat(a.x)+getFloat(a.w);
    var ay2 = getFloat(a.y)+getFloat(a.h);
    var dx = (ax1+ax2)/2;
    var dy = (ay1+ay2)/2;
    ax1-=dx;
    ay1-=dy;
    ax2-=dx;
    ay2-=dy;

    var result = false;
    if(points){
        $.each(points.split(','),function(i,e){
            var point=e.trim().split(" ");
            if(point.length>0){
                x2=getFloat(point[0])-dx;
                y2=getFloat(point[1])-dy;
            }
            if(x1!=undefined){
                result = result || intersectsegment(x1,y1,x2,y2,ax1,ay1,ax2,ay2);
                if(result) return result;
            }
            x1=x2;
            y1=y2;
        });
    }
    return result;

}
var intersectline2 = function(a,points){
    var x1;
    var y1;
    var x2;
    var y2;
    var ax = getFloat(a.x);
    var ay = getFloat(a.y);
    var ax1 = getFloat(a.x)+getFloat(a.w);
    var ay1 = getFloat(a.y)+getFloat(a.h);
    var result = false;
    $.each(points.split(','),function(i,e){
        var point=e.trim().split(" ");
        if(point.length>0){
            x2=getFloat(point[0]);
            y2=getFloat(point[1]);
        }
        if(x1!=undefined){
            result = result || intersects(
                {
                    x:ax,
                    y:ay,
                    x1:ax1,
                    y1:ay1
                },
                {
                    x:x1,
                    y:y1,
                    x1:x2,
                    y1:y2
                }
            );
            if(result) return result;
        }
        x1=x2;
        y1=y2;
    });
    //console.log(result);
    return result;
}
var intersects = function ( a, b ) {
    //console.log(a,b);
    return(
        (
          (
            ( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1  )
          ) && (
            ( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 )
          )
        )||(
          (
            ( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1  )
          ) && (
            ( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 )
          )
        )
      )||(
        (
          (
            ( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1  )
          ) && (
            ( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 )
          )
        )||(
          (
            ( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1  )
          ) && (
            ( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 )
          )
        )
      );
}

$.fn.importfromsvg = function(content){
    var canvas=this;
    if(content && content.startsWith('<svg ')){

        const htmlObject = new DOMParser().parseFromString(content, 'text/html').body.firstChild;

        //console.log($(htmlObject).find("svg[data-type='element']:not([data-type3='simple'])"));

        //storeupdate(e,undefined,true);

        /*$(canvas).remove();
        $("canvas").after(content);
        $(canvas).attr({
            "data-type":"document"
        });
        var cview = $(canvas).attr("cview");
        if(cview!=undefined)
            $("div.left-menu-row.down").pagemenu(cview);
        //var vb = $(canvas).svgviewbox();
        //$(canvas).svgviewbox(parseFloat(vb[0]),parseFloat(vb[1]),parseFloat(vb[2]),parseFloat(vb[3]));*/
        
        //$("#new").click();
        var datast=[];
        $(htmlObject).find("svg[data-type='zone']").each(function(i,e){
            var params = ($(this).attr("data-param")==undefined?{}:$.extend(JSON.parse($(this).attr("data-param")),
            {
                id:$(e).prop("id"),
                datatype:"zone",
                view:$(this).attr("data-view"),
                color:$(this).attr("data-color"),
                viewdata:{
                    interface:{
                        order:datast.length+1,                                    
                        left:$(this).attr("x"),
                        top: $(this).attr("y"),
                        width : $(this).attr("width"),
                        height : $(this).attr("height")
                    }
                }
            }));
            datast.push(params);
        });
        $(htmlObject).find("svg[data-type='element']:not([data-type3='simple'])").each(function(i,e){
            var params = ($(this).attr("data-param")==undefined?{}:JSON.parse($(this).attr("data-param")));
            params = $.extend(params,{
                id:$(e).prop("id"),
                datatype:"element",
                viewdata:{
                    interface:{
                        order:datast.length+1,                                    
                        left:$(this).attr("x"),
                        top: $(this).attr("y"),
                        width : $(this).attr("width"),
                        height : $(this).attr("height")
                    }
                }
            });
            datast.push(params);
        });
        $(htmlObject).find("g[data-type='line']:not([data-type2='simple'])").each(function(i,e){
            var points="";
            $(e).find("g[data-type='main'] line").each(function(i1,e1){
                if(i1==0)
                    points+= $(e1).attr("x1") + " " + $(e1).attr("y1");
                points+= "," + $(e1).attr("x2") + " " + $(e1).attr("y2");
            });
            let txt = $(e).find("text");
            var params={
                id:$(e).prop("id"),
                name:$(this).attr("data-name"),
                state:$(this).attr("data-state"),
                datatype:"line",
                startel:$(this).attr("data-start"),
                startfn:$(this).attr("data-start-function"),
                endel:$(this).attr("data-end"),
                endfn:$(this).attr("data-end-function"),
                number:$(this).find("text.line-number").text(),
                data:($(this).attr("data-data")==undefined?"":JSON.parse($(this).attr("data-data"))),
                function:$(this).attr("data-function"),
                supplyint:$(this).attr("data-supplyint"),
                consumerint:$(this).attr("data-consumerint"),
                intplatform:$(this).attr("data-intplatform"),
                interaction:($(this).attr("data-interaction")),
                view:$(this).attr("data-view"),
                viewdata : {
                    interface:{
                        order:datast.length+1,                                    
                        points: points,
                        direction:$(this).attr("data-direction"),
                        enddx:$(this).attr("data-end-dx"),
                        enddy:$(this).attr("data-end-dy"),
                        startdx:$(this).attr("data-start-dx"),
                        startdy:$(this).attr("data-start-dy"),
                        text : {
                            x: $(txt).attr("x"),
                            y: $(txt).attr("y"),
                            height: $(txt).attr("height"),
                            width: $(txt).attr("width")
                        }
                    }
                }
            };
            datast.push(params);
        });
        $(htmlObject).find("svg[data-type='legend']").each(function(i,e){
            var params = ($(this).attr("data-param")==undefined?{}:$.extend(JSON.parse($(this).attr("data-param")),
            {
                id:$(e).prop("id"),
                datatype:"legend",
                view:$(this).attr("data-view"),
                viewdata:{
                    interface:{
                        order:datast.length+1,                                    
                        left:$(this).attr("x"),
                        top: $(this).attr("y"),
                        width : $(this).attr("width"),
                        height : $(this).attr("height"),
                    }
                }
            }));
            datast.push(params);
        });
        $.each(datast,function(i,params){
            if(getInt(params.id)==0) params.id=$.newguid();
            if(!params.name) params.name="";
            storedirectlyset(params.id,params,undefined,false);
        });
        $.each(datast.sort(function(a,b){
            return $.logicsort(a,b);
        }),function(i,e){
            storeupdate(e,undefined,true);
        });
        $(canvas).svgfitcanvas();
        return true;
    }
    return false;
}