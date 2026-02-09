var storage = sessionStorage;
$.restore = function(){
    var doc = $.documentget();

    var canvas=$("svg[data-type='document']");
    $(canvas).children("[data-type]").remove();

    var docparammenu;
    if(!isemptyobject(doc)){
        docparammenu = $.getviewpageparam(doc);
        storeupdate(doc);
    }
    $(canvas).documentsetviewparam(docparammenu);
    /*
    if(!isemptyobject(docparammenu)){
        $(canvas).svgviewbox(docparammenu.x,docparammenu.y,docparammenu.dx,docparammenu.dy,false);
        svgMultuplX=(docparammenu.mx?parseFloat(docparammenu.mx):1);
        svgMultuplY=(docparammenu.my?parseFloat(docparammenu.my):1);
        svgStartWidth=(docparammenu.sw?parseFloat(docparammenu.sw):getFloat(screen.width));
        svgStartHeight=(docparammenu.sw?parseFloat(docparammenu.sh):getFloat(screen.height));
        if(svgStartWidth!=getFloat(screen.width) || svgStartHeight!=getFloat(screen.height)){
            var hrm=(getFloat(screen.width)/getFloat(screen.height))/(svgStartWidth/svgStartHeight);
            svgMultuplX = getFloat(screen.width)*svgMultuplX/svgStartWidth/(hrm>1?1:hrm);
            svgMultuplY = getFloat(screen.height)*svgMultuplY/svgStartHeight*(hrm<1?1:hrm);
            svgStartWidth=getFloat(screen.width)/(hrm>1?1:hrm);
            svgStartHeight=getFloat(screen.height)*(hrm<1?1:hrm);
            $(canvas).setviewpageparam({
                mx:svgMultuplX,
                my:svgMultuplY,
                sw:svgStartWidth,
                sh:svgStartHeight
            },false);
        }
        $(canvas).css({
            width:svgStartWidth,
            height:svgStartHeight
        });
        zoomY = svgStartHeight/svgStartWidth;
    }
    else
        $(canvas).svgfitcanvas();
 */
    
    /*$.each(list.sort(function(a,b){
        var av=getInt($.getviewpageparam(a).order);
        var bv=getInt($.getviewpageparam(b).order);
        if(av<bv) return -1;
        if(av>bv) return 1;
        return 0;
    }),function(i,e){
        storeupdate(e);
    });*/
    $.propertyset();
    
    clearhistory();
    return($.storekeys().length>0);
}
function isDocumentSaved(options) {
    var place=$("svg[data-type='document']");
    var prop = $(place).documentget();
    if(getInt(prop.sysid)==0) 
        return !hasupdates();

    if(!options)
        options={};
    var res = true;
    $.getdocument({
        id: prop.sysid,
        async:options.async,
        success: function(document){
            var keys = $.storekeys();
            $.each(document.data,function(i,e){
                var p_load = e;//JSON.parse(e);
                if(p_load.id) {
                    var inx = keys.indexOf(p_load.id);
                    if(inx!=-1){
                        keys.splice(inx,1);
                        var p_exist = $.storeget(p_load.id);
                        res &= (p_exist!=undefined) &&  jSonCmp(p_load, p_exist)/*(JSON.stringify(p_load, Object.keys(p_load).sort())==JSON.stringify(p_exist, Object.keys(p_exist).sort()))*/;
                    }
                    else res=false;
                }
                else res=false;
            });
            res &= (keys.length==0);
            if (options && typeof options.success == "function") options.success(res);
        }
    });
    return(res);
}
storeupdatedata = function(data){
    var selected = $.getfirstofselected();
    var list=[];
    var id=$(selected).prop("id");
    list.push($(selected).storeget());
    if(data.typename!="component" /*&& (data.typename!="data" || data.flowtype==undefined || data.flowtype=="master")*/){
        $.each($.storekeys(),function(i,id1){
            if(id1!=id)
                list.push($.storeget(id1));
        });
    }
    let newid = data.newid;
    delete data.flowtype;
    delete data.newid;
    $.each(list.sort(function(a,b){
        if(a.datatype=="element") return -1;
        return 1;
    }),function(i,param){
        var paramch;
        var paramchr;
        var ischanded=false;
        switch(data.typename){
            case "function":
                if(param.datatype=="line"){
                    if(!$.isempty(data.id) && param.endfn==data.id /*|| param.startfn==data.id*/){
                        /*param.consumerint=data.connection,
                        param.interaction=data.interaction,*/
                        if(newid) param.endfn=newid;
                        param.endfnname=data.name;
                        param.type=data.type;
                        param.consumermethod=data.method;
                        param.consumermethodtype=data.methodtype;
                        //param.consumerint=data.connection;
                        if(param.supplyfunction){
                            param.supplyfunction=$.extend(param.supplyfunction,data,{
                                consumermethod:data.method,
                                consumermethodtype:data.methodtype
                            });
                        }
                        ischanded = true;
                        if($.hasviewpageparam(param,"interface")){
                            var lines = linegetinterfacelist(param.number);
                            var supply = param.function=="supply"?param.startel:param.endel;
                            $.each(lines,function(i1,p){
                                if(supply==(p.function=="supply"?p.startel:p.endel)){
                                    p.endfn=data.id;
                                    p.endfnname=data.name;
                                    p.type=data.type;
                                    p.consumermethod=data.method;
                                    p.consumermethodtype=data.methodtype;
                                    //p.consumerint=data.connection;
                                    if(p.supplyfunction){
                                        p.supplyfunction=$.extend(p.supplyfunction,data,{
                                            consumermethod:data.method,
                                            consumermethodtype:data.methodtype
                                        });
                                    }
                                    storedirectlyset(p.id,p,false);
                                }
                            });
                        }
                    }
                }
                else
                    paramch=param.functions;
                break;
            case "data":
                paramch=param.data;
                if(param.datatype=="line")
                    paramchr=param.datar;
                break;
            case "component":
                paramch=param.components;
                break;
        }
        if(paramch!=undefined){
            $.each(paramch,function(i,e){
                if(e.id==data.id){
                    e=$.extend(e,data);
                    if(newid) e.id=newid;
                    ischanded=true;
                }
            });
        }
        if(paramchr!=undefined){
            $.each(paramchr,function(i,e){
                if(e.id==data.id){
                    //console.log($(selected).prop("id"),id1,param.datatype,data.typename);
                    /*if(!(data.typename=="function" && param.datatype=="element" && selected && id==param.id)){
                        e=$.extend(e,data,{state:e.state});
                    }
                    else
                        e=$.extend(e,data);*/
                    if(newid) e.id=newid;
                    ischanded=true;
                }
            });
        }
        if(ischanded){
            $.storeset(param,true);
        }
    });
    if(data.typename=="data" && $.isnull(data.pod,"")!=""){
        var group = $.isnull(data.name,"").split('.');
        // пытаемся установить ПОД по группе
        var list=[];
        $.each($.storekeys(),function(i,id1){
            list.push($.storeget(id1));
        });
        $.each(list.sort(function(a,b){
            if(a.datatype=="element") return -1;
            return 1;
        }),function(i,param){
            if(param.data){
                //if(param.id=="0013333c-1015-47e2-a287-1f623d861280")
                //debugger;
                $.each(param.data,function(i1,e){
                    if($.isnull(e.pod,"")==""){
                        var grp = e.name.split('.');
                        if(grp.length>0 && grp[0].trim().toLowerCase()==group[0].trim().toLowerCase()){
                            e.pod=data.pod;
                            storedirectlyset(param.id,param,false);
                        }
                    }
                });
            }
        });
    }
}
$.store = function(){
//    $.each(/*$.storekeys()*/ $("svg[data-type='document']").find("[data-type]"),function(i,id){
    $("svg[data-type='document']").find("[data-type]").remove();
    $("div[data-menu='business']").find("a[data-type]").remove();
    storage.clear();
    clearhistory();
    $.outputhide();
    $.outputclear();
    $.propertyset();
}
$.storekeys = function(){
    return Object.keys(storage);
}
$.fn.storeget = function(){
    return $.storeget($(this).prop("id"));
}
$.storeget = function(id){
    var params=undefined;
    try{
        params=JSON.parse($.storegetstr(id));
    }
    catch(ex){
        console.error(ex.stack);
    }
    // to kill
    if(!params)
        params={};
    //if($.pagemenuname()!="business") delete params.container;
    switch(params.datatype){
        case "document":
            if(!params.name || params.name==""){
                var parammenu = $.getviewpageparam(params,"interface");
                params.name=parammenu.name;
                params.description=parammenu.description;
                params.type=parammenu.type;
                params.project=parammenu.project;
                params.version=parammenu.version;
                params.author=parammenu.author;
                delete parammenu.name;
                delete parammenu.description;
                delete parammenu.type;
                delete parammenu.project;
                delete parammenu.version;
                delete parammenu.author;
            }
            if(!params.docversion || params.docversion=="")
                params.docversion=currentVersion;
            break;
        case "element":
            if(!params.cancontain)
                params.cancontain=true;
            if(!params.components)
                params.components=[];

            let id=((!params.sysid || getInt(params.sysid)==0)?params.id:params.sysid);
            //if(params.components.length==1 && params.components[0].id!=id) params.components[0].id=id;
            /*if(params.components.length==0)
            {
                params.components.push({
                    id:id,
                    name:params.name.lastIndexOf(". ")>-1?params.name.substring(params.name.lastIndexOf(". ")+2):params.name,
                    data:[],
                    values:{}
                });
            }*/
            let needRefact=(params.components.length>0 && !params.components[0].data);
            if(needRefact){
                let comp=[];
                $.each(params.components,function(i,e){
                //if(params.id=="a375557d-234f-44a8-a469-59b68a73bdf6") debugger;
                    let p={
                        id:e.id,
                        name:e.name,
                        data:[],
                        values:{}
                    };
                    if (params.components.length==1 || $.isempty(e.name) || e.name=="Приложение" || e.name=="БД" || e.name.trim().toLowerCase()==params.name.trim().toLowerCase()){
                        let platform=comp.find(item => (item.id==id));
                        if(!platform){
                            p.id=id;
                            p.name=params.name.lastIndexOf(". ")>-1?params.name.substring(params.name.lastIndexOf(". ")+2):params.name;
                            comp.push(p);
                        }
                        else
                            p=platform;
                    }
                    else{
                        if(!e.name || e.name.indexOf(params.name+". ")==-1)
                            p.name=params.name+". " + ($.isempty(e.name)?(e.type=="database"?"БД":"Приложение"):e.name);
                        comp.push(p);
                    }
                    if(!$.isempty(e.os)){
                        p.data.push({
                            id:$.newguid(),
                            typename:(e.type=="database"?"Операционная система СУБД":"Операционная система"),
                            type:(e.type=="database"?"dbos":"os"),
                            name:$.isempty(e.name)?params.name:e.name,
                            value:e.os,
                            sysid:e.id,
                            state:params.state
                        });
                    }
                    if(!$.isempty(e.env)){
                        $.each(e.env.split('/'),function(i1,e1){
                            p.data.push({
                                id:$.newguid(),
                                typename:(e.type=="database"?"СУБД":"Софт системный"),
                                type:(e.type=="database"?"db":"sys"),
                                name:params.name,
                                value:e1.trim(),
                                sysid:e.id,
                                state:params.state
                            });
                        });
                    }
                    p.state=params.state;
                    if(!$.isempty(e.os)){
                        p.values[e.type=="database"?"dbos":"os"]={
                            value:splitNames(p.values[e.type=="database"?"dbos":"os"],e.os),
                            state:params.state
                        };
                    }
                    if(!$.isempty(e.env)){
                        $.each(e.env.split('/'),function(i1,e1){
                            p.values[e.type=="database"?"db":"sys"]={
                                value:splitNames(p.values[e.type=="database"?"db":"sys"],e1.trim()),
                                state:params.state
                            }
                        });
                    }
                });
                params.components=comp;
                storedirectlyset(params.id,params,false);
            }
            let needUpdate=false;
            $.each(params.components,function(i,e){
                if(!e.id){
                    e.id=$.newguid();
                    needUpdate=true;
                }
            });
            if (!params.metrics) {
                getSystemMetricList({
                    async: false,
                    systemid: getInt(params.sysid),
                    length: 1000000,
                    success: function (result) {
                        params.metrics = result.map(a => ({ ...a }));
                    }
                });
                needUpdate = true;
            }
            if(needUpdate)
                storedirectlyset(params.id,params,false);

            /*if(params.components.length==0){
                getSystemComponentList({
                    systemid:params.sysid,
                    systemonly:true,
                    length:1000000,
                    success:function(result){
                        params.components=result.map(a=>({...a}));
                        storedirectlyset(params.id,params,false);
                    }
                });
            }*/
            /*if(params.functions){
                $.each(params.functions,function(i,e){
                    if (e.method && e.name && e.method.toLowerCase().trim()==e.name.toLowerCase().trim()){
                        e.method="";
                    }
                })
            }*/
            if(params.data){
                $.each(params.data,function(i,e){
                    if(!e.flowtype) e.flowtype="master";
                })
            }
            delete params.appname;
            delete params.appos;
            delete params.appenv;
            delete params.dbname;
            delete params.dbos;
            delete params.dbenv;
        break;
        case "line":
            if(params.text){ 
                params.number=params.text;
                delete params.text;
            }
            if((!params.interaction || params.interaction =="") && params.datatype3!="dashline")
                params.interaction="Синхронное";
        break;
    }
    return params;
}
$.storegetstr = function(id){
    return storage.getItem(id);    
}
$.storesetstr = function(id,value){
    return storage.setItem(id,value);    
}
$.fn.storeset = function(params, override,putinhistory){
    var id=$(this).prop("id");
    if(!id){
        console.error("storeset on null id",this);
        console.trace();
        return;
    }
    storeset(id,$.extend({id:id},params), override, putinhistory);
}
$.storeset = function(params, override, putinhistory){
    var p = storeset(params.id,params, override,putinhistory);
    //console.log(p);
    storeupdate(p,true);
}
$.storemetricget = function(metric,alias){
    if(!metric) return "";
    return $.isnull(metric.find(item=>item.alias==alias)?.value,"");
}
var storeset = function(id,params,override,putinhistory){
    if(id==undefined){
        console.error("Undefined ID",params);
        return false;
    }
    var c = $.storeget(id);
    if(override){
        for(let i of Object.keys(params)){
            delete c[i];
        }
    }
    /*console.log($.extend(
        true,
        {},
        c,
        params
    ));*/
    params = $.extend(
        true,
        {},
        c,
        params
    );
    //console.trace(params);
    if(putinhistory!=false){
        var current = $.storeget(id);
        puthistory(current,params);
    }
    storage.setItem(id,JSON.stringify(params));
    return params;
}
var storedirectlyset = function(id,params,putinhistory){
    if(putinhistory!=false) {
        puthistory($.storeget(id),params);
    }
    storage.setItem(id,JSON.stringify(params));
    return params;
}
$.fn.storeremove = function(putinhistory){
    $.storeremove($(this).prop("id"),putinhistory);
}
$.storeremove = function(id,putinhistory){
    var current = $.storeget(id);
    if(putinhistory!=false)
        puthistory(current,{});
    storeremove(id);
    storage.removeItem(id);
}
var storeupdate = function(params, noupdatechildren, nosetposition){
    var canvas=(params.container?$("svg#" + params.container):$("svg[data-type='document']"));

    switch(params.datatype){
        case "document":
            _currentNotation = ($.getviewpageparam(params)?.notation??"");
            $(canvas).document(params,noupdatechildren);
            break;
        case "tableview":
            $(canvas).tableview(params);
            break;
        case "line":
            $(canvas).line(params,nosetposition);
            break;
        default:
            $(canvas).logic(params,noupdatechildren,nosetposition);
            break;
    }
}
var storeremove = function(id,putinhistory){
    var params = $.storeget(id);
    switch(params.datatype){
        case "data":
        case "linedata":
            $("g[data-type='line'][data-start='" + id + "'], g[data-type='line'][data-end='" + id + "']").each(function(i1,e1){
                $.storeremove($(e1).prop("id"),putinhistory);
            });
            $("text[data-type='linedatatext'][data-parent='" + id + "']").remove();
            $("#" + id).remove();
            break;
        case "line":
        case "legend":
        /*case "zone":*/
            $("#" + id).remove();
             break;
        default:
            $("g[data-type='line'][data-start='" + id + "']").each(function(i,line){
                $(line)
                    .removeAttr("data-start-fn")
                    .removeAttr("data-start")
                    .removeAttr("data-start-type")
                    .removeAttr("data-start-dx")
                    .removeAttr("data-start-dy");
                $(line).storeset({
                    startel:"",
                    startfn:"",
                    starttype:""
                },undefined, putinhistory);
                $(line).lineNumberMove();

            });
            $("g[data-type='line'][data-end='" + id + "']").each(function(i,line){
                $(line)
                    .removeAttr("data-end-fn")
                    .removeAttr("data-end")
                    .removeAttr("data-end-type")
                    .removeAttr("data-end-dx")
                    .removeAttr("data-end-dy");
                    $(line).storeset({
                        endel:"",
                        endfn:"",
                        endtype:""
                    },undefined, putinhistory);
                    $(line).lineNumberMove();
            });
            if($.pagemenuname()=="business" && params.datatype=="element"){
                var e=$("#" + id);
                if(e.length>0){
                    var x=getFloat($(e).attr("x"));
                    var y=getFloat($(e).attr("y"));
                    var h=getFloat($(e).attr("height"));
                    var w=getFloat($(e).attr("width"));
                    $("svg[data-type2='logic']:not([data-type='element']):not([data-container])").each(function(i,e){
                        //debugger;
                        var parammenu={
                            x:getFloat($(e).attr("x"))
                        };//$(e).getviewpageparam();
                        if(x<=parammenu.x){
                            $(e).logicMove({
                                x:parammenu.x-w,
                                stopPropagation:true
                            });
                            $(e).lineemptybyelement();
                            $(e).setviewpageparam({
                                x:parammenu.x-w
                            });
                        }
                    });
                    $("#" + params.id).nextAll().filter("svg[data-type='element']").each(function(i,e){
                        let epm = $(e).getviewpageparam();
                        epm.x = x;
                        x+=getFloat(epm.w);
                        $(e).logicMove({
                            x:epm.x,
                            y:y,
                            h:h,
                            stopPropagation:true});
                        $(e).setviewpageparam(epm,putinhistory);
                        $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                            $(e1).lineemptybyelement();
                        });
                    });
                }
            }
            $("#" + id).remove();
            break;
        }
}
$.fn.getviewpageparam = function(){
    var param=$(this).storeget();
    return $.getviewpageparam(param);
}
$.hasviewpageparam = function(param,pagemenu){
    if(!param || !param.viewdata)
        return false;
    if(!pagemenu) pagemenu=$.pagemenu();
    if(pagemenu=="business"){
        var haveBusiness=false;
        for(let i of Object.keys(param.viewdata))
            haveBusiness|=(i.indexOf("business")==0 && !isemptyobject(param.viewdata[i]))
        return haveBusiness;
    }
    return (!isemptyobject(param.viewdata[pagemenu]));
}
$.getviewpageparam = function(param,pagemenu){
    var parammenu = {};
    var type=(pagemenu?pagemenu:$.pagemenu());
    if($.hasviewpageparam(param,type)){
        parammenu = param.viewdata[type];
    }
    else {
        // если данных для отрисовки нет
        switch(param.datatype){
            case "document":   // копируем размеры и масштаб документа для отрисовки элеметнов
                if($.hasviewpageparam(param,"interface")){
                    param.viewdata[type] = $.extend({}, param.viewdata["interface"]);
                    parammenu = param.viewdata[type];
                }
                break;
            /*case "picture":
                break;
            case "element":
            case "legend":
            case "zone":
                    if(type=="system" && $.hasviewpageparam(param,"interface")){
                        param.viewdata[type] = $.extend({}, param.viewdata["interface"]);
                        parammenu = param.viewdata[type];
                    }
                break;
            case "line":
                if(type=="system" && param.viewdata["interface"] && param.starttype!="comment" && param.endtype!="comment" && param.starttype!="picture" && param.endtype!="picture"){
                    parammenu = $.extend({}, param.viewdata["interface"],
                        {
                            direction:(param.function=="consumer"?"f":"r")
                        }
                    )
                }
                break;*/
        }
    }
    // to kill
    switch(param.datatype){
        case "picture":
        case "zone":
        case "legend":
        case "element":
            if(!parammenu.x && parammenu.left) parammenu.x=parammenu.left;
            if(!parammenu.y && parammenu.top) parammenu.y=parammenu.top;
            if(!parammenu.w && parammenu.width) parammenu.w=parammenu.width;
            if(!parammenu.h && parammenu.height) parammenu.h=parammenu.height;
            if(!parammenu.d && parammenu.percent) parammenu.d=parammenu.percent;
        break;
    }
    return parammenu;
}
$.clearviewpageparam = function(menutype, menutype2){
    //удаляем то, что есть на menutype2, если оно определено
    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        if(param.viewdata && (menutype2==undefined || (param.viewdata[menutype2]!=undefined && param.viewdata[menutype2]!=null && Object.keys(param.viewdata[menutype2]).length > 0))){
            delete param.viewdata[menutype];
            if(Object.keys(param.viewdata).length==0 && param.datatype!="document")
                $.storeremove(id);
            else
                storedirectlyset(id,param);
        }
    });
    $.pagemenu($.pagemenu());
}
$.rotateviewpageparam = function(menutype){
    if(!menutype)
        menutype=$.pagemenu();
    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        if(param.viewdata && param.viewdata[menutype]){
            var parammenu = $.getviewpageparam(param);
            if(param.datatype=="line"){
                param.viewdata[menutype] = $.linereflection(parammenu);
            }
            else{
                if(param.datatype=="element" && $.pagemenuname()=="business")
                    param.viewdata[menutype] = $.logicrotate(parammenu);
                else
                    param.viewdata[menutype] = $.logicreflection(parammenu);
            }
            storedirectlyset(id,param);
        }
    });

}
$.deleteviewpageparam = function(menutype){
    if(!menutype)
        menutype=$.pagemenu();
    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        if(param.viewdata && param.viewdata[menutype]){
            delete param.viewdata[menutype];
            if(Object.keys(param.viewdata).length>0 || param.datatype=="document"){
                storedirectlyset(id,param);
            }
            if(param.datatype!="document" && menutype==$.pagemenu())
                storeremove(id);
        }
        if((!param.viewdata || Object.keys(param.viewdata).length==0) && param.datatype!="document"){
            $.storeremove(id);
        }
    });
}
$.fn.setviewpageparam = function(viewparam, putinhistory){
    var container = this;
    var param=$(container).storeget();
    if(!param.id){
        console.error("setviewpageparam on null id",param,container)
        console.trace();
        return;
    }
    if(!param.viewdata)
        param.viewdata = {};
    param.viewdata[$.pagemenu()] = $.extend(
        true,
        {},
        $.getviewpageparam(param),
        viewparam
    );
    $(container).storeset(param,undefined,putinhistory);
    return param.viewdata[$.pagemenu()];
}


