
var propertyFn="default";
var clientMinWidth = 150;
var clientClosedWidth = 26;
var propertyPage=undefined;
var propertyget = function(type){
    var params = {};
    switch(type){
        case "zone":
            params={
                id:$("#zoneName").attr("data-id"),
                sysid:$("#zoneName").attr("data-sysid"),
                name:$("#zoneName").val(),
                color: $("#zoneColor").val(),
                description: $("#zonePurpose").val()
            }
            break;
        case "datacenter":
            params={
                id:$("#datacenterName").attr("data-id"),
                sysid:$("#datacenterName").attr("data-sysid"),
                name:$("#datacenterName").val(),
                color: $("#datacenterColor").val(),
                description: $("#datacenterPurpose").val()
            }
            break;
        case "picture":
            params={
                id:$("#pictureName").attr("data-id"),
                sysid:$("#pictureName").attr("data-sysid"),
                name:$("#pictureName").val(),
                src:$("#pictureSrc").val(),
                description: $("#picturePurpose").val(),
                href:undefined
            }
            break;
        case "document":
            params = $.storeget($("#documentName").attr("data-id"));
            if($.pagemenuname()=="business"){
                var parammenu=$.getviewpageparam(params);
                parammenu=$.extend(parammenu,{
                    name:$("#businessName").val(),
                    description:$("#businessDescription").val(),
                    notation:$("#businessNotation").val()
                });
            }
            else{
                params=$.extend(params,{
                    sysid:$("#documentName").attr("data-sysid"),
                    name:$("#documentName").val(),
                    description:$("#documentDescription").val(),
                    project:$("#projectName").val(),
                    version:$("#doc_version").val(),
                    author:$("#doc_author").val(),
                    editors:[],
                    docversion:params.docversion??currentVersion
                },$.documentgettype($("#doc_type").val()));
                if($.isnull(params.login,"")=="")
                    params.login=$.isnull($.currentuser().login,"");
                $("#documentUsers li").each(function(i,e){
                    params.editors.push({
                        login:$(e).attr("data-login"),
                        name:$(e).attr("data-name")
                    });
                });
            }
            break;
        case "element":
            params = {
                id:$("#elementName").attr("data-id"),
                sysid:$("#elementName").attr("data-sysid"),
                name:$("#elementName").val(),
                datatype3:($("#sys_type").val()==""?"application":$("#sys_type").val()),
                description:$("#elementPurpose").val(),
                location:$("#sys_location").val(),
                template:$("#elementTemplate").find("[data-id='templateFile']").val(),
                realization:$("#sys_realization").val(),
                functions:[],
                data:[],
                components: [],
                metrics: [],
                templates: []
            };
            var p=$.storeget(params.id);
            if(p.datatype3=="collaboration"){
                params.functions=p.functions;
                params.data=p.data;
                params.components=p.components;
                params.metrics = p.metrics;
                params.templates=p.templates;
            }
            if(p.datatype3=="template"){
                params.functions=p.functions;
                params.data=p.data;
                params.components=p.components;
                params.metrics = p.metrics;
                params.templates = $("#elementTemplate").getTemplateParams(p.templates);
            }
            else{
                params.templates=p.templates;
                if($.pagemenuname()=="business" || $.pagemenuname()=="interface" || $.pagemenuname()=="concept" || $.pagemenuname()=="database" || $.pagemenuname()=="development"){
                    $("#elementFunction li").each(function(i,e){
                        var value=$(e).find("input[type='checkbox']");
                        if($(value).prop("checked")){
                            params.functions.push({
                                id:$(value).attr("data-id"),
                                name:$(e).find("input[type='text']").val(),
                                state:$(value).attr("data-state"),
                                type:$(value).attr("data-type"),
                                connection:$(value).attr("data-connection"),
                                interaction:$(value).attr("data-interaction"),
                                method:$(value).attr("data-method"),
                                methodtype:$(value).attr("data-methodtype"),
                                description:$(value).attr("data-description")
                            });
                        }
                    });
                }
                else
                    params.functions=p.functions;

                if($.pagemenuname()=="interface" || $.pagemenuname()=="concept" || $.pagemenuname()=="database" || $.pagemenuname()=="development"){
                    $("#interfaceData li").each(function(i,e){
                        var value=$(e).find("input[type='checkbox']");
                        if($(value).prop("checked")){
                            params.data.push({
                                id:$(value).attr("data-id"),
                                name:$(value).attr("data-name"),
                                state:$(value).attr("data-state"),
                                flowtype: $(value).attr("data-flowtype"),
                                securitytype: $(value).attr("data-securitytype"),
                                pod: $(value).attr("data-pod")
                            });
                        }
                    });
                    $("#elementData li").each(function(i,e){
                        var value=$(e).find("input[type='checkbox']");
                        if($(value).prop("checked")){
                            params.data.push({
                                id:$(value).attr("data-id"),
                                name:$(value).attr("data-name"),
                                state:$(value).attr("data-state"),
                                flowtype: $(value).attr("data-flowtype"),
                                securitytype: $(value).attr("data-securitytype"),
                                pod: $(value).attr("data-pod")
                            });
                        }
                    });
                }
                else{
                    params.data=p.data;
                }
                if ($.pagemenuname() == "system") {
                    $("#ownElementComponent li, #elementComponent li").each(function (i, e) {
                        var value = $(e).find("input[type='checkbox']");
                        if ($(value).prop("checked")) {
                            let item = {
                                id: $(value).attr("data-id"),
                                name: $(value).attr("data-name"),
                                type: $(value).attr("data-type"),
                                state: $(value).attr("data-state"),
                                data: JSON.parse($(value).attr("data-data")),
                                values: {}
                            }
                            $.each(item.data, function (i1, e1) {
                                item.values[e1.type] = {
                                    value: splitNames(item.values[e1.type]?.value, e1.value),
                                    desc: e1.desc,
                                    state: $.logicStateMapping(item.values[e1.type]?.state, e1.state)
                                }
                                item.state = $.logicStateMapping(item.state, e1.state);
                            });
                            params.components.push(item);
                        }
                    });
                    $("#elementMetric tr").each(function (i, e) {
                        let n = $(e).find("td[data-type='name']");
                        let item = {
                            name: $(n).text().trim(),
                            alias: $(n).attr("data-alias"),
                            requared : $(n).attr("data-requared"),
                            value: $(e).find("input[data-type='value']").val()
                        }
                        //if(item.value!="")
                            params.metrics.push(item);
                    });
                }
                else {
                    params.components = p.components;
                    params.metrics = p.metrics;
                }
            }
            break;
        case "subprocess":
            let tf = $("#subprocessTemplate").find("[data-id='templateFile']");
            params = {
                id:$("#subprocessName").attr("data-id"),
                sysid:$("#subprocessName").attr("data-sysid"),
                name:$("#subprocessName").val(),
                filename:$(tf).val(),
                filesysid:$(tf).attr("data-sysid"),
                description:$("#subprocessPurpose").val()
            }
            break;
        case "server":
            params={
                id:$("#serverName").attr("data-id"),
                sysid:$("#serverName").attr("data-sysid"),
                name:$("#serverName").val(),
                description:$("#serverPurpose").val(),
                ip:$("#server_ip").val(),
                os:$("#server_os").val(),
                env:$("#server_env").val(),
                elements:[]
            }
            $("#serverElement li").each(function(i,e){
                var value=$(e).find("input[type='checkbox']");
                if($(value).prop("checked")){
                    params.elements.push({
                        id:$(value).attr("data-id"),
                        name:$(e).find("input[type='text']").val(),
                        type:$(value).attr("data-type"),
                        state:$(value).attr("data-state"),
                        os:$(value).attr("data-os"),
                        env:$(value).attr("data-env")
                    });
                }
            });
            break;
        case "cluster":
            params={
                id:$("#clusterName").attr("data-id"),
                sysid:$("#clusterName").attr("data-sysid"),
                name:$("#clusterName").val(),
                description:$("#clusterPurpose").val(),
                copytype:$("#cluster_copytype").val(),
                clustertype:$("#cluster_clustertype").val(),
                storeclass:$("#cluster_storeclass").val()
            }
            break;
        case "comment":
            params = {
                id:$("#commentName").attr("data-id"),
                sysid:$("#commentName").attr("data-sysid"),
                name:$("#commentName").val(),
                description:$("#commentPurpose").val()
            }
            break;
        case "function":
        case "functionstep":
                params = {
                id:$("#functionName").attr("data-id"),
                sysid:$("#functionName").attr("data-sysid"),
                state:$("#functionName").attr("data-state"),
                name:$("#functionName").val(),
                data:[]
            }
            var element = $.storeget($("#"+params.id).attr("data-container"));
            $("#functionData li, #functionInterfaceData li").each(function(i,e){
                var value=$(e).find("input[type='checkbox']");
                if($(value).prop("checked")){
                    var fn={
                        id:$(value).attr("data-id"),
                        name:$(value).attr("data-name"),
                        state:$(value).attr("data-state"),
                        flowtype: $(value).attr("data-flowtype"),
                        securitytype: $(value).attr("data-securitytype"),
                        pod:$(value).attr("data-pod")
                    }
                    params.data.push(fn);
                    if(element){
                        if(!element.data) element.data=[];
                        if(!$(element.data).objectArrayHasId(fn.id))
                            element.data.push(fn);
                    }
                }
            });
            if(element) storedirectlyset(element.id,element);

            var datacontainer = $("svg[data-type='data'][data-parent='" + params.id + "']");
            if(datacontainer.length==0 && params.data.length>0){
                var p = $.storeget(params.id);
                p.data = params.data;
                storedirectlyset(p.id,p);
                var viewdata = {};
                viewdata[$.pagemenu()]={
                    order:$("#" + p.container).lastentityindex()                                  
                };
                var dataparam = {
                    id: $.newguid(),
                    name:"Данные",
                    datatype:"data",
                    parentel:params.id,
                    container:p.container,
                    viewdata:viewdata
                }
                $.storeset(dataparam);
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
                    endel:params.id,
                    endtype:p.datatype,
                    enddx:0.5,
                    enddy:0,
                    interaction:"Синхронное",
                    viewdata:lineviewdata
                });
                $.historycloseputtransaction();
            }
            if(datacontainer.length>0 && params.data.length==0){
                $.storeremove($(datacontainer).prop("id"));
                $.propertysmartshow();
            }
            break;
        case "line":
            params={
                id:$("#lineName").attr("data-id"),
                sysid:$("#lineName").attr("data-sysid"),
                name:$("#lineName").val(),
                datatype3:$("#line_type").val(),
                state:$("#lineName").attr("data-state"),
                number:$("#lineNumber").val(),
                data:[],
                datar:[],
                interface:[],
                endfn:$("#supplyService").val(),
                startfn:$("#consumerService").val(),
                supplyint:$("#int_supplyconnection").val(),
                consumerint:$("#int_consumerconnection").val(),
                consumermethod:$("#int_consumermethod").val(),
                consumermethodtype:$("#int_consumermethodtype").val(),
                intplatform:$("#int_integrationplatform").val(),
                interaction:$("#int_integrationtype").val(),
                docref:$("#int_docref").val(),
                template:$("#lineTemplate").find("[data-id='templateFile']").val(),
                templates:[]
            };
            if ($("#cbLineDirect").prop("checked"))
                params.datatype2="direct";
            else if ($("#cbLineCurved").prop("checked"))
                params.datatype2="curved";
            else
                params.datatype2="rectangle";

            var p=$.storeget(params.id);
            if(p.datatype3=="template"){
                $("div.lineProperty [data-type*='line']").hide();
                $("div.lineProperty [data-type*='template']").show();
                params.templates = $("#lineTemplate").getTemplateParams(p.templates);
            }
            else{
                $("div.lineProperty [data-type*='line']").show();
                $("div.lineProperty [data-type*='template']").hide();
                params.templates=p.templates??[];
            }
            if($.pagemenuname()=="interface" || $.pagemenuname()=="business"){
                $("#lineData li").each(function(i,e){
                    var value=$(e).find("input[type='checkbox']");
                    if($(value).prop("checked")){
                        params.data.push({
                            id:$(value).attr("data-id"),
                            name:$(value).attr("data-name"),
                            state:$(value).attr("data-state"),
                            securitytype: $(value).attr("data-securitytype"),
                            pod:$(value).attr("data-pod")
                        });
                    }
                });
                $("#interfaceSystemData li").each(function(i,e){
                    var value=$(e).find("input[type='checkbox']");
                    if($(value).prop("checked")){
                        params.data.push({
                            id:$(value).attr("data-id"),
                            name:$(value).attr("data-name"),
                            state:$(value).attr("data-state"),
                            securitytype: $(value).attr("data-securitytype"),
                            pod:$(value).attr("data-pod")
                        });
                    }
                });
                $("#lineDatar li").each(function(i,e){
                    var value=$(e).find("input[type='checkbox']");
                    if($(value).prop("checked")){
                        params.datar.push({
                            id:$(value).attr("data-id"),
                            name:$(value).attr("data-name"),
                            state:$(value).attr("data-state"),
                            securitytype: $(value).attr("data-securitytype"),
                            pod:$(value).attr("data-pod")
                        });
                    }
                });
                $("#interfaceSystemDatar li").each(function(i,e){
                    var value=$(e).find("input[type='checkbox']");
                    if($(value).prop("checked")){
                        params.datar.push({
                            id:$(value).attr("data-id"),
                            name:$(value).attr("data-name"),
                            state:$(value).attr("data-state"),
                            securitytype: $(value).attr("data-securitytype"),
                            pod:$(value).attr("data-pod")
                        });
                    }
                });
            }
            else{
                params.data=p.data??[];
                params.datar=p.datar??[];
            }
            if($.pagemenuname()=="function"){
                $("#gateInterfaceData li").each(function(i,e){
                    var value=$(e).find("input[type='checkbox']");
                    if($(value).prop("checked")){
                        params.interface.push({
                            id:$(value).attr("data-id"),
                            name:$(value).attr("data-name"),
                            state:$(value).attr("data-state"),
                            number: $(value).attr("data-number")
                        });
                    }
                });
            }
            else{
                params.interface=p.interface??[];
            }
            if($.pagemenuname()=="business"){
                var datacontainer = $("svg[data-type='linedata'][data-parent='" + params.id + "']");
                if(datacontainer.length==0 && params.data.length>0){
                    var p = $.storeget(params.id);
                    p.data = params.data;
                    storedirectlyset(p.id,p);
                    var viewdata = {};
                    viewdata[$.pagemenu()]={
                        order:$("#" + p.container).lastentityindex()
                    };
                    var dataparam={
                        id: $.newguid(),
                        name:"Данные",
                        datatype:"linedata",
                        parentel:params.id,
                        container:p.container,
                        viewdata:viewdata
                    };
                    $.storeset(dataparam);
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
                if(datacontainer.length>0 && params.data.length==0){
                    $.storeremove($(datacontainer).prop("id"));
                    //$.propertysmartshow();
                }
            }
            break;
        case "linedata":
            params = {
                id:$("#linedataName").attr("data-id"),
                sysid:$("#linedataName").attr("data-sysid"),
                name:$("#linedataName").val(),
                data:[]
            }
            $("#ldData li").each(function(i,e){
                var value=$(e).find("input[type='checkbox']");
                if($(value).prop("checked")){
                    params.data.push({
                        id:$(value).attr("data-id"),
                        name:$(value).attr("data-name"),
                        state:$(value).attr("data-state"),
                        securitytype: $(value).attr("data-securitytype"),
                        pod:$(value).attr("data-pod")
                    });
                }
            });
            $("#ldinterfaceSystemData li").each(function(i,e){
                var value=$(e).find("input[type='checkbox']");
                if($(value).prop("checked")){
                    params.data.push({
                        id:$(value).attr("data-id"),
                        name:$(value).attr("data-name"),
                        state:$(value).attr("data-state"),
                        securitytype: $(value).attr("data-securitytype"),
                        pod:$(value).attr("data-pod")
                    });
                }
            });
            break;
        case "start-process":
        case "clock-start":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
            params = {
                id:$("#logicName").attr("data-id"),
                sysid:$("#logicName").attr("data-sysid"),
                name:$("#logicName").val(),
                description:$("#logicPurpose").val()
            }
            break;
        
    }
    params.datatype=type;
    return params;
}
$.propertyset = function(params, reload){
    if(!$.ispropertyshown()) return;
    var container = propertyPage;
    $(container).find("div.propertyHolder").hide();
 
    var selectedArray = $.getselected();
    var selected = undefined;
    if(selectedArray.length==1){
        selected=selectedArray[0];
        switch($(selected).attr("data-type")){
            case "linedata":
            case "data":
                var parent = $(selected).attr("data-parent");
                if(parent && parent!=""){
                    //$.unselect();
                    //$("#" + parent).select();
                    let p=$("#" + parent);
                    if(p.length>0)
                        selected=p;
                }
                break;
        };
    }
    else{
        $.propertyhide();
        return;
    }
    //console.trace($(selected).attr("data-type"));

    $(propertyPage).propertyItemStatus($(selected).attr("data-type"));

    switch($(selected).attr("data-type")){
        case "document":
            $("input.propertyName:not(#documentName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).documentget();
            $("#documentName").attr({
                "data-id":params.id,
                "data-sysid":params.sysid
            });
            if($.pagemenuname()=="business"){
                var parammenu = $.getviewpageparam(params);
                $("#businessName").val(parammenu.name);
                $("#businessDescription").val(parammenu.description);
                $("#businessNotation").val(parammenu.notation);

                $(container).find("div.businessProperty").show();
                $("#businessSystem").empty();
                var list=[];
                $.each($.storekeys(),function(i,id){
                    var param = $.storeget(id);
                    if(param.datatype=="element" && ($.hasviewpageparam(param,"interface") || $.hasviewpageparam(param)))
                        list.push(param);
                });
                var menu=$.pagemenu();
                $.each(list.sort(function(a,b){
                    if(a.name<b.name) return -1;
                    if(a.name>b.name) return 1;
                    return 0;
                }),function(i,e){
                    var input = $("<input>",{
                        checked:(!isemptyobject(e.viewdata[menu])),
                        type:"checkbox",
                        "data-id":e.id,
                        "data-state":e.state,
                        name:"system",
                        "data-name":e.name
                    });
                    $(input).change(function(){
                        if($(input).prop("checked")){
                            $.logicaddswimline(e);
                            $.historycloseputtransaction();
                        }
                        else{
                            if(!deleteondocument($("#" + e.id)))
                                $(input).prop("checked",true);
                        }
                    });
                    var link;
                    if(e.sysid && getInt(e.sysid)!=0){
                        link = $("<a>",{
                            title:"Открыть карточку системы",
                            target:"_blank",
                            href:"system.html?id=" + e.sysid,
                            class:"entity4link"
                        }).append($("<img>",{
                            src: "images/extlink.png"
                        }));
                    }
                    
                    $("#businessSystem").append(
                        $("<li>").append(
                            $(input),
                            e.name,
                            $(link)
                        )
                    );
                });
            }
            else{
                $("#documentName").val(params.name);
                $("#documentDescription").val(params.description);
                $("#doc_type").val(params.typeid);
                $("#projectName").val(params.project);
                $("#doc_version").val(params.version);
                $("#doc_author").val(params.author);
                
                $("#documentUsers").empty();
                $.each(params.editors,function(i,e){
                    propertyadduser(e);
                });
                $(container).find("div.documentProperty").show();
            }
            break;
        case "zone":
            $("input.propertyName:not(#zoneName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
                //console.log("get: ",params.name, ">", params.description, "=", $("#zonePurpose").val());
            //if(params.id!=$("#zoneName").attr("data-id") || params.sysid!=$("#zoneName").attr("data-sysid") || !params.sysid || reload){
                $("#zoneName").attr({
                    "data-id":params.id,
                    "data-sysid":getInt(params.sysid)
                });
                $("#zoneName").val(params.name);
                $("#zonePurpose").val(params.description);
                $("#zoneColor").minicolors("value",{color:params.color});
                $("#zoneColor").val(params.color);
                //console.log("set: ",params.name, ">", params.description, "=", $("#zonePurpose").val());
            //}
            $(container).find("div.zoneProperty").show();
            break;
        case "datacenter":
            $("input.propertyName:not(#datacenterName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
                $("#datacenterName").attr({
                    "data-id":params.id,
                    "data-sysid":getInt(params.sysid)
                });
                $("#datacenterName").val(params.name);
                $("#datacenterPurpose").val(params.description);
                $("#datacenterColor").minicolors("value",{color:params.color});
                $("#datacenterColor").val(params.color);
            $(container).find("div.datacenterProperty").show();
            break;
        case "picture":
            $("input.propertyName:not(#pictureName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).storeget();
            if(params.id!=$("#pictureName").attr("data-id") || params.sysid!=$("#pictureName").attr("data-sysid") || !params.sysid){
                $("#pictureName").attr({
                    "data-id":params.id,
                    "data-sysid":getInt(params.sysid)
                });
                $("#pictureName").val(params.name);
                $("#pictureSrc").val(params.src);
                $("#picturePurpose").val(params.description);
            }
            $(container).find("div.pictureProperty").show();
            break;
        case "function":
        case "functionstep":
            $("input.propertyName:not(#functionName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
            if(params && params.id!=$("#functionName").attr("data-id") || params.sysid!=$("#functionName").attr("data-sysid") || params.state!=$("#functionName").attr("data-state") || !params.sysid || reload){
                //console.log(params);
                $("#functionName").attr({
                    "data-id":params.id,
                    "data-sysid":getInt(params.sysid),
                    "data-state":params.state,
                    "container-id":params.container
                });
                if(params.sysid && getInt(params.sysid)!=0){
                    $("#functionLink").attr({
                        href:"function.html?id="+params.sysid
                    });
                    $("#functionLink").show();
                }
                else
                    $("#functionLink").hide();

                $("#functionStatus").attr({
                    "data-state": params.state
                });
                $("#functionName").val(params.name);
                var scrollTop = $(container).find("div.functionProperty").scrollTop();
                $("#functionData").empty();
                $("#functionInterfaceData").empty();
                var showedData=[];
                if(params.container){
                    var paramcontainer = $.storeget(params.container);
                    if(paramcontainer){
                        getSystemDataList({
                            systemid:paramcontainer.sysid,
                            length:1000000,
                            success:function(result){
                                if(paramcontainer.data){
                                    $.each(paramcontainer.data,function(ie,e){
                                        var i = -1;
                                        $.each(result, function(ir,r){
                                            if(ie==0){
                                                r.saved=true;
                                            }
                                            if(e.id==r.id) {
                                                i=ir;
                                                e.name=r.name;
                                                e.saved=true;
                                            }
                                        });
                                        if(i!=-1){
                                            result.splice(i,1);
                                        }
                                        result.push($.extend({},e,{
                                            checked:false
                                        }));
                                    })
                                }
                                if(params.data){
                                    $.each(params.data,function(ie,e){
                                        var i = -1;
                                        $.each(result, function(ir,r){
                                            if(ie==0){
                                                r.saved=true;
                                            }
                                            if(e.id==r.id) {
                                                i=ir;
                                                e.name=r.name;
                                                e.saved=true;
                                            }
                                        });
                                        if(i!=-1){
                                            result.splice(i,1);
                                        }
                                        result.push($.extend({},e,{
                                            checked:true
                                        }));
                                    });
                                }
                                var filter = "";//$("#elementDataFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                $("#functionData").empty();
                                if(!result) result=[];
                                $.each(result.sort(function(a,b){
                                    return a.name>b.name ? 1: -1
                                }),function(i,e){
                                    var visible = (filter=="" || re.exec(e.name)!=null);
                                    $("#functionData").propertyadditem($.extend(e,{
                                        visible:visible,
                                        typename:"data",
                                        mode:$("#functionDataSelection").attr("data-mode")
                                    }));
                                    showedData.push(e.id);
                                });
                            },
                            error:function(message){
                                $("#functionData").empty();
                            }
                        });
                    }
                }
                var datalist=[];
                $("g[data-type='line'][data-start='"+params.id+"']").each(function(i,e){
                    var param = $.storeget($(e).prop("id"));
                    var parammenu = $.getviewpageparam(param);
                    if(parammenu.direction=="r"){
                        $.each(param.data,function(di,dt){
                            if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
                        });
                    }
                    if(parammenu.direction=="f"){
                        $.each(param.datar,function(di,dt){
                            if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
                        });
                    }
                });  
                $("g[data-type='line'][data-end='"+params.id+"']").each(function(i,e){
                    var param = $.storeget($(e).prop("id"));
                    var parammenu = $.getviewpageparam(param);
                    if(parammenu.direction=="f"){
                        $.each(param.data,function(di,dt){
                            if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
                        });
                        //linedata
                        if(param.starttype=="linedata"){
                            var ld = $.storeget(param.startel);
                            if(ld && ld.data){
                                $.each(ld.data,function(di,dt){
                                    if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
                                });
                            }
                        }
                    }
                    if(parammenu.direction=="r"){
                        $.each(param.datar,function(di,dt){
                            if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
                        });
                    }
                });  

                if(datalist.length>0){
                    $("#functionInterfaceDataPlace").show();
                    $("#functionInterfaceData").empty();
                    $.each(datalist,function(di,dt){
                        $("#functionInterfaceData").propertyadditem($.extend(dt,{
                            typename:"data",
                            /*flowtype:"copy",*/
                            readonly:true,
                            mode:$("#functionDataSelection").attr("data-mode")
                        }));
                    })
                }
                else
                    $("#functionInterfaceDataPlace").hide();
                $(container).find("div.functionProperty").scrollTop(scrollTop);
            }
            $(container).find("div.functionProperty").show();
            $("#functionName").focus();
            $("#functionName")[0].select();
            break;
        case "element":
            $("input.propertyName:not(#elementName)").attr("data-sysid","");
            if(params==undefined){
                params = $(selected).storeget();
            }
            if(params.id!=$("#elementName").attr("data-id") || params.sysid!=$("#elementName").attr("data-sysid") || params.state!=$("#elementName").attr("data-state") || !params.sysid || reload){
                $("#elementFunction").empty();
                $("#elementData").empty();
                $("#elementSupply").empty();
                $("#elementConsumer").empty();
                $("#interfaceData").empty();
                $("#elementComponent").empty();
                $("#ownElementComponent").empty();
                $("#elementMetric").empty();

                $("#elementName").attr({
                    "data-id":params.id,
                    "data-sysid":getInt(params.sysid),
                    "data-state":params.state
                });
                if(params.sysid && params.sysid!=0){
                    $("#elementLink").attr({
                        href:"system.html?id="+params.sysid
                    });
                    $("#elementLink").show();
                }
                else
                    $("#elementLink").hide();

                $("#elementStatus").attr({
                    "data-state": params.state
                });
                $("#elementName").val(params.name);
                //$("#elementFullName").text($.logicGetGlobalName(params));
                /*if(params.container){
                    $("#elementFullName").text($.logicGetGlobalName(params));
                    $("#elementFullName").show();
                    $("#elementRemoveCollaboration").show();
                }
                else{
                    $("#elementFullName").hide();
                    $("#elementRemoveCollaboration").hide();
                }*/
                $("#elementPurpose").val(params.description);
                $("#sys_type").val($.isnull(params.datatype3,"application"));
                $("#sys_location").val(params.location);
                $("#sys_realization").val(params.realization);
                var scrollTop = $(container).find("div.elementProperty").scrollTop();
                $("div.elementProperty div[data-id]").hide();

                if(params.datatype3=="collaboration"){
                    $("div.elementProperty div[data-id='" + params.datatype3 + "']").show();
                }
                else if(params.datatype3=="template"){
                    $("div.elementProperty div[data-id='" + params.datatype3 + "']").show();
                    let templateFile = $("#elementTemplate").find("[data-id=templateFile]");
                    $(templateFile).empty(),
                    getPublishedDocumentList({
                        state:"template",
                        length: 40,
                        success: function (data) {
                            $(templateFile).append($("<option>",{
                                value:"0",
                                text:"",
                            }));
                            $.each(data,function(i,e){
                                $(templateFile).append($("<option>",{
                                    value:e.id,
                                    text:e.name + (e.version?" v" +e.version:""),
                                }));
                            });
                            $(templateFile).val(params.template);
                            $("#elementTemplate").updateTemplateParams();
                        }
                    });
                }
                else{
                    $("div.elementProperty div[data-id='application']").show();
                    if($.pagemenuname()=="business" || $.pagemenuname()=="interface" || $.pagemenuname()=="concept" || $.pagemenuname()=="database" || $.pagemenuname()=="development"){
                        getSystemFunctionList({
                            systemid:params.sysid,
                            length:1000000,
                            success:function(result){
                                if (params.functions) {
                                    $.each(params.functions, function (ie, e) {
                                        var i = -1;
                                        var r;
                                        $.each(result, function (ir, rd) {
                                            if(ie==0){
                                                rd.saved=true;
                                            }
                                            if (e.id == rd.id) {
                                                i = ir;
                                                r=rd;
                                            }
                                        });
                                        if (i != -1 && r) {
                                            result.splice(i, 1);
                                            result.push($.extend({},e, {
                                                checked: true,
                                                connection: r.connection,
                                                type:r.type,
                                                interaction:r.interaction,
                                                saved:r.saved
                                            }));
                                        }
                                        else
                                            result.push($.extend({},e, {
                                                checked: true
                                            }));
                                    });
                                }
                                $("#elementFunction").empty();
                                var filter = $("#elementFunctionFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                if(!result) result=[];
                                $.each(result.sort(function(a,b){
                                    return a.name>b.name ? 1: -1
                                }),function(i,e){
                                    var visible = (filter=="" || re.exec(e.name)!=null);
                                    $("#elementFunction").propertyadditem($.extend(e,{
                                        visible:visible,
                                        typename: "function",
                                        mode:$("#elementFunctionSelection").attr("data-mode"),
                                        addaction:($.pagemenuname()!="business"?undefined:function(){
                                            $.fn.logicaddtoswimline(e);
                                        })
                                    }));
                                });
                                $(container).find("div.elementProperty").scrollTop(scrollTop);
                            },
                            error:function(message){
                                $("#elementFunction").empty();
                            }
                        });
                    }
                    if($.pagemenuname()=="interface" || $.pagemenuname()=="concept" || $.pagemenuname()=="database" || $.pagemenuname()=="development"){
                        getSystemInterfaceListA({
                            sid:params.sysid,
                            length:1000000,
                            success:function(result){
                                $.each($.storekeys(),function(i,id){
                                    var e = $.storeget(id);
                                    if(e.datatype=="line" && ($.hasviewpageparam(e,"interface") || $.hasviewpageparam(e,"concept") || $.hasviewpageparam(e,"database") || $.hasviewpageparam(e,"development"))){
                                        var consumer = undefined;
                                        var supply = undefined;
                                        if(e.function=="consumer"){
                                            consumer = $.storeget(e.startel);
                                            supply = $.storeget(e.endel);
                                        }
                                        else{
                                            supply = $.storeget(e.startel);
                                            consumer = $.storeget(e.endel);
                                        }
                                        if(supply && consumer){
                                            let data=[];
                                            if(e.data) data=e.data.map((item)=>item.name);
                                            $.each(result, function (ir, rd) {
                                                if(e.issupplyreсeive==rd.issupplyreсeive
                                                    && compareString(rd.supplyname,supply.name) 
                                                    && compareString(rd.consumername,consumer.name)
                                                ){
                                                    let rddata=[];
                                                    if(rd.data) rddata=rd.data.map((item)=>item.name);
                                                    rd.checked |= compareString(data.join(','),rddata.join(','));
                                                }
                                            });
                                        }
                                    }
                                });
                                $("#elementSupply").empty();
                                var filter = $("#elementSupplyFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                if(!result) result=[];
                                $.each(result.sort(function(a,b){
                                    return a.name>b.name ? 1: -1
                                }),function(i,e){
                                    var visible = (filter=="" || re.exec(e.name)!=null);
                                    let data = [];
                                    if(e.data) data=e.data.map((item)=>item.name);
                                    $("#elementSupply").propertyadditem($.extend(true,{},e,{
                                        typename:"supply",
                                        readonly:true,
                                        visible:visible,
                                        id:e.sysid,
                                        saved:true,
                                        name:  e.name + ": " + (e.issupplyreсeive?" <- ":" -> ") + e.consumername,
                                        mode:$("#elementSupplySelection").attr("data-mode"),
                                        checkaction:function(check){
                                            if(check) addInterface(e);
                                            else deleteInterface(e);
                                        }
                                    }));
                                });

                                $("#elementContract").empty();
                                var filter = $("#elementContractFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                if(!result) result=[];
                                $.each(result.sort(function(a,b){
                                    return a.name>b.name ? 1: -1
                                }),function(i,e){
                                    var visible = (filter=="" || re.exec(e.name)!=null);
                                    let data = [];
                                    if(e.data) data=e.data.map((item)=>item.name);
                                    if(e.state=="abstract"){
                                        $("#elementContract").propertyadditem($.extend(true,{},e,{
                                            typename:"supply",
                                            readonly:true,
                                            visible:visible,
                                            id:e.sysid,
                                            saved:true,
                                            name:  e.supplyfunctionname + (e.issupplyreсeive?" <- ":" -> ") + "[" + data.join(",") + "]",
                                            mode:$("#elementContractSelection").attr("data-mode"),
                                            checkaction:function(check){
                                                if(check) addContract(e);
                                                else deleteInterface(e);
                                            }
                                        }));
                                    }
                                });

                                $(container).find("div.elementProperty").scrollTop(scrollTop);
                            },
                            error:function(message){
                                $("#elementSupply").empty();
                                $("#elementContract").empty();
                            }
                        });
                        getSystemInterfaceListA({
                            cid:params.sysid,
                            length:1000000,
                            success:function(result){
                                //console.log(result);
                                $.each($.storekeys(),function(i,id){
                                    var e = $.storeget(id);
                                    if(e.datatype=="line" && ($.hasviewpageparam(e,"interface") || $.hasviewpageparam(e,"concept") || $.hasviewpageparam(e,"database") || $.hasviewpageparam(e,"development"))){
                                        var consumer = undefined;
                                        var supply = undefined;
                                        if(e.function=="consumer"){
                                            consumer = $.storeget(e.startel);
                                            supply = $.storeget(e.endel);
                                        }
                                        else{
                                            supply = $.storeget(e.startel);
                                            consumer = $.storeget(e.endel);
                                        }
                                        if(supply && consumer){
                                            let data=[];
                                            if(e.data) data=e.data.map((item)=>item.name);
                                            $.each(result, function (ir, rd) {
                                                if(e.issupplyreсeive==rd.issupplyreсeive
                                                    && compareString(rd.supplyname,supply.name) 
                                                    && compareString(rd.consumername,consumer.name)
                                                ){
                                                    let rddata=[];
                                                    if(rd.data) rddata=rd.data.map((item)=>item.name);
                                                    rd.checked |= compareString(data.join(','),rddata.join(','));
                                                }
                                            });
                                        }
                                    }
                                });
                                $("#elementConsumer").empty();
                                var filter = $("#elementConsumerFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                if(!result) result=[];
                                $.each(result.sort(function(a,b){
                                    return a.name>b.name ? 1: -1
                                }),function(i,e){
                                    var visible = (filter=="" || re.exec(e.name)!=null);
                                    let data = [];
                                    if(e.data) data=e.data.map((item)=>item.name);
                                    $("#elementConsumer").propertyadditem($.extend({},e,{
                                        typename:"consumer",
                                        readonly:true,
                                        visible:visible,
                                        id:e.sysid,
                                        saved:true,
                                        name:  e.name + ": " + (!e.issupplyreсeive?" <- ":" -> ") +e.supplyname,
                                        mode:$("#elementConsumerSelection").attr("data-mode"),
                                        checkaction:function(check){
                                            if(check) addInterface(e);
                                            else deleteInterface(e);
                                        }
                                    }));
                                });
                                $(container).find("div.elementProperty").scrollTop(scrollTop);
                            },
                            error:function(message){
                                $("#elementConsumer").empty();
                            }
                        })
                    }
                    $("#interfaceDataPlace").hide();
                    if($.pagemenuname()=="interface"){
                        getSystemDataList({
                            systemid:params.sysid,
                            length:1000000,
                            success:function(result){
                                if(params.data){
                                    $.each(params.data,function(ie,e){
                                        var i = -1;
                                        $.each(result, function(ir,r){
                                            if(ie==0){
                                                r.saved=true;
                                            }
                                            if(e.id==r.id) {
                                                i=ir;
                                                e.name=r.name;
                                                e.saved=true;
                                            }
                                        });
                                        if(i!=-1){
                                            result.splice(i,1);
                                        }
                                        result.push($.extend({},e,{
                                            checked:true
                                        }));
                                    });
                                }
                                $("#elementData").empty();
                                var showedData=[];
                                var filter = $("#elementDataFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                if(!result) result=[];
                                $.each(result.sort(function(a,b){
                                    return a.name>b.name ? 1: -1
                                }),function(i,e){
                                    var visible = (filter=="" || re.exec(e.name)!=null);
                                    $("#elementData").propertyadditem($.extend(e,{
                                        visible:visible,
                                        typename:"data",
                                        mode:$("#elementDataSelection").attr("data-mode")
                                    }));
                                    showedData.push(e.id);
                                });
                                $(container).find("div.elementProperty").scrollTop(scrollTop);
                            },
                            error:function(message){
                                $("#elementData").empty();
                            }
                        });
                        var datalist=[];
                        $("g[data-type='line'][data-start='"+params.id+"']").each(function(i,e){
                            var param = $.storeget($(e).prop("id"));
                            var parammenu = $.getviewpageparam(param);
                            if(parammenu.direction=="r"){
                                $.each(param.data,function(di,dt){
                                    if($.inArray(dt.id,showedData)==-1) datalist.push(dt);
                                });
                            }
                            if(parammenu.direction=="f"){
                                $.each(param.datar,function(di,dt){
                                    if($.inArray(dt.id,showedData)==-1) datalist.push(dt);
                                });
                            }
                        });  
                        $("g[data-type='line'][data-end='"+params.id+"']").each(function(i,e){
                            var param = $.storeget($(e).prop("id"));
                            var parammenu = $.getviewpageparam(param);
                            if(parammenu.direction=="f"){
                                $.each(param.data,function(di,dt){
                                    if($.inArray(dt.id,showedData)==-1) datalist.push(dt);
                                });
                            }
                            if(parammenu.direction=="r"){
                                $.each(param.datar,function(di,dt){
                                    if($.inArray(dt.id,showedData)==-1) datalist.push(dt);
                                });
                            }
                        });  
                        if(datalist.length>0){
                            $("#interfaceDataPlace").show();
                            $.each(datalist.sort(function(a,b){
                                return a.name>b.name ? 1: -1
                            }),function(di,dt){
                                $("#interfaceData").propertyadditem($.extend(dt,{
                                    typename:"data",
                                    flowtype:"copy",
                                    readonly:true,
                                    mode:$("#elementDataSelection").attr("data-mode")
                                }));
                            })
                        }
                        else
                            $("#interfaceDataPlace").hide();
                    }
                    if($.pagemenuname()=="system"){
                        getSystemComponentList({
                            systemid:params.sysid,
                            length:1000000,
                            success:function(result){
                                //if(params.id=="a375557d-234f-44a8-a469-59b68a73bdf6") debugger;
                                if(params.components){
                                    $.each(params.components,function(ie,e){
                                        var i = -1;
                                        //if(params.id=="6bccba80-3bcf-49f4-835a-5944a1a6f63a") debugger;
                                        $.each(result, function(ir,r){
                                            if(ie==0){
                                                r.saved=true;
                                            }
                                            if(e.id==r.id /*|| !$.isempty(e.name) && (e.name.toLowerCase().trim()==r.name.toLowerCase().trim())*/) {
                                                i=ir;
                                                e.name=r.name;
                                                e.saved=true;
                                            }
                                        });
                                        if(i!=-1){
                                            result.splice(i,1);
                                        }
                                        result.push($.extend({},e,{
                                            checked:true
                                        }));
                                    });
                                }
                                let pl=result?.find(item => (item.id==params.sysid || (!params.sysid || getInt(params.sysid)==0) && item.id==params.id));
                                if(!pl){
                                    $("#ownElementComponent").propertyadditem({
                                        visible:true,
                                        editable:false,
                                        class:"highlight",
                                        id:((!params.sysid || getInt(params.sysid)==0)?params.id:params.sysid),
                                        state:params.state,
                                        name:params.name,
                                        parent:"",
                                        platform:"",
                                        data:[],
                                        values:{},
                                        typename:"component"
                                    });
                                }
                                var filter = $("#elementComponentFilter").val();
                                var re = new RegExp(getRegExp(filter), "ig");
                                $.each(result.sort(function(a,b){
                                    if(a.id==params.sysid) return -1;
                                    if(b.id==params.sysid) return 1;
                                    return (a.name<b.name?-1:1);
                                }),function(i,e){
                                    if(e.values){
                                        let platform = "";
                                        $.each(Object.keys(e.values).sort(function(a,b){
                                            return (getComponentWeight(a)<getComponentWeight(b)?-1:1);
                                        }),function(i1,e1){
                                            if(!platform.split('/').find(item=>item.trim()==e.values[e1]?.value))
                                                platform=splitNames(platform,e.values[e1]?.value);
                                        });
                                        if(e.id==((!params.sysid || getInt(params.sysid)==0)?params.id:params.sysid)){
                                            $("#ownElementComponent").propertyadditem($.extend({},e,{
                                                visible:visible,
                                                parent:"",
                                                editable:false,
                                                class:"highlight",
                                                platform:platform,
                                                typename:"component"
                                            }));
                                        }
                                        else{
                                            var visible = (filter=="" || re.exec(logicGetLocalName(e.name) +": " + platform)!=null);
                                            $("#elementComponent").propertyadditem($.extend({},e,{
                                                visible:visible,
                                                editable:false,
                                                parent:params.name,
                                                platform:platform,
                                                typename:"component",
                                                mode:$("#elementComponentSelection").attr("data-mode")
                                            }));
                                        }
                                    }
                                });
                            }
                        });
                        getSystemMetricList({
                            systemid: params.sysid,
                            length: 1000000,
                            success: function (result) {
                                //if(params.id=="a375557d-234f-44a8-a469-59b68a73bdf6") debugger;
                                if (params.metrics) {
                                    $.each(params.metrics, function (ie, e) {
                                        var i = -1;
                                        //if(params.id=="6bccba80-3bcf-49f4-835a-5944a1a6f63a") debugger;
                                        $.each(result, function (ir, r) {
                                            if (ie == 0) {
                                                r.saved = true;
                                            }
                                            if (!$.isempty(e.name) && !$.isempty(r.name) && (e.name.toLowerCase().trim()==r.name.toLowerCase().trim())) {
                                                i = ir;
                                                e.name = r.name;
                                                e.saved = true;
                                            }
                                        });
                                        if (i != -1) {
                                            result.splice(i, 1);
                                        }
                                        if(i != -1 || e.value!=""){
                                            result.push($.extend({}, e, {
                                                checked: true
                                            }));
                                        }
                                    });
                                }
                                $.each(result.sort(function (a, b) {
                                    return (a.name < b.name ? -1 : 1);
                                }), function (i, e) {
                                    let input = $("<input>", { 
                                        type: "text", 
                                        "data-type": "value", 
                                        value: e.value, 
                                        "data-name":e.name
                                    });
                                    $(input).dictionary({ name: e.name });

                                    $("#elementMetric").append(
                                        $("<tr>").append(
                                            $("<td>", {class:"label","data-type":"name", text:e.name, "data-alias":e.alias, "data-requared":e.requared}),
                                            $("<td>").append(
                                                input
                                            )
                                        )
                                    );
                                });
                            }
                        });

                    }
                    updateElementPart();
                }
            }
            $(container).find("div.elementProperty").show();
            break;
        case "line":
            $("input.propertyName:not(#lineName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).lineget();
            $("#line_type").val($.isnull(params.datatype3,""));

            $("#lineNonFlow").hide();
            $("#lineTemplate").hide();
            if(params.datatype3=="template"){
                $("#lineTemplate").show();
                let templateFile = $("#lineTemplate").find("[data-id=templateFile]");
                getPublishedDocumentList({
                    state: 'template',
                    length: 40,
                    success: function (data) {
                        $(templateFile).empty();
                        $(templateFile).append($("<option>",{
                            value:"0",
                            text:"",
                        }));
                        $.each(data,function(i,e){
                            $(templateFile).append($("<option>",{
                                value:e.id,
                                text:e.name + (e.version?" v" +e.version:"")
                            }));
                        });
                        $(templateFile).val(getInt(params.template));
                        params = $("#lineTemplate").updateTemplateParams();

                    }
                });
            }
            var isFlow=params.datatype3=="dashline" || (params.starttype=="comment" || params.endtype=="comment" /*|| params.starttype=="picture" || params.endtype=="picture"*/);
            if(!isFlow){
                $("#lineNonFlow").show();
            }

            var initiator = undefined;
            var terminator = undefined;
            var consumer = undefined;
            var supply = undefined;
            var datasource = undefined;
            var datasourcer = undefined;
            var datalink = undefined;
            var datalinkr = undefined;
            var startel=undefined;
            var endel=undefined;

            if (params.startel!=undefined)
                startel = $.storeget(params.startel);
            if(params.endel != undefined)
                endel = $.storeget(params.endel);

            var parammenu = $.getviewpageparam(params);
            if(parammenu.direction=="f"){
                initiator = startel;
                terminator = endel;
            }
            else{
                initiator = endel;
                terminator = startel;
            }
            var interfaceDirection=undefined;
            if(params.viewdata && params.viewdata[$.pagemenu()]){
                interfaceDirection = params.viewdata[$.pagemenu()].direction;
                datalink = datasource = (interfaceDirection =="f"?startel:endel);
                datalinkr = datasourcer = (interfaceDirection =="f"?endel:startel);
            }
            if(params.function=="consumer"){
                consumer = startel;
                supply = endel;
            }
            else{
                supply = startel;
                consumer = endel;
            }
            if($.pagemenuname()=="business"){
                if(supply!=undefined && (supply.datatype=="function"  || supply.datatype=="functionstep") && supply.container){
                    params.endfn = supply.sysid;
                    supply = $.storeget(supply.container);
                }
                if(consumer!=undefined && (consumer.datatype=="function"  || consumer.datatype=="functionstep") && consumer.container){
                    params.startfn = consumer.sysid;
                    consumer = $.storeget(consumer.container);
                }
                if(datasource){
                    if((datasource.datatype=="function"  || datasource.datatype=="functionstep") && datasource.container){
                        var data = datasource.data;
                        datasource = $.storeget(datasource.container);
                        $.each(data,function(i,e){
                            var found=undefined;
                            $.each(datasource.data,function(di,d){
                                if(d.id==e.id) found=d;
                            });
                            if(!found) datasource.data.push(e);
                        });
                    }
                    if(datasource.datatype=="or-process" || datasource.datatype=="and-process" || datasource.datatype=="xor-process"){
                        if(!datasource.data) datasource.data=[];
                        $("g[data-type='line'][data-start='"+datasource.id+"'][data-direction='r'], g[data-type='line'][data-end='"+datasource.id+"'][data-direction='f']").each(function(i,line){
                            if($(line).prop("id")!=params.id){
                                let l=$.storeget($(line).attr("data-start")==datasource.id?$(line).attr("data-end"):$(line).attr("data-start"));
                                $.each(l.data,function(i,e){
                                    var found=undefined;
                                    $.each(datasource.data,function(di,d){
                                        if(d.id==e.id) found=d;
                                    });
                                    if(!found) datasource.data.push(e);
                                });
                            }
                        })
                    }
                }
                if(datasourcer) {
                    if((datasourcer.datatype=="function"  || datasourcer.datatype=="functionstep") && datasourcer.container){
                        var data = datasourcer.data;
                        datasourcer = $.storeget(datasourcer.container);
                        $.each(data,function(i,e){
                            var found=undefined;
                            $.each(datasourcer.data,function(di,d){
                                if(d.id==e.id) found=d;
                            });
                            if(!found) datasourcer.data.push(e);
                        });
                    }
                    /*if(datasourcer.datatype=="or-process" || datasourcer.datatype=="and-process" || datasourcer.datatype=="xor-process"){
                        if(!datasourcer.data) datasourcer.data=[];
                        $("g[data-type='line'][data-start='"+datasourcer.id+"'], g[data-type='line'][data-end='"+datasourcer.id+"']").each(function(i,line){
                            if($(line).prop("id")!=params.id){
                                let l=$.storeget($(line).attr("data-start")==datasourcer.id?$(line).attr("data-end"):$(line).attr("data-start"));
                                $.each(l.data,function(i,e){
                                    var found=undefined;
                                    $.each(datasourcer.data,function(di,d){
                                        if(d.id==e.id) found=d;
                                    });
                                    if(!found) datasourcer.data.push(e);
                                });
                            }
                        })
                    }*/
                }
            }
            $("#lineName").attr({
                "data-id":params.id,
                "data-sysid":params.sysid,
                "data-state":params.state
            });
            $("#lineStatus").attr({
                "data-state": params.state
            });
            $("#lineName").val(params.name);
            if(params.sysid && params.sysid!=0){
                $("#lineLink").attr({
                    href:"interface.html?id="+params.sysid
                });
                $("#lineLink").show();
            }
            else
                $("#lineLink").hide();

            $("#lineNumber").val(params.number);
            $("#int_supplyconnection").val(params.supplyint);
            $("#int_consumerconnection").val(params.consumerint);
            $("#int_consumermethod").val(params.consumermethod);
            $("#int_consumermethodtype").val(params.consumermethodtype);
            $("#int_formula").val(params.intformula);
            if($.pagemenu()=="system"){
                $("#int_consumermethod").removeClass("readonly");
                $("#int_consumermethod").removeAttr("readonly");
                $("#int_consumermethodtype").removeClass("readonly");
                $("#int_consumermethodtype").removeAttr("readonly");
            }
            else{
                if(!$("#int_consumermethod").hasClass("readonly"))
                    $("#int_consumermethod").removeClass("readonly");
                $("#int_consumermethod").attr("readonly","readonly");
                if(!$("#int_consumermethodtype").hasClass("readonly"))
                    $("#int_consumermethodtype").removeClass("readonly");
                $("#int_consumermethodtype").attr("readonly","readonly");
            }
            $("#int_integrationtype").val(params.interaction);
            $("#int_integrationplatform").val(params.intplatform);
            $("#int_docref").val(params.docref);
            if(params.docref){
                $("#int_docref_link").attr({
                    href:params.docref
                });
                $("#int_docref_link").prop('disabled', false);
            }
            else{
                $("#int_docref_link").removeAttr("href");
                $("#int_docref_link").prop('disabled', true);
            }


            switch(params.datatype2)
            {
                case "direct":
                    $("#cbLineDirect").prop("checked",true);
                    break;
                case "curved":
                    $("#cbLineCurved").prop("checked",true);
                    break;
                default: //rectangle
                    $("#cbLineRectangle").prop("checked",true);
                    break;
            }
            if(initiator!=undefined)
                $("#connectInitName").text(initiator.name);
            else
                $("#connectInitName").empty();
            if(terminator!=undefined)
                $("#connectTermName").text(terminator.name);
            else
                $("#connectTermName").empty();
            if(params.function=="consumer"){
                $("#lineCaption").text(interfaceDirection =="f"?"IN":"OUT");
                $("#lineCaptionr").text(interfaceDirection =="f"?"OUT":"IN");
            }
            else{
                $("#lineCaption").text(interfaceDirection =="f"?"OUT":"IN");
                $("#lineCaptionr").text(interfaceDirection =="f"?"IN":"OUT");
            }
            $("#supplyName").empty();
            $("#supplyService").empty();
            $("#consumerName").empty();
            $("#consumerService").empty();
            if(supply!=undefined){
                $("#lineName").attr({
                    "data-supplyid":supply.sysid
                });
                $("#supplyName").text(supply.name);
                if(!supply.functions) supply.functions=[];
                $.each(supply.functions.sort(function(a,b){
                    return a.name>b.name ? 1: -1
                }),function(i,e){
                    $("#supplyService").append($("<option>",{
                        value:e.id,
                        text:e.name,
                        state:e.state,
                        /*connection:e.connection,
                        interaction:e.interaction,*/
                        type:e.type,
                        method:e.method,
                        description:e.description,
                        methodtype:e.methodtype
                    })); 
                    if(params.endfn==e.id){
                        $("#int_consumermethod").val(e.method);
                        $("#int_consumermethodtype").val(e.methodtype);
                        //$("#int_integrationtype").val(e.interaction);
                        //$("#int_consumerconnection").val(e.connection);
                        $("#supplyService_action").off("click");
                        $("#supplyService_action").click(function(){
                            var opt = $("#supplyService").find("option[value='"+e.id+"']");
                            $("#toolPopup").newFunction({
                                id:e.id,
                                name:$(opt).text(),
                                method:$(opt).attr("method"),
                                description:$(opt).attr("description"),
                                /*connection:$(opt).attr("connection"),
                                interaction:$(opt).attr("interaction"),*/
                                methodtype:$(opt).attr("methodtype"),
                                type:$(opt).attr("type"),
                                caption:"Редактировать '" + $(opt).text() +"'",
                                success: function(value){
                                    storeupdatedata({
                                        id:e.id,
                                        name:value.name,
                                        method:value.method,
                                        /*connection:value.connection,
                                        interaction:value.interaction,*/
                                        methodtype:value.methodtype,
                                        description:value.description,
                                        type:value.type,
                                        typename:"function"
                                    });
                                    $("#int_consumermethod").val(value.method);
                                    $("#int_consumermethodtype").val(value.methodtype);
                                    $(opt).attr({
                                        /*connection:value.connection,
                                        interaction:value.interaction,*/
                                        method:value.method,
                                        description:value.description,
                                        methodtype:value.methodtype,
                                        type:value.type
                                    });
                                    $(opt).text(value.name);

                                    //$("#int_integrationtype").val(value.interaction);
                                    //$("#int_consumerconnection").val(value.connection);
                                }
                            });                
                        });
                    }
                });
                $("#supplyService").val(params.endfn);
            }
            else{
                $("#lineName").removeAttr("data-supplyid");
            }
            if(consumer!=undefined){
                $("#lineName").attr({
                    "data-consumerid":consumer.sysid
                });
                $("#consumerName").text(consumer.name);
                $.each(consumer.functions,function(i,e){
                    $("#consumerService").append($("<option>",{
                        value:e.id,
                        text:e.name,
                        state:e.state,
                        connection:e.connection,
                        interaction:e.interaction,
                        type:e.type,
                        method:e.method,
                        methodtype:e.methodtype,
                        description:e.description
                    })); 
                });
                $("#consumerService").val(params.startfn);
            }
            else{
                $("#lineName").removeAttr("data-consumerid");
            }
            if(datasource && datasource.data && datasource.data.length>0 && datasourcer && datasourcer.data && datasourcer.data.length>0)
                $("#lineSeparator").show();
            else
                $("#lineSeparator").hide();

            $("#gateInterfaceData").empty();
            if($.pagemenuname()=="function"){
                var list=[];
                if(initiator && terminator && params.starttype=="server" && params.endtype=="server"){
                    $.each($.storekeys(),function(i,id){
                        var p = $.storeget(id);
                        if(params.id!=id && p.datatype=="line"){
                            var pm = $.getviewpageparam(p,"system");
                            if(pm){
                                var p_initiator = undefined;
                                var p_terminator = undefined;
                                if(pm.direction=="f"){
                                    p_initiator = p.startel;
                                    p_terminator = p.endel;
                                }
                                else{
                                    p_initiator = p.endel;
                                    p_terminator = p.startel;
                                }
                                if(p_initiator && p_terminator){
                                    var has_initiator=false;
                                    $.each(initiator.elements,function(i,e){
                                        has_initiator |= (e.id==p_initiator);
                                    });
                                    var has_terminator=false;
                                    $.each(terminator.elements,function(i,e){
                                        has_terminator |= (e.id==p_terminator);
                                    });
                                    if(has_initiator && has_terminator)
                                        list.push(p);
                                }
                            }
                        }
                    });
                }
                $.each(list.sort(function(a,b){
                    if(a.number>b.number)
                        return 1;
                    if(a.number<b.number)
                        return -1;
                    return 0;
                }),function(i,e){
                    var input = $("<input>",{
                        type:"checkbox",
                        "data-id":e.id,
                        "data-state":e.state,
                        name:"line",
                        "data-name":e.name,
                        "data-number":e.number
                    });
                    if($(params.interface).objectArrayHasId(e.id)){
                        $(input).prop("checked",true);
                    }
                    $("#gateInterfaceData").append(
                        $("<li>").append(
                            $(input),
                            "№" + e.number + ". " + e.name
                        )
                    );
                });
                $("#gateInterfaceData").find("li input[type='checkbox']").click(function(){
                    $(selected).propertyapply();
                });
            }
            else{
                filllinedata(params.id,selected,params.data,datasource,datalink,$("#lineData"),$("#lineDataPlace"),$("#dataplace"),$("#interfaceSystemData"),$("#interfaceSystemDataPlace"));
                $.linedatarhide();
                if(filllinedata(params.id,selected,params.datar,datasourcer,datalinkr,$("#lineDatar"),$("#lineDataPlacer"),$("#datarplace"),$("#interfaceSystemDatar"),$("#interfaceSystemDataPlacer")))
                $.linedatarshow();
            }

            $(container).find("div.lineProperty").show();
            if($.pagemenuname()=="business"){
                $("#lineNumber").focus();
                $("#lineNumber")[0].select();
            }
            break;
        case "linedata":
            $("input.propertyName:not(#linedataName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
            if(params && params.id!=$("#linedataName").attr("data-id") || params.sysid!=$("#linedataName").attr("data-sysid") || !params.sysid || reload){
                $("#linedataName").attr({
                    "data-id":params.id
                });
                $("#linedataName").val(params.name);
            }
            var datasource, datalink;
            $("g[data-type='line'][data-end='" + params.id + "'][data-direction='f']").each(function(i,e){
                if($(e).attr("data-start"))
                    datalink = datasource=$.storeget($(e).attr("data-start"));
            });
            if(!datasource){
                $("g[data-type='line'][data-start='" + params.id + "'][data-direction='r']").each(function(i,e){
                    if($(e).attr("data-end"))
                        datalink = datasource=$.storeget($(e).attr("data-end"));
                });
            }
            if($.pagemenuname()=="business"){
                if(datasource && (datasource.datatype=="function" || datasource.datatype=="functionstep") && datasource.container){
                    var data = datasource.data;
                    datasource = $.storeget(datasource.container);
                    $.each(data,function(i,e){
                        if(!$(datasource.data).objectArrayHasId(e.id)) datasource.data.push(e);
                    });
                }
            }
            filllinedata(params.id,selected,params.data,datasource,datalink,$("#ldData"),$("#ldDataPlace"),$("#linedataplace"),$("#ldinterfaceSystemData"),$("#ldinterfaceSystemDataPlace"));
            $(container).find("div.linedataProperty").show();
            break;
        case "start-process":
        case "clock-start":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
            $("input.propertyName:not(#logicName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
            if(params && params.id!=$("#logicName").attr("data-id") || params.sysid!=$("#logicName").attr("data-sysid") || !params.sysid || reload){
                $("#logicName").attr({
                    "data-id":params.id
                });
                $("#logicName").val(params.name);
            }
            $(container).find("div.logicProperty").show();
            break;
        case "subprocess":
            $("input.propertyName:not(#subprocessName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
            if(params && params.id!=$("#subprocessName").attr("data-id") || params.sysid!=$("#subprocessName").attr("data-sysid") || !params.sysid || reload){
                $("#subprocessName").attr({
                    "data-id":params.id,
                    "data-sysid":params.sysid,
                    "data-state":params.state
                });
                $("#subprocessStatus").attr({
                    "data-state": params.state
                });
                $("#subprocessName").val(params.name);
                $("#subprocessPurpose").val(params.description);
                let templateFile = $("#subprocessTemplate").find("[data-id=templateFile]");
                $(templateFile).val(params.filename);
                $(templateFile).attr({
                    "data-sysid":params.filesysid
                });
                subprocessUpdate();
            }
            $(container).find("div.subprocessProperty").show();
            break;
        case "cluster":
            $("input.propertyName:not(#clusterName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
            if(params && params.id!=$("#clusterName").attr("data-id") || params.sysid!=$("#clusterName").attr("data-sysid") || !params.sysid || reload){
                $("#clusterName").attr({
                    "data-id":params.id,
                    "data-sysid":params.sysid,
                    "data-state":params.state
                });
                $("#clusterName").val(params.name);
                $("#clusterStatus").attr({
                    "data-state": params.state
                });
                $("#cluster_copytype").val(params.copytype);
                $("#cluster_clustertype").val(params.clustertype);
                $("#cluster_storeclass").val(params.storeclass);
                $("#clusterPurpose").val(params.description);

            }
            $(container).find("div.clusterProperty").show();
            break;
        case "server":
            $("input.propertyName:not(#serverName)").attr("data-sysid","");
            if(params==undefined)
                params = $(selected).logicget();
            if(params && params.id!=$("#serverName").attr("data-id") || params.sysid!=$("#serverName").attr("data-sysid") || !params.sysid || reload){
                $("#serverName").attr({
                    "data-id":params.id,
                    "data-sysid":params.sysid,
                    "data-state":params.state
                });
                $("#serverName").val(params.name);
                $("#serverStatus").attr({
                    "data-state": params.state
                });
                $("#server_os").val(params.os);
                $("#server_env").val(params.env);
                $("#server_ip").val(params.ip);
                $("#serverPurpose").val(params.description);

                var scrollTop = $(container).find("div.serverProperty").scrollTop();
                $("#serverElement").empty();
                var result=[];
                $.each($.storekeys(),function(i,id){
                    var param = $.storeget(id);
                    if(param.datatype=="element" && param.datatype3!="collaboration" && param.components && param.components.length>0/*$.hasviewpageparam(param,"system")*/){
                        /*if(!param.components)
                            param.components=[];
                        if(param.appos && param.appos!=""){
                            param.components.push({
                                name:param.appname??"Приложение",
                                type:"application",
                                os:param.appos,
                                env:param.appenv
                            })
                        }
                        if(param.dbos && param.dbos!=""){
                            param.components.push({
                                name:param.dbname??"БД",
                                type:"database",
                                os:param.dbos,
                                env:param.dbenv
                            })
                        }*/
                        if(!result.find(item => item.id==param.id)){
                            $.each(param.components,function(i,e){
                                if(e.values){
                                    let name = e.name;
                                    if(name.indexOf(param.name +". ")==-1 && name.trim().toLowerCase()!=param.name.trim().toLowerCase()) name=param.name + ". " +e.name;
                                    if(e.values.db){
                                        result.push({
                                            id:e.id,
                                            name:name + ". БД",//": " + e.values.db.value,
                                            type:"БД",
                                            state:e.values.db.state,
                                            os:(e.values?.dbos?.value??e.values?.os?.value),
                                            env:e.values.db.value
                                        });
                                    }
                                    let platform = "";
                                    let state="exist";
                                    $.each(Object.keys(e.values).sort(function(a,b){
                                        return (getComponentWeight(a)<getComponentWeight(b)?-1:1);
                                    }),function(i1,e1){
                                        if(e1!="dbos" && e1!="db" && e1!="os" && e1!="containerapp" && e1!="container"){
                                            platform=splitNames(platform,e.values[e1]?.value);
                                            state=$.logicStateMapping(state,e.values[e1]?.state);
                                        }
                                    });

                                    if(platform!=""){
                                        result.push({
                                            id:e.id,
                                            name:name + ". Приложение", //": " + platform,
                                            type:"Приложение",
                                            state:state,
                                            os:e.values.os?.value,
                                            env:platform
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
                if (params.elements) {
                    $.each(params.elements, function (ie, e) {
                        var i = -1;
                        var r;
                        $.each(result, function (ir, rd) {
                            if (e.id == rd.id && e.type==rd.type) {
                                i = ir;
                                r=rd;
                            }
                        });
                        if (i != -1 && r) {
                            result.splice(i, 1);
                            result.push($.extend({},e, {
                                checked: true
                            }));
                        }
                        else
                            result.push($.extend({},e, {
                                checked: true
                            }));
                    });
                }
                var filter = $("#serverElementFilter").val();
                var re = new RegExp(getRegExp(filter), "ig");
                var re_os = new RegExp(getRegExp(params.os), "ig");
                var re_env = new RegExp(getRegExp(params.env), "ig");
                $.each(result.sort(function(a,b){
                    return a.name>b.name ? 1: -1
                }),function(i,e){
                    var visible = (filter=="" || re.exec(e.name)!=null) && ((params.os=="" || re_os.exec(e.os)!=null) || (params.env=="" || re_env.exec(e.env)!=null));
                    $("#serverElement").propertyadditem($.extend(e,{
                        visible:visible,
                        typename: "system",
                        mode:$("#serverElementSelection").attr("data-mode"),
                    }));
                });
                $(container).find("div.serverProperty").scrollTop(scrollTop);
            }

            $(container).find("div.serverProperty").show();
            break;
        case "comment":
                $("input.propertyName:not(#commentName)").attr("data-sysid","");
                if(params==undefined)
                    params = $(selected).logicget();
                if(params && params.id!=$("#commentName").attr("data-id") || params.sysid!=$("#commentName").attr("data-sysid") || !params.sysid || reload){
                    $("#commentName").attr({
                        "data-id":params.id,
                        "data-sysid":params.sysid
                    });
                    $("#commentName").val(params.name);
                    $("#commentPurpose").val(params.description);
                }
                $(container).find("div.commentProperty").show();
            break;
        default:
            $.propertyhide();
            break;
    }
    if(!canOperate()){
        $("div.itemStatusPlace, #propertyPage a:not([data-view]), #propertyPage div[data-action]:not([data-view])").each(function(i,e){
            $(e).off("click");
        });
        $("#propertyPage input:not([data-view]), #propertyPage select, #propertyPage textarea").each(function(i,e){
            $(e).prop("disabled", true);
            $(e).css("cursor", "auto");
        });
        $("#propertyPage div, #propertyPage span, #propertyPage table, #propertyPage label").each(function(i,e){
            $(e).css("cursor", "auto");
        });
    }
}
var filllinedata = function(id,selected,paramsdata,datasource,datalink,lineData,lineDataPlace,dataplace,interfaceSystemData,interfaceSystemDataPlace){
    $(dataplace).hide();

    var showedData=[];
    var existData=[];
    var hasChecked = false;
    $.each(paramsdata,function(i,e){
        existData.push(e.id.toString());
    });
    $(lineData).empty();
    if(datasource!=undefined && datasource.data!=undefined && datasource.data.length>0){
        $(lineDataPlace).show();
        $(dataplace).show();
        $.each(datasource.data.sort(function(a,b){
            return a.name>b.name ? 1: -1
        }),function(i,e){
            var input = $("<input>",{
                type:"checkbox",
                "data-id":e.id,
                "data-state":e.state,
                "data-securitytype":e.securitytype,
                name:"function",
                "data-name":e.name
            });
            if($.inArray(e.id.toString(),existData)!=-1){
                $(input).prop("checked",true);
                hasChecked = true;
            }
            var link;
            if(isInt(e.id)){
                link = $("<a>",{
                    title:"Открыть карточку данных",
                    target:"_blank",
                    href:"data.html?id=" + e.id,
                    class:"entity4link"
                }).append($("<img>",{
                    src: "images/extlink.png"
                }));
            }
            
            $(lineData).append(
                $("<li>").append(
                    $(input),
                    e.name + (e.securitytype && e.securitytype!=""? " (" + e.securitytype+")":""),
                    $(link)
                )
            );
            showedData.push(e.id.toString());
        });
        $(lineData).find("li input[type='checkbox']").click(function(){
            $(selected).propertyapply();
        });
    }
    else
        $(lineDataPlace).hide();


    $(interfaceSystemData).empty();
    var datalist=[];
    if(datasource!=undefined){
        $("g[data-type='line'][data-start='"+datalink.id+"'][data-direction='f']:not([id="+ id+"]), g[data-type='line'][data-end='"+datalink.id+"'][data-direction='r']:not([id="+ id+"])").each(function(i,e){
            var param = $.storeget($(e).prop("id"));
            $.each(param.datar,function(di,dt){
                if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
            });
        });  
        $("g[data-type='line'][data-start='"+datalink.id+"'][data-direction='r']:not([id="+ id+"]), g[data-type='line'][data-end='"+datalink.id+"'][data-direction='f']:not([id="+ id+"])").each(function(i,e){
            var param = $.storeget($(e).prop("id"));
            $.each(param.data,function(di,dt){
                if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
            });
            if(param.endel==datalink.id && param.starttype=="linedata"){
                var ld = $.storeget(param.startel);
                if(ld && ld.data){
                    $.each(ld.data,function(di,dt){
                        if($.inArray(dt.id,showedData)==-1 && !$(datalist).objectArrayHasId(dt.id)) datalist.push(dt);
                    });
                }
            }
        });  
    }
    if(datalist.length>0){
        $(interfaceSystemDataPlace).show();
        $(dataplace).show();
        $(lineCaption).show();
        $.each(datalist.sort(function(a,b){
            return a.name>b.name ? 1: -1
        }),function(i,e){
            var input = $("<input>",{
                type:"checkbox",
                "data-id":e.id,
                "data-state":e.state,
                name:"function",
                "data-securitytype":e.securitytype,
                "data-name":e.name
            });
            if($.inArray(e.id.toString(),existData)!=-1){
                $(input).prop("checked",true);
                hasChecked = true;
            }
            var link;
            if(isInt(e.id)){
                link = $("<a>",{
                    title:"Открыть карточку данных",
                    target:"_blank",
                    href:"data.html?id=" + e.id,
                    class:"entity4link"
                }).append($("<img>",{
                    src: "images/extlink.png"
                }));
            }
            $(interfaceSystemData).append(
                $("<li>").append(
                    $(input),
                    e.name+ (e.securitytype && e.securitytype!=""? " (" + e.securitytype+")":""),
                    $(link)
                )
            );
        })
        $(interfaceSystemData).find("li input[type='checkbox']").click(function(){
            $(selected).propertyapply();
        });
    }
    else
        $(interfaceSystemDataPlace).hide();
    return hasChecked;
}

var propertyadduser = function(e){
    var del = $("<a>",{
        title:"Удалить '" + e.name + "'"
    }).append($("<img>",{
        src: "images/delete1.png",
        style:"position:initial !important"
    }));
    $(del).click(function(){
        if(confirm("Удалить редактора '" + e.name + "'?")){
            $(del).closest("li").remove();
            $.propertyapply();
        }
    });
    $("#documentUsers").append(
        $("<li>",{
            "data-login":e.login,
            "data-name":e.name
        }).append(
            e.name,
            $(del)
        )
    );
}

$.fn.propertyadditem = function(e){
    var place = this;
    var checkbox = $("<input>",{
        type:"checkbox",
        "data-id":e.id,
        "data-name":e.name,
        "data-parent":e.parent,
        "data-state":e.state,
        "data-method":e.method,
        "data-description":e.description,
        "data-connection":e.connection,
        "data-interaction":e.interaction,
        "data-methodtype":e.methodtype,
        name:e.typename,
        "data-type":e.type,
        "data-flowtype": e.flowtype,
        "data-securitytype": e.securitytype,
        "data-pod":e.pod,
        style:"visibility:" + (!e.addaction?"visible":"hidden"),
        "data-os":e.os,
        "data-env":e.env,
        "data-data":JSON.stringify(e.data)
    });
    if(e.checked)
        $(checkbox).prop("checked",true);
 
    var addtoscheme;
    if(e.addaction/*$.pagemenuname()=="business"*/){
        addtoscheme=$("<a>",{class:"add2schema"}).append($("<img>",{
            src:"images/create2.png",
            title:"Добавить на схему",
        }));
        $(addtoscheme).click(function(){
            //$(checkbox).prop("checked",true);
            //if(e.addaction)
                e.addaction();
        });
    }
    let inputvalue = (e.typename=="component"?(e.class?"":(e.parent && e.parent!=""? e.name.replace(e.parent+". ",""):e.name)+": ")+ (e.platform??""):e.name);
    var input = $("<input>",{
        readonly:isInt(e.id) && (!canOperate() || e.editable==false || e.typename=="component" || e.typename=="supply" || e.typename=="consumer"),
        type:"text",
        value:inputvalue,
        title:inputvalue,
        class:e.class
    });
    var inputchange=function(){
        let val = $(input).val();
        if(e.typename=="component")
            val=$(checkbox).attr("data-name");
        storeupdatedata({
            id:e.id,
            name:val,
            typename:e.typename
            /*state:$(this).attr("data-state"),
            flowtype: $(this).attr("data-flowtype"),
            securitytype: $(this).attr("data-securitytype")*/
        });
        $(checkbox).attr({
            "data-name":val
        });
        $(del).attr({
            title:"Удалить '" + val + "'"
        });
    }
    if(!e.readonly){
        $(input).change(function(){
            inputchange();
        });
    }
    var del = $("<a>",{
        title:"Удалить '" + e.name + "'",
        style:"visibility:" + (e.checked?"visible":"hidden")
    }).append($("<img>",{
        src: "images/delete1.png"
    }));
    var edit = $("<a>",{
        title:"Редактировать",
        style:"visibility:" + (e.checked || !isInt(e.id) || e.class?"visible":"hidden")
    }).append($("<img>",{
        src: "images/edit2.png"
    }));
    var stateplace= $("<div/>",{class:"itemStatusPlace"});
    $(checkbox).change(function(){
        $(del).css({
            visibility:($(checkbox).prop("checked")?"visible":"hidden")
        });
        $(edit).css({
            visibility:($(checkbox).prop("checked") || !isInt(e.id) || e.class ?"visible":"hidden")
        });
        $.propertyapply();
        inputchange();
        if(typeof e.checkaction=="function") e.checkaction($(checkbox).prop("checked"));
    });
    var link;
    var flowtype=undefined;
    var securitytype=undefined;
    switch(e.typename){
        case "function":
            link = $("<a>",{
                title:"Открыть карточку функции",
                target:"_blank",
                href: (e.type=="template"?"index.html":"function.html") + "?id=" + e.id,
                class:"entity2link",
                style:"visibility:" + (isInt(e.id) || e.type=="template"?"visible":"hidden")
            }).append($("<img>",{
                src: "images/extlink.png"
            }));
            $(edit).click(function(){
                $("#toolPopup").newFunction({
                    id:e.id,
                    name:$(checkbox).attr("data-name"),
                    method:$(checkbox).attr("data-method"),
                    description:$(checkbox).attr("data-description"),
                    /*connection:$(checkbox).attr("data-connection"),
                    interaction:$(checkbox).attr("data-interaction"),*/
                    methodtype:$(checkbox).attr("data-methodtype"),
                    type:$(checkbox).attr("data-type"),
                    caption:"Редактировать '" + $(checkbox).attr("data-name") +"'",
                    success: function(value){
                        storeupdatedata({
                            id:$(checkbox).attr("data-id"),
                            newid:value.id,
                            name:value.name,
                            method:value.method,
                            connection:value.connection,
                            interaction:value.interaction,
                            methodtype:value.methodtype,
                            description:value.description,
                            type:value.type,
                            typename:"function"
                        });
                        $(checkbox).attr({
                            "data-id":value.id,
                            "data-name":value.name,
                            "data-method":value.method,
                            "data-description":value.description,
                            "data-connection":value.connection,
                            "data-interaction":value.interaction,
                            "data-methodtype":value.methodtype,
                            "data-type":value.type
                        });
                        $(input).val(value.name);
                        $(del).attr({
                            title:"Удалить '" + value.name + "'"
                        });
                        $(link).attr({
                            href: (value.type=="template"?"index.html":"function.html") + "?id=" + value.id,
                            style:"visibility:" + (isInt(value.id) || value.type=="template"?"visible":"hidden")
                        });
                    }
                });
            });
            break;
        case "data":
            link = $("<a>",{
                title:"Открыть карточку данных",
                target:"_blank",
                href:"data.html?id=" + e.id,
                class:"entity2link",
                style: "visibility:" + (isInt(e.id) && hasPortal() ?"visible":"hidden")
            }).append($("<img>",{
                src: "images/extlink.png"
            }));
            $(edit).click(function(){
                $("#toolPopup").newData({
                    id:e.id,
                    name:$(checkbox).attr("data-name"),
                    pod:$(checkbox).attr("data-pod"),
                    caption:"Редактировать '" + $(checkbox).attr("data-name") +"'",
                    success: function(value){
                        storeupdatedata({
                            id:e.id,
                            name:value.name,
                            pod:value.pod,
                            typename:"data"
                        });
                        $(checkbox).attr({
                            "data-name":value.name,
                            "data-pod":value.pod
                        });
                        $(input).val(value.name);
                        $(del).attr({
                            title:"Удалить '" + value.name + "'"
                        });
                        $(link).attr({
                            href:"data.html?id=" + value.id,
                            style:"visibility:" + (isInt(value.id)?"visible":"hidden")
                        });
                        $.propertyset(undefined, true);
                    }
                });
            });
            flowtype = $("<select>").append(
                $("<option>", {text: "M", value: "master", title: "Мастер-данные"}),
                $("<option>", {text: "C", value: "copy", title: "Копия данных"}),
                $("<option>", {text: "T", value: "transfer", title: "Передаваемые без сохранения данные"})
            );
            $(flowtype).val(e.flowtype);
            $(flowtype).change(function(){
                $(checkbox).attr({
                    "data-flowtype" : $(this).val()
                });
                $(li).find(".itemFlowTypePlace").attr({
                    "data-flowtype": $(this).val()
                });
                $.propertyapply();
            });
            securitytype = $("<select>");
            $.each($.securitytypedictionary(),function(is,es){
                securitytype.append(
                    $("<option>",{text:es.name, value:es.value, title:es.description})
                );
            });
            $(securitytype).val(e.securitytype);
            $(securitytype).change(function(){
                $(checkbox).attr({
                    "data-securitytype" : $(this).val()
                });
                $(li).find(".itemSecurityTypePlace").attr({
                    "data-securitytype": $(this).val()
                });
                storeupdatedata({
                    id:e.id,
                    typename:e.typename,
                    securitytype:$(this).val()
                });
            });
            break;
        case "component":
            $(edit).click(function(){
                let parent = $(checkbox).attr("data-parent");
                let name = $(checkbox).attr("data-name");
                let caption = ($(checkbox).attr("data-parent")!=""?$(checkbox).attr("data-parent") + ". " + $(checkbox).attr("data-name").replace($(checkbox).attr("data-parent") +". ","").trim():$(checkbox).attr("data-name"));
                $("#toolPopup").newComponent({
                    id:e.id,
                    hidename:e.class,
                    parent:parent,
                    name:(parent && parent!=""?name.replace(parent +". ","").trim():name),
                    data:JSON.parse($(checkbox).attr("data-data")),
                    caption:"Платформы реализации '" + caption +"'",
                    success: function(value){
                        var sl = $.getfirstofselected();
                        if($(sl).attr("data-type")=="element")
                            $(sl).componentUpdate(value,"edit");
                        return;
                    }
                });
            });
            break;
        case "system":
            link = $("<a>",{
                title:"Открыть карточку системы",
                target:"_blank",
                href:"system.html?id=" + e.sysid,
                class:"entity2link",
                style: "visibility:" + (parseInt(e.sysid) != 0 && hasPortal() ?"visible":"hidden")
            }).append($("<img>",{
                src: "images/extlink.png"
            }));
            break;
        case "supply":
        case "consumer":
            link = $("<a>",{
                title:"Открыть карточку интерфейса",
                target:"_blank",
                href:"interface.html?id=" + e.sysid,
                class:"entity2link",
                style: "visibility:" + (parseInt(e.sysid) != 0 && hasPortal() ?"visible":"hidden")
            }).append($("<img>",{
                src: "images/extlink.png"
            }));
            break;
    }
    var li = $("<li>").append(
        $(addtoscheme),
        $(checkbox),
        $(input),
        (e.readonly || e.showedit==false?"":$(del)),
        $(link),
        (e.showedit==false?"":$(edit)),
        (flowtype?$(flowtype):""),
        (securitytype?$(securitytype):""),
        $(stateplace)
    );
    $(del).click(function(){
        if((!isInt(e.id) || !e.saved) && !e.class){
            if(confirm('Удалить "' + $(checkbox).attr("data-name") + '"?')){
                $(li).remove();
                $.propertyapply();
            }
        } else{
            $(checkbox).prop("checked",false);
            $(del).css({
                visibility:"hidden"
            });
            $.propertyapply();
            $(input).change();
        }
    });
    if((e.checked==undefined || !e.checked) && e.mode=="1" || e.visible==false)
        $(li).hide();
    $(li).createItemStatus($.extend(e,{
        typename: e.typename,
        state : e.state,
        /*readonly:(e.typename=="component"),*/
        "action": function(e){
            let data;
            if(e.typename=="component"){
                data = JSON.parse($(checkbox).attr("data-data"));   
                $.each(data,function(i1,e1){
                    e1.state=e.state;
                });
                for(let i of Object.keys(e.values)){
                    if(e.values[i].state!="external") e.values[i].state=e.state;
                }
            }
            storeupdatedata({
                id:e.id,
                state:e.state,
                typename:e.typename,
                flowtype:e.flowtype,
                data:data,
                values:e.values
            });
            $(checkbox).attr({
                "data-state" : e.state,
                "data-data": data?JSON.stringify(data):undefined
            });
            $(li).find(".itemStatusPlace").attr({
                "data-state": e.state
            });
            //$.propertyapply();
            if(e.state=="new" || e.state=="change"){
                var sl = $.getfirstofselected();
                if($(sl).attr("data-type")=="element"){
                    var params = $(sl).storeget();
                    if(params.state=="exist"){
                        var params = $.extend(params, {
                            state:"change"
                        });
                        $.propertyset(params);
                        $.storeset(params);
                    }
                }
            }
        }
    }));
    $(place).append($(li));
}
$.propertyapply = function(){
    var selectedArray = $.getselected();
    if(selectedArray.length==1){
        var selected = selectedArray[0];
        switch($(selected).attr("data-type")){
            case "linedata":
            case "data":
                var parent = $(selected).attr("data-parent");
                if(parent && parent!=""){
                    //$.unselect();
                    //$("#" + parent).select();
                    selected=$("#" + parent);
                }
                break;
        };
        $(selected).propertyapply();
    }
}
$.fn.propertyapply = function(){
    $.storeset(propertyget($(this).attr("data-type")),true);
    $.historycloseputtransaction();
}
$.fn.createDataItemFlowType = function(options){
}
$.fn.createItemStatus = function(options){
    $(this).find(".itemStatusPlace").each(function(i,e){
        //$(e).empty();
        $(e).attr({
            "data-state":options.state,
            "data-type":options.typename,
            style:(options.readonly?"cursor:default":undefined)
        });
        if(!options.readonly){
            $(e).click(function(event){
                event.stopPropagation();
                $("div.inlinemenu").remove();
                var div = $("<div/>",{class:"inlinemenu"});
                $(div).empty();
                let statelist = ((options.typename=="element" || options.typename=="function" || options.typename=="line") && $.currentdocumentget().type=="Архитектурный шаблон"?"abstract":(options.typename=="line"?"line":"all"));
                switch(statelist){
                    case "internal":
                        $(div).append(
                            $("<div/>",{class:"itemstatus new", "data-action":"new", title:"Статус 'Разработка'"}),
                            $("<div/>",{class:"itemstatus exist", "data-action":"exist", title:"Статус 'Применение'"}),
                            $("<div/>",{class:"itemstatus change", "data-action":"change", title:"Статус 'Изменение'"})
                        );
                        break;
                    case "external":
                        $(div).append(
                            $("<div/>",{class:"itemstatus external", "data-action":"external", title:"Статус 'Внешняя'"})
                        );
                        break;
                    case "abstract":
                        $(div).append(
                            $("<div/>",{class:"itemstatus new", "data-action":"new", title:"Статус 'Разработка'"}),
                            $("<div/>",{class:"itemstatus exist", "data-action":"exist", title:"Статус 'Применение'"}),
                            $("<div/>",{class:"itemstatus change", "data-action":"change", title:"Статус 'Изменение'"}),
                            $("<div/>",{class:"itemstatus external", "data-action":"external", title:"Статус 'Внешняя'"}),
                            $("<div/>",{class:"itemstatus abstract", "data-action":"abstract", title:"Абстракция"})
                        );
                        break;
                    case "line":
                        $(div).append(
                            $("<div/>",{class:"itemstatus new", "data-action":"new", title:"Статус 'Разработка'"}),
                            $("<div/>",{class:"itemstatus exist", "data-action":"exist", title:"Статус 'Применение'"}),
                            $("<div/>",{class:"itemstatus change", "data-action":"change", title:"Статус 'Изменение'"}),
                            $("<div/>",{class:"itemstatus external", "data-action":"external", title:"Статус 'Внешняя'"}),
                            $("<div/>",{class:"itemstatus replicate", "data-action":"replicate", title:"Обозначение репликации"})
                        );
                        break;
                    default:
                        $(div).append(
                            $("<div/>",{class:"itemstatus new", "data-action":"new", title:"Статус 'Разработка'"}),
                            $("<div/>",{class:"itemstatus exist", "data-action":"exist", title:"Статус 'Применение'"}),
                            $("<div/>",{class:"itemstatus change", "data-action":"change", title:"Статус 'Изменение'"}),
                            $("<div/>",{class:"itemstatus external", "data-action":"external", title:"Статус 'Внешняя'"})
                        );
                        break;
                }
                if(typeof(options.action) == "function"){
                    $(div).find("div.itemstatus").click(function(event){
                        event.stopPropagation();
                        options.action($.extend(options,{
                            state:$(this).attr("data-action")
                        }));
                        $(div).remove();
                    });
                }
                $(e).append(div);
                $("body").click(function(){
                    $("div.inlinemenu").remove();
                    $("body").off("click");
                });
            });
        }
    });
}
$.fn.componentUpdate = function (value, action) {
    if($(this).attr("data-type")!="element") return;
    let params = $(this).storeget();
    let pl = params.components?.find(item => (item.id==value.id));
    let item={
        id:(!pl || value.name.toLowerCase().trim()!=pl.name.toLowerCase().trim())?$.newguid():value.id,//(value.name.toLowerCase().trim()==params.name.toLowerCase().trim()?((!params.sysid || getInt(params.sysid)==0)?params.id:params.sysid):value.id??$.newguid()),
        typename:"component",
        name:value.name,
        values:{},
        data:[]
    };
    $.each(value.data,function(i1,e1){
        item.values[e1.type]={
            value:splitNames(item.values[e1.type]?.value,e1.value),
            desc:e1.desc,
            name:e1.name??"",
            state:$.logicStateMapping(item.values[e1.type]?.state,e1.state)
        }
        item.state=$.logicStateMapping(item.state,e1.state);
        item.data.push(e1);
    });
    let platform = "";
    $.each(Object.keys(item.values).sort(function(a,b){
        return (getComponentWeight(a)<getComponentWeight(b)?-1:1);
    }),function(i1,e1){
        if(!platform.split('/').find(it=>it.trim()==item.values[e1]?.value))
            platform=splitNames(platform,item.values[e1].value);
    });
    pl=params.components?.find(item => (item.name.toLowerCase().trim()==value.name.toLowerCase().trim()));
    if(!pl)
        pl = params.components?.find(item => (item.id==value.id));
    /*switch(action){
        case "add":
            pl = params.components?.find(item => (item.name.toLowerCase().trim()==value.name.toLowerCase().trim()));
            break;
        case "edit":
            pl = params.components?.find(item => (item.id==value.id));
            break;
    }*/
    //if(value.name.toLowerCase().trim()==params.name.toLowerCase().trim())
        //pl=params.components?.find(item => (item.id==params.sysid || (!params.sysid || getInt(params.sysid)==0) && item.id==params.id));
    if(!pl){
        var checkbox=$("#ownElementComponent li, #elementComponent li").find("input[type='checkbox'][data-name='" + value.name + "']");
        if(checkbox.length!=0){
            pl={
                id:$(checkbox[0]).attr("data-id"),
                typename:"component",
                name:$(checkbox[0]).attr("data-name"),
                data:JSON.parse($(checkbox[0]).attr("data-data")),
                values:[]
            };
            $.each(pl.data,function(i1,e1){
                pl.values[e1.type]={
                    value:splitNames(pl.values[e1.type]?.value,e1.value),
                    desc:e1.desc,
                    name:e1.name??"",
                    state:$.logicStateMapping(pl.values[e1.type]?.state,e1.state)
                }
                pl.state=$.logicStateMapping(pl.state,e1.state);
            });
            let platform2=params.components?.find(item => (item.id==pl.id));
            if(!platform2)
                params.components.push(pl);
            /*else
                platform=pl;*/
            storedirectlyset(params.id,params,false);
        }
    }
    if(!pl){
        if(params){
            if(params.state=="external")
                item.state="external";
            if((item.state=="new" || item.state=="change") && params.state=="exist"){
                $.storeset($.extend(params, {
                    state:"change"
                }));
            }
        }
        if(value.name.toLowerCase().trim()==params.name.toLowerCase().trim()){
            $("#ownElementComponent").propertyadditem($.extend({},item,{
                id:(value.name.toLowerCase().trim()==params.name.toLowerCase().trim()?((!params.sysid || getInt(params.sysid)==0)?params.id:params.sysid):value.id??$.newguid()),
                checked:true,
                editable:false,
                parent:"",
                platform:platform,
                class:"highlight",
                typename:"component"
            }));
        }
        else{
            $("#elementComponent").propertyadditem($.extend({},item,{
                id:(value.name.toLowerCase().trim()==params.name.toLowerCase().trim()?((!params.sysid || getInt(params.sysid)==0)?params.id:params.sysid):value.id??$.newguid()),
                checked:true,
                parent:params.name,
                editable:false,
                platform:platform,
                typename:"component"
            }));
        }
        $.propertyapply();
    }
    else{
        if(item.id!=pl.id){
            $.each(pl.data,function(i1,e1){
                if(!item.data.find(i=>i.value==e1.value)){
                    item.values[e1.type]={
                        value: splitNames(item.values[e1.type]?.value,e1.value),
                        desc:e1.desc,
                        name:e1.name??"",
                        state:$.logicStateMapping(item.values[e1.type]?.state,e1.state)
                    }
                    item.state=$.logicStateMapping(item.state,e1.state);
                    item.data.push(e1);
                }
            });
        }
        storeupdatedata($.extend(item,{
            id:pl.id
        }));

        if(item.state=="new" || item.state=="change"){
            if(params.state=="exist"){
                $.storeset($.extend(params, {
                    state:"change"
                }));
            }
        }
        $.propertyset(undefined, true);
    }
}
$.fn.property = function(){
    var container = this;
    propertyPage = this;
    $(container).attr({
        class:"property",
        "data-width": 350
    });
    $(container).css({
        "width":clientClosedWidth
    });
    var width=parseFloat($.cookie('propertyWidth'));
    if(!isNaN(width)){
        $(container).css({
            "data-width":width
        });
    }
    $("#newSystem").click(function(){
        $("#toolPopup").newSystem({
            success: function(value){
                var p;
                var name = value.name.trim().toLowerCase();
                $.each($.storekeys(),function(i,id){
                    var param = $.storeget(id);
                    if(param.datatype=="element" && (value.sysid && getInt(value.sysid!=0) && param.sysid==value.sysid || param.name.trim().toLowerCase()==name)){
                        p=param;
                    }
                });
                if(!p){
                    if(value.sysid && getInt(value.sysid!=0))
                        p=$.storeget(value.sysid);
                    else
                        p=$.extend(value,{
                            id: $.newguid(),
                            datatype:"element",
                            state:"new",
                            viewdata:{}
                        });
                }
                var x=0,y=0,h=$.logicMinHeight("element"),w=$.logicMinWidth("element");
                var last = $("svg[data-type='document']").children("[data-type='element']").last();
                if(last.length>0){
                    var lp = $(last).getviewpageparam();
                    var delta=1;
                    if(lp){
                        if($.pagenotation()=="bpmn"){
                            x=getFloat(lp.x),
                            y=getFloat(lp.y)+getFloat(lp.h)+delta,
                            w=getFloat(lp.w);
                        }
                        else{
                            x=getFloat(lp.x)+getFloat(lp.w)+delta,
                            y=getFloat(lp.y);
                            h=getFloat(lp.h);
                        }
                    }
                } else if(!x){
                    // добавился первый элемент, ставим по центру
                    var dx=(getFloat(document.documentElement.clientWidth)-(propertyPage?getFloat($(propertyPage).css("width")):0))/svgMultuplX- svgOffsetX/svgMultuplX;
                    var dy=(getFloat(document.documentElement.clientHeight)-(outputPage?getFloat($(outputPage).css("height")):0))/svgMultuplY - svgOffsetY/svgMultuplY;
                    dx=(dx-w)/2;
                    dy=(dy-h)/2;

                    var place=$("svg[data-type='document']");
                    var vb=$(place).svgviewbox();
                    var x1=getFloat(vb[2]);
                    var y1=getFloat(vb[3]);
                    $(place).svgviewbox(-dx,-dy,x1,y1);
                }
                p.viewdata[$.pagemenu()] = {
                    order:$("svg[data-type='document']").lastentityindex(),   
                    x:x,
                    y:y,
                    w:w,
                    h:h
                };
                $.storeset(p);
                $.propertyset(undefined,true);
            }
        });
    });
    $("#newElementFunction").click(function(){
        $("#toolPopup").newFunction({
            success: function(value){
                var params;
                var sl = $.getfirstofselected();
                if($(sl).attr("data-type")=="element")
                    params = $(sl).storeget();
 
                var input=$("#elementFunction li").find("input[type='text'][value='" + value.name + "']");
                value.checked = true;
                if(input.length!=0){
                    $(input).closest("li").find("input[type='checkbox']").prop("checked",true);
                }
                else{
                    var state="new";
                    if(params && params.state=="external")
                        state="external";
                    $("#elementFunction").propertyadditem($.extend(value,{
                        state:state,
                        typename:"function",
                        addaction:($.pagemenuname()!="business"?undefined:function(){
                            var selectedArray = $.getselected();
                            var selected = undefined;
                            if(selectedArray.length==1)
                                selected=selectedArray[0];
                            else{
                                return;
                            }
                            var y=50;
                            $(selected).find("svg[data-type2='logic']").each(function (fi, fe){
                                var fy=getFloat($(fe).attr("y")) + getFloat($(fe).attr("height"));
                                if(fy>y) y=fy;
                            });
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(selected).lastentityindex(),                                    
                                x: (getFloat($(selected).attr("width"))-$.logicMinWidth("function"))/2,
                                y: y+10
                            };
                            $.storeset({
                                id: $.newguid(),
                                datatype:"function",
                                name:value.name,
                                type:value.type,
                                container:$(selected).prop("id"),
                                state:value.state,
                                viewdata:viewdata
                            });
                        })
                    }));
                    if(value.addaction) value.addaction();
                }
                if(params && params.state=="exist"){
                    $("#elementName").attr({
                        "data-state":"change"
                    });
                    $("#elementStatus").attr({
                        "data-state": "change"
                    });
                }
                $.propertyapply();
            }
        });
    });
    $("#newElementData").click(function(){
        $("#toolPopup").newData({
            success: function(value){
                var params;
                var sl = $.getfirstofselected();
                switch($(sl).attr("data-type")){
                    case "element":
                        params = $(sl).storeget();
                }
                var input=$("#elementData li").find("input[type='text'][value='" + value.name + "']");
                value.checked = true;
                if(input.length!=0){
                    $(input).closest("li").find("input[type='checkbox']").prop("checked",true);
                }
                else{
                    var state="new";
                    if(params && params.state=="external")
                        state="external";
                    $("#elementData").propertyadditem($.extend(value,{
                        state:state,
                        typename:"data"
                    }));
                }
                if(params && params.state=="exist"){
                    $("#elementName").attr({
                        "data-state":"change"
                    });
                    $("#elementStatus").attr({
                        "data-state": "change"
                    });
                }
                $.propertyapply();
            }
        });
    });
    $("#newFunctionData").click(function(){
        $("#toolPopup").newData({
            success: function(value){
                var params;
                var sl = $.getfirstofselected();
                switch($(sl).attr("data-type")){
                    case "function":
                        params = $.storeget($(sl).attr("data-container"));
                }
                var input=$("#functionData li").find("input[type='text'][value='" + value.name + "']");
                value.checked = true;
                if(input.length!=0){
                    $(input).closest("li").find("input[type='checkbox']").prop("checked",true);
                }
                else{
                    var state="new";
                    if(params && params.state=="external")
                        state="external";
                    $("#functionData").propertyadditem($.extend(value,{
                        state:state,
                        typename:"data"
                    }));
                }
                $.propertyapply();
                /*if(params){
                    if(!params.data) params.data=[];
                    params.data.push(value);
                    storedirectlyset(params.id,params);
                }
                $.propertyset($(sl).storeget(),true);*/
            }
        });
    })
    $("#newElementComponent").click(function(){
        var params;
        var sl = $.getfirstofselected();
        if($(sl).attr("data-type")=="element")
            params = $(sl).storeget();
        $("#toolPopup").newComponent({
            id:$.newguid(),
            parent:params.name,
            name:"",
            data:[],
            //nosaveas:true,
            caption:"Новый компонент",
            success: function(value){
                var sl = $.getfirstofselected();
                if($(sl).attr("data-type")=="element")
                    $(sl).componentUpdate(value,"add");
            }
        });
    });
    $("#newDocumentUser").click(function(){
        $("#userPopup").find("#userId").val("");
        $("#userPopup").find("#userName").text("");
        $("#userPopup").showDialog({
            caption:"Добавление редактора",
            okcaption:"Добавить",
            success:function(){
                var id = $("#userPopup").find("#userId").val();
                if(id==""){
                    $("#userPopup").setError(["Пользователь не найден"]);
                    return;
                }
                else{
                    $("#userPopup").showDialog(false);
                    propertyadduser({
                        login:$("#userPopup").find("#userId").val(),
                        name:$("#userPopup").find("#userName").text()
                    });
                    $.propertyapply();
                }
            }
        });
    });
    $("#edit_doc_autor").click(function(){
        $("#userPopup").find("#userId").val("");
        $("#userPopup").find("#userName").text("");
        $("#userPopup").showDialog({
            caption:"Указать автора",
            okcaption:"Установить",
            success:function(){
                var id = $("#userPopup").find("#userId").val();
                if(id==""){
                    $("#userPopup").setError(["Пользователь не найден"]);
                    return;
                }
                else{
                    $("#userPopup").showDialog(false);
                    var canvas = $("svg[data-type='document']");
                    var prop = $(canvas).documentget();

                    prop = $.extend(prop, {
                        login:$("#userPopup").find("#userId").val(),
                        author:$("#userPopup").find("#userName").text()
                    });
                    storedirectlyset(prop.id,prop);
                    $.propertyset(prop,true);
                }
            }
        });
    });
    $("#userPopup").find("#userLogin").change(function(){
        $("#userPopup").setError("");
        let login = $("#userLogin").val();
        //if(login.indexOf('\\')==-1) login="gpb\\"+login; 
        getUserInfo({
            login: login,
            success:function(result){
                $("#userPopup").find("#userId").val(result.login);
                $("#userPopup").find("#userName").text(result.name);
            },
            error:function(message){
                $("#userPopup").find("#userId").val("");
                $("#userPopup").find("#userName").text("");
                $("#userPopup").setError([message]);
            }
        })
    });
    $("#userPopup").find("#userSearch").click(function(){
        $("#userPopup").find("#userLogin").change();
    });
    $("#documentUsersPlace").css({
        display:canOperate()?"default":"none"
    });
 
    /*$("#elementRemoveCollaboration").click(function(){
        if(confirm('Исключить из комплекса?')){
            var e = $.getfirstofselected();
            if(e){
                var params = $(e).storeget();
                var pp=$(e).logicGetGlobalOffset();
                var parammenu = $.getviewpageparam(params);
                var place = $("svg[data-type='document']");
                delete params.container;
                parammenu.order=$(place).lastentityindex();
                storedirectlyset(params.id,params);

                $(place).children("[data-type]").last().after($(e));
                $(e).attr({
                    x:pp.x,
                    y:pp.y
                });
                $(e).removeAttr("data-container");
                $(e).logicsave();

                $.propertyset(params, true);
            }
        }
    });*/

    //$("#sys_valuestream").dictionary({name:"Каталог проектов"});
    $("#projectName").dictionary({name:"Каталог проектов"});
    $("#createdoc_project").dictionary({name:"Каталог проектов"});


    $("#zoneName").logicdictionary({
        source: function (d, f) {
            getZoneList({
                term:d.term.toLowerCase(),
                length:40,
                typeid:2,
                success:function(result){
                    if (typeof f == "function") f(result);
                }
            });
        },
        fields:{
            description:"zonePurpose",
            color:"zoneColor"
        }
    });

    $("#zoneColor, #datacenterColor").minicolors({
        format:"hex",
        position:'bottom right'
    });
    $("#datacenterName").logicdictionary({
        source: function (d, f) {
            getZoneList({
                term:d.term.toLowerCase(),
                length:40,
                typeid:1,
                success:function(result){
                    if (typeof f == "function") f(result);
                }
            });
        },
        fields:{
            description:"datacentePurpose",
            color:"datacenteColor"
        }
    });

    $("#elementName").autocomplete({
        source: function (d, f) {
            let term = d.term.toLowerCase();
            getSystemList({
                term:term,
                length:40,
                success:function(result){

                    if (typeof f == "function") f($(result).sortByTerm(term));
                }
            });
        },
        minLength: 1,
        delay: 100,
        autoFocus: false,
        select: function (event, ui) {
            elementUpdate(ui.item);
        }
    });
    $("#elementName").keyup(function (event) {
        if(event.keyCode!=13)
            $("#elementName").removeAttr("data-sysid");
    });
   $("#elementName").change(function (event) {
        elementUpdate({
            sysid:getValue($("#elementName").attr("data-sysid")),
            name:$("#elementName").val()
        });
    });
    $("#functionName").logicdictionary({
        source: function (d, f) {
            var params=$.storeget($("#functionName").attr("container-id"));
            getSystemFunctionList({
                systemid:params.sysid,
                term:d.term.toLowerCase(),
                length:20,
                success:function(result){
                    if (params.functions) {
                        $.each(params.functions, function (ie, e) {
                            var i = -1;
                            var r;
                            e.label=e.value=e.name;
                            $.each(result, function (ir, rd) {
                                if(ie==0){
                                    rd.saved=true;
                                    rd.typename="function";
                                }
                                if (e.id == rd.id) {
                                    i = ir;
                                    r=rd;
                                }
                            });
                            if (i != -1 && r) {
                                result.splice(i, 1);
                                result.push($.extend({},e, {
                                    checked: true,
                                    typename: "function",
                                    connection: r.connection,
                                    type:r.type,
                                    interaction:r.interaction,
                                    saved:r.saved
                                }));
                            }
                            else
                                if(!d?.term || d.term=="" || e.name.toLowerCase().indexOf(d.term.toLowerCase())!=-1){
                                    result.push($.extend({},e, {
                                        checked: true,
                                        typename: "function"
                                    }));
                                }
                        });
                    }
                    if (typeof f == "function") f($(result).sortByTerm(d.term.toLowerCase()));
                }
            });
        }
    });
    $("#subprocessName").logicdictionary({
        source: function (d, f) {
            var result = [];
            let templateFile = $("#subprocessTemplate").find("[data-id=templateFile]");
            
            var params = $("svg[data-type='document']").documentget();
            if(getInt($(templateFile).attr("data-sysid"))!=0){
                $.getdocument({
                    id:getInt($(templateFile).attr("data-sysid")),
                    success: function(document){
                        $.each(document.data,function(i,e){
                            let p=JSON.parse(e);
                            if(p.datatype=="document"){
                                params = p;
                                return false;
                            }
                        });
                    }
                });
            }
            if(params.viewdata){
                for(let key of Object.keys(params.viewdata)){
                    var e=params.viewdata[key];
                    if(e.datatype=="business" /*&& key!=$.pagemenu()*/)
                        result.push({
                            label: e.name,
                            value: e.name,
                            sysid:key,
                            name: e.name,
                            description:e.description
                        })
                };
            }
            if (typeof f == "function") f(result);
        }
    });
    let subprocessFile = $("#subprocessTemplate").find("[data-id=templateFile]");
    $(subprocessFile).autocomplete({
        source: function (d, f) {
            getPublishedDocumentList({
                state: 'publish',
                search:d.term.toLowerCase(),
                length: 40,
                success: function (data) {
                    let result=[];
                    $.each(data,function(i,e){
                        result.push({
                            label: e.name + (e.version?" v" +e.version:""),
                            value: e.name + (e.version?" v" +e.version:""),
                            sysid:e.id,
                            name: e.name + (e.version?" v" +e.version:""),
                            description:e.description
                        })
                    });
                    if (typeof f == "function") f(result);
                }
            });
        },
        minLength: 0,
        delay: 100,
        autoFocus: false,
        select: function (event, ui) {
            $(subprocessFile).attr({
                "data-sysid": ui.item.sysid
            });
            subprocessUpdate();
        }
    });
    $(subprocessFile).keyup(function (event) {
        if(event.keyCode!=13){
            $(subprocessFile).removeAttr("data-sysid");
            subprocessUpdate();
        }
    });
    $(subprocessFile).on("change",function(){
        subprocessUpdate();    
    });
    $(subprocessFile).click(function (event) {
        $(subprocessFile).autocomplete("search");
    });


    $("#elementComponentFilter").keyup(function(){
        $("#elementComponent li").each(function(i,e){
            var filter = $("#elementComponentFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#elementDataFilter").keyup(function(){
        $("#elementData li").each(function(i,e){
            var filter = $("#elementDataFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#elementFunctionFilter").keyup(function(){
        $("#elementFunction li").each(function(i,e){
            var filter = $("#elementFunctionFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#functionDataFilter").keyup(function(){
        $("#functionData li").each(function(i,e){
            var filter = $("#functionDataFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#serverElementFilter").keyup(function(){
        $("#serverElement li").each(function(i,e){
            var filter = $("#serverElementFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#elementSupplyFilter").keyup(function(){
        $("#elementSupply li").each(function(i,e){
            var filter = $("#elementSupplyFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#elementConsumerFilter").keyup(function(){
        $("#elementConsumer li").each(function(i,e){
            var filter = $("#elementConsumerFilter").val();
            if(filter=="")
                $(e).show();
            else{
                var re = new RegExp(getRegExp(filter), "ig");
                if(re.exec($(e).find("input[type='text']").val())!=null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    //$("#sys_type").dictionary({name:"Каталог типов АС"});
    $.each($.systemtypedictionary(),function(is,es){
        $("#sys_type").append(
            $("<option>",{text:es.name, value:es.alias, title:es.description})
        );
    });
    $("#sys_type, #line_type").change(function(){
        $.propertyapply();
        $.propertyset(undefined,true);
        var sl = $.getfirstofselected();
        if(sl)
            $(sl).logicname($(sl).storeget());
    });
    /*$("#sys_appos").dictionary({name:"Каталог ОС"});
    $("#sys_appenv").dictionary({name:"Каталог сред исполнения"});
    $("#sys_dbos").dictionary({name:"Каталог ОС"});
    $("#sys_dbenv").dictionary({name:"Каталог БД"});*/

    $("#server_os").dictionary({
        name:"Каталог ОС",
        action:function(){
            filterServerElementByAttr();
        }
    });
    $("#server_os").on("change",function(){
        filterServerElementByAttr();
    });

    $.doctypedictionary().forEach(e=>{
        $("#doc_type").append(
            $("<option>",{text:e.type, value:e.typeid, title:e.typedescription, "data-code":e.typecode})
        );
    });

    $("#doc_type").on("change",function(){
        var opt = $(this).find("option:selected");
        $.setdocumentviewpoint($(opt).attr("data-code"));
    });

    getDictionaryItems({
        name:"Каталог сред исполнения",
        term:"",
        length:10000,
        success:function(result1){
            getDictionaryItems({
                name:"Каталог БД",
                term:"",
                length:10000,
                success:function(result2){
                    $("#server_env").dictionary({
                        data:result1.concat(result2),
                        action:function(){
                            filterServerElementByAttr();
                        }
                    });
                }
            });
        }
    });
    $("#server_env").on("change",function(){
        filterServerElementByAttr();
    });

    //$("#sys_dev").dictionary({name:"Каталог сред разработки"});
    $("#sys_location").dictionary({name:"Каталог сетевых сегментов"});
    /*$("#sys_critical").dictionary({name:"Каталог классов критичности"});
    $("#sys_recovery").dictionary({name:"Каталог времен восстановления"});
    $("#sys_mode").dictionary({name:"Каталог режимов функционирования"});
    $("#sys_lifecycle").dictionary({name:"Каталог жизненных циклов"});
    $("#sys_certificate").dictionary({name:"Каталог сертификации"});
    $("#sys_monitoring").dictionary({name:"Каталог уровней мониторинга"});
    $("#sys_users").dictionary({name:"Каталог категорий пользователей"});
    $("#sys_zoomlevel").dictionary({name:"Каталог масштабируемости"});
    $("#sys_deployment").dictionary({name:"Каталог типов обработки отказов"});
    $("#sys_levels").dictionary({name:"Каталог типов развертывания"});*/
    $("#elementPurpose").change(function(){
        $("#elementName").attr({
            "data-description": $("#elementPurpose").val()
        });
       $.propertyapply();
    });
    $("#zonePurpose").keyup(function (event) {
        if(event.keyCode!=13)
            $("#zonePurpose").removeAttr("data-sysid");
    });
    $("#zonePurpose").change(function(){
        $("#zoneName").attr({
            "data-description": $("#zonePurpose").val()
        });
        $.propertyapply();
    });
    $("#datacenterPurpose").change(function(){
        $("#datacenterName").attr({
            "data-description": $("#datacenterPurpose").val()
        });
       $.propertyapply();
    });
    $("#businessDescription").change(function(){
        $("#businessName").attr({
            "data-description": $("#businessDescription").val()
        });
       $.propertyapply();
    });
    $("#businessName").change(function(){
        $("div[data-menu='business'] a[data-type='" + $.pagemenu() + "']").attr({
            title: $("#businessName").val()
        });
        $("title").html($("#businessName").val());
    });
    $("#lineInteraction").dictionary({name:"Каталог типов взаимодействий", noupdate:true});
    $("#lineProtocol").dictionary({name:"Каталог интеграционных интерфейсов", noupdate:true});
    /*$("#srvInteraction").dictionary({name:"Каталог типов взаимодействий", noupdate:true});
    $("#srvProtocol").dictionary({name:"Каталог интеграционных интерфейсов", noupdate:true});*/
    $("#srvMethodType").dictionary({name:"Каталог методов сервиса", noupdate:true});

    $("#int_integrationtype").dictionary({name: "Каталог типов взаимодействий"});
    $("#int_consumerconnection").dictionary({name: "Каталог интеграционных интерфейсов"});
    $("#int_integrationplatform").dictionary({name: "Каталог интеграционных платформ"});

    $("#int_integrationplatform").dictionary({name:"Каталог интеграционных платформ"});
    $("#int_supplyconnection").dictionary({name:"Каталог интеграционных интерфейсов"});
    $("#supplyService").change(function (e) {
        var optionSelected = $(this).find("option:selected");
        //$("#int_consumerconnection").val($(optionSelected).attr("connection"));
        //$("#int_integrationtype").val($(optionSelected).attr("interaction"));
        var sl = $.getfirstofselected();
        if(sl){
            var param = $(sl).lineget();
            var lines = linegetinterfacelist(param.number);
            var supply = param.function=="supply"?param.startel:param.endel;
            let data={
                id:$(optionSelected).val(),
                name:$(optionSelected).text(),
                method:$(optionSelected).attr("method"),
                description:$(optionSelected).attr("description"),
                /*connection:$(opt).attr("connection"),
                interaction:$(opt).attr("interaction"),*/
                methodtype:$(optionSelected).attr("methodtype")
            };
            $.each(lines,function(i1,p){
                if(supply==(p.function=="supply"?p.startel:p.endel)){
                    p.endfn=data.id;
                    p.endfnname=data.name;
                    p.consumermethod=data.method;
                    p.consumermethodtype=data.methodtype;
                    if(p.supplyfunction){
                        p.supplyfunction=$.extend(p.supplyfunction,data,{
                            consumermethod:data.method,
                            consumermethodtype:data.methodtype
                        });
                    }
                    storedirectlyset(p.id,p,false);
                }
            });
            storeupdatedata({
                id:data.id,
                name:data.name,
                method:data.method,
                /*connection:value.connection,
                interaction:value.interaction,*/
                methodtype:data.methodtype,
                description:data.description,
                typename:"function"
            });

        }
        //$("#int_integrationtype").val(value.interaction);
        //$("#int_consumerconnection").val(value.connection);
        $("#int_consumermethod").val($(optionSelected).attr("method"));
        $("#int_consumermethodtype").val($(optionSelected).attr("methodtype"));
        var lineName = $("#lineName").val();
        if(lineName=="" || lineName =="Новый интерфейс"){
            var line = $.storeget($("#lineName").attr("data-id"));
            if(line && (line.starttype=="comment" || line.endtype=="comment" || line.starttype=="picture" || line.endtype=="picture"))
                $("#lineName").val($(optionSelected).text());
        }
        $("#supplyService_action").off("click");
        $("#supplyService_action").click(function(){
            $("#toolPopup").newFunction({
                id:$(optionSelected).val(),
                name:$(optionSelected).text(),
                method:$(optionSelected).attr("method"),
                description:$(optionSelected).attr("description"),
                /*connection:$(optionSelected).attr("connection"),
                interaction:$(optionSelected).attr("interaction"),*/
                type: $(optionSelected).attr("type"),
                methodtype:$(optionSelected).attr("methodtype"),
                caption:"Редактировать '" + $(optionSelected).text() +"'",
                success: function(value){
                    storeupdatedata({
                        id:$(optionSelected).val(),
                        name:value.name,
                        method:value.method,
                        /*connection:value.connection,
                        interaction:value.interaction,*/
                        methodtype:value.methodtype,
                        description:value.description,
                        type:value.type,
                        typename:"function"
                    });
                    $(optionSelected).attr({
                        /*connection:value.connection,
                        interaction:value.interaction,*/
                        method:value.method,
                        description:value.description,
                        methodtype:value.methodtype,
                        type:value.type
                    });
                    $(optionSelected).text(value.name);

                    $("#int_consumermethod").val(value.method);
                    $("#int_consumermethodtype").val(value.methodtype);
                    //$("#int_integrationtype").val(value.interaction);
                    //$("#int_consumerconnection").val(value.connection);
                }
            });                
        });
        $.propertyapply();
    });
    $("#consumerService").change(function (e) {
        var optionSelected = $(this).find("option:selected");
        if($(optionSelected).attr("connection")!="" && $(optionSelected).attr("connection")!=undefined) $("#int_consumerconnection").val($(optionSelected).attr("connection"));
        var lineName = $("#lineName").val();
        if(lineName=="" || lineName =="Новый интерфейс")
            $("#lineName").val($(optionSelected).text());
        $.propertyapply();
    });
    $("#lineName").autocomplete({
        source: function (d, f) {
            var cid=getInt($("#lineName").attr("data-consumerid"));
            var sid=getInt($("#lineName").attr("data-supplyid"));
            getSystemInterfaceListA({
                cid:cid,
                sid:sid,
                term:d.term.toLowerCase(),
                length:20,
                success:function(result){
                    if($.pagemenuname()=="business"){
                        $.each($.storekeys(),function(i,id){
                            var params = $.storeget(id);
                            if(params.datatype=="line" && $.hasviewpageparam(params,"interface")){
                                var consumer,supply;
                                if(params.function=="consumer"){
                                    consumer = $.storeget(params.startel).sysid;
                                    supply = $.storeget(params.endel).sysid;
                                }
                                else{
                                    supply = $.storeget(params.startel).sysid;
                                    consumer = $.storeget(params.endel).sysid;
                                }
                                var cfn=getInt($("#consumerService").val());
                                var sfn=getInt($("#supplyService").val());
                                if(
                                    (consumer==cid && supply==sid || consumer==sid && supply==cid) &&
                                    (cfn==params.endfn && sfn==params.startfn || cfn==params.startfn && sfn==params.endfn)
                                ){
                                    result.push($.extend(params,{
                                        label: params.name,
                                        value: params.name,
                                        consumerfunction:params.endfn,
                                        supplyfunction:params.startfn
                                    }));
                                }
                            }
                        });
                    }
                    if (typeof f == "function") f($(result).sortByTerm(d.term.toLowerCase()));
                }
            });
        },
        minLength: 0,
        delay: 100,
        autoFocus: false,
        select: function (event, ui) {
            var sl = $.getfirstofselected();
            if(sl){
                var params = $(sl).lineget();
                params.endfn=ui.item.consumerfunction;

                var supply;
                if(params.endel) 
                    supply= $.storeget(params.endel);
                if(ui.item.supplyfunction){
                    params.endfn=ui.item.supplyfunction;
                    if(supply){
                        if(!supply.functions) supply.functions=[];
                        if(!$(supply.functions).objectArrayHasId(ui.item.supplyfunction))
                            supply.functions.push({id:ui.item.supplyfunction,name:ui.item.supplyfunctionname,state:"exist"});
                    }
                }
                if($.hasviewpageparam(params,"interface")){
                    if(params.viewdata["interface"].direction=="f"){
                        if(supply)
                            $.storeset(supply);
                        if(params.startel)
                            supply=$.storeget(params.startel);
                    }
                }
                if(ui.item.data){
                    params.data=ui.item.data;
                    if(supply)
                    {
                        if(!supply.data) supply.data=[];
                        $.each(ui.item.data,function(i,e){
                            if(!$(supply.data).objectArrayHasId(e.id))
                                supply.data.push(e);
                        });
                    }
                }
                if(supply)
                    $.storeset(supply);
                $.storeset(params);
                $.propertyset(params,true);
            }
        }
    });
    $("#lineName").click(function (event) {
        $("#lineName").autocomplete("search");
    });
    $("#lineName").keyup(function (event) {
        if(event.keyCode!=13)
            $("#lineName").removeAttr("data-sysid");
    });
    $("#lineName").change(function (event) {
        var sl = $.getfirstofselected();
        if(sl){
            var params = $(sl).lineget();
            params.name = $("#lineName").val();
            params.state="new";
            $.propertyset(params);
            $.storeset(params);
        }
    });
    $("#cbLineDirect").change(function(){
        var sl = $.getfirstofselected();
        if(sl){
            $(sl).linetype("direct");
        }
        $.propertyapply();
    });
    $("#cbLineRectangle").change(function(){
        var sl = $.getfirstofselected();
        if(sl){
            $(sl).linetype("rectangle");
        }
        $.propertyapply();
    });
    $("#cbLineCurved").change(function(){
        var sl = $.getfirstofselected();
        if(sl){
            $(sl).linetype("curved");
        }
        $.propertyapply();
    });
    $("#grElementType").find("input[type='radio']").change(function(){
        $.propertyapply();
        $.propertyset(undefined,true);
        var sl = $.getfirstofselected();
        if(sl)
            $(sl).logicname($(sl).storeget());
    });
    $("#elementPart a").click(function () {
        var type = $(this).attr("data-id");
        $("#elementPart a").removeClass("selected");
        $(this).addClass("selected");
        updateElementPart();
    });
    $("#lineTemplate").find("[data-id=templateFile]").change(function(){
        let params = $("#lineTemplate").updateTemplateParams();
        switch($.pagemenuname()){
            case "interface":
                var lines = linegetinterfacelist(params.number);
                if(lines.length==1){
                    let p=lines[0];
                    p.template=params.template;
                    p.name = params.name;
                    storedirectlyset(p.id,p);
                }
                break;
            case "system":
                var param = linegetflow(params.number);
                if(param){
                    param.template=params.template;
                    param.name =  params.name;
                    storedirectlyset(param.id,param);
                }
                break;
        }        $.propertyset(params,true);
    });
    $("#elementTemplate").find("[data-id=templateFile]").change(function(){
        let params = $("#elementTemplate").updateTemplateParams();
        $.propertyset(params,true);
    });

    /*$("#doc_schema").fileupload({
        url: "",
        maxChunkSize: 25000000,
        done: function (e, data) {
            //percent();
            if (data !=undefined && data.files != undefined && data.files.length > 0){
                $("#doc_schema_upload img").attr("src","images/visio48.png");
                $("#doc_schema_delete").show();
                $("#doc_schema_upload").attr("title","Открыть схему");
            }
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            //percent(progress);
        },
        send: function (e, data) {
            var maxfilelen = 8000000;
            var maxfilealert = "Максимальный размер файла - 7 мб";     
            if (data != undefined && data.files != undefined && data.files.length > maxfilelen){
                $("#doc_schema").val("");
                alert(maxfilealert);
            }
        },
        start: function (e) {
            //percent();
            var file = $(place).file("file");
            if (file != undefined && file != "" && options.ondelete != undefined)
                options.ondelete();
        },
        stop: function (e) {
        },
        fail: function (e, data) {
            //error();
            console.log(data);
        }
    });*/
    var clearschema = function () {
        var txt = "Загрузить схему";
        $("#doc_schema").val("");
        $("#doc_schema_action span").attr({
            "data-action": "load",
            title:txt
        });
        $("#doc_schema_action span").text(txt);
        $("#doc_schema_action img").attr({
            title: txt,
            src:"images/download48.png"
        });
        $("#doc_schema_action").removeAttr("data-link");
        $("#doc_schema_delete").hide();
    }

    $("#doc_schema_delete").click(function () {
        if(!confirm('Удалить схему?')) 
            return false;
        var canvas = $("svg[data-type='document']");
        var prop = $(canvas).documentget();
        if (prop.sysid != 0) {
            $.storeRemoveAttachment({
                id: prop.sysid,
                url: $("#doc_schema_action").attr("data-link")
            });
            clearschema();
        }
    });
    $("#doc_schema").on("change", function(){
        var file = doc_schema.files[0];
        if(!file){
            //$("#doc_schema_delete").click();
            return;
        }
        //save file
        var canvas = $("svg[data-type='document']");
        var prop = $(canvas).documentget();
        if (prop.sysid == 0) {
            $.storesave({
                login: $.currentuser().login           
            });
            prop = $(canvas).documentget();
        }
        $.saveschema({
            id: prop.sysid,
            type:$.pagemenuname(),
            file:file,
            success:function(){
                $.schemashow();
            }
        });
    });
    $("#doc_schema_action").click(function () {
        if ($("#doc_schema_action span").attr("data-action") == "load") {
            $("#doc_schema").click();
        }
        else {
            var link = document.createElement('a');
            link.href = $("#doc_schema_action").attr("data-link");
            link.download = $("#doc_schema_action span").text();
            link.click();
        }
    });
    $.schemashow = function () {
        $.schemahide();
        var canvas = $("svg[data-type='document']");
        var prop = $(canvas).documentget();
        if (prop.sysid != 0) {
            $.getschemaname({
                id: prop.sysid,
                type: $.pagemenu(),
                success: function (file) {
                    if (file.name && file.name != "") {
                        var txt = file.name;
                        $("#doc_schema_action span").attr({
                            "data-action": "open",
                            title: txt
                        });
                        $("#doc_schema_action span").text(file.name);
                        $("#doc_schema_action img").attr({
                            title: txt,
                            src: "images/visio48.png"
                        });
                        $("#doc_schema_action").attr({
                            "data-link":file.link
                        });
                        $("#doc_schema_delete").show();
                    }
                    $("#docSchema").show();
                }
            });
        }
        else
            $("#docSchema").show();
    }
    $.schemahide = function () {
        $("#docSchema").hide();
        clearschema();
    }

    $(container).find("input[type='text']:not(#elementName):not(#zoneName):not(#datacenterName):not(#functionName):not(#subprocessName)").change(function(){
        switch($(this).prop("id")){
            case "lineNumber":
                if($.pagemenuname()=="interface" /*|| $.pagemenuname()=="system"*/){
                    var number=$(this).val();
                    var params = $($.getfirstofselected()).lineget();
                    $.each(linegetinterfacelist(params.number),function(i1,p){
                        p.number=p.number.toString().replace(params.number,number);
                        storedirectlyset(p.id,p);
                    });
                }
                break;
            case "int_docref":
                var docref = $("#int_docref").val();
                if(docref && docref!=""){
                    $("#int_docref_link").attr({
                        href:docref
                    });
                    $("#int_docref_link").prop('disabled', false);
                }
                else{
                    $("#int_docref_link").removeAttr("href");
                    $("#int_docref_link").prop('disabled', true);
                }
                break;
            case "int_consumermethod":
            case "int_consumermethodtype":
            case "int_consumerconnection":
                if($.pagemenuname()=="system"){
                    var param = linegetflow($("#lineNumber").val());
                    var p = $($.getfirstofselected()).lineget();
                    if(param && p){
                        if(!$.isempty(param.endfn) && (param.function=="supply"?param.startel:param.endel) == (p.function=="supply"?p.startel:p.endel)){
                            var el=param.endel;
                            var endfnname="";
                            if(param.function=="supply")
                                el=param.startel;
                            if(el && param.endfn){
                                var endel=$.storeget(el);
                                $.each(endel.functions,function(i,e){
                                    if(e.id==param.endfn){
                                        endfnname=e.name;
                                    }
                                })
                            }
                            if(!$.isempty(endfnname)){
                                storeupdatedata({
                                    id:param.endfn,
                                    name:endfnname,
                                    method:$("#int_consumermethod").val(),
                                    connection:$("#int_consumerconnection").val(),
                                    /*interaction:value.interaction,*/
                                    methodtype:$("#int_consumermethodtype").val(),
                                    typename:"function"
                                });
                            }
                        }
                    }
                }
                break;
        }
        $.propertyapply();
    });
    $(container).find("textarea").change(function(){
        $.propertyapply();
    });
    $(container).find("select").change(function(){
        $.propertyapply();
    });
    var place = $(container).parent();
    $(container).on("mousemove",function(event){ $(container).propertyMouseMove(event);});
    $(container).on("mousedown",function(event){
        if(propertyFn=="default")
            return;
        event.stopPropagation();
        if(event.button!=0){
            // зажата правая клавиша
            $(place).trigger("mouseup");
            return;
        }
        $.logicOff();
        $.lineOff();
        $.linetextOff();
        var clientStartX = event.clientX;
        var clientWidth = parseFloat($(container).css("width"));
        $(place).on("mousemove",function(event){
            if(event.buttons==0){
                // зажата правая клавиша
                $(place).trigger("mouseup");
                return;
            }
            var width=clientWidth - event.clientX+clientStartX;
            if(width>=clientMinWidth){
                $(container).css("width",width);
                $(container).attr({
                    "data-width": width
                });
                $.cookie('propertyWidth', width, {
                    expiresHours: 12,
                    path: "/"
                });
                if(!$.ispropertyshown()) $.propertyshow();
            }
            /*else{
                if($(container).hasClass("open"))
                    $(container).removeClass("open"); 
            }*/
        });
        $(place).on("mouseup",function(){
            propertyFn="default";
            $(place).off("mousemove");
            $(place).off("mouseup");
            $.logicOn();
            $.lineOn();
            $.linetextOn();
        });
    });
    $("#elementConfig").find("div.itemconfig").click(function(){
        $("#elementMetric").setSystemMetric($(this).attr("data-action"));
        $.propertyapply();
    });
    
    $("#businessNotation").change(function(){
        $.rotateviewpageparam();
        $.restore(); 
    });
};
$.fn.propertyItemStatus = function(typename){
    propertyPage = this;
    $(propertyPage).createItemStatus({
        typename:typename,
        action: function(e){
            var sl = $.getfirstofselected();
            if(sl){
                switch($(sl).attr("data-type")){
                    case "element":
                        var params = $.extend($(sl).logicget(), {
                            state:e.state
                        });
                        if(e.state=="exist" || e.state=="external"){
                            $.each(params.functions, function(i,fn){
                                if(fn.state!="external"){
                                    fn.state=e.state;
                                }
                            });
                            $.each(params.data, function(i,dt){
                                if(dt.state!="external"){
                                    dt.state=e.state;
                                }
                            });
                            $.each(params.components, function(i,ct){
                                if(ct.state!="external") ct.state=e.state;
                                $.each(ct.data,function (i1,ct1) {
                                    if(ct1.state!="external") ct1.state=e.state;
                                });
                                for(let i of Object.keys(ct.values)){
                                    if(ct.values[i].state!="external") ct.values[i].state=e.state;
                                }
                            });
                        }
                        $.propertyset(params,true);
                        $.storeset(params);
                        break;
                    case "functionstep":
                    case "subprocess":
                    case "function":
                    case "server":
                    case "cluster":
                        var params = $.extend($(sl).logicget(), {
                            state:e.state
                        });
                        $.propertyset(params,true);
                        $.storeset(params);
                        break;
                    case "line":
                        var params = $(sl).lineget();
                        if($.hasviewpageparam(params,"interface")){
                            var list = linegetinterfacelist(params.number);
                            if(list.length==1 || e.state!="change"){
                                $.each(list,function(i1,p){
                                    p.state=e.state;
                                    storedirectlyset(p.id,p);
                                });
                            }
                        }
                        if($.hasviewpageparam(params,"system")){
                            var p = linegetflow(params.number);
                            if(p && p.state=="exist" && (e.state=="change" || e.state=="new")){
                                p.state="change";
                                storedirectlyset(p.id,p);
                            }
                        }
                        params.state = e.state;
                        $.propertyset(params);
                        $.storeset(params);
                        break;
                }
            }
        }
    });
}
$.fn.getTemplateParams = function(temp){
    let templates = (temp?temp.filter(item => item.viewdata!=$.pagemenuname()):[]);
    let templateData=$(this).find("[data-id='templateData']");
    $(templateData).find("tr").each(function (i, e) {
        let n = $(e).find("td[data-type='name']");
        if(n.length>0){
            let input = $(e).find("input[data-type='value']");
            let item = {
                name: $(n).text().trim(),
                value: $(input).val(),
                datatype: $(input).attr("data-datatype"),
                viewdata: $.pagemenuname(),
                caption: $(input).attr("data-caption")/*,
                dictionary: $(input).attr("data-dictionary")*/
            }
            templates.push(item);
        }
    });
    return templates;
}

$.fn.updateTemplateParams = function(){
    let place = this;
    let params;
    let sl=$.getfirstofselected();
    if(sl)
        params = $(sl).storeget();
    else
        return;

    let templateFile=$(place).find("[data-id='templateFile']");
    let templateData=$(place).find("[data-id='templateData']");
    let templateLinkPlace=$(place).find("[data-id='templateLinkPlace']");
    let templateLink=$(place).find("[data-id='templateLink']");
    let templateDataPlace=$(place).find("[data-id='templateDataPlace']");

    let id = getInt($(templateFile).val());
    params.template = id;

    $(templateData).empty();
    $(templateLinkPlace).hide();
    $(templateDataPlace).hide();
    $.getdocument({
        id:id,
        async:false,
        success: function(document){
            if(document && getInt(document.id)!=0){
                $(templateLinkPlace).show();
                $(templateLink).attr({
                    href:"index.html?id=" + getInt(document.id)
                });
                let templates=[];
                let type;
                params.name = ($.isempty(document.description)?document.name:document.description) + " v" + document.version;
                type = params.datatype;
                if(params.templates)
                    temp=params.templates;

                let appendTemplate = function(templates,temp,p,caption){
                    let name = (p.name??"").trim().toLowerCase();
                    let c = (caption??"").trim().toLowerCase();
                    if(!templates.find(item=>item.name.trim().toLowerCase()==name && !$.isempty(item.caption) && item.caption.trim().toLowerCase()==c)){
                        let tt = temp.find(item=>item.name.trim().toLowerCase()==name && !$.isempty(item.caption) && item.caption.trim().toLowerCase()==c)
                        if(tt){
                            templates.push($.extend(tt,{dictionary:p.dictionary}));
                        }
                        else{
                            templates.push({
                                name:p.name,
                                dictionary:p.dictionary,
                                value:"",
                                caption:caption
                            });
                        }
                    }
                    return templates;
                }
                let appendTemplateListByState = function(templates,temp,e,caption){
                    if(e && Array.isArray(e)){
                        $.each(e.sort(function (a, b) {
                            return (a.name < b.name ? -1 : 1);
                        }),function(di,d){
                            if(d.state=="abstract"){
                                templates=appendTemplate(templates, temp, d,caption);
                            }
                        });
                    }
                    return templates;
                }
                let appendTemplateListByValue = function(templates,temp,e,caption){
                    if(e && Array.isArray(e)){
                        $.each(e.sort(function (a, b) {
                            return (a.name < b.name ? -1 : 1);
                        }),function(di,d){
                            if(d.value=="")
                                templates=appendTemplate(templates, temp, d, caption);
                        });
                    }
                    return templates;
                }
                let appendTemplateByValue = function(templates,temp,e,caption){
                    if($.isempty(e.value)){
                        templates=appendTemplate(templates, temp, e, caption);
                    }
                    return templates;
                }

                let templatedata = [];
                $.each(document.data,function(i,e){
                    let p=JSON.parse(e);
                    if(p.state=="abstract") templatedata.push(p);
                });
                let isintsetted = false;
                let tl = [];
                templatedata.filter(e=>e.datatype==type).forEach(p=>{
                    if(type=="line"){
                        params.docref = $.isnullorempty(p.docref, params.docref);
                        params.consumermethod = $.isnullorempty(p.consumermethod, params.consumermethod);
                        params.consumerint = $.isnullorempty(p.consumerint, params.consumerint);
                        params.supplyint = $.isnullorempty(p.supplyint, params.supplyint);
                        params.intplatform = $.isnullorempty(p.intplatform, params.intplatform);
                        if($.hasviewpageparam(p,"interface")){
                            isintsetted = true;
                            params.interaction = $.isnullorempty(p.interaction, params.interaction);
                            tl.push(p);
                        }
                        else if(!isintsetted){
                            params.interaction = $.isnullorempty(p.interaction, params.interaction);
                        }
                    }
                });
                $.storeset(params);
                if(tl.length>0){
                    templatedata.filter(e=>e.datatype!=type).forEach(p=>{
                        if(p.datatype!="element" || !tl.find(item=>item.endel==p.id) && !tl.find(item=>item.startel==p.id)){
                            if(!templates.find(item=>item.name.trim().toLowerCase()==p.name)){
                                templates.push({
                                    name:p.name,
                                    value:""
                                });
                            }
                        }
                    });                    
                }
                /*
                    let t = [];
                    switch($.pagemenuname()){
                        case "interface":
                            switch(p.datatype){
                                case "element":
                                    t=appendTemplateListByState(t, temp, p.data, p.name);
                                    t=appendTemplateListByState(t, temp, p.functions, p.name);
                                    break;
                                }
                            break;
                        case "system":
                            if(p.state=="abstract"){
                                switch(p.datatype){
                                    case "element":
                                        t=appendTemplateByValue(t, temp, {name:"Зона размещения системы/компонента",value:p.location,dictionary:"getZoneList"});
                                        break;
                                    case "line":
                                        t=appendTemplateByValue(t, temp, {name:"Документация",value:p.docref}, p.name);
                                        t=appendTemplateByValue(t, temp, {name:"Сервис/ очередь",value:p.consumermethod}, p.name);
                                        t=appendTemplateByValue(t, temp, {name:"Взаимодействие",value:p.interaction,dictionary: "Каталог типов взаимодействий"}, p.name);
                                        t=appendTemplateByValue(t, temp, {name:"Протокол поставщика",value:p.supplyint,dictionary: "Каталог интеграционных интерфейсов"}, p.name);
                                        t=appendTemplateByValue(t, temp, {name:"Протокол потребителя",value:p.consumerint,dictionary: "Каталог интеграционных интерфейсов"}, p.name);
                                        t=appendTemplateByValue(t, temp, {name:"Интеграционная платформа",value:p.intplatform,dictionary: "Каталог интеграционных платформ"}, p.name);
                                        break;
                                }
                                if(p.metrics)
                                    t=appendTemplateListByValue(t, temp, p.metrics.map(x => ({name:x.name,value:x.value,dictionary:x.name})), p.name);
                            }
                            if(p.components && p.components.length>0){
                                t=appendTemplateListByState(t, temp, p.components[0].data.map(x => ({name:x.typename,state:x.state})), p.name);
                            }
                            break;
                    }
                    if(t.length>0){
                        templates.push({
                            name:p.name + ":",
                            type:"caption"
                        });
                        templates = templates.concat(t.map(x => ({
                            caption:p.name,
                            name:x.name,
                            value:x.value,
                            datatype:p.datatype,
                            dictionary:x.dictionary,
                            viewdata:$.pagemenuname()
                        })));
                    }
                    */

                if(templates.length>0){
                    $(templateDataPlace).show();
                    $.each(templates, function (i, e) {
                        switch(e.type){
                            case "caption":
                                $(templateData).append(
                                    $("<tr>").append(
                                        $("<td>", {class:"label","data-type":"caption" ,colspan:"2"}).append(
                                            $("<div>",{class:"propertyCaption"}).append(
                                                $("<label>",{class:"caption",text:e.name})
                                            )
                                        ),
                                    )
                                );
                                break;
                            default:
                                let input = $("<input>", { 
                                    type: "text", 
                                    "data-type": "value", 
                                    value: e.value, 
                                    "data-name":e.name,
                                    "data-datatype":e.datatype/*,
                                    "data-viewdata":e.viewdata*/,
                                    "data-caption":e.caption/*,
                                    "data-dictionary":e.dictionary*/
                                });
                                if(e.dictionary){
                                    switch(e.dictionary){
                                        case "getZoneList":
                                            $(input).valuedictionary({
                                                source: function (d, f) {
                                                    getZoneList({
                                                        term:d.term.toLowerCase(),
                                                        length:40,
                                                        typeid:2,
                                                        success:function(result){
                                                            if (typeof f == "function") f(result);
                                                        }
                                                    });
                                                }
                                            });
                                        break;
                                        default:
                                            $(input).dictionary({ name: e.dictionary });
                                        break;
                                    }
                                }

                                $(input).on("change",function (event) {
                                    $.propertyapply();
                                });
                                $(templateData).append(
                                    $("<tr>").append(
                                        $("<td>", {class:"label","data-type":"name", text:e.name + ":"}),
                                        //$("<td>",{style:"width:1px", text:":"}),
                                        $("<td>").append(
                                            input
                                        )
                                    )
                                );
                            break;
                        }
                    });
                }
            }
        },
        error: function (message) {
            console.error(message);
        }
    });
    return params;
}
let updateElementPart = function(){
    $("div.elementProperty div[data-part-id]").hide();
    //$("#applicationPlace").find("div[data-part-id]").hide();
    let type=$("#elementPart a.selected").attr("data-id");
    $("div.elementProperty div[data-part-id='"+type+"']").show();
    //$("#applicationPlace").find("div[data-part-id='"+type+"']").show();
}
function subprocessUpdate(){
    let subprocessFile = $("#subprocessTemplate").find("[data-id=templateFile]");
    let templateLinkPlace=$("#subprocessTemplate").find("[data-id='templateLinkPlace']");
    if(getInt($(subprocessFile).attr("data-sysid"))!=0){
        $(templateLinkPlace).show();                    
        let templateLink=$("#subprocessTemplate").find("[data-id='templateLink']");
        $(templateLink).attr({
            href:"index.html?id=" + $(subprocessFile).attr("data-sysid")
        });
    }
    else{
        $(templateLinkPlace).hide();                    
    }
}
function elementUpdate(data){
    var sl = $.getfirstofselected();
    if(sl){
        let params = $(sl).logicget();
        if(params.components){
            let platform=params.components?.find(item => (item.id==params.sysid || (!params.sysid || getInt(params.sysid)==0) && item.id==params.id));
            if(platform && platform.name != data.name) {
                platform.name = data.name;
                storedirectlyset(params.id,params);
                params=$.storeget(params.id)
                $.storeset(params);
                $.propertyset(params);
            }
        }
        //Если правим на АП и на ИА есть с таким же именем без реализации на АП привязываем
        let p;
        if($.pagemenu()=="system"){
            p = $.logicgetbyname(data.name,"system");
            if(p){
                p.viewdata["system"]=params.viewdata["system"];
                p.components=params.components;
                p.location=params.location;
                //p.critical=params.critical;
                p.realization=params.realization;
                /*p.recovery=params.recovery;
                p.mode=params.mode;
                p.lifecycle=params.lifecycle;
                p.certificate=params.certificate;
                p.monitoring=params.monitoring;
                p.users=params.users;
                p.zoomlevel=params.zoomlevel;
                p.state=params.state;
                p.deployment=params.deployment;
                p.levels=params.levels;*/

                $.propertyset(p);
                $.storeset(p);
                $("g[data-type='line'][data-start='"+params.id+"']").each(function(i,e){
                    $(e).attr("data-start",p.id);
                    $(e).linesave();
                });   
                $("g[data-type='line'][data-end='"+params.id+"']").each(function(i,e){
                    $(e).attr("data-end",p.id);
                    $(e).linesave();
                });   
                $.storeremove(params.id);
    
            }
        }
        if(!p){
            if(data.sysid!=params.sysid){
                getSystemComponentList({
                    systemid:data.sysid,
                    systemonly:true,
                    length:1000000,
                    success:function(result){
                        data.components=result.map(a=>({...a}));
                    }
                });
                getSystemMetricList({
                    systemid: data.sysid,
                    length: 1000000,
                    success: function (result) {
                        data.metrics = result.map(a => ({ ...a }));
                    }
                });
            }
            else{
                let platform=params.components?.find(item => (item.id==params.sysid || (!params.sysid || getInt(params.sysid)==0) && item.id==params.id));
                if(!platform) platform=params.components?.find(item => (item.name.trim().toLowerCase()==params.name.trim().toLowerCase()));
                if(platform) platform.id=((!data.sysid || getInt(data.sysid)==0)?params.id:data.sysid);
            }
            params = $.extend(params, data);
            storedirectlyset(params.id,params);
            params=$.storeget(params.id)
            $.storeset(params);
            $.propertyset(params);
        }
        $.historycloseputtransaction();
    }
}
let addContract = function(params){
    let selected = $.getfirstofselected();
    let el=$(selected).storeget();
    let consumer;
    let supply = (compareString(el.name,params.supplyname)?el:undefined);
    $.each($.storekeys(),function(i,id){
        var e = $.storeget(id);
        if(e.datatype=="element" && $.hasviewpageparam(e,$.pagemenu())){
            if(!supply && compareString(e.name,params.supplyname)) supply=e;
        }
    });
    let place=$("svg[datatype='document']");
    var x = getFloat($(selected).attr("x"));
    var y = getFloat($(selected).attr("y"));
    let arrange_list=[];
    let autosize_list=[];
    if(!supply){
        var viewdata = {};
        viewdata[$.pagemenu()]={
            order:$(place).lastentityindex(),                                    
            x: x,
            y: y
        };
        getSystem({
            id:params.supply,
            success:function(data){
                supply = $.extend(data,{
                    id: $.newguid(),
                    datatype:"element",
                    datatype3:"application",
                    viewdata:viewdata
                });
                getSystemMetricList({
                    systemid: data.sysid,
                    length: 1000000,
                    success: function (result) {
                        supply.metrics = result.map(a => ({ ...a }));
                    }
                });
            }
        });

        /*supply = {
            id: $.newguid(),
            sysid:params.supply,
            datatype:"element",
            name:params.supplyname,
            type:"Автоматизированная система",
            state:"new",
            datatype3:"application",
            viewdata:viewdata
        };*/
        arrange_list.push(supply.id);
    }

    if(!consumer){
        var viewdata = {};
        viewdata[$.pagemenu()]={
            order:$(place).lastentityindex(),                                    
            x: x,
            y: y
        };
        consumer = {
            id: $.newguid(),
            datatype:"element",
            name:"",
            type:"Автоматизированная система",
            state:"abstract",
            datatype3:"application",
            viewdata:viewdata
        };
        arrange_list.push(consumer.id);
    }

    if(params.consumerfunctionname!=""){
        if(!consumer.functions) consumer.functions=[];
        if(!consumer.functions.find((item) => (compareString(params.consumerfunctionname,item.name)))){
            consumer.functions.push({
                id:params.consumerfunction,
                name:params.consumerfunctionname
            });
            if(!autosize_list.includes(consumer.id)) autosize_list.push(consumer.id);
        }
    }
    if(params.supplyfunctionname!=""){
        if(!supply.functions) supply.functions=[];
        if(!supply.functions.find((item) => (compareString(params.supplyfunctionname,item.name)))){
            supply.functions.push({
                id:params.supplyfunction,
                name:params.supplyfunctionname
            });
            if(!autosize_list.includes(supply.id)) autosize_list.push(supply.id);
        }
    }
    $.each(params.data,function(di,d){
        if(!params.issupplyreсeive){
            if(!supply.data) supply.data=[];
            if(!supply.data.find((item) => (compareString(d.name,item.name)))){
                supply.data.push($.extend(true,{},d));
                if(!autosize_list.includes(supply.id)) autosize_list.push(supply.id);
            }
        }
        else{
            if(!consumer.data) consumer.data=[];
            if(!consumer.data.find((item) => (compareString(d.name,item.name)))){
                consumer.data.push($.extend(true,{},d));
                if(!autosize_list.includes(consumer.id)) autosize_list.push(consumer.id);
            }
        }
    });

    $.storeset(supply);
    //elementUpdate(supply);

    $.storeset(consumer);
    //elementUpdate(consumer);

    var id = $.newguid();
    var lineviewdata = {};
    lineviewdata[$.pagemenu()]={
        order:$("svg[data-type='document']").lastentityindex(),                                
        direction:(params.issupplyreсeive?"f":"r")//f, r
    };
    $.storeset({
        id: id,
        sysid:params.sysid,
        datatype:"line",
        datatype2:"rectangle",
        function:"consumer",
        data:params.data,
        name:params.label,
        number:($.pagemenuname()=="business"?undefined:$.linegetnewnumber()),
        startel:consumer.id,
        startfn:params.consumerfunction,
        starttype:"element",
        endel:supply.id,
        endfn:params.supplyfunction,
        endtype:"element",
        intplatform:params.intplatform,
        interaction:params.interaction,
        issupplyreсeive:params.issupplyreсeive,
        viewdata:lineviewdata
    });

    autosize_list=autosize_list.concat(arrange_list);
    if(autosize_list.length>0){
        $(selected).removeClass("selected");
        $(autosize_list).each(function(i,id){
            $("#" + id).addClass("selected");
        });
        setAutosize({
            success:function(){
                $(autosize_list).each(function(i,id){
                    $("#" + id).removeClass("selected");
                });
                if(arrange_list.length>0){
                    $(arrange_list).each(function(i,id){
                        $("#" + id).addClass("selected");
                    });
                    setAutoposition({
                        success:function(){
                            $(arrange_list).each(function(i,id){
                                $("#" + id).removeClass("selected");
                            });
                            $(selected).addClass("selected");
                            $.historycloseputtransaction();
                        }
                    });
                }
                else{
                    $(selected).addClass("selected");
                    $.historycloseputtransaction();
                }
            }
        });
    }
    else
        $.historycloseputtransaction();
}

let addInterface = function(params){
    let selected = $.getfirstofselected();
    let el=$(selected).storeget();
    let consumer = (compareString(el.name,params.consumername)?el:undefined);
    let supply = (compareString(el.name,params.supplyname)?el:undefined);
    $.each($.storekeys(),function(i,id){
        var e = $.storeget(id);
        if(e.datatype=="element" && $.hasviewpageparam(e,$.pagemenu())){
            if(!consumer && compareString(e.name,params.consumername)) consumer=e;
            if(!supply && compareString(e.name,params.supplyname)) supply=e;
        }
    });
    let place=$("svg[datatype='document']");
    var x = getFloat($(selected).attr("x"));
    var y = getFloat($(selected).attr("y"));
    let arrange_list=[];
    let autosize_list=[];
    if(!supply){
        var viewdata = {};
        viewdata[$.pagemenu()]={
            order:$(place).lastentityindex(),                                    
            x: x,
            y: y
        };
        getSystem({
            id:params.supply,
            success:function(data){
                supply = $.extend(data,{
                    id: $.newguid(),
                    datatype:"element",
                    datatype3:"application",
                    viewdata:viewdata
                });
                getSystemMetricList({
                    systemid: data.sysid,
                    length: 1000000,
                    success: function (result) {
                        supply.metrics = result.map(a => ({ ...a }));
                    }
                });
            }
        });

        /*supply = {
            id: $.newguid(),
            sysid:params.supply,
            datatype:"element",
            name:params.supplyname,
            type:"Автоматизированная система",
            state:"new",
            datatype3:"application",
            viewdata:viewdata
        };*/
        arrange_list.push(supply.id);
    }

    if(!consumer){
        var viewdata = {};
        viewdata[$.pagemenu()]={
            order:$(place).lastentityindex(),                                    
            x: x,
            y: y
        };
        getSystem({
            id:params.consumer,
            success:function(data){
                consumer = $.extend(data,{
                    id: $.newguid(),
                    datatype:"element",
                    datatype3:"application",
                    viewdata:viewdata
                });
                getSystemMetricList({
                    systemid: data.sysid,
                    length: 1000000,
                    success: function (result) {
                        consumer.metrics = result.map(a => ({ ...a }));
                    }
                });
            }
        });
        /*consumer = {
            id: $.newguid(),
            sysid:params.consumer,
            datatype:"element",
            name:params.consumername,
            type:"Автоматизированная система",
            state:"new",
            datatype3:"application",
            viewdata:viewdata
        };*/
        arrange_list.push(consumer.id);
    }

    if(params.consumerfunctionname!=""){
        if(!consumer.functions) consumer.functions=[];
        if(!consumer.functions.find((item) => (compareString(params.consumerfunctionname,item.name)))){
            consumer.functions.push({
                id:params.consumerfunction,
                name:params.consumerfunctionname
            });
            if(!autosize_list.includes(consumer.id)) autosize_list.push(consumer.id);
        }
    }
    if(params.supplyfunctionname!=""){
        if(!supply.functions) supply.functions=[];
        if(!supply.functions.find((item) => (compareString(params.supplyfunctionname,item.name)))){
            supply.functions.push({
                id:params.supplyfunction,
                name:params.supplyfunctionname
            });
            if(!autosize_list.includes(supply.id)) autosize_list.push(supply.id);
        }
    }
    $.each(params.data,function(di,d){
        if(!params.issupplyreсeive){
            if(!supply.data) supply.data=[];
            if(!supply.data.find((item) => (compareString(d.name,item.name)))){
                supply.data.push($.extend(true,{},d));
                if(!autosize_list.includes(supply.id)) autosize_list.push(supply.id);
            }
        }
        else{
            if(!consumer.data) consumer.data=[];
            if(!consumer.data.find((item) => (compareString(d.name,item.name)))){
                consumer.data.push($.extend(true,{},d));
                if(!autosize_list.includes(consumer.id)) autosize_list.push(consumer.id);
            }
        }
    });

    $.storeset(supply);
    //elementUpdate(supply);

    $.storeset(consumer);
    //elementUpdate(consumer);

    var id = $.newguid();
    var lineviewdata = {};
    lineviewdata[$.pagemenu()]={
        order:$("svg[data-type='document']").lastentityindex(),                                
        direction:(params.issupplyreсeive?"f":"r")//f, r
    };
    $.storeset({
        id: id,
        sysid:params.sysid,
        datatype:"line",
        datatype2:"rectangle",
        function:"consumer",
        data:params.data,
        name:params.label,
        number:($.pagemenuname()=="business"?undefined:$.linegetnewnumber()),
        startel:consumer.id,
        startfn:params.consumerfunction,
        starttype:"element",
        endel:supply.id,
        endfn:params.supplyfunction,
        endtype:"element",
        intplatform:params.intplatform,
        interaction:params.interaction,
        issupplyreсeive:params.issupplyreсeive,
        viewdata:lineviewdata
    });

    autosize_list=autosize_list.concat(arrange_list);
    if(autosize_list.length>0){
        $(selected).removeClass("selected");
        $(autosize_list).each(function(i,id){
            $("#" + id).addClass("selected");
        });
        setAutosize({
            success:function(){
                $(autosize_list).each(function(i,id){
                    $("#" + id).removeClass("selected");
                });
                if(arrange_list.length>0){
                    $(arrange_list).each(function(i,id){
                        $("#" + id).addClass("selected");
                    });
                    setAutoposition({
                        success:function(){
                            $(arrange_list).each(function(i,id){
                                $("#" + id).removeClass("selected");
                            });
                            $(selected).addClass("selected");
                            $.historycloseputtransaction();
                        }
                    });
                }
                else{
                    $(selected).addClass("selected");
                    $.historycloseputtransaction();
                }
            }
        });
    }
    else
        $.historycloseputtransaction();
}

let deleteInterface = function(params){
    let selected = $.getfirstofselected();
    let el=$(selected).storeget();
    let consumer = (compareString(el.name,params.consumername)?el:undefined);
    let supply = (compareString(el.name,params.supplyname)?el:undefined);
    $.each($.storekeys(),function(i,id){
        var e = $.storeget(id);
        if(e.datatype=="element" && $.hasviewpageparam(e,$.pagemenu())){
            if(!consumer && compareString(e.name,params.consumername)) consumer=e;
            if(!supply && compareString(e.name,params.supplyname)) supply=e;
        }
    });
    if(consumer && supply){
        let data=[];
        if(params.data) data=params.data.map((item)=>item.name);
        $.each($.storekeys(),function(i,id){
            var e = $.storeget(id);
            if(e.datatype=="line" && $.hasviewpageparam(e,$.pagemenu())){
                var lineconsumer = undefined;
                var linesupply = undefined;
                if(e.function=="consumer"){
                    lineconsumer = e.startel;
                    linesupply = e.endel;
                }
                else{
                    linesupply = e.startel;
                    lineconsumer = e.endel;
                }
                if(lineconsumer && linesupply && consumer.id==lineconsumer && supply.id==linesupply){
                    let edata=[];
                    var pv = $.getviewpageparam(e);
                    if(e.data) edata=e.data.map((item)=>item.name);
                    if(pv.direction==(params.issupplyreсeive?"f":"r") && compareString(data.join(','),edata.join(','))){
                        deleteondocument(
                            $("#"+id),
                            {
                                success:function(){
                                    $(selected).addClass("selected");
                                }
                            }
                        );
                    }
                }
            }
        });
    }
}

$.fn.propertyMouseMove=function(event){
   var delta=10;
    var container=this;
    var offset=$(this).offset();
    var offsetX = event.clientX - offset.left;
    if(offsetX<delta) propertyFn="ew-resize";
    else propertyFn="default";
    $(container).css({cursor:propertyFn});
}
$.propertymodify=function(){
    if(!$.ispropertyshown())
        $.propertyshow();
    else
        $.propertyhide();
}
$.propertyshow=function(){
    if(!$.ispropertyshown()){
        $(propertyPage).css("width",$(propertyPage).attr("data-width"));
        $(propertyPage).addClass("open");
    }
    $.propertyset();
}
$.propertyhide=function(){
    $(propertyPage).removeClass("open");
    $(propertyPage).find("div.propertyHolder").hide();
    $(propertyPage).css("width",clientClosedWidth);
}
$.ispropertyshown = function(){
    return($(propertyPage).hasClass("open"));
}
$.propertysmartshow = function(){
    if($.ispropertyshown()){
        if($.getselected().length==1)
            $.propertyshow();
        else
            $.propertyhide();
    }
}
$.fn.dictionary = function(options){
    var component = this;
    $.widget("my.dictionaryAutocomplete", $.ui.autocomplete, {
        _renderItem: function( ul, item ) {
            return $( "<li>",{
                class:"ui-menu-item",
                title:(item.description?item.description:"")
                })
              .append($("<div>",{
                  class:"ui-menu-item-wrapper"
              }).append(item.label))
              .appendTo(ul);
        }
    });
    $(component).dictionaryAutocomplete({
        source: function (d, f) {
            if(options.data){
                var result=[];
                $.each(options.data,function(i,e){
                    if(result.length<50 && e.name && e.name.toLowerCase().indexOf(d.term.toLowerCase())!=-1)
                        result.push(e);
                });
                if (typeof f == "function") f(result);
            }
            else{
                getDictionaryItems({
                    name:options.name,
                    queryselector:options.queryselector,
                    term:d.term.toLowerCase(),
                    length:options.length==undefined?50:options.length,
                    fields:options.fields,
                    success:function(result){
                        if (typeof f == "function") f(result);
                    }
                });
            }
        },
        minLength: 0,
        delay: 100,
        autoFocus: false,
        select: function (event, ui) {
            $(this).val(ui.item.value);
            $(this).attr("data-id",ui.item.id);
            if(!options.noupdate){
                $.propertyapply();
                $.propertyset();
            }
            if(typeof options.action == "function") {options.action(ui.item);}
        }
    });
    $(component).click(function (event) {
        $(component).dictionaryAutocomplete("search");
    });
    $(component).on("change",function (event) {
        if(!options.noupdate){
            $.propertyapply();
            $.propertyset();
        }
        if(typeof options.action == "function") options.action();
    });
}
$.fn.valuedictionary = function(options){
    let place = this;
    $(place).autocomplete({
        source: options.source,
        minLength: 0,
        delay: 100,
        autoFocus: false
    });
    $(place).click(function (event) {
        $(place).autocomplete("search");
    });
} 

$.fn.logicdictionary = function(options){
    let place = this;
    $(place).autocomplete({
        source: options.source,
        minLength: 0,
        delay: 100,
        autoFocus: false,
        select: function (event, ui) {
            var sl = $.getfirstofselected();
            if(sl){
                var params = $.extend($(sl).logicget(), ui.item);
                $.propertyset(params);
                $.storeset(params);
            }
        }
    });
    $(place).keyup(function (event) {
        if(event.keyCode!=13)
            $(place).removeAttr("data-sysid");
    });
    $(place).click(function (event) {
        $(place).autocomplete("search");
    });
    $(place).change(function (event) {
        var sl = $.getfirstofselected();
        if(sl){
            let p={};
            if(options?.fields){
                for(let key of Object.keys(options.fields)){
                    p[key]=$("#"+options.fields[key]).val();
                }
            }
            var params = $.extend($(sl).logicget(), {
                sysid:getValue($(place).attr("data-sysid")),
                name:$(place).val()
            },p);
            $.propertyset(params);
            $.storeset(params);
        }
    });
} 

$.linedatarmodify = function(){
    if(!$.islinedatarshown())
        $.linedatarshow();
    else
        $.linedatarhide();
}
$.linedatarshow=function(){
    if(!$.islinedatarshown()){
        $("#datar").show();
        $("div.datar").addClass("open");
    }
    //$.outputset();
}
$.linedatarhide=function(){
    $("div.datar").removeClass("open");
    $("#datar").hide();
}
$.islinedatarshown = function(){
    return($("div.datar").hasClass("open"));
}
var isgridshown=($.cookie('at_gridshown')=="true");
$.gridshow=function(show){
    if(show==undefined || show){
        $("#gridRec").show();
        $("#switchgrid").css({"opacity":"1"});
        $.cookie('at_gridshown', "true", {path: "/", expires:100});
    }
    else{
        $("#gridRec").hide();
        $("#switchgrid").css({"opacity":"0.25"});
        $.cookie('at_gridshown', "false", {path: "/", expires:100});
    }
}
