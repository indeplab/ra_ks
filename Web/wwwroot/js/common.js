/*function detectIEEdge() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return getFloat(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return getInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
    // Edge => return version number
    return getInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}*/
$.newguid = function () {
    return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); }));
};
$.fn.sortByTerm = function(term){
    term = term.toLowerCase();
    this.sort(function(a,b){
        if(a.name.indexOf(term)<b.name.indexOf(term)) return -1;
        if(a.name.indexOf(term)>b.name.indexOf(term)) return 1;
        return(a<b?-1:1);
    });
    return this;
}
$.fn.sortByIntProp = function(prop){
    this.sort(function(a,b){
        if(getInt(a[prop])<getInt(b[prop])) return -1;
        if(getInt(a[prop])>getInt(b[prop])) return 1;
        return 0;
    });
    return this;
}
$.fn.sortByProp = function(...arr){
    if(arr.length==0)
        return 0;
    this.sort(function(a,b){
        var result=0;
        $.each(arr, function(i,prop){
            if(result==0){
                if(a[prop]<b[prop]) result = -1;
                if(a[prop]>b[prop]) result = 1;
            }
        });
        return result;
    });
    return this;
}
$.isnull = function(val, def){
    if(val==null || val==undefined)
        return def;
    return val;
}
$.isnullorempty = function(val, def){
    if(val==null || val==undefined || val.toString()=="")
        return def;
    return val;
}
$.isempty = function(val){
    return val==null || val==undefined || val=="";
}
var getFloat = function(val,def){
    if(!def) def=0;
    if(!val)
        return def;
    var res = parseFloat(val);
    if(isNaN(res) || res==Infinity || res==-Infinity)
        return def;
    return res;
}
var getInt = function(val,def){
    if(!def) def=0;
    if(!val)
        return def;
    var res = parseInt(val);
    if(isNaN(res) || res==Infinity || res==-Infinity)
        return def;
    return res;
}
var isInt = function(val){
    if(val==undefined)
        return false;
    return parseInt(val).toString()==val.toString();
}
var getNumber = function(val,def){
    if(!def) def=0;
    var res = getInt(val,def);
    if(res<0)
        return def;
    return res;
}
var getValue = function(val,def){
    if(!def) def=0;
    return (!val?def:val);
}
var getString = function(val){
    return ((!val|| val=="undefined"?"":val.toString()));
}
var getBoolean = function(val){
    return(getInt(val)==1 || getString(val).toLowerCase()=="true")
}
let compareString = function(a,b){
    return (getString(a).trim().toLowerCase()==getString(b).trim().toLowerCase());
}
var getQueryParam = function (name) {
    var url=window.location.href;
    var parts = url.split('?');
    var query = parts[parts.length - 1];
    var res = "";
    $.each(query.split("&"), function (index, pair) {
        var ps = pair.split("=");
        if ($.trim(ps[0]) == $.trim(name)) {
            res = (ps.length > 1 ? ps[1] : "");
        }
    });
    return res;
}
$.deparam = function(param){
    if(!param) return {};
    var parts = param.split('?');
    var query = parts[parts.length - 1];
    var res = {};
    $.each(query.split("&"), function (index, pair) {
        var ps = pair.split("=");
        if(ps.length>1){
            res[ps[0]] = ps[1];
        }
    });
    return res;
}
var getFromQuery = function (url, name, value) {
    if (url == undefined)
        return "";
    var parts = url.split('?');
    var query = parts[parts.length - 1];
    var res = "";
    var resq = "";
    var isfounded = false;
    $.each(query.split("&"), function (index, pair) {
        var ps = pair.split("=");
        if ($.trim(ps[0]) == $.trim(name)) {
            isfounded = true;
            res = (ps.length > 1 ? ps[1] : "");
            pair = ps[0] + "=" + value;
        }
        resq += (resq == "" ? "" : "&") + pair;
    });
    if (value == undefined)
        return res;
    return (parts.length > 1 ? parts[0] + "?" : "") + resq + (isfounded ? "" : (parts.length > 1 ? "&" : "?") + name + "=" + value);
}
var removeFromQuery = function (url, name) {
    if (url == undefined)
        return "";
    if (name == undefined)
        return url;
    var parts = url.split('?');
    var query = parts[parts.length - 1];
    var resq = "";
    var isfounded = false;
    $.each(query.split("&"), function (index, pair) {
        var ps = pair.split("=");
        if ($.trim(ps[0]) != $.trim(name))
            resq += pair + "&";
    });
    return (parts.length > 1 ? parts[0] + "?" : "") + (resq.length > 0 ? resq.substr(0, resq.length - 1) : "");
}
var getQueryHash = function() {
    return window.location.hash.substr(1);
}
var getStateName = function (state) {
    switch (state) {
        case "new":
            return "Разработка";
        case "exist":
            return "Применение";
        case "change":
            return "Доработка";
        case "external":
            return "Внешняя";
        case "abstract":
            return "Абстракция";
    }
}
var getStateName2 = function (state) {
    switch (state) {
        case "new":
            return "Добавление";
        case "exist":
            return "Применение";
        case "change":
            return "Изменение";
        case "external":
            return "Внешняя";
        case "abstract":
            return "Абстракция";
    }
}
var getStateNameByID = function (id) {
    if(id && isInt(id) && getInt(id)>0)
        return "Обновление";
    return "Добавление";
}
var getStateColorByID = function (id) {
    if(id && isInt(id) && getInt(id)>0)
        return "change";
    return "new";
}

