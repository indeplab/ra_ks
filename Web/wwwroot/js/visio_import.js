let visioreader = undefined;
let filelist = undefined;
let visioschemaList = [];
let currentImportPage = 'interface';

let importedOrder = 1;
const visioCircleRadius = 0.1385 * 2;

const visiopagemapper = {
    business: ["ФМП", "Функцион"],
    interface: ["ИА", "Информ"],
    system: ["АП", "Приложе", "Компонент"],
    function: ["ТА", "Техничес", "Развертыв"],
    security: ["ИБ", "Безопас"]
};
const visioshapemapper = {
    element: ["Информационная система"],
    function: ["Функция информационной системы"],
    systemSoft: ["Системное ПО"],
    dataStore: ["Хранилище данных"],
    data: ["Данные"],
    line: ["Интеграционный поток", "Взаимодействие с пользователем"], //"Динамическая соединительная линия"
    supply: ["Интерфейс/последовательность"],
    legend: ["КД - Легенда"],
    zone: ["Сетевой сегмент", "Сегмент сети"],
    picture: ["Пользователь"],
    comment: ["Описание", "КД - Фукнциональный процес "],
    application: ["Приложение"],
};

let userAssociatedShapes, ignoredShapes = {};


let visioopen = async function (blob) {
    await visioclose();
    try {
        visioreader = new zip.ZipReader(new zip.BlobReader(blob));
        filelist = await visioreader.getEntries();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
let visioclose = async function () {
    filelist = undefined;
    if (visioreader) {
        await visioreader.close();
    }
    visioreader = undefined;
}

$.fn.getNameMapping = function (name) {
    let mapper = $(this).get(0);
    let id = '';
    let n = name.toLowerCase().trim();
    for (let i of Object.keys(mapper)) {
        if (i === n)
            id = i;
        else {
            $.each(mapper[i], function (i1, s) {
                if (n.indexOf(s.toLowerCase()) != -1) {
                    id = i;
                    return id;
                }
            });
        }
        if (id != '') return id;
    }
    return id;
}

let getVisioFileByName = async function (name) {
    let text = '';
    if (filelist) {
        for (let i = 0; i < filelist.length; i++) {
            let e = filelist[i];
            if (e.filename === name) {
                text = await e.getData(
                    // writer
                    new zip.TextWriter(),
                    // options
                    {
                        onprogress: (index, max) => {
                            // onprogress callback
                        }
                    }
                );
            }
        }
    }
    return text;
}

$.fn.importfromvisio = async function (blob) {
    let canvas = this;
    ignoredShapes = {};
    createdocument(true);
    $.outputclear(["error","recomendation","warning","note"]);

    if (await visioopen(blob)) {
        $(canvas).importvisiostep(1);
        return true;
    }
    return false;
}

$.fn.importvisiostep = async function (step) {
    let canvas = this;
    let success = undefined;
    const visioDataHolder = $("#visiodataholder");

    switch (step) {
        case 1:
            visioDataHolder.empty();
            let text = await getVisioFileByName("visio/pages/pages.xml");
            let reltext = await getVisioFileByName("visio/pages/_rels/pages.xml.rels");
            let pages = $(text).find("Page");

            if (pages.length > 0) {
                $(pages).each(function (i, e) {
                    let pageid = $(e).attr("id");
                    let pagerel = $(reltext).find("Relationship[Id='" + $(e).find("rel").attr("r:id") + "']").attr("Target");
                    let select = $("<span>", {
                        style: "padding-left:15px"
                    });
                    let pageHeight =getFloat($($(e).find("PageSheet").find("Cell[N='PageHeight']").toArray().pop()).attr("V"))/visiozoom;
                    let pageWidth=getFloat($($(e).find("PageSheet").find("Cell[N='PageWidth']").toArray().pop()).attr("V"))/visiozoom;
                    let pageScale=getFloat($($(e).find("PageSheet").find("Cell[N='PageScale']").toArray().pop()).attr("V"));

                    $("div.left-menu-row.down a[data-type]:not([data-type='switch'])[schema-type='schema']").each(function (i1, e1) {
                        if($(e1).attr("data-type")=="interface" || $(e1).attr("data-type")=="system"){
                            let menuid = $(e1).attr("data-type");
                            if (menuid === "switch") {
                                menuid = $(e1).attr("id");
                            }

                            if (!getPageMenuName(menuid)) return;

                            select.append(
                                $("<input>", {
                                    id: pageid + '_' + menuid,
                                    "data-id": menuid,
                                    name: pageid,
                                    type: "radio",
                                    checked: $(visiopagemapper).getNameMapping($(e).attr("name")) === menuid
                                }),
                                $("<label>", {
                                    for: pageid + '_' + menuid,
                                    text: getPageMenuName(menuid),
                                    title: $(e1).attr("title")
                                }),
                            );
                        }
                    });

                    visioDataHolder.append(
                        $("<tr>").append(
                            $("<td>").append(
                                $("<input>", {
                                    id: pageid,
                                    "data-page": pagerel,
                                    "data-name": $(e).attr("name"),
                                    type: "checkbox",
                                    "data-pageheight":pageHeight,
                                    "data-pagewidth":pageWidth,
                                    "data-pagescale":pageScale
                                }),
                                $("<label>", {
                                    for: pageid,
                                    text: $(e).attr("name")
                                }),
                                select
                            )
                        )
                    );
                });

                success = function () {
                    $("#visioImportPopup").showDialog(false);
                    visioschemaList = [];
                    $("#visiodataholder td input[type='checkbox']:checked").each(function (i, e) {
                        let type = $(e).parent().find("input[type='radio']:checked");
                        if (type.length > 0) {
                            visioschemaList.push({
                                id: $(e).prop("id"),
                                name: $(e).attr("data-name"),
                                page: $(e).attr("data-page"),
                                type: $(type).attr("data-id"),
                                pageHeight:$(e).attr("data-pageheight"),
                                pageWidth:$(e).attr("data-pagewidth"),
                                pageScale:$(e).attr("data-pagescale")
                        });
                        }
                    });
                    if (visioschemaList.length > 0) {
                        $(canvas).importvisiostep(2);
                    } else {
                        $("#visioImportPopup").setError(["Выберите схему"]);
                        return (false);
                    }
                }
            }
            break;
        case 2:
            visioDataHolder.empty();
            if (visioschemaList.length > 0) {
                let shapeList = [];
                let masterGroup = [];

                let currentPage = visioschemaList.shift();

                currentImportPage = currentPage.type;

                //$.pagemenu('interface');
                const text = await getVisioFileByName("visio/pages/" + currentPage.page);

                const masters = await getVisioFileByName("visio/masters/masters.xml");

                let newmapping=[];

                $(text).children("Shapes").children("Shape").each(function (i, e) {
                    let master=undefined;
                    let id = $(e).attr("ID");
                    //if(id=="3584") debugger;
                    let masterid = $(e).attr("Master");

                    let name = $(e).attr("Name");
                    if (!name || name=="") {
                        if(!master)
                            master=$(masters).find("Master#"+masterid);
                        name = $(master).attr("Name");
                    }
                    if(name && name!="") 
                        name=name.split('.')[0];
                    let title = $(e).children("Text").text().trim().replaceAll('\n'," ");
                    title = title.split(' ').filter(item => item!="").join(' ');
                    //if(id=="827") debugger;

                    //if(title=="Кампания. Маркетинговая (ОИ) [Управлять рекламными кампаниями]") console.log(id);
                    
                    let idlist = [id];
                    let x, y, w = 0.1, h = 0.1, color, fillcolor, w1 = 0, h1 = 0; // 0.1 для фикса когда в Visio нет ширины или высоты

                    e.childNodes.forEach((node) => {
                        if (!$(node).attr('n')) return;
                        switch ($(node).attr('n')) {
                            case 'PinX':
                                x = Number($(node).attr('v'));
                                break;
                            case 'PinY':
                                y = Number($(node).attr('v'));
                                break;
                            case 'Height':
                                h = h1 = Number($(node).attr('v'));
                                break;
                            case 'Width':
                                w = w1 = Number($(node).attr('v'));
                                break;
                            case 'LineColor':
                                color = $(node).attr('v');
                                break;
                            case 'FillForegnd':
                                fillcolor = $(node).attr('v');
                                break;
                        }
                    });
                    if(w==0.1 || h==0.1){
                        if(!master)
                            master=$(masters).find("Master#"+masterid);
                        if(h==0.1)
                            h=getFloat($($(master).find("PageSheet").find("Cell[N='PageHeight']").toArray().pop()).attr("V"))
                        if(w==0.1)
                            w=getFloat($($(master).find("PageSheet").find("Cell[N='PageWidth']").toArray().pop()).attr("V"))
                    }

                    $(e).find("Shape").each(function (i1, e1) {
                        idlist.push($(e1).attr("ID"));
                    });

                    // Извлекаем дополнительную информацию для интерфейсов
                    let lineOptions = {
                        path: [],
                        iteraction: $($(e).find("Cell[N='EndArrow']").toArray().pop()).attr('v') === '12' ? 'Асинхронное' : 'Синхронное',
                        textPinX: Number($($(e).find("Cell[N='TxtPinX']").toArray().pop()).attr('v')),
                        textPinY: Number($($(e).find("Cell[N='TxtPinY']").toArray().pop()).attr('v')),
                        textWidth: Number($($(e).find("Cell[N='TxtWidth']").toArray().pop()).attr('v')),
                        textHeight: Number($($(e).find("Cell[N='TxtLocPinY']").toArray().pop()).attr('v')) * 2,
                        dashLine: $($(e).find("Cell[N='LinePattern']").toArray().pop()).attr('v') == '23',
                        begin: {
                            x: Number($($(e).find("Cell[N='BeginX']").toArray().pop()).attr('v')),
                            y: Number($($(e).find("Cell[N='BeginY']").toArray().pop()).attr('v')),
                            trigger: $($(e).find("Cell[N='BegTrigger']").toArray().pop()).attr('f'),
                        },
                        end: {
                            x: Number($($(e).find("Cell[N='EndX']").toArray().pop()).attr('v')),
                            y: Number($($(e).find("Cell[N='EndY']").toArray().pop()).attr('v')),
                            trigger: $($(e).find("Cell[N='EndTrigger']").toArray().pop()).attr('f'),
                        },
                        beginArrow: $($(e).find("Cell[N='BeginArrow']").toArray().pop()).attr('v'),
                        endArrow: $($(e).find("Cell[N='EndArrow']").toArray().pop()).attr('v'),
                    };

                    //if(id=="853") debugger;
                    $(e).find("Section[N='Geometry']").each(function (i1, e1) {
                        $(e1).children("Row").each(
                            function (i, row) {
                                const cells = $(row).find("Cell").map(function () {
                                    if (this.attributes) {
                                        return {[$(this).attr('n')]: Number($(this).attr('v'))};
                                    }
                                    ;
                                });
                                lineOptions.path.push({
                                    rowT: $(row).attr('T'),
                                    point: cells.toArray().reduce((result, val, key) => {
                                        return {...result, ...val}
                                    }, []),
                                })
                            });
                    });

                    shapeList.push({
                        id,
                        order:i,
                        name,
                        inneridlist: idlist,
                        masterid,
                        title,
                        x: x,
                        y: y,
                        w,
                        h,
                        w1,
                        h1,
                        color,
                        fillcolor,
                        lineOptions,
                    });
                    if(name){
                        let foundedkey;
                        Object.keys(visioshapemapper).map(key => {
                            if(visioshapemapper[key].includes(name)) foundedkey = key;
                        });
                        if(!foundedkey){
                            visioshapemapper[$.newguid()]=[name];
                            newmapping.push(name);
                        }
                    }
                });

                //console.log(visioshapemapper);
                masterGroup = Object.keys(visioshapemapper).map((value, index) => {
                    const nodes = shapeList.filter(el => visioshapemapper[value].includes(el.name));
                    return {
                        id: index,
                        type: value,
                        name: visioshapemapper[value],
                        title: nodes.map(el => el.title),
                        shapeId: nodes.map(el => el.id),
                    }
                });

                // Убираем добавленные руками некоррекнтые элементы-системы (приложения)
                const systemSoft = shapeList.filter(el => visioshapemapper.systemSoft.includes(el.name));
                if (systemSoft) {
                    let elements = shapeList.filter(el => visioshapemapper.element.includes(el.name)),
                        applications = {
                            id: masterGroup.findIndex(value => value.type === 'application'),
                            type: 'application',
                            name: visioshapemapper['application'],
                            title: [],
                            shapeId: [],
                        }
                    const elementApplications = findElementsInSystem(systemSoft, elements);

                    if (elementApplications.length) {
                        elements = elements.filter(element => elementApplications.filter(value => element.id === value.id).length == 0);
                        applications.shapeId = elementApplications.map(value => value.id);
                        applications.title = elementApplications.map(value => value.title);

                        // добавляем параметер elementId в данные элемента приложения
                        elementApplications.map(value => {
                            const shapeId = shapeList.findIndex(shape => shape.id === value.id);
                            shapeList[shapeId] = value;
                        })
                    }

                    // меняем системы на отчищенный от приложений список
                    const elementsMgId = masterGroup.findIndex(value => value.type === 'element');
                    masterGroup[elementsMgId] = {
                        ...masterGroup[elementsMgId],
                        title: elements.map(value => value.title),
                        shapeId: elements.map(value => value.id),
                    };

                    // сохраняем список приложений
                    masterGroup[applications.id] = applications;
                }

                let select = $("<select>", {style: "width:200px;background-color:transparent"}).append(
                    $("<option>", {text: '', value: ''}),
                    $("<option>", {text: "Система/ компонента", value: "element"}),
                    $("<option>", {text: "Функция системы", value: "function"}),
                    $("<option>", {text: "Данные системы", value: "data"}),
                    $("<option>", {text: "Системное ПО", value: "systemSoft"}),
                    $("<option>", {text: "Хранилище данных", value: "dataStore"}),
                    $("<option>", {text: "Поток/ интерфейс", value: "line"}),
                    $("<option>", {text: "Поставщик взаимодействия", value: "supply"}),
                    $("<option>", {text: "Легенда", value: "legend"}),
                    $("<option>", {text: "Сетевой сегмент", value: "zone"}),
                    $("<option>", {text: "Пользователь", value: "picture"}),
                    $("<option>", {text: "Описание", value: "comment"}),
                    $("<option>", {text: "Реализация компоненты", value: "application"})
                );

                visioDataHolder.append(
                    $("<thead>").append(
                        $("<tr>").append(
                            $("<th>", {text: "ID"}),
                            $("<th>", {text: "Фигура"}),
                            $("<th>", {text: "Наименования"}),
                            $("<th>", {text: "Тип фигуры"})
                        )
                    )
                );

                let tbody = $("<tbody>");
                $.each(masterGroup, function (i, e) {
                    if (!e.title.length) return;
                    let title = e.title.filter(item=>item.trim()!="");
                    let s = $(select).clone();
                    let name = e.name.join(", ");
                    $(tbody).append(
                        $("<tr>",newmapping.includes(name)?{style:"color:crimson"}:{}).append(
                            $("<td>", {text: e.id, "data-type": e.type, style: "text-align:center"}),
                            $("<td>", {text: name}),
                            $("<td>", {text: title.slice(0,10).join(', ') + (title.length>10?"...":"")}),
                            $("<td>").append(
                                $(s).val($(visioshapemapper).getNameMapping(name))
                            )
                        )
                    );
                });
                visioDataHolder.append(tbody);

                success = async function () {
                    $("#visioImportPopup").showDialog(false);
                    let userAssociation = [];

                    $("#visiodataholder tr").each((n, row) => {
                        const cols = $(row).find('td');
                        if (!$(cols[0]).text()) return;
                        let name= $(cols[0]).text();
                        let type = $(cols[0]).attr("data-type");
                        userAssociation[name] = $(cols[3]).find('select option:selected').val();
                        /*
                        // Извлекаем дополнительную информацию для интерфейсов
                        if (userAssociation[name]=="line") {
                            $.each(shapeList.filter(item=>visioshapemapper[type].includes(item.name)),function(i,sp){
                                let e = $(text).children("Shapes").children("Shape[id='" + sp.id + "']");
                                let lineOptions = {
                                    path: [],
                                    iteraction: $($(e).find("Cell[N='EndArrow']").toArray().pop()).attr('v') === '12' ? 'Асинхронное' : 'Синхронное',
                                    textPinX: Number($($(e).find("Cell[N='TxtPinX']").toArray().pop()).attr('v')),
                                    textPinY: Number($($(e).find("Cell[N='TxtPinY']").toArray().pop()).attr('v')),
                                    textWidth: Number($($(e).find("Cell[N='TxtWidth']").toArray().pop()).attr('v')),
                                    textHeight: Number($($(e).find("Cell[N='TxtLocPinY']").toArray().pop()).attr('v')) * 2,
                                    dashLine: $($(e).find("Cell[N='LinePattern']").toArray().pop()).attr('v') == '23',
                                    begin: {
                                        x: Number($($(e).find("Cell[N='BeginX']").toArray().pop()).attr('v')),
                                        y: Number($($(e).find("Cell[N='BeginY']").toArray().pop()).attr('v')),
                                        trigger: $($(e).find("Cell[N='BegTrigger']").toArray().pop()).attr('f'),
                                    },
                                    end: {
                                        x: Number($($(e).find("Cell[N='EndX']").toArray().pop()).attr('v')),
                                        y: Number($($(e).find("Cell[N='EndY']").toArray().pop()).attr('v')),
                                        trigger: $($(e).find("Cell[N='EndTrigger']").toArray().pop()).attr('f'),
                                    },
                                    beginArrow: $($(e).find("Cell[N='BeginArrow']").toArray().pop()).attr('v'),
                                    endArrow: $($(e).find("Cell[N='EndArrow']").toArray().pop()).attr('v'),
                                };

                                $(e).find("Section[N='Geometry']").each(function (i1, e1) {
                                    $(e1).children("Row").each(
                                        function (i, row) {
                                            const cells = $(row).find("Cell").map(function () {
                                                if (this.attributes) {
                                                    return {[$(this).attr('n')]: Number($(this).attr('v'))};
                                                }
                                                ;
                                            });
                                            lineOptions.path.push({
                                                rowT: $(row).attr('T'),
                                                point: cells.toArray().reduce((result, val, key) => {
                                                    return {...result, ...val}
                                                }, []),
                                            })
                                        });
                                });
                                sp.lineOptions=lineOptions;
                            });
                        }*/
                    });

                    $(canvas).processVisioPage(shapeList, masterGroup, userAssociation);

                    $("#visioImportPopup").showDialog(false);

                    $.pagemenu(currentImportPage);
                    let pagemenuname = getPageMenuName(currentImportPage);

                    $('#warningPopupBody').empty();
                    if (Object.keys(ignoredShapes).length) {

                        $('#warningPopupBody').append(
                            '<h3 style="color: red;margin-bottom: 1em;text-align: center;font-weight: bold;">' +
                            'При импорте были проигнорированны фигуры</h3>'
                        );

                        let thead=
                            $("<thead>").append(
                                $("<tr>").append(
                                    $("<th>", {text: "Тип фигуры"}),
                                    $("<th>", {text: "Наименования"}),
                                )
                            );

                        let tbody = $("<tbody>");
                        Object.keys(ignoredShapes).map(key => {
                            $(tbody).append(
                                $("<tr>").append(
                                    $("<td>", {text: (visioshapemapper[key]??key??"Не определен")}),
                                    $("<td>", {
                                        text: ignoredShapes[key].join(', ')
                                    }),
                                )
                            );
                            let figure = (visioshapemapper[key]??key??"Не определен");
                            $.each(ignoredShapes[key],function(i,e){
                                $.addcheckcontentresult({text: "На " + pagemenuname + " проигнорировано: " + figure +" '" + e + "'", view:currentImportPage, type:"warning"});
                            })
                        });
                        $.outputsetfilter(["warning"]);

                        $('#warningPopupBody').append(
                            $('<table>').append(
                                thead,
                                tbody
                            ));
                        $("#warningPopup").showDialog({
                            success:function(){
                                $("#warningPopup").showDialog(false);
                                if (visioschemaList.length) {
                                    $(canvas).importvisiostep(2);
                                } else {
                                    visioclose();
                                }
                            },
                            cancel: function(){
                                $("#warningPopup").showDialog(false);
                                visioclose();
                            }
                        });
                    }
                    else{
                        if (visioschemaList.length) {
                            $(canvas).importvisiostep(2);
                        } else {
                            visioclose();
                        }
                    }
                }
            }
            break;
    }

    if (success) {
        $("#visioImportPopup").showDialog({
            success: function(){
                $("#visioImportPopup").showDialog(false);
                $("#wait").show();
                setTimeout(()=>{
                    success();
                    $("#wait").hide();
                    },50);
                },
            cancel: function () {
                visioclose();
            }
        });
        return true;
    }
    return false;
}

/*
    Обработка страницы из Visio на основе выбранных типов
 */
$.fn.processVisioPage = async function (shapeList, masterGroup, userAssociation) {
    let canvas = this;
    $("#wait").show();

    userAssociatedShapes = userAssociation.reduce((result, value, key) => {
        const masterGroupElement = masterGroup.find(value => Number(value.id) === key)
        const shapes = shapeList.filter(shape => masterGroupElement.shapeId.includes(shape.id))

        result[value] = result[value] ? [...result[value], ...shapes] : [...shapes];

        return result;
    }, {});

    Object.keys(visioshapemapper).map(value => {
        if (!userAssociatedShapes[value]) userAssociatedShapes[value] = [];
    });

    //console.dir(userAssociatedShapes);

    userAssociatedShapes.picture = userAssociatedShapes.picture.map(picture => ({
        ...picture,
        elementId: addOnDiagram({...picture, datatype: 'picture'})
    }));
    userAssociatedShapes.legend = userAssociatedShapes.legend.map(legend => ({
        ...legend,
        elementId: addOnDiagram({...legend, datatype: 'legend'})
    }));
    userAssociatedShapes.zone = userAssociatedShapes.zone.map(zone => ({
        ...zone,
        elementId: addOnDiagram({...zone, datatype: 'zone'})
    }));
    userAssociatedShapes.comment = userAssociatedShapes.comment.map(comment => ({
        ...comment,
        elementId: addOnDiagram({...comment, datatype: 'comment'})
    }));

    prepareElementProps();
    userAssociatedShapes.element = userAssociatedShapes.element.map(element => ({
            ...element,
            elementId: processVisioElement(element),
        })
    );
    userAssociatedShapes.line = userAssociatedShapes.line.map((interface, id) => ({
        ...interface,
        elementId: processVisioInterfaces(interface, id, shapeList)
    }));

    // Обрабатываем сущности интерфейсов, передающие сущности других интерфейсов источника данных
    /*$.each(userAssociatedShapes.line,function(i,interface){
        let datasourceId = (interface.lineOptions.beginArrow ? interface.lineOptions.endEl?.element?.elementId : interface.lineOptions.startEl?.element?.elementId);
        if(datasourceId){
            let dataso
        }
    })*/

    $(canvas).svgfitcanvas();

    Object.keys(userAssociatedShapes).map(key => {
        const elements = userAssociatedShapes[key];
        elements.map(element => {
            if (!element.elementId) {
                //console.log(element);
                if(!visioshapemapper[key]) key=element.name;
                if (ignoredShapes[key]) {
                    ignoredShapes[key].push(element.title);
                } else {
                    ignoredShapes[key] = [element.title];
                }
            }
        })
    })

    $("#wait").hide();
}

function prepareElementProps() {
    let reversedElementsArray = [...userAssociatedShapes.element];
    reversedElementsArray.sort((a, b) => {
        if (parseInt(a.id) < parseInt(b.id)) {
            return 1;
        }
        if (parseInt(a.id) > parseInt(b.id)) {
            return -1;
        }
        return 0;
    });

    reversedElementsArray.map(element => {
        const {x, y, w, h, title, order, h1, w1} = element;
        let elementInfo = {
            order, x, y, w, h, w1, h1, title,
            name: title,
            label: title,
            value: title
        };

        processVisioFunctions(elementInfo);
        processVisioDatabases(elementInfo);
        processVisioDataStore(elementInfo);
    });
}

/*
Обработка элемента
*/
function processVisioElement(element = {}) {
    const {x, y, w, h, color, title, order, h1, w1} = element;

    let elementFunctions = [], elementDates = [], elementSystemSoft = [];
    let elementInfo = {
        order, x, y, w, h, w1, h1, title,
        name: title,
        label: title,
        value: title,
        state: getColorState(color),
        datatype: 'element',
        type: "Автоматизированная система",
        appname: '',
        dbname: "БД",
    };

    elementFunctions = processVisioFunctions(elementInfo);
    elementDates = processVisioDatabases(elementInfo);
    elementInfo = processVisioElementProps(elementInfo);

    let eid = addOnDiagram(elementInfo);

    if (elementFunctions?.length || elementDates?.length) {
        elementInfo = $.storeget(eid);
        elementInfo.functions = elementFunctions;
        elementInfo.data = elementDates;
        $.storeset(elementInfo, true);
    }

    return eid;
}

/*
Обработка функций элемента
*/
function processVisioFunctions(element = {}) {
    // создаем список функций для системы
    let elementFunctions = userAssociatedShapes.function.reduce((result, func, id) => {
        if ((!func.elementId || func.elementId === element.title) && isObjectIn(element, func, userAssociatedShapes?.element)) {
            result.push({
                id: $.newguid(),
                name: func.title,
                state: getColorState(func.color),
                statelist: "all",
                checked: true,
                visible: true
            });
            userAssociatedShapes.function[id].elementId = element.title;
        }
        return result;
    }, []);

    return elementFunctions;
}

/*
Обработка баз данных элемента
*/
function processVisioDatabases(element = {}) {
    // создаем список Db для системы
    let elementDatabases = userAssociatedShapes.data.reduce((result, data, id) => {
        if ((!data.elementId || data.elementId === element.title) && isObjectIn(element, data, userAssociatedShapes?.element)) {
            let part = data.title.split(/[()]/g).filter(item => { return item!=""});
            let securitytype;
            if(part.length>1){
                securitytype=$.securitytypedictionary().find(item=>{return item.value.toLowerCase()==part[part.length-1].toLowerCase().trim()});
                part = part.slice(0,part.length-1).map((item,index)=>(index>0?"("+item+")":item));
            }
            //console.log(part,securitytype?securitytype.value:"");
            //console.log(part);
            result.push({
                id: $.newguid(),
                name: part.join().trim(),
                flowtype:getColorFlow(data.fillcolor),
                securitytype:(securitytype?securitytype.value:""),
                state: getColorState(data.color)
            });
            userAssociatedShapes.data[id].elementId = element.title;
        }
        return result;
    }, []);
    return elementDatabases;
}

/*
Обработка хранилищь данных
*/
function processVisioDataStore(element = {}) {
    // Заполняем хранилище БД системы
    let elementStore;
    userAssociatedShapes.dataStore.find((store, id) => {
        if (isObjectIn(element, store, userAssociatedShapes?.element) && !store.elementId) {
            userAssociatedShapes.dataStore[id].elementId = element.title;
        }
    });
}

/*
Обработка системного ПО
 */
function processVisioElementProps(element = {}) {
    // Заполняем хранилище БД системы
    let elementStore;
    userAssociatedShapes.dataStore.find((store, id) => {
        if (store.elementId === element.title) {
            element.dbname = store.title;
            elementStore = store;
        }
    });

    // создаем список системного софта системы
    let elementSoft = userAssociatedShapes.systemSoft.reduce((result, soft, id) => {
        if (isObjectIn(element, soft, userAssociatedShapes?.element)) {
            // Анализируем есть ли в элементе что то из elementStore
            if (isObjectIn(soft, elementStore, userAssociatedShapes?.systemSoft) && !element.dbos) {
                [element.dbos, element.dbenv] = soft.title.split('/');

                userAssociatedShapes.systemSoft[id].elementId = element.title;
            } else if (!element.appos) { // Устанавливаем данные App
                let elementAppId = userAssociatedShapes.application.findIndex(application => application.systemId === soft.id);
                if (elementAppId >= 0) {
                    elementApp = userAssociatedShapes.application[elementAppId];
                    element.appname = elementApp?.title || '';
                    [element.appos, element.appenv] = soft.title.split('/');

                    userAssociatedShapes.systemSoft[id].elementId = element.title;
                    userAssociatedShapes.application[elementAppId].elementId = element.title;
                }
                result.push(soft);
            }
        }
        return result;
    }, []);

    return element;
}

/*
Обработка интерфейсов
*/
function processVisioInterfaces(interface = {}, interfaceOrderId, shapeList = []) {
    let {id, x, y, w, h, color, title, lineOptions} = interface;

    //if(interface.id!="423") return;
    function findInInnerIds(id, shapeList) {
        return shapeList.find(shape => shape.inneridlist.includes(id));
    }

    function findConnectedElements(interface, shapeList) {
        const connectedRegExp = /(?!x)[0-9]+/;
        const lineOptions = interface.lineOptions;
        let connectedElements = {
            begin: connectedRegExp.exec(lineOptions.begin.trigger),
            end: connectedRegExp.exec(lineOptions.end.trigger),
        }

        //if(interface.id=="3584") debugger;

        connectedElements = Object.keys(connectedElements).map(key => {
            let result = null, connectedElementId;
            

            if (connectedElements[key] && connectedElements[key][0] === interface.id)
                connectedElements[key] = undefined;

            if (!connectedElements[key]) { // Ищем элемент под точкой если нет назначенного в Visio
                // сначала кружок
                connectedElementId = findNearestElement(lineOptions[key], userAssociatedShapes.supply)?.id;
                if(!connectedElementId)
                    connectedElementId = findNearestElement(lineOptions[key], userAssociatedShapes.element)?.id;

                if (!connectedElementId) return result;
            } else {
                connectedElementId = connectedElements[key].pop();
            }

            let connectedNode = findInInnerIds(connectedElementId, shapeList);
            if(!visioshapemapper.element.includes(connectedNode.name) 
                && !visioshapemapper.supply.includes(connectedNode.name)
                && !visioshapemapper.picture.includes(connectedNode.name)
                ){
                // Элемент не найден. Ищем элемент под точкой если нет назначенного в Visio
                connectedElements[key] = undefined;
                connectedElementId = findNearestElement(lineOptions[key], userAssociatedShapes.element)?.id;

                if (!connectedElementId) return result;
                connectedNode = findInInnerIds(connectedElementId, shapeList);
            }

            if (connectedNode && visioshapemapper.element.includes(connectedNode.name)) { // Элемент
                result = {
                    element: userAssociatedShapes.element.find(element => element.id === connectedNode.id),
                    dot: null,
                    elementType: 'element',
                };
                if (result.element) {
                    result.dot = findElementSidePoint(lineOptions[key], result.element);
                }

            } else if (connectedNode && visioshapemapper.supply.includes(connectedNode.name)) { // Кружок
                //if(connectedNode.id=="852") debugger;
                result = {
                    supply: userAssociatedShapes.supply.find((element, id) => {
                        if (element.id === connectedNode.id) {
                            userAssociatedShapes.supply[id].elementId = interface.title || interface.id;
                            return true;
                        } else {
                            return false;
                        }
                    }),
                    dot: null,
                    element: null,
                    elementType: 'element',
                };

                result.direction = findSidePointDirection(interface.lineOptions, key);
                result.supply = applyDirectionToPoint(result.supply, result.direction);

                if (result.supply) {
                    result.element = findNearestElement(result.supply, userAssociatedShapes.element, result.direction);
                }

                if (result.element) {
                    result.dot = findElementSidePoint(lineOptions[key], result.element);
                }
            } else if (connectedNode && visioshapemapper.picture.includes(connectedNode.name)) { // Картинка
                result = {
                    picture: userAssociatedShapes.picture.find(shape => shape.id === connectedNode.id),
                    dot: null,
                    elementType: 'picture',
                };

                result.direction = findSidePointDirection(interface.lineOptions, key);

                if (result.picture) {
                    result.dot = findElementSidePoint(lineOptions[key], result.picture);
                }
            }

            return result;
        });

        return connectedElements;
    }

    function extractInterfaceAndDataProps(interface, supplyId, datasourceId) {
        let supplyint = '', consumerint = '', consumermethod = '', data = [], endfn;
        if (!interface.title) return {supplyint, consumerint, consumermethod, data};

        const pageMenu = currentImportPage;
        const titleParts = interface.title.match(/^(.*)\[(.*)\]/);

        if (pageMenu === 'system' && titleParts?.length > 1) {
            let [title, intStr, methodStr] = titleParts;
            supplyint = consumerint = intStr.trim();
            consumermethod = methodStr.trim();
        }

        //if(interface.id=="827") debugger;

        if (pageMenu === 'interface' && titleParts?.length > 1) {
            const [title, dataStr, fnNameStr] = titleParts;
            if(supplyId){
                let supply=$.storeget(supplyId);
                if(supply && supply.functions)
                    endfn = supply.functions.find(e => e.name.trim().toLowerCase()==fnNameStr.toLowerCase().trim());
            }
            data = dataStr.replaceAll(';',',').split(',').reduce((result, el) => {
                const parts = el.match(/^(.*)\((.*)\)/);
                if (parts && parts.length ===3) {
                    let res;
                    if(datasourceId){
                        let datasouce=$.storeget(datasourceId);
                        if(datasouce && datasouce.data)
                            res = datasouce.data.find(e => e.name.trim().toLowerCase()==parts[1].toLowerCase().trim());
                    }
                    result.push(res??{
                        id: $.newguid(),
                        name: parts[1].trim(),
                        securitytype: parts[2],
                        state: 'new'
                    });
                }
                return result;
            }, []);
        }

        return {supplyint, consumerint, consumermethod, data, endfn};
    }

    let [startEl, endEl] = findConnectedElements(interface, shapeList);
    let lineFunction = startEl?.supply ? 'supply' : 'consumer';
    lineOptions = fixLinePath(lineOptions, startEl, endEl);

    const {supplyint, consumerint, consumermethod, data, endfn} = extractInterfaceAndDataProps(
        interface,
        (lineFunction=="supply"?startEl?.element?.elementId:endEl?.element?.elementId),
        (interface.lineOptions.beginArrow ? endEl?.element?.elementId : startEl?.element?.elementId)
        );

    let lineInfo = {
        x, y, w, h,
        title,
        name: (endfn?.name??title),
        datatype: 'line',
        state: getColorState(color),
        // text: id,
        dashLine: lineOptions.datatype3=="dashline",
        interaction: lineOptions.interaction,
        function: lineFunction,
        startfn: '',
        endfn: endfn?.id,
        endfnname: endfn?.name,
        initel: '',
        supplyint,
        consumerint,
        consumermethod,
        data,
        intplatform: '',
        lineNumberPrefix: '',
        lineParentId: null,
        number: startEl?.supply ? startEl.supply.title : endEl?.supply ? endEl.supply.title : interfaceOrderId + 1,
        /*number: interfaceOrderId + 1,*/
        startel: startEl?.element ? startEl.element.elementId : startEl?.picture ? startEl.picture.elementId : '',
        starttype: startEl?.elementType,
        endel: endEl?.element ? endEl.element.elementId : endEl?.picture ? endEl.picture.elementId : '',
        endtype: endEl?.elementType,
        lineOptions: {
            ...lineOptions,
            startdx: startEl?.dot ? startEl.dot.x : '',
            startdy: startEl?.dot ? startEl.dot.y : '',
            enddx: endEl?.dot ? endEl.dot.x : '',
            enddy: endEl?.dot ? endEl.dot.y : '',
        },
        direction: interface.lineOptions.beginArrow ? 'r' : 'f',
    };
/*
    if (currentImportPage === 'interface') { // endfn + endfnname заполнить на основе title
        const titleParts = title.match(/\[(.+)\]/);

        if (titleParts && titleParts[1]) {
            const lineFuncName = titleParts[1];
            let elementId;

            lineInfo.name = lineInfo.name.replace(` [${lineFuncName}]`, '');

            if (lineFunction === 'supply') {
                elementId = userAssociatedShapes.element.find(element => element.elementId === lineInfo.startel)?.elementId;
                const elementFunc = $.storeget(elementId).functions?.find(func => func.name.toLowerCase().trim() == lineFuncName.toLowerCase().trim());

                if (elementFunc) {
                    lineInfo['endfn'] = elementFunc.id;
                    lineInfo['startfnname'] = lineFuncName;
                    lineInfo['name'] = lineInfo['title'] = lineInfo['title'].replace(`[${elementFunc.name}]`, '');
                }
            } else {
                elementId = userAssociatedShapes.element.find(element => element.elementId === lineInfo.endel)?.elementId;
                const elementFunc = $.storeget(elementId).functions?.find(func => func.name.toLowerCase().trim() == lineFuncName.toLowerCase().trim());

                if (elementFunc) {
                    lineInfo['startfn'] = elementFunc.id;
                    lineInfo['endfnname'] = lineFuncName;
                    lineInfo['name'] = lineInfo['title'] = lineInfo['title'].replace(`[${elementFunc.name}]`, '');
                }
            }
        }
    }
    */
    return addOnDiagram(lineInfo);
}

/*
Получение статуса на основе цвета
*/
function getColorState(color) {
    switch (color) {
        case "#3f3f3f":
            return "exist";
        case "#7030a0":
            return "change";
        case "#f59d56":
            return "external";
        case "#c00000":
        default:
            return "new";
    }
}
function getColorFlow(fillcolor){
    switch(fillcolor){
        case "#c0c2af":
            return "copy";
        default:
            return "master";
    }
}
/*
Добавление в диаграмму
*/
function addOnDiagram(options = {}) {

    // Ищем в Storage элемент, попавший под выборку, у которого нет информации в viewdata для текущей страницы.
    function findExistedInStorageByName(foundNode = {}) {
        let result;

        if (foundNode.length) {

            $.each(foundNode, (index, element) => {
                let tmp = $.storeget($(element).attr('id'));

                if (!result && tmp && tmp.viewdata && !isemptyobject(tmp.viewdata[currentImportPage])) {
                    result = {...tmp};
                }
            });
        }

        return result;
    }

    const pageMenu = currentImportPage;
    let {x, y, w, h, lineOptions, ...optionsOther} = options;
    let existedStorageRecord;

    let width = options.w * 100 || 0;
    let height = options.h * 100 || 0;
    let left = (x * 100 - width / 2) || 0;
    let top = (-options.y * 100 - height / 2) || 0;
    let id = $.newguid();
    let viewdata = {system: {}};

    switch (options.datatype) {
        case "element":
            existedStorageRecord = findExistedInStorageByName($("svg[data-type='element'] > text").filter(function() {
                return $(this).text().toLowerCase().trim() === options.title.toLowerCase().trim();
            }).parent());

            if (existedStorageRecord) {
                id = existedStorageRecord.id;
                viewdata = existedStorageRecord.viewdata;

                optionsOther = {...existedStorageRecord, ...optionsOther};
            }

            viewdata[pageMenu] = {
                order: importedOrder,
                left,
                top,
                width,
                height,
            };

            $.storeset({
                ...optionsOther,
                id,
                viewdata,
            });
            break;
        case "legend":
            existedStorageRecord = findExistedInStorageByName($("svg[data-type='legend']"));

            if (existedStorageRecord) {
                id = existedStorageRecord.id;
                viewdata = existedStorageRecord.viewdata;
            }

            viewdata[pageMenu] = {
                order: importedOrder,
                left,
                top,
                width,
                height,
            };
            $.storeset({
                id,
                datatype: options.datatype,
                name: "Легенда",
                viewdata,
            });

            break;
        case "zone":
            existedStorageRecord = findExistedInStorageByName($("svg[data-type='zone']:contains('" + options.title + "')"));

            if (existedStorageRecord) {
                id = existedStorageRecord.id;
                viewdata = existedStorageRecord.viewdata;
            }

            viewdata[pageMenu] = {
                order: importedOrder,
                left,
                top,
                width,
                height,
            };

            $.storeset({
                id,
                datatype: options.datatype,
                name: options.title,
                viewdata,
            });

            break;
        case "picture":
            viewdata[pageMenu] = {
                order: importedOrder,
                left,
                top,
                width,
                height,
            }

            $.storeset({
                id,
                datatype: options.datatype,
                name: options.title,
                src: options.title === 'Клиент' ? 'images/e-customer.png' : "images/e-user.png",
                viewdata
            });

            break;
        case "comment":
            const [name, description] = options.title.split(/\r?\n/);
            existedStorageRecord = findExistedInStorageByName($("svg[data-type='comment']:contains('" + name + "')"));

            viewdata[pageMenu] = {
                order: importedOrder,
                x: left,
                y: top,
                w: width,
                h: height,
            };
            $.storeset({
                datatype: options.datatype,
                id: $.newguid(),
                name, description,
                viewdata,
            });

            break;
        case "line":
            const startX = lineOptions.begin.x * 100,
                startY = -lineOptions.begin.y * 100;

            viewdata = {};
            viewdata[pageMenu] = {
                order: importedOrder,
                points: fixPathSmallerDelta(lineOptions.path).reduce(
                    (result, pointValue) => {
                        const pointX = pointValue.point.X !== undefined ? pointValue.point.X : 0;
                        const pointY = pointValue.point.Y !== undefined ? pointValue.point.Y : 0;

                        result.push((startX + pointX * 100) + ' ' + (startY - pointY * 100));

                        return result;
                    }, []).join(','),
                direction: optionsOther.direction,
                enddx: lineOptions.enddx,
                enddy: lineOptions.enddy,
                startdx: lineOptions.startdx,
                startdy: lineOptions.startdy,
                text: {
                    x: (lineOptions.textPinX + lineOptions.begin.x) * 100,
                    y: -(lineOptions.textPinY + lineOptions.begin.y) * 100,
                    width: lineOptions.textWidth * 100,
                    height: lineOptions.textHeight * 100,
                }
            };

            let lineJSON = {
                ...optionsOther,
                id,
                viewdata,
            };

            $.storeset(lineJSON, !!existedStorageRecord);

            break;
    }

    importedOrder++;

    return id;
}

/* 
Проверка на вхождение объекта по координатам
*/
function isObjectIn(objectOut = {}, objectIn = {}, typestore) {
    let d=0.0005;
    const Ox1 = objectOut?.x - objectOut?.w / 2, Oy1 = objectOut?.y + objectOut?.h / 2;
    const Ox2 = objectOut?.x + objectOut?.w / 2, Oy2 = objectOut?.y - objectOut?.h / 2;
    const Ix1 = objectIn?.x - objectIn?.w1 / 2, Iy1 = objectIn?.y + objectIn?.h1 / 2;
    const Ix2 = objectIn?.x + objectIn?.w1 / 2, Iy2 = objectIn?.y - objectIn?.h1 / 2;

        //if(objectOut?.title=="Адаптер канала ОКП (внешний)" && objectIn?.id=="1788") debugger;
        if(typestore && objectOut){
        // проверяем, нет ли объекта опр. типа посередине
        let result = typestore.reduce((hasObjectIn,item)=>{
            hasObjectIn |= getInt(objectOut?.order)<getInt(item.order) && getInt(item.order)<getInt(objectIn?.order) && isObjectIn(item,objectIn);
            return hasObjectIn;
        }, false);
        if(result) {
            return false;
        }
    }

    return (
        Ox1-d <= Ix1
        && Oy1+d >= Iy1
        && Ox2+d >= Ix2
        && Oy2-d <= Iy2
    )
}

/*
Поиск положения точки на стороне элемента
 */
function findElementSidePoint(point, element) {
    function findPointPosition(pointValue, startValue, endValue) {
        const L = endValue - startValue;
        const l = pointValue - startValue;
        if (L === 0) return 0;
        return Math.abs(l / L);
    }
    let result = {x: 0, y: 0};
    if (point.x <= element.x - element.w / 2) { // Если левее элемента то точка на левой границк
        result.x = 0;
    } else if (point.x >= element.x + element.w / 2) { // Если правее элемента то точка на правой границе
        result.x = 1;
    } else { // Точка на верхней или нижней границе
        result.x =  findPointPosition(point.x, element.x - element.w / 2, element.x + element.w / 2);
    }
    if (point.y >= element.y + element.h / 2) { // Если выше элемента
        result.y = 0;
    } else if (point.y <= element.y - element.h / 2) { // Если ниже элемента
        result.y = 1;
    } else {
        result.y = 1 - findPointPosition(point.y, element.y - element.h / 2, element.y + element.h / 2);
    }
    Object.keys(result).forEach(key => {
        if (result[key] > 1) result[key] = 1;
        if (result[key] < 0) result[key] = 0;
    });

    return result;
}

/*
Поиск ближайшего элемента относительно точки ( для восстановления привязки из  "кружка" )
 */
function findNearestElement(point, elements, direction) {
    return elements.sort(function(a,b){
        if(getInt(a.order)<getInt(b.order)) return 1;
        return -1;
    }).find(
        element => {
            return point.x + visioCircleRadius >= element.x - element.w / 2
                && point.x - visioCircleRadius <= element.x + element.w / 2
                && point.y + visioCircleRadius >= element.y - element.h / 2
                && point.y - visioCircleRadius <= element.y + element.h / 2
        }
    );
}

/*
Определение направления к элементу из "кружка"
 */
function findSidePointDirection(interfaceLineOptions, pointType, direction) {
    const path = interfaceLineOptions.path;
    const begin = interfaceLineOptions.begin;
    const endDot = pointType === 'begin' ? {
            x: begin.x,
            y: begin.y,
        }
        : {
            x: begin.x + path[path.length - 1].point.X,
            y: begin.y + path[path.length - 1].point.Y,
        };
    const prevDot = pointType === 'begin' ? {
            x: begin.x + path[1].point.X,
            y: begin.y + path[1].point.Y,
        }
        : {
            x: begin.x + path[path.length - 2].point.X,
            y: begin.y + path[path.length - 2].point.Y,
        };

    if (Math.abs(endDot.x - prevDot.x) > 0.01) {
        if (endDot.x < prevDot.x) {
            return 'toLeft';
        }
        if (endDot.x > prevDot.x) {
            return 'toRight';
        }
    }
    if (Math.abs(endDot.y - prevDot.y) > 0.01) {
        if (endDot.y < prevDot.y) {
            return 'toDown';
        }
        if (endDot.y > prevDot.y) {
            return 'toUp';
        }
    } else {
        // console.log('No direction!');
    }
}

/*
Ищем название сервера приложения внутри системы
 */
function findElementsInSystem(systems = [], elements = []) {
    return systems.reduce((result, system) => {

        let application = elements.find((element) => isObjectIn(system, element, userAssociatedShapes?.element));

        if (application) {
            result.push({...application, systemId: system.id})
        }

        return result;

    }, []);
}

/*
Применяем выявленное направление к точке
 */
function applyDirectionToPoint(point, direction) {
    let result = point;
    switch (direction) {
        case 'toLeft':
            result.x = result.x - visioCircleRadius;
            break;
        case 'toRight':
            result.x = result.x + visioCircleRadius;
            break;
        case 'toUp':
            result.y = result.y + visioCircleRadius;
            break;
        case 'toDown':
            result.y = result.y - visioCircleRadius;
            break;
    }

    return result;
}

/*
Вносим "компенсационные" исправления в окончания линии
 */
function fixLinePath(lineOption, beginEl, endEl) {
    if (beginEl?.supply || beginEl?.picture) {
        const begin = beginEl.element || beginEl.picture;
        if(begin){
            lineOption.begin = {
                ...lineOption.begin,
                x: beginEl.direction === 'toRight' ? begin.x - begin.w / 2
                    : beginEl.direction === 'toLeft' ? begin.x + begin.w / 2
                        : lineOption.begin.x,
                y: beginEl.direction === 'toDown' ? begin.y + begin.h / 2
                    : beginEl.direction === 'toUp' ? begin.y - begin.h / 2
                        : lineOption.begin.y,
            }
        }
    }

    if (endEl?.supply || endEl?.picture) {
        const end = endEl.supply || endEl.picture;
        if(end){
            var pathLastPoint = lineOption.path[lineOption.path.length - 1];

            lineOption.path[lineOption.path.length - 1] = {
                ...pathLastPoint,
                point: {
                    X: endEl.direction === 'toRight' ? end.x - end.w / 2 - lineOption.end.x
                        : endEl.direction === 'toLeft' ? end.x + end.w / 2 - lineOption.end.x
                            : pathLastPoint.point.X,
                    Y: endEl.direction === 'toDow' ? end.y + end.h / 2 - lineOption.end.y
                        : endEl.direction === 'toUp' ? end.y - end.h / 2 - lineOption.end.y
                            : pathLastPoint.point.Y,
                },

            }
        }
    }

    return lineOption;
}

/*
Устраняем незначительные отклонения линии от горизонтали / вертикали (иначе она схлопывается в точку)
 */
function fixPathSmallerDelta(path = []) {
    return path.map((pointValue, id) => {
        const prevPointValue = path[id -1];
        let pointX = pointValue.point.X;
        let pointY = pointValue.point.Y;

        if(!prevPointValue) return pointValue;

        const prevPointX = prevPointValue.point.X;
        const prevPointY = prevPointValue.point.Y;

        if (pointX && pointY && Math.abs(pointX - prevPointX) < Math.abs(pointY - prevPointY)) {
            pointX = prevPointX;
        } else if (pointX && pointY && Math.abs(pointX - prevPointX) > Math.abs(pointY - prevPointY)) {
            pointY = prevPointY;
        }

        return {
            ...pointValue,
            point: {
                ...pointValue.point,
                X: pointX,
                Y: pointY,
            }
        };
    }, [])
}