var undobutton=undefined;
var redobutton=undefined;
var maxhistoryindex=10;
var storehistory=[];
var historyindex=-1;
var savedhistiryindex=-1;
var isupdated=false;
var needToSaveDoc = false; 
var clearhistory = function(){
    storehistory=[];
    historyindex=-1;
    savedhistiryindex=-1;
    isupdated=false;
    sethistoryvisibility();
}
$.undo = function() {
    if(undobutton) $(undobutton).click();
}
$.redo = function() {
    if(redobutton) $(redobutton).click();
}
$.fn.storeundo = function(){
    undobutton=this;
    $(undobutton).click(function(){
        $("#wait").show();
        setTimeout(()=>{
            $.historycloseputtransaction();
            if(historyindex!=-1){
                var list=[];
                storehistory[historyindex].data.reverse().forEach(data => {
                    var state = data.current;
                    if(isemptyobject(state)){
                        var params=data.params;
                        if(params && params.id){
                            storeremove(params.id,false);
                            storage.removeItem(params.id);
                            list=$(list).hashput(params.id);
                        }
                    }
                    else{
                        if(!$.hasviewpageparam(state,$.pagemenu()))
                            storeremove(state.id,false);
                        storage.setItem(state.id,JSON.stringify(state));
                        list=$(list).hashput(state.id,state);
                    }
                });
                $.each(list.sort(function(a,b){
                    return $.logicsort(a.value,b.value);
                }),function(i,state){
                    if(!isemptyobject(state.value) && $.hasviewpageparam(state.value,$.pagemenu())){
                        storeupdate(state.value,undefined,false);
                    }
                })
                storehistory[historyindex].data.reverse();
                $.propertyset(undefined,true);
                historyindex--;
                isupdated=(historyindex>-1);
            }
            sethistoryvisibility();
            $("#wait").hide();
        },50);
    });
    sethistoryvisibility();
}
$.fn.storeredo = function(){
    redobutton=this;
    $(redobutton).click(function(){
        $("#wait").show();
        setTimeout(()=>{
            $.historycloseputtransaction();
            if(historyindex<storehistory.length-1){
                var list=[];
                historyindex++;
                isupdated=(historyindex>-1);
                storehistory[historyindex].data.forEach(data => {
                    var state = data.params;
                    if(isemptyobject(state)){
                        var params=data.current;
                        if(params && params.id){
                            storeremove(params.id,false);
                            storage.removeItem(params.id);
                            list=$(list).hashput(params.id);
                        }
                    }
                    else{
                        if(!$.hasviewpageparam(state,$.pagemenu()))
                            storeremove(state.id,false);
                        storage.setItem(state.id,JSON.stringify(state));
                        list=$(list).hashput(state.id,state);
                    }
                });
                $.each(list.sort(function(a,b){
                    return $.logicsort(a.value,b.value);
                }),function(i,state){
                    if(!isemptyobject(state.value) && $.hasviewpageparam(state.value,$.pagemenu())){
                        storeupdate(state.value,undefined,false);
                    }
                })
                $.propertyset(undefined,true);
            }
            sethistoryvisibility();
            $("#wait").hide();
        },50);
    });
    sethistoryvisibility();
}
var puthistory = function(current, params){
    //sethistoryvisibility();
    //console.trace(current, params);
    //if(!params.datatype || !current.datatype) 
    //return false;
    //console.trace(current,params);
    var isSame=false;
    try{
        if(current && params)
            isSame=jSonCmp(current, params);
    }
    catch(e){
        console.error(e);
        console.log(current,params);
    }
    if(isSame) return;
    if(storehistory[historyindex] && storehistory[historyindex].closed){
        if(historyindex==maxhistoryindex){
            //двигаем массив
            historyindex--;
            if(savedhistiryindex!=-1) savedhistiryindex--;
            storehistory.shift();
        }
        if(savedhistiryindex>=historyindex) savedhistiryindex=-2;
        historyindex++;
        //отрезаем хвост
        storehistory.splice(historyindex);
    }
    if(historyindex==-1) {
        historyindex=0;
        storehistory=[];
    }

    if(storehistory[historyindex]){
        storehistory[historyindex].data.push({
            current:current,
            params:params
        });
    }
    else{
        storehistory.push({
            closed:false,
            data:[{
                current:current,
                params:params
            }]
        });
    }
    isupdated=(historyindex>-1);
    sethistoryvisibility();
    //console.trace(storehistory);
}
$.historycloseputtransaction = async function(){
    if(!!storehistory[historyindex] && !storehistory[historyindex].closed) {
        storehistory[historyindex].closed=true;
    }
}
var sethistoryvisibility = function(){
    $(undobutton).find("img").attr({
        src:historyindex==-1?"images/undo_disabled.png":"images/undo.png"
    });
    $(redobutton).find("img").attr({
        src:historyindex<storehistory.length-1?"images/redo.png":"images/redo_disabled.png"
    });
    if(savedhistiryindex!=historyindex)
        needToSaveDoc=true;
    //if(historyindex==-1 || !historyindex<storehistory.length-1){
        $("#save").find("img").css({
            opacity:(/*isDocumentSaved()*/!needToSaveDoc?0.5:1)
        });
    /*}
    else{
        $("#save").find("img").css({
            opacity:1
        });
    }*/
}
var hasupdates = function(){
    return isupdated;
}
var clearupdates = function(){
    isupdated = false;
    savedhistiryindex=historyindex;
}