var getFlowtypeName = function (state) {
    switch (state) {
        case "master":
            return "Мастер-данные";
        case "copy":
            return "Копия данных";
        case "transfer":
            return "Без хранения";
        default:
            return "";
    }
}
var getComponentWeight = function(type){
    switch(type){
        case "container":
            return 1;
        case "os":
        case "dbos":
            return 2;
        case "db":
            return 3;
        case "sys":
            return 4;
        case "containerapp":
            return 5;
        case "app":
            return 6;
        default:
            return 7;
    }
}
var getComponentType=function(type){
    const typemapper = {
        os: ["Операционная система","OC"],
        dbos: ["ОС СУБД","ОС БД","ОС хранилища", "Операционная система СУБД"],
        app:["Софт прикладной","Приложение"],
        db: ["СУБД","БД","Хранилище"],
        containerapp: ["Платформа управления контейнерами"],
        container: ["Средство контейнеризации","Контейнер"],
        cos:["Клиентская операционная система","Клиентская OC"],
        sys:["Софт системный"],
        virt:["Виртуализация","Система виртуализации"],
        template:["Шаблон реализации"]
    }    
    let res="env";
    Object.keys(typemapper).map(key => {
        if(typemapper[key].find(item=>item==type)) res = key;
    });
    return res;
}
var getComponentTypeDictionaryName = function(type){
    switch(type){
        case "os":
        case "dbos":
        case "cos":
            return "Каталог ОС";
        case "sys":
            return "Каталог сред исполнения";
        case "containerapp":
            return "Каталог платформ управления контейнерами";
        case "container":
            return "Каталог средств контейнеризации";
        case "db":
            return "Каталог БД";
        case "virt":
            return "Каталог систем виртуализации";
        case "template":
            return "Шаблон реализации";
        default:
            return "Каталог сред разработки";
    }
}


var getSecuritytypeName = function (type) {
    var result;
    $.each($.securitytypedictionary(),function(i,e){
        if(e.value==type)
            result = e.description;
    });
    return result;
}
$.fn.toPointString = function(){
    var res="";
    $.each(this,function(i,e){
        if(Array.isArray(e) && e.length>1)
            res+=(res.length==0?"":",") + e[0].toString() +" " + e[1].toString();
    });
    return res;
}
$.getPointArray = function(points){
    var pointList=[];
    $.each(points.split(','),function(i,e){
        var point=e.trim().split(" ");
        if(point.length>0){
            var p=[];
            p.push(getFloat(point[0]));
            p.push(getFloat(point[1]));
            pointList.push(p);
        }
    });
    return pointList;
}
$.fn.toPathString = function(){
    var res="";
    $.each(this,function(i,e){
        if(Array.isArray(e) && e.length>1)
            res+=(i==0?"M":" L") + e[0].toString() +" " + e[1].toString();
    })
    return res;
}
var isemptyobject = function(param){
    if(!param) return true;
    return(Object.keys(param).length==0);
}
$.fn.objectArrayHasId = function(id){
    return ($(this).objectArrayGetById(id)!=undefined);
}
$.fn.objectArrayGetById = function(id){
    var has_id=undefined;
    $.each(this,function(i,e){
        if(id==e.id) has_id=e;
    });    
    return has_id;
}
$.fn.objectArrayGetByField = function(field,value){
    var res=undefined;
    $.each(this,function(i,e){
        if($(e).attr(field)==value)
            res =e;
    });
    return res;
}

