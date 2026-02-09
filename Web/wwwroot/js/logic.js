var logicFn = "default"; 
var onhoverElement=undefined;
var logicCanChangeLeft = true;
var logicCanChangeTop = true;
var logicCanChangeRight = true;
var logicCanChangeBottom = true;
var mouseMovingContainer = undefined; 
var isMouseMovingStart = false;

$.logicStateMapping = function(a,b){
    const logicStateMapping={
        new:{new:"new",change:"change",exist:"change",external:"external"},
        change:{new:"change",change:"change",exist:"change",external:"external"},
        exist:{new:"change",change:"change",exist:"exist",external:"external"},
        external:{new:"external",change:"external",exist:"external",external:"external"},
    }
    if(!logicStateMapping[a]) return b??"exist";
    if(!logicStateMapping[a][b]) return a;
    return logicStateMapping[a][b];
}
$.fn.logiczone = function(params){
    var container = this;
    if($.pagemenu()=="system" && $.hasviewpageparam(params,"system") && !$($.intplatformdictionary()).objectArrayGetByField("name",params.name) /*params.type!="Интеграционная платформа"*/)
    {
        var parammenu = $.getviewpageparam(params);
        var zones = "";
        $("svg[data-type='zone']").each(function(i,e){
            var zone=$(e).storeget();
            var zp = $.getviewpageparam(zone);
            if(intersects(
                {
                    x:getFloat(zp.x),
                    y:getFloat(zp.y),
                    x1:getFloat(zp.x)+getFloat(zp.w),
                    y1:getFloat(zp.y)+getFloat(zp.h)
                },
                {
                    x:getFloat(parammenu.x),
                    y:getFloat(parammenu.y),
                    x1:getFloat(parammenu.x)+getFloat(parammenu.w),
                    y1:getFloat(parammenu.y)+getFloat(parammenu.h)
                }
            ))
                {
                    zones += (zones != "" ? "/ " : "") + zone.name;
                }
        });
        if (zones!="") {
            params.location=zones;
            $(container).storeset(params, undefined, false);
            if($(container).isselected())
                $.propertyset(undefined,true);
        }
    }
    return params;
}
$.fn.logiccross = function(params){
    if($.pagemenu()=="system" && $.hasviewpageparam(params,"system"))
    {
        var parammenu = $.getviewpageparam(params);
        if(params.datatype=="zone"){
            $("svg[data-type='element']:not([data-type3='simple'])").each(function(i,e){
                var element=$(e).storeget();
                var ep = $.getviewpageparam(element);
                if(intersects(
                    {
                        x:getFloat(ep.x),
                        y:getFloat(ep.y),
                        x1:getFloat(ep.x)+getFloat(ep.w),
                        y1:getFloat(ep.y)+getFloat(ep.h)
                    },
                    {
                        x:getFloat(parammenu.x),
                        y:getFloat(parammenu.y),
                        x1:getFloat(parammenu.x)+getFloat(parammenu.w),
                        y1:getFloat(parammenu.y)+getFloat(parammenu.h)
                    }
                ))
                    {
                        element=$(e).logiczone(element);
                    }
            });
        }
        if(params.datatype=="element" && $($.intplatformdictionary()).objectArrayGetByField("name",params.name) /*params.type=="Интеграционная платформа"*/){
            $("g[data-type='line']:not([data-type4='lineattr'])").each(function(i,e){
                var line = $(e).lineget();
                var lp = $.getviewpageparam(line);
                if(lp.points && intersectline(parammenu,lp.points)){
                    $(e).lineintplatform(line);
                }
            });
        }
    }
    return params;
}
$.fn.logicname = function(params){
    if(params.datatype=="element" && ($.pagemenu()=="interface" || $.pagemenu()=="concept" || $.pagemenu()=="development" || $.pagemenu()=="database" || $.pagemenu()=="system")){
        var container = this;
        var lname = $.logicGetLocalName(params);
        var gname = lname;
        if(params.datatype3=="application"){
            gname = $.logicGetGlobalName(params);
        }
        if(params.name!=gname){
            params.name = gname;
            $.storeset(params,undefined,false);
        }
        /*if($(container).isselected())
            $.propertyset(params,true);*/
        var text=$(container).children("text.caption");
        $(text).svgset({text:lname});
        var delta=2;
        $(text).txtwrap(3*delta+2,getInt($(container).attr("width"))-$.logicImageSize(params.datatype)-7*delta);
    }
    return params;
}
$.fn.logicinclude = function(params){
    var container = this;
    if($.pagemenuname()=="business" && $(container).attr("data-type")=="function" && (!$(container).attr("data-container") || $(container).attr("data-container")=="")){
        var x=getFloat($(container).attr("x")) + getFloat($(container).attr("width"))/2;
        var y=getFloat($(container).attr("y")) + getFloat($(container).attr("height"))/2;
        $("svg[data-type='element']").each(function(i,e){
            if(x>getFloat($(e).attr("x")) && x<getFloat($(e).attr("x")) + getFloat($(e).attr("width")) 
                && y>getFloat($(e).attr("y")) && y<getFloat($(e).attr("y")) + getFloat($(e).attr("height"))){
                    params.container=$(e).prop("id");
                    var parammenu=$.getviewpageparam(params);
                    parammenu.x=getFloat(parammenu.x)-getFloat($(e).attr("x"));
                    parammenu.y=getFloat(parammenu.y)-getFloat($(e).attr("y"));
                    storedirectlyset(params.id,params,undefined,false);
                    var last = $(e).children("[data-type]").last();
                    if(last.length>0)
                        $(last).after(container);
                    else
                        $(e).append(container);
                    $(container).attr({
                        x:parammenu.x,
                        y:parammenu.y,
                        "data-container":params.container
                    });
                }
        });
    }
    return params;
/*$("svg[data-type2='logic'][data-type3='collaboration']").each(function(i,e){
        var parammenu=$(e).getviewpageparam();
        var p1={
            x:getFloat(parammenu.x),
            y:getFloat(parammenu.y),
            w:getFloat(parammenu.w),
            h:getFloat(parammenu.h)
        }
        if(p1.x<p.x && p1.y<p.y && p1.x+p1.w>p.x+p.w && p1.y+p1.h>p.y+p.h){
            $(e).include();
        }
    });*/
}
$.fn.logicGetGlobalOffset = function(){
    var pm={
        x:getFloat($(this).attr("x")),
        y:getFloat($(this).attr("y"))
    }
    var pp={
        x:0,
        y:0
    };
    if($(this).attr("data-container"))
        pp=$("#"+$(this).attr("data-container")).logicGetGlobalOffset();
    return({
        x:pm.x+pp.x,
        y:pm.y+pp.y
    });
}
$.logicGetLocalName = function(p){
    var result = $.logicGetParentName(p);
    var ind = p.name.indexOf(result);
    if(ind!=-1) 
        result=p.name.substring(result.length);
    else
        result=p.name;
        return result;
}
var logicGetLocalName = function(name){
    let list=(name??"").split('. ');
    if(list.length>0) return list[list.length-1];
    return name??"";
}
$.logicGetGlobalName = function(p){
    var result = $.logicGetParentName(p, $.hasviewpageparam(p,"interface")?"interface":$.pagemenu());
    var ind = p.name.indexOf(result);
    if(ind!=-1) 
        result=p.name;
    else
        result+=p.name;
    return result;
}
$.logicGetParentName = function(p,menutype){
    var list=[];
    var result="";
    if(!menutype) menutype = $.pagemenu();
    var pm=$.getviewpageparam(p,menutype);
    var p1={
        x:getFloat(pm.x),
        y:getFloat(pm.y),
        w:getFloat(pm.w),
        h:getFloat(pm.h)
    }
    $.each($.storekeys(),function(i,id){
        var e = $.storeget(id);
        if(e.datatype=="element" && p.id!=e.id && $.hasviewpageparam(p,menutype)){
            var parammenu=$.getviewpageparam(e,menutype);
            var e1={
                x:getFloat(parammenu.x),
                y:getFloat(parammenu.y),
                w:getFloat(parammenu.w),
                h:getFloat(parammenu.h)
            }
            if(e1.x<p1.x && e1.y<p1.y && e1.x+e1.w>p1.x+p1.w && e1.y+e1.h>p1.y+p1.h){
                list.push({
                    order:parammenu.order,
                    name:e.name
                });
            }
        }
    });
    $.each($(list).sort(function(a,b){
        if(getInt(a.order)<getInt(b.order)) return -1;
        return 1;
    }),function(i,e){
        result+=e.name.replace(result,"") + ". ";
    });
    return result;
    /*var pn;
    if(p.container)
        pn=$.logicGetGlobalName($.storeget(p.container));
    return  (pn?pn+". ":"")+p.name;*/
}
$.logicImageSize = function(datatype){
    switch(datatype){
        case "server":
        case "cluster":
        case "#temp-vmware":
        case "#temp-openshift":
        case "#temp-vmlpar":
        case "#temp-dataprotector":
        case "system":
            return 17;
        case "#temp-veeam":
            return 40;
        case "element":
            return 32;
        case "element_system":
            return 11;
        default:
            if($.pagenotation()=="bpmn") return 22;
            return 12;
    }
}
$.fn.logicMinHeight = function(datatype){
    var height = $.logicMinHeight(datatype);
    $(this).children("svg[data-type2='logic']").each(function(i,e){
        var h = getFloat($(e).attr("y")) + getFloat($(e).attr("height"));
        if(h>height) height=h;
    });
    return height;
}
$.logicMinHeight = function(datatype){
    switch(datatype){
        case "subprocess":
        case "function":
        case "functionstep":
        case "server":
            return($.pagenotation()=="bpmn"?90:60);
        case "linedata":
            return 60;
        case "cluster":
        case "element":
            return($.pagemenuname()=="business"?($.pagenotation()=="bpmn"?200:150):50);
        case "zone":
            return($.pagemenuname()=="function"?35:50);
        case "legend":
            return 128;
        case "picture":
            return($.pagenotation()=="bpmn"?90:50);
        default:
            return 50;
    }
}
$.fn.logicMinWidth = function(datatype){
    var width = $.logicMinWidth(datatype);
    $(this).children("svg[data-type2='logic']").each(function(i,e){
        var w = getFloat($(e).attr("x")) + getFloat($(e).attr("width"));
        if(w>width) width=w;
    });
    return width;
}
$.logicMinWidth = function(datatype){
    switch(datatype){
        case "subprocess":
        case "function":
        case "functionstep":
            return($.pagenotation()=="bpmn"?150:130);
        case "data":
            return 130;
        case "server":
        case "cluster":
        case "element":
            return($.pagemenuname()=="business"?200:100);
        case "legend":
            return ($.currentdocumentget().type=="Архитектурный шаблон"?725:582);
        case "picture":
            return($.pagenotation()=="bpmn"?150:50);
        default:
            return 50;
    }
}
$.fn.logicget = function(){
    return $(this).storeget();
}
$.logicgetbyname = function(name, pagemenu){
    let params;
    if(!pagemenu) pagemenu="interface"
    if(!$.isempty(name)){
        let n = name.trim().toLowerCase();
        $.each($.storekeys(),function(i,id){
            var p = $.storeget(id);
            if(p.datatype=="element" && p.name.trim().toLowerCase()==n && !$.hasviewpageparam(p,pagemenu)){
                params=p;
                return false;
            }
        });
    }
    return params;
}
$.logicrotate = function(parammenu){
    return $.extend(parammenu,{
                        x:parammenu.y,
                        y:parammenu.x,
                        h:parammenu.w,
                        w:parammenu.h
                    });
}
$.logicreflection = function(parammenu){
    return $.extend(parammenu,{
                        x:parammenu.y,
                        y:parammenu.x
                    });
}
$.fn.logicset = async function(params){
    var container=this;
    let place=$(container).parent();
    var parammenu = $.getviewpageparam(params);
    var needReload = false;
    switch(params.datatype){
        case "start-process":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
            $(container).children("title").text(params.name);
        break;
        case "subprocess":
            $(container).attr({
                "data-state":params.state
            });
            $(container).children("text").remove();
            $(container).svg("text",{text:params.name});
            let a = $(container).children("a");
            if(!$.isempty(params.sysid)){
                $(a).attr({
                    href:"index.html?id=" + (getInt(params.filesysid)!=0?params.filesysid:$.currentdocumentget().sysid) + "&v=" + params.sysid,
                    target:"_blank"
                });
            }
            else{
                $(a).attr({
                    href:undefined,
                    target:undefined
                });
            }
            needReload = true;
        break;
        case "function":
        case "functionstep":
            $(container).attr({
                "data-state":params.state
            });
            $(container).children("text").remove();
            $(container).svg("text",{text:params.name});
            $(container).parent().children("svg[data-type='data'][data-parent='" + params.id + "']").each(function(i,e){
                $(e).logic($(e).storeget());
            });
            needReload = true;
        break;
        case "server":
            $(container).attr({
                "data-state":params.state
            });
            $(container).children("text.caption").remove();
            $(container).svg("text",{class:"caption",text:splitNames(params.os,params.env)});
            $(container).children("text.ip").remove();
            $(container).svg("text",{class:"ip",text:params.ip});
            $(container).children("text.name").remove();
            $(container).svg("text",{class:"name",text:params.name});
            $(container).find("g.server-element").remove();
            $(params.elements).sortByState().each(function(i,e){
                var g=$.svg("g",{
                    class:"server-element",
                    "data-type":"element",
                    "min-width": $.logicMinWidth("element"),
                    "min-height": $.logicMinHeight("element"),
                    "data-id":e.id,
                    "data-state":e.state
                });
                $(g).svg("rect",{
                    rx:5,
                    ry:5
                });
                $(g).svg("text",{
                    text:e.name
                });
                $(g).svg("use",{
                    "href":"#temp-app"
                });
                $(container).append(g);
            });
            needReload = true;
        break;
        case "element":
            params=$(container).logiccross(params);
            params=$(container).logiczone(params);
            $(container).attr({
                "data-state":params.state,
                "data-type3":params.datatype3,
                "data-container":params.container,
                "data-can-be-moved":(params.datatype3!="collaboration" && $.pagemenuname()!="business"),
                "data-can-be-connected":(/*(params.datatype3!="collaboration" || $.currentdocumentget().typecode=="concept") &&*/ $.pagemenuname()!="business"),
                "data-can-caption-be-moved":($.pagemenuname()=="business")
            });
            $(container).children("text.caption").remove();
            $(container).svg("text",{class:"caption",text:$.logicGetLocalName(params)});
            $(container).find("g.server-element").remove();
            if($.pagenotation()!="bpmn"){
                let href="#temp-interface";
                switch($.pagemenu()){
                    case "database":
                        href="#temp-database";
                        break;
                    case "development":
                        href="#temp-class";
                        break;
                    default:
                        switch(params.datatype3){
                            /*case "application":
                                href="#temp-module";
                                break;*/
                            case "collaboration":
                                href="#temp-collab";
                                break;
                            case "template":
                                href="#temp-template";
                                break;
                            case "clientservice":
                                href="#temp-service";
                                break;
                            case "neuroapp":
                                href="#temp-neuro";
                                break;
                            case "neuromodule":
                                href="#temp-neuro-module";
                                break;
                            case "integration":
                                href="#temp-int";
                                break;
                        }
                        break;
                }
                $(container).children("use.element-type").attr({
                    "href":href
                });
            }

            $(container).children("g.element-namespace").remove();
            $(container).children("g.element-function").remove();
            $(container).children("g.element-system").remove();

            $(container).children("g.element-datasystem").remove();
            $(container).children("rect.rect-data").remove();
            $(container).children("ellipse.rect-data").remove();
            $(container).children("g.element-data").remove();

            $(container).children("text.valuestream").remove();
            if (params.metrics) {
                $(container).svg("text",{
                    class:"valuestream",
                    text:params.realization//$.storemetricget(params.metrics, "valuestream")
                });
                $.each(params.metrics, function (i, e) {
                    $(container).removeAttr("metric-" + e.alias);
                    if ($.isnull(e.alias, "") != "" && $.isnull(e.value, "") != "") {
                        $(container).attr("metric-" + e.alias, e.value);
                    }
                });
            }

            if(params.datatype3=="collaboration"){
            }
            if(params.datatype3=="template"){
                $(container).children("text.templateparams").remove();
                if(params.templates){
                    let arr = params.templates.filter(item => item.viewdata==$.pagemenuname()).map(item=>(item.caption + "." + item.name + ": " + item.value))
                    $(container).svg("text",{
                        class:"templateparams",
                        text:arr.join('\n')
                    });
                }
            }
            else{
                var hasFunction=false;
                var hasData=false;
                switch($.pagemenuname()){
                    case "interface":
                    case "concept":
                    case "development":
                    case "database":
                        hasFunction=(params.functions && params.functions.length>0);
                        $(params.functions).sortByState().each(function(i,e){
                            var g=$.svg("g",{
                                class:"element-function",
                                "data-type":"function",
                                "data-value-type":e.type,
                                "min-width": $.logicMinWidth("function"),
                                "min-height": $.logicMinHeight("function"),
                                "data-id":e.id,
                                "data-state":e.state
                            });
                            $(g).svg("rect",{
                                rx:5,
                                ry:5
                            });
                            $(g).svg("text",{
                                text:e.name
                            });
                            if($.pagemenuname()!="database" && $.pagemenuname()!="development"){
                                $(g).svg("use",{
                                    "href":"#temp-func"
                                });
                            }
                            $(container).append(g);
                        });
                        var data2Show = undefined;
                        if(params.data!=undefined)
                            data2Show = params.data.filter(x=>x.flowtype!='transfer');
                        if(data2Show!=undefined && data2Show.length>0){
                            hasData=true;
                            $(container).svg("rect",{
                                class:"rect-data",
                                rx:"50%",
                                ry:5
                            });
                            $(container).svg("ellipse",{
                                class:"rect-data",
                                ry:5
                            });
                            $.each($(data2Show).sortByState(),function(i,e){
                                var g=$.svg("g",{
                                    class:"element-data",
                                    "data-id":e.id,
                                    "data-state":e.state,
                                    "data-flowtype":e.flowtype,
                                    "data-securitytype":e.securitytype
                                });
                                $(g).svg("rect");
                                $(g).svg("line");
                                $(g).svg("text",{
                                    text:e.name + (e.securitytype && e.securitytype!=""? " (" + e.securitytype +")":"")
                                });
                                $(container).append(g);
                            });
                        }
                    break;
                    case "system":
                        let comp=[];
                        var addToCompList=function(comp,e){
                            let item=comp.find(el =>el.ns?.desc==e.ns?.desc /*&& el.ns?.type==e.ns?.type*/);
                            if(!item){
                                item={
                                    ns:e.ns,
                                    values:[],
                                    state:e.state
                                }
                                comp.push(item);
                            }
                            else{
                                item.state=$.logicStateMapping(item.state,e.state);
                            }
                            var id=splitNames(e.type,e.value);
                            var p = item.values.find(el =>el.id==id);
                            if(p){
                                p.data.push({
                                    name:e.name,
                                    state:e.state
                                });
                                p.state=$.logicStateMapping(p.state,e.state);
                            }
                            else{
                                item.values.push({
                                    id:id,
                                    type:e.type,
                                    platform:e.value,
                                    state:e.state,
                                    data:[{
                                        name:e.name,
                                        state:e.state
                                    }]
                                });
                            }
                            return comp;
                        }
                        $.each(params.components,function(i,e){
                            if(e.values){
                                //if(params.sysid="8065") debugger;
                                let name = logicGetLocalName(e.name??"");//$.isnull(e.values?.app?.desc,"")==""?(e.values?.app?.value??e.name??""):$.isnull(e.values?.app?.desc,"");
                                if(e.values.db || e.values.dbos){
                                    comp=addToCompList(comp,{
                                        ns:{value:"",desc:"",state:params.state,type:"database"},
                                        type:"database",
                                        value: splitNames(e.values.dbos?.value??e.values.os?.value,e.values.db?.value),
                                        name: getString(e.values.db?.desc)!=""?e.values.db?.desc:name,//(e.id==params.sysid || (!params.sysid || getInt(params.sysid)==0) && e.id==params.id)?"Хранилище":name,
                                        state: $.logicStateMapping(e.values.dbos?.value??e.values.os?.state,e.values.db?.state)
                                    });
                                }
                                let hassys=false;
                                for(let i of Object.keys(e.values)){
                                    hassys|=(i!="db" && i!="dbos" && i!="os");
                                }
                                if(hassys/*e.values.sys || e.values.env || e.values.os || e.values.containerapp || e.values.container || e.app*/){
                                    let val="";
                                    let state="";
                                    $.each(Object.keys(e.values).sort(function(a,b){
                                        return (getComponentWeight(a)<getComponentWeight(b)?-1:1);
                                    }),function(i1,e1){
                                        if(e1!="db" && e1!="dbos" && e1!="containerapp") {
                                            val=splitNames(val,e.values[e1]?.value);
                                            state=$.logicStateMapping(state,e.values[e1]?.state);
                                        }
                                    });
                                    if(!$.isempty(val)){
                                        comp=addToCompList(comp,{
                                            ns:e.values.containerapp??{value:"",desc:"",state:params.state,type:"application"},
                                            type:"application",
                                            value: val,
                                            name: getString(e.values.app?.desc)!=""?e.values.app?.desc:name,//(e.id==params.sysid || (!params.sysid || getInt(params.sysid)==0) && e.id==params.id)?"Приложение":name,
                                            state: state
                                        });
                                    }
                                }
                            }
                        });
                        //if(params.id=="5eb8d990-c88a-4c83-98ce-22aeed888746") console.log(params.components,comp);
                        $.each(comp.sort(function(a,b){
                            if ($.isempty(a.ns?.desc)) return 1;
                            if ($.isempty(b.ns?.desc)) return -1;
                            return (a.ns<b.ns?-1:1);
                        }),function(i1,e1){
                            var namespace=$.svg("g",{
                                class:"element-namespace",
                                "data-state":e1.state
                            });
                            if(e1.ns?.desc??""!=""){
                                $(namespace).svg("rect",{
                                    class:"rect-ns",
                                    rx:5,
                                    ry:5
                                });
                                let t = $(namespace).svg("text",{
                                    class:"rect-ns"
                                });
                                // set namespace
                                $(t).svgset({
                                    id:params.id,
                                    data:[{
                                        name:(e1.ns?.value?e1.ns?.value+"\n":"") + (e1.ns?.desc??""),
                                        state:e1.ns?.state??"exist"
                                    }]
                                });
                            }
                            $(container).append(namespace);

                            $.each(e1.values,function(i,e){
                                if(e.type=="database"){
                                    hasData=true;
                                    var g=$.svg("g",{
                                        class:"element-datasystem",
                                        "data-state":e.state
                                    });
                                    $(g).svg("rect",{
                                        class:"rect-app",
                                        rx:5,
                                        ry:5
                                    });
                                    $(g).svg("text",{
                                        class:"rect-app",
                                        text:e.platform
                                    });
                                    $(g).svg("use",{
                                        "href":"#temp-system"
                                    });
                                    $(g).svg("rect",{
                                        class:"rect-data",
                                        rx:"50%",
                                        ry:5
                                    });
                                    $(g).svg("ellipse",{
                                        class:"rect-data",
                                        ry:5
                                    });
                                    let txt=$(g).svg("text",{
                                        class:"rect-data"
                                    });
                                    $(txt).svgset({
                                        data:e.data
                                    });
                                    $(namespace).append(g);
                                }
                                else{
                                    hasFunction=true;
                                    var g=$.svg("g",{
                                        class:"element-system",
                                        "data-state":e.state
                                    });
                                    $(g).svg("rect",{
                                        rx:5,
                                        ry:5
                                    });
                                    $(g).svg("text",{
                                        text:e.platform
                                    });
                                    $(g).svg("use",{
                                        "href":"#temp-system"
                                    });
                                    $.each(e.data,function(i1,e1){
                                        var g1=$.svg("g",{
                                            class:"element-app",
                                            "data-state":e1.state
                                        });
                                        $(g1).svg("rect",{
                                            rx:5,
                                            ry:5
                                        });
                                        $(g1).svg("text",{
                                            text:e1.name
                                        });
                                        $(g1).svg("use",{
                                            "href":"#temp-app"
                                        });
                                        $(g).append(g1);
                                    });
                                    $(namespace).append(g);
                                }
                            });
                        });
                        
                    break;
                }
                if(!hasData) parammenu.d=100;
                else if(!hasFunction) parammenu.d=0;
                else if(getInt(parammenu.d)==0 || getInt(parammenu.d)==100) parammenu.d=55;
            }
            needReload = true;
        break;
        case "cluster":
            $(container).attr({
                "data-state":params.state
            });
            $(container).children("text.caption").remove();
            $(container).svg("text",{class:"caption",text:params.name});
            $(container).children("text.storeclass").remove();
            $(container).svg("text",{
                class:"storeclass",
                text:params.storeclass
            });

            $(container).children("use.clustertype").attr({
                href:params.clustertype
            });
            $(container).children("use.copytype").attr({
                href:params.copytype
            });
            needReload = true;
        break;
        case "zone":
        case "datacenter":
            $(container).children("text").remove();
            $(container).svg("text",{class:"caption",text:params.name});
            $(container).find("rect.main").removeAttr("style");
            if(params.datatype=="zone" && $.pagemenuname()=="function"){
                $(container).find("rect.main").attr({
                    style:"fill:url(#zoneGradient)"
                });
            }
            else{
                if(params.color!=undefined){
                    $(container).find("rect.main").attr({
                        style:"fill:" + params.color
                    });
                }
            }
            needReload = true;
            break;
        case "legend":
            var types=["new", "exist", "change","external"];
            if($.currentdocumentget().type=="Архитектурный шаблон") types.push("abstract");
            var delta=5;
            var w = 140;
            var elements = $(container).children("svg[data-type='element'][data-type4='lineattr']");
            if(elements.length==0){
                var delta=4;
                var sysImgWidth=30;
                $.each(types, function(i,e){
                    var p={
                        name:getSystemStateName(e),
                        type:"system",
                        state:e,
                        left: delta*(i+1) + w*i,
                        top: 30,
                        width: w,
                        height: 50
                    }
                    var element = $.svg("svg",{
                        "data-type":"element",
                        "data-type3":"simple",
                        "data-state":p.state,
                        "data-view": "interface",
                        x:p.left,
                        y:p.top,
                        width:p.width,
                        height:p.height
                    }); 
                    $(container).append(element);
                
                    $(element).svg("rect",{
                        class:"main",
                        x:delta/2,
                        y:delta/2,
                        rx:10,
                        ry:10,
                        width:p.width-delta,
                        height:p.height-delta
                    });
                    var imgLeft=p.width-sysImgWidth-2*delta;
                    $(element).svg("use",{
                        class:"element-type",
                        x:imgLeft,
                        y:delta*2,
                        href:"#temp-interface"
                    });
                    var text = $(element).svg("text",{
                        class:"element-text",
                        text:p.name,
                        stroke: "black",
                        "font-size": "11px",
                        "stroke-width": "0.1px",
                        x:2*delta,
                        y:2*delta+15
                    });
                    $(text).txtwrap(2*delta, imgLeft-4*delta);    
                    /*var viewdata = {};
                    viewdata[$.pagemenu()]={
                        order:$(container).lastentityindex(),                                    
                        x: delta*(i+1) + w*i,
                        y: 30,
                        w: w,
                        h: 50
                    };
                    $.storeset({
                        id: $.newguid(),
                        datatype:"element",
                        name:getSystemStateName(e),
                        state:e,
                        datatype3:"simple",
                        viewdata:viewdata,
                        container:params.id
                    });*/
                });
            }
            var lines = $(container).children("g[data-type='line'][data-type4='lineattr']");
            if(lines.length==0){
                var linedelta=6;
                $.each(types, function(i,e){
                    /*var viewdata = {};
                    viewdata[$.pagemenu()]={
                        order:$(container).lastentityindex(),                                    
                        points: (2*linedelta + delta*(i+1) + w*i).toString() + " 100," + (delta*(i+1) + w*(i+1) -2*linedelta).toString() + " 100",
                        direction:"f"//f, r
                    };
                    $.storeset({
                        id: $.newguid(),
                        name:getInterfaceStateName(e),
                        state:e,
                        viewdata:viewdata,
                        function:"supply",//supply, consumer
                        interaction:"Синхронное",
                        datatype:"line",
                        datatype2:"simple",
                        container:params.id
                    });*/
                    var p={
                        name:getInterfaceStateName(e),
                        state:e,
                        x1: 2*linedelta + delta*(i+1) + w*i,
                        x2:delta*(i+1) + w*(i+1) -2*linedelta,
                        y1:100,
                        y2:100,
                        simple: true
                    }
                    var line = $(container).svg("g", {
                        "data-type": "line",
                        "data-type2": 'simple',
                        "data-type4":"lineattr",
                        "data-state": p.state,
                        "data-view": "interface",
                        "data-direction": "f"
                    });
                    var main = $(line).svg("g", {
                        "data-type": "main"
                    });
                    $(main).svg("line", {
                        x1: p.x1,
                        x2:p.x2,
                        y1:p.y1,
                        y2:p.y2,
                        "data-type": "h"
                    });
                    $(line).linetextset(p);
                    /*$(container).linesimple({
                        name:getInterfaceStateName(e),
                        state:e,
                        x1: 2*linedelta + delta*(i+1) + w*i,
                        x2:delta*(i+1) + w*(i+1) -2*linedelta,
                        y1:100,
                        y2:100
                    });*/
                });
            }
        break;
        case "comment":
            $(container).children("text.caption").remove();
            $(container).svg("text",{class:"caption",text:params.name});

            $(container).children("text.comment").remove();
            $(container).svg("text",{class:"comment",text:params.description});

            needReload = true;
            break;
        case "data":
            $(container).children("g.element-data").remove();
            var data2Show = undefined;
            if(params.parentel!=undefined)
                data2Show =$.storeget(params.parentel).data;//.filter(x=>x.flowtype!='transfer');
            if(data2Show){
                $.each($(data2Show).sortByState(),function(i,e){
                    var g=$.svg("g",{
                        class:"element-data",
                        "data-id":e.id,
                        "data-state":e.state,
                        "data-flowtype":e.flowtype,
                        "data-securitytype":e.securitytype
                    });
                    $(g).svg("rect");
                    $(g).svg("line");
                    $(g).svg("text",{
                        text:e.name + (e.securitytype && e.securitytype!=""? " (" + e.securitytype +")":"")
                    });
                    $(container).append(g);
                });
            }
            needReload = true;
            break;
        case "linedata":
            var data=params.data;
            if(params.parentel!=undefined)
                data=$.storeget(params.parentel).data;
            $(place).children("text[data-type='linedatatext'][data-parent='" + params.id + "']").each(function(i,e){
                if(e){
                    $(e).svgset({
                        data:data
                    });
                }
            });
            needReload = true;
            break;
        case "picture":
            if($.pagenotation()=="bpmn"){
                $(container).attr({
                    "data-state":params.state
                });
                $(container).children("text").remove();
                $(container).svg("text",{text:params.description});
                $(container).parent().children("svg[data-type='data'][data-parent='" + params.id + "']").each(function(i,e){
                    $(e).logic($(e).storeget());
                });
            }
            else{
                $(container).children("text").remove();
                $(container).svg("text",{
                    text:params.name
                });
            }
            needReload = true;
            break;
    }
    if(params.nosetposition!=true){
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
                if(params.datatype=="linedata"){
                    let linkcontainer = $(container).parent().find("text[data-type='linedatatext'][data-parent='" + $(container).prop("id") + "']");
                    $(next).before($(linkcontainer));
                }
            }
            catch(e){
                console.error(e);
                console.trace("place:",place,"next:",next,"container:",container, "params:",params);
            }
        }
        //console.log("container:",params?.name,"next:",nextparams?.name);
        //if($.pagemenuname()=="business")debugger;
    }
    $(container).logicMove({
        x:parammenu.x,
        y:parammenu.y,
        w:parammenu.w,
        h:parammenu.h,
        d:parammenu.d,
        reload:needReload,
        stopPropagation:(params.stopPropagation!=undefined?params.stopPropagation:true),
        nomoveneighbors:params.nomoveneighbors,
        autosize:params.autosize
    });
    switch(params.datatype){
        case "picture":
            if($.pagenotation()!="bpmn"){
                await $(container).children("image").loadImage(params);
            }
            break;
    }
}
$.logicOff = function(){
    $("svg[data-type2='logic']").each(function(i,e){
        $(e).logicOff();
    });
}
$.fn.logicOff = function(){
    var container = this;
    if($(container).attr("data-type3")!="simple"){
        $(container).off("mousedown");
        $(container).off("mousemove");
        $(container).off("mouseover");
        $(container).off("mouseleave");
        $(container).off("dblclick");
        var linkcontainer = $(container).parent().find("text[data-type='linedatatext'][data-parent='" + $(container).prop("id") + "']");
        if(linkcontainer){
            $(linkcontainer).off("dblclick");
            $(linkcontainer).off("mousedown");
            $(linkcontainer).off("mousemove");
            $(linkcontainer).off("mouseover");
            $(linkcontainer).off("mouseleave");
        }
    }
}
$.logicOn = function(){
    $("svg[data-type2='logic']:not([data-type3='simple'])").each(function(i,e){
        $(e).logicOn();
    });
}
$.fn.logicOn = function(){
    var container = this;
    $(container).logicOff();
    if($(container).attr("data-type3")!="simple"){
        if(canOperate()){
            $(container).on("mousedown",function(event){ $(container).logicMouseDown(event);});
        }
        else{
            $(container).on("click",function(event){if($.ispropertyshown()){event.stopPropagation();$(container).select(container); $.propertyshow();}});
        }

        $(container).on("mousemove",function(event){ $(container).logicMouseMove(event);});
        $(container).on("mouseover",function(event){ $(container).logicMouseMove(event);});
        $(container).on("mouseleave",function(event){ $(container).logicMouseLeave(event);});
        $(container).on("dblclick",function(event){event.stopPropagation();$(container).select(container); $.propertyshow();});
        var linkcontainer = $(container).parent().find("text[data-type='linedatatext'][data-parent='" + $(container).prop("id") + "']");
        if(linkcontainer){
            $(linkcontainer).on("dblclick",function(event){event.stopPropagation(); $(container).trigger("dblclick");});
            if(canOperate()){
                $(linkcontainer).on("mousedown",function(event){ $(container).logicMouseDown(event); $(this).css({cursor:$(container).css("cursor")}); });
            }
            else{
                $(linkcontainer).on("mousedown",function(event){event.stopPropagation(); $(container).trigger("mousedown");});
            }
            $(linkcontainer).on("mousemove",function(event){ $(container).logicMouseMove(event);  $(this).css({cursor:$(container).css("cursor")}); });
            $(linkcontainer).on("mouseover",function(event){ $(container).logicMouseMove(event);});
            $(linkcontainer).on("mouseleave",function(event){ $(container).logicMouseLeave(event);});
        }
    }
}
$.logicConnect=function(){
    $.logicOn();
}
$.logicDisconnect=function(){
    $.logicOff();
}
$.fn.logicConnect=function(){
    $(this).logicOn();
}
$.fn.logic = function(params, noupdatechildren, nosetposition){
    if(!params.datatype){
        console.error("No datatype",params);
        if(params?.id) storage.removeItem(params.id);
    }
    var place =  $("#" + params.container);
    if(place.length==0)
        place=this;
    var parammenu = $.getviewpageparam(params);
    var container = $("svg#" + params.id + "[data-type='" + params.datatype + "']");
    let linkcontainer = undefined;
    if(container.length==0 && !isemptyobject(parammenu)){
        var container = $(place).svg("svg",{
            id: params.id,
            "data-type":params.datatype,
            "data-type2":"logic",
            "data-type3":params.datatype3,
            "min-width": $.logicMinWidth(params.datatype),
            "min-height": $.logicMinHeight(params.datatype),
            "data-view":$.pagemenuname(),
            "data-notation":$.pagenotation(),
            "data-parent":params.parentel,
            "data-container":params.container,
            "data-can-contain": params.cancontain,
            "data-can-be-connected":true,
            "data-can-be-sized":true,
            "data-can-be-moved":true
        }); 
        switch(params.datatype){
            case "comment":
                /*$(container).attr({
                    "data-can-be-connected":false
                });*/
                $(container).svg("rect",{
                    class:"main",
                    rx:1,
                    ry:1
                });
                $(container).svg("text",{class:"caption",text:params.name});
                $(container).svg("text",{class:"comment"});
                break;
            case "start-process":
            case "end-process":
                var circle = $(container).svg("circle");
                $(circle).svg("title");
                if($.pagenotation()=="bpmn"){
                    if(params.datatype=="end-process"){
                        $(circle).css({
                            "stroke-width":"4px"
                        })
                    }
                }
                else{
                    $(container).svg("polygon");
                }
                break;
            case "clock-start":
                var circle = $(container).svg("circle");
                $(circle).svg("title");
                $(container).svg("polyline");
                /*$(container).svg("line",{class:"left"});
                $(container).svg("line",{class:"right"});*/
                break;
            case "or-process":
            case "and-process":
                var circle = $(container).svg("circle");
                $(circle).svg("title");
                $(container).svg("path");
                break
            case "xor-process":
                if($.pagenotation()=="bpmn"){
                    var path = $(container).svg("path");
                    $(path).svg("title");
                    $(container).svg("text",{text:"X"});
                }
                else{
                    var circle = $(container).svg("circle");
                    $(circle).svg("title");
                    $(container).svg("text",{text:"XOR"});
                }
                break;
            case "subprocess":
                $(container).svg("rect",{
                    class:"main",
                    rx:5,
                    ry:5
                });
                $(container).svg("text",{text:params.name});
                let a = $(container).svg("a");
                if(!$.isempty(params.sysid)){
                    $(a).attr({
                        href:"index.html?id=" + (getInt(params.fileid)!=0?params.fileid:$.currentdocumentget().sysid) + "&v=" + params.sysid,
                        target:"_blank"
                    });
                }
                $(a).svg("use",{
                    "href":($.pagenotation()=="bpmn"?"#temp-subprocesstask": "#temp-proc")
                });
                break;
            case "function":
            case "functionstep":
                $(container).svg("rect",{
                    class:"main",
                    rx:5,
                    ry:5
                });
                $(container).svg("text",{text:params.name});
                var href="";
                if($.pagenotation()=="bpmn"){
                    href="#temp-servicetask";
                }
                else{
                    switch (params.datatype){
                        case "functionstep":
                            href="#temp-step";
                            break;
                        case "function":
                            href="#temp-func";
                            break;
                    }
                }
                $(container).svg("use",{
                    "href":href
                });
                break;
            case "zone":
                $(container).attr({
                    "data-can-be-moved":($.pagemenuname()=="function"),
                    "data-can-be-connected":($.pagemenuname()=="function")
                });
                $(container).svg("rect",{
                    class:"main",
                    rx:$.pagemenuname()=="function"?15:5,
                    ry:$.pagemenuname()=="function"?50:5
                });
                $(container).svg("text",{text:params.name});
                break;
            case "datacenter":
                $(container).attr({
                    "data-can-be-moved":false,
                    "data-can-be-connected":false
                });
                $(container).svg("rect",{
                    class:"main",
                    rx:1,
                    ry:1
                });
                $(container).svg("text",{text:params.name});
                break;
            case "server":
                $(container).svg("rect",{
                    class:"main",
                    rx:5,
                    ry:5
                });
                $(container).svg("text",{class:"caption"});
                $(container).svg("use",{
                    class:"element-type",
                    "href":"#temp-serv"
                });
                $(container).svg("text",{class:"name"});
                $(container).svg("text",{class:"ip"});
                break;
            case "element":
                $(container).svg("rect",{
                    class:"main",
                    rx:10,
                    ry:10
                });
                $(container).svg("text",{class:"caption"});
                if($.pagenotation()!="bpmn"){
                    $(container).svg("use",{
                        class:"element-type"
                    });
                }
                if ($.pagemenuname()!="business") {
                    $(container).svg("rect",{
                        class:"valuestream",
                        rx:4,
                        ry:4,
                        width:13,
                        height:19,
                    });
                    $(container).svg("text",{
                        class:"valuestream",
                    });
                }
                if(params.datatype3=="template"){
                    $(container).svg("text",{
                        class:"templateparams",
                    });
                }
                if (params.metrics) {
                    $.each(params.metrics, function (i, e) {
                        $(container).removeAttr("metric-" + e.alias);
                        if ($.isnull(e.alias, "") != "" && $.isnull(e.value,"")!="") {
                            $(container).attr("metric-" + e.alias, e.value);
                        }
                    });
                }
                break;
            case "cluster":
                $(container).attr({
                    "data-can-be-moved":false,
                    "data-can-be-connected":false
                });
                $(container).svg("rect",{
                    class:"main",
                    rx:5,
                    ry:5
                });
                $(container).svg("text",{class:"caption"});
                $(container).svg("use",{
                    class:"element-type",
                    "href":"#temp-system"
                });
                $(container).svg("use",{class:"copytype"});
                $(container).svg("use",{class:"clustertype"});
                $(container).svg("rect",{
                    class:"storeclass",
                    rx:4,
                    ry:4,
                    width:13,
                    height:19
                });
                $(container).svg("text",{
                    class:"storeclass",
                });
                break;
            case "picture":
                if($.pagenotation()=="bpmn"){
                    $(container).svg("rect",{
                        class:"main",
                        rx:5,
                        ry:5
                    });
                    $(container).svg("text",{text:params.description});
                    $(container).svg("use",{
                        "href":"#temp-usertask"
                    });
                }
                else{
                    $(container).svg("rect",{
                        class:"main",
                        x:1,
                        y:1
                    });
                    $(container).svg("image",{
                        y:9,
                        width:"100%"
                    });
                }
                break;
            case "data":
                $(container).svg("rect",{
                    class:"rect-data",
                    rx:"50%",
                    ry:5
                });
                $(container).svg("ellipse",{
                    class:"rect-data",
                    ry:5
                });
                break;
            case "linedata":
                $(container).svg("path");
                linkcontainer = $.svg("text",{
                    class:"line-data",
                    "data-type":"linedatatext",
                    "data-parent":params.id
                });
                break;
            case "legend":
                $(container).attr({
                    "data-can-be-sized":false,
                    "data-can-be-connected":false
                });
                $(container).svg("rect",{
                    class:"main",
                    x:2,
                    y:2,
                    rx:10,
                    ry:10
                });
                $(container).svg("text",{text:params.name});
            break;
        }
        if(linkcontainer){
            $(place).append(linkcontainer);
        }
        
        //if(canOperate())
            $(container).logicOn();
        $(container).logicset($.extend(params,{nosetposition:nosetposition}));
    }    
    else{
        // проверяем наличие данных для view
        if(isemptyobject(parammenu)){
            $("#" + params.id).remove();
        }
        else{
            $(container).attr({
                "data-type3":params.datatype3
            });
            $(container).logicset($.extend(params,{stopPropagation:false,nomoveneighbors:true,nosetposition:nosetposition}));
        }
    }

    if(noupdatechildren) return;
    var list=[];
    $.each($.storekeys(),function(i,id){
        var p = $.storeget(id);
        if(id!=params.id){
            if(p.container == params.id && $.hasviewpageparam(p,$.pagemenu())){
                //$("#" + id).remove();
                if(!params.cancontain)
                {
                    delete p.container;
                    storedirectlyset(p.id,p,undefined,false);
                }
                list.push(p);
            }
        }
    });
    $.each(list.sort(function(a,b){
        return $.logicsort(a,b);
    }),function(i,e){
        storeupdate(e);
    });
}
$.logicsort = function(a,b){
    let aw = logicGetWeight(a);
    let bw = logicGetWeight(b);
    if(aw<bw) return -1;
    if(aw>bw) return 1;

    var av=getInt($.getviewpageparam(a).order);
    var bv=getInt($.getviewpageparam(b).order);
    if(av<bv) return -1;
    if(av>bv) return 1;
    return 0;
}
var logicGetWeight = function(e){
    switch(e.datatype){
        case "datacenter":
            return 1;
        case "zone":
            return 2;
        case "cluster":
            return 3;
        case "server":
            return 4;
        case "comment":
            return ($.pagemenuname()=="business"?10:10);
        case "line":
            return (e.datatype2=="simple"|| e.datatype2=="direct"?10:7);
        case "linedata":
            return 8;
        case "picture":
            return 6;
        default:
            return 5;//6;
    }
}
var pagemenuCanContainsLogic=function(datatype,pagemenuname){
    if(!pagemenuname) pagemenuname=$.pagemenuname();
    switch(datatype){
        case "datacenter":
        case "cluster":
        case "server":
            return ("function".indexOf(pagemenuname)!=-1);
        case "zone":
            return ("interface,system,function".indexOf(pagemenuname)!=-1);
        case "legend":
        case "element":
        case "line":
        case "comment":
        case "picture":
            return true;
        case "start-process":
        case "clock-start":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
        case "subprocess":
        case "function":
        case "functionstep":
        case "linedata":
        case "data":
        case "linedatatext":
            return ("business".indexOf(pagemenuname)!=-1)
        default:
            return false;
    }
}
$.logicdomsortelements = function(elementsselector,manipulatefunc,comparefunc,ascending=true){
    $.each(
        Array.from(elementsselector).sort(
            (a,b)=>(ascending?1:-1)*(comparefunc($(a))-comparefunc($(b)))
        ),
        function(i,e){
            manipulatefunc(e);
        }
    );
}
$.logicaddswimline = function(params){
    if($.pagenotation()=="bpmn")
        $.logicaddswimlinevertical(params)
    else
        $.logicaddswimlinegorizontal(params);

}
$.logicaddswimlinevertical = function(params){
    const sortElements = function(){
        $.logicdomsortelements(
            $("svg[data-type='document']").children("[data-type='element']"),
            (e) => $(e).insertAfter("#gridRec"),
            (e) => e.attr("y"),
            false,
        );
    }
    if(params.datatype!="element" || $.pagemenuname()!="business")
        return;
    if(!params.viewdata)
        params.viewdata = {};
    let parammenu=$.getviewpageparam(params,$.pagemenu());
    var x=getFloat(parammenu.x),y=getFloat(parammenu.y),
        h=(parammenu.w?getFloat(parammenu.h):$.logicMinHeight("element")),
        w=(parammenu.w?getFloat(parammenu.w):$.logicMinWidth("element"));
    // сортировка всех элементов в DOM по Y-координате
    sortElements();
    var last = $("svg[data-type='document']").children("[data-type='element']").last();
    if(last.length>0){
        let lp = $(last).getviewpageparam();
        var delta=1;
        if(!isemptyobject(lp)){
            x=getFloat(lp.x),
            y=getFloat(lp.y)+getFloat(lp.h)+delta;
            w=getFloat(lp.w);
        }
    } 
    else {
        // добавился первый элемент, ставим по центру
        //var place=$("svg[data-type='document']");
        /*var vb=$(place).svgviewbox();
        var x1=getFloat(vb[2]);
        var y1=getFloat(vb[3]);

        var dx=x1-(propertyPage?getFloat($(propertyPage).css("width")):0)/svgMultuplX- svgOffsetX/svgMultuplX;
        var dy=y1-(outputPage?getFloat($(outputPage).css("height")):0)/svgMultuplY - svgOffsetY/svgMultuplY;
        dx=(dx-w*svgMultuplX)/2;
        dy=(dy-h*svgMultuplY)/2;

        $(place).svgviewbox(-dx,-dy,x1,y1);*/
    }
    params.viewdata[$.pagemenu()] = {
        order:$("svg[data-type='document']").lastentityindex(),   
        x:x,
        y:y,
        w:w,
        h:h
    };
    $.storeset(params);
    // сортировка после $.storeset, т.к. последний включает storeupdate -> $.fn.logic -> $.fn.logicset
    if(last.length>0){
        sortElements();
    }
    else{
        var place=$("svg[data-type='document']");
        $(place).svgfitcanvas();
    }
}
$.logicaddswimlinegorizontal = function(params){
    const sortElements = function(){
        $.logicdomsortelements(
            $("svg[data-type='document']").children("[data-type='element']"),
            (e) => $(e).insertAfter("#gridRec"),
            (e) => e.attr("x"),
            false,
        );
    }
    if(params.datatype!="element" || $.pagemenuname()!="business")
        return;
    if(!params.viewdata)
        params.viewdata = {};
    let parammenu=$.getviewpageparam(params,$.pagemenu());
    var x=getFloat(parammenu.x),y=getFloat(parammenu.y),h=(parammenu.w?getFloat(parammenu.h):$.logicMinHeight("element")),w=(parammenu.w?getFloat(parammenu.w):$.logicMinWidth("element"));
    // сортировка всех элементов в DOM по X-координате
    sortElements();
    var last = $("svg[data-type='document']").children("[data-type='element']").last();
    if(last.length>0){
        let lp = $(last).getviewpageparam();
        var delta=1;
        if(!isemptyobject(lp)){
            x=getFloat(lp.x)+getFloat(lp.w)+delta,
            y=getFloat(lp.y);
            h=getFloat(lp.h);
        }
    } 
    else {
        // добавился первый элемент, ставим по центру
        //var place=$("svg[data-type='document']");
        /*var vb=$(place).svgviewbox();
        var x1=getFloat(vb[2]);
        var y1=getFloat(vb[3]);

        var dx=x1-(propertyPage?getFloat($(propertyPage).css("width")):0)/svgMultuplX- svgOffsetX/svgMultuplX;
        var dy=y1-(outputPage?getFloat($(outputPage).css("height")):0)/svgMultuplY - svgOffsetY/svgMultuplY;
        dx=(dx-w*svgMultuplX)/2;
        dy=(dy-h*svgMultuplY)/2;

        $(place).svgviewbox(-dx,-dy,x1,y1);*/
    }
    params.viewdata[$.pagemenu()] = {
        order:$("svg[data-type='document']").lastentityindex(),   
        x:x,
        y:y,
        w:w,
        h:h
    };
    $.storeset(params);
    // сортировка после $.storeset, т.к. последний включает storeupdate -> $.fn.logic -> $.fn.logicset
    if(last.length>0){
        sortElements();
    }
    else{
        var place=$("svg[data-type='document']");
        $(place).svgfitcanvas();
    }
}
$.fn.logicgetlastofswimline = function(){
    if($.pagenotation()=="bpmn")
        return $(this).logicgetlastofswimlinevertical();
    else
        return $(this).logicgetlastofswimlinegorizontal();
}
$.fn.logicgetlastofswimlinevertical = function(){
    let place = this;
    let maxx=0;
    let afterel;
    $(place).find("svg[data-type2='logic']:not([data-type='picture'])").each(function (fi, fe){
        let _x = getFloat($(fe).attr("x")) + getFloat($(fe).attr("width"));
        if(_x>maxx){
            maxx=_x;
            afterel = fe;
        }
    });
    return $(afterel);
}
$.fn.logicgetlastofswimlinegorizontal = function(){
    let place = this;
    let maxy=0;
    let afterel;
    $(place).find("svg[data-type2='logic']:not([data-type='picture'])").each(function (fi, fe){
        let _y = getFloat($(fe).attr("y")) + getFloat($(fe).attr("height"));
        if(_y>maxy){
            maxy=_y;
            afterel = fe;
        }
    });
    return $(afterel);
}
$.fn.logicaddtoswimline = function(params, afterel, floating, casetext){
    if($.pagenotation()=="bpmn")
        return $(this).logicaddtoswimlinevertical(params, afterel, floating, casetext);
    else
        return $(this).logicaddtoswimlinegorizontal(params, afterel, floating, casetext);
}
$.fn.logicaddtoswimlinevertical = function(params, afterel, floating, casetext){
    let place = this;
    floating = $.isempty(floating)?"down":floating;
    if(!afterel || $(afterel).attr("data-container")!=$(place).prop("id") && floating.split(',').find(e=>(e=="down"))!=undefined){
        let maxx=(!afterel?0:getFloat($(afterel).attr("x")) + getFloat($(afterel).attr("width")));
        $(place).find("svg[data-type2='logic']").each(function (fi, fe){
            let _x = getFloat($(fe).attr("x")) + getFloat($(fe).attr("width"));
            if(_x>maxx){
                maxx=_x;
                afterel = fe;
            }
        });
    }
    let viewdata = {};
    viewdata[$.pagemenu()]={
        order:$(place).lastentityindex(),                                    
        x:0,
        y:0,
    };
    const newId = $.newguid();
    const containerId = $(place).prop("id");
    $.storeset($.extend(params,{
        id:newId,
        sysid:params.id,
        container:containerId,
        viewdata:viewdata
    }));
    switch(params.datatype){
        case "function":
            var p = $(place).storeget();
            if(!p.functions) p.functions=[];
            let f=p.functions.find(item=>(params.name.toLowerCase()==item.name.toLowerCase()));
            if(!f || f.length == 0){
                p.functions.push(params);
            }
            if(params.data){
                if(!p.data) p.data=[];
                params.data.forEach(d => {
                    let f = p.data.find(item=>(d.name.toLowerCase()==item.name.toLowerCase()));
                    if(!f || f.length == 0){
                        p.data.push(d);
                    }
                });
            }
            storedirectlyset(p.id,p);
            break;
    }

    // ФА: позиционирование относительно предыдущего
    const rect = $("#" + newId);
    let y = (getFloat($(place).attr("height"))-$.logicMinHeight(params.datatype))/2;
    let x=50;
    if(afterel) {
        x = getFloat($(afterel).attr("x")) + getFloat($(afterel).attr("width")) + ($(afterel).attr("data-container")==$(place).prop("id")?(casetext && casetext!=""?200:50):80);
        if(floating.split(',').find(e=>(e=="up")))
            x = getFloat($(afterel).attr("x")) - getFloat($(rect).attr("width")) - ($(afterel).attr("data-container")==$(place).prop("id")?50:80);
        if(floating.split(',').find(e=>(e=="middle")))
            x = getFloat($(afterel).attr("x")) + (getFloat($(afterel).attr("width"))- getFloat($(rect).attr("width")))/2;

        if($(afterel).attr("data-container")==$(place).prop("id")){
            y = getFloat($(afterel).attr("y")) + (getFloat($(afterel).attr("height")) - getFloat($(rect).attr("height")))/2;
            if(floating.split(',').find(e=>(e=="left"))){
                y = getFloat($(afterel).attr("y")) - getFloat($(rect).attr("height")) - (params.datatype=="data"?0:getFloat($(rect).attr("height"))/3);
            }
            if(floating.split(',').find(e=>(e=="right"))){
                y = getFloat($(afterel).attr("y")) + getFloat($(afterel).attr("height")) + (params.datatype=="data"?0:getFloat($(rect).attr("height"))/3);
            }
        }
    }
    // ФА: увеличение ширины элементов при добавлении
    const pm = $.pagemenu();
    const cvp = $.getviewpageparam($.storeget(containerId),$.pagemenu());
    const w = getFloat($(rect).attr("width"));
    let h = y + getFloat($(rect).attr("height")) + 10;

    $(rect).linesubstratebyelement(false);
    if(y < 10){
        $(rect).logicMove({x:x,y:10});
        h = getFloat($(rect).attr("height")) + 20;
        $(place).find("svg[data-type2='logic']").each(function(i,e){
            if($(e).prop("id")!=newId){
                h = Math.max(h, getFloat($(e).attr("y")) + 10-y +  getFloat($(e).attr("height")) + 10);
                $(e).linesubstratebyelement(false);
                $(e).logicMove({dy:10-y});
                let p1 = $(e).storeget();
                let vp1 = $.getviewpageparam(p1,pm);
                vp1.y = getFloat($(e).attr("y"));
                $(e).setviewpageparam(vp1); // store update
                $(e).linesubstratebyelement();
            }
        });

        y=10;
    }
    else
        $(rect).logicMove({x:x,y:y});
    $(rect).linesubstratebyelement();

    let rectp = $(rect).storeget();
    let rectvp = $.getviewpageparam(rectp,pm);
    rectvp.x = x;
    rectvp.y = y;
    $(rect).setviewpageparam(rectvp); // store update

    if(h>getFloat(cvp.h)){
        $(place).logicMove({
            h:h,
            dt:"el"
        });
        const p = $(place).storeget();
        const vp = $.getviewpageparam(p,pm);
        vp.h = h;
        $(place).setviewpageparam(vp); // store update
        $(place).nextAll().filter("svg[data-type='element']").each(function(i,e){
            $(e).setviewpageparam({
                y:$(e).attr("y")
            });
        });
        $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
            if(getFloat($(e).attr("y"))>getFloat(cvp.h)){
                $(e).setviewpageparam({
                    y:getFloat($(e).attr("y"))
                }); // store update
            }
        });
    }
    const cw = getFloat(cvp.w);
    if ((w + x) > cw) {
        let wt = w + x + 25;
        $("svg[data-type='element']").each(function(i,e){
            $(e).linesubstratebyelement(false);
            $(e).logicMove({w:wt}); // visual update
            const p = $(e).storeget();
            const vp = $.getviewpageparam(p,pm);
            vp.w = wt;
            $(e).setviewpageparam(vp); // store update
            $(e).linesubstratebyelement();
        })
    }
    return newId;
}
$.fn.logicaddtoswimlinegorizontal = function(params, afterel, floating, casetext){
    let place = this;
    floating = $.isempty(floating)?"down":floating;
    if(!afterel || $(afterel).attr("data-container")!=$(place).prop("id") && floating.split(',').find(e=>(e=="down"))!=undefined){
        let maxy=(!afterel?0:getFloat($(afterel).attr("y")) + getFloat($(afterel).attr("height")));
        $(place).find("svg[data-type2='logic']").each(function (fi, fe){
            let _y = getFloat($(fe).attr("y")) + getFloat($(fe).attr("height"));
            if(_y>maxy){
                maxy=_y;
                afterel = fe;
            }
        });
    }
    let viewdata = {};
    viewdata[$.pagemenu()]={
        order:$(place).lastentityindex(),                                    
        x:0,
        y:0,
    };
    const newId = $.newguid();
    const containerId = $(place).prop("id");
    $.storeset($.extend(params,{
        id:newId,
        sysid:params.id,
        container:containerId,
        viewdata:viewdata
    }));
    switch(params.datatype){
        case "function":
            var p = $(place).storeget();
            if(!p.functions) p.functions=[];
            let f=p.functions.find(item=>(params.name.toLowerCase()==item.name.toLowerCase()));
            if(!f || f.length == 0){
                p.functions.push(params);
            }
            if(params.data){
                if(!p.data) p.data=[];
                params.data.forEach(d => {
                    let f = p.data.find(item=>(d.name.toLowerCase()==item.name.toLowerCase()));
                    if(!f || f.length == 0){
                        p.data.push(d);
                    }
                });
            }
            storedirectlyset(p.id,p);
            break;
    }

    // ФА: позиционирование относительно предыдущего
    const rect = $("#" + newId);
    let x = (getFloat($(place).attr("width"))-$.logicMinWidth(params.datatype))/2;
    let y=50;
    if(afterel) {
        y = getFloat($(afterel).attr("y")) + getFloat($(afterel).attr("height")) + ($(afterel).attr("data-container")==$(place).prop("id")?(casetext && casetext!=""?130:40):60);
        if(floating.split(',').find(e=>(e=="up")))
            y = getFloat($(afterel).attr("y")) - getFloat($(rect).attr("height")) - ($(afterel).attr("data-container")==$(place).prop("id")?40:60);
        if(floating.split(',').find(e=>(e=="middle")))
            y = getFloat($(afterel).attr("y")) + (getFloat($(afterel).attr("height"))- getFloat($(rect).attr("height")))/2;

        if($(afterel).attr("data-container")==$(place).prop("id")){
            x = getFloat($(afterel).attr("x")) + (getFloat($(afterel).attr("width")) - getFloat($(rect).attr("width")))/2;
            if(floating.split(',').find(e=>(e=="left"))){
                x = getFloat($(afterel).attr("x")) - getFloat($(rect).attr("width")) - (params.datatype=="data"?0:getFloat($(rect).attr("width"))/3);
            }
            if(floating.split(',').find(e=>(e=="right"))){
                x = getFloat($(afterel).attr("x")) + getFloat($(afterel).attr("width")) + (params.datatype=="data"?0:getFloat($(rect).attr("width"))/3);
            }
        }
    }
    // ФА: увеличение высоты элементов при добавлении
    const pm = $.pagemenu();
    const cvp = $.getviewpageparam($.storeget(containerId),$.pagemenu());
    const h = getFloat($(rect).attr("height"));
    let w = x + getFloat($(rect).attr("width")) + 10;

    $(rect).linesubstratebyelement(false);
    if(x < 10){
        $(rect).logicMove({x:10,y:y});
        w = getFloat($(rect).attr("width")) + 20;
        $(place).find("svg[data-type2='logic']").each(function(i,e){
            if($(e).prop("id")!=newId){
                w = Math.max(w, getFloat($(e).attr("x")) + 10-x +  getFloat($(e).attr("width")) + 10);
                $(e).linesubstratebyelement(false);
                $(e).logicMove({dx:10-x});
                let p1 = $(e).storeget();
                let vp1 = $.getviewpageparam(p1,pm);
                vp1.x = getFloat($(e).attr("x"));
                $(e).setviewpageparam(vp1); // store update
                $(e).linesubstratebyelement();
            }
        });

        x=10;
    }
    else
        $(rect).logicMove({x:x,y:y});
    $(rect).linesubstratebyelement();

    let rectp = $(rect).storeget();
    let rectvp = $.getviewpageparam(rectp,pm);
    rectvp.x = x;
    rectvp.y = y;
    $(rect).setviewpageparam(rectvp); // store update

    if(w>getFloat(cvp.w)){
        $(place).logicMove({
            w:w,
            dt:"el"
        });
        const p = $(place).storeget();
        const vp = $.getviewpageparam(p,pm);
        vp.w = w;
        $(place).setviewpageparam(vp); // store update
        $(place).nextAll().filter("svg[data-type='element']").each(function(i,e){
            $(e).setviewpageparam({
                x:$(e).attr("x")
            });
        });
        $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
            if(getFloat($(e).attr("x"))>getFloat(cvp.w)){
                $(e).setviewpageparam({
                    x:getFloat($(e).attr("x"))
                }); // store update
            }
        });
    }
    const ch = getFloat(cvp.h);
    if ((h + y) > ch) {
        let ht = h + y + 25;
        $("svg[data-type='element']").each(function(i,e){
            $(e).linesubstratebyelement(false);
            $(e).logicMove({h:ht}); // visual update
            const p = $(e).storeget();
            const vp = $.getviewpageparam(p,pm);
            vp.h = ht;
            $(e).setviewpageparam(vp); // store update
            $(e).linesubstratebyelement();
        })
    }
    return newId;
}
$.fn.logicsave = function(){
    var container=this;
    $(container).setviewpageparam({
        x:$(container).attr("x"),
        y:$(container).attr("y"),
        w:$(container).attr("width"),
        h:$(container).attr("height"),
        d:$(container).attr("data-divider")
    });
    var params=$(container).storeget();
    params=$(container).logiccross(params);
    params=$(container).logiczone(params);
    params=$(container).logicname(params);
    params=$(container).logicinclude(params);
}
$.fn.logicMouseDown=function(event){
    if(logicFn=="context-menu"){
        $(this).logicCaptionMouseDown(event);
        return;
    }
    var container = this;
    if(logicFn=="default" || logicFn=="hand"){ 
        if(!((canvasFn=="default" || canvasFn=="hand") && ($(container).attr("data-can-be-moved")=="true" || window.event.ctrlKey || window.event.shiftKey))){
        //if($(container).attr("data-can-be-moved")!="true" && !window.event.ctrlKey && !window.event.shiftKey){
            logicFn="default";
            if(canvasFn=="hand")
                $(container).cursor("grabbing");
            if(/*$(container).attr("data-type3")=='collaboration' ||*/ $.pagemenuname()=="business"){
                onhoverElement = container;
            }
            $(container).select(event);
            return;
        }
        else{
            logicFn="hand";
            $(container).cursor(lineFn);
        }
    }
    event.stopPropagation();
    var place = $("svg[data-type='document']")[0];//$(container).parent()[0];
    if(event.button!=0){
        // зажата правая клавиша
        $(place).trigger("mouseup");
        return;
    }
    var id=$(container).prop("id");
    $(container).select(event);
    $.logicOff();
    $.lineOff();        
    $.linetextOff();
    $(container).linesubstratebyelement(false);
    $.getselected().each(function(i,e){
        if($(e).attr("data-type2")=="logic" && $(e).prop("id")!=id){
            $(e).linesubstratebyelement(false);
        }
    });
    if($.pagemenuname()=="business"){
        $(container).parent().children("svg[data-type='element']").each(function(i,e){
            $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                $(e1).linesubstratebyelement(false);
            });
        });
    }

    var clientX = getFloat($(container).attr("x"));
    var clientY = getFloat($(container).attr("y"));
    var clientWidth = getFloat($(container).attr("width"));
    var clientHeight = getFloat($(container).attr("height"));
    var clientMinWidth =  $(container).logicMinWidth($(container).attr("data-type"));//getFloat($(container).attr("min-width"));//
    var clientMinHeight = $(container).logicMinHeight($(container).attr("data-type"));//getFloat($(container).attr("min-height"));//
    var clientStartX = event.clientX/svgMultuplX - clientX;
    var clientStartY = event.clientY/svgMultuplY - clientY;
    var x=clientX;
    var y=clientY;
    var height=clientHeight;
    var width=clientWidth;
    var divider = getFloat($(container).attr("data-divider"));
    var parent=$(container).attr("data-container");
    var offset=$(container).offset();
    var dividerOffset=((event.clientX - offset.left)/svgMultuplX)/width*100-divider;
    var cnt;
    if(parent){
        var c=$("#"+parent);
        cnt={
            w:getFloat($(c).attr("width")),
            h:getFloat($(c).attr("height"))
        }
    } 

    if(logicFn=="hand")
        $(container).css({cursor:"grabbing"});

    var currentlogicFN = logicFn;
    let isMoved=false;
    $(place).on("mousemove",function(event){
        if(event.buttons==0){
            // клавиша не зажата
            $(place).trigger("mouseup");
            return;
        }
        isMoved=true;
        switch(logicFn)
        {
            case "hand":
                y=event.clientY/svgMultuplY - clientStartY;
                x=event.clientX /svgMultuplX- clientStartX;
                break;
            case "se-resize":
                width=event.clientX/svgMultuplX - clientX+(clientWidth-clientStartX);
                height=event.clientY/svgMultuplY-clientY+(clientHeight-clientStartY);
                break;
            case "sw-resize":
                width=clientWidth+clientX-event.clientX/svgMultuplX+clientStartX;
                    if(width>=clientMinWidth)
                        x = event.clientX/svgMultuplX-clientStartX;
                height=event.clientY/svgMultuplY-clientY+ (clientHeight-clientStartY);
                break;
            case "nw-resize":
                width=clientWidth+clientX-event.clientX/svgMultuplX+clientStartX;
                    if(width>=clientMinWidth)
                        x = event.clientX/svgMultuplX-clientStartX;
                height=clientHeight+clientY-event.clientY/svgMultuplY+clientStartY;
                if(height>=clientMinHeight)
                    y=event.clientY/svgMultuplY-clientStartY;
                break;
            case "ne-resize":
                width=event.clientX/svgMultuplX - clientX + (clientWidth-clientStartX);
                height=clientHeight+clientY-event.clientY/svgMultuplY+clientStartY;
                if(height>=clientMinHeight)
                    y=event.clientY/svgMultuplY-clientStartY;
                break;
            case "e-resize":
                width=event.clientX/svgMultuplX - clientX + (clientWidth-clientStartX);
                break;
            case "s-resize":
                height=event.clientY/svgMultuplY-clientY+ (clientHeight-clientStartY);
                break;
            case "w-resize":
                width=clientWidth+clientX-event.clientX/svgMultuplX+clientStartX;
                if(width>=clientMinWidth)
                    x = event.clientX/svgMultuplX-clientStartX;
                break;
            case "n-resize":
                height=clientHeight+clientY-event.clientY/svgMultuplY+clientStartY;
                if(height>=clientMinHeight)
                    y=event.clientY/svgMultuplY-clientStartY;
                break;
            case "ew-resize#inner":
                var offsetX = ((event.clientX - offset.left)/svgMultuplX)/width*100;
                if(offsetX>20 && offsetX<80)
                    divider = offsetX-dividerOffset;
            break;
        }
        if(width<clientMinWidth)
            width=clientMinWidth;
        if(height<clientMinHeight)
            height=clientMinHeight;

        if(cnt){
            // находится в контейнере
            if(x<0) x=0;
            if(y<0) y=0;
            if(x+width>cnt.w) x=cnt.w-width;
            if(y+height>cnt.h) y=cnt.h-height;
        }
        var deltaX=x-getFloat($(container).attr("x"));
        var deltaY=y-getFloat($(container).attr("y"));
        $(container).logicMove({
            x:x,
            y:y,
            w:width,
            h:height,
            d:divider
        });
        $.getselected().each(function(i,e){
            if($(e).attr("data-type2")=="logic" && $(e).prop("id")!=id){
                var x=getFloat($(e).attr("x")) + deltaX;
                var y=getFloat($(e).attr("y")) + deltaY;
                $(e).logicMove({
                    x:x,
                    y:y
                });
            }
        });
    });
    $(place).on("mouseup",function(){
        event.stopPropagation();
        $(place).off("mousemove");
        $(place).off("mouseup");
        logicFn=currentlogicFN;
        $(container).cursor(logicFn);
        /*var parent=$.getincluded();
        var pp;
        var parentid;
        if(parent){
            parentid=$(parent).prop("id");
            pp=$(parent).logicGetGlobalOffset();
            $.clearincluded();
        }*/
        if(isMoved) {
            $(container).logicsave();
            if($(container).attr("data-type")=="comment"){
                var p=$(container).storeget();
                $(place).logic(p);
            }
            $(container).lineemptybyelement();
            $(container).linesavebyelement();
        }
        $(container).linesubstratebyelement();

        $.getselected().each(function(i,e){
            if($(e).attr("data-type2")=="logic" && $(e).prop("id")!=id){
                /*var x=getFloat($(e).attr("x")) + getFloat($(e).attr("width"))/2;
                var y=getFloat($(e).attr("y")) + getFloat($(e).attr("height"))/2;
                console.log(document.elementsFromPoint(x,y));*/
                if(isMoved) {
                    $(e).logicsave();
                    if($(e).attr("data-type")=="comment"){
                        var p=$(e).storeget();
                        $(place).logic(p);
                    }
                    $(e).lineemptybyelement();
                    $(e).linesavebyelement();
                }
                /*if(parent){
                    var p=$(e).storeget();
                    var pm=$(e).logicGetGlobalOffset();
                    p.container=parentid;
                    var pm1 = $.getviewpageparam(p);
                    pm1.order=$(parent).lastentityindex();
                    storedirectlyset(p.id,p);

                    var last = $(parent).children("[data-type]").last();
                    if(last.length>0)
                        $(last).after(e);
                    else
                        $(parent).append(e);
                    $(e).attr({
                        x:pm.x-pp.x,
                        y:pm.y-pp.y,
                        "data-container":parentid
                    });
                    $(e).logicsave();
                }*/
                $(e).linesubstratebyelement();
            }
        });
        /*if(parent)
            $.propertyset(undefined,true);*/

        if($.pagemenuname()=="business"){
            $(container).parent().children("svg[data-type='element']").each(function(i,e){
                if(isMoved) {
                    $(e).setviewpageparam({
                        x:$(e).attr("x"),
                        y:$(e).attr("y"),
                        h:$(e).attr("height"),
                        w:$(e).attr("width")
                    });
                }
    
                $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                    $(e1).linesubstratebyelement();
                    $(e1).linesubstratebyelement();
                });
            });
            if(isMoved) {
                $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
                    $(e).setviewpageparam({
                        x:$(e).attr("x"),
                        y:$(e).attr("y")
                    });
                });
            }
        }
        $.logicOn();
        $.lineOn();
        $.linetextOn();
        $.historycloseputtransaction();
    });
};
$.fn.logicCaptionMouseDown = function(event){
    if($.pagenotation()=="bpmn")
        $(this).logicCaptionMouseDownVertical(event);
    else
        $(this).logicCaptionMouseDownGorizontal(event);
}
$.fn.logicCaptionMouseDownVertical = function(event){
    var container = this;
    event.stopPropagation();
    var place = $(container).parent();
    var line = $(container).find("line.position-line");
    if(line.length==0){
        line = $(container).svg("line", {
            class:"position-line"
        });
    }
    $(line).attr({
        x1:0,
        y1:0,
        x2:$(container).attr("width"),
        y1:0
    });
    $.logicOff();
    $.lineOff();
    $(place).children("svg[data-type='element']").on("mousemove",function(event){
        var line = $(this).find("line.position-line");
        if(line.length==0){
            $(place).find("line.position-line").remove();
            line = $(this).svg("line", {
                class:"position-line"
            });
            $(line).attr({
                x1:0,
                y1:0,
                x2:$(this).attr("width"),
                y1:0
            });
        }
    });
    $(place).on("mouseup",function(event){
        $(place).off("mouseup");
        $(place).children("svg[data-type='element']").off("mousemove");
        var line = $(place).find("line.position-line");
        if(line.length>0){
            var element = line.parent();
            if($(container).index()!=$(element).index()){
                var need2moveleft = $(container).index()<$(element).index();
                var epm = $(element).getviewpageparam();
                $(element).before(container);

                var x=getFloat($(container).attr("x"));
                var w=getFloat($(container).attr("width"));

                var cpm = $(container).getviewpageparam();
                var ind = getInt(epm.order);
                cpm.order=ind++;
                cpm.y=epm.y-(need2moveleft?cpm.h:0);

                $(container).logicMove({
                    x:x,
                    y:cpm.y,
                    w:w,
                    stopPropagation:true
                });
                $(container).setviewpageparam(cpm);
                $(container).find("svg[data-type]").each(function(i1,e1){
                    $(e1).lineemptybyelement();
                });
                var y=getFloat(cpm.y);
                $(container).prevAll().filter("svg[data-type='element']").each(function(i,e){
                    epm = $(e).getviewpageparam();
                    y-=getFloat(epm.h);
                    epm.y = y;
                    $(e).logicMove({
                        x:x,
                        y:epm.y,
                        w:w,
                        stopPropagation:true
                    });
                    $(e).setviewpageparam(epm);
                    $(e).find("svg[data-type]").each(function(i1,e1){
                        $(e1).lineemptybyelement();
                    });
                });
                var y=getFloat(cpm.y)+getFloat(cpm.h);
                $(container).nextAll().filter("svg[data-type='element']").each(function(i,e){
                    epm = $(e).getviewpageparam();
                    epm.order=ind++;
                    epm.y = y;
                    y+=getFloat(epm.h);
                    $(e).logicMove({
                        x:x,
                        y:epm.y,
                        w:w,
                        stopPropagation:true
                    });
                    $(e).setviewpageparam(epm);
                    $(e).find("svg[data-type]").each(function(i1,e1){
                        $(e1).lineemptybyelement();
                    });
                });
            }
            $(place).find("line.position-line").remove();
        }
        $.logicOn();
        $.lineOn();
    });
}
$.fn.logicCaptionMouseDownGorizontal = function(event){
    var container = this;
    event.stopPropagation();
    var place = $(container).parent();
    var line = $(container).find("line.position-line");
    if(line.length==0){
        line = $(container).svg("line", {
            class:"position-line"
        });
    }
    $(line).attr({
        x1:0,
        y1:0,
        x2:0,
        y1:$(container).attr("height")
    });
    $.logicOff();
    $.lineOff();
    $(place).children("svg[data-type='element']").on("mousemove",function(event){
        var line = $(this).find("line.position-line");
        if(line.length==0){
            $(place).find("line.position-line").remove();
            line = $(this).svg("line", {
                class:"position-line"
            });
            $(line).attr({
                x1:0,
                y1:0,
                x2:0,
                y1:$(this).attr("height")
            });
        }
    });
    $(place).on("mouseup",function(event){
        $(place).off("mouseup");
        $(place).children("svg[data-type='element']").off("mousemove");
        var line = $(place).find("line.position-line");
        if(line.length>0){
            var element = line.parent();
            if($(container).index()!=$(element).index()){
                var need2moveleft = $(container).index()<$(element).index();
                var epm = $(element).getviewpageparam();
                $(element).before(container);

                var y=getFloat($(container).attr("y"));
                var h=getFloat($(container).attr("height"));

                var cpm = $(container).getviewpageparam();
                var ind = getInt(epm.order);
                cpm.order=ind++;
                cpm.x=epm.x-(need2moveleft?cpm.w:0);

                $(container).logicMove({
                    x:cpm.x,
                    y:y,
                    h:h,
                    stopPropagation:true
                });
                $(container).setviewpageparam(cpm);
                $(container).find("svg[data-type]").each(function(i1,e1){
                    $(e1).lineemptybyelement();
                });
                var x=getFloat(cpm.x);
                $(container).prevAll().filter("svg[data-type='element']").each(function(i,e){
                    epm = $(e).getviewpageparam();
                    x-=getFloat(epm.w);
                    epm.x = x;
                    $(e).logicMove({
                        x:epm.x,
                        y:y,
                        h:h,
                        stopPropagation:true
                    });
                    $(e).setviewpageparam(epm);
                    $(e).find("svg[data-type]").each(function(i1,e1){
                        $(e1).lineemptybyelement();
                    });
                });
                var x=getFloat(cpm.x)+getFloat(cpm.w);
                $(container).nextAll().filter("svg[data-type='element']").each(function(i,e){
                    epm = $(e).getviewpageparam();
                    epm.order=ind++;
                    epm.x = x;
                    x+=getFloat(epm.w);
                    $(e).logicMove({
                        x:epm.x,
                        y:y,
                        h:h,
                        stopPropagation:true
                    });
                    $(e).setviewpageparam(epm);
                    $(e).find("svg[data-type]").each(function(i1,e1){
                        $(e1).lineemptybyelement();
                    });
                });
            }
            $(place).find("line.position-line").remove();
        }
        $.logicOn();
        $.lineOn();
    });
}
$.fn.logicMove = function(params){
    var container=this;
    //if($(container).attr("data-type")=="linedata") console.trace();
    //if(params.dt) debugger;
    //if($(container).prop("id")=="fa324755-1c8f-4362-8275-f7ce6516e5db") debugger;

    if(!params) params={};
    var isNullPos = (!params.x && !params.y);

    var clientMinWidth = getFloat($(container).attr("min-width"));
    var clientMinHeight = getFloat($(container).attr("min-height"));

    var oldX = getFloat($(container).attr("x"));
    var oldY = getFloat($(container).attr("y"));
    var oldWidth = getFloat($(container).attr("width"));
    var oldHeight = getFloat($(container).attr("height"));
    var oldDivider = getFloat($(container).attr("data-divider"));
    params.x=(params.x==undefined?oldX: getFloat(params.x))+(params.dx?getFloat(params.dx):0);
    params.y=(params.y==undefined?oldY: getFloat(params.y))+(params.dy?getFloat(params.dy):0);
    params.datatype = (params.datatype?params.datatype:$(container).attr("data-type"));
    params.datatype3 = (params.datatype3?params.datatype3:$(container).attr("data-type3"));


    switch(params.datatype){
        case "start-process":
        case "clock-start":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
            switch(logicFn){
                case "e-resize":
                case "w-resize":
                    params.w=(params.w==undefined?(oldWidth!=0?oldWidth:clientMinWidth):getFloat(params.w));
                    params.h=params.w;
                    break;
                default:
                    params.h=(params.h==undefined?(oldHeight!=0?oldHeight:clientMinHeight):getFloat(params.h));
                    params.w=params.h;
                    break;
            }
            break;
        case "data":
            params.w=(params.w==undefined?(oldWidth!=0?oldWidth:clientMinWidth):getFloat(params.w));
            params.h=0;// autoheigth getFloat(params.h);
            break;
        default:
            if((params.w==undefined && oldWidth==0) || (params.h==undefined && oldHeight==0) || params.autosize){
                var delta=2;
                let fx = 0;
                $(container).find("g.element-function, g.element-system").find("text").each(function(i,text){
                    var textsize = $(text).txtoptlen();//$(text).txtwrap(params.x+delta,0);
                    let f = textsize.aw+$.logicImageSize(params.datatype)+2*delta;
                    if(f>fx) fx=f;
                });
                let dx = 0;
                $(container).find("g.element-data, g.element-datasystem").find("text").each(function(i,text){
                    var textsize = $(text).txtoptlen();//$(text).txtwrap(params.x+delta,0);
                    let d = textsize.aw+$.logicImageSize(params.datatype)+2*delta;
                    if(d>dx) dx=d;
                });
                if(dx==0) fx*=1.5;                
                let text = $(container).children("text:not([class]), text.caption");
                if(text.length>0){
                    var textsize = $(text).txtoptlen(17);//$(text).txtwrap(3*delta+2,(params.w==undefined?0:params.w-$.logicImageSize(params.datatype)-7*delta));
                    oldWidth = textsize.aw;
                    if(params.w==undefined) params.w=textsize.aw;
                    if(fx+dx==0) oldWidth = (textsize.h+textsize.w)*0.7;
                    oldWidth += $.logicImageSize(params.datatype)+7*delta+3*delta+2;
                    if(fx+dx+2*delta>oldWidth) oldWidth=fx+dx+4*delta;
                    //console.log(textsize, oldWidth, fx,dx);

                    textsize = $(text).txtwrap(3*delta+2,(params.w-$.logicImageSize(params.datatype)-7*delta));
                    oldHeight = textsize.h+2*delta;
                }
                //console.log(fx,dx,oldWidth);
                params.autosize=true;
            }
            params.w=(params.w==undefined || params.autosize?(oldWidth!=0?oldWidth:clientMinWidth):getFloat(params.w));
            params.h=(params.datatype=="zone" && $.pagemenuname()=="function"?0:(params.h==undefined?(oldHeight!=0?oldHeight:clientMinHeight):getFloat(params.h)));
            params.d=(params.d==undefined?(oldDivider!=0?oldDivider:0):getFloat(params.d));
            break;
    }


    if(params.w<clientMinWidth)
        params.w=clientMinWidth;
    if(params.h<clientMinHeight && params.datatype!="data")
        params.h=clientMinHeight;
    if($(container).attr("data-container")){
        if(params.x<0) params.x=0
        if(params.y<0) params.y=0;
    }
    // перерисовка внутренних компонентов
    if(oldWidth!=params.w || oldHeight!=params.h || oldDivider!=params.d || params.reload || params.autosize ){
        params = $(container).logicarrange(params);
    }

    switch(params.datatype){
        case "data":
            if(isNullPos){
                var p = $(container).storeget();
                if(p.parentel){
                    var parentparammenu = $.getviewpageparam($.storeget(p.parentel));
                    if(params.x==0)
                        params.x=getFloat(parentparammenu.x)+getFloat(parentparammenu.w)-20;
                    if(params.y==0)
                        params.y=getFloat(parentparammenu.y)-getFloat(params.h)-20;
                }
            }
            break;
        case "linedata":
            //console.trace();

            if((getFloat(params.x)==0 || getFloat(params.y)==0)){
                var p = $(container).storeget();
                if(p.parentel){
                    var line = $.storeget(p.parentel);
                    var rect = $.linegetbox(line);
                    if(getFloat(params.x)==0){
                        if(line.startel){
                            var startel=$("#" + line.startel);
                            if(startel.length>0){
                                params.x=getFloat($(startel).attr("x")) + (getFloat($(startel).attr("width"))-params.w)/2;
                                var parent = $("#" + $(startel).storeget().container);
                                if(parent.length>0)
                                    params.x+= getFloat($(parent).attr("x"));
                            }
                            else
                                params.x=rect.x-params.w/2;
                        }
                        else
                            params.x=rect.x-params.w/2;
                    }
                    if(getFloat(params.y)==0){
                        if(line.endel){
                            var endel=$("#" + line.endel);
                            if(endel.length>0){
                                params.y=getFloat($(endel).attr("y")) + (getFloat($(endel).attr("height"))-params.h)/2;
                                var parent = $("#" + $(endel).storeget().container);
                                if(parent.length>0)
                                    params.y+= getFloat($(parent).attr("y"));
                            }
                            else
                                params.y=rect.y+rect.height-params.h/2;
                        }
                        else
                            params.y=rect.y+rect.height-params.h/2;
                    }
                }
            }
            var txt = $(container).parent().find("text[data-type='linedatatext'][data-parent='" + $(container).prop("id") + "']");
            var p = $(txt).txtwrap(params.x-params.w/2, params.w*2,"center");
            $(txt).attr({
                x:params.x-(params.w)/2,
                y:params.y+(params.h-p.h)/2 + 10,
                width:params.w*2,
                height:p.h
            });
            break;
    }
    $(container).attr({
        x:params.x,
        y:params.y,
        width:params.w,
        height:params.h,
        "data-divider":params.d
    });
    if(!params.stopPropagation){
        if($.pagemenuname()=="business" && params.datatype=="element" && !params.nomoveneighbors){
            $(container).moveneighbors($.extend(params,{
                dx:params.x-oldX,
                dy:params.y-oldY,
                dw:params.w-oldWidth-(oldX-params.x),
                dh:params.h-oldHeight-(oldY-params.y)
            }));
        }
        else{
            if($.pagemenuname()=="function" && params.datatype=="picture")
                $(container).linecalculatebyelement();
            else{
                $(container).linemovebyelement(params.x-oldX,params.y-oldY, params.w-oldWidth-(oldX-params.x), params.h-oldHeight-(oldY-params.y));
            }
        }
    }

}
$.fn.logicMoveAll= function(params){
    var selected = this;
    $.logicOff();
    $.lineOff();        
    $.linetextOff();
    $(selected).each(function(i,e){
        if($(e).attr("data-type2")=="logic"){
            $(e).linesubstratebyelement(false);
            $(e).logicMove({
                x:getFloat($(e).attr("x"))+getFloat(params.dx),
                y:getFloat($(e).attr("y"))+getFloat(params.dy)
            });
            $(e).logicsave();
            if($(e).attr("data-type")=="comment"){
                var p=$(e).storeget();
                $(place).logic(p);
            }
            $(e).lineemptybyelement();
            $(e).linesavebyelement();
            $(e).linesubstratebyelement();
        }
    });
    $.logicOn();
    $.lineOn();
    $.linetextOn();
    $.historycloseputtransaction();

}
$.fn.moveneighbors = function(params){
    if($.pagenotation()=="bpmn")
        $(this).moveneighborsvertical(params);
    else
        $(this).moveneighborsgorizontal(params);
}
$.fn.moveneighborsvertical=function(params){
    var container=this;
    $(container).find("svg[data-type2='logic']").each(function(i1,e){
        $(e).lineemptybyelement();
    });
    var delta=1;
    if(params.dx || params.dy || params.dw){
        var start=params.y-delta;
        $(container).prevAll().filter("svg[data-type='element']").each(function(i,e){
            var parammenu=$(e).getviewpageparam();
            $(e).logicMove({
                x:params.x,
                y:start-getFloat(parammenu.h),
                w:params.w,
                stopPropagation:true
            });
            $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                $(e1).lineemptybyelement();
            });
            /*$(e).setviewpageparam({
                x:start-getFloat(parammenu.w),
                y:params.y,
                h:params.h
            });*/
            start-=(getFloat(parammenu.h) +delta);
        });
    }
    if(params.dw || params.dx || params.dh){
        var start=params.y+params.h+delta;
        $(container).nextAll().filter("svg[data-type='element']").each(function(i,e){
            var parammenu=$(e).getviewpageparam();
            $(e).logicMove({
                x:params.x,
                y:start,
                w:params.w,
                stopPropagation:true
            });
            $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                $(e1).lineemptybyelement();
            });
            /*$(e).setviewpageparam({
                x:start,
                y:params.y,
                h:params.h
            });*/
            start+=(getFloat(parammenu.h)+delta);
        });
    }
    if(params.dx || params.dy){
        var x=getFloat($(container).attr("x"))+getFloat($(container).attr("width"));
        $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
            //debugger;
            var parammenu={
                x:getFloat($(e).attr("x")),
                y:getFloat($(e).attr("y")),
                w:getFloat($(e).attr("width"))
            };//$(e).getviewpageparam();
            if(y-params.dy<=parammenu.y+parammenu.h){
                $(e).logicMove({
                    x:parammenu.x+params.dx,
                    y:parammenu.y+params.dy,
                    stopPropagation:true
                });
                $(e).lineemptybyelement();
                /*$(e).setviewpageparam({
                    x:getFloat(parammenu.x)+params.dx,
                    y:getFloat(parammenu.y)+params.dy
                });*/
            }
        });
    }
    if(params.dh || params.dx){
        var y=getFloat($(container).attr("y"))+getFloat($(container).attr("height"));
        $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
            //debugger;
            var parammenu={
                x:getFloat($(e).attr("x")),
                y:getFloat($(e).attr("y")),
                h:getFloat($(e).attr("height"))
            };//$(e).getviewpageparam();
            if(y-params.dh<=parammenu.y+parammenu.h){
                $(e).logicMove({
                    x:parammenu.x+params.dw,
                    y:parammenu.y+params.dy,
                    stopPropagation:true
                });
                $(e).lineemptybyelement();
                /*$(e).setviewpageparam({
                    x:getFloat(parammenu.x)+params.dw,
                    y:getFloat(parammenu.y)+params.dy
                });*/
            }
        });
    }
}
$.fn.moveneighborsgorizontal=function(params){
    var container=this;
    $(container).find("svg[data-type2='logic']").each(function(i1,e){
        $(e).lineemptybyelement();
    });
    var delta=1;
    if(params.dx || params.dy || params.dh){
        var start=params.x-delta;
        $(container).prevAll().filter("svg[data-type='element']").each(function(i,e){
            var parammenu=$(e).getviewpageparam();
            $(e).logicMove({
                x:start-getFloat(parammenu.w),
                y:params.y,
                h:params.h,
                stopPropagation:true
            });
            $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                $(e1).lineemptybyelement();
            });
            /*$(e).setviewpageparam({
                x:start-getFloat(parammenu.w),
                y:params.y,
                h:params.h
            });*/
            start-=(getFloat(parammenu.w) +delta);
        });
    }
    if(params.dw || params.dy || params.dh){
        var start=params.x+params.w+delta;
        $(container).nextAll().filter("svg[data-type='element']").each(function(i,e){
            var parammenu=$(e).getviewpageparam();
            $(e).logicMove({
                x:start,
                y:params.y,
                h:params.h,
                stopPropagation:true
            });
            $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                $(e1).lineemptybyelement();
            });
            /*$(e).setviewpageparam({
                x:start,
                y:params.y,
                h:params.h
            });*/
            start+=(getFloat(parammenu.w)+delta);
        });
    }
    if(params.dx || params.dy){
        var x=getFloat($(container).attr("x"))+getFloat($(container).attr("width"));
        $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
            //debugger;
            var parammenu={
                x:getFloat($(e).attr("x")),
                y:getFloat($(e).attr("y")),
                w:getFloat($(e).attr("width"))
            };//$(e).getviewpageparam();
            if(x-params.dx<=parammenu.x+parammenu.w){
                $(e).logicMove({
                    x:parammenu.x+params.dx,
                    y:parammenu.y+params.dy,
                    stopPropagation:true
                });
                $(e).lineemptybyelement();
                /*$(e).setviewpageparam({
                    x:getFloat(parammenu.x)+params.dx,
                    y:getFloat(parammenu.y)+params.dy
                });*/
            }
        });
    }
    if(params.dw || params.dy){
        var x=getFloat($(container).attr("x"))+getFloat($(container).attr("width"));
        $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
            //debugger;
            var parammenu={
                x:getFloat($(e).attr("x")),
                y:getFloat($(e).attr("y")),
                w:getFloat($(e).attr("width"))
            };//$(e).getviewpageparam();
            if(x-params.dw<=parammenu.x+parammenu.w){
                $(e).logicMove({
                    x:parammenu.x+params.dw,
                    y:parammenu.y+params.dy,
                    stopPropagation:true
                });
                $(e).lineemptybyelement();
                /*$(e).setviewpageparam({
                    x:getFloat(parammenu.x)+params.dw,
                    y:getFloat(parammenu.y)+params.dy
                });*/
            }
        });
    }
}
$.fn.logicarrange = function(params){
    var container=this;
    switch(params.datatype){
        case "start-process":
        case "clock-start":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
            var delta=4;
            $(container).children("circle").attr({
                cx:params.w/2,
                cy:params.h/2,
                r:(params.w-delta)/2
            });
            var scale=params.h/$.logicMinHeight(params.datatype);
            switch(params.datatype){
                case "start-process":
                    delta=1;
                    $(container).children("polygon").attr({
                        points:$([
                            [params.w*0.33+delta,params.h/4+delta],
                            [params.w*0.75-delta,params.h/2],
                            [params.w*0.33+delta,params.h*3/4-delta]
                        ]).toPointString()
                    })
                    break;
                case "clock-start":
                    $(container).children("polyline").attr({
                        points:$([
                            [25*scale, 8*scale],
                            [25*scale, 25*scale],
                            [33*scale, 33*scale]
                        ]).toPointString()
                    });
                    /*$(container).children("line.left").attr({
                        x1:25*scale,
                        y1:25*scale,
                        x2:41*scale,
                        y2:25*scale
                    });*/
                    /*$(container).children("line.right").attr({
                        x1:38*scale,
                        y1:4*scale,
                        x2:46*scale,
                        y2:12*scale
                    });*/
                    break;
                case "or-process":
                    delta=2;
                    $(container).children("path").attr({
                        d:"M"+15*scale+" "+15*scale+" L"+25*scale+" "+35*scale+" L"+35*scale+" "+15*scale
                    });
                    break;
                case "and-process":
                    delta=2;
                    $(container).children("path").attr({
                        d:"M"+15*scale+" "+35*scale+" L"+25*scale+" "+15*scale+" L"+35*scale+" "+35*scale
                    });
                    break;
                case "xor-process":
                    if($.pagenotation()=="bpmn"){
                        var delta = 0;
                        $(container).children("path").attr({
                            d:$([
                                [params.w/2+delta,delta],
                                [params.w-delta,params.h/2+delta],
                                [params.w/2-delta,params.h-delta],
                                [delta,params.h/2+delta],
                                [params.w/2+delta,delta]
                            ]).toPathString()
                        })
                        $(container).children("text").attr({
                            x:16,
                            y:params.h*0.7/ scale,
                            transform:"scale(" + scale + ")"
                        });
                    }
                    else{                    
                        $(container).children("text").attr({
                            x:8,
                            y:params.h*0.6/ scale,
                            transform:"scale(" + scale + ")"
                        });
                    }
                break;
                case "end-process":
                    delta=2;
                    $(container).children("polygon").attr({
                        points:$([
                            [params.w/4+delta,params.h/4+delta],
                            [params.w*3/4-delta,params.h/4+delta],
                            [params.w*3/4-delta,params.h*3/4-delta],
                            [params.w/4+delta,params.h*3/4-delta]
                        ]).toPointString()
                    })
                    break;
            }
            break;
        case "subprocess":
        case "function":
        case "functionstep":
            var delta=2;
            var text=$(container).children("text");
            $(text).attr({
                x:3*delta,
                y:2*delta+15
            });
            var textsize = $(text).txtwrap(3*delta
                ,params.w-($.pagenotation()=="bpmn"?0:$.logicImageSize(params.datatype))-5*delta
                ,($.pagenotation()=="bpmn"?"center":"left")
            );
            params.w = (params.w?params.w:textsize.aw+($.pagenotation()=="bpmn"?0:$.logicImageSize(params.datatype))+2*delta);
            params.h = (params.h?params.h:textsize.h+2*delta);

            $(container).children("rect").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });
            if($.pagenotation()=="bpmn"){
                $(text).attr({
                    x:(params.w-2*delta-textsize.aw)/2,
                    y:(params.h+10*delta)/2 - textsize.h/2
                });
            }
            if(params.datatype=="subprocess"){
                if($.pagenotation()=="bpmn"){
                    $(container).children("a").children("use").attr({
                        x:(params.w-2*delta-$.logicImageSize(params.datatype))/2,
                        y:params.h-5*delta- $.logicImageSize(params.datatype)
                    });
                }
                else{
                    $(container).children("a").children("use").attr({
                        x:params.w-$.logicImageSize(params.datatype)-3*delta,
                        y:3*delta
                    });
                }
            }
            else{
                if($.pagenotation()=="bpmn"){
                    $(container).children("use").attr({
                        x:1*delta,
                        y:1*delta
                    });
                }
                else{
                    $(container).children("use").attr({
                        x:params.w-$.logicImageSize(params.datatype)-3*delta,
                        y:3*delta
                    });
                }
            }
            break;
        case "element":
            var imgsize =  $.pagenotation()=="bpmn"?0:$.logicImageSize(params.datatype);
            var delta=2;
            var text=$(container).children("text.caption");

            if($.pagenotation()=="bpmn"){
                $(text).attr({
                    x:delta,
                    y:4*delta+getInt($(this).css("font-size")+1.5,15.5)+ 2*delta
                });
                var textsize = $(text).txtwrap(1*delta,params.h-2*delta,"left");
                params.w = (params.w?params.w:textsize.aw+2*delta);
                params.h = (params.h?params.h:textsize.h+2*delta);
                $(text).css({
                    transform: "translate(0px, " + (params.h-2*delta+ textsize.aw)/2 + "px) rotate(-90deg)"
                });
            }
            else{
                $(text).attr({
                    x:3*delta+2,
                    y:4*delta+getInt($(this).css("font-size"),17)+($.pagemenuname()=="business"?2:0)*delta
                });
                var textsize = $(text).txtwrap(3*delta+2,params.w-imgsize-7*delta);
                params.w = (params.w?params.w:textsize.aw+imgsize+2*delta);
                params.h = (params.h?params.h:textsize.h+2*delta);
            }
            $(container).children("rect.main").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });
            //console.log(params.w);
            $(container).children("use.element-type").attr({
                x:params.w-imgsize-3*delta,
                y:3*delta+0
            });
            if($.pagemenuname()=="business") return params;

            var h=delta+getInt($(this).css("font-size"),17) + textsize.h;

            if(params.datatype3=="template"){
                let tmp = $(container).children("text.templateparams");
                let tmpsize = $(tmp).txtwrap(4*delta,params.w-8*delta);
                $(tmp).attr({
                    x:4*delta,
                    y:h + 2*delta +10,
                    height: tmpsize.h,
                    width:params.w-8*delta
                });

                $(container).children("text.valuestream").attr({
                    height: 0,
                    width:0
                });
                $($(container).children("rect.valuestream")).attr({
                    height: 0,
                    width:0
                });

                return params;
            }

            let arrangeComponent = function(container,x,y,w,d,delta){//func_h,data_h,w,p,delta){
                let fy = dy = y;
                let m=w*d/100-(d==100?0:1)*delta;
                let fw=m;
                $(container).children(($.pagemenu()!="system"?"g.element-function":"g.element-system")).each(function(i,e){
                    var imagesize=$.logicImageSize($.pagemenuname()=="system"?"system":"function");
                    var text=$(e).children("text");
                    var img=$(e).children("use");
                    var rect=$(e).children("rect");
                
                    var textsize = $(text).txtwrap(x+2*delta,m-imagesize-4*delta);
                    if(fw<textsize.aw) fw= textsize.aw;
                    $(text).attr({
                        x:x+2*delta,
                        y:fy+2*delta+10
                    });
                    $(img).attr({
                        x:x+m-imagesize-delta,
                        y:fy+delta
                    });
                    let h=fy+textsize.h+2*delta;

                    if($.pagemenuname()=="system"){
                        $(e).children("g.element-app").each(function(i1,e1){
                            h+=(i1==0?0:2*delta);
                            var img1 = $(e1).children("use");
                            var text1 = $(e1).children("text");
                            $(text1).attr({
                                x:x+3*delta,
                                y:h+2*delta+10
                            });
                            $(img1).attr({
                                x:m-$.logicImageSize("element_system")-2*delta-(d==100?0:0)*delta,
                                y:h+2*delta
                            });
                            var textsize1=$(text1).txtwrap(x+3*delta,m-$.logicImageSize("element_system")-5*delta-5*delta-(d==100?3:0)*delta);
                            $(e1).children("rect").attr({
                                x:x+delta,
                                y:h,
                                width:m-2*delta-(d==100?0:0)*delta,
                                height:textsize1.h+2*delta
                            });
                            h+=textsize1.h+2*delta;
                        });
                        $(e).children("rect").attr({
                            height:h-fy+2*delta
                        });
                        h+=3*delta;
                    }
                    $(rect).attr({
                        x:x,
                        y:fy,
                        width:m,
                        height:h-fy
                    });
                    fy=h+2*delta;
                });
                m=x+(w*d/100)+1*delta;
                let dw=0;
                switch($.pagemenuname()){
                    case "system":
                        var imagesize=$.logicImageSize("element_system");
                        $.each($(container).children("g.element-datasystem"),function(i,e){
                            var text=$(e).children("text.rect-app");
                            var img=$(e).children("use");
                            var rect=$(e).children("rect.rect-app");
                        
                            var textsize = $(text).txtwrap(m+delta,x+w-m-imagesize-4*delta);
                            if(dw<textsize.aw) dw= textsize.aw;

                            let h = dy+textsize.h+2*delta;
                        
                            $(text).attr({
                                x:m+delta,
                                y:dy+2*delta+10
                            });
                            $(img).attr({
                                x:x+w-imagesize-4*delta,
                                y:dy+delta
                            });
    
                            var text2 = $(e).children("text.rect-data");
                            $(text2).attr({
                                x:m+2*delta,
                                y:h+2*delta+20
                            });
                            var textsize1 = $(text2).txtwrap(m+2*delta,x+w-m-2*delta,"center");
                            if(dw<textsize1.aw) dw= textsize1.aw;

                            $(e).children("rect.rect-data").attr({
                                x:m+2*delta,
                                y:h,
                                width:x+w-m-4*delta,
                                height:textsize1.h+6*delta + 2.5
                            });
                            $(e).children("ellipse.rect-data").attr({
                                cx:m+2*delta+(x+w-m-4*delta)/2,
                                cy:h+5,
                                rx:(x+w-m-4*delta)/2,
                            });
    
                            h+=textsize1.h+7*delta+5;
    
                            $(rect).attr({
                                x:m,
                                y:dy,
                                width:x+w-m,
                                height:h-dy
                            });
                            dy=h+2*delta;
                        });
                    break;
                    case "interface":
                    case "database":
                    case "development":
                    case "concept":
                        var data = $(container).children("g.element-data");
                        let h = dy+3*delta;
                        $(data.filter(x=>x.flowtype!="transfer")).each(function(i,e){
                            var text = $(e).children("text");
                            $(text).attr({
                                x:m+3*delta,
                                y:h+3*delta+15
                            });
                            var textsize=$(text).txtwrap(m+3*delta,x+w-m-6*delta,"center");
                            if(dw<textsize.aw) dw= textsize.aw;

                            $(e).children("rect").attr({
                                x:m+2*delta,
                                y:h+2*delta,
                                width:x+w-m-4*delta,
                                height:textsize.h+5+delta
                            });
                            $(e).children("line").attr({
                                x1:m+2*delta,
                                y1:h+2*delta+5,
                                x2:m+2*delta+x+w-m-4*delta,
                                y2:h+2*delta+5
                            });
                            h+=textsize.h+5+3*delta;
                        });
                        $(container).children("rect.rect-data").attr({
                            x:m,
                            y:dy,
                            width:x+w-m,
                            height:h-dy+10
                        });
                        $(container).children("ellipse.rect-data").attr({
                            cx:m+(x+w-m)/2,
                            cy:h+5,
                            rx:(x+w-m)/2,
                        });
                        dy=h+10;
                    break;
                }
                return {
                    h:Math.max(fy,dy),
                    w:fw+2*delta + dw+3*delta
                }
            }

            let arr={
                h:params.h,
                w:params.w
            }
            if($.pagemenuname()=="system"){
                //обрабатываем namespaces
                let y=h;
                $(container).children("g.element-namespace").each(function(i,e){
                    let rect=$(e).children("rect.rect-ns");
                    if(rect.length>0){
                        if(i>0) y+=2*delta;
                        var text=$(e).children("text.rect-ns");
                        $(text).attr({
                            x:6*delta,
                            y:y+3*delta+10
                        });
                        var textsize=$(text).txtwrap(6*delta,params.w-12*delta);
                        var d=$(e).children("g.element-datasystem").length>0?params.d:100;
                        arr=arrangeComponent(e,6*delta,y+textsize.h+2*delta+3*delta,params.w-12*delta,d,delta);
            
                        $(rect).attr({
                            x:3*delta,
                            y:y,
                            width:params.w-6*delta,
                            height:arr.h-y+delta
                        });
                    }
                    else{
                        arr=arrangeComponent(e,3*delta,y+2*delta,params.w-6*delta,params.d,delta);
                    }
                    y=arr.h+delta;
                });
            }
            else{
                arr=arrangeComponent(container,3*delta,h,params.w-6*delta,params.d,delta);
            }

            let vs = $(container).children("text.valuestream");
            let vsh=0;
            let textvssize;
            if($(vs).text()!=""){
                textvssize = $(vs).txtwrap(4*delta,params.w-8*delta);
                vsh=textvssize.h +4;
            }

            if(params.autosize){
                delete params.autosize;
                //console.log(arr);
                $(container).children("rect.main").attr({
                    height:arr.h+vsh,
                    //width:arr.w
                });
                params.h=arr.h+2*delta+vsh;
                //params.w=arr.w+2*delta;
            }

            if($(vs).text()!=""){
                $(vs).attr({
                    x:4*delta,
                    y:params.h - textvssize.h + 2*delta-2,
                    height: textvssize.h,
                    width:params.w-8*delta
                });
                $($(container).children("rect.valuestream")).attr({
                    x:3*delta,
                    y:params.h - textvssize.h + 2*delta - 14,
                    height: textvssize.h +4,
                    width:(textvssize.aw+6> params.w-6*delta)?params.w-6*delta:textvssize.aw+6
                });
            }
            else{
                $(vs).attr({
                    height: 0,
                    width:0
                });
                $($(container).children("rect.valuestream")).attr({
                    height: 0,
                    width:0
                });
            }

            break;
        case "zone":
            var delta=2;
            var text=$(container).children("text");
            if($.pagemenuname()=="function"){
                $(text).attr({
                    x:3*delta,
                    y:2*delta+19
                });
                var textsize = $(text).txtwrap(3*delta,params.w-3*delta,"center");
                params.w = (params.w?params.w:textsize.aw+-delta);
                params.h = (params.h?params.h:textsize.h+2*delta);
                $(container).children("rect").attr({
                    x:delta,
                    y:delta,
                    width:params.w-2*delta,
                    height:params.h-2*delta
                });
            }
            else{
                $(text).attr({
                    x:3*delta,
                    y:2*delta+15
                });
                var textsize = $(text).txtwrap(3*delta,params.w-3*delta);
                params.w = (params.w?params.w:textsize.aw+-delta);
                params.h = (params.h?params.h:textsize.h+2*delta);
            
                $(container).children("rect").attr({
                    x:delta,
                    y:delta,
                    width:params.w-2*delta,
                    height:params.h-2*delta
                });
            }
            break;
        case "legend":
            var delta=2;
            var text=$(container).children("text");
            $(text).attr({
                x:3*delta,
                y:2*delta+15
            });
            var textsize = $(text).txtwrap(3*delta,params.w-3*delta);
            params.w = (params.w?params.w:textsize.aw+-delta);
            params.h = (params.h?params.h:textsize.h+2*delta);
        
            $(container).children("rect").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });
            break;
        case "datacenter":
            var delta=2;
            var text=$(container).children("text");
            $(text).attr({
                x:3*delta,
                y:2*delta+15
            });
            var textsize = $(text).txtwrap(3*delta,params.w-3*delta);
            params.w = (params.w?params.w:textsize.aw+-delta);
            params.h = (params.h?params.h:textsize.h+2*delta);
        
            $(container).children("rect").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });
            break;
        case "cluster":
            var copytype=$(container).children("use.copytype");
            var clustertype=$(container).children("use.clustertype");
            var copytypew = $.logicImageSize($(copytype).attr("href"));
            var clustertypew = $.logicImageSize($(clustertype).attr("href"));

            var delta=2;
            var text=$(container).children("text.caption");
            $(text).attr({
                x:3*delta + copytypew,
                y:2*delta+15
            });
            var textsize = $(text).txtwrap(3*delta,params.w-$.logicImageSize(params.datatype)-5*delta - copytypew - clustertypew);
            params.w = (params.w?params.w:textsize.aw+$.logicImageSize(params.datatype)+2*delta- copytypew - clustertypew);
            params.h = (params.h?params.h:textsize.h+2*delta);
        
            $(text).attr({
                x:params.w - $.logicImageSize(params.datatype) - 4*delta - clustertypew - textsize.aw,
            });

            $(container).children("rect.main").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });
            $(container).children("use.element-type").attr({
                x:params.w-$.logicImageSize(params.datatype)-3*delta,
                y:3*delta
            });
            $(copytype).attr({
                x:3*delta,
                y:3*delta,
                width:copytypew
            });
            $(clustertype).attr({
                x:params.w-$.logicImageSize(params.datatype)-3*delta - clustertypew,
                y:3*delta
            });
            $(container).children("rect.storeclass").attr({
                x:2*delta,
                y:params.h-3*delta-17
            });
            $(container).children("text.storeclass").attr({
                x:3*delta+1,
                y:params.h-3*delta-3
            });
            break;
        case "server":
            var delta=2;
            var text=$(container).children("text.caption");
            $(text).attr({
                x:3*delta,
                y:2*delta+15
            });
            var textsize = $(text).txtwrap(3*delta,params.w-$.logicImageSize(params.datatype)-5*delta);
            params.w = (params.w?params.w:textsize.aw+$.logicImageSize(params.datatype)+2*delta);
            params.h = (params.h?params.h:textsize.h+2*delta);
        
            $(container).children("rect").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });
            $(container).children("use.element-type").attr({
                x:params.w-$.logicImageSize(params.datatype)-3*delta,
                y:3*delta
            });
            var textipsize = $($(container).children("text.ip")).txtwrap(3*delta,params.w-3*delta);
            $(container).children("text.ip").attr({
                x:3*delta,
                y:params.h - textipsize.h + 2*delta,
                height: textipsize.h,
                width:params.w-2*delta,
            });
            $(container).children("text.name").attr({
                x:3*delta,
                y:params.h - textipsize.h-10,
                width:params.w-2*delta,
            });
            var imagesize=17;
            var h=textsize.h+7*delta;
            $(container).children("g.server-element").each(function(i,e){
                var p={
                    x:3*delta,
                    y:h,
                    w:params.w-6*delta,
                    h:0
                }
                var text=$(e).children("text");
                var img=$(e).children("use");
                var rect=$(e).children("rect");
            
                var t = $(text).txtwrap(p.x+delta,p.w-imagesize-4*delta);
                p.w = (p.w?p.w:t.aw+imagesize+2*delta);
                p.h = (p.h?p.h:t.h+2*delta);
            
                $(text).attr({
                    x:p.x+2*delta,
                    y:p.y+2*delta+delta/2+10
                });
                $(img).attr({
                    x:p.x+p.w-imagesize-delta,
                    y:p.y+2*delta
                });
                $(rect).attr({
                    x:p.x,
                    y:p.y,
                    width:p.w,
                    height:p.h
                });
                h+=p.h+2*delta;
            });
            break;
        case "comment":
            var delta=2;
            var text=$(container).children("text.caption");
            $(text).attr({
                x:3*delta,
                y:3*delta+15
            });
            var textsize = $(text).txtwrap(3*delta,params.w-5*delta);
            params.w = (params.w?params.w:textsize.aw+2*delta);
            params.h = (params.h?params.h:textsize.h+2*delta);

            $(container).children("rect").attr({
                x:delta,
                y:delta,
                width:params.w-2*delta,
                height:params.h-2*delta
            });

            text = $(container).children("text.comment");
            if(params.reload)
                $(text).txtwrap(3*delta,params.w-5*delta);
            $(text).attr({
                x:3*delta,
                y:textsize.h+8*delta+15
            });
            break;
        case "picture":
            if($.pagenotation()=="bpmn"){
                var delta=2;
                var text=$(container).children("text");
                $(text).attr({
                    x:3*delta,
                    y:2*delta+15
                });
                var textsize = $(text).txtwrap(3*delta
                    ,params.w-5*delta
                    ,"center"
                );
                params.w = (params.w?params.w:textsize.aw+2*delta);
                params.h = (params.h?params.h:textsize.h+2*delta);

                $(container).children("rect").attr({
                    x:delta,
                    y:delta,
                    width:params.w-2*delta,
                    height:params.h-2*delta
                });
                $(text).attr({
                    x:(params.w-2*delta-textsize.aw)/2,
                    y:(params.h+10*delta)/2 - textsize.h/2
                });
                $(container).children("use").attr({
                    x:1*delta,
                    y:1*delta
                });
            }
            else{
                var text = $(container).children("text");
                var wrp = $(text).txtwrap(0, params.w, "center");
                var delta=15+wrp.h;
                params.w = (params.w<wrp.w+2?wrp.w+2:params.w);
                params.h = (params.h<delta+ $.logicMinHeight(params.datatype) ?delta+ $.logicMinHeight(params.datatype) :params.h);
                $(container).find("rect").attr({
                    width:params.w-2,
                    height:params.h-2
                });
                $(text).attr({
                    x:0,
                    y:params.h - wrp.h+7
                });
                $(container).find("image").attr({
                    height:params.h-delta
                });
            }
            break;
        case "data":
            var delta = 4;
            var h=delta+12;
            $(container).children("g.element-data").each(function(i,e){
                var text = $(e).children("text");
                $(text).attr({
                    x:2*delta,
                    y:h+delta +14
                });
                var h1=$(text).txtwrap(2*delta,params.w-4*delta,"center").h;
                $(e).children("rect").attr({
                    x:delta,
                    y:h,
                    width:params.w-2*delta,
                    height:h1+2*delta
                });
                $(e).children("line").attr({
                    x1:delta,
                    y1:h+5,
                    x2:params.w-delta,
                    y2:h+5
                });
                h+=h1+3*delta;
            });
            if(!params.h || params.h==0)
                params.h=h+10;
            $(container).children("rect.rect-data").attr({
                x:0,
                y:0,
                width:params.w,
                height:params.h - delta
            });
            $(container).children("ellipse.rect-data").attr({
                cx:(params.w)/2,
                cy:5,
                rx:(params.w)/2,
            });
            break;
        case "linedata":
            delta=2;
            var scale=params.h/$.logicMinHeight(params.datatype);
            $(container).children("path").attr({
                d:$([
                    [delta,params.h-2*delta],
                    [delta,delta],
                    [params.w-2*delta-10*scale,delta],
                    [params.w-2*delta,delta +10*scale],
                    [params.w-2*delta,params.h-2*delta],
                    [delta,params.h-2*delta]
                ]).toPathString()
            });
            break;
    }
    return params;
}
$.fn.logicMouseMove=function(event){
    /*if(!isMouseMovingStart){
        var param = $(this).storeget();
        if(param.container)
            $("svg#" + param.container).elementOff();
        mouseMovingContainer = param.container;
        isMouseMovingStart = true;
    }*/
    var multiply = 10;
    var deltaY=multiply*svgMultuplY
    var deltaX=multiply*svgMultuplX;
    var container=this;
    var offset=$(container).offset();
    var offsetX = event.clientX - offset.left;
    var offsetY = event.clientY - offset.top;
    var width = getFloat($(container).attr("width"))*svgMultuplX;
    var height = getFloat($(container).attr("height"))*svgMultuplY;
    var captionHeight = ($(container).attr("data-can-caption-be-moved")=="true"?30*svgMultuplY:0);

    if(event.buttons!=0){
        // зажата правая клавиша, перемещается линия
        if($(container).attr("data-can-be-connected")=="true"){
            deltaY=multiply*svgMultuplY;
            deltaX=multiply*svgMultuplX;
            if(offsetX>=deltaX && offsetX<=width-deltaX && offsetY>=deltaY && offsetY<=height-deltaY){
                onhoverElement = undefined;
                if($(container).hasClass("hovered"))
                    $(container).removeClass("hovered");
            }
            else{
                onhoverElement = container;
                if(!$(container).hasClass("hovered"))
                    $(container).addClass("hovered");
            }
            $(container).cursor(lineFn);
        }
    }
    else{
        event.stopPropagation();
        var canSized=($(container).attr("data-can-be-sized")!="false");
        if($.pagenotation()=="bpmn" && offsetX>=deltaX && offsetX<=captionHeight){
            logicFn="context-menu";
        }
        else if($.pagenotation()!="bpmn" && offsetY>=deltaY && offsetY<=captionHeight){
            logicFn="context-menu";
        }
        else if(offsetX<deltaX)
        {
            if(offsetY<deltaY && logicCanChangeLeft && logicCanChangeTop && canSized) logicFn="nw-resize";
            if(offsetY>=deltaY && offsetY<=height-deltaY && logicCanChangeLeft && canSized) logicFn="w-resize";
            if(offsetY>height-deltaY && logicCanChangeLeft && logicCanChangeBottom && canSized) logicFn="sw-resize";
        }
        else if(offsetX>=deltaX && offsetX<=width-deltaX)
        {
            if(offsetY<deltaY && logicCanChangeTop && canSized) logicFn="n-resize";
            if(offsetY>=deltaY && offsetY<=height-deltaY) {
                var middleX = width*getFloat($(container).attr("data-divider"))/100;
                if(offsetX>middleX-deltaX/2 && offsetX<middleX+deltaX/2 && offsetY>35)
                    logicFn="ew-resize#inner";
                else{
                    if((canvasFn=="default" || canvasFn=="hand") && ($(container).attr("data-can-be-moved")=="true" || window.event.ctrlKey || window.event.shiftKey))
                        logicFn=canvasFn;// grab
                    else
                        logicFn="default";
                }
            }
            if(offsetY>height-deltaY && logicCanChangeBottom && canSized) logicFn="s-resize";
        }
        else if(offsetX>width-deltaX)
        {
            if(offsetY<deltaY && logicCanChangeRight && logicCanChangeTop && canSized) logicFn="ne-resize";
            if(offsetY>=deltaY && offsetY<=height-deltaY && logicCanChangeRight && canSized) logicFn="e-resize";
            if(offsetY>height-deltaY && logicCanChangeRight && logicCanChangeBottom && canSized) logicFn="se-resize";
        }
        //console.log(logicFn,canvasFn);
        $(container).cursor(logicFn);
    }
}
$.fn.logicMouseLeave = function(i){
    /*if(mouseMovingContainer){
        var container = $("svg#" + mouseMovingContainer);
        console.trace();
        $(container).elementOn();
    }
    isMouseMovingStart = false;*/
}
$.fn.cursor = function(value){
    var cursor = $(this).css("cursor");
    switch(value){
        case "ew-resize#inner":
        case "e-resize":
        case "w-resize":
            cursor="ew-resize";
            break;
        case "s-resize":
        case "n-resize":
            cursor="ns-resize";
            break;
        case "se-resize":
        case "nw-resize":
            cursor="nwse-resize";
            break;
        case "ne-resize":
        case "sw-resize":
            cursor="nesw-resize";
            break;
        case "hand":
            cursor="grab";
            break;
        default:
            cursor=value;
            break;
    }
    $(this).css({cursor:cursor});
}
$.fn.loadImage = async function(params){
    var container = this;
    if(params.href){
        $(container).attr({
            href:params.href
        });
    }
    else{
        await new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob'; 
            var url = PICTURE_HOST + params.src;
            xhr.open("GET", url, true);
            xhr.onload = async function(e) {
                var blob = xhr.response;
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                new Promise(resolve => {
                    reader.onloadend = () => {
                        $(container).attr({
                            href:reader.result
                        });
                        params.href = reader.result;
                    };
                });
                var img = new Image();
                img.src = URL.createObjectURL(blob);
                await new Promise(resolve => {
                    img.onload=function(){
                        params.naturalHeight=this.naturalHeight;
                        params.naturalWidth=this.naturalWidth;
                        params.viewdata = $.storeget(params.id).viewdata;
                        storeset(params.id,params,undefined,false);
                    };
                });
                resolve();
            };
            xhr.onerror = function () {
                resolve(undefined);
                console.error("** An error occurred during the XMLHttpRequest");
            };
            xhr.send();
        });
    }
}