$.fn.importfromjson = function(content){
    var canvas = this;
    var data;
    try{
        data=JSON.parse(content);
    }
    catch{
        return false;
    }
    var currentdoc=$(canvas).documentget();
    $.store();
    var doc, docparammenu;
    $.each(data,function(i,element){
        if(element.datatype=="document"){
            element.sysid = currentdoc.sysid;
            element.login=$.isnull($.currentuser().login,"");
            doc = element;
        }
        $.storesetstr(element.id,JSON.stringify(element),undefined,false);
    });
    if(doc){
        docparammenu = $.getviewpageparam(doc);
        storeupdate(doc);
        /*if(doc.login==$.isnull($.currentuser().login,""))
            $("#save").show();
        else
            $("#save").hide();
        */
        $.propertysmartshow();
        if (/*$.pagemenu() == 'business' ||*/ $.pagemenu() == 'function') $.schemashow();
    }

    $(canvas).documentsetviewparam(docparammenu);

    /*if(!isemptyobject(docparammenu)){
        $(canvas).svgviewbox(docparammenu.x,docparammenu.y,docparammenu.dx,docparammenu.dy);
        svgMultuplX=(docparammenu.mx?parseFloat(docparammenu.mx):1);
        svgMultuplY=(docparammenu.my?parseFloat(docparammenu.my):1);
    }
    else
        $(canvas).svgfitcanvas();*/
    clearhistory();
    return true;
}
$.fn.importfrompu = function(content){
    //console.log(content);
    var canvas = this;
    let currentLine = 0;
    let dataLines = content.split('\n');
    let getDataLine = function(){
        if(currentLine>= dataLines.length) return;
        return dataLines[currentLine].trim();
    };
    let getCommandBlock = function(){
        let cmdlist = [];
        let eob = false;
        let line;
        do{
            line = getDataLine();
            if(line!=undefined){
                let command = getLexeme(line);
                if(command){
                    switch(command.type){
                        case "alt":
                            currentLine++;
                            let alt = {
                                type:"alt",
                                altcase:command.case,
                                alt:getCommandBlock()
                            }
                            command = getLexeme(getDataLine());
                            if(command){
                                if(command.type=="else"){
                                    currentLine++;
                                    alt = {
                                        ...alt,
                                        elsecase:command.case,
                                        else:getCommandBlock()
                                    }
                                }
                                currentLine++;
                            }
                            cmdlist.push(alt);
                            //eob=true;
                            break;
                        case "else":
                        case "end":
                            eob=true;
                            break;
                        default:
                            cmdlist.push(command);
                            currentLine++;
                            break;
                    }
                }
                else
                    currentLine++;
            }
        } while(line!=undefined && !eob);
        return cmdlist;
    }
    let getLexemeName = function(name){
        return replaceAll(replaceAll(replaceAll(name.trim(),'\"',""),'\'',""),"ё","е");
    }
    let lexemeSet=[
        {
            type:"none",
            exp:/^\s*$/
        },
        {
            type:"def only",
            exp:/^(actor|participant|database)\s+(.+)/i, //[\w\dа-я\s"'«»\\\/\-]
            fn:function(match){
                return({
                    type:"definition",
                    def:getLexemeName(match[1]),
                    name:getLexemeName(match[2]),
                    alias:match[2].trim()
                });
            }
        },
        {
            type:"def full",
            exp:/^(actor|participant|database)\s+(.+)\s+as\s+(.+)$/i,
            fn:function(match){
                return({
                    type:"definition",
                    def:getLexemeName(match[1]),
                    name:getLexemeName(match[2]),
                    alias:match[3].trim()
                });
            }
        },
        {
            type:"action",
            exp:/^([\w\dа-я\s"']+)\s*(->|-->|->>)\s*([\w\dа-я\s"']+)\s*:\s*(.+)$/i,
            fn:function(match){
                //console.log(match);
                return({
                    type:"iteraction",//match[2],
                    master:getLexemeName(match[1]),
                    slave:getLexemeName(match[3]),
                    action:match[4].trim()
                });
            }
        },
        {
            type:"action data",
            exp:/^([\w\dа-я\s"']+)\s*(->|-->|->>)\s*([\w\dа-я\s"']+)\s*:\s*(.+)\s\((.*)\)$/i,
            fn:function(match){
                //console.log(match);
                return({
                    type:"iteraction",//match[2],
                    master:getLexemeName(match[1]),
                    slave:getLexemeName(match[3]),
                    action:match[4].trim(),
                    data:match[5].trim()
                });
            }
        },
        {
            type:"action back",
            exp:/^([\w\dа-я\s"']+)\s*(<-|<--|<<-)\s*([\w\dа-я\s"']+)\s*:\s*(.+)$/i,
            fn:function(match){
                //console.log(match);
                return({
                    type:"iteraction",//match[2],
                    master:getLexemeName(match[3]),
                    slave:getLexemeName(match[1]),
                    action:match[4].trim()
                });
            }
        },
        {
            type:"action back data",
            exp:/^([\w\dа-я\s"']+)\s*(<-|<--|<<-)\s*([\w\dа-я\s"']+)\s*:\s*(.+)\s\((.*)\)$/i,
            fn:function(match){
                //console.log(match);
                return({
                    type:"iteraction",//match[2],
                    master:getLexemeName(match[3]),
                    slave:getLexemeName(match[1]),
                    action:match[4].trim(),
                    data:match[5].trim()
                });
            }
        },
        {
            type:"alt|opt|else|end only",
            exp:/^(alt|opt|else|end)$/i,
            fn:function(match){
                return({
                    type:match[1]
                });
            }
        },
        {
            type:"alt|opt|else named",
            exp:/^(alt|opt|else)\s+(.+)$/i,
            fn:function(match){
                return({
                    type:match[1],
                    case:match[2].trim()
                });
          }
        }
    ];
    let getLexeme = function(line){
      let result;
      let match;
      if(!line) return;
      lexemeSet.forEach((lexeme)=>{
        let m = line.match(lexeme.exp);
        //console.log(line," @ ", lexeme.type, " $ ", match);
        if(m && m.length>0) {
            result = lexeme;
            match = m;
        }
      });
      if(result && typeof result.fn == "function"){
        return result.fn(match);
      }
    }    
    let addswimline = function(name){
        let params = $.logicgetbyname(name);
        if(!params){
            params = {
                id: $.newguid(),
                datatype:"element",
                name:name,
                type:"Автоматизированная система",
                state:"new",
                datatype3:"application",
            }
        }
        if(!$.hasviewpageparam(params)){
            $.logicaddswimline(params);
        }
        return params;
    }
    $.fn.addlinedata = function(){
        var p = $(this).storeget();
        var viewdata = {};
        viewdata[$.pagemenu()]={
            order:$("#" + p.container).lastentityindex()
        };
        let ldid = $.newguid();
        var dataparam={
            id: ldid,
            name:"Данные",
            datatype:"linedata",
            parentel:p.id,
            container:p.container,
            viewdata:viewdata
        };
        $.storeset(dataparam);
        $("#"+ldid).setviewpageparam({
            x:getFloat($("#"+ldid).attr("x")),
            y:getFloat($("#"+ldid).attr("y"))
        }); // store update
 
        var parammenu = $.getviewpageparam(p);
        var lineviewdata = {};
        lineviewdata[$.pagemenu()]={
            order:$("#" + p.container).lastentityindex(),
            direction:parammenu.direction??"f"//f, r
        };
        $.storeset({
            id: $.newguid(),
            name:"Коннектор",
            datatype:"line",
            datatype2:"simple",
            function:"supply",//supply, consumer
            container:p.container,
            startel:p.startel,
            starttype:p.starttype,
            endel:dataparam.id,
            endtype:dataparam.datatype,
            interaction:"Синхронное",
            viewdata:lineviewdata
        });
 
        lineviewdata[$.pagemenu()]={
            order:$("#" + p.container).lastentityindex(),                                
            direction:parammenu.direction??"f"//f, r
        };
        $.storeset({
            id: $.newguid(),
            name:"Коннектор",
            datatype:"line",
            datatype2:"simple",
            function:"supply",//supply, consumer
            container:p.container,
            startel:dataparam.id,
            starttype:dataparam.datatype,
            endel:p.endel,
            endtype:p.endtype,
            interaction:"Синхронное",
            viewdata:lineviewdata
        });
    }
    $.fn.adddata = function(){
        var p = $(this).storeget();
        var viewdata = {};
        viewdata[$.pagemenu()]={
            order:$("#" + p.container).lastentityindex()                                  
        };
        var dataparam = {
            name:"Данные",
            datatype:"data",
            parentel:p.id,
            container:p.container,
            viewdata:viewdata
        }
        //$.storeset(dataparam);
        let ldid = $("#" + p.container).logicaddtoswimline(dataparam,this,"up,right");
        $("#"+ldid).setviewpageparam({
            x:getFloat($("#"+ldid).attr("x")),
            y:getFloat($("#"+ldid).attr("y"))
        }); // store update
        var lineviewdata = {};
        lineviewdata[$.pagemenu()]={
            order:$("#" + p.container).lastentityindex(),                                
            direction:"f" //f, r
        };
 
        $.storeset({
            id: $.newguid(),
            name:"Коннектор",
            datatype:"line",
            datatype2:"simple",
            function:"supply",//supply, consumer
            container:p.container,
            startel:dataparam.id,
            starttype:dataparam.datatype,
            startdx:0.5,
            startdy:1,
            endel:p.id,
            endtype:p.datatype,
            enddx:0.5,
            enddy:0,
            interaction:"Синхронное",
            viewdata:lineviewdata
        });
    }
    let getLastByHeight = function(lastel){
        let ll;
        let maxy=0;
        lastel.forEach((l)=>{
            let y = getFloat($(l).attr("y")) + getFloat($(l).attr("height"));
            if(y>maxy){
                maxy=y;
                ll=l;
            }
        });
        return ll;
    }
    let lexlist = getCommandBlock();
    //console.log(lexlist);
    //return;
    let processDiagram = function(llist, currentline, lastel, casetext, floating){
        let tdata;
        llist.forEach((item)=>{
            switch(item.type){
                case "definition":
                    if(item.def=="participant"){
                        let cl=addswimline(item.name);
                        if(!currentline)
                            currentline = cl;
                    }
                    break;
                case "iteraction":
                    let actor;
                    let master = lexlist.find(e=>(e.type=="definition" && e.alias==item.master))??{name:item.master,def:"participant"};
                    if(master.def=="participant") master.id = addswimline(master.name).id; else actor = master;
                    let slave = lexlist.find(e=>(e.type=="definition" && e.alias==item.slave))??{name:item.slave,def:"participant"};
                    if(slave.def=="participant") slave.id = addswimline(slave.name).id; else actor = slave;
 
                    let cl = currentline;
                    if(master.def=="participant")
                        currentline = master;
                    else if(slave.def=="participant")
                        currentline = slave;
 
                    //if(!currentline.id) debugger;
                    if(currentline){
                        if(!lastel || lastel.length==0){
                            //добавляем старт
                            let lid = $("svg#" + currentline.id).logicaddtoswimline({
                                name: "Начало процесса",
                                datatype: "start-process",
                                state:"new",
                            });
                            lastel = [$("svg#" + lid)];
                        }
                        // если последние элементы не из мастера, ищем последний в мастере
                        /*if(cl && cl.id!=currentline.id)
                        {
                            lastel=[$("svg#" + currentline.id).logicgetlastofswimline()];
                        }*/
 
                        let data;
                        if(item.data){
                            data = item.data.split(',').map(e=>({id:$.newguid(),name:e}));
                        }
                        let isfn = (data && data.length>0 || lastel.length>1 || $(lastel[0]).attr("data-container")!=currentline.id || actor && actor.def=="actor");
                        let fnid,fn;
                        /*if($.pagenotation()=="bpmn" && actor && actor.def=="actor"){
                            fnid = $("svg#" + currentline.id).logicaddtoswimline({
                                name: item.action,
                                datatype: "picture",
                                src:"images/e-user.png",
                                state:"new",
                                data:data
                            },getLastByHeight(lastel),floating,casetext);
                            fn = $("svg#" + fnid);
                        }
                        else*/{
                            fnid = $("svg#" + currentline.id).logicaddtoswimline({
                                name: item.action,
                                datatype: isfn?"function":"functionstep",
                                state:"new",
                                data:data
                            },getLastByHeight(lastel),floating,casetext);
                            fn = $("svg#" + fnid);
                            if(data && data.length>0 && $.pagenotation()!="bpmn")
                                $(fn).adddata();
                            if(actor && actor.def=="actor"){
                                let aid = $("svg#" + currentline.id).logicaddtoswimline({
                                    name: actor.name,
                                    datatype: "picture",
                                    src:"images/e-user.png",
                                    description:item.action,
                                    state:"new",
                                },fn,"middle,left");
                                let alid;
                                if(actor==master)
                                    alid = $.lineaddconnector($("svg#" + aid),fn/*,{data:data}*/);
                                else
                                    alid = $.lineaddconnector(fn,$("svg#" + aid)/*,{data:data}*/);
                                /*if(data && data.length>0)
                                    $("#" + alid).addlinedata();*/
    
                            }
                        }
                        if(lastel){
                            lastel.forEach((l)=>{
                                let lid = $.lineaddconnector(l,fn, {name:casetext,data:tdata});
                                //console.log(currentline.id,$(l).attr("data-container"));
                                if(tdata && tdata.length>0 && currentline.id!=$(l).attr("data-container")){
                                    $("#" + lid).addlinedata();
                                }
                            });
                        }
                        casetext="";
                        floating="";
                        lastel = [fn];
                        tdata=data;
 
                        if(slave.def=="participant")
                            currentline = slave;
                    }
                    break;
                case "alt":
                    if(currentline){
                        if(!lastel || lastel.length==0){
                            //добавляем старт
                            let lid = $("svg#" + currentline.id).logicaddtoswimline({
                                name: "Начало процесса",
                                datatype: "start-process",
                                state:"new",
                            });
                            lastel = [$("svg#" + lid)];
                        }
                        //добавляем условие
                        let caseid = $("svg#" + currentline.id).logicaddtoswimline({
                            name: "Ветвление процесса",
                            datatype: "xor-process",
                            state:"new",
                        },getLastByHeight(lastel), floating, casetext);
                        let cs = $("svg#" + caseid);
                        if(lastel){
                            lastel.forEach((l)=>{
                                $.lineaddconnector(l,cs,{name:casetext});
                            });
                        }
                        floating="";
                        casetext = "";
                        lastel=[];
                        if(item.alt){
                            let [, lst] = processDiagram(item.alt,currentline,[...[cs]],item.altcase,"left");
                            lastel = lastel.concat(lst);
                        }
                        if(item.else){
                            let [, lst] = processDiagram(item.else,currentline,[...[cs]],item.elsecase,"right");
                            lastel = lastel.concat(lst);
                        }
                        if(!item.alt || !item.alt)
                            lastel.push(cs);
                    }
                break;
            }
            $(canvas).svgfitcanvas();
            //debugger;
 
        });
        return[currentline, lastel];
    }
    let [currentline, lastel] = processDiagram(lexlist,undefined,[]);
    if(currentline){
        //добавляем окончание
        let fnid = $("svg#" + currentline.id).logicaddtoswimline({
            name: "Окончание процесса",
            datatype: "end-process",
            state:"new",
        },getLastByHeight(lastel));
        let fn = $("svg#" + fnid);
        if(lastel){
            lastel.forEach((l)=>{
                $.lineaddconnector(l,fn);
            });
        }
    }
    $(canvas).svgfitcanvas();
    clearhistory();
    return true;
}
var sysType;
$.systemtypedictionary = function(){
    if(!sysType){
        getDictionaryItems({
            async:false,
            name:"Тип АС",
            term:"",
            length:100,
            success:function(result){
                sysType = result;
            }
        });
    }
    return sysType;
}
var componentType;
$.componenttypedictionary = function(){
    if(!componentType){
        getDictionaryItems({
            async:false,
            name:"Каталог типов платформ",
            term:"",
            length:100,
            success:function(result){
                componentType = result;
            }
        });
    }
    return componentType;
}
var securityType;
$.securitytypedictionary = function(){
    if(!securityType){
        getDictionaryItems({
            async:false,
            name:"Каталог классификаторов безопасности",
            term:"",
            length:100,
            success:function(result){
                securityType = result;
            }
        });
    }
    return securityType;
}
var podType;
$.poddictionary = function(){
    if(!podType){
        getDictionaryItems({
            async:false,
            name:"Каталог ПОД",
            term:"",
            length:100,
            success:function(result){
                podType = result;
            }
        });
    }
    return podType;
}
var intplatformlist;
$.intplatformdictionary = function(){
    if(!intplatformlist){
        getDictionaryItems({
            async:false,
            name:"Каталог интеграционных платформ",
            term:"",
            length:100,
            success:function(result){
                intplatformlist = result;
            }
        });
    }
    return intplatformlist;
}