$.fn.hashput = function(key,value){
    var index=-1;
    $.each(this,function(i,e){
        if(e.key==key) {e.value=value;index=i;}
    });   
    if(value==undefined || value===null) {
        if(index!=-1)
            this.splice(index, 1);
    }
    else{
        if(index!=-1)
            this[index].value=value;
        else
            this.push({key:key,value:value});
    }
    return this;    
}

var getExtention = function (file) {
    return file.substring(file.lastIndexOf('.') + 1);
}

var sign = function(a){
    if(a>=0) return 1;
    else return -1;
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(getRegExp(find), 'g'), replace);
}
function dateToString(date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
  
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
  
    var yy = date.getFullYear();

    var hh = date.getHours();
    if (hh < 10) hh = '0' + hh;

    var min = date.getMinutes();
    if (min < 10) min = '0' + min;

    var ss = date.getSeconds();
    if (ss < 10) ss = '0' + ss;
  
    return dd + '.' + mm + '.' + yy + " " + hh +":"+min+":"+ss;
  }
  function dateToShortString(date){
    return new Date(date).toLocaleString("ru-RU", {year:"numeric",month:"2-digit",day:"2-digit"});
}
  var formatDate = function (date) {
    date = new Date(date);
    var year = date.getFullYear();
    if(year<1900) return "";
    var month = date.getMonth()+1;
    var day = date.getDate();
    var ret =
        (day < 10 ? "0" : "") + day.toString() + "."
        + (month < 10 ? "0" : "") + month.toString() + "."
        + year.toString();
    return ret;
}
var getDate = function(date){
    let parts = date.split(".");
    if(parts.length==3)
        return parts[1]+"/"+parts[0]+"/"+parts[2];
    else
        return date;
}
var formatInt = function (value){
    if(value==undefined || value==0) return "";
    return value.toString();
}

/*
   Заменяем в строке спецсимволы на безопасные аналоги
 */
   function getClearedString(param = '') {
    var escapeChars = {
        '&' : 'amp',
        '\'' : '#39',
        '"' : 'quot',
        '<' : 'lt',
        '>' : 'gt'
    };

    var str = String(param).trim();

    if (str === "-" || !str) return '';

    str = replaceAll(str,/&nbsp;/i,' ');

    var regexString = '[';
    for(var key in escapeChars) {
        regexString += key;
    }
    regexString += ']';

    var regex = new RegExp(getRegExp(regexString), 'g');
    return str.replace(regex, function(m) {
        return '&' + escapeChars[m] + ';';
    });
}

function getRegExp(value){
    if(!value) return "";
    return value.replace("(","\\(").replace(")","\\)").replace("[","\\[").replace("]","\\]");
}

function getEscaped(value){
    if(value==undefined)
        return "";
    value = replaceAll(value.toString(),"\"","“");
    value = replaceAll(value.toString(),"&","&amp;");
    value = replaceAll(value.toString(),"<","&lt;");
    value = replaceAll(value.toString(),">","&gt;");
    value = replaceAll(value.toString(),"'","&apos;");
    return value;
}
function getUnescaped(value){
    if(value==undefined)
        return "";
    //value = replaceAll(value.toString(),"\"","&quot;");
    value = replaceAll(value.toString(),"&nbsp;","&#xA0;");
    return value;
}
/*
   Восстанавливаем в строке спецсимволы
 */
   function restoreHTMLEntries(str = '') {
    var htmlEntities = {
        nbsp: ' ',
        amp: '&',
        quot: '"',
        apos: '\'',
        '#39': '\'',
        lt:'<',
        gt:'>'

    };
    if(!str || str==null)
        return "";
    return str.replace(/\&([^;]+);/g, function (entity, entityCode) {
        var match;

        if (entityCode in htmlEntities) {
            return htmlEntities[entityCode];
        } else if (match === entityCode.match(/^#x([\da-fA-F]+)$/)) {
            return String.fromCharCode(parseInt(match[1], 16));
        } else if (match === entityCode.match(/^#(\d+)$/)) {
            return String.fromCharCode(~~match[1]);
        } else {
            return entity;
        }
    });
}

/* Убираем < > */
function removeBrackets(str = '') {
    return replaceAll(str,/(\<|\>)/gm,'');
}

function encodeBrackets(str = '', ) {
    str = replaceAll(str.toString(),"<","&lt;")
    return replaceAll(str.toString(),">","&gt;");
}

/*
    Заменяем &quot; на /"
 */
function replaceDoubleQuoteEntity (str = '') {
    return str.toString().replace(/\&quot;/g, '\\"');
}
/*
  Ищем элемент по JSON документа
 */
function findElementIdInDocument(element, documentJSON, depth = 1) {

    function search(obj, id, predicate, depth = 1) {
        let result = [];

        if (predicate(obj))
            result.push(id);

        // check obj props
        for (let p in obj) {
            if (typeof (obj[p]) === 'object' && depth > 0) {
                result = result.concat(search(obj[p], p, predicate, depth - 1));
            }
        }

        return result;
    };

    return search(documentJSON, null, function (obj) {
        return obj.datatype === element.datatype
            && obj.sysid === element.sysid
            && obj.name === element.name
    }, depth).pop();
}

/*
  Подготавливаем финальный массив элементов на основании 2х документов
 */
function makeFinalArray(firstArray = [], secondArray = []) {
    var finalArray = [],
        workArray = JSON.parse(JSON.stringify(secondArray)),
        firstArrayClone = JSON.parse(JSON.stringify(firstArray));

    firstArrayClone.map((el, id) => {
        var foundId = findElementIdInDocument(el, workArray);

        if (foundId) {
            var current = firstArrayClone[id];

            if (el.functions) {
                el.functions = makeFinalArray(current.functions, workArray[foundId].functions);
            }

            if (el.data) {
                el.data = makeFinalArray(current.data, workArray[foundId].data);
            }

            finalArray.push({
                ...el,
                compareStatus: compareTwoElements(el, workArray[foundId]),
            });
            workArray.splice(foundId, 1);
        } else {
            finalArray.push({
                ...el,
                compareStatus: ELEMENT_COMPARE_STATUS.DELETED,
            });
        }
    });

    return finalArray.concat(workArray.map(el => ({...el, compareStatus: ELEMENT_COMPARE_STATUS.NEW})));
}

/*
  Сравниваем 2 элемента с учетом типа
 */
function compareTwoElements(first = {}, second = {}) {
    var propKeys = [];

    switch (first.datatype) {
        case "element":
            propKeys = [
                "label", "value", "sysid", "name", "type", "description", "location", "state"
            ];
            break;
        case "picture":
            propKeys = [
                "src", "name", "sysid"
            ];
            break;
        case "line":
            propKeys = [
                "src", "name", "sysid", "function", "initel", "sysid", "name", "state", "supplyint", "consumerint",
                "consumermethod", "intplatform", "interaction", "datatype", "id", "number", "endel", "endfn", "enddx",
                "enddy", "endtype", "startel", "startfn", "startdx", "startdy"
            ];
            break;
        default:
            return JSON.stringify(first) === JSON.stringify(second) ? ELEMENT_COMPARE_STATUS.SAME : ELEMENT_COMPARE_STATUS.NEW;
    }

    propKeys.forEach(key => {
        if (first[key] !== second[key]) {
            return ELEMENT_COMPARE_STATUS.NEW;
        }
    });

    return ELEMENT_COMPARE_STATUS.SAME;
}

/*
  Проверяем существует ли элемент с указанным id
 */
function checkIfLineRelatedObjectExist(params = {}) {
    if (!params.id) return '';

    var result = '';

    if ($(`#${params.startel}`).length !== 1)
        result = params.startel;

    if ($(`#${params.endel}`).length !== 1)
        result = params.endel;

    return result;
}

/*
 Глубокая проверка JSON на изменения
 */
function deepCompare(arg1, arg2) {
    if (Object.prototype.toString.call(arg1) === Object.prototype.toString.call(arg2)) {
        if (Object.prototype.toString.call(arg1) === '[object Object]' || Object.prototype.toString.call(arg1) === '[object Array]' ) {
            if (Object.keys(arg1).length !== Object.keys(arg2).length ) {
                return false;
            }
            return (Object.keys(arg1).every(function(key){
                return deepCompare(arg1[key], arg2[key]);
            }));
        }
        return (arg1 === arg2);
    }
    return false;
}
var isStringContain = function(value,term){
    if(value && term)
        return value.toString().toLowerCase().trim().indexOf(term.toString().toLowerCase().trim())!=-1;
    return false;
}
$.fn.setSystemMetric = function(action){
    switch(action){
        case "mc":
            $(this).find("input[data-type='value'][data-name='Приоритетность восстановления']").val("MC");
            $(this).find("input[data-type='value'][data-name='Время восстановления']").val("RC1");
            $(this).find("input[data-type='value'][data-name='Режим функционирования']").val("24x7+");
            $(this).find("input[data-type='value'][data-name='Жизненный цикл']").val("PER");
            $(this).find("input[data-type='value'][data-name='Оборудование и система']").val("FC");
            $(this).find("input[data-type='value'][data-name='Уровень мониторинга']").val("TM");
            $(this).find("input[data-type='value'][data-name='Категории пользователей']").val("NCI");
            $(this).find("input[data-type='value'][data-name='Тип обработки отказов']").val("DT");
            $(this).find("input[data-type='value'][data-name='Тип развертывания']").val("IS");
            $(this).find("input[data-type='value'][data-name='Тип масштабирования']").val("VM");
        break;
        case "bc":
            $(this).find("input[data-type='value'][data-name='Приоритетность восстановления']").val("BC");
            $(this).find("input[data-type='value'][data-name='Время восстановления']").val("RC2");
            $(this).find("input[data-type='value'][data-name='Режим функционирования']").val("24x7");
            $(this).find("input[data-type='value'][data-name='Жизненный цикл']").val("PER");
            $(this).find("input[data-type='value'][data-name='Оборудование и система']").val("FC");
            $(this).find("input[data-type='value'][data-name='Уровень мониторинга']").val("TM");
            $(this).find("input[data-type='value'][data-name='Категории пользователей']").val("NCI");
            $(this).find("input[data-type='value'][data-name='Тип обработки отказов']").val("DR");
            $(this).find("input[data-type='value'][data-name='Тип развертывания']").val("IS");
            $(this).find("input[data-type='value'][data-name='Тип масштабирования']").val("VM");
        break;
        case "bo":
            $(this).find("input[data-type='value'][data-name='Приоритетность восстановления']").val("BO");
            $(this).find("input[data-type='value'][data-name='Время восстановления']").val("RC3");
            $(this).find("input[data-type='value'][data-name='Режим функционирования']").val("EXT8x5");
            $(this).find("input[data-type='value'][data-name='Жизненный цикл']").val("PER");
            $(this).find("input[data-type='value'][data-name='Оборудование и система']").val("FC");
            $(this).find("input[data-type='value'][data-name='Уровень мониторинга']").val("FM");
            $(this).find("input[data-type='value'][data-name='Категории пользователей']").val("NCI");
            $(this).find("input[data-type='value'][data-name='Тип обработки отказов']").val("HA");
            $(this).find("input[data-type='value'][data-name='Тип развертывания']").val("IS");
            $(this).find("input[data-type='value'][data-name='Тип масштабирования']").val("VM");
        break;
        case "op":
            $(this).find("input[data-type='value'][data-name='Приоритетность восстановления']").val("OP");
            $(this).find("input[data-type='value'][data-name='Время восстановления']").val("RC4");
            $(this).find("input[data-type='value'][data-name='Режим функционирования']").val("8x5");
            $(this).find("input[data-type='value'][data-name='Жизненный цикл']").val("PER");
            $(this).find("input[data-type='value'][data-name='Оборудование и система']").val("FC");
            $(this).find("input[data-type='value'][data-name='Уровень мониторинга']").val("NM");
            $(this).find("input[data-type='value'][data-name='Категории пользователей']").val("NCI");
            $(this).find("input[data-type='value'][data-name='Тип обработки отказов']").val("NA");
            $(this).find("input[data-type='value'][data-name='Тип развертывания']").val("IS");
            $(this).find("input[data-type='value'][data-name='Тип масштабирования']").val("VM");
        break;
    }
}
