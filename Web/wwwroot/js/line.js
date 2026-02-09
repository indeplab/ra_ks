var lineFn="default";
$.fn.lineget = function(){
    var container=this;
    var params = $(container).storeget();
    //params=$(container).lineinterface(params);
    //params=$(container).lineintplatform(params);
    return params;
}
$.fn.lineintplatform = function(params){
    if($.pagemenu()=="system" && params.viewdata!=undefined && params.viewdata["system"]!=undefined && params.viewdata["system"].points!=undefined)
    {
        var parammenu = params.viewdata["system"];
        var intplatform="";
        $("svg[data-type='element']").each(function(i,e){
            var element=$(e).logicget();
            if($($.intplatformdictionary()).objectArrayGetByField("name",element.name)/*element.type=="Интеграционная платформа"*/){
                var ep = $.getviewpageparam(element);
                if(intersectline(ep,parammenu.points)){
                    intplatform+=(intplatform!=""?", ":"") + element.name;
                }
            }
        });
        if(!intplatform || intplatform==""){
            if(!params.intplatform || params.intplatform=="") {
                params.intplatform="P2P";
                //$.propertyset(params,true);
            }
        }
        else{
            params.intplatform = intplatform;
            //$.propertyset(params,true);
        }
        //$(this).storeset(params);
        var el=params.endel;
        if(params.function=="supply")
            el=params.startel;
        if(el && params.endfn){
            var endel=$.storeget(el);
            $.each(endel.functions,function(i,e){
                if(e.id==params.endfn){
                    params.endfnname=e.name;
                    params.endfnstate = e.state;
                }
            })
        }
        //$(this).linetextset(params);
    }
    return params;
}
var filllineintplatform = function(param){
    var intlist=linegetinterfacelist(param.number);
    if(intlist.length>0){
        param.intplatform="";
        param.intformula="";
        $.each(intlist.sort(function(a,b){
            if(isInt(a.number) && isInt(b.number)){
                if(getInt(a.number)<getInt(b.number)) return -1;
                return 1;
            }
            else{
                if(a.number<b.number) return -1;
                return 1;
            }
        }),function(i1,p1){
            if(p1.intplatform){
                $.each(p1.intplatform.split(','),function(i2,e2){
                    if(param.intplatform.indexOf(e2.trim())==-1 && e2.trim()!="P2P")
                        param.intplatform += (param.intplatform && param.intplatform.length>0?", ":"") + e2.trim();
                });
            }
            var startel = $.storeget(p1.startel);
            var endel = $.storeget(p1.endel);
            if($($.intplatformdictionary()).objectArrayGetByField("name",startel.name) && param.intplatform.indexOf(startel.name)==-1)
                param.intplatform += (param.intplatform && param.intplatform.length>0?", ":"") + startel.name;
            if($($.intplatformdictionary()).objectArrayGetByField("name",endel.name) && param.intplatform.indexOf(endel.name)==-1)
                param.intplatform += (param.intplatform && param.intplatform.length>0?", ":"") + endel.name;
            
                var gt="->";
                var lt="<-"
                if(p1.viewdata["system"].direction=="r"){
                    gt="<-";
                    lt="->"
                }
                if(i1!=0){
                // Добавляем источник
                param.intformula+= startel.name + gt;
            }
            if(!p1.supplyint) p1.supplyint="";
            if(!p1.consumerint) p1.consumerint="";
            var commonint = (p1.supplyint!="" && p1.consumerint!=""?"":(p1.supplyint!=""?p1.supplyint:p1.consumerint));
            var gt=(p1.viewdata["system"].direction=="f"?"->":"")
            //console.log(p1.number,commonint,p1.supplyint,p1.consumerint)
            param.intformula+=(p1.intplatform!="" && p1.intplatform!="P2P"?(commonint!=""?commonint:p1.consumerint) +  "->{" + p1.intplatform + "}<-" + (commonint!=""?commonint:p1.supplyint):(commonint!=""?commonint:p1.supplyint)+lt);
            
            if($.isempty(param.consumermethod) && param.supplyfunction && !$.isempty(param.supplyfunction.method))
                param.consumermethod=param.supplyfunction.method;

            if((param.function=="consumer"?param.startel:param.endel) == (p1.function=="consumer"?p1.startel:p1.endel)){
                param.supplyint=p1.supplyint;
            }
            //if(p1.id=="a29c9a18-78a3-4289-8a21-24c613bb98a1") debugger;
            if((param.function=="supply"?param.startel:param.endel) == (p1.function=="supply"?p1.startel:p1.endel)){
                param.consumerint=p1.consumerint;
                //if(param.number=="10") debugger;
                // 2 kill
                if(!$.isempty(p1.consumermethod) && param.supplyfunction &&  $.isempty(param.supplyfunction.method)){
                    param.supplyfunction.method=p1.consumermethod;
                    var supply= (p1.function=="supply"?startel:endel);
                    $.each(supply.functions,function(i1,f1){
                        if(f1.id==param.supplyfunction.id){
                            f1.method=p1.consumermethod;
                            storedirectlyset(supply.id,supply,false);
                        }
                    })
                }
                if(($.isempty(p1.consumermethod) || $.isempty(p1.endfnname)) && param.supplyfunction){
                    if($.isempty(p1.consumermethod) && !$.isempty(param.supplyfunction.method)) p1.consumermethod=param.supplyfunction.method;
                    if($.isempty(p1.endfnname)) {
                        p1.endfn=param.supplyfunction.id;
                        p1.endfnname=param.supplyfunction.name;
                    }
                    storedirectlyset(p1.id,p1,false);
                }
            }
        });
    }
    //param.intformula = getClearedString(param.intformula);
    return param;
}
$.fn.lineinterface = function(params){
    /*if($.pagemenuname()=="business"){
        var conn = $.linegetconnection(params);
        if(conn.supply){
            var supply=$.storeget(conn.supply);
            if(supply.datatype=="function") params.endfn = supply.sysid;
            conn.supply=supply.container;
        }
        if(conn.consumer){
            var consumer=$.storeget(conn.consumer);
            if(consumer.datatype=="function") params.startfn = consumer.sysid;
            conn.consumer=consumer.container;
        }
        if(params.startfn && params.endfn){
            // пытаемся найти интерфейс
            $.each($.storekeys(),function(i,id){
                if(id!=params.id){
                    var p = $.storeget(id);
                    if(p.datatype=="line" && p.viewdata && p.viewdata["interface"] && p.startfn==params.startfn && p.endfn==params.endfn){
                        var c = $.linegetconnection(p);
                        if(conn.consumer==c.consumer && conn.supply==c.supply){
                            params.parentel=p.id;
                            params.name=p.name;
                            params.number=p.number;
                            params.sysid=p.sysid;
                            params.docref=p.docref;
                        }
                    }
                }
            });
            //$(this).linetextset(params);
        }
    }*/
    return params;
}
/*$.linedirectdistance = function(start,end){
    let x1=start.cx,x2=end.cx,y1=start.cy,y2=end.cy;
    if(start){
        if(y2==y1) x1=x2; else x1+=(x2-x1)*(start.h/2)/(y2-y1)*Math.sign(y2-y1);
        if(x1>start.x+start.w) x1=start.x+start.w;
        if(x1<start.x) x1=start.x;

        if(x2==x1) y1=y2; else y1+=(y2-y1)*(start.w/2)/(x2-x1)*Math.sign(x2-x1);
        if(y1>start.y+start.h) y1=start.y+start.h;
        if(y1<start.y) y1=start.y;
    }
    if(end){
        if(y2==y1)x2=x1; else x2+=(x2-x1)*(end.h/2)/(y2-y1)*Math.sign(y1-y2);
        if(x2>end.x+end.w) x2=end.x+end.w;
        if(x2<end.x) x2=end.x;

        if(x2==x1) y2=y1; else y2+=(y2-y1)*(end.w/2)/(x2-x1)*Math.sign(x1-x2);
        if(y2>end.y+end.h) y2=end.y+end.h;
        if(y2<end.y) y2=end.y;
    }
    let sign = 1;
    if(start.x1<x2 && x2<start.x2 && start.y1<y2 && y2<start.y2) sign=-1;
    if(end.x1<x1 && x1<end.x2 && end.y1<y1 && y1<end.y2) sign=-1;
    return {
        x1:x1,
        x2:x2,
        y1:y1,
        y2:y2
    }
}
*/
$.linecalculate = function(params,pm){
    let parammenu={};
    if((params.startel && params.endel)){
        var startel = $("#" + params.startel);
        var endel = $("#" + params.endel);
        var start={
            x:getFloat(startel.attr("x")),
            y:getFloat(startel.attr("y")),
            w:getFloat(startel.attr("width")),
            h:getFloat(startel.attr("height"))
        }
        start=$.extend(start,{
            cx:start.x+start.w/2,
            cy:start.y+start.h/2
        });
        var end={
            x:getFloat(endel.attr("x")),
            y:getFloat(endel.attr("y")),
            w:getFloat(endel.attr("width")),
            h:getFloat(endel.attr("height"))
        }
        end=$.extend(end,{
            cx:end.x+end.w/2,
            cy:end.y+end.h/2
        });
        let min=0.1;
        let max=0.9;
        let minRandom = Math.random() * (max-min)/2 + min;
        let maxRandom = max - Math.random() * (max-min)/2;
        switch(params.datatype2){
            case "direct":
            case "simple":
                parammenu.points= $([
                    [start.cx, start.cy],
                    [end.cx, end.cy]
                ]).toPointString();
                break;
            case "curved":
                var direction = (Math.abs(start.cx-end.cx)>Math.abs(start.cy-end.cy)?"h":"v");
                if(start.x<end.cx && end.cx<start.x+start.w || end.x<start.cx && start.cx<end.x+end.w) direction="v";
                if(start.y<end.cy && end.cy<start.y+start.h || end.y<start.cy && start.cy<end.y+end.h) direction="h";

                parammenu.startdx=(direction=="h"
                    ?(end.x>start.x?1:0)
                    :(end.cx>start.cx?(pm.startdx<0.5 || pm.startdx>max?maxRandom:pm.startdx):(pm.startdx>=0.5 || pm.startdx<min?minRandom:pm.startdx))
                );
                parammenu.enddx=(direction=="h"
                    ?(start.x>end.x?1:0)
                    :(end.cx<start.cx?(pm.enddx<0.5 || pm.enddx>max?maxRandom:pm.enddx):(pm.enddx>=0.5 || pm.enddx<min?minRandom:pm.enddx))
                );
                parammenu.startdy=(direction=="v"
                    ?(end.y>start.y?1:0)
                    :(end.cy>start.cy?(pm.startdy<0.5 || pm.startdy>max?maxRandom:pm.startdy):(pm.startdy>=0.5 || pm.startdy<min?minRandom:pm.startdy))
                );
                parammenu.enddy=(direction=="v"
                    ?(start.y>end.y?1:0)
                    :(end.cy<start.cy?(pm.enddy<0.5 || pm.enddy>max?maxRandom:pm.enddy):(pm.enddy>=0.5 || pm.enddy<min?minRandom:pm.enddy))
                );

                if(direction=="h"){
                    parammenu.points= $([
                        [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                        [(parammenu.enddx==0?end.x:end.x+end.w), end.y + parammenu.enddy*end.h]
                    ]).toPointString();
                }
                else{
                    parammenu.points= $([
                        [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                        [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y+end.h)]
                    ]).toPointString();
                }
                break;
            default:
                var delta = 0;
                var deltael = 30;
                let directionstart = "";
                let directionend = "";
                if(
                    (start.y<end.y && start.y+start.h<end.y-deltael || end.y<start.y && end.y+end.h<start.y-deltael) &&
                    (start.x-delta<end.x && end.x<start.x+start.w+delta 
                    || start.x-delta<end.x+end.w && end.x+end.w<start.x+start.w+delta 
                    || end.x-delta<start.x && start.x<end.x+end.w+delta
                    || end.x-delta<start.x+start.w && start.x+start.w<end.x+end.w+delta)
                ) directionstart=directionend="v";
                if(
                    (start.x<end.x && start.x+start.w<end.x-deltael || end.x<start.x && end.x+end.w<start.x-deltael) &&
                    (start.y-delta<end.y && end.y<start.y+start.h+delta 
                    || start.y-delta<end.y+end.h && end.y+end.h<start.y+start.h+delta 
                    || end.y-delta<start.y && start.y<end.y+end.h+delta
                    || end.y-delta<start.y+start.h && start.y+start.h<end.y+end.h+delta)
                ) directionstart=directionend="h";


                if(directionstart=="" && directionend==""){
                    let minhstart = Math.min(Math.abs(start.y-end.y),Math.abs(start.y-end.y-end.h));
                    let minhend = Math.min(Math.abs(start.y+start.h-end.y),Math.abs(start.y+start.h-end.y-end.h));
                    let minwstart = Math.min(Math.abs(start.x-end.x),Math.abs(start.x-end.x-end.w));
                    let minwend = Math.min(Math.abs(start.x+start.w-end.x),Math.abs(start.x+start.w-end.x-end.w));
                    /*let dist = $.linedirectdistance(start,end);
                    var place=$("svg[data-type='document']");
                    $(place).find("line[data-type='show-to']").remove();
                    $(place).svg("line",$.extend(dist,{
                        "data-type":"show-to",
                        style:"stroke:red"
                    }));*/
    
                    //console.log(minw,minh);
                    if(minhstart<minwstart || minhend<minwend /*Math.abs(dist.x1-dist.x2)>Math.abs(dist.y1-dist.y2)*/){
                        directionstart="h";
                        directionend="v";
                    }
                    else{
                        directionstart="v";
                        directionend="h";
                    }
                }

                //console.log(directionstart,directionend);
                //debugger;
                parammenu.startdx=(directionstart=="h"
                    ?(end.x>start.x?1:0)
                    :(end.cx>start.cx?(pm.startdx<0.5 || pm.startdx>max?maxRandom:pm.startdx):(pm.startdx>=0.5 || pm.startdx<min?minRandom:pm.startdx))
                );
                parammenu.enddx=(directionend=="h"
                    ?(start.x>end.x?1:0)
                    :(end.cx<start.cx?(pm.enddx<0.5 || pm.enddx>max?maxRandom:pm.enddx):(pm.enddx>=0.5 || pm.enddx<min?minRandom:pm.enddx))
                );
                parammenu.startdy=(directionstart=="v"
                    ?(end.y>start.y?1:0)
                    :(end.cy>start.cy?(pm.startdy<0.5 || pm.startdy>max?maxRandom:pm.startdy):(pm.startdy>=0.5 || pm.startdy<min?minRandom:pm.startdy))
                );
                parammenu.enddy=(directionend=="v"
                    ?(start.y>end.y?1:0)
                    :(end.cy<start.cy?(pm.enddy<0.5 || pm.enddy>max?maxRandom:pm.enddy):(pm.enddy>=0.5 || pm.enddy<min?minRandom:pm.enddy))
                );
                //console.log(directionstart, directionend, pm.enddy, parammenu.enddy);

                if(directionstart==directionend){
                    let md=Math.random();
                    if(directionstart=="h"){
                        var middle=((parammenu.startdx==0?start.x:start.x+start.w)+(parammenu.enddx==0?end.x:end.x+end.w))/2;
                        var delta =Math.abs((middle-(parammenu.startdx==0?start.x:start.x+start.w)))/2
                        middle=md * (middle+delta-(middle-delta))+middle-delta;
                        parammenu.points= $([
                            [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                            [middle,start.y+parammenu.startdy*start.h],
                            [middle,end.y + parammenu.enddy*end.h],
                            [(parammenu.enddx==0?end.x:end.x+end.w), end.y + parammenu.enddy*end.h]
                        ]).toPointString();
                    }
                    else{
                        var middle=((parammenu.startdy==0?start.y:start.y+start.h)+(parammenu.enddy==0?end.y:end.y+end.h))/2;
                        var delta =Math.abs((middle-(parammenu.startdy==0?start.y:start.y+start.h)))/2
                        middle=md * (middle+delta-(middle-delta))+middle-delta;
                        parammenu.points= $([
                            [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                            [start.x+parammenu.startdx*start.w,middle],
                            [end.x+parammenu.enddx*end.w, middle],
                            [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y+end.h)]
                        ]).toPointString();
                    }
                }
                else{
                    if(directionstart=="h"){
                        parammenu.points= $([
                            [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                            [(parammenu.enddx==0?end.x:end.x+parammenu.enddx*end.w),start.y+parammenu.startdy*start.h],
                            [(parammenu.enddx==0?end.x:end.x+parammenu.enddx*end.w), end.y + parammenu.enddy*end.h]
                        ]).toPointString();
                    }
                    else{
                        parammenu.points= $([
                            [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                            [start.x+parammenu.startdx*start.w,(parammenu.enddy==0?end.y:end.y + parammenu.enddy*end.h)],
                            [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y + parammenu.enddy*end.h)]
                        ]).toPointString();
                    }
                }
                break;
        }
    }
    return parammenu;
}
$.lineaddconnector = function(a,b,params){
    var lineviewdata = {};
    lineviewdata[$.pagemenu()]={
        order:$("svg[data-type='document']").lastentityindex(),                                
        direction:"f"//f, r
    };
    var datatype2="rectangle";
    if($.pagemenuname()=="business")
        datatype2="direct";
    if($.pagemenuname()=="function"){
        if($(a).attr("data-type")!="zone" && $(b).attr("data-type")!="zone")    
            datatype2="curved";
    }
    var id = $.newguid();
    $.storeset({
        id: id,
        name:"Новый интерфейс",
        state:"exist",
        datatype:"line",
        datatype2:datatype2,
        function:"consumer",//supply, consumer
        number:($.pagemenuname()=="business"?(params?.name):$.linegetnewnumber()),
        startel:$(a).prop("id"),
        starttype:$(a).attr("data-type"),
        endel:$(b).prop("id"),
        endtype:$(b).attr("data-type"),
        interaction:"Синхронное",
        data:(params?.data),
        viewdata:lineviewdata
    });
    $("#"+id).lineempty();
    return id;
}
$.getlinedirection = function(param,pagemenu){
    let direction = "f";
    if(!param || !param.viewdata)
        return direction;
    if(!pagemenu) pagemenu=$.pagemenu();
    if(pagemenu=="business"){
        for(let i of Object.keys(param.viewdata))
            if(param.viewdata[i] && param.viewdata[i].direction)
                direction = param.viewdata[i].direction;
        return direction;
    }
    else
        return ((param.viewdata[pagemenu] && param.viewdata[pagemenu].direction)?param.viewdata[pagemenu].direction:direction);
}
$.linereflection = function(parammenu){
    let list = [];
    if(parammenu.datatype2=="curved"){
        parammenu.points.split(",").forEach(item => {
            let p = item.split(" ");
            if(p.length==2){
                list.push([p[1],p[0]]);
            }
            else if(p.length==4){
                list.push([p[1],p[0]]);
                list.push([p[3],p[2]]);
            }
        });
    }
    else{
        parammenu.points.split(",").forEach(item => {
            let p = item.split(" ");
            if(p.length==2){
                list.push([p[1],p[0]]);
            }
        });
    }
    return $.extend(parammenu,{
        points:$(list).toPointString()
    });
}
$.fn.lineset = function(params, transparent){
    var container=this;
    params=$(container).lineinterface(params);
    params=$(container).lineintplatform(params);
    var parammenu = $.getviewpageparam(params);
    $(container).attr({
        "class":transparent?"transparent":undefined,
        "data-id":params.id,
        /*"data-name":params.name,*/
        "data-type3":params.datatype3,
        "data-state":params.state,
        "data-function":params.function,
        "data-direction":parammenu.direction,
        "data-supplyint":params.supplyint,
        "data-consumerint":params.consumerint,
        "data-interaction":params.interaction,
        "data-view":$.pagemenuname(),
        "data-notation":$.pagenotation(),
        "data-dash-line" : (params.datatype3=="dashline"?true:false),
        "data-start":null,
        "data-start-function":null,
        "data-start-dx":null,
        "data-start-dy":null,
        "data-start-type":null,
        "data-end":null,
        "data-end-function":null,
        "data-end-dx":null,
        "data-end-dy":null,
        "data-end-type":null
    });
    //if(params.id=="72593684-b2d9-4f71-9a3b-458b22bd36f2") debugger;
    if(!parammenu.points && (params.startel && params.endel)){
        var startel = $("#" + params.startel);
        var endel = $("#" + params.endel);

        let clientX=0, clientY=0;
        if($(startel).attr("data-container") && $(startel).attr("data-container")!="" && $(startel).attr("data-container")!=params.container){
            var pm=$("#"+$(startel).attr("data-container")).logicGetGlobalOffset();
            clientX = pm.x;
            clientY = pm.y;
        }
        var start={
            x:getFloat(startel.attr("x"))+clientX,
            y:getFloat(startel.attr("y"))+clientY,
            w:getFloat(startel.attr("width")),
            h:getFloat(startel.attr("height"))
        }
        start=$.extend(start,{
            cx:start.x+start.w/2,
            cy:start.y+start.h/2
        });

        clientX=0; 
        clientY=0;
        if($(endel).attr("data-container") && $(endel).attr("data-container")!="" && $(endel).attr("data-container")!=params.container){
            var pm=$("#"+$(endel).attr("data-container")).logicGetGlobalOffset();
            clientX = pm.x;
            clientY = pm.y;
        }
        var end={
            x:getFloat(endel.attr("x"))+clientX,
            y:getFloat(endel.attr("y"))+clientY,
            w:getFloat(endel.attr("width")),
            h:getFloat(endel.attr("height"))
        }
        end=$.extend(end,{
            cx:end.x+end.w/2,
            cy:end.y+end.h/2
        });
        let min=0.1;
        let max=0.9;
        let minRandom = Math.random() * (max-min)/2 + min;
        let maxRandom = max - Math.random() * (max-min)/2;
        switch(params.datatype2){
            case "direct":
            case "simple":
                parammenu.startdx = (end.x>start.x?1:0);
                parammenu.startdy = (end.y>start.y?1:0);
                parammenu.enddx = (start.x>end.x?1:0);
                parammenu.enddy = (start.y>end.y?1:0);
                let x1=start.cx,x2=end.cx,y1=start.cy,y2=end.cy;
                if(start){
                    if(y2==y1) x1=x2; else x1+=(x2-x1)*(start.h/2)/(y2-y1)*Math.sign(y2-y1);
                    if(x1>start.x+start.w) x1=start.x+start.w;
                    if(x1<start.x) x1=start.x;
        
                    if(x2==x1) y1=y2; else y1+=(y2-y1)*(start.w/2)/(x2-x1)*Math.sign(x2-x1);
                    if(y1>start.y+start.h) y1=start.y+start.h;
                    if(y1<start.y) y1=start.y;
                }
                if(end){
                    if(y2==y1)x2=x1; else x2+=(x2-x1)*(end.h/2)/(y2-y1)*Math.sign(y1-y2);
                    if(x2>end.x+end.w) x2=end.x+end.w;
                    if(x2<end.x) x2=end.x;
        
                    if(x2==x1) y2=y1; else y2+=(y2-y1)*(end.w/2)/(x2-x1)*Math.sign(x1-x2);
                    if(y2>end.y+end.h) y2=end.y+end.h;
                    if(y2<end.y) y2=end.y;
                }
                parammenu.points= $([
                    [x1, y1],
                    [x2, y2]
                ]).toPointString();
                break;
            case "curved":
                var direction = (Math.abs(start.cx-end.cx)>Math.abs(start.cy-end.cy)?"h":"v");
                if(start.x<end.cx && end.cx<start.x+start.w || end.x<start.cx && start.cx<end.x+end.w) direction="v";
                if(start.y<end.cy && end.cy<start.y+start.h || end.y<start.cy && start.cy<end.y+end.h) direction="h";

                parammenu.startdx=(direction=="h"?(end.x>start.x?1:0):(end.cx>start.cx?maxRandom:minRandom));
                parammenu.enddx=(direction=="h"?(start.x>end.x?1:0):(end.cx<start.cx?maxRandom:minRandom));
                parammenu.startdy=(direction=="v"?(end.y>start.y?1:0):(end.cy>start.cy?maxRandom:minRandom));
                parammenu.enddy=(direction=="v"?(start.y>end.y?1:0):(end.cy<start.cy?maxRandom:minRandom));
                if(direction=="h"){
                    parammenu.points= $([
                        [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                        [(parammenu.enddx==0?end.x:end.x+end.w), end.y + parammenu.enddy*end.h]
                    ]).toPointString();
                }
                else{
                    parammenu.points= $([
                        [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                        [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y+end.h)]
                    ]).toPointString();
                }
                break;
                default:
                    var delta = 0;
                    let directionstart = "";
                    let directionend = "";
                    
                    if(
                        start.x-delta<end.x && end.x<start.x+start.w+delta 
                        || start.x-delta<end.x+end.w && end.x+end.w<start.x+start.w+delta 
                        || end.x-delta<start.x && start.x<end.x+end.w+delta
                        || end.x-delta<start.x+start.w && start.x+start.w<end.x+end.w+delta
                    ) directionstart=directionend="v";
                    if(
                        start.y-delta<end.y && end.y<start.y+start.h+delta 
                        || start.y-delta<end.y+end.h && end.y+end.h<start.y+start.h+delta 
                        || end.y-delta<start.y && start.y<end.y+end.h+delta
                        || end.y-delta<start.y+start.h && start.y+start.h<end.y+end.h+delta
                    ) directionstart=directionend="h";
    
                    if(directionstart=="" && directionend==""){
                        let minhstart = Math.min(Math.abs(start.y-end.y),Math.abs(start.y-end.y-end.h));
                        let minhend = Math.min(Math.abs(start.y+start.h-end.y),Math.abs(start.y+start.h-end.y-end.h));
                        let minwstart = Math.min(Math.abs(start.x-end.x),Math.abs(start.x-end.x-end.w));
                        let minwend = Math.min(Math.abs(start.x+start.w-end.x),Math.abs(start.x+start.w-end.x-end.w));
                        /*let dist = $.linedirectdistance(start,end);
                        var place=$("svg[data-type='document']");
                        $(place).find("line[data-type='show-to']").remove();
                        $(place).svg("line",$.extend(dist,{
                            "data-type":"show-to",
                            style:"stroke:red"
                        }));*/
        
                        //console.log(minw,minh);
                        if(minhstart<minwstart || minhend<minwend /*Math.abs(dist.x1-dist.x2)>Math.abs(dist.y1-dist.y2)*/){
                            directionstart="h";
                            directionend="v";
                        }
                        else{
                            directionstart="v";
                            directionend="h";
                        }
                        }
    
                    parammenu.startdx=(directionstart=="h"?(end.x>start.x?1:0):(end.cx>start.cx?maxRandom:minRandom));
                    parammenu.enddx=(directionend=="h"?(start.x>end.x?1:0):(end.cx<start.cx?maxRandom:minRandom));
                    parammenu.startdy=(directionstart=="v"?(end.y>start.y?1:0):(end.cy>start.cy?maxRandom:minRandom));
                    parammenu.enddy=(directionend=="v"?(start.y>end.y?1:0):(end.cy<start.cy?maxRandom:minRandom));

                    if(directionstart==directionend){
                        let md=Math.random();
                        if(directionstart=="h"){
                            var middle=((parammenu.startdx==0?start.x:start.x+start.w)+(parammenu.enddx==0?end.x:end.x+end.w))/2;
                            var delta =Math.abs((middle-(parammenu.startdx==0?start.x:start.x+start.w)))/2
                            middle=md * (middle+delta-(middle-delta))+middle-delta;
                            parammenu.points= $([
                                [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                                [middle,start.y+parammenu.startdy*start.h],
                                [middle,end.y + parammenu.enddy*end.h],
                                [(parammenu.enddx==0?end.x:end.x+end.w), end.y + parammenu.enddy*end.h]
                            ]).toPointString();
                        }
                        else{
                            var middle=((parammenu.startdy==0?start.y:start.y+start.h)+(parammenu.enddy==0?end.y:end.y+end.h))/2;
                            var delta =Math.abs((middle-(parammenu.startdy==0?start.y:start.y+start.h)))/2
                            middle=md * (middle+delta-(middle-delta))+middle-delta;
                            parammenu.points= $([
                                [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                                [start.x+parammenu.startdx*start.w,middle],
                                [end.x+parammenu.enddx*end.w, middle],
                                [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y+end.h)]
                            ]).toPointString();
                        }
                    }
                    else{
                        if(directionstart=="h"){
                            parammenu.points= $([
                                [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                                [(parammenu.enddx==0?end.x:end.x+parammenu.enddx*end.w),start.y+parammenu.startdy*start.h],
                                [(parammenu.enddx==0?end.x:end.x+parammenu.enddx*end.w), end.y + parammenu.enddy*end.h]
                            ]).toPointString();
                        }
                        else{
                            parammenu.points= $([
                                [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                                [start.x+parammenu.startdx*start.w,(parammenu.enddy==0?end.y:end.y + parammenu.enddy*end.h)],
                                [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y + parammenu.enddy*end.h)]
                            ]).toPointString();
                        }
                    }
                    break;
                /*default:
                var direction = (Math.abs(start.cx-end.cx)>Math.abs(start.cy-end.cy)?"h":"v");
                if(start.x<end.cx && end.cx<start.x+start.w || end.x<start.cx && start.cx<end.x+end.w) direction="v";
                if(start.y<end.cy && end.cy<start.y+start.h || end.y<start.cy && start.cy<end.y+end.h) direction="h";

                parammenu.startdx=(direction=="h"?(end.x>start.x?1:0):(end.cx>start.cx?maxRandom:minRandom));
                parammenu.enddx=(direction=="h"?(start.x>end.x?1:0):(end.cx<start.cx?maxRandom:minRandom));
                parammenu.startdy=(direction=="v"?(end.y>start.y?1:0):(end.cy>start.cy?maxRandom:minRandom));
                parammenu.enddy=(direction=="v"?(start.y>end.y?1:0):(end.cy<start.cy?maxRandom:minRandom));
                let md=0.5;//Math.random();
                if(direction=="h"){
                    var middle=((parammenu.startdx==0?start.x:start.x+start.w)+(parammenu.enddx==0?end.x:end.x+end.w))/2;
                    var delta =Math.abs((middle-(parammenu.startdx==0?start.x:start.x+start.w)))/2
                    middle=md * (middle+delta-(middle-delta))+middle-delta;
                    parammenu.points= $([
                        [(parammenu.startdx==0?start.x:start.x+start.w), start.y+parammenu.startdy*start.h],
                        [middle,start.y+parammenu.startdy*start.h],
                        [middle,end.y + parammenu.enddy*end.h],
                        [(parammenu.enddx==0?end.x:end.x+end.w), end.y + parammenu.enddy*end.h]
                    ]).toPointString();
                }
                else{
                    var middle=((parammenu.startdy==0?start.y:start.y+start.h)+(parammenu.enddy==0?end.y:end.y+end.h))/2;
                    var delta =Math.abs((middle-(parammenu.startdy==0?start.y:start.y+start.h)))/2
                    middle=md * (middle+delta-(middle-delta))+middle-delta;
                    parammenu.points= $([
                        [start.x+parammenu.startdx*start.w,(parammenu.startdy==0?start.y:start.y+start.h)],
                        [start.x+parammenu.startdx*start.w,middle],
                        [end.x+parammenu.enddx*end.w, middle],
                        [end.x+parammenu.enddx*end.w,(parammenu.enddy==0?end.y:end.y+end.h)]
                    ]).toPointString();
                }
                break;*/
        }
        storedirectlyset(params.id,params,false);
    }
    if(params.startel){
        $(container).attr({
            "data-start":params.startel,
            "data-start-function":params.startfn,
            "data-start-dx":(parammenu.startdx?parammenu.startdx:params.startdx),
            "data-start-dy":(parammenu.startdy?parammenu.startdy:params.startdy),
            "data-start-type":params.starttype,
        });
    }
    if(params.endel){
        $(container).attr({
            "data-end":params.endel,
            "data-end-function":params.endfn,
            "data-end-dx":(parammenu.enddx?parammenu.enddx:params.enddx),
            "data-end-dy":(parammenu.enddy?parammenu.enddy:params.enddy),
            "data-end-type":params.endtype,
        });
    }
    //console.log(params,parammenu);
    $(container).linepaint($.extend(parammenu,{datatype2:params.datatype2}));
    $(container).children("text.line-number").text(params.number);

    var endel=params.endel;
    var startel=params.startel;
    if(params.function=="supply"){
        endel=params.startel;
        startel=params.endel;
    }
    if(endel && params.endfn){
        var endelparam=$.storeget(endel);
        $.each(endelparam.functions,function(i,e){
            if(e.id==params.endfn){
                params.endfnname=e.name;
                params.endfnstate = e.state;
            }
        });
    }
    if(startel && params.startfn){
        var startelparam=$.storeget(startel);
        $.each(startelparam.functions,function(i,e){
            if(e.id==params.startfn){
                params.startfnname=e.name;
                params.startfnstate = e.state;
            }
        });
    }
    $(container).linetextset($.extend(params,{simple: params.datatype2=="simple"}));
    let place = $(container).parent();
    $(place).children("svg[data-type='linedata'][data-parent='" + params.id + "']").each(function(i,e){
        $(place).logic($(e).storeget());
    });
 
};
$.fn.linegetpoint = function(params){
    var container=this;
    var points="";
    if(!params) params=$(this).lineget();
    //console.log(params);
    if(params.datatype2=="curved"){
        var path = $(container).find("g[data-type='main'] path").attr("d");
        var d=path.replace("M","").replace("Q","").split(" ");
        if(d.length>5)
            points = "".concat(d[0]," ",d[1]," ",d[2]," ",d[3],",",d[4]," ",d[5]);
        else if(d.length>3)
            points = "".concat(d[0]," ",d[1],",",d[2]," ",d[3]);
    }
    else{
        $(container).find("g[data-type='main'] line").each(function(i1,e1){
            if(i1==0)
                points+= $(e1).attr("x1") + " " + $(e1).attr("y1");
            points+= "," + $(e1).attr("x2") + " " + $(e1).attr("y2");
        });
    }
    return points;
}
$.fn.linesave = function(needcheck){
    var container=this;
    var points="";
    var isChanged=false;
    //$(container).linetextsave();
    var params=$(this).lineget();
    //console.log(params);
    if(params.datatype2=="curved"){
        var path = $(container).find("g[data-type='main'] path").attr("d");
        var d=path.replace("M","").replace("Q","").split(" ");
        if(d.length>5)
            points = "".concat(d[0]," ",d[1]," ",d[2]," ",d[3],",",d[4]," ",d[5]);
        else if(d.length>3)
            points = "".concat(d[0]," ",d[1],",",d[2]," ",d[3]);
    }
    else{
        $(container).find("g[data-type='main'] line").each(function(i1,e1){
            if(i1==0)
                points+= $(e1).attr("x1") + " " + $(e1).attr("y1");
            points+= "," + $(e1).attr("x2") + " " + $(e1).attr("y2");
        });
    }
    if(!params.viewdata)
        params.viewdata = {};
    if(!params.viewdata[$.pagemenu()])
        params.viewdata[$.pagemenu()] = {};
    params.viewdata[$.pagemenu()] = $.extend(params.viewdata[$.pagemenu()],
        {
            points:points,
            enddx:$.isnull($(container).attr("data-end-dx"),""),
            enddy:$.isnull($(container).attr("data-end-dy"),""),
            startdx:$.isnull($(container).attr("data-start-dx"),""),
            startdy:$.isnull($(container).attr("data-start-dy"),"")
        }
    );
    //console.log(needcheck);
    if(needcheck){
        var supply = undefined;
        var consumer = undefined;
        var endfn=$(container).attr("data-end-function");
        var startfn=$(container).attr("data-start-function");
        params.endfnname="";
        params.endfnstate="";
        if(params.function=="supply"){
            supply=$(container).attr("data-start");
            consumer=$(container).attr("data-end");
        }
        else{
            supply=$(container).attr("data-end");
            consumer=$(container).attr("data-start");
        }
        if(supply && endfn){
            var el=$.storeget(supply);
            var isExist=false;
            $.each(el.functions,function(i,e){
                if(e.id==endfn){
                    params.endfnname=e.name;
                    params.endfnstate = e.state;
                }
                isExist |= (e.id==endfn)
            })
            if(!isExist){
                $(container).removeAttr("data-end-function");
                isChanged=true;
            }
        }
        if(consumer && startfn){
            var el=$.storeget(consumer);
            var isExist=false;
            $.each(el.functions,function(i,e){
                isExist |= (e.id==startfn)
            })
            if(!isExist){
                $(container).removeAttr("start-end-function");
                isChanged=true;
            }
        }
        var datasource = undefined;
        var datasourcer = undefined;
        if(params.viewdata && params.viewdata["interface"]){
            if(params.viewdata["interface"].direction=="f"){
                if($(container).attr("data-start"))
                    datasource=$.storeget($(container).attr("data-start"));
                if($(container).attr("data-end"))
                    datasourcer=$.storeget($(container).attr("data-end"));
            }
            else{
                if($(container).attr("data-start"))
                    datasourcer=$.storeget($(container).attr("data-start"));
                if($(container).attr("data-end"))
                    datasource=$.storeget($(container).attr("data-end"));
            }
        }
        if(datasource!=undefined){
            if(!datasource.data) datasource.data=[];
            $("g[data-type='line'][data-start='"+datasource.id+"'][data-direction='f']:not([id="+ params.id+"]), g[data-type='line'][data-end='"+datasource.id+"'][data-direction='r']:not([id="+ params.id+"])").each(function(i,e){
                var p = $.storeget($(e).prop("id"));
                $.each(p.datar,function(di,dt){
                    if(!$(datasource.data).objectArrayHasId(dt.id)) datasource.data.push(dt);
                });
            }); 
            $("g[data-type='line'][data-start='"+datasource.id+"'][data-direction='r']:not([id="+ params.id+"]), g[data-type='line'][data-end='"+datasource.id+"'][data-direction='f']:not([id="+ params.id+"])").each(function(i,e){
                var p = $.storeget($(e).prop("id"));
                $.each(p.data,function(di,dt){
                    if(!$(datasource.data).objectArrayHasId(dt.id)) datasource.data.push(dt);
                });
                if(p.endel==datasource.id && p.starttype=="linedata"){
                    var ld = $.storeget(p.startel);
                    if(ld && ld.data){
                        $.each(ld.data,function(di,dt){
                            if(!$(datasource.data).objectArrayHasId(dt.id)) datasource.data.push(dt);
                        });
                    }
                }
            });  
        }
        if(datasource && params.data){
            $.each(params.data,function(i,e){
                if(e){
                    var isExist=false;
                    $.each(datasource.data,function(i1,e1){
                        isExist |= (e.id==e1.id)
                    });
                    if(!isExist){
                        params.data.splice(i, 1);
                        isChanged=true;
                    }
                }
            });
        }
        if(datasourcer!=undefined){
            if(!datasourcer.data) datasourcer.data=[];
            $("g[data-type='line'][data-start='"+datasourcer.id+"'][data-direction='f']:not([id="+ params.id+"]), g[data-type='line'][data-end='"+datasourcer.id+"'][data-direction='r']:not([id="+ params.id+"])").each(function(i,e){
                var p = $.storeget($(e).prop("id"));
                $.each(p.datar,function(di,dt){
                    if(!$(datasourcer.data).objectArrayHasId(dt.id)) datasourcer.data.push(dt);
                });
            }); 
            $("g[data-type='line'][data-start='"+datasourcer.id+"'][data-direction='r']:not([id="+ params.id+"]), g[data-type='line'][data-end='"+datasourcer.id+"'][data-direction='f']:not([id="+ params.id+"])").each(function(i,e){
                var p = $.storeget($(e).prop("id"));
                $.each(p.data,function(di,dt){
                    if(!$(datasourcer.data).objectArrayHasId(dt.id)) datasourcer.data.push(dt);
                });
                if(p.endel==datasourcer.id && p.starttype=="linedata"){
                    var ld = $.storeget(p.startel);
                    if(ld && ld.data){
                        $.each(ld.data,function(di,dt){
                            if(!$(datasourcer.data).objectArrayHasId(dt.id)) datasourcer.data.push(dt);
                        });
                    }
                }
            });  
        }
        if(datasourcer && params.datar){
            $.each(params.datar,function(i,e){
                if(e){
                    var isExist=false;
                    $.each(datasourcer.data,function(i1,e1){
                        isExist |= (e.id==e1.id)
                    });
                    if(!isExist){
                        params.datar.splice(i, 1);
                        isChanged=true;
                    }
                }
            });
        }
    }
    params=$(container).lineinterface(params);
    var intplatform=params.intplatform;
    params=$(container).lineintplatform(params);
    isChanged|= (intplatform!=params.intplatform);
    var linenumber = $(container).children("text.line-number");
    params = $.extend(params,{
        number:(linenumber.length>0?$(linenumber).text():params.number),
        text:(linenumber.length>0?$(linenumber).text():params.number), // 2 kill
        endel:$.isnull($(container).attr("data-end"),""),
        endfn:$.isnull($(container).attr("data-end-function"),""),
        endtype:$.isnull($(container).attr("data-end-type"),""),
        startel:$.isnull($(container).attr("data-start"),""),
        startfn:$.isnull($(container).attr("data-start-function"),""),
        starttype:$.isnull($(container).attr("data-start-type"),"")
    });
    //console.log(params.viewdata[$.pagemenu()]);
    $(container).storeset(params, true);
    //console.log($.storeget(params.id));
    if(isChanged){
        $(container).linetextset(params);
    }
    $(container).linetextsave();
}
$.linegetconnection = function(params){
    var consumer = undefined;
    var supply = undefined;
    if(params.function=="consumer"){
        if (params.startel!=undefined)
            consumer = params.startel;
        if(params.endel != undefined)
            supply = params.endel;
    }
    else{
        if (params.startel!=undefined)
            supply = params.startel;
        if(params.endel != undefined)
            consumer = params.endel;
    }
    return{
        consumer : consumer,
        supply : supply
    }
}
$.linegetdirection = function(params){
    var start = params.startel;
    var end = params.endel;
    if(params.function=="supply" && params.direction=="f" || params.function=="consumer" && params.direction=="r"){
        start = params.endel;
        end = params.startel;
    }
    /*console.log({
        start : start,
        end : end
    });*/
    return{
        start : start,
        end : end
    }
}

/*$.linegetinterface = function(params){
    var initiator = undefined;
    var terminator = undefined;
    var consumer = undefined;
    var supply = undefined;
    var datasource = undefined;
    var datasourcer = undefined;

    var parammenu = $.getviewpageparam(params);
    if(parammenu.direction=="f"){
        if (params.startel!=undefined)
            initiator = $("svg[id='"+params.startel+"']").storeget();
        if(params.endel != undefined)
            terminator = $("svg[id='"+params.endel+"']").storeget();
    }
    else{
        if(params.endel != undefined)
            initiator = $("svg[id='"+params.endel+"']").storeget();
        if (params.startel!=undefined)
            terminator = $("svg[id='"+params.startel+"']").storeget();
    }
    var interfaceDirection=undefined;
    if(params.viewdata && params.viewdata["interface"]){
        interfaceDirection = params.viewdata["interface"].direction;
        datasource = $("svg[id='" + (interfaceDirection =="f"?params.startel:params.endel) + "']").storeget();
        datasourcer = $("svg[id='" + (interfaceDirection =="f"?params.endel:params.startel) + "']").storeget();
    }
    if(params.function=="consumer"){
        if (params.startel!=undefined)
            consumer = $("svg[id='"+params.startel+"']").storeget();
        if(params.endel != undefined)
            supply = $("svg[id='"+params.endel+"']").storeget();
    }
    else{
        if (params.startel!=undefined)
            supply = $("svg[id='"+params.startel+"']").storeget();
        if(params.endel != undefined)
            consumer = $("svg[id='"+params.endel+"']").storeget();
    }
    return{
        initiator : initiator,
        terminator : terminator,
        consumer : consumer,
        supply : supply,
        datasource : datasource,
        datasourcer : datasourcer
    }

}*/
$.fn.linesavebyelement = function(){
    var id=$(this).prop("id");
    $("g[data-type='line'][data-start='"+id+"']").each(function(i,e){
        $(e).linesave();
    });   
    $("g[data-type='line'][data-end='"+id+"']").each(function(i,e){
        $(e).linesave();
    });   
}
$.fn.linepaint = function(params){
    var container=this;
    var main=$(container).children("g[data-type='main']");
    $(main).empty();
    var x1;
    var y1;
    var x2;
    var y2;
    if(params.points){
        var prev;
        var points = params.points.split(',');
        switch (params.datatype2){
            case "direct":
            case "simple":
                var point1=points[0].trim().split(" ");
                x1=getFloat(point1[0]);
                y1=getFloat(point1[1]);
                var point2=points[points.length-1].trim().split(" ");
                x2=getFloat(point2[0]);
                y2=getFloat(point2[1]);
                $(main).svg("line",{
                    x1:x1,
                    y1:y1,
                    x2:x2,
                    y2:y2,
                    "data-type":"d"
                });
                break;
            case "curved":
                var point1=points[0].trim().split(" ");
                x1=getFloat(point1[0]);
                y1=getFloat(point1[1]);
                var point2=points[points.length-1].trim().split(" ");
                x2=getFloat(point2[0]);
                y2=getFloat(point2[1]);
                var cx=(point1.length>2?getFloat(point1[2]):x2);
                var cy=(point1.length>3?getFloat(point1[3]):y1);
                $(main).svg("path",{
                    d:"M".concat(x1," ",y1," Q",cx," ",cy," ",x2," ",y2),
                    "data-type":"c"
                });
                break;
            default: //rectangle
                $.each(points,function(i,e){
                    var point=e.trim().split(" ");
                    if(point.length>0){
                        x2=getFloat(point[0]);
                        y2=getFloat(point[1]);
                    }
                    if(x1!=undefined){
                        var direction = (Math.abs(x1 - x2) < Math.abs(y1 - y2) ? "v" : "h");
                        if(prev && $(prev).attr("data-type")==direction){
                            $(prev).attr({
                                x2:x2,
                                y2:y2
                            });
                        }
                        else
                        {
                            prev=$(main).svg("line",{
                                x1:x1,
                                y1:y1,
                                x2:x2,
                                y2:y2,
                                "data-type":direction
                            });
                        }
                    }
                    x1=x2;
                    y1=y2;
                });
                break;
        }
    }
 
}
$.lineOff = function(){
    $("g[data-type='slave']").find("line").each(function(i,e){
        $(e).off("mousemove");
        $(e).off("mouseleave");
    });
    $("g[data-type='slave']").find("path").each(function(i,e){
        $(e).off("mousemove");
        $(e).off("mouseleave");
    });
}
$.lineOn = function(){
    $("g[data-type='slave']").find("line").each(function(i,e){
        $(e).on("mousemove",function(event){ $(e).lineMouseMove(event, i);});
        $(e).on("mouseleave",function(event){ $(e).lineMouseLeave(i);});
    });
    $("g[data-type='slave']").find("path").each(function(i,e){
        $(e).on("mousemove",function(event){ $(e).lineMouseMove(event, i);});
        $(e).on("mouseleave",function(event){ $(e).lineMouseLeave(i);});
    });
}
$.lineConnect = function(){
    $("g[data-type='line']").each(function(i,e){
        $(e).substrate();
    });
}
$.lineDisconnect = function(){
    $("g[data-type='line']").each(function(i,e){
        $(e).substrate(false);
    });
}
$.fn.line=function(params, nosetposition){
    var place =  $("#" + params.container);
    if(place.length==0)
        place=this;
    var parammenu = $.getviewpageparam(params);

    var container = $("g#" + params.id + "[data-type='line']");
    if(container.length==0 && !isemptyobject(parammenu)){
        var container = $(place).svg("g",{
            id: params.id,
            "data-type":"line",
            "data-parent":params.parentel,
            "data-type2":(params.datatype2??"rectangle"),
            "data-type3":(params.datatype3??""),
            "data-type4":params.datatype4
        });
        $(container).svg("g",{
            "data-type":"main"
        });
        if(params.datatype4!="lineattr" && $.pagemenuname()!="function" && $.pagemenuname()!="database" && $.pagemenuname()!="development")
            $(container).svg("text",{
                class:"line-number",
                nowrap:true
            });
        $(container).lineset(params);
        //$(container).lineempty();
        if((params.datatype2??"rectangle")!="rectangle"){
            var line = $(container).find("g[data-type='main'] path:first-child");
            $(container).lineempty(line);
            let points = $(container).linegetpoint(params);
            params.viewdata[$.pagemenu()].points=points;
            storedirectlyset(params.id,params);
        }
        else{
            var line = $(container).find("g[data-type='main'] line:first-child");
            $(container).lineempty(line);
            line = $(container).find("g[data-type='main'] line:last-child");
            $(container).lineempty(line);
        }
        //if(canOperate()){
            $(container).substrate();
            //$(container).linesave();
        //}
    }
    else{
        // проверяем наличие данных для view
        if(isemptyobject(parammenu))
            $("#" + params.id).remove();
        else{
            $(container).substrate(false);
            $(container).lineset(params);
            $(container).lineempty();
            $(container).substrate();
            //$(container).linesave();
        }
    }
    if(nosetposition!=true){
        let next, nextparams;
        $(place).children("[data-type]").each(function(i,e){
            let p = $(e).storeget();
            if($.logicsort(params,p)<0 && (!nextparams || $.logicsort(p,nextparams)<0))
            {
                next=e;
                nextparams=p;
            }
        });
        if(next) {
            try{
                $(next).before($(container));
            }
            catch(e){
                console.error(e);
                console.trace("place:",place,"next:",next,"container:",container, "params:",params);
            }
        }
    }
    /*var list=[];
    $.each($.storekeys(),function(i,id){
        var p = $.storeget(id);
        if(p.container == params.id){
            //$("#" + id).remove();
            list.push(p);
        }
    });
    $.each(list.sort(function(a,b){
        var av=getInt($.getviewpageparam(a).order);
        var bv=getInt($.getviewpageparam(b).order);
        if(av<bv) return -1;
        if(av>bv) return 1;
        return 0;
    }),function(i,e){
        storeupdate(e);
    });*/
    return container;
}
$.fn.linecalculatebyelement = function(){
    var element=this;
    var id=$(element).prop("id");

    $("g[data-type='line'][data-start='"+id+"'], g[data-type='line'][data-end='"+id+"']").each(function(i,line){
        var hasSlave = ($(line).children("g[data-type='slave']").length>0);
        if(hasSlave) $(line).substrate(false);
        var oldRect = $(line).linegetbox();
        let params = $(line).lineget();
        let pm={
            startdx:getFloat($(line).attr("data-start-dx")),
            enddx:getFloat($(line).attr("data-end-dx")),
            startdy:getFloat($(line).attr("data-start-dy")),
            enddy:getFloat($(line).attr("data-end-dy"))
        };
        let parammenu = $.linecalculate(params,pm);
        $(line).linepaint($.extend(parammenu,{datatype2:params.datatype2}));
        $(line).attr({
            "data-start-dx":(parammenu.startdx),
            "data-start-dy":(parammenu.startdy),
            "data-end-dx":(parammenu.enddx),
            "data-end-dy":(parammenu.enddy)
        });
        $(line).lineNumberMove();

        var rect = $(line).linegetbox();
        var txt = $(line).children("text.line-text");
        $(txt).textMove(
            getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),
            getFloat($(txt).attr("y"))+(rect.y+rect.height/2)-(oldRect.y+oldRect.height/2)
        );
        if(hasSlave) $(line).substrate();
    });
}
$.fn.linemovebyelement=function(dx,dy,dw,dh){
    if(dx==0 && dy==0 && dw==0 && dh==0) return;
    var element=this;
    var id=$(element).prop("id");
    //if(id=="5c8c57a9-d56b-4f5a-8073-a01e60898205") debugger;
    $("g[data-type='line'][data-start='"+id+"']").each(function(i,e){
        var container = e;
//if($(container).prop("id")=="e64d5e3e-b5ac-4f6d-99fe-a56b6c14f970") debugger;
        var datatype2=$(e).attr("data-type2");
        var linetag=(datatype2=="curved"?"path":"line");
        var line = $(e).find("g[data-type='main'] "+linetag+":first-child");
        var linecount = $(e).find("g[data-type='main'] "+linetag).length;
        var d=[];
        if(datatype2=="curved")
            d = $(line).attr("d").replace("M","").replace("Q","").split(" ");
        var x=getFloat(datatype2=="curved"?d[0]:$(line).attr("x1"));
        var y=getFloat(datatype2=="curved"?d[1]:$(line).attr("y1"));
        var x2 = getFloat(datatype2=="curved"?d[4]:$(line).attr("x2"));
        var y2 = getFloat(datatype2=="curved"?d[5]:$(line).attr("y2"));
        var el_dx=0;
        var el_dy=0;
        if($(e).attr("data-start-dx")!=undefined)
            el_dx=getFloat($(e).attr("data-start-dx"));
        if($(e).attr("data-start-dy")!=undefined)
            el_dy=getFloat($(e).attr("data-start-dy"));

        var dx1=0;
        var dy1=0;
        if(isautoline || el_dx==1 || el_dx==0)
            dx1=dx*(1-el_dx)+dw*el_dx;
        if(isautoline || el_dy==1 || el_dy==0){
            dy1=dy*(1-el_dy)+dh*el_dy;
        }
        var hasSlave = ($(container).children("g[data-type='slave']").length>0);
        switch ($(line).attr("data-type")){
            case "h":
                if(linecount==1){
                    //ломаем линию first
                    var len = (x+x2)/2;//x + delta*Math.sign(x2-x);               
                    if(hasSlave) $(container).substrate(false);
                    $(line).after(
                        $.svg("line",{
                            x1:len,
                            y1:y,
                            x2:x2,
                            y2:y2,
                            "data-type":"h"
                        })
                    );
                    $(line).after(
                        $.svg("line",{
                            x1:len,
                            y1:y,
                            x2:len,
                            y2:y2,
                            "data-type":"v"
                        })
                    );
                    $(line).attr({
                        x2:len
                    });
                    if(hasSlave) $(container).substrate();
                }
                $(line).linemove({
                    x1:x+dx1,
                    y1:y+dy1,
                    x2:$(line).attr("x2"),
                    y2:y+dy1
                });
            break;
            case "v":
                if(linecount==1){
                    //ломаем линию first
                    if(hasSlave) $(container).substrate(false);
                    var len = (y+y2)/2;//y + delta*Math.sign(y2-y);
                    $(line).after(
                        $.svg("line",{
                            x1:x,
                            y1:len,
                            x2:x2,
                            y2:y2,
                            "data-type":"v"
                        })
                    );
                    $(line).after(
                        $.svg("line",{
                            x1:x,
                            y1:len,
                            x2:x2,
                            y2:len,
                            "data-type":"h"
                        })
                    );
                    $(line).attr({
                        y2:len
                    });
                    if(hasSlave) $(container).substrate();
                }
                $(line).linemove({
                    x1:x+dx1,
                    y1:y+dy1,
                    x2:x+dx1,
                    y2:$(line).attr("y2")
                });
            default: //"d"
                $(line).linemove({
                    x1:x+dx1,
                    y1:y+dy1
                });
            break;
        }
   
    });
    $("g[data-type='line'][data-end='"+id+"']").each(function(i,e){
        var container = e;
        var datatype2=$(e).attr("data-type2");
        var linetag=(datatype2=="curved"?"path":"line");
        var line = $(e).find("g[data-type='main'] "+linetag+":last-child");
        var linecount = $(e).find("g[data-type='main'] "+linetag).length;
        var d=[];
        if(datatype2=="curved")
            d = $(line).attr("d").replace("M","").replace("Q","").split(" ");
        var x1=getFloat(datatype2=="curved"?d[0]:$(line).attr("x1"));
        var y1=getFloat(datatype2=="curved"?d[1]:$(line).attr("y1"));
        var x = getFloat(datatype2=="curved"?d[4]:$(line).attr("x2"));
        var y = getFloat(datatype2=="curved"?d[5]:$(line).attr("y2"));

        var el_dx=0;
        var el_dy=0;
        if($(e).attr("data-end-dx")!=undefined)
            el_dx=getFloat($(e).attr("data-end-dx"));
        if($(e).attr("data-end-dy")!=undefined)
            el_dy=getFloat($(e).attr("data-end-dy"));

        var dx1=0;
        var dy1=0;
        if(isautoline || el_dx==1 || el_dx==0){
            dx1=dx*(1-el_dx) + dw*el_dx;
        }
        if(isautoline || el_dy==1 || el_dy==0){
            dy1=dy*(1-el_dy) + dh*el_dy;
        }
        var hasSlave = ($(container).children("g[data-type='slave']").length>0);
        switch ($(line).attr("data-type")){
            case "h":
                if(linecount==1){
                    //ломаем линию last
                    if(hasSlave) $(container).substrate(false);
                    var len = (x+x1)/2;// x- delta*Math.sign(x-x1);
                    $(line).before(
                        $.svg("line",{
                            x1:x1,
                            y1:y1,
                            x2:len,
                            y2:y,
                            "data-type":"h"
                        })
                    );
                    $(line).before(
                        $.svg("line",{
                            x1:len,
                            y1:y1,
                            x2:len,
                            y2:y,
                            "data-type":"v"
                        })
                    );
                    $(line).attr({
                        x1:len
                    });
                    if(hasSlave) $(container).substrate();
                }
                $(line).linemove({
                    x1:$(line).attr("x1"),
                    y1:y+dy1,
                    x2:x+dx1,
                    y2:y+dy1
                });
            break;
            case "v":
                if(linecount==1){
                    //ломаем линию last
                    if(hasSlave) $(container).substrate(false);
                    var len = (y+y1)/2;// y- delta*Math.sign(y-y1);
                    $(line).before(
                        $.svg("line",{
                            x1:x1,
                            y1:y1,
                            x2:x,
                            y2:len,
                            "data-type":"v"
                        })
                    );
                    $(line).before(
                        $.svg("line",{
                            x1:x1,
                            y1:len,
                            x2:x,
                            y2:len,
                            "data-type":"h"
                        })
                    );
                    $(line).attr({
                        y1:len
                    });
                    if(hasSlave) $(container).substrate();
                }
                $(line).linemove({
                    x1:x+dx1,
                    y1:$(line).attr("y1"),
                    x2:x+dx1,
                    y2:y+dy1
                });
            break;
            default: //"d"
                $(line).linemove({
                    x2:x+dx1,
                    y2:y+dy1
                });
            break;
        }
    });
    $(element).find("[data-container='"+id+"']").each(function(i,e){
        $(e).linemovebyelement(dx,dy,dx,dy);
    });
}
$.fn.linegetbox = function(){
    var xmin=Infinity;
    var ymin=Infinity;
    var xmax=-Infinity;
    var ymax=-Infinity;
    if($(this).attr("data-type2")=="curved"){
        $(this).find("g[data-type='main'] path").each(function(i,e){
            var d = $(e).attr("d").replace("M","").replace("Q","").split(" ");
            xmin=Math.min(xmin,getFloat(d[0]),getFloat(d[2]),getFloat(d[4]));
            ymin=Math.min(ymin,getFloat(d[1]),getFloat(d[3]),getFloat(d[5]));
            xmax=Math.max(xmax,getFloat(d[0]),getFloat(d[2]),getFloat(d[4]));
            ymax=Math.max(ymax,getFloat(d[1]),getFloat(d[3]),getFloat(d[5]));
        });
    }
    else{
        $(this).find("g[data-type='main'] line").each(function(i,e){
            var lx1=getFloat($(e).attr("x1"));
            var ly1=getFloat($(e).attr("y1"));
            var lx2=getFloat($(e).attr("x2"));
            var ly2=getFloat($(e).attr("y2"));
            xmin=Math.min(xmin,lx1,lx2);
            ymin=Math.min(ymin,ly1,ly2);
            xmax=Math.max(xmax,lx1,lx2);
            ymax=Math.max(ymax,ly1,ly2);
        });
    }
    return {
        x: xmin,
        y: ymin,
        width: xmax-xmin,
        height: ymax-ymin
    }
}
$.linegetbox = function(params){
    var xmin=Infinity;
    var ymin=Infinity;
    var xmax=-Infinity;
    var ymax=-Infinity;
    var parammenu = $.getviewpageparam(params);
    if(parammenu.points){
        $.each($.getPointArray(parammenu.points),function(i,e){
            xmin=Math.min(xmin,e[0]);
            ymin=Math.min(ymin,e[1]);
            xmax=Math.max(xmax,e[0]);
            ymax=Math.max(ymax,e[1]);
        })
    }
    return {
        x: xmin,
        y: ymin,
        width: xmax-xmin,
        height: ymax-ymin
    }
}
$.fn.linemove=function(args){
    var i= $(this).index();
    var container=$(this).closest("g[data-type='line']");
    var datatype2=$(container).attr("data-type2");
    var d=[];
    if(datatype2=="curved")
        d = $(this).attr("d").replace("M","").replace("Q","").split(" ");
    var x1=(args.x1?getFloat(args.x1):getFloat(datatype2=="curved"?d[0]:$(this).attr("x1")));
    var y1=(args.y1?getFloat(args.y1):getFloat(datatype2=="curved"?d[1]:$(this).attr("y1")));
    var x2=(args.x2?getFloat(args.x2):getFloat(datatype2=="curved"?d[4]:$(this).attr("x2")));
    var y2=(args.y2?getFloat(args.y2):getFloat(datatype2=="curved"?d[5]:$(this).attr("y2")));
    var oldRect = $(container).linegetbox();//$(container).children("g[data-type='main']")[0].getBBox();
    //console.log(oldRect,$(container).linegetbox());
    var lines = $(container).find("g[data-type='main'] " + (datatype2=="curved"?"path":"line"));
    var start=(args?args.start:undefined);
    var end=(args?args.end:undefined);

    // корректируем приклепление, если есть
    if(i==0 && !args.frozeconnector){
        // для начала
        if($(container).attr("data-start")){
            // есть прикрепление
            var element = $("#" +$(container).attr("data-start"));
            var clientX2 = 0;
            var clientY2 = 0;
            var param2 = $(element).storeget();
            var lineparam = $(container).storeget();
            if(param2.container && param2.container!=lineparam.container){
                var pm=$("#"+param2.container).logicGetGlobalOffset();
                clientX2 = pm.x;
                clientY2 = pm.y;
            }
            start={
                x:getFloat($(element).attr("x")) + clientX2,
                w:getFloat($(element).attr("width")),
                y:getFloat($(element).attr("y")) + clientY2,
                h:getFloat($(element).attr("height"))
            }
            var oheDx=getFloat($(container).attr("data-start-dx"));
            var oheDy=getFloat($(container).attr("data-start-dy"));
            var line = lines[i];
            var dx = (args.frozeconnector?oheDx:(x1-start.x)/start.w);
            var dy = (args.frozeconnector?oheDy:(y1-start.y)/start.h);
            // проверяем, вышли ли за бордер
            switch ($(line).attr("data-type")){
                case "h":
                    if(y1<start.y || y1>start.y+start.h){dy=oheDy;y1=y2=start.y+start.h*dy;}
                break;
                case "v":
                    if(x1<start.x || x1>start.x+start.w){dx=oheDx;x1=x2=start.x+start.w*dx;}
                break;
            }
            dx = (dx<0?0:(dx>1?1:dx));
            dy = (dy<0?0:(dy>1?1:dy));
            $(container).attr({
                "data-start-dx":dx,
                "data-start-dy":dy
            });
        }

    }
    if(i==lines.length-1 && !args.frozeconnector){
        // для окончания
        if($(container).attr("data-end")){
            // есть прикрепление
            var element = $("#" +$(container).attr("data-end"));

            var clientX2 = 0;
            var clientY2 = 0;
            var param2 = $(element).storeget();
            var lineparam = $(container).storeget();
            if(param2.container && param2.container!=lineparam.container){
                var pm=$("#"+param2.container).logicGetGlobalOffset();
                clientX2 = pm.x;
                clientY2 = pm.y;
            }

            end={
                x:getFloat($(element).attr("x")) + clientX2,
                w:getFloat($(element).attr("width")),
                y:getFloat($(element).attr("y")) + clientY2,
                h:getFloat($(element).attr("height"))
            }
            var oheDx=getFloat($(container).attr("data-end-dx"));
            var oheDy=getFloat($(container).attr("data-end-dy"));
            var line = lines[i];
            var dx = (args.frozeconnector?oheDx:(x2-end.x)/end.w);
            var dy = (args.frozeconnector?oheDy:(y2-end.y)/end.h);
            // проверяем, вышли ли за бордер
            switch ($(line).attr("data-type")){
                case "h":
                    if(y2<end.y || y2>end.y+end.h){dy=oheDy;y1=y2=end.y+end.h*dy;}
                break;
                case "v":
                    if(x2<end.x || x2>end.x+end.w){dx=oheDx;x1=x2=end.x+end.w*dx;}
                break;
            }
            dx = (dx<0?0:(dx>1?1:dx));
            dy = (dy<0?0:(dy>1?1:dy));
            $(container).attr({
                "data-end-dx":dx,
                "data-end-dy":dy
            });
        }

    }
    if(lines.length==1 && datatype2!="rectangle" && datatype2!="curved"){
        if(start){
            x1=start.x+start.w/2;
            y1=start.y+start.h/2
        }
        if(end){
            x2=end.x+end.w/2;
            y2=end.y+end.h/2
        }
        if(start){
            if(y2==y1) x1=x2; else x1+=(x2-x1)*(start.h/2)/(y2-y1)*Math.sign(y2-y1);
            if(x1>start.x+start.w) x1=start.x+start.w;
            if(x1<start.x) x1=start.x;

            if(x2==x1) y1=y2; else y1+=(y2-y1)*(start.w/2)/(x2-x1)*Math.sign(x2-x1);
            if(y1>start.y+start.h) y1=start.y+start.h;
            if(y1<start.y) y1=start.y;
        }
        if(end){
            if(y2==y1)x2=x1; else x2+=(x2-x1)*(end.h/2)/(y2-y1)*Math.sign(y1-y2);
            if(x2>end.x+end.w) x2=end.x+end.w;
            if(x2<end.x) x2=end.x;

            if(x2==x1) y2=y1; else y2+=(y2-y1)*(end.w/2)/(x2-x1)*Math.sign(x1-x2);
            if(y2>end.y+end.h) y2=end.y+end.h;
            if(y2<end.y) y2=end.y;
        }
    }
    $(lines).each(function(i1,e1){
        if(i1==i-1){
            if(datatype2=="curved"){
                var d = $(e1).attr("d").replace("M","").replace("Q","").split(" ");
                $(e1).attr({
                    d:"M".concat(d[0]," ",d[1]," Q",x1," ",d[1]," ",x1," ",y1)
                });
            }
            else{
                $(e1).attr({
                    x2:x1,
                    y2:y1
                });
            }
        }
        if(i1==i){
            if(datatype2=="curved"){
                var d = $(e1).attr("d").replace("M","").replace("Q","").split(" ");
                $(e1).attr({
                    d:"M".concat(x1," ",y1," Q",d[2]," ",d[3]," ",x2," ",y2)
                });
            }
            else{
                $(e1).attr({
                    x1:x1,
                    y1:y1,
                    x2:x2,
                    y2:y2
                });
            }
        }
        if(i1==i+1){
            if(datatype2=="curved"){
                var d = $(e1).attr("d").replace("M","").replace("Q","").split(" ");
                $(e1).attr({
                    d:"M".concat(x2," ",y2," Q",d[2]," ",y2," ",d[4]," ",d[5])
                });
            }
            else{
                $(e1).attr({
                    x1:x2,
                    y1:y2
                });
            }
        }
    });
    var rect = $(container).linegetbox();//$(container).children("g[data-type='main']")[0].getBBox();
    var txt = $(container).children("text.line-text");
    //console.log((rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2));
    $(txt).textMove(
        getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),
        getFloat($(txt).attr("y"))+(rect.y+rect.height/2)-(oldRect.y+oldRect.height/2)
    );
    if($(container).attr("data-type4")!="lineattr")
        $(container).lineNumberMove();
}
$.fn.lineNumberMove=function(){
    var container=this;
    var datatype2=$(container).attr("data-type2");
    var linetag=(datatype2=="curved"?"path":"line");
    var func=$(container).attr("data-function");
    var lineText=$(container).children("text.line-number");
    var direction=$(container).attr("data-direction");
    var type;
    var line;
    switch(func){
        case "consumer":
            if($(container).attr("data-end")!=undefined){
                $(lineText).show();
                line=$(container).find("g[data-type='main'] "+linetag+":last-child");
                type = $(line).attr("data-type");
                var d=[];
                if(datatype2=="curved")
                    d = $(line).attr("d").replace("M","").replace("Q","").split(" ");
                if(type=="h")
                    $(container).children("text.line-number").attr({
                        x:getFloat(datatype2=="curved"?d[4]:$(line).attr("x2"))-(direction=="f"?-0.5:-0.5),
                        y:getFloat(datatype2=="curved"?d[5]:$(line).attr("y2"))+5.5
                    });
                else
                    $(container).children("text.line-number").attr({
                        x:getFloat(datatype2=="curved"?d[4]:$(line).attr("x2")),
                        y:getFloat(datatype2=="curved"?d[5]:$(line).attr("y2"))+(direction=="f"?4.5:4)
                    });
            }
            else
                $(lineText).hide();
            break;
        case "supply":
            if($(container).attr("data-start")!=undefined){
                $(lineText).show();
                line=$(container).find("g[data-type='main'] "+linetag+":first-child");
                type = $(line).attr("data-type");
                var d=[];
                if(datatype2=="curved")
                    d = $(line).attr("d").replace("M","").replace("Q","").split(" ");
                if(type=="h")
                    $(container).children("text.line-number").attr({
                        x:getFloat(datatype2=="curved"?d[0]:$(line).attr("x1"))+(direction=="f"?0.2:0),
                        y:getFloat(datatype2=="curved"?d[1]:$(line).attr("y1"))+4.5
                    });
                else
                    $(container).children("text.line-number").attr({
                        x:getFloat(datatype2=="curved"?d[0]:$(line).attr("x1")),
                        y:getFloat(datatype2=="curved"?d[1]:$(line).attr("y1"))+(direction=="f"?5.5:4.5)
                    });
            }
            else
                $(lineText).hide();
            break;
    }
}
$.fn.lineMouseMove = function(event, i){
    var delta = 0.25;
    var datatype2=$(this).attr("data-type")
    var d=[];
    var linetag="line";
    if(datatype2=="c"){
        d = $(this).attr("d").replace("M","").replace("Q","").split(" ");
        linetag="path";
    }
    var x1=getFloat(datatype2=="c"?d[0]:$(this).attr("x1"));
    var x2=getFloat(datatype2=="c"?d[4]:$(this).attr("x2"));
    var y1=getFloat(datatype2=="c"?d[1]:$(this).attr("y1"));
    var y2=getFloat(datatype2=="c"?d[5]:$(this).attr("y2"));
    var offset=$(this).offset();
    var pos=0;
    var direction = (x2>x1||y2>y1?"f":"r");
    if(datatype2=="c")
        lineFn="move";
    else if(x1==x2){
        lineFn="ew-resize";
        pos = Math.abs((event.clientY-offset.top)/svgMultuplY/(y2-y1));
    }
    else{
        lineFn="ns-resize";
        pos = Math.abs((event.clientX-offset.left)/svgMultuplX/(x2-x1));
    }
    $(this).attr({
        cursor:lineFn
    });
    if(pos<=delta){
        lineFn+=direction=="f"?"#start":"#end";
        $(this).closest("g[data-type='line']").find("g[data-type='main'] "+linetag+":nth-child(" + (i).toString() + ")").removeClass("hover");
    }
    else if(pos>delta && pos<1-delta){
        $(this).closest("g[data-type='line']").find("g[data-type='main'] "+linetag+":nth-child(" + (i).toString() + ")").attr("class","hover");
    }
    else{
        lineFn+=direction=="f"?"#end":"#start";
        $(this).closest("g[data-type='line']").find("g[data-type='main'] "+linetag+":nth-child(" + (i).toString() + ")").removeClass("hover");
    }
}
$.fn.lineMouseLeave = function(i){
    lineFn="default";
    $(this).attr({
        cursor:lineFn
    });
    var litetag=($(this).attr("data-type")=="c"?"path":"line");
    $(this).closest("g[data-type='line']").find("g[data-type='main'] "+litetag+":nth-child(" + (i).toString() + ")").removeClass("hover");
}
$.fn.substrate = function(enable){
    var container=this;
    var place=$("svg[data-type='document']")[0];//$(container).parent();
    $(container).children("g[data-type='slave']").remove();
    var datatype2=$(container).attr("data-type2");
    var linetag=(datatype2=="curved"?"path":"line");
    if((enable==undefined || enable) && $(container).attr("data-type4")!="lineattr"){
        //create
        var slave=$(container).children("g[data-type='main']").clone(); $.svg("g",{"data-type":"slave"});
        $(slave).attr({
            "data-type":"slave"
        });
        if(datatype2=="curved"){
            var path=$(slave).find("path").attr("d");
            var d=path.replace("M","").replace("Q","").split(" ");
            $(slave).append($.svg("circle",{
                cx:d[0],
                cy:d[1],
                r:7
            }));
            $(slave).append($.svg("circle",{
                cx:d[4],
                cy:d[5],
                r:7
            }));
        }
        else{
            var first = $(slave).find(":first-child");
            var last = $(slave).find(":last-child");
            //$(first).before($.svg("circle",{
            $(slave).append($.svg("circle",{
                cx:$(first).attr("x1"),
                cy:$(first).attr("y1"),
                r:7
            }));
            $(slave).append($.svg("circle",{
                cx:$(last).attr("x2"),
                cy:$(last).attr("y2"),
                r:7
            }));
        }
        var linetext=$(container).find("text.line-text");
        if(linetext.length>0){
            $(linetext).before(slave);
        }
        else{
            var linenumber=$(container).find("text.line-number");
            if(linenumber.length>0){
                $(linenumber).after(slave);
            }
            else
            $(container).children("g[data-type='main']").after(slave);
        }
   
        $(slave).find("circle").each(function(i,e){
            $(e).on("mousedown", function(){
                event.stopPropagation();
                if(event.button!=0){
                    // зажата правая клавиша
                    $(place).trigger("mouseup");
                    return;
                }
                if(!canOperate()){
                    $(container).select(event);
                    return;
                }
                $.lineOff();
                $.linetextOff();
                var clientX = getFloat($(e).attr("cx"));
                var clientY = getFloat($(e).attr("cy"));
                var clientStartX = event.clientX/svgMultuplX - clientX;
                var clientStartY = event.clientY/svgMultuplY - clientY;
                var x=clientX;
                var y=clientY;
                lineFn="crosshair";
                $(place).css({"cursor":lineFn});
                $(container).substrate(false);
                var isMoved=false;
 
                var line = $(container).find("g[data-type='main'] "+linetag);
                if(line.length==1 && $(line).attr("data-type")!="d" && $(line).attr("data-type")!="c"){
                    var x=getFloat($(line).attr("x1"));
                    var y=getFloat($(line).attr("y1"));
                    var x2 = getFloat($(line).attr("x2"));
                    var y2 = getFloat($(line).attr("y2"));
                    switch ($(line).attr("data-type")){
                        case "h":
                            //ломаем линию first
                            var len = (x2+x)/2;               
                            $(line).after(
                                $.svg("line",{
                                    x1:len,
                                    y1:y,
                                    x2:x2,
                                    y2:y2,
                                    "data-type":"h"
                                })
                            );
                            $(line).after(
                                $.svg("line",{
                                    x1:len,
                                    y1:y,
                                    x2:len,
                                    y2:y2,
                                    "data-type":"v"
                                })
                            );
                            $(line).attr({
                                x2:len
                            });
                        break;
                        case "v":
                            //ломаем линию first
                            var len = (y+y2)/2;
                           $(line).after(
                                $.svg("line",{
                                    x1:x,
                                    y1:len,
                                    x2:x2,
                                    y2:y2,
                                    "data-type":"v"
                                })
                            );
                            $(line).after(
                                $.svg("line",{
                                    x1:x,
                                   y1:len,
                                    x2:x2,
                                    y2:len,
                                    "data-type":"h"
                                })
                            );
                            $(line).attr({
                                y2:len
                            });
                        break;
                    }
                }
                line = (i==0? $(container).find("g[data-type='main'] "+linetag+":first-child"):$(container).find("g[data-type='main'] "+linetag+":last-child"));
                $(place).on("mousemove",function(event){
                    if(event.buttons==0){
                        // клавиша не зажата
                        $(place).trigger("mouseup");
                        return;
                    }
                    //connected
                    x=event.clientX/svgMultuplX - clientStartX;
                    y=event.clientY/svgMultuplY - clientStartY;
                    if(onhoverElement!=undefined){
                        if(!$(onhoverElement).hasClass("hovered"))
                            $(onhoverElement).addClass("hovered");

                        // check mouse out
                        var vb=$(place).svgviewbox();
                        var _x=(event.clientX - svgOffsetX)/svgMultuplX + getFloat(vb[0]);
                        var _y=(event.clientY - svgOffsetY)/svgMultuplY + getFloat(vb[1]);
 
                        var clientX2 = 0;
                        var clientY2 = 0;
                        var param2 = $(onhoverElement).storeget();
                        if(param2.container){
                            var pm=$("#"+param2.container).logicGetGlobalOffset();
                            clientX2 = pm.x;
                            clientY2 = pm.y;
                        }
                        var oheX=getFloat($(onhoverElement).attr("x")) + clientX2;
                        var oheY=getFloat($(onhoverElement).attr("y")) + clientY2;
                        var oheW=getFloat($(onhoverElement).attr("width"));
                        var oheH=getFloat($(onhoverElement).attr("height"));
 
                        var deltaY=30;///svgMultuplY;
                        var deltaX=30;///svgMultuplX;

                        if((_x>=oheX && _x<=oheX+deltaX || _x>=oheX+oheW-deltaX && _x<=oheX+oheW) && _y>=oheY && _y<=oheY+oheH
                            || (_y>=oheY && _y<=oheY+deltaY || _y>=oheY+oheH-deltaY && _y<=oheY+oheH) && _x>=oheX && _x<=oheX+oheW){

                            var dx = (_x-oheX)/oheW;
                            var dy = (_y-oheY)/oheH;
                            
                            //притяжение
                            if(_x<oheX+deltaX ){ x=oheX; dx=0;}
                            if(_y<oheY+deltaY ) {y=oheY; dy=0;}
                            if(_x>oheX+oheW-deltaX ) {x=oheX+oheW; dx=1;}
                            if(_y>oheY+oheH-deltaY ) {y=oheY+oheH; dy=1;}

                            var onhoverid = $(onhoverElement).prop("id");
                            var linetype=$(line).attr("data-type");
                            // проверка и формирование правильной линии присоединения
                            // избегаем дребезжание на углах
                            var needTempLine = (linetype=="h" && (dy==0 || dy==1) && dx>0 && dx<1 || linetype=="v" && (dx==0 || dx==1) && dy>0 && dy<1);
                            if(i==0){
                                $(container).attr({
                                    "data-start":onhoverid,
                                    "data-start-dx":dx,
                                    "data-start-dy":dy,
                                    "data-start-type": $(onhoverElement).attr("data-type")
                                });
                                if(needTempLine){
                                    // добавляем линию другого типа, отодвигаем линию
                                    if(linetype=="h"){
                                        $(line).attr({
                                            y1:(dy==0?oheY-deltaY:oheY+oheH+deltaY),
                                            y2:(dy==0?oheY-deltaY:oheY+oheH+deltaY)
                                        });
                                    }
                                    else{
                                        $(line).attr({
                                            x1:(dx==0?oheX-deltaX:oheX+oheW+deltaX),
                                            x2:(dx==0?oheX-deltaX:oheX+oheW+deltaX)
                                        });
                                    }
                                    var next = $(line).next();
                                    if(next){
                                        $(next).attr({
                                            x1:getFloat($(line).attr("x2")),
                                            y1:getFloat($(line).attr("y2"))
                                        });
                                    }
                                    var ln = $.svg("line",{
                                        x1:x,
                                        y1:y,
                                        x2:getFloat($(line).attr("x1")),
                                        y2:getFloat($(line).attr("y1")),
                                        "data-type":(linetype=="h"?"v":"h"),
                                        "data-temp":true
                                    });
                                    $(line).before(ln);
                                    line = ln;
                                }
                            }
                            else{
                                $(container).attr({
                                    "data-end":onhoverid,
                                    "data-end-dx":dx,
                                    "data-end-dy":dy,
                                    "data-end-type": $(onhoverElement).attr("data-type")
                                });
                                if(needTempLine){
                                // добавляем линию другого типа, отодвигаем линию
                                    if(linetype=="h"){
                                        $(line).attr({
                                            y1:(dy==0?oheY-deltaY:oheY+oheH+deltaY),
                                            y2:(dy==0?oheY-deltaY:oheY+oheH+deltaY)
                                        });
                                    }
                                    else{
                                        $(line).attr({
                                            x1:(dx==0?oheX-deltaX:oheX+oheW+deltaX),
                                            x2:(dx==0?oheX-deltaX:oheX+oheW+deltaX)
                                        });
                                    }
                                    var prev = $(line).prev();
                                    if(prev){
                                        $(prev).attr({
                                            x2:getFloat($(line).attr("x1")),
                                            y2:getFloat($(line).attr("y1"))
                                        });
                                    }
                                    var ln = $.svg("line",{
                                        x1:getFloat($(line).attr("x2")),
                                        y1:getFloat($(line).attr("y2")),
                                        x2:x,
                                        y2:y,
                                        "data-type":(linetype=="h"?"v":"h"),
                                        "data-temp":true
                                    });
                                    $(line).after(ln);
                                    line = ln;
                                }
                            }
                            //$.propertyset();
                        }
                        else{
                            $(onhoverElement).removeClass("hovered");
                            onhoverElement=undefined;
                        }
                    }
                    if(onhoverElement==undefined)
                    {
                        if(i==0){
                            $(container).removeAttr("data-start");
                            //$(container).removeAttr("data-start-function");
                            $(container).removeAttr("data-start-dx");
                            $(container).removeAttr("data-start-dy");
                            $(container).removeAttr("data-start-type");
                            if($(line).attr("data-temp")){
                                // убираем линию присоединения
                                var ln = $(line).next();
                                $(line).remove();
                                line = ln;
                            }
                        }
                        else{
                            $(container).removeAttr("data-end");
                            //$(container).removeAttr("data-end-function");
                            $(container).removeAttr("data-end-dx");
                            $(container).removeAttr("data-end-dy");
                            $(container).removeAttr("data-end-type");
                            if($(line).attr("data-temp")){
                                // убираем линию присоединения
                                var ln = $(line).prev();
                                $(line).remove();
                                line = ln;
                            }
                        }

                        //$.propertyset();
                    }
                    switch ($(line).attr("data-type")){
                        case "h":
                            if(i==0)
                                $(line).linemove({
                                    x1:x,
                                    y1:y,
                                    x2:$(line).attr("x2"),
                                    y2:y
                                });
                            else
                                $(line).linemove({
                                    x1:$(line).attr("x1"),
                                    y1:y,
                                    x2:x,
                                    y2:y
                                });
                        break;
                        case "v":
                            if(i==0)
                                $(line).linemove({
                                    x1:x,
                                    y1:y,
                                    x2:x,
                                    y2:$(line).attr("y2")
                                });
                            else
                                $(line).linemove({
                                    x1:x,
                                    y1:$(line).attr("y1"),
                                    x2:x,
                                    y2:y
                                });
                        break;
                        default: //"d"
                            if(i==0)
                                $(line).linemove({
                                    x1:x,
                                    y1:y
                                });
                            else
                                $(line).linemove({
                                    x2:x,
                                    y2:y
                                });
                        break;
                    }
                    isMoved=true;
                });
                $(place).on("mouseup",function(event){
                    event.stopPropagation();
                    if(onhoverElement && $(onhoverElement).hasClass("hovered"))
                        $(onhoverElement).removeClass("hovered");
                    $(place).off("mousemove");
                    $(place).off("mouseup");
                    $.lineOn();
                    $.linetextOn();
                    lineFn="default";
                    $(place).css({"cursor":lineFn});
                    $(container).lineempty(line);
                    // убираем временные метки
                    $(line).removeAttr("data-temp");
                    if(isMoved)
                        $(container).linesave(onhoverElement!=undefined);
                    $.propertyset();
                    $(container).substrate();
                    if(!isMoved)
                        $(container).select(event);
                    else
                        $.historycloseputtransaction();
                });
            });
        });
        $(slave).find(linetag).each(function(i,e){
            $(e).on("mousemove",function(event){
                $(this).lineMouseMove(event, i);
            });
            $(e).on("mouseleave",function(){
                $(this).lineMouseLeave(i);
            });
            $(e).on("mousedown", function(event){
                event.stopPropagation();
                if(event.button!=0){
                    // зажата правая клавиша
                    $(place).trigger("mouseup");
                    return;
                }
                if(!canOperate()){
                    $(container).select(event);
                    if(event.detail>1)
                        $.propertyshow();
                    return;
                }
                $.lineOff();
                $.linetextOff();
                var line = $(container).find("g[data-type='main'] " + linetag).eq(i);
 
                var d=[];
                if(datatype2=="curved")
                    d = $(line).attr("d").replace("M","").replace("Q","").split(" ");
                var clientX = getFloat(datatype2=="curved"?d[2]:$(line).attr("x1"));
                var clientY = getFloat(datatype2=="curved"?d[3]:$(line).attr("y1"));
                var clientStartX = event.clientX/svgMultuplX - clientX;
                var clientStartY = event.clientY/svgMultuplY - clientY;
                var x=clientX;
                var y=clientY;
                var delta = 0.33;
 
                var ind = lineFn.indexOf("#");
                $(place).css({"cursor":(ind>0?lineFn.substr(0,ind):lineFn)});
 
                $(container).substrate(false);
 
                //ломаем линию, если нужно
                switch ($(line).attr("data-type")){
                    case "h":
                        if(lineFn.indexOf("#start")>-1){
                            var len = clientX + (getFloat($(line).attr("x2")) - clientX)*(delta);
                            $(line).after(
                                $.svg("line",{
                                    x1:len,
                                    y1:clientY,
                                    x2:getFloat($(line).attr("x2")),
                                    y2:clientY,
                                    "data-type":"h"
                                })
                            );
                            $(line).after(
                                $.svg("line",{
                                    x1:len,
                                    y1:clientY,
                                    x2:len,
                                    y2:clientY,
                                    "data-type":"v"
                                })
                            );
                            $(line).attr({
                                x2:len
                            });
                        }
                        if(lineFn.indexOf("#end")>-1){
                            var len = clientX + (getFloat($(line).attr("x2")) - clientX)*(1-delta);
                            $(line).before(
                                $.svg("line",{
                                    x1:clientX,
                                    y1:clientY,
                                    x2:len,
                                    y2:clientY,
                                    "data-type":"h"
                                })
                            );
                            $(line).before(
                                $.svg("line",{
                                    x1:len,
                                    y1:clientY,
                                    x2:len,
                                    y2:clientY,
                                    "data-type":"v"
                                })
                            );
                            $(line).attr({
                                x1:len
                            });
                        }
                        break;
                    case "v":
                        if(lineFn.indexOf("#start")>-1){
                            var len = clientY + (getFloat($(line).attr("y2")) - clientY)*(delta);
                            $(line).after(
                                $.svg("line",{
                                    x1:clientX,
                                    y1:len,
                                    x2:clientX,
                                    y2:getFloat($(line).attr("y2")),
                                    "data-type":"v"
                                })
                            );
                            $(line).after(
                                $.svg("line",{
                                    x1:clientX,
                                    y1:len,
                                    x2:clientX,
                                    y2:len,
                                    "data-type":"h"
                                })
                            );
                            $(line).attr({
                                y2:len
                            });
                        }
                        if(lineFn.indexOf("#end")>-1){
                            var len = clientY + (getFloat($(line).attr("y2")) - clientY)*(1-delta);
                            $(line).before(
                                $.svg("line",{
                                    x1:clientX,
                                    y1:clientY,
                                    x2:clientX,
                                    y2:len,
                                    "data-type":"v"
                                })
                            );
                            $(line).before(
                                $.svg("line",{
                                    x1:clientX,
                                    y1:len,
                                    x2:clientX,
                                    y2:len,
                                    "data-type":"h"
                                })
                            );
                            $(line).attr({
                                y1:len
                            });
                        }
                    break;
                }
 
                var isMoved=false;
                $(place).on("mousemove",function(event){
                    if(event.buttons==0){
                        // зажата правая клавиша
                        $(place).trigger("mouseup");
                        return;
                   }
                    y=event.clientY/svgMultuplY - clientStartY;
                    x=event.clientX/svgMultuplX - clientStartX;
                    switch ($(line).attr("data-type")){
                        case "h":
                            $(line).linemove({
                                y1:y,
                                y2:y
                            });
                        break;
                        case "v":
                           $(line).linemove({
                               x1:x,
                               x2:x
                            });
                        break;
                        case "c":
                            $(line).attr({
                                d:"M".concat(d[0]," ",d[1]," Q",x," ",y," ",d[4]," ",d[5])
                            });
                        break;
                    }
                    isMoved=true;
                });
                $(place).on("mouseup",function(event){
                    event.stopPropagation();
                    $(place).off("mousemove");
                    $(place).off("mouseup");
                    $.lineOn();
                    $.linetextOn();
                    lineFn="default";
                    $(place).css({"cursor":"default"});
                    if(isMoved){
                        $(container).lineempty(line);
                        $(container).linesave();
                    }
                    $(container).substrate();
                    if(!isMoved){
                        $(container).select(event);
                        if(event.detail>1)
                            $.propertyshow();
                    }
                    else
                        $.historycloseputtransaction();
                });
            });
        });
    }
}
$.fn.lineempty = function(line){
    var container = this;
    var datatype2=$(container).attr("data-type2");
    var linetag=(datatype2=="curved"?"path":"line");
    var deltaX=10;///svgMultuplX;
    var deltaY=10;///svgMultuplY;

    var lineindex = $(line).index();
    var lines = $(container).find("g[data-type='main'] " + linetag);

    var x1,x2,y1,y2,start,end;
    // корректируем приклепление, если есть
    if(lineindex==-1 || lineindex==0){
        // для начала
        if($(container).attr("data-start")){
            // есть прикрепление
            var element = $("#" +$(container).attr("data-start"));
            var clientX2 = 0;
            var clientY2 = 0;
            var param2 = $(element).storeget();
            var lineparam = $(container).storeget();
            //if(lineparam.id=="980044a4-268b-41a5-a126-ad3543e80787") debugger;
            if(param2.container && param2.container!=lineparam.container){
                var pm=$("#"+param2.container).logicGetGlobalOffset();
                clientX2 = pm.x;
                clientY2 = pm.y;
            }
            start={
                x:getFloat($(element).attr("x")) + clientX2,
                w:getFloat($(element).attr("width")),
                y:getFloat($(element).attr("y")) + clientY2,
                h:getFloat($(element).attr("height"))
            }
            var oheDx=getFloat($(container).attr("data-start-dx"));
            var oheDy=getFloat($(container).attr("data-start-dy"));
            line = $(container).find("g[data-type='main'] "+linetag+":first-child");
            var d=[];
            if(datatype2=="curved")
                d = $(line).attr("d").replace("M","").replace("Q","").split(" ");

            x1=getFloat(datatype2=="curved"?d[0]:$(line).attr("x1"));
            y1=getFloat(datatype2=="curved"?d[1]:$(line).attr("y1"));
            x2=getFloat(datatype2=="curved"?d[4]:$(line).attr("x2"));
            y2=getFloat(datatype2=="curved"?d[5]:$(line).attr("y2"));
            var dx = oheDx;
            var dy = oheDy;
            // проверяем, вышли ли за бордер
            switch ($(line).attr("data-type")){
                case "h":
                    x1=start.x+start.w*dx;
                    y1=y2=start.y+start.h*dy;
                    break;
                case "v":
                    x1=x2=start.x+start.w*dx;
                    y1=start.y+start.h*dy;
                    break;
                default:
                    x1=start.x+start.w*dx;
                    y1=start.y+start.h*dy;
                    break;
            }
            if(x1 && x2 && y1 && y2){
                $(line).linemove({
                    x1:x1,
                    y1:y1,
                    x2:x2,
                    y2:y2,
                    frozeconnector:true,
                    start:start,
                    end:end
                });
            }
        }
    }
    if(lineindex==-1 || lineindex==lines.length-1){
        // для окончания
        if($(container).attr("data-end")){
            // есть прикрепление
            var element = $("#" +$(container).attr("data-end"));
            var clientX2 = 0;
            var clientY2 = 0;
            var param2 = $(element).storeget();
            var lineparam = $(container).storeget();
            if(param2.container && param2.container!=lineparam.container){
                var pm=$("#"+param2.container).logicGetGlobalOffset();
                clientX2 = pm.x;
                clientY2 = pm.y;
            }
            end={
                x:getFloat($(element).attr("x")) + clientX2,
                w:getFloat($(element).attr("width")),
                y:getFloat($(element).attr("y")) + clientY2,
                h:getFloat($(element).attr("height"))
            }
            var oheDx=getFloat($(container).attr("data-end-dx"));
            var oheDy=getFloat($(container).attr("data-end-dy"));
            line = $(container).find("g[data-type='main'] "+linetag+":last-child");
            var d=[];
            if(datatype2=="curved")
                d = $(line).attr("d").replace("M","").replace("Q","").split(" ");

            x1=getFloat(datatype2=="curved"?d[0]:$(line).attr("x1"));
            y1=getFloat(datatype2=="curved"?d[1]:$(line).attr("y1"));
            x2=getFloat(datatype2=="curved"?d[4]:$(line).attr("x2"));
            y2=getFloat(datatype2=="curved"?d[5]:$(line).attr("y2"));
            dx = oheDx;
            dy = oheDy;
            // проверяем, вышли ли за бордер
            switch ($(line).attr("data-type")){
                case "h":
                    x2=end.x+end.w*dx;
                    y1=y2=end.y+end.h*dy;
                    break;
                case "v":
                    x1=x2=end.x+end.w*dx;
                    y2=end.y+end.h*dy;
                    break;
                default:
                    x2=end.x+end.w*dx;
                    y2=end.y+end.h*dy;
                    break;
            }
            if(x1 && x2 && y1 && y2){
                $(line).linemove({
                    x1:x1,
                    y1:y1,
                    x2:x2,
                    y2:y2,
                    frozeconnector:true,
                    start:start,
                    end:end
                });
            }
        }
    }
    if(lines.length>1 && datatype2=="rectangle"){
        $(lines).each(function(i,e){
            // удаляем пустые линии

            var x1=getFloat($(e).attr("x1"));
            var y1=getFloat($(e).attr("y1"));
            var x2=getFloat($(e).attr("x2"));
            var y2=getFloat($(e).attr("y2"));
            var prev = $(e).prev();
            var next = $(e).next();
        
            var distX=Math.abs(x2-x1);
            var distY=Math.abs(y2-y1);

            if(distX<deltaX && distY<deltaY){
                var canDelThis = !(i==lines.length-1 && $(container).attr("data-end") || i==0 && $(container).attr("data-start"));
                var linetype = $(e).attr("data-type");
                if(!canDelThis){
                    // проверяем, правильное ли прикрепление
                    var oheDx=-1;
                    var oheDy=-1;
                    if(i==0){
                        oheDx=getFloat($(container).attr("data-start-dx"));
                        oheDy=getFloat($(container).attr("data-start-dy"));
                    }
                    else{
                        oheDx=getFloat($(container).attr("data-end-dx"));
                        oheDy=getFloat($(container).attr("data-end-dy"));
                    }
                    canDelThis=(linetype=="h" && (oheDy==0 || oheDy==1) || linetype=="v" && (oheDx==0 || oheDx==1));
                }

                if(canDelThis){
                    // маленькая линия, удаляем
                    var isNextPrefer = ($(line).index() == i+1);
                    var isPrevPrefer = ($(line).index() == i-1);
                    var canMoveNextX = true;
                    var canMoveNextY = true;
                    if(i==lines.length-2 && $(container).attr("data-end")){
                        var element = $("#" +$(container).attr("data-end"));
                        var clientX2 = 0;
                        var clientY2 = 0;
                        var param2 = $(element).storeget();
                        var lineparam = $(container).storeget();
                        if(param2.container && param2.container!=lineparam.container){
                            var pm=$("#"+param2.container).logicGetGlobalOffset();
                            clientX2 = pm.x;
                            clientY2 = pm.y;
                        }
                        var oheX=getFloat($(element).attr("x")) + clientX2;
                        var oheY=getFloat($(element).attr("y")) + clientY2;
                        var oheW=getFloat($(element).attr("width"));
                        var oheH=getFloat($(element).attr("height"));
                        var newX = getFloat($(e).attr("x1"));
                        var newY = getFloat($(e).attr("y1"));
                        canMoveNextX= (newX>=oheX && newX<=oheX+oheW);
                        canMoveNextY= (newY>=oheY && newY<=oheY+oheH);
                    }

                    var canMovePrevX = true;
                    var canMovePrevY = true;
                    if(i==1 && $(container).attr("data-start")){
                        var element = $("#" +$(container).attr("data-start"));
                        var clientX2 = 0;
                        var clientY2 = 0;
                        var param2 = $(element).storeget();
                        var lineparam = $(container).storeget();
                        if(param2.container && param2.container!=lineparam.container){
                            var pm=$("#"+param2.container).logicGetGlobalOffset();
                            clientX2 = pm.x;
                            clientY2 = pm.y;
                        }
                        var oheX=getFloat($(element).attr("x")) + clientX2;
                        var oheY=getFloat($(element).attr("y")) + clientY2;
                        var oheW=getFloat($(element).attr("width"));
                        var oheH=getFloat($(element).attr("height"));
                        var newX = getFloat($(e).attr("x2"));
                        var newY = getFloat($(e).attr("y2"));
                        canMovePrevX= (newX>=oheX && newX<=oheX+oheW);
                        canMovePrevY= (newY>=oheY && newY<=oheY+oheH);
                    }

                    /*console.log({
                        calDelThis:calDelThis,
                        isNextPrefer:isNextPrefer,
                        canMoveNextX:canMoveNextX,
                        canMoveNextY:canMoveNextY,
                        isPrevPrefer:isPrevPrefer,
                        canMovePrevX:canMovePrevX,
                        canMovePrevY:canMovePrevY
                    });*/
                    switch(linetype){
                        case "h":
                            // проверяем, сможем ли подвинуть на позицию x1
                            if((isNextPrefer || !isPrevPrefer) && canMoveNextX && next.length>0){
                                // двигают след линию или нет вариантов
                                $(next).linemove({
                                    x1:$(e).attr("x1"),
                                    x2:$(e).attr("x1"),
                                    y1:$(e).attr("y1")
                                });

                                var n = $(next).next();
                                if(n.length>0){
                                    // если линия не конечная,притягиваем след линию
                                    if(n.length>0){
                                        $(n).linemove({
                                            x1:$(next).attr("x2")
                                        });
                                    }
                                }
                                $(e).remove();
                            }
                            else if(canMovePrevX && prev.length>0) {
                                // работаем с пред линией, даже если ее не двигают
                                $(prev).linemove({
                                    x1:$(e).attr("x2"),
                                    x2:$(e).attr("x2"),
                                    y2:$(e).attr("y2")
                                });
                                var n = $(prev).prev();
                                // если линия не первая притягиваем пред линию
                                if(n.length>0){
                                    $(n).linemove({
                                        x2:$(prev).attr("x1")
                                    });
                                }
                                $(e).remove();
                            }
                        break;
                        case "v":
                            // выбираем либо линию, кот. двигают, или по условию
                            if((isNextPrefer || !isPrevPrefer) && canMoveNextY && next.length>0){
                                $(next).linemove({
                                    x1:$(e).attr("x1"),
                                    y1:$(e).attr("y1"),
                                    y2:$(e).attr("y1")
                                });
                                var n = $(next).next();
                                // если линия не конечная притягиваем след линию
                                if(n.length>0){
                                    $(n).linemove({
                                        y1:$(next).attr("y2")
                                    });
                                }
                                $(e).remove();
                            }
                            else if(canMovePrevY && prev.length>0) {
                                $(prev).linemove({
                                    x2:$(e).attr("x2"),
                                    y1:$(e).attr("y2"),
                                    y2:$(e).attr("y2")
                                });
                                var n = $(prev).prev();
                                // если линия не первая
                                // притягиваем пред линию
                                if(n.length>0){
                                    $(n).linemove({
                                        y2:$(prev).attr("y1")
                                    });
                                }
                                $(e).remove();
                            }
                        break;
                    }
                }
            }
            // удаляем линии одного типа
            if(prev.length>0 && $(prev).attr("data-type")==$(e).attr("data-type")){
                $(prev).linemove({
                    x2:x2,
                    y2:y2
            });
                $(e).remove();
            }
        });

        $(container).lineNumberMove();
    }
}
$.fn.linesubstratebyelement=function(enable){
    var element=this;
    $("g[data-type='line'][data-start='"+$(element).prop("id")+"']").each(function(i,e){
        $(e).substrate(enable);
    });
    $("g[data-type='line'][data-end='"+$(element).prop("id")+"']").each(function(i,e){
        $(e).substrate(enable);
    });
}
$.fn.lineemptybyelement=function(freaze){
    var element=this;
    $("g[data-type='line'][data-start='"+$(element).prop("id")+"']").each(function(i,e){
        var linetag = ($(e).attr("data-type2")=="curved"?"path":"line")
        var line = $(e).find("g[data-type='main'] "+linetag+":first-child");
        if(freaze==undefined || $.inArray($(e).prop("id"),freaze)==-1){
            $(e).lineempty(line);
            if(freaze!=undefined && $(e).attr("data-type2")!="rectangle")
                freaze.push($(e).prop("id"))
        }
    });
    $("g[data-type='line'][data-end='"+$(element).prop("id")+"']").each(function(i,e){
        var linetag = ($(e).attr("data-type2")=="curved"?"path":"line")
        var line = $(e).find("g[data-type='main'] "+linetag+":last-child");
        if(freaze==undefined || $.inArray($(e).prop("id"),freaze)==-1){
            $(e).lineempty(line);
            if(freaze!=undefined && $(e).attr("data-type2")!="rectangle")
                freaze.push($(e).prop("id"))
        }
    });
    return freaze;
}
$.fn.exchangeAttr = function(attr1, attr2){
    var v1=$(this).attr(attr1);
    var v2=$(this).attr(attr2);
    if(v2==undefined)
        $(this).removeAttr(attr1);
    else
        $(this).attr(attr1,v2);
    if(v1==undefined)
        $(this).removeAttr(attr2);
    else
        $(this).attr(attr2,v1);
}
$.linegetnewnumber = function(){
    var numbers = [];
    $("g[data-type='line']:not([data-type4='lineattr']):not([data-start-type='picture']):not([data-end-type='picture']):not([data-start-type='comment']):not([data-end-type='comment']):not([data-type2='simple'])").each(function(i,e){
        var params = $(e).lineget();
        numbers.push((params.number??"").toString().split('.')[0].trim());
    });
    var number = "";
    for(var i=1;i<1000 && number=="";i++){
        if(numbers.indexOf(i.toString())==-1)
            number = i.toString();
    }
    return number;
}
var linegetflow = function(number){
    var param = undefined;
    if(!$.isempty(number)){
        $.each($.storekeys(),function(i,id){
            var p1 = $.storeget(id);
            if(p1.datatype == "line" && !$.isempty(p1.number) && (number.toString().toLowerCase().indexOf(p1.number.toString().toLowerCase()+".")==0 || number.toString().toLowerCase()==p1.number.toString().toLowerCase()) && $.hasviewpageparam(p1,"interface")){
                param = p1;
            }
        });
    }
    return param;
}
var linegetinterfacelist = function(number){
    var list=[];
    number = $.isnull(number,"");
    $.each($.storekeys(),function(i,id){
        var p1 = $.storeget(id);
        //if(number=="") debugger;
        if(p1.datatype == "line" && ((p1.number??"").toString().toLowerCase().indexOf(number.toString().toLowerCase()+".")==0 || (p1.number??"").toString().toLowerCase()==number.toString().toLowerCase()) && $.hasviewpageparam(p1,"system")){
            list.push(p1);
        }
    });
    return list;
}
$.fn.linerenumber = function(prefix){
    var lines = this;
    prefix=(prefix?prefix:"");
    //if(prefix.length>0 && prefix[prefix.length-1]!='.') prefix=prefix+'.';
    /*$("g[data-type='line']:not([data-type2='simple'])[data-start-type='element'][data-end-type='element']").each(function(i,e){
        lines.push(e);
    });*/
    $.each($(lines).sort(function(a,b){
        if(getInt($(a).attr("data-select-order"))<getInt($(b).attr("data-select-order")))
            return -1;
        return 1;
    }),function(i,e){
        var number = prefix+(i+1).toString();
        var params = $(e).lineget();
        $.each(linegetinterfacelist(params.number),function(i1,p){
            p.number=p.number.replace(params.number,number);
            storedirectlyset(p.id,p);
        });
        $(e).children("text.line-number").text(number);
        $(e).linesave();
        /*var parentid=$(e).prop("id");
        $.each($.storekeys(),function(i1,id){
            var p = $.storeget(id);
            if(p.datatype=="line" && p.parentel == parentid){
                p.number=number;
                storedirectlyset(p.id,p);
            }
        });*/

    });
    $.historycloseputtransaction();
}
$.fn.linesetnumber = function(number){
    var lines = this;
    $(lines).sort(function(a,b){
        if(getInt($(a).attr("data-select-order"))<getInt($(b).attr("data-select-order")))
            return -1;
        return 1;
    }).each(function(i,e){
        $(e).children("text.line-number").text(number+"."+(i+1).toString());
        $(e).linesave();
    });
    $.historycloseputtransaction();
}
$.fn.sortByLineNumber = function(){
    this.sort(function(a,b){
        var an = $(a).children("text.line-number").text();
        var bn = $(b).children("text.line-number").text();
        if(getInt(an)<getInt(bn)) return -1;
        if(getInt(an)>getInt(bn)) return 1;
        return 0;
    });
    return this;
}
$.fn.linedirection = function(){
    var container=this;
    var parammenu = $(container).getviewpageparam();
    var newdirection = parammenu.direction=="f"?"r":"f";
    $(container).setviewpageparam({
        direction: newdirection
    });
    $(container).attr({
        "data-direction":newdirection
    });
    $("svg[data-type='linedata'][data-parent='" + $(container).prop("id") + "']").each(function(i,e){
        $(e).setviewpageparam({
            direction: newdirection
        });
        $("g[data-type='line'][data-start='" + $(e).prop("id") + "'], g[data-type='line'][data-end='" + $(e).prop("id") + "']").each(function(i1,e1){
            $(e1).setviewpageparam({
                direction: newdirection
            });
            $(e1).attr({
                "data-direction":newdirection
            });
        });
    });
}
$.fn.linetype = function(type){
    var params = $(this).storeget();
    if(params.datatype2!=type){
        $(this).attr({
            "data-type2":type
        });
        params.datatype2=type;
        var parammenu = $.getviewpageparam(params);
        switch(type){
            case "direct":
            case "simple":
                var points = parammenu.points.split(',');
                parammenu.points= points[0] + "," + points[points.length-1];
                break;
            case "curved":
                var points = parammenu.points.split(',');
                parammenu.points= points[0] + "," + points[points.length-1];
                break;
            default:
                var points = parammenu.points.split(',');
                var point1=points[0].trim().split(" ");
                var point2=points[points.length-1].trim().split(" ");
                parammenu.points= $([
                    point1,
                    [(getFloat(point2[0])+getFloat(point1[0]))/2, point1[1]],
                    [(getFloat(point2[0])+getFloat(point1[0]))/2, point2[1]],
                    point2
                ]).toPointString();
                break;
        }
        $.storeset(params);
        setAutosize();

    }
}
$.fn.linefunction = function(){
    var container=this;
    var param = $(container).lineget();
    param.function = param.function=="consumer"?"supply":"consumer";
    $.storeset(param);
    $(container).lineNumberMove();
    $(container).linetextsave();
}