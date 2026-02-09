
var contentCheckResult={};
var h_allowed = [
    "Регистрационн",
    "метаданные",
    "метаинформация"
],
h_forbidden = {
    'Выгрузка'          :'В названиях данных должна присутствовать семантика',
    'Массив'            :'В названиях данных должна присутствовать семантика',
    'Данные'            :'Не нужно употреблять слова "..данные" или "..информация" в названии.\nДанные о… или Информация о… - это и есть сам объект.',
    'Информация'        :'Не нужно употреблять слова "данные" или "информация" в названии.\nДанные о… или Информация о… - это и есть сам объект.',
    'Полная информация' :'Не нужно употреблять слова "полная информация" или "параметры" в названии.\nПолная информация о... или Параметры... - это и есть сам объект.',
    'Параметры'         :'Не нужно употреблять слова "полная информация" или "параметры" в названии.\nПолная информация о... или Параметры... - это и есть сам объект.',
    'Технологические данные':'В название данных не нужно включать слова "Технологические данные"\nДля этого есть отдельное поле',
    'Ответ на запрос'   :'В название данных не нужно включать слова "Запрос" и "Ответ на запрос".\nНужно указывать данные, содержащиеся в запросе или ответе соответственно.',
    'Для'               :'В название данных не нужно включать ссылку на функцию потребителя',
    'Выявленный'        :'В название данных не нужно включать ссылку на функцию поставщика.',
    'Полученный'        :'В название данных не нужно включать ссылку на функцию поставщика.',
    'Построенный'       :'В название данных не нужно включать ссылку на функцию поставщика.',
},
h_message = {
    ' В '                 :'В название данных не нужно включать направление потока данных, в котором они передаются.',
    ' Из '                :'В название данных не нужно включать направление потока данных, в котором они передаются.',
    'Список'            :'В название данных не нужно включать слова "Список", "Реестр", "Пакет" и т.п.\nВ том числе если предполагается хранение или передача нескольких экземпляров объекта данных.',
    'Пакет'             :'В название данных не нужно включать слова "Список", "Реестр", "Пакет" и т.п.\nВ том числе если предполагается хранение или передача нескольких экземпляров объекта данных.',
    'Реестр'             :'В название данных не нужно включать слова "Список", "Реестр", "Пакет" и т.п.\nВ том числе если предполагается хранение или передача нескольких экземпляров объекта данных.',
},
h_typed = {
    'Запрос'            :'Управляющий запрос',
};

$.mergecontent = async function(){
    $("#wait").show();
    setTimeout(()=>{
        var portalupdatedata= $.checkcontent();
        $.propertyset(undefined,true);
        $("#wait").hide();
        if(!contentCheckResult["error"] && isAdmin() && hasPortal()){
            if(confirm((getInt(contentCheckResult["warning"])?"В ходе проверки обнаружены предупреждения.\n":"") + "Объединить проект с архитектурным порталом?")){
                $("#hand").setAction();
                mergedialog(portalupdatedata);
            }
            else{
                if(contentCheckResult["recomendation"])
                    $.outputsetfilter(["recomendation"]);
                else
                    $.outputsetfilter(["warning"]);
            }
        }
        $("#wait").hide();
    },50);
}
var mergedialog = function (portalupdatedata) {
    var jiratasklistholder = $("#jiratasklistholder");
    jiratasklistholder.empty();
    var tabledata=$.getstatustable(portalupdatedata);
    jiratasklistholder.append(
        $(tabledata.linetable).toHtmlTable({class:"MsoNormalTable",border:1}),
        $(tabledata.elementtable).toHtmlTable({class:"MsoNormalTable",border:1}),
        $(tabledata.zonetable).toHtmlTable({class:"MsoNormalTable",border:1})
    );
    $.each(portalupdatedata,function(i,param){
        if(param.datatype=="element" /*&& (!param.sysid || getInt(param.sysid)==0)*/){
            if(param.components){
                $.each(param.components,function(i,e){
                    $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "_c" + e.id + "']").on("change",function () {
                        var checked = $(this).prop("checked");
                        if(checked)
                            $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").prop("checked",true);
                    });
                });
            }
            if(param.functions){
                $.each(param.functions,function(i,e){
                    $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "_f" + e.id + "']").change(function(){
                        var checked = $(this).prop("checked");
                        if(checked)
                            $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").prop("checked",true);
                    });
                });
            }
            if(param.data){
                $.each(param.data,function(i,e){
                    $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "_d" + e.id + "']").change(function(){
                        var checked = $(this).prop("checked");
                        if(checked)
                            $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").prop("checked",true);
                    });
                });
            }
        }
        if(param.datatype=="line" && param.starttype=="element" && param.endtype=="element" && param.datatype3!="dashline" && param.state!="abstract"){
            if(param.data && param.data.length>0){
                $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").change(function(){
                    var checked = $(this).prop("checked");
                    if(checked){
                        $.each(param.data,function(di,dt){
                            if(!isInt(dt.id)){
                                var lst=$(jiratasklistholder).find("input[type='checkbox'][data-id$='_d" + dt.id + "']");
                                $(lst).prop("checked",true);
                                $(lst).change();
                            }
                        });
                    }
                });
            }
            if(param.supplyfunction && !isInt(param.supplyfunction.id)){
                $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").change(function(){
                    var checked = $(this).prop("checked");
                    if(checked){
                        var lst=$(jiratasklistholder).find("input[type='checkbox'][data-id$='_f" + param.supplyfunction.id + "']");
                        $(lst).prop("checked",true);
                        $(lst).change();
                    }
                });
            }
            var startel = $.storeget(param.startel);
            var endel = $.storeget(param.endel);
            if((!startel.sysid || getInt(startel.sysid)==0) || (!endel.sysid || getInt(endel.sysid)==0)){
                $(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").change(function(){
                    var checked = $(this).prop("checked");
                    if(checked){
                        if((!startel.sysid || getInt(startel.sysid)==0)){
                            var lst=$(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.startel + "']");
                            $(lst).prop("checked",true);
                            $(lst).change();
                        }
                        if((!endel.sysid || getInt(endel.sysid)==0)){
                            var lst=$(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.endel + "']");
                            $(lst).prop("checked",true);
                            $(lst).change();
                        }
                    }
                });
            }
        }
    });

    $("#jiraImportPopup").find("input.mainbutton[type='button']").show();

    $("#jiraImportPopup").showDialog({
        caption: "Объединение с Архитектурным Порталом",
        okcaption:"Объединить",
        showtoolbox:"merge",
        success: function(){
            $("#wait").show({
                duration:100,
                complete:function(){
                    // принудительно проставляем
                    $.each(portalupdatedata.sort(function(a,b){
                        if(a.datatype=="line") return -1;
                        return 1;
                    }),function(i,param){
                        param.checked=$(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "']").prop("checked");
                        if(param.datatype=="line" && param.checked && param.starttype=="element" && param.endtype=="element" && param.datatype3!="dashline" && param.state!="abstract"){
                            if(param.data && param.data.length==1 && !isInt(param.data[0].id))
                                $(jiratasklistholder).find("input[type='checkbox'][data-id$='_d" + param.data[0].id + "']").prop("checked",true);
                            if(param.supplyfunction && !isInt(param.supplyfunction.id))
                                $(jiratasklistholder).find("input[type='checkbox'][data-id$='_f" + param.supplyfunction.id + "']").prop("checked",true);
                        }
                        if(param.datatype=="element"){
                            if(param.components){
                                $.each(param.components,function(i,e){
                                    e.checked=$(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "_c" + e.id + "']").prop("checked");
                                    if(e.checked && (!param.sysid || getInt(param.sysid)==0))
                                        param.checked=true;
                                });
                            }
                            if(param.functions){
                                $.each(param.functions,function(i,e){
                                    e.checked=$(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "_f" + e.id + "']").prop("checked");
                                    if(e.checked && (!param.sysid || getInt(param.sysid)==0))
                                        param.checked=true;
                                });
                            }
                            if(param.data){
                                $.each(param.data,function(i,e){
                                    e.checked=$(jiratasklistholder).find("input[type='checkbox'][data-id='" + param.id + "_d" + e.id + "']").prop("checked");
                                    if(e.checked && (!param.sysid || getInt(param.sysid)==0))
                                        param.checked=true;
                                });
                            }
                        }
                    });
                    var error=[];
                    $("#jiraImportPopup").setError("");
                    // проверяем, есть ли что добавить
                    /*var needotar=false;
                    $.each(portalupdatedata,function(i,param){
                        needotar |= param.checked && (!param.sysid || getInt(param.sysid)==0);
                        switch(param.datatype){
                            case "element":
                                $.each(param.components,function(i,e){
                                    needotar |= e.checked && !isInt(e.id);
                                });
                                $.each(param.functions,function(i,e){
                                    needotar |= e.checked && !isInt(e.id);
                                });
                                $.each(param.data,function(i,e){
                                    needotar |= e.checked && (!isInt(e.id) || !isInt(e.spid));
                                });
                            break;
                            case "line":
                                $.each(param.data,function(i,e){
                                    needotar |= e.checked && !isInt(e.id);
                                });
                            break;
                        }
                    });
                    if(needotar){
                        if($("#attach_task").val()=="")
                            error.push("Укажите ID задачи СГА на раскладку или 0");
                        if(attach_otar.files.length==0)
                            error.push("Для добавления новых данных на Портал укажите ОТАР");
                    }*/
                    if(error.length>0){
                        $("#wait").hide();
                        $("#jiraImportPopup").setError(error);
                        return;
                    }
                    //$("#createdoc_task").val($("#attach_task").val());
                    $.outputclear(["error","recomendation","warning","note"]);
                    $.storemerge({
                        data:portalupdatedata,
                        /*task: $("#attach_task").val(),
                        otar: attach_otar.files.length>0?attach_otar.files[0]:undefined,*/
                        success:function(data){
                            $.restore(); 
                            $("#wait").hide();
                            alert("Объединение завершено");
                            $.outputsetfilter(["note"]);
                            mergedialog(data);
                        },
                        error:function(){
                            $("#wait").hide();
                            alert("Объединение завершено с ошибками");
                            $.outputsetfilter(["error"]);
                            $("#jiraImportPopup").showDialog(false);
                        }
                    });
                }
            });
        }
    });

}
$.checkcontent = function(){
    contentCheckResult={};
    $.outputclear(["error","recomendation","warning","note"]);
    var hasLegend = false;
    var sysid;
    portalupdatedata=[];
    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        var view = $.hasviewpageparam(param,"interface")?"interface":($.hasviewpageparam(param,"system")?"system":undefined);
        if(!view){
            //console.log("no viewpoint",param);
            return;
        }
        switch(param.datatype){
            case "document1":
                if (param.sysid != 0) {
                    $.getschemaname({
                        id: param.sysid,
                        async:false,
                        type: "business",
                        success: function (file) {
                            if (file.name == "") {
                                $.addcheckcontentresult({text:"Отсутствует схема ФМП", view:"business", type:"warning"});
                            }
                        }
                    });
                    $.getschemaname({
                        id: param.sysid,
                        async:false,
                        type: "function",
                        success: function (file) {
                            if (file.name == "") {
                                $.addcheckcontentresult({text:"Отсутствует схема ТА", view:"function", type:"warning"});
                            }
                        }
                    });
                }
                else{
                    // $.addcheckcontentresult({text:"Отсутствует схема ФМП", view:"business", type:"warning"});
                    // $.addcheckcontentresult({text:"Отсутствует схема ТА", view:"function", type:"warning"});
                }
            break;
            case "legend":
                hasLegend = true;
                break;
            case "zone":
                if (hasPortal()) {
                    var need2Save = false;
                    var list = getZoneList({ name: param.name, length: 1, typeid:2, async: false });
                    if (list.length == 0) {
                        if (getInt(param.sysid) != 0) {
                            param.sysid = 0;
                            need2Save = true;
                        }
                        $.addcheckcontentresult({ text: "Cетевой сегмент '" + param.name + "' не найден на Архитектурном портале", view: view, target: param.datatype, id: param.id, type: (isAdmin() ? "warning" : "error") });
                    }
                    else{
                        sysid=getInt(list[0].sysid);
                        if(getInt(param.sysid)!=sysid){
                            $.addcheckcontentresult({text:"Cетевому сегменту '" + param.name +"' присвоен ID в соответствиии с Архитектурным порталом", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                            param.sysid=sysid;
                            need2Save = true;
                        }
                    }
                    if (need2Save) {
                        $.storeset(param);
                    }
                    portalupdatedata.push(param);
                }
                break;
            case "element":
                let nameBefore = param.name;
                if(param.datatype3=="application")
                    param.name = $.logicGetGlobalName(param,"interface");
                if(param.datatype3!="collaboration") {
                    if (nameBefore!=param.name) {
                        $.addcheckcontentresult({text:"Системе '" + nameBefore + "' присвоено имя '" + param.name +"' в соответствиии с правилами наименования", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                    }
                    portalupdatedata.push(param);
                }                break;
            case "line":
                portalupdatedata.push(param);
                break;
        }
    });
    $.each(portalupdatedata,function(i,param){
        if(param.datatype!="element")
            return;
        var view = $.hasviewpageparam(param,"interface")?"interface":($.hasviewpageparam(param,"system")?"system":undefined);
        if(!view){
            //console.log("no viewpoint",param);
            return;
        }
        var need2Save=false;
        var list = getSystemList({ name: param.name, length: 1, async: false });
        //console.log(param.name,list);
        if(list.length>0){
            sysid=getInt(list[0].sysid);
            if (getInt(param.sysid) != sysid) {
                $.addcheckcontentresult({text:"Системе '" + param.name +"' присвоен ID в соответствиии с Архитектурным порталом", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                /*let id = ((!param.sysid || getInt(param.sysid) == 0) ? param.id : param.sysid);
                $.each(param.components,function(i,e){
                    if(e.id==id) e.id=sysid;
                });*/
                /*if (param.components && param.components.length > 0)
                    param.components[0].id = sysid;*/
                param.sysid=sysid;
                need2Save=true;
            }
            if($.isempty(param.parentid) || getInt(param.parentid)==0 /*|| $.isempty(param.parentname)*/){
                param.parentid = getInt(list[0].parentid);
                need2Save=true;
            }
        }
        else{
            if(getInt(param.sysid)!=0){
                /*if (param.components && param.components.length > 0)
                    param.components[0].id = param.id;*/
                param.sysid=0;
                need2Save=true;
            }
            //предлагаем похожие
            /* TODO сделать правильный поиск
            list=getSPListValues("Каталог АС",'<Query><Where><Contains><FieldRef Name="Title"/><Value Type="Text">' + param.name + '</Value></Contains></Where></Query>');
            if(list.length>0){
                $.addcheckcontentresult({text:"Для системы '" + param.name +"' есть похожие значения на Архитектурном портале, напр '" + $(list[0]).attr("ows_Title") + "'", view:view, target:param.datatype, id:param.id, type:"recomendation"});
            }*/
        }
        // устанавливаем родителя
        if(hasPortal()){
        //if(param.id=="63e2580f-8367-42fd-a1ea-8bb74bef0382") debugger;
        //if($.isempty(param.parentid) || getInt(param.parentid)==0/* || $.isempty(param.parentname)*/){
            let plist=param.name.split('. ');
            if(plist.length>1 && !(plist.length==2 && plist[0].toLowerCase().trim()=="ext")){
                let pname = plist.slice(0,plist.length-1).join(". ");
                // ищем в решении
                let parent = portalupdatedata.find(item => (item.datatype=="element" && item.name.trim().toLowerCase()==pname.toLowerCase().trim()));
                if(parent){
                    param.parentid=parent.sysid;
                    //param.parentname=parent.name;
                    /*param.valuestream =
                        ((!param.valuestream || param.valuestream == "")
                        && param.state == "new"
                        && (parent.valuestream!=undefined || parent.valuestream != ''))
                        ? parent.valuestream
                        : param.valuestream;*/
                    need2Save=true;
                }
                else {
                    // ищем в каталоге
                    list = getSystemList({ name: pname, length: 1, async: false });
                    if(list.length>0){
                        param.parentid=getInt(list[0].sysid);
                        /*let parentvs = $(list[0]).attr("ows_ValueStream");
                        //param.parentname=$(list[0]).attr("ows_Title");
                        param.valuestream =
                            ((!param.valuestream || param.valuestream == "")
                            && param.state == "new"
                            && (parentvs!=undefined && parentvs != '' && parentvs!="undefined"))
                            ? parentvs
                            : param.valuestream;
                        need2Save=true;*/
                    }
                    else
                        $.addcheckcontentresult({text:"Для компонента '" + param.name +"' не найдена родительская система '" + pname + "' на Архитектурном портале. Добавьте ее в решение", view:view, target:param.datatype, id:param.id, type:"error"});
                }
            }
        /*} else { // если родитель известен
            list = getSPListValues("Каталог АС",'<Query><Where><Eq><FieldRef Name="ID"/><Value Type="Text">' + param.parentid + '</Value></Eq></Where></Query>');
            let parentvs = $(list[0]).attr("ows_ValueStream");
            param.valuestream =
                ((!param.valuestream || param.valuestream == "")
                && param.state == "new"
                && (parentvs!=undefined || parentvs != ''))
                ? parentvs
                : param.valuestream;
            need2Save=true;
            // if (param.state == "new" && (!param.valuestream || param.valuestream == "") && (parentvs!=undefined || parentvs != '')) {
            //     param.valuestream=parentvs;
            //     need2Save=true;
            // }
        }*/
        }
        if(hasPortal() && (!param.sysid || getInt(param.sysid)==0)){
            if(param.state!="new" && param.state!="external" /*&& param.datatype3!="collaboration"*/) {
                $.addcheckcontentresult({text:"Система '" + param.name +"' имеет статус '" + getStateName(param.state) + "', но отсутствует на Архитектурном портале", view:view, target:param.datatype, id:param.id, type:"warning"});
            }
        }
        else if(hasPortal() && param.state=="new")
            $.addcheckcontentresult({text:"Система '" + param.name +"' имеет статус '" + getStateName(param.state) + "', и присутствует на Архитектурном портале", view:view, target:param.datatype, id:param.id, type:"warning"});
        if($.isempty(param.name))
            $.addcheckcontentresult({text:"Укажите систему", view:view, target:param.datatype, id:param.id, type:"error"});
        if($.isempty(param.description)){
            $.addcheckcontentresult({text:"Укажите назначение системы '" + param.name +"'", view:view, target:param.datatype, id:param.id, type:"warning"});
            param.description = param.name;
        }
        /*if($.isempty(param.type))
            $.addcheckcontentresult({text:"Укажите тип системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"error"});*/
        if($.isempty(param.location))
            $.addcheckcontentresult({text:"Укажите зону размещения системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"error"});

        list=[];
        var calcState = (param.data && param.data.length>0 || param.functions && param.functions.length>0 || param.components && param.components.length>0?"exist":param.state);
        if(hasPortal() && param.components){
            $.each(param.components,function(i,e){
                e.calcState="exist";
                var list = getSystemList({ name: e.name, length: 1, async: false });
                if(list.length>0){
                    sysid=getInt(list[0].sysid);
                    if(getInt(e.id)!=sysid){
                        $.addcheckcontentresult({text:"Компоненте '" + e.name +  "' системы '" + param.name +"' присвоен ID в соответствиии с Архитектурным порталом", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                        e.id=sysid;
                        need2Save=true;
                    }
                    else{
                        // проверяем все компоненты
                        getSystemComponentList({
                            async:false,
                            systemid:e.id,
                            systemonly:true,
                            length:1000000,
                            success: function (result) {
                                $.each(e.data, function (i1, e1) {
                                    let p1=result.find(item => item.type==e1.type);
                                    if (p1) {
                                        e1.id = p1.id;
                                        if (!(p1.value == e1.value && (p1.desc ?? "") == (e1.desc ?? ""))) {
                                            e.calcState = (e.calcState != "new" ? "change" : "new"); //$.logicStateMapping(e.calcState, "change");
                                        }
                                        e1.found=true;
                                        need2Save = true;
                                    }
                                    else{
                                        e1.id = $.newguid();
                                        e.calcState ="new";
                                        need2Save=true;
                                    }
                                });
                            }
                        });
                    }
                }
                else{
                    if(e.id==((!param.sysid || getInt(param.sysid)==0)?param.id:param.sysid))
                        e.name=param.name;
                    else
                        e.id=(param.name.toLowerCase().trim()==e.name.toLowerCase().trim()?((!param.sysid || getInt(param.sysid)==0)?param.id:param.sysid):$.newguid());
                    $.each(e.data,function (i1,e1) {
                        e1.id=$.newguid();
                    });
                    e.calcState="new";
                    need2Save=true;
                }
                //if(e.calcState=="new" || e.calcState=="change")
                  //  calcState="change";
            });
        }
        if(param.data){
            var hasEmpty = false;
            list=[];
            if(hasPortal() && param.sysid && getInt(param.sysid)!=0)
                list = getSystemDataList({ systemid:param.sysid, async:false});
            $.each(param.data,function(i,e){
                var isFound=false;
                var likeName="";
                e.extid=e.id;
                if(hasPortal()){
                    var namelc = e.name.toLowerCase().trim();
                    delete e.spid;
                    $.each(list,function(i1,e1){
                        //if(e.name=="Зарплатный реестр (О-файл)" && getSPValue($(e1).attr("ows__x0421__x0443__x0449__x043d__x04"))=="Зарплатный реестр (O-файл)") debugger;
                        var name=e1.name.toLowerCase().trim();
                        var id=getInt(e1.id);
                        if(name==namelc){
                            isFound=true;
                            e.spid=getInt(e1.id);
                            if(id!=e.id){
                                e.id=id;
                                $.addcheckcontentresult({text:"Сущности '" + e.name + "' системы '" + param.name +"' присвоен ID в соответствиии с Архитектурным порталом", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                                need2Save=true;
                            }
                            return false;
                        }
                        if(!isFound && name.indexOf(e.name.toLowerCase())!=-1 || e.name.toLowerCase().indexOf(name)!=-1)
                            likeName=e1.name;
                    });
                    //if(getInt(param.sysid)==638) debugger;

                    if(!isFound){
                        var list1 = getDataList({ name: e.name, length: 1, async: false });
                        if(list1.length>0){
                            var id=getInt(list1[0].id);
                            if(id!=e.id){
                                /*$.each(portalupdatedata,function(i1,e1){
                                    if((e1.datatype=="line" || e1.datatype=="element" && e1.id!=param.id) && e1.data){
                                        let need2update =false;
                                        $.each(e1.data,function(di1,dt1){
                                            if(dt1.id==e.id || dt1.name.toLowerCase().trim()==dt.name.toLowerCase().trim()){
                                                dt1.id=id;
                                                need2update=true;
                                            }
                                        });
                                        if(need2update)
                                            $.storeset(e1);//для обновления формы на случай ошибки
                                    }
                                });*/
                                e.id=id;
                                $.addcheckcontentresult({text:"Сущности '" + e.name + "' системы '" + param.name +"' присвоен ID в соответствиии с Архитектурным порталом", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                                need2Save=true;
                            }
                            //e.extpod=getInt($(list1[0]).attr("ows__x0410__x0421__x002c__x0020__x04"));
                        }
                        else{
                            if(isInt(e.id)){
                                e.id=$.newguid();
                                need2Save=true;
                            }
                            if(!isInt(e.id)){
                                if(likeName!="")
                                    $.addcheckcontentresult({text:"Для сущности '" + e.name + "' системы '" + param.name +"' есть похожие значения на Архитектурном портале, напр '" + likeName + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                                else{
                                    //предлагаем похожие из каталога
                                    /* TODO сделать правильный поиск
                                    list1=getSPListValues("Каталог сущностей",'<Query><Where><Contains><FieldRef Name="Title"/><Value Type="Text">' + e.name + '</Value></Contains></Where></Query>');
                                    if(list1.length>0){
                                        $.addcheckcontentresult({text:"Для сущности '" + e.name + "' системы '" + param.name +"' есть похожие значения на Архитектурном портале, напр '" + $(list1[0]).attr("ows_Title") + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                                    }*/
                                    list1=[];
                                }
                            }
                        }
                    }
                    if(!$.isempty(e.name)){
                        if(isInt(e.id)){
                            if(e.state=="new")
                                $.addcheckcontentresult({text:"Сущность '" + e.name + "' имеет статус '" + getStateName(e.state) + "' и присутствует на Архитектурном портале", view:"interface", target:param.datatype, id:param.id, type:"warning"});
                        }
                        else{
                            if(e.state!="new")
                                $.addcheckcontentresult({text:"Сущность '" + e.name + "' имеет статус '" + getStateName(e.state) + "', но отсутствует на Архитектурном портале", view:"interface", target:param.datatype, id:param.id, type:"note"});
                            var lowname=e.name.toLowerCase().trim();
                            // правила именования сущностей
                            if(!h_allowed.find(item=>lowname.indexOf(item.toLowerCase().trim())!=-1)){
                                for(let key of Object.keys(h_forbidden)){
                                    if(lowname.indexOf(key.toLowerCase())!=-1)
                                        $.addcheckcontentresult({text:"Для сущности '" + e.name + "' системы '" + param.name +"' " + h_forbidden[key], view:"interface", target:param.datatype, id:param.id, type:"error"});
                                }
                            }
                            for(let key of Object.keys(h_message)){
                                if(lowname.indexOf(key.toLowerCase())!=-1)
                                    $.addcheckcontentresult({text:"Для сущности '" + e.name + "' системы '" + param.name +"' " + h_message[key], view:"interface", target:param.datatype, id:param.id, type:"warning"});
                            }
                            for(let key of Object.keys(h_typed)){
                                if(lowname.indexOf(key.toLowerCase())!=-1)
                                    e.class=h_typed[key];
                            }
                            if($.isempty(e.pod)){
                                var group = e.name.split('.');
                                if(group.length>1){
                                    // пытаемся определить ПОД <IsNotNull><FieldRef Name="pod"/></IsNotNull>
                                    var list1 = getDataList({ term: group[0].trim() + ". ", length: 1, async: false });
                                    $.each(list1,function(i1,e1){
                                        var pod = $e1.pod;
                                        if($.isnull(pod,"")!=""){
                                            e.pod=pod;
                                            $.addcheckcontentresult({text:"В системе '"+ param.name +"' сущности '" + e.name + "' присвоен ПОД '" + e.pod + "' в соответствии с доменом '" + group[0].trim() + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                                            need2Save=true;
                                            return false;
                                        }
                                    });
                                    /*if(list1.length>0){
                                        e.pod=$(list1[0]).attr("ows_pod");
                                        $.addcheckcontentresult({text:"В системе '"+ param.name +"' сущности '" + e.name + "' присвоен ПОД '" + getSPValue(e.pod) + "' в соответствии с доменом '" + group[0].trim() + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                                        need2Save=true;
                                    }*/
                                }
                                else
                                    $.addcheckcontentresult({text:"Укажите ПОД в системе '"+ param.name +"' у сущности '" + e.name + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                            }
                        }
                        if($.isempty(e.securitytype))
                            $.addcheckcontentresult({text:"Не указан класс ИБ в системе '"+ param.name +"' у сущности '" + e.name + "'", view:"interface", target:param.datatype, id:param.id, type:isInt(e.id)?"recomendation":"error"});
                        if($.isempty(e.flowtype))
                            $.addcheckcontentresult({text:"Не указан тип данных в системе '"+ param.name +"' у сущности '" + e.name + "'", view:"interface", target:param.datatype, id:param.id, type:"error"});
                    }
                    else
                        hasEmpty=true;
                }
                if((e.state=="new" || e.state=="change") && e.flowtype!="transfer")
                    calcState="change";
            });
            if(hasEmpty)
                $.addcheckcontentresult({text:"Система '" + param.name +"' содержит пустые данные", view:"interface", target:param.datatype, id:param.id, type:"error"});
            list=[];
        }
        if(param.functions){
            var hasEmpty = false;
            list=[];
            if(hasPortal() && param.sysid && getInt(param.sysid)!=0)
                list = getSystemFunctionList({ systemid: param.sysid, async: false });
            //console.log(param,list);
            $.each(param.functions,function(i,e){
                var isFound=false;
                var likeName="";
                var likeMethod="";
                e.extid=e.id;
                e.fntype="Внутренняя";
                e.consumermethod=e.method;
                var searchState=0;
                var num1;
                var num2;
                $.each(portalupdatedata,function(i1,e1){
                    if(e1.datatype=="line" && $.hasviewpageparam(e1,"interface") && (e1.function=="supply" && e1.startel==param.id || e1.function=="consumer" && e1.endel==param.id) && e1.endfn && e1.endfn.toString()==e.id.toString()){
                        switch(searchState){
                            case 0:
                                //e.method=e1.consumermethod;
                                searchState=1;
                                num1=e1.number;
                                //if(e.consumermethod=="подписание ВИ") debugger;
                            break;
                            case 1:
                                if($.isnull(e.consumermethod,"")!=$.isnull(e1.consumermethod,"")){
                                    searchState=-1;
                                    num2=e1.number;
                                    console.log($.isnull(e.consumermethod,""),$.isnull(e1.consumermethod,""));
                                }
                            break;
                        }
                    }
                });
                //if(searchState==-1)
                    //$.addcheckcontentresult({text:"Функция поставщика '" + e.name + "' системы '" + param.name +"' должна иметь 1 метод реализации (потоки №" + num1 +" и №" + num2 + ")", view:"interface", target:param.datatype, id:param.id, type:"error"});
                if(hasPortal()){
                    var fn_name = e.name.toLowerCase().trim().replace("  "," ");
                    $.each(list, function (i1, e1) {
                        var name=$.isnull(e1.name,"").toLowerCase().trim().replace("  "," ");
                        var consumermethod=e1.method;
                        var isLike=(consumermethod!=undefined && name==consumermethod.toLowerCase().trim().replace("  "," "));
                        var id=getInt(e1.id);
                        /*if(param.sysid==8249 && name=="предоставление файла")
                            console.log(id, name);*/
                        if((consumermethod!=undefined && !isLike) && e.method!=undefined && consumermethod.trim()==e.method.trim() || ((consumermethod==undefined || isLike) || e.method==undefined) && name==fn_name){
                            isFound=true;
                            e.spid = getInt(e1.id);
                            if(id!=e.id){
                                /*$.each(portalupdatedata,function(i1,e1){
                                    if(e1.datatype=="line" && (e1.startel==param.id && e1.function=="supply" || e1.endel==param.id && e1.function=="consumer")){
                                        let need2update =false;
                                        if(e1.supplyfunction && e1.supplyfunction.id==e.id){
                                            e1.endfn=id;
                                            need2update=true;
                                        }
                                        if(e1.endfn==e.id) {
                                            e1.endfn=id;
                                            need2update=true;
                                        }
                                        if(need2update)
                                            $.storeset(e1);//для обновления формы на случай ошибки
                                    }
                                });*/
                                e.id = id;
                                if(name==fn_name)
                                    $.addcheckcontentresult({text:"Функции '" + e.name + "'" + (e.method?" (" + e.method + ")":"") +" системы '" + param.name +"' присвоен ID в соответствиии с Архитектурным порталом", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                                else
                                    $.addcheckcontentresult({text:"Функции '" + e.name + "' системы '" + param.name +"' присвоен ID функции '" + e1.name + "' по совпадению метода реализации '" + e.method + "'", view:view, target:param.datatype, id:param.id, type:"recomendation"});
                                need2Save=true;
                            }
                            return false;
                        }

                        if(!isFound && name.indexOf(e.name.toLowerCase())!=-1 || e.name.toLowerCase().indexOf(name)!=-1){
                            likeName=e1.name;
                            likeMethod=e1.method;
                            //debugger;
                        }
                    });
                    if (!isFound) {
                        var list1 = getFunctionList({ name: e.name, length: 1, async: false });
                        if (list1.length > 0) {
                            var id = getInt(list1[0].id);
                            if (id != e.id) {
                                /*$.each(portalupdatedata,function(i1,e1){
                                    if((e1.datatype=="line" || e1.datatype=="element" && e1.id!=param.id) && e1.data){
                                        let need2update =false;
                                        $.each(e1.data,function(di1,dt1){
                                            if(dt1.id==e.id || dt1.name.toLowerCase().trim()==dt.name.toLowerCase().trim()){
                                                dt1.id=id;
                                                need2update=true;
                                            }
                                        });
                                        if(need2update)
                                            $.storeset(e1);//для обновления формы на случай ошибки
                                    }
                                });*/
                                e.id = id;
                                $.addcheckcontentresult({ text: "Сущности '" + e.name + "' системы '" + param.name + "' присвоен ID в соответствиии с Архитектурным порталом", view: view, target: param.datatype, id: param.id, type: "recomendation" });
                                need2Save = true;
                            }
                            //e.extpod=getInt($(list1[0]).attr("ows__x0410__x0421__x002c__x0020__x04"));
                        }
                        else {
                            if (isInt(e.id)) {
                                e.id = $.newguid();
                                need2Save = true;
                            }
                            if (!isInt(e.id)) {
                                if (likeName != "")
                                    $.addcheckcontentresult({ text: "Для функции '" + e.name + "'" + (e.method ? " (" + e.method + ")" : "") + " системы '" + param.name + "' есть похожие значения на Архитектурном портале, напр '" + likeName + "'" + (likeMethod ? " (" + likeMethod + ")" : ""), view: "interface", target: param.datatype, id: param.id, type: "recomendation" });
                            }
                        }
                    }
                    if(!$.isempty(e.name)){
                        if(isInt(e.id)){
                            if(e.state=="new")
                                $.addcheckcontentresult({text:"Функция '" + e.name + "' имеет статус '" + getStateName(e.state) + "' и присутствует на Архитектурном портале", view:"interface", target:param.datatype, id:param.id, type:"warning"});
                        }
                        else{
                            if(e.state!="new")
                                $.addcheckcontentresult({text:"Функция '" + e.name + "' имеет статус '" + getStateName(e.state) + "', но отсутствует на Архитектурном портале", view:"interface", target:param.datatype, id:param.id, type:"note"});
                        }
                    }
                    else
                        hasEmpty=true;
                    if(e.state=="new" || e.state=="change")
                        calcState="change";
                }
            });
            if(hasEmpty)
                $.addcheckcontentresult({text:"Система '" + param.name +"' содержит пустые функции", view:"interface", target:param.datatype, id:param.id, type:"error"});
            list=[];
        
        }
        if(view=="interface"){
            if(param.state=="exist" && calcState=="change")
                $.addcheckcontentresult({text:"Система '" + param.name +"' имеет статус '" + getStateName(param.state) + "', но содержит новые/ изменяемые функции или данные", view:view, target:param.datatype, id:param.id, type:"error"});
            if(calcState=="exist" && (param.state=="new" || param.state=="change") && !$($.intplatformdictionary()).objectArrayGetByField("name",param.name) /*param.type != "Интеграционная платформа"*/){
                $.addcheckcontentresult({text:"Система '" + param.name +"' имеет статус '" + getStateName(param.state) + "', но не содержит новых/ изменяемых функций или данных", view:view, target:param.datatype, id:param.id, type:"warning"});
            }
        }
        if(param.state!="external"){
            if($.hasviewpageparam(param,"interface")){
                //let platform=param.components?.find(item => (item.id==param.sysid || (!param.sysid || getInt(param.sysid)==0) && item.id==param.id));
                /*let pl;
                if(!platform){
                    let lname = logicGetLocalName(param.name).toLowerCase().trim();
                    pl=param.components?.find(item=>logicGetLocalName(item.name).toLowerCase().trim()==lname);
                }*/
                if(param.data){
                    var hasStoredData = false;
                    $.each(param.data,function(i,e){
                        hasStoredData |= e.flowtype!="transfer";
                    });
                    if(hasStoredData){    
                        if(!param.components || param.components.length==0) {      
                            $.addcheckcontentresult({text:"Укажите OC сервера и БД/ Хранилища системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new" || param.components.length>0 ?"error":"warning")});
                        }
                        else{
                            if(!param.components?.find(item => (item?.values.template))){
                                if(!param.components?.find(item => (item?.values.os || item?.values.dbos)) /*!platform?.values.os && !platform?.values.dbos*//*$.isempty(dbos)*/)
                                    $.addcheckcontentresult({text:"Укажите OC сервера БД/ Хранилища системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new" || param.components.length>0?"error":"warning")});
                                if(!param.components?.find(item => (item?.values.db))/*!platform?.values.db*//*$.isempty(dbenv)*/)
                                    $.addcheckcontentresult({text:"Укажите БД/ Хранилище системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new" || param.components.length>0?"error":"warning")});
                            }
                        }
                    }
                }
                if(param.functions && param.functions.length>0){
                    if(!param.components || param.components.length==0)
                        $.addcheckcontentresult({text:"Укажите OC сервера и среду исполнения приложений системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new"?"error":"warning")});
                    else{
                        if(!param.components?.find(item => (item?.values.template))){
                            if(!param.components?.find(item => (item?.values.os))/*!platform?.values.os*//*$.isempty(appos)*/)
                                $.addcheckcontentresult({text:"Укажите ОС сервера приложений системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new"?"error":"warning")});
                            if(!param.components?.find(item => (item?.values.sys || item?.values.app || item?.values.env))/*!platform?.values.sys && !platform?.values.app && !platform?.values.env*//*$.isempty(appenv)*/)
                                $.addcheckcontentresult({text:"Укажите среду исполнения приложений системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new"?"error":"warning")});
                        }
                    }
                }  
            }

            //if($.isempty(param.valuestream))
                //$.addcheckcontentresult({text:"Укажите Value Stream системы '" + param.name +"'", view:view, target:param.datatype, id:param.id, type:(param.state=="new"?"recomendation":"warning")});
            if (param.metrics) {
                $.each(param.metrics, function (i, e) {
                    if ($.isnull(e.value, "") == "") {
                        $.addcheckcontentresult({ text: "Укажите '" + e.name + "' системы '" + param.name + "'", view: "system", target: param.datatype, id: param.id, type: (param.state == "new" && (e.requared == "true" || e.requared == true) ? "error" : "warning") });
                    }
                });
            }
            /*if($.isempty(param.critical))
                $.addcheckcontentresult({text:"Укажите приоритетность восстановления системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:(param.state=="new"?"error":"warning")});
            if ($.isempty(param.recovery))
                $.addcheckcontentresult({text:"Укажите время восстановления системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.deployment))
                $.addcheckcontentresult({text:"Укажите тип обработки отказов системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.monitoring))
                $.addcheckcontentresult({text:"Укажите уровень мониторинга системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.mode))
                $.addcheckcontentresult({text:"Укажите режим функционирования системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.users))
                $.addcheckcontentresult({text:"Укажите категорию пользователей системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.levels))
                $.addcheckcontentresult({text:"Укажите тип развертывания системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.lifecycle))
                $.addcheckcontentresult({text:"Укажите жизненный цикл системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.certificate))
                $.addcheckcontentresult({text:"Укажите ИТ-сертификацию системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            if($.isempty(param.zoomlevel))
                $.addcheckcontentresult({text:"Укажите тип масштабирования системы '" + param.name +"'", view:"system", target:param.datatype, id:param.id, type:"warning"});
            */
        }
        if (need2Save) {
            $.storeset(param);
        }
    });
    $.each(portalupdatedata,function(i,param){
        if(param.datatype!="line")
            return;
        if($.hasviewpageparam(param,"system")){
            var initiator = undefined;
            var terminator = undefined;
            var parammenu = $.getviewpageparam(param);
            if(parammenu.direction=="f"){
                if (param.startel!=undefined)
                    initiator = param.startel;
                if(param.endel != undefined)
                    terminator = param.endel;
            }
            else{
                if(param.endel != undefined)
                    initiator = param.endel;
                if (param.startel!=undefined)
                    terminator = param.startel;
            }
            if(!initiator)
                $.addcheckcontentresult({text:"Не указан инициатор соединения интерфейса" + (!$.isempty(param.number)?" №" + param.number:""), view:"system", target:param.datatype, id:param.id, type:"error"});
            if(!terminator)
                $.addcheckcontentresult({text:"Не указан приемник соединения интерфейса" + (!$.isempty(param.number)?" №" + param.number:""), view:"system", target:param.datatype, id:param.id, type:"error"});
            if((!param.interaction || param.interaction =="") && param.datatype3!="dashline" && param.state!="abstract")
                $.addcheckcontentresult({text:"Укажите тип взаимодействия интерфейса" + (!$.isempty(param.number)?" №" + param.number:""), view:"system", target:param.datatype, id:param.id, type:"error"});
            if((!param.consumerint || param.consumerint=="") && (!param.supplyint || param.supplyint =="") && param.datatype3!="dashline" && param.state!="abstract" && supplytype=="element" && consumertype=="element")
                $.addcheckcontentresult({text:"Укажите протокол взаимодействия интерфейса" + (!$.isempty(param.number)?" №" + param.number:""), view:"system", target:param.datatype, id:param.id, type:"error"});
            if(param.supplyint && ",https,http,soap,rest,".indexOf("," + param.supplyint.trim().toLowerCase() + ",")!=-1 && (!param.consumermethod || param.consumermethod=="") && param.datatype3!="dashline" && param.state!="abstract" && supplytype=="element" && consumertype=="element")
                $.addcheckcontentresult({text:"Интерфейс" + (!$.isempty(param.number)?" №" + param.number:"")  + " должен иметь метод реализации для протокола поставщика '" + param.supplyint + "'", view:"system", target:param.datatype, id:param.id, type:"recomendation"});
        }
        if(!$.hasviewpageparam(param,"interface"))
            return;

        var need2Save=false;
        if(param.name=="" || param.name=="Новый интерфейс")
            $.addcheckcontentresult({text:"Укажите название потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"note"});
        var consumer = undefined;
        var supply = undefined;
        var consumerfn = param.startfn
        var consumertype = param.starttype;
        var supplyfn = param.endfn;
        var supplytype = param.endtype;

        var parammenu = $.getviewpageparam(param);
        if(param.function=="supply"){
            supply = param.startel;
            consumer = param.endel;
            supplytype = param.starttype;
            consumertype = param.endtype;
        }
        else{
            consumer = param.startel;
            supply = param.endel;
            consumertype = param.starttype;
            supplytype = param.endtype;
        }
        param.consumerfunction=undefined;
        if(!consumer)
            $.addcheckcontentresult({text:"Не указан потребитель потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"error"});
        else{
            //if(param.number=="5.2") debugger;
            param.consumer=$.storeget(consumer);
            need2Save=true;
            if(param.consumer.datatype!=consumertype){
                consumertype=param.consumer.datatype;
                if(param.function=="supply")
                    param.endtype=consumertype;
                else
                    param.starttype=consumertype;
            }
            if(consumerfn && supplytype=="element" && consumertype=="element" && param.datatype3!="dashline" && param.state!="abstract"){
                delete param.consumerfunction;
                $.each(portalupdatedata,function(i,e){
                    if(e.datatype=="element" && e.id==consumer){
                        $.each(e.functions,function(i1,e1){
                            if(consumerfn==e1.extid){
                                e1.fntype="Вызов сервиса";
                                e1.consumerint=param.consumerint;
                                e1.interaction=param.interaction
                                param.consumerfunction=e1;
                            }
                        })
                    }
                });
                if(!param.consumerfunction)
                    $.addcheckcontentresult({text:"Укажите функцию потребителя потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"warning"});
                else {
                    if(param.consumerfunction.extid!=param.consumerfunction.id){
                        if(param.consumerfunction.state=="new" && param.state=="exist")
                            $.addcheckcontentresult({text:"Существующий поток" + (!$.isempty(param.number)?" №" + param.number:"") + " использует новую функцию потребителя '" + param.consumerfunction.name +"'", view:"interface", target:param.datatype, id:param.id, type:"error"});
                        param.startfn=param.consumerfunction.id;
                        need2Save=true;
                    }
                }
            }
        }
        if(!supply)
            $.addcheckcontentresult({text:"Не указан поставщик потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"error"});
        else{
            param.supply=$.storeget(supply);
            need2Save=true;
            if(param.supply.datatype!=supplytype){
                supplytype=param.supply.datatype;
                if(param.function=="supply")
                    param.starttype=supplytype;
                else
                    param.endtype=supplytype;
            }
            if(supplytype=="element" && consumertype=="element" && param.datatype3!="dashline" && param.state!="abstract"){
                if(supplyfn){
                    delete param.supplyfunction;
                    $.each(portalupdatedata,function(i,e){
                        if(e.datatype=="element" && e.id==supply){
                            $.each(e.functions,function(i1,e1){
                                //if(supplyfn=="6286") debugger;
                                if(supplyfn==e1.extid){
                                    e1.fntype="Предоставление сервиса";
                                    e1.consumermethod=param.consumermethod;
                                    e1.consumermethodtype=param.consumermethodtype;
                                    e1.supplyint=param.supplyint;
                                    e1.interaction=param.interaction;
                                    //if(e1.id=36563) console.log(e1);
                                    param.supplyfunction=e1;
                                    need2Save=true;
                                }
                            })
                        }
                    });
                    if(!param.supplyfunction){
                        $.addcheckcontentresult({text:"Укажите функцию поставщика потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"error"});
                    }
                    else if(param.supplyfunction.extid!=param.supplyfunction.id){
                        if(param.supplyfunction.state=="new" && param.state=="exist")
                            $.addcheckcontentresult({text:"Существующий поток" + (!$.isempty(param.number)?" №" + param.number:"") + "  использует новую функцию поставщика '" + param.supplyfunction.name +"'", view:"interface", target:param.datatype, id:param.id, type:"error"});
                        param.endfn=param.supplyfunction.id;
                        need2Save=true;
                    }
                }
                else{
                    $.addcheckcontentresult({text:"Укажите функцию поставщика потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"error"});
                    //console.log(param);
                }
            }
        }

        // Если линия исп. шаблон. Проверка на соотв типа поставщика/потребителя/зон размещения шаблону
        if(consumer && supply && param.datatype3=="template"){
            var c=param.consumer;
            var s=param.supply;
            $.getdocument({
                id:getInt(param.template),
                async:false,
                success: function(document){
                    if(document && getInt(document.id)!=0){
                        let tdata=[]
                        $.each(document.data,function(i,e){
                            tdata.push(JSON.parse(e));
                        });
                        var lc;
                        var ls;
                        tdata.filter(p=>p.datatype=="line" && p.state=="abstract" && $.hasviewpageparam(p,"interface")).forEach(line=>{
                            var lconn = $.linegetconnection(line);
                            var lc1 = tdata.find(p=>p.id==lconn.consumer && p.state=="abstract");
                            if(lc1) lc = lc1;
                            var ls1 = tdata.find(p=>p.id==lconn.supply && p.state=="abstract");
                            if(ls1) ls = ls1;
                        });
                        if(ls || lc){
                            if(lc && c.datatype!=lc.datatype)
                                $.addcheckcontentresult({text:"Тип '" + c.name + "' не соответствует шаблону №" + param.template + " '" + param.name + "'", view:"interface", target:param.datatype, id:param.id, type:"error"});
                            if(lc && c.location!=lc.location)
                                $.addcheckcontentresult({text:"Зона размещения '" + c.name + "' ('" + c.location + "') не соответствует (д.б. '" + lc.location + "') шаблону №" + param.template + " '" + param.name + "'", view:"system", target:param.datatype, id:param.id, type:"error"});
                            if(ls && s.datatype!=ls.datatype)
                                $.addcheckcontentresult({text:"Тип '" + s.name + "' не соответствует шаблону №" + param.template + " '" + param.name + "'", view:"interface", target:param.datatype, id:param.id, type:"error"});
                            if(ls && s.location!=ls.location)
                                $.addcheckcontentresult({text:"Зона размещения '" + s.name + "' ('" + s.location + "') не соответствует (д.б. '" + ls.location + "') шаблону №" + param.template + " '" + param.name + "'", view:"system", target:param.datatype, id:param.id, type:"error"});
                        }
                        else
                            $.addcheckcontentresult({text:"Невозможно проверить интеграцию по шаблону №" + param.template + " '" + param.name + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                    }
                    else
                        $.addcheckcontentresult({text:"Невозможно найти шаблон №" + param.template + " '" + param.name + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                },
                error: function (message) {
                    console.error(message);
                    $.addcheckcontentresult({text:"Невозможно прочитать шаблон №" + param.template + " '" + param.name + "'", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
                }
            });
        }

        if(consumer && supply && supplytype=="element" && consumertype=="element"){
            var intlist=linegetinterfacelist(param.number);
            if(intlist.length==0)
                $.addcheckcontentresult({text:"Для потока" + (!$.isempty(param.number)?" №" + param.number:"") + " отсутствуют интерфейсы", view:"interface", target:param.datatype, id:param.id, type:"note"});
            else{
                param = filllineintplatform(param);  
                var hassames = false;
                var hassamee = false;
                $.each(intlist,function(i1,p1){
                    hassames |= (param.startel==p1.startel || param.startel==p1.endel);
                    hassamee |= (param.endel == p1.endel || param.endel == p1.startel);
                });
                if(!(hassames && hassamee))
                    $.addcheckcontentresult({text:"Поток" + (!$.isempty(param.number)?" №" + param.number:"")  + " должен иметь интерфейс с таким же потребителем/ поставщиком", view:"interface", target:param.datatype, id:param.id, type:"recomendation"});
            }

            if(hasPortal()){
                var c=param.consumer;
                var s=param.supply;
                var list = getSystemInterfaceListA({ cid: c.sysid, sid: s.sysid, async: false });
                var isFound=false;
                if(list.length>0){
                    var sysid=0;
                    $.each(list,function(i,e){
                        var fname = e.supplyfunctionname;
                        //console.log($(e));
                        //var methodname = $(e).attr("ows__x043c__x0435__x0442__x043e__x04");
                        if(fname.toLowerCase().trim()==param.supplyfunction.name.toLowerCase().trim() && (!e.data && !param.data || e.data.length==param.data.length) /*&& (!methodname && param.consumermethod=="" || methodname && methodname.toLowerCase().trim()==param.consumermethod.toLowerCase().trim())*/){
                            let fnd = true;
                            $.each(param.data, function(di,dt){
                                //if (param.number = "1") debugger;
                                let namelc = dt.name.toLowerCase().trim();
                                fnd &= (e.data.find(item=>(item.name.toLowerCase().trim()==namelc))!=undefined);
                            });
                            if(fnd)
                                sysid= e.sysid; 
                        }
                    });
                    if(sysid>0){
                        isFound=true;
                        param.sysid=sysid;
                        need2Save=true;
                    }
                }
                if(!isFound && getInt(param.sysid)!=0){
                    param.sysid=0;
                    need2Save=true;
                }
                list=[];
            }
        }
        if(hasPortal() && getInt(param.sysid)>0){
            if(param.state=="new")
                $.addcheckcontentresult({text:"Поток " + (!$.isempty(param.number)?" №" + param.number:"") + " имеет статус '" + getStateName(param.state) + "' и присутствует на Архитектурном портале", view:"interface", target:param.datatype, id:param.id, type:"warning"});
        }
        else if(hasPortal()){
            if(param.state!="new")
                $.addcheckcontentresult({text:"Поток " + (!$.isempty(param.number)?" №" + param.number:"")  + " имеет статус '" + getStateName(param.state) + "', но отсутствует на Архитектурном портале", view:"interface", target:param.datatype, id:param.id, type:"warning"});
        }
        if(param.starttype=="element" && param.endtype=="element" && param.datatype3!="dashline" && param.state!="abstract") {
            if (param.data==undefined || param.data.length==0)
                $.addcheckcontentresult({text:"Укажите передаваемые данные потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"error"});
            else{
                $.each(param.data,function(i,dt){
                    var data=undefined;
                    $.each(portalupdatedata,function(i,e){
                        if(e.datatype=="element" /* && e.id==supply || (e.datatype=="line" && (e.function=="consumer"?e.startel:e.endel)==supply)*/){
                            $.each(e.data,function(i1,e1){
                                if(dt.name==e1.name /*&& dt.extid==dt.id*/){
                                    data=e1;
                                }
                            });
                            if(data) return false;//выходим из цикла
                        }
                    });
                    /*if(param.number=="5.2")
                        console.log(param,data);*/
                    if(!data){
                        //console.log(dt);
                        $.addcheckcontentresult({text:"Проверьте передаваемые данные '" + dt.name + "' потока" + (!$.isempty(param.number)?" №" + param.number:""), view:"interface", target:param.datatype, id:param.id, type:"error"});
                    }
                    else {
                        if(dt.id!=data.id){
                            dt.id=data.id;
                            need2Save=true;
                        }
                    }
                });
            }
        }

        if(need2Save)
            $.storeset(param);
    });

// {text:"Система отсутствует на портале",target:"element",id:"66781d2c-3ba4-42f6-b37f-9e98dd5a2923", type:"error"},
    if(!hasLegend)
        $.addcheckcontentresult({text:"Легенда отсутствует", view:"interface", type:"warning"});

    //$.addcheckcontentresult({text:"Тестовый стоппер", type:"error"});
    $.propertyset();

    $.outputsetfilter(["error","recomendation"]);
    return portalupdatedata;
}

