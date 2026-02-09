var API_HOST = "api";
let adapterType="api";

$.storelist = function(options){
    $("#wait").show();
    $.ajax({
        url: API_HOST + "/document/list",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            search: options.search,
            type: options.type,
            state: options.state,
            length:options.length
        }),
        success: function (data) {
            $("#wait").hide();
            /*var d=[];
            $.each(data,function(i,e){
                if(e.id==45)
                    d.push(e);
            });*/
            if (options && typeof options.success == "function") options.success(data.map(item=>{return $.extend(item,
                {
                    sysid:item.id,
                    lastModify:dateToString(new Date(item.date))
                }
            )}));
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
let getPublishedDocumentList= function(options){
    $.ajax({
        async:false,
        url: API_HOST + "/document/list",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            search: options.search,
            type: options.type,
            state: options.state,
            length:options.length
        }),
        success: function (data) {
            if (options && typeof options.success == "function") options.success(data.map(item=>{return $.extend(item,
                {
                    sysid:item.id,
                    lastModify:dateToString(new Date(item.date))
                }
            )}));
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}

$.storesave = function(options){
    var list=[];
    var docProps = $.documentget();
    let user = $.isnull($.currentuser().login,"");
    var tags = [];
    if (user !== docProps.login) {
        $("#wait").hide();
        if (!canOperate()) {
            alert('Вы не можете перезаписать данный документ!\nСохраните его с новым именем.');
            return;
        }
        else if (confirm("Перезаписать чужой документ?")) {
            user = $.isnull( docProps.login,"");
        }
        else
            return;
    };
    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        if (param.sysid && getInt(param.sysid) != 0)
            tags  = tags.concat(getTags(param));
        list.push($.storegetstr(id));
    });
    $("#wait").show();
    $.ajax({
        url: API_HOST + "/document",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            doc: {
                id: getInt(docProps.sysid),
                name: $.isnull(docProps.name, "Новый документ"),
                typeid: $.isnull(docProps.typeid, ""),
                project: $.isnull(docProps.project, ""),
                description: $.isnull(docProps.description, ""),
                author: $.isnull(docProps.author, ""),
                version: $.isnull(docProps.version, ""),
                login: user,
                stateid: getInt(docProps.stateid),
                view:$.pagemenu()
            },
            tags: tags,
            list : list
        }),
        success: function (id) {
            $("#wait").hide();
            if(id){
                docProps.sysid=id;
                $("svg[data-type='document']").documentset(docProps);
                storedirectlyset(docProps.id,docProps,false);
                clearupdates();
        }
            else
                console.error("Bad id",id);
            if (options && typeof options.success == "function") options.success(id);
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
var getTags = function (param) {
    let type = param.datatype;
    switch(param.datatype){
        case "element":
            type="system";
            break;
        case "line":
            type="interface";
            break;
        case "zone":
            type="netzone";
            break;
    }
    var tags = [{
        type: type,
        id: getInt(param.sysid),
        name: param.name
    }];

    switch (param.datatype) {
        case "element":
            // система
            //tags += "#s:" + param.sysid + "#s:" + param.name + "#";
            // функции
            $.each(param.functions, function (i, e) {
                //tags += "#f:" + e.id + "#f:" + e.name + "#";
                if (isInt(e.id)) {
                    tags.push({
                        type: "function",
                        id: getInt(e.id),
                        name: e.name
                    });
                }
            });
            // сущности
            $.each(param.data, function (i, e) {
                //tags += "#d:" + e.id + "#d:" + e.name + "#";
                if (isInt(e.id)) {
                    tags.push({
                        type: "data",
                        id: getInt(e.id),
                        name: e.name
                    });
                }
            });
            break;
        case "line":
            // интерфейс
            //tags += "#i:" + param.sysid + "#i:" + param.name + "#";
            if (param.supplyfunction && isInt(param.supplyfunction.id)) {
                //tags += "#f:" + e.id + "#f:" + e.name + "#";
                tags.push({
                    type: "function",
                    id: getInt(param.supplyfunction.id),
                    name: param.supplyfunction.name
                });
            }
            if (param.consumerfunction && isInt(param.consumerfunction.id)) {
                //tags += "#f:" + e.id + "#f:" + e.name + "#";
                tags.push({
                    type: "function",
                    id: getInt(param.consumerfunction.id),
                    name: param.consumerfunction.name
                });
            }
            // сущности
            $.each(param.data, function (i, e) {
                //tags += "#d:" + e.id + "#d:" + e.name + "#";
                if (isInt(e.id)) {
                    tags.push({
                        type: "data",
                        id: getInt(e.id),
                        name: e.name
                    });
                }
            });
            break;
            /*
        case "zone":
            // зона
            //tags += "#z:" + param.sysid + "#z:" + param.name + "#";
            tags.push({
                type: param.datatype,
                id: param.sysid,
                name: param.name
            });
            break;*/
    }
    return tags;
}

$.getschemaname = function(options){
    $("#wait").show();
    $.ajax({
        url: API_HOST + "/document/getschemaname",
        type: 'GET',
        async: options && options.async != undefined ? options.async : true,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id: options.id,
            type: options.type
        }),
        success: function (name) {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success(name);
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
$.getschema = function (options) {
    $("#wait").show();
    $.ajax({
        url: API_HOST + "/document/getschema",
        type: 'GET',
        async: options.async != undefined ? options.async : true,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id: options.id,
            type: options.type
        }),
        success: function (data) {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success(data);
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
$.saveschema = function(options){
    if(options.file.size>10000000){
        console.log("Максимальный размер загружаемого файла - 10 мб");
        if (options && typeof options.error == "function") options.error("Максимальный размер загружаемого файла - 10 мб");
        return false;
    }
    $("#wait").show();
    var formData = new FormData();
    formData.append("id", options.id);
    formData.append("type", $.pagemenu());
    formData.append("schema", options.file);
    $.ajax({
        url: API_HOST + "/document/saveschema",
        type: 'POST',
        contentType: false,
        processData: false,
        data: formData,
        success: function () {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success();
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
$.clearschema = function(options){
    if (options.type == "business" || options.type == "function") {
        $("#wait").show();
        $.ajax({
            url: API_HOST + "/document/clearschema",
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(options),
            success: function () {
                $("#wait").hide();
                if (options && typeof options.success == "function") options.success();
            },
            error: function (message) {
                $("#wait").hide();
                console.error(message);
                if (options && typeof options.error == "function") options.error(message);
            }
        });
    }
}

$.storeGetAllAttachment = function (options) {
    if (typeof options.success == "function") options.success([]);
}
$.getdocument = function(options){
    $("#wait").show();
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + "/document",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id: options.id
        }),
        success: function (data) {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success(data);
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
$.storeopen = function(options){
    $.getdocument({
        id:options.id,
        success: function(document){
            var doc = $.extend({},document,{data:[]})
            $.each(document.data,function(i,e){
                doc.data.push(JSON.parse(e));
            });
            clearupdates();
            if (options && typeof options.success == "function") options.success(doc);
        },
        error: function (message) {
            if (options && typeof options.error == "function") options.error(message);
        }

    });
}
$.storemerge = function(options){
    $.outputclear();

    /*if (options.otar)
        options.file = await copyotardoc(options);*/

    options.data = zonesave(options);
    if (!$.outputcontent("error")) options.data = systemsave(options);
    if (!$.outputcontent("error")) options.data = interfacesave(options);
    if (!$.outputcontent("error")) {
        /*$.storesave({
            gpbu: document.userInfo.gpbu            
        });*/
        $.propertyset();
        $.addcheckcontentresult({ text: "Объединение успешно завершено", view: "interface", type: "note" });
        $.outputrender();
        if (options && typeof options.success == "function") options.success(options.data);
    }
    else {
        $.addcheckcontentresult({ text: "Объединение завершено c ошибками", view: "interface", type: "error" });
        $.outputrender();
        if (options && typeof options.error == "function") options.error();
    }
}
function interfacesave(options){
    $.each(options.data, function (i, e) {
        if (e.datatype == "line" && e.starttype == "element" && e.endtype == "element" && e.datatype3!="dashline" && e.checked) {
            var view = $.hasviewpageparam(e, "interface") ? "interface" : ($.hasviewpageparam(e, "system") ? "system" : undefined);
            if (!e.consumer.sysid || getInt(e.consumer.sysid) == 0)
                $.addcheckcontentresult({ text: "Ошибка сохранения потока" + (!$.isempty(e.number) ? " №" + e.number : "") + " '" + e.name + "' - потребитель не был сохранен на Портале", view: view, target: e.datatype, id: e.id, type: "error" });
            else if (!e.supply.sysid || getInt(e.supply.sysid) == 0)
                $.addcheckcontentresult({ text: "Ошибка сохранения потока" + (!$.isempty(e.number) ? " №" + e.number : "") + " '" + e.name + "' - поставщик не был сохранен на Портале", view: view, target: e.datatype, id: e.id, type: "error" });
            else if (!isInt(e.supplyfunction.id))
                $.addcheckcontentresult({ text: "Ошибка сохранения потока" + (!$.isempty(e.number) ? " №" + e.number : "") + " '" + e.name + "' - функция поставщика не была сохранена на Портале", view: view, target: e.datatype, id: e.id, type: "error" });
            else {
                var hasfakedatais = false;
                if (e.data) {
                    $.each(e.data, function (di, dt) {
                        hasfakedatais |= !isInt(dt.id);
                    });
                }
                if (hasfakedatais) {
                    $.addcheckcontentresult({ text: "Проверьте передаваемые данные потока" + (!$.isempty(e.number) ? " №" + e.number : ""), view: view, target: param.datatype, id: param.id, type: "error" });
                }
                else {
                    $.ajax({
                        async: false,
                        url: API_HOST + '/interface',
                        type: 'PUT',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify({
                            id: getInt(e.sysid),
                            name: e.name,
                            consumerid: e.consumer.sysid,
                            supplyid: e.supply.sysid,
                            /*connectioninitiatorid: initiator,
                            connectionterminatorid: terminator,*/
                            consumerfunctionid: (e.consumerfunction ? getInt(e.consumerfunction.id) : 0),
                            supplyfunctionid: (e.supplyfunction ? getInt(e.supplyfunction.id) : 0),
                            interaction: e.interaction,
                            interactionplatform: e.intplatform,
                            consumerint: e.consumerint,
                            supplyint: e.supplyint,
                            consumermethod: e.consumermethod,
                            state: e.state,
                            docref: e.docref,
                            data: e.data
                        }),
                        success: function (entity) {
                            if (!entity) {
                                console.error("Ошибка сохранения потока", e);
                                $.addcheckcontentresult({ text: "Ошибка сохранения потока" + (!$.isempty(e.number) ? " №" + e.number : "") + " '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                            }
                            else {
                                if (!e.sysid || getInt(e.sysid) == 0) { // новая
                                    e.sysid = entity.id;
                                    e.need2update = true;
                                }
                                $.addcheckcontentresult({ text: "Поток" + (!$.isempty(e.number) ? " №" + e.number : "") + " '" + e.name + "' успешно сохранен", view: view, target: e.datatype, id: e.id, type: "note" });
                            }
                        },
                        error: function (message) {
                            console.error(message, e);
                            $.addcheckcontentresult({ text: "Ошибка сохранения потока" + (!$.isempty(e.number) ? " №" + e.number : "") + " '" + e.name + "'. " + message, view: view, target: e.datatype, id: e.id, type: "error" });
                        }
                    });
                }
                if (e.need2update) {
                    delete e.need2update;
                    $.storeset(e);
                }
                if ($.outputcontent("error")) return false;
            }
        }
    });
    return options.data;

}
function systemsave(options) {
    $.each(options.data.filter(item => item.datatype == "element").sort(function (a, b) {
        if ($.isempty(a.parentid)) return -1;
        if ($.isempty(b.parentid)) return 1;
        return 0;
    }), function (i, e) {
        if (e.checked) {
            var view = $.hasviewpageparam(e, "interface") ? "interface" : ($.hasviewpageparam(e, "system") ? "system" : undefined);
            let entity = $.extend({}, e, {
                id: getInt(e.sysid),
                functions: [],
                data: [],
                components: []
            });
            delete entity.viewdata;
            if (e.functions) {
                $.each(e.functions.filter(item => item.checked), function (i1, e1) {
                    entity.functions.push($.extend({},e1,{
                        extid : e1.id.toString(),
                        id : (isInt(e1.id) ? getInt(e1.id) : 0)
                    }));
                });
            }
            if (entity.data) {
                $.each(e.data.filter(item => item.checked), function (i1, e1) {
                    entity.data.push($.extend({}, e1, {
                        extid: e1.id.toString(),
                        id: (isInt(e1.id) ? getInt(e1.id) : 0)
                    }));
                });
            }
            if (e.components && e.components.length > 0 && e.components[0].checked) {
                $.each(e.components[0].data, function (i1, e1) {
                    if(e1.type!="template"){
                        entity.components.push($.extend({}, e1, {
                            extid: e1.id.toString(),
                            id: (isInt(e1.id) ? getInt(e1.id) : 0)
                        }));
                    }
                });
            }
            $.each(entity.metrics, function (i1, e1) {
                e1.requared = (e1.requared == "true");
            });
            $.ajax({
                async: false,
                url: API_HOST + '/system',
                type: 'PUT',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify(entity),
                success: function (entity) {
                    if (!entity) {
                        console.error("Ошибка сохранения системы", e);
                        $.addcheckcontentresult({ text: "Ошибка сохранения системы '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                        return false;
                    }
                    else {
                        if (!e.sysid || getInt(e.sysid) == 0) // новая
                            e.sysid = entity.id;

                        e.functions = e.functions.map(item => {
                            let e1 = entity.functions.find(it => (it.id.toString() != it.extid && item.id.toString() == it.extid))
                            if (e1) item.id = e1.id;
                            item.spid = getInt(item.id);
                            return item;
                        });
                        e.data = e.data.map(item => {
                            let e1 = entity.data.find(it => (it.id.toString() != it.extid && item.id.toString() == it.extid))
                            if (e1) item.id = e1.id;
                            item.spid = getInt(item.id);
                            return item;
                        });

                        if (e.components && e.components.length > 0) { 
                            e.components[0].calcState = "exist";
                            $.each(e.components[0].data, function (i1, e1) {
                                let comp = entity.components.find(it => (e1.type == it.type))
                                if (comp) {
                                    e1.id = comp.id;
                                    e1.state = comp.state;
                                }
                                e.components[0].calcState = (!isInt(e1.id) ? "new" : e.components[0].calcState);// $.logicStateMapping(e.components[0].calcState, e1.state);
                            });
                        }
                        e.need2update = true;
                        $.each(options.data, function (i1, e1) {
                            if (e1.datatype == "line") {
                                if (e1.consumer && e1.consumer.id == e.id) {
                                    e1.consumer.sysid = e.sysid;
                                    e1.need2update = true;
                                }
                                if (e1.supply && e1.supply.id == e.id) {
                                    e1.supply.sysid = e.sysid;
                                    e1.need2update = true;
                                }
                                $.each(e.functions, function (fi, fn) {
                                    if (fn.id != fn.extid) {
                                        if (e1.supplyfunction && e1.supplyfunction.id == fn.extid) {
                                            e1.endfn = fn.id;
                                            e1.need2update = true;
                                        }
                                        if (e1.endfn == fn.extid) {
                                            e1.endfn = fn.id;
                                            e1.need2update = true;
                                        }
                                    }
                                });
                            }
                            $.each(e.data, function (di, dt) {
                                if (dt.id != dt.extid && (e1.datatype == "line" || e1.datatype == "element" && e1.id != e.id) && e1.data) {
                                    $.each(e1.data, function (di1, dt1) {
                                        if (dt1.id == dt.extid || dt1.name.toLowerCase().trim() == dt.name.toLowerCase().trim()) {
                                            dt1.id = dt.id;
                                            e1.need2update = true;
                                        }
                                    });
                                }
                            });
                            if (e1.datatype == "element" && e1.id != e.id && e1.name.toLowerCase().trim() == e.name.toLowerCase().trim() && (!e1.sysid || getInt(e1.sysid) == 0)) {
                                e1.sysid = e.sysid;
                                e1.need2update = true;
                            }
                            // установка родителя
                            if (e1.datatype == "element" && e1.parentid == e.id) {
                                e1.parentid = e.sysid;
                                e1.need2update = true;
                            }
                            if (e1.need2update) {
                                delete e1.need2update;
                                $.storeset(e1);//для обновления формы на случай ошибки
                            }
                        });
                        $.addcheckcontentresult({ text: "Система '" + e.name + "' успешно сохранена", view: view, target: e.datatype, id: e.id, type: "note" });
                    }
                },
                error: function (message) {
                    console.error("Ошибка сохранения системы", e);
                    $.addcheckcontentresult({ text: "Ошибка сохранения системы '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                    return false;

                }
            });
        };
        if (e.need2update) {
            delete e.need2update;
            $.storeset(e);
        }
        if ($.outputcontent("error")) return false;
    });
    return options.data;
}
function zonesave(options){
    $.each(options.data, function (i, e) {
        if (e.datatype == "zone" && e.checked) {
            var view = $.hasviewpageparam(e, "interface") ? "interface" : ($.hasviewpageparam(e, "system") ? "system" : undefined);
            /*$.ajax({
                url: API_HOST + '/dictionary',
                type: 'PUT',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    id:getInt(e.sysid),
                    name: "Каталог сетевых сегментов",
                    value: e.name,
                    description: e.description,
                    entityid: 4,
                    color:e.color
                }),
                success: function (entity) {
                    if (!entity) {
                        console.error("Ошибка сохранения сетевого сегмента", e);
                        $.addcheckcontentresult({ text: "Ошибка сохранения сетевого сегмента '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                        return false;
                    }
                    else {
                        if (!e.sysid || getInt(e.sysid) == 0) { // новая
                            e.sysid = entity.id;
                            e.need2update = true;
                        }
                        $.addcheckcontentresult({ text: "Сетевой сегмент '" + e.name + "' успешно сохранен", view: view, target: e.datatype, id: e.id, type: "note" });
                    }
                },
                error: function (message) {
                    console.error(message, e);
                    $.addcheckcontentresult({ text: "Ошибка сохранения сетевого сегмента '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                    return false;
                }
            });*/
            $.ajax({
                async: false,
                url: API_HOST + '/netzone',
                type: 'PUT',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify($.extend({}, e, { id: getInt(e.sysid), typeid:2 })),
                success: function (entity) {
                    if (!entity) {
                        console.error("Ошибка сохранения сетевого сегмента", e);
                        $.addcheckcontentresult({ text: "Ошибка сохранения сетевого сегмента '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                        return false;
                    }
                    else {
                        if (!e.sysid || getInt(e.sysid) == 0) { // новая
                            e.sysid = entity.id;
                            e.need2update = true;
                        }
                        $.addcheckcontentresult({ text: "Сетевой сегмент '" + e.name + "' успешно сохранен", view: view, target: e.datatype, id: e.id, type: "note" });
                    }
                },
                error: function (message) {
                    console.error(message, e);
                    $.addcheckcontentresult({ text: "Ошибка сохранения сетевого сегмента '" + e.name + "'", view: view, target: e.datatype, id: e.id, type: "error" });
                    return false;
                }
            });
            if (e.need2update) {
                delete e.need2update;
                $.storeset(e);
            }
            if ($.outputcontent("error")) return false;
        }
    });
    return options.data;

}
$.storedelete  =function(options){
    $("#wait").show();
    $.ajax({
        url: API_HOST + "/document/" + options.id,
        type: 'DELETE',
        success: function () {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success();
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
        }
    });
}

var getSystem = function(options){
    var result = {};
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/system',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id : options.id
        }),
        success: function (e) {
            if(e){
                result={
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name,
                    type:e.type,
                    description:e.description,
                    /*appos:e.appos,
                    appenv:e.appenv,
                    dbos:e.dbos,
                    dbenv:e.dbenv,
                    dev:e.dev,*/
                    location:e.location,
                    /*critical: e.critical,
                    recovery: e.recovery,
                    mode: e.mode,
                    lifecycle: e.lifecycle,
                    certificate: e.certificate,
                    monitoring: e.monitoring,
                    users: e.users,
                    zoomlevel: e.zoomlevel,*/
                    state:e.state         
                };
            };
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemList = function(options){
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/system',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            name: options.name,
            term : options.term,
            length: options.length
        }),
        success: function (data) {
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name,
                    type:e.type,
                    description:e.description,
                    /*appos:e.appos,
                    appenv:e.appenv,
                    dbos:e.dbos,
                    dbenv:e.dbenv,
                    dev:e.dev,*/
                    location:e.location,
                    /*critical: e.critical,
                    recovery: e.recovery,
                    mode: e.mode,
                    lifecycle: e.lifecycle,
                    certificate: e.certificate,
                    monitoring: e.monitoring,
                    users: e.users,
                    zoomlevel: e.zoomlevel,*/
                    state:e.state         
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemFunctionList = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/function',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: options.systemid,
            name: options.name,
            term : options.term,
            length: options.length
        }),
        success: function (data) {
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    id:e.id.toString(),
                    name: e.name,
                    system:e.refid,
                    state:e.state,
                    connection:e.connection,
                    interaction:e.interaction,
                    type:"value"
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemDataList = function(options){
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/data',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: options.systemid,
            name: options.name,
            term : options.term,
            length: options.length
        }),
        success: function (data) {
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    id:e.id.toString(),
                    name: e.name,
                    system:e.refid,
                    typename:"data",
                    flowtype:e.flowtype,
                    state:e.state
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getZoneList = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/netzone',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            name: options.name,
            term : options.term,
            length: options.length, 
            id2:options.typeid
        }),
        success: function (data) {
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name,
                    color:e.color,
                    typeid:e.typeid,
                    description:e.description
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getInterface = function(options){
    var result = {};
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/interface',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            intid : options.id
        }),
        success: function (e) {
            if(e){
                result = {
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name,
                    consumer:e.consumerid,
                    supply:e.supplyid,
                    consumerfunction:e.consumerfunctionid,
                    supplyfunction:e.supplyfunctionid,
                    consumername:e.consumername,
                    supplyname:e.supplyname,
                    consumerdescription:e.consumerdescription,
                    supplydescription:e.supplydescription,
                    consumerfunctionname:e.consumerfunctionname,
                    supplyfunctionname:e.supplyfunctionname,
                    state:e.state,
                    interaction:e.interaction,
                    consumermethod:e.consumermethod,
                    consumerint:e.consumerint,
                    supplyint:e.supplyint,
                    docref:e.docref,
                    issupplyreсeive:e.issupplyreсeive,
                    data:e.data
                };
            };
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemByInterface = function (options) {
    //console.log(getInt(options.cid),getInt(options.sid));
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/system/i',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            intid: options.id
        }),
        success: function (data) {
            $.each(data, function (i, e) {
                result.push({
                    label: e.name,
                    value: e.name,
                    id: e.id,
                    name: e.name,
                    state: e.state,
                    functionstate: e.functionstate
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemComponentList = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/systemplatform/lista',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: getInt(options.systemid),
            IsRecursion: false,//!options.systemonly,
            length: options.length
        }),
        success: function (data) {
            $(data).sort(function (a, b) {
                return (getComponentWeight(a.type) < getComponentWeight(b.type) ? -1 : 1);
            }).each(function (i, e) {
                let e1={
                    id: e.id,
                    type: e.type,
                    typename: e.typename,
                    name:$.isnull(e.system,""),
                    value:e.value,
                    desc: e.description,
                    state: e.state,
                    sysid: e.systemid
                };
                var item=result.find(el =>el.id==e1.sysid);
                if(!item){
                    item={
                        id:e1.sysid,
                        state:e1.state,
                        //fullname:e1.fullname,
                        name:e1.name,
                        values:{},
                        data:[e1]
                    };
                    item.values[e1.type]={value:e1.value,desc:e1.desc,state:e1.state};
                    result.push(item);
                }
                else{
                    item.values[e1.type]={
                        value:splitNames(item.values[e1.type]?.value,e1.value),
                        desc:e1.desc,
                        state:$.logicStateMapping(item.values[e1.type]?.state,e1.state)
                    }
                    item.state=$.logicStateMapping(item.state,e1.state);
                    item.data.push(e1);
                }
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemMetricList = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/systemmetric',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: getInt(options.systemid),
            systemonly: options.systemonly,
            length: options.length
        }),
        success: function (data) {
            //console.log(data);
            $(data).each(function (i, e) {
                result.push({
                    name: e.name,
                    value: e.value,
                    alias: e.alias,
                    requared: e.requared
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}

var getSystemInterfaceList = function(options){
    //console.log(getInt(options.cid),getInt(options.sid));
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/interface',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: getInt(options.cid),
            id2: getInt(options.sid),
            term : options.term,
            length: options.length
        }),
        success: function (data) {
            //console.log(data);
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name,
                    consumer:e.consumerid,
                    supply:e.supplyid,
                    consumerfunction:e.consumefunctionrid,
                    supplyfunction:e.supplyfunctionid,
                    state:e.state,
                    interaction:e.interaction,
                    consumermethod:e.consumermethod,
                    consumerint:e.consumerint,
                    supplyint:e.supplyint,
                    issupplyreсeive:e.issupplyreсeive,
                    docref:e.docref
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemInterfaceListA = function(options){
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/interface/a',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            cid: options.cid,
            sid: options.sid,
            did: options.did
        }),
        success: function (data) {
            //console.log(data);
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name,
                    consumer:e.consumerid,
                    supply:e.supplyid,
                    consumerfunction:e.consumerfunctionid,
                    supplyfunction:e.supplyfunctionid,
                    consumername:e.consumername,
                    supplyname:e.supplyname,
                    consumerdescription:e.consumerdescription,
                    supplydescription:e.supplydescription,
                    consumerfunctionname:e.consumerfunctionname,
                    supplyfunctionname:e.supplyfunctionname,
                    state:e.state,
                    interaction:e.interaction,
                    intplatform:e.interactionplatform,
                    consumermethod:e.consumermethod,
                    consumerint:e.consumerint,
                    supplyint:e.supplyint,
                    docref:e.docref,
                    issupplyreсeive:e.issupplyreсeive,
                    data:e.data
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}

var getFunction = function(options){
    var result = {};
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/function',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id : options.id
        }),
        success: function (e) {
            if(e){
                result={
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name
                };
            };
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getFunctionList = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/function',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: options.id,
            name: options.name,
            term: options.term,
            length: options.length
        }),
        success: function (data) {
            $.each(data, function (i, e) {
                result.push({
                    label: e.name,
                    value: e.name,
                    id: e.id.toString(),
                    name: e.name,
                    system: e.refid,
                    typename: "function",
                    method: e.method,
                    state: e.state
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}

var getSystemByFunction = function(options){
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/system/f',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id : options.id
        }),
        success: function (data) {
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    id:e.id,
                    name: e.name,
                    state: e.state,
                    functionstate: e.functionstate
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getData = function (options) {
    var result = {};
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/data',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id : options.id
        }),
        success: function (e) {
            if(e){
                result={
                    label: e.name,
                    value: e.name,
                    sysid:e.id,
                    name: e.name
                };
            };
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getDataList = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/data',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: options.id,
            name: options.name,
            term: options.term,
            length: options.length
        }),
        success: function (data) {
            $.each(data, function (i, e) {
                result.push({
                    label: e.name,
                    value: e.name,
                    id: e.id.toString(),
                    name: e.name,
                    system: e.refid,
                    typename: "data",
                    flowtype: e.flowtype,
                    state: e.state
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
var getSystemByData = function (options) {
    var result = [];
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + '/system/d',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            id : options.id
        }),
        success: function (data) {
            $.each(data,function(i,e){
                result.push({
                    label: e.name,
                    value: e.name,
                    id:e.id,
                    name: e.name,
                    state: e.state,
                    datastate: e.datastate,
                    flowtype: e.flowtype
                });
            });
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
    return result;
}
/*var getDocumentListByTag = function (options) {
    $.ajax({
        async: options.async != undefined ? options.async : false,
        url: API_HOST + "/document/tag",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: $.param({
            tag: options.tag
        }),
        success: function (data) {
            if (options && typeof options.success == "function") options.success(data);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });

}*/

var getDictionaryItems = function (options) {
    var result = [];
    if(options.name=="Шаблон реализации"){
        getPublishedDocumentList({
            state:"template",
            search: options.term,
            length: options.length,
            success: function (data) {
                data = data.map(e=>({id:e.id,value:e.name + (e.version?" v" +e.version:""), label:e.name + (e.version?" v" +e.version:""),description:e.description}))
                if (options && typeof options.success == "function") options.success(data);
            },
            error: function (message) {
                console.error(message);
                if (options && typeof options.error == "function") options.error(message);
            }
        });
    }
    else{
        $.ajax({
            async: options.async != undefined ? options.async : false,
            url: API_HOST + '/dictionary',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                name: options.name,
                term : options.term,
                length: options.length
            }),
            success: function (data) {
                $.each(data,function(i,e){
                    result.push({
                        label: e.name,
                        value: e.name,
                        id:e.id,
                        name: e.name,
                        alias:e.alias,
                        description:e.description,
                        order:e.order,
                        color:e.color
                    });
                });
                if (options && typeof options.success == "function") options.success(result);
            },
            error: function (message) {
                console.error(message);
                if (options && typeof options.error == "function") options.error(message);
            }
        });
    }
    return result;
}

function getCurrentUser(options) {
    $.ajax({
        async: false,
        url: API_HOST + '/account',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
var getSPID = function (value) {
    if (value === undefined)
        return "";
    var i = value.toString().indexOf("#");
    if (i >= 0)
        value = value.toString().substr(0, i - 1);

    return (value.toString().replace(";", "").replace("#", ""));
}

var doctypelist;
$.doctypedictionary = function (options){
    if (!doctypelist) {
        doctypelist = [];
        $.ajax({
            async: options && options.async != undefined ? options.async : false,
            url: API_HOST + '/documenttype',
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                $.each(data, function (i, e) {
                    doctypelist.push({
                        typeid: e.id,
                        type: e.name,
                        shorttype: e.shortname,
                        typecode: e.code,
                        typedescription: e.description
                    });
                });
                if (options && typeof options.success == "function") options.success(doctypelist);
            },
            error: function (message) {
                console.error(message);
                if (options && typeof options.error == "function") options.error(message);
            }
        });
        /*doctypelist=[
            {stateid:"1",state:'Разработка',statecolor:'#d30202',ord:0,statecanedit:1,statenext:"2"}
        ];*/
    }
    return doctypelist;
}

var docstatelist;
$.docstatedictionary = function (options){
    if (!docstatelist) {
        docstatelist = [];
        $.ajax({
            async: options && options.async != undefined ? options.async : false,
            url: API_HOST + '/documentstate',
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                $.each(data, function (i, e) {
                    docstatelist.push({
                        stateid: e.id,
                        state: e.name,
                        statecolor: e.color,
                        ord: getInt(e.order),
                        statecanedit: e.canedit,
                        statenext: e.next
                    });
                });
                if (options && typeof options.success == "function") options.success(docstatelist);
            },
            error: function (message) {
                console.error(message);
                if (options && typeof options.error == "function") options.error(message);
            }
        });
        /*docstatelist=[
            {stateid:"1",state:'Разработка',statecolor:'#d30202',ord:0,statecanedit:1,statenext:"2"}
        ];*/
    }
    return docstatelist;
}
$.documentsavestate = function (options) {
    $("#wait").show();
    $.ajax({
        async: options && options.async != undefined ? options.async : true,
        url: API_HOST + "/document/savestate",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: getInt(options.id),
            stateid: getInt(options.stateid)
        }),
        success: function (id) {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success(id);
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
$.documentsetdeleted = function (options) {
    $("#wait").show();
    $.ajax({
        async: options && options.async != undefined ? options.async : true,
        url: API_HOST + "/document/setdeleted",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id: getInt(options.id),
            isdeleted: options.isdeleted
        }),
        success: function (id) {
            $("#wait").hide();
            if (options && typeof options.success == "function") options.success(id);
        },
        error: function (message) {
            $("#wait").hide();
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}
function getUserInfo(options) {
    $.ajax({
        async: false,
        url: API_HOST + '/account/login?login=' + options.login,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            if (options && typeof options.success == "function") options.success(result);
        },
        error: function (message) {
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });
}

var getPodDictionary = function (options) {
    var result = $.poddictionary();
    if (typeof options.success == "function") options.success(result);
}

function getEmptyPodForOutput(){
    return [];
}
