var docfolder="https://sfera/departments/sga/ru/Documents/";
var otarfolder="https://sfera/departments/sga/ru/SGA_documents/OTAR/";

let getFormattedName = function(options){
    let res=[];
    if(options){
        let p = options.doc;
        res = [
            getDocumentTypeName(),
            options.pref,
            p.project?p.project + ".":undefined,
            p.name,
            options.suff,
            p.version && p.version!=""? "v"+ p.version:undefined, 
            options.ext
        ];
    }
    return res.filter(n=>n).join(" ").replace('/','_').replace(',',' ');
}
$.fn.otar1 = function(options){
    var place = this;
    $("#wait").show();
    $(place).word({
        version:1,
        success: function(content){
            saveAs(content, getFormattedName({
                doc:$(place).documentget(),
                ext:".docx"
            }));
            $("#wait").hide();
        }
    });
}
$.fn.otar2 = function (options) {
    var place = this;
    $("#wait").show();
    $(place).word({
        version: 2,
        success: function (content) {
            saveAs(content, getFormattedName({
                doc:$(place).documentget(),
                ext:".docx"
            }));
            $("#wait").hide();
        }
    });
}
$.fn.otar3 = function (options) {
    var place = this;
    $("#wait").show();
    $(place).word({
        version: 3,
        success: function (content) {
            saveAs(content, getFormattedName({
                doc:$(place).documentget(),
                ext:".docx"
            }));
            $("#wait").hide();
        }
    });
}
$.fn.otar2schema = function(viewlist){
    var place = this;
    $("#wait").show();
    $(place).visio({
        viewlist:viewlist,
        success: function(content){
            var p = $(place).documentget();
            var name = "";
            $.each(viewlist,function(i,e){
                var n = getPageMenuName(e.id);
                if(name.indexOf(n+", ")==-1)
                    name+=(name!=""?", ":"") + n;
            });
            //name = "Схема " + name + (p.type && p.type!=""? " "+ p.type:"") +  (p.version && p.version!=""? " v"+ p.version:"") + ".vsdx";
            //name = (p.type?p.type+" ":"") + (p.project?p.project + ". ":"") + p.name + " " + name + (p.version && p.version!=""? " v"+ p.version:"") + ".vsdx";
            saveAs(content, getFormattedName({
                doc:$(place).documentget(),
                suff: name,
                ext:".vsdx"
            }));
            $("#wait").hide();
        }
    });
}
$.fn.saveSchema = async function(options){
    var place = this;
    var doc = undefined;
    if(options.viewlist){
        for(var i in options.viewlist){
            doc = await $(place).conceptview(doc,options.viewlist[i].id,options.viewlist[i].name);
        }
    }
    else
        doc = await $(place).conceptview(undefined,options.type,options.title);
    if(doc){
        let stream = doc.pipe(blobStream());
        stream.on('finish', function() {
            let blob = stream.toBlob('application/pdf');

            var reader= new FileReader();
            reader.onload=function(event){
                var data=event.target.result.replace("data:application/pdf;base64,","");
                if(saveSPFileItem(otarfolder,options.name,data)){
                    var catid=getSPListID("Каталог документов",'<Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">' + options.name + '</Value></Eq></Where></Query>');
                    var commands = "<Method ID='1' Cmd='" + (catid ? "Update" : "New") + "'><Field Name='ID'>" + (catid ? catid : "New") + "</Field>";
                    commands += "<Field Name='Title'>" + options.name + "</Field>";
                    commands += "<Field Name='_x0438__x043c__x044f_'>" + options.name + "</Field>";
                    commands += "<Field Name='_x0434__x043e__x043a__x0443__x04'>" + otarfolder+options.name + "</Field>";
                    commands += "<Field Name='ID_x0020__x0437__x0430__x0434__x'>" + (options.task && options.task!=""?options.task:"0") + "</Field>"; // номер задачи
                    commands+="</Method>";
                    var res = setSPListValues("Каталог документов",commands);
                    if(res.length>0)
                        catid=res[0].id;
        
                    commands="";
                    $.each(options.list,function(i,e){
                        var cid=getSPListID("Каталог схем АС",'<Query><Where><And><Eq><FieldRef Name="Title"/><Value Type="Text">' + options.name + '</Value></Eq><Eq><FieldRef Name="_x0410__x0421_" LookupId="True"/><Value Type="Lookup">' + e.id + '</Value></Eq></And></Where></Query>');
                        commands += "<Method ID='" + i+1 + "' Cmd='" + (cid ? "Update" : "New") + "'><Field Name='ID'>" + (cid ? cid : "New") + "</Field>";
                        commands += "<Field Name='Title'>" + options.name + "</Field>";
                        commands += "<Field Name='_x0410__x0421_'>" + e.id + ";#" + e.name + "</Field>";
                        commands += "<Field Name='_x0441__x0441__x044b__x043b__x04'>" + otarfolder+options.name + "</Field>";
                        commands += "<Field Name='_x0422__x0438__x043f__x0020__x04'>" + getPageMenuFullName(options.type) + "</Field>"; // тип документа
                        commands += "</Method>";
        
                    });
                    if(commands!="")
                        setSPListValues("Каталог схем АС",commands);
                    if (options && typeof options.success == "function") options.success();
                }
            }
            reader.readAsDataURL(blob);
        });
        doc.end();
    }
    else
        if (options && typeof options.error == "function") options.error();
}
$.fn.schema = async function(options){
    var place = this;
    //$("#wait").show();
    var currentmenu = $.pagemenu();
    var p = $(place).documentget();

    var menu=$("div.left-menu-row.down > [data-type]:not([data-type='switch']), div.left-menu-row.down > [data-menu]");
    for(var i=0;i<menu.length;i++){
        var e=menu[i];
        var type=($(e).attr("data-type")??$(e).attr("data-menu"));
        var viewlist=[];
        if(type=="business"){
            $(e).find("a[data-type]").each(function(i1,e1){
                viewlist.push({
                    id:$(e1).attr("data-type"),
                    name:$(e1).attr("title")
                })
            })
        }
        if(type=="interface" || type=="system" || (type=="business" && viewlist.length>0)){
            await new Promise(resolve => {
                $(place).saveSchema({
                    viewlist:viewlist.length>0?viewlist:undefined,
                    type:type,
                    title:$(e).attr("title"),
                    //name:(options.task && options.task!=""?options.task + "_":"") + (p.type && p.type!=""? p.type + " ":"") + (p.project?p.project + ". ":"") + p.name.replace('/','_').replace(',',' ') + (p.name!=""?" ":"") + getPageMenuName(type) + (p.version && p.version!=""? " v"+ p.version:"") + ".pdf",
                    name: getFormattedName({
                        pref: (options.task && options.task!=""?options.task + "_":""),
                        doc:$(place).documentget(),
                        suff: getPageMenuName(type),
                        ext:".pdf"
                    }),
                    task:options.task,
                    list:options.list,
                    success:function(){
                        resolve();
                    },
                    error:function(){
                        resolve();
                    }
                });
            });
        }
    }
    if(currentmenu!=$.pagemenu());
        $.pagemenu(currentmenu);
    //$("#wait").hide();
    //alert("Формирование схем завершено");
}
$.otardoc = async function(options){
    var otarlink;
    var nonotarlink;
    for(var i=0;i<options.filelist.files.length;i++){
        var file = options.filelist.files[i];
        var result = await new Promise(resolve => {
            var reader= new FileReader();
            reader.onload=function(event){
                var otarfile;
                var filelink;
                var data=event.target.result.substring(event.target.result.indexOf(";base64,")+8);
                //копируем файлы в документы проекта
                if($("#createdoc_folder").val()!=""){
                    var filename = (options.task && options.task!="" && options.task!="0"?options.task + "_":"")+file.name;
                    filelink=docfolder + $("#createdoc_folder").val() + "/" + filename;
                    if(saveSPFileItem(docfolder + $("#createdoc_folder").val() + "/",filename,data)){
                        if(options.otar==file.name){
                            otarfile=filelink;
                            var docid = getSPListID("Documents",'<Query><Where><Eq><FieldRef Name="LinkFilename"/><Value Type="Text">' + filename + '</Value></Eq></Where></Query>',"<QueryOptions><Folder>Documents/" + $("#createdoc_folder").val() + "</Folder></QueryOptions>");
                            if(docid){
                                var commands = "<Method ID='1' Cmd='Update'><Field Name='ID'>" + docid + "</Field>";
                                commands += "<Field Name='Title'>" + options.title + "</Field>";
                                commands += "<Field Name='_x0422__x0438__x043f__x0020__x0434__x043e__x043a__x0443__x043c__x0435__x043d__x0442__x0430_'>" + options.type + "</Field>";
                                commands += "<Field Name='_x0421__x0442__x0430__x0442__x0443__x0441__x0020__x0434__x043e__x043a__x0443__x043c__x0435__x043d__x0442__x0430_'>" + options.state + "</Field>";
                                commands += "<Field Name='_x0410__x0421_0'>" + options.sysid + ";#" + options.sysname + "</Field>"; 
                                commands += "<Field Name='_x041a__x0435__x043c__x0020__x0441__x043e__x0437__x0434__x0430__x043d__x043e_0'>" + $.currentuser().name + "</Field>";
                                commands += "<Field Name='_x041e__x0442__x0432__x0435__x0442__x0441__x0442__x0432__x0435__x043d__x043d__x044b__x0439__x0020__x043e__x0442__x0020__x0421__x0413__x0410_'>" + $.currentuser().id + ";#" + $.currentuser().name + "</Field>"; 
                                commands += "<Field Name='_x041f__x0440__x043e__x0435__x043a__x0442__x002f__x0417__x0430__x0434__x0430__x0447__x0430_'>" + options.project + "</Field>";
                                commands+="</Method>";
                                setSPListValues("Documents",commands);
                                /*if(options.otar==filename) {
                                    Документы проектов/Платежи/Подписки и уведомления о начислениях
                                    var linksystemcommand="";
                                    $.each(sysList,function(i,e){
                                        var lsid=getSPListID("Связь АС с документами",'<Query><Where><And><Eq><FieldRef Name="_x0410__x0421_" LookupId="True"/><Value Type="Lookup">' + e.id + '</Value></Eq><Eq><FieldRef Name="_x0414__x043e__x043a__x0443__x04" LookupId="True"/><Value Type="Lookup">' + docid + '</Value></Eq></And></Where></Query>');
                                        linksystemcommand += "<Method ID='" + i+1 + "' Cmd='" + (lsid ? "Update" : "New") + "'><Field Name='ID'>" + (lsid ? lsid : "New") + "</Field>";
                                        linksystemcommand += "<Field Name='Title'>" + options.title + "</Field>";
                                        linksystemcommand += "<Field Name='_x0410__x0421_'>" + e.id + ";#" + e.name + "</Field>";
                                        linksystemcommand += "<Field Name='_x0414__x043e__x043a__x0443__x04'>" + docid + ";#" + options.title + "</Field>";
                                        linksystemcommand += "<Field Name='_x0421__x0442__x0430__x0442__x04'>" + e.statename + "</Field>"; 
                                        linksystemcommand += "</Method>";
                                    });
                                    if(linksystemcommand!="")
                                        setSPListValues("Связь АС с документами",linksystemcommand);
                                }*/
                            }
                            else
                                alert("Ошибка установки свойств документа '" + filename + "'");
                        }
                    }
                }
                //копируем ОТАР в каталог документов и обновляем ссылки
                /*
                if(options.needlink && options.otar==file.name) {
                    // 2 kill формируем номер
                    var filename = (options.task && options.task!=""?options.task + "_":"")+file.name;
                    if(saveSPFileItem(otarfolder,filename,data)){
                        var catid=getSPListID("Каталог документов",'<Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">' + filename + '</Value></Eq></Where></Query>');
                        var commands = "<Method ID='1' Cmd='" + (catid ? "Update" : "New") + "'><Field Name='ID'>" + (catid ? catid : "New") + "</Field>";
                        commands += "<Field Name='Title'>" + filename + "</Field>";
                        commands += "<Field Name='_x0438__x043c__x044f_'>" + filename + "</Field>";
                        commands += "<Field Name='_x0434__x043e__x043a__x0443__x04'>" + otarfolder+filename + "</Field>";
                        commands += "<Field Name='ID_x0020__x0437__x0430__x0434__x'>" + (options.task && options.task!=""?options.task:"0") + "</Field>"; // номер задачи
                        commands+="</Method>";
                        var res = setSPListValues("Каталог документов",commands);
                        if(res.length>0)
                            catid=res[0].id;

                        var elementcommands="";
                        var functioncommands="";
                        var datacommands="";
                        var linecommands="";
                        var elementcnt=1;
                        var functioncnt=1;
                        var datacnt=1;
                        var linecnt=1;
                        $.each($.storekeys(), function (i, id) {
                            var param = $.storeget(id);
                        //$.each(sysList,function(i,e){
                            //var param = $.storeget(e.guids.split(',')[0]);
                            if(param.sysid && getInt(param.sysid)!=0){
                                switch(param.datatype){
                                    case "element":
                                        elementcommands += "<Method ID='" + elementcnt++ + "' Cmd='Update'><Field Name='ID'>" + param.sysid + "</Field>";
                                        elementcommands += "<Field Name='_x041e__x0422__x0410__x0420_'>" + catid+";#"+filename + "</Field>";
                                        elementcommands += "</Method>";
                                        $.each(param.functions,function(fi,fn){
                                            if(isInt(fn.id)){
                                                functioncommands += "<Method ID='" + functioncnt++ + "' Cmd='Update'><Field Name='ID'>" + fn.id + "</Field>";
                                                functioncommands += "<Field Name='_x041e__x0422__x0410__x0420_'>" + catid+";#"+filename + "</Field>";
                                                functioncommands += "</Method>";

                                            }
                                        });
                                        $.each(param.data,function(di,dn){
                                            if(isInt(dn.id)){
                                                datacommands += "<Method ID='" + datacnt++ + "' Cmd='Update'><Field Name='ID'>" + dn.id + "</Field>";
                                                datacommands += "<Field Name='_x041e__x0422__x0410__x0420_'>" + catid+";#"+filename + "</Field>";
                                                datacommands += "</Method>";

                                            }
                                        });
                                        break;
                                    case "line":
                                        if(param.starttype=="element" && param.endtype=="element"){
                                            linecommands += "<Method ID='" + linecnt++ + "' Cmd='Update'><Field Name='ID'>" + param.sysid + "</Field>";
                                            linecommands += "<Field Name='_x041e__x0422__x0410__x0420_'>" + catid+";#"+filename + "</Field>";
                                            linecommands += "</Method>";
                                        }
                                        break;
                                }
                            }
                        });
                        if(elementcommands!="")
                            setSPListValues("Каталог АС",elementcommands);
                        if(functioncommands!="")
                            setSPListValues("Каталог функций АС",functioncommands);
                        if(datacommands!="")
                            setSPListValues("Каталог сущностей",datacommands);
                        if(linecommands!="")
                            setSPListValues("Каталог потоков данных",linecommands);
                    }
                }*/
                resolve({
                    file:otarfile??filelink,
                    type:otarfile?"ОТАР":undefined
                });
            }
            reader.readAsDataURL(file);       
        });
        if(result.type)
            otarlink=result.file;
        nonotarlink=result.file;
    }
    return (otarlink??nonotarlink);
}
var copyotardoc = async function(options){
    let response = await new Promise(resolve => {
        var file=undefined;
        var reader= new FileReader();
        reader.onload=function(event){
            var data=event.target.result.substring(event.target.result.indexOf(";base64,")+8);
            //копируем ОТАР в каталог документов и обновляем ссылки
            // 2 kill формируем номер
            var filename = (options.task && options.task!=""?options.task + "_":"") + options.otar.name;
            if(saveSPFileItem(otarfolder,filename,data)){
                var catid=getSPListID("Каталог документов",'<Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">' + filename + '</Value></Eq></Where></Query>');
                var commands = "<Method ID='1' Cmd='" + (catid ? "Update" : "New") + "'><Field Name='ID'>" + (catid ? catid : "New") + "</Field>";
                commands += "<Field Name='Title'>" + filename + "</Field>";
                commands += "<Field Name='_x0438__x043c__x044f_'>" + filename + "</Field>";
                commands += "<Field Name='_x0434__x043e__x043a__x0443__x04'>" + otarfolder+filename + "</Field>";
                commands += "<Field Name='ID_x0020__x0437__x0430__x0434__x'>" + (options.task && options.task!=""?options.task:"0") + "</Field>"; // номер задачи
                commands+="</Method>";
                var res = setSPListValues("Каталог документов",commands);
                if(res.length>0)
                    file=res[0].id+";#"+filename;
            }
            resolve(file);
        }
        reader.readAsDataURL(options.otar);       
    });
    return response;
}

$.fn.concept = async function(viewlist){
    var place = this;
    $("#wait").show();
    var currentmenu = $.pagemenu();
    var doc = undefined;
    
    for(var i in viewlist){
        doc = await $(place).conceptview(doc,viewlist[i].id,viewlist[i].name);
    }
    
    if(currentmenu!=$.pagemenu());
        $.pagemenu(currentmenu);
    if(doc){
        let stream = doc.pipe(blobStream());
        stream.on('finish', function() {
            let blob = stream.toBlob('application/pdf');
            //var p = $(place).documentget();
            //var name = (p.type?p.type+" ":"") + (p.project?p.project + ". ":"") + p.name + (p.version && p.version!=""? " v"+ p.version:"") + ".pdf";
            saveAs(blob,getFormattedName({
                doc:$(place).documentget(),
                ext:".pdf"
            }));
        });
        doc.end();
    }
    $("#wait").hide();
}
 $.fn.conceptview  = async function(doc,pagemenu,pagemenuname){
    var place = this;
    var imageType="image/png";
    if(pagemenu!=$.pagemenu()){
        $.pagemenu(pagemenu);
    }
    /*if(!doc)
        doc = new PDFDocument({compress: false}); // It's easier to find bugs with uncompressed files
    else
        doc.addPage();*/


    let response = await new Promise(resolve => {
        $(place).getImage({
            imageType:imageType,
            zoom:1.5,
            outputtype:"dataurl",
            success:function(imginfodata,imginfosize){
                var orientation = (imginfosize.maxX-imginfosize.minX)>(imginfosize.maxY-imginfosize.minY)?'landscape':'portrait';
                var a4dy=28;
                var a4dx=28;
                var a4h=842-2*a4dy;
                var a4w=595-2*a4dx;
                /*if(!doc){
                    doc = new jsPDF({
                        orientation: orientation,
                        unit: 'pt',
                        format: 'a4'
                    });
                }
                else
                    doc.addPage("a4",orientation);*/
                if(!doc)
                    doc = new PDFDocument({
                        compress: false, 
                        size: 'A4',
                        layout:orientation
                    });
                else
                    doc.addPage({
                        size: 'A4',
                        layout:orientation
                    });
                            
                var zoom = 2;
                var tw=(orientation=="landscape"?800:500);
                var th=a4dy;
                var canvas = document.querySelector("canvas");
                $(canvas).attr({
                    width:tw*zoom,
                    height:th*zoom
                });
                var context = canvas.getContext("2d"); 
                context.fillStyle="white";
                context.fillRect(0,0,tw*zoom,th*zoom);
                context.fillStyle="black";
                context.strokeStyle = "black";
                context.font = "24pt Arial";
                context.fillText(pagemenuname, 0, 24);
                var textdata = canvas.toDataURL(imageType)
                doc.image(textdata, a4dx, a4dy, {width:tw, heigth:th});

                var zoom=Math.max((imginfosize.maxY-imginfosize.minY)/(orientation=="portrait"?a4h-1.5*a4dy:a4w-1.5*a4dx),(imginfosize.maxX-imginfosize.minX)/(orientation=="portrait"?a4w-a4dx:a4h-a4dy));
                doc.image(imginfodata, a4dx, 2.5*a4dy,{width: (imginfosize.maxX-imginfosize.minX)/zoom, heigth:(imginfosize.maxY-imginfosize.minY)/zoom});
                resolve(doc);
            },
            error:function(message){
                console.log(message);
                alert(message);
                resolve(doc);
            }
        });
    });
    return response;
}

$.fn.jiratask = function(){
    var place = this;
    var params = $(place).gettables();
    return ($(params.developtable2).toHtmlTable({
        class:"MsoNormalTable",
        border:1
    }));
}
$.fn.image = function(options){
    var place = this;
    var imageType="image/png";
    $(place).getImage({
        imageType:imageType,
        outputtype:"blob",
        zoom:1,
        success:function(blob,size){
            //var p = $(place).documentget();
            //var name = (p.type?p.type+" ":"") + (p.project?p.project + ". ":"") + p.name + " " + getPageMenuName() + (p.version && p.version!=""? " v"+ p.version:"") + ".png";
            saveAs(blob,getFormattedName({
                doc:$(place).documentget(),
                suff: getPageMenuName(),
                ext:".png"
            }));
        },
        error:function(message){
            console.log(message);
            alert(message);
        }
    });
}
$.fn.plantuml = function(options){
    var place = this;
    let getgraph = function(start, biz, pu, dict){
        let i=0;
        //console.log(start.name);
        biz.filter(l=>l.datatype=="line" && (l.endel==start.id && l.starttype!="data" && l.starttype!="linedata" || l.startel==start.id && l.endtype!="data" && l.endtype!="linedata")).sort(function(a,b){
                return (a.endtype=="picture" || a.starttype=="picture")? -1:1;
            }
        ).forEach(e=>{
            let d = $.linegetdirection(e);
            if(start.id==d.start){
                let sel = biz.find(e=>e.id==start.container);
                let end = biz.find(e=>e.id==d.end);
                if(end.datatype=="picture"){
                    pu.push(dict.mapper[sel.name] + " -> " + dict.mapper[end.name] + " : \"" + start.name + "\"");
                }
                else{
                    let sel = biz.find(e=>e.id==start.container);
                    let end = biz.find(e=>e.id==d.end);
                    let eel = biz.find(e=>e.id==end.container);
                    if(sel && eel){
                        if(start.datatype=="xor-process" || start.datatype=="or-process" || start.datatype=="and-process"){
                            pu.push((i==0?"alt":"else") + " \"" + e.number + "\"");
                            //pu.push(dict.mapper[sel.name] + " -> " + dict.mapper[eel.name] + " : \"" + start.name + "\"");
                        }
                        else if(start.datatype!="start-process" && start.datatype!="end-process"){
                            let ld=[];
                            if(e.data && e.data.length>0){
                                e.data.forEach(e=>{
                                    ld.push("\"" + e.name + "\"");
                                });
                            }
                            //if(start.name=="Проверка истории платежей и кредитного рейтинга") debugger;
                            if(!biz.find(l=>l.datatype=="line" && (l.endel==start.id || l.startel==start.id) && (l.endtype=="picture" || l.starttype=="picture")))
                                pu.push(dict.mapper[sel.name] + " -> " + dict.mapper[eel.name] + " : \"" + start.name  + "\"" + (ld.length>0?" (" + ld.join(",")  +")":"") );
                        }
                    }
                    i++;
                }
                pu = getgraph(end, biz,pu,dict);
            }
            if(start.id==d.end){
                let sel = biz.find(e=>e.id==start.container);
                let end = biz.find(e=>e.id==d.start);
                if(end.datatype=="picture"){
                    pu.push(dict.mapper[sel.name] + " <- " + dict.mapper[end.name] + " : \"" + start.name + "\"");
                }
            }
        });
        if(start.datatype=="xor-process" || start.datatype=="or-process" || start.datatype=="and-process")
            pu.push("end");
        return pu;
    }

    if($.pagemenuname()!="business"){
        alert("Экспорт доступен только для функциональных моделей");
        return;
    }

    let vp = $.pagemenu();
    let biz=[];
    let pu=["@startuml"];
    let dict={
        element:{id:0,name:"participant"},
        picture:{id:0,name:"actor"},
        mapper:{}
    }
    $.each($.storekeys(),function(i,id){
        var p = $.storeget(id);
        if($.hasviewpageparam(p,vp) && p.datatype!="document"){
            var pv = $.getviewpageparam(p,vp);
            biz.push($.extend(p,{direction:pv.direction}))
        }
    });
    //console.log(biz);
    //let lines = biz.filter(l=>l.datatype=="line" && $.linegetdirection(l, l.direction).end=="78e379d4-be9f-4168-af09-ae0e43a76086");
    //console.log(lines);
    biz.forEach(e=>{
        if((e.datatype=="element" || e.datatype=="picture") && !(e.name in dict.mapper)){
            let val = e.datatype + (++dict[e.datatype].id).toString();
            dict.mapper[e.name] = val;
            pu.push(dict[e.datatype].name + " " + "\"" + e.name + "\" as " + val );
        }
    });
    biz.forEach(e=>{
        if(e.datatype!="line" && e.datatype!="element" && e.datatype!="picture"){
            let lines = biz.filter(l=>l.datatype=="line" && $.linegetdirection(l).end==e.id);
            if(!lines || lines.length==0)
                pu = getgraph(e,biz,pu,dict);
        }
    });
    pu.push("@enduml");
    /*pu.forEach(e=>{
        console.log(e);
    });*/
    //var p = $(place).documentget();
    var blob = new Blob([pu.join("\n")], {
        type: "text/plain;charset=utf-8"
    });
    //var name = (p.type?p.type+" ":"") + (p.project?p.project + ". ":"") + p.name + " " + getPageMenuName() + (p.version && p.version!=""? " v"+ p.version:"") + ".pu";
    saveAs(blob,getFormattedName({
        doc:$(place).documentget(),
        suff: getPageMenuName(),
        ext:".pu"
    }));
}
$.getstatustable = function(data){
    var zonetable = $.table();
    var elementtable = $.table();
    var linetable = $.table();
    var hasLineCaption=false;
    var hasElementCaption=false;
    var hasZoneCaption=false;

    $.each($(data.filter(item=>item.datatype=="line")).sort(function(a,b){
        return (a.number??"").toString()<(b.number??"").toString()?-1:1; 
    }),function(i,param){
        if(param.starttype=="element" && param.endtype=="element" && param.datatype3!="dashline" && $.hasviewpageparam(param,"interface")){
            if(!hasLineCaption){
                $(linetable).appendTableRow([
                    {colspan:11, text:"Каталог потоков данных", style:"text-decoration:underline;font-size:120%;border:0"}
                ]);
                $(linetable).appendTableRow([
                    {colspan:2, text:"Сервис", style:"background-color:#f3f3f3;"},
                    {text:"Тип взаимодействия", style:"background-color:#f3f3f3"},
                    {text:"Потребитель", style:"background-color:#f3f3f3"},
                    {text:"Подключение потребителя", style:"background-color:#f3f3f3"},
                    {text:"Интеграционная платформа", style:"background-color:#f3f3f3"},
                    {text:"Подключение поставщика", style:"background-color:#f3f3f3"},
                    {text:"Метод поставщика", style:"background-color:#f3f3f3"},
                    {text:"Поставщик", style:"background-color:#f3f3f3"},
                    {text:"Объект данных", style:"background-color:#f3f3f3"},
                    {text:"Статус интерфейса", style:"background-color:#f3f3f3"}
                ]);
                hasLineCaption=true;
            }
            if(param.data){
                $.each(param.data,function(i,e){
                    e.style="color:var(--"+getStateColorByID(e.id)+"-color)"
                });
            }
            $(linetable).appendTableRow([
                {type:"checkbox","data-id":param.id,"data-state":getStateColorByID(param.sysid)},
                {text:(param.number?param.number + ". ":"") + param.supplyfunction.name,style:"color:var(--"+getStateColorByID(param.supplyfunction.id)+"-color)"},
                {text:param.interaction},
                {text:param.consumer.name},
                {text:param.consumerint},
                {text:param.intplatform},
                {text:param.supplyfunction.supplyint},
                {text:param.supplyfunction.method},
                {text:param.supply.name},
                {data:param.data},
                {text:getStateNameByID(param.sysid),style:"color:var(--"+getStateColorByID(param.sysid)+"-color)"}
            ]);
        }
    });
    $.each($(data.filter(item=>item.datatype!="line")).sort(function(a,b){
        return (a.name??"").toString()<(b.name??"").toString()?-1:1; 
    }),function(i,param){
        switch(param.datatype){
            case "zone":
                if(!hasZoneCaption)
                    $(zonetable).appendTableRow([
                        {colspan:2, text:"Каталог сетевых сегментов", style:"font-size:120%;text-decoration:underline;border:0"}
                    ]);
                hasZoneCaption=true;

                $(zonetable).appendTableRow([
                    {type:"checkbox","data-id":param.id,"data-state":getStateColorByID(param.sysid)},
                    {text:param.name + ". " + getStateNameByID(param.sysid), style:"font-size:110%;border:0;color:var(--"+getStateColorByID(param.sysid)+"-color)"},
                ]);
                break;
            case "element":
                if(!hasElementCaption)
                    $(elementtable).appendTableRow([
                        {colspan:7, text:"Каталоги АС, Функций АС, Сущностей, Матрицы сущностей АС", style:"text-decoration:underline;font-size:120%;border:0"}
                    ]);
                hasElementCaption=true;
                $(elementtable).appendTableRow([
                    {type:"checkbox","data-id":param.id,"data-state":getStateColorByID(param.sysid)},
                    {colspan:6, text:param.name + ". " + getStateNameByID(param.sysid), style:"padding-top:20px;font-size:130%;border:0;color:var(--"+getStateColorByID(param.sysid)+"-color)"},
                ]);
                if(param.components && param.components.length>0){
                    $(elementtable).appendTableRow([
                        {colspan:2, text:"Компоненты", style:"background-color:#f3f3f3"},
                        {text:"Статус", style:"background-color:#f3f3f3"},
                        {colspan:4, style:"border:0"}
                    ]);
                    $.each(param.components.sort(function(a,b){
                        return(a.name<b.name?-1:1);
                    }),function(i,e){
                        let platform = "";
                        if(e.data){
                            $.each(e.data.sort(function(a,b){
                                return (getComponentWeight(a.type)<getComponentWeight(b.type)?-1:1);
                            }),function(i1,e1){
                                platform=splitNames(platform,e1.value);
                            });
                        }
                        //if(param.sysid=="9757") debugger;

                        $(elementtable).appendTableRow([
                            {type:"checkbox","data-id":param.id + "_c" + e.id,"data-state":(e.calcState??"new")},
                            {text:e.name + (platform!=""?": " +platform:""),style:"color:var(--"+(e.calcState??"new")+"-color)"},
                            {text:getStateName2(e.calcState??"new"),style:"color:var(--"+(e.calcState??"new")+"-color)"},
                            {colspan:4, style:"border:0"}
                        ]);
                    });
                }
                if(param.functions && param.functions.length>0){
                    var fntype="";
                    $.each(param.functions.sort(function(a,b){
                        if(!a.fntype) return -1;
                        else return(a.fntype<b.fntype?-1:1);
                    }),function(i,e){
                        switch(e.fntype){
                            case "Внутренняя": //if(e.fntype=="Вызов сервиса" || e.fntype=="Предоставление сервиса")
                                if(fntype!=e.fntype)
                                    $(elementtable).appendTableRow([
                                        {colspan:2, text:"Функция", style:"background-color:#f3f3f3"},
                                        {text:"Тип", style:"background-color:#f3f3f3"},
                                        {text:"Метод", style:"background-color:#f3f3f3"},
                                        {text:"Статус", style:"background-color:#f3f3f3"},
                                        {colspan:3, style:"border:0"}
                                    ]);
                                $(elementtable).appendTableRow([
                                    {type:"checkbox","data-id":param.id + "_f" + e.id,"data-state":getStateColorByID(e.spid)},
                                    {text:e.name,style:"color:var(--"+getStateColorByID(e.id)+"-color)"},
                                    {text:e.fntype},
                                    {text:e.consumermethod},
                                    {text:getStateNameByID(e.id),style:"color:var(--"+getStateColorByID(e.spid)+"-color)"},
                                    {colspan:3, style:"border:0"}
                                ]);
                                break;
                            default:
                                if(fntype!=e.fntype)
                                    $(elementtable).appendTableRow([
                                        {colspan:2, text:"Функция", style:"background-color:#f3f3f3;"},
                                        {text:"Тип", style:"background-color:#f3f3f3"},
                                        {text:"Статус функции", style:"background-color:#f3f3f3"},
                                        {text:"Интерфейс", style:"background-color:#f3f3f3"},
                                        {text:"Метод поставщика", style:"background-color:#f3f3f3"},
                                        {text:"Тип взаимодействия", style:"background-color:#f3f3f3"}

                                    ]);
                                $(elementtable).appendTableRow([
                                    {type:"checkbox","data-id":param.id + "_f" + e.id,"data-state":getStateColorByID(e.spid)},
                                    {text:e.name,style:"color:var(--"+getStateColorByID(e.id)+"-color)"},
                                    {text:e.fntype},
                                    {text:getStateNameByID(e.spid),style:"color:var(--"+getStateColorByID(e.spid)+"-color)"},
                                    {text:e.supplyint},
                                    {text:e.method},
                                    {text:e.interaction}
                                ]);
                                break;
                        }
                        fntype=e.fntype;
                    });
                }
                if(param.data && param.data.length>0){
                    $(elementtable).appendTableRow([
                        {colspan:2, text:"Данные", style:"background-color:#f3f3f3"},
                        {text:"Статус", style:"background-color:#f3f3f3"},
                        {colspan:4, style:"border:0"}
                    ]);
                    $.each(param.data.sort(function(a,b){
                        return(a.name<b.name?-1:1);
                    }),function(i,e){
                        $(elementtable).appendTableRow([
                            {type:"checkbox","data-id":param.id + "_d" + e.id,"data-state":getStateColorByID(e.spid)},
                            {text:e.name,style:"color:var(--"+getStateColorByID(e.id)+"-color)"},
                            {text:getStateNameByID(e.spid),style:"color:var(--"+getStateColorByID(e.spid)+"-color)"},
                            {colspan:4, style:"border:0"}
                        ]);
                    });
                }
                break;
        }
    });                
    return {
        zonetable:zonetable,
        elementtable:elementtable,
        linetable:linetable
    };
}

$.fn.gettables = function(){
    var place = this;
    var businesstable = $.table({
        header:[
            [
                {text:"№"},
                {text:"Название объекта данных"},
                {text:"Класс данных"},
                {text:"Мастер-система"},
                {text:"АС, где хранится"},
                {text:"Классификация ИБ"},
                {text:"Ссылка на потоки данных"},
                {text:"Статус изменения"}
            ]
        ]
    });
    /*
    var systemtable = $.table({
        header:[
            [
                {rowspan:2, text:"№"},
                {rowspan:2, text:"Название системы/компонента"},
                {rowspan:2, text:"Тип системы/ компонента"},
                {colspan:5, text:"Типовая платформа реализации системы/ компонента"},
                {rowspan:2, text:"Назначение"},
                {rowspan:2, text:"Зона размещения компонента"},
                {rowspan:2, text:"Статус изменения компонента"}
            ],
            [
                {text:"OC сервера приложений"},
                {text:"Среда исполнения приложения"},
                {text:"ОС сервера БД"},
                {text:"Сервер БД"},
                {text:"Разработка"}
            ]
        ]
    });
    */
   var systemtable = $.table({
    header:[
        [
            {rowspan:0, text:"№"},
            {rowspan:0, text:"Название системы/компонента"},
            {rowspan:0, text:"Тип системы/ компонента"},
            {colspan:5, text:"Типовая платформа реализации системы/ компонента"},
            {rowspan:0, text:"Назначение"},
            {rowspan:0, text:"Зона размещения компонента"},
            {rowspan:0, text:"Статус изменения компонента"}
        ],
        [
            {rowspan:1},
            {rowspan:1},
            {rowspan:1},
            {text:"OC сервера приложений"},
            {text:"Среда исполнения приложения"},
            {text:"ОС сервера БД"},
            {text:"Сервер БД"},
            {text:"Разработка"},
            {rowspan:1},
            {rowspan:1},
            {rowspan:1}
        ]
    ]
});
    var interfacetable = $.table({
        header:[
            [
                {text:"№"},
                {text:"Название потока данных"},
                {text:"Тип взаимодействия систем", style:"mso-rotate:90;height:98.5pt;text-align:center"},
                {text:"АС-потребитель"},
                {text:"Тип подключения потребителя", style:"mso-rotate:90;text-align:center"},
                {text:"Интеграционная платформа", style:"mso-rotate:90;text-align:center"},
                {text:"Тип подключения поставщика", style:"mso-rotate:90;text-align:center"},
                {text:"АС-поставщик"},
                {text:"Объект данных"},
                {text:"Статус изменения"}
            ]
        ]
    });
    var supporttable = $.table({
        header:[
            [
                {text:"№"},
                {text:"Название АС/ модуля АС"},
                {text:"Приоритетность восстановления", rotate:true, style:"mso-rotate:90;height:98.5pt;text-align:center"},
                {text:"Время восстановления", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Тип обработки отказов",  rotate:true,style:"mso-rotate:90;text-align:center"},
                {text:"Уровень мониторинга", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Режим функционирования", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Категории пользователей", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Тип развертывания", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Жизненный цикл", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Производитель оборудования и ПО", rotate:true, style:"mso-rotate:90;text-align:center"},
                {text:"Тип масштабирования", rotate:true, style:"mso-rotate:90;text-align:center"}
            ]
        ]
    });
    var developtable = $.table({
        header:[
            [
                {text:"Название АС/ модуля АС"},
                {text:"Статус АС"},
                {text:"Функция"},
                {text:"Тип"},
                {text:"Статус функции"},
                {text:"№ интерфейса"},
                {text:"Интерфейс"},
                {text:"АС-потребитель"},
                {text:"АС-поставщик"},
                {text:"Объект данных"},
                {text:"Статус интерфейса"}
            ]
        ]
    });
    var developtable2 = $.table();
    var lineData = [];

    $("g[data-type='line']:not([data-type2='simple'])").sortByLineNumber().each(function(i,e){
        lineData.push($(e).lineget());
    });
    var elementData = [];
    $(place).find("svg[data-type='element']:not([data-type3='simple'])").each(function(i,e){
        var el = $(e).logicget();
        var el_cnt=0;
        var found=false;
        $.each(elementData, function(i,e){
            if(e.name==el.name){
                found=true;
                var e_cnt=0;
                for(var key in Object.keys(e)){
                    if(e[key]!=undefined && e[key]!="") e_cnt++;
                }
                if(el_cnt==0){
                    for(var key in Object.keys(el)){
                        if(el[key]!=undefined && el[key]!="") el_cnt++;
                    }
                }
                if(el_cnt>e_cnt)
                    elementData[i]=el;
            }
        });
        if(!found)
            elementData.push(el);
    });
    var businessData={};
    //var j=0;
    $.each(elementData, function(i,param){
        $(systemtable).appendTableRow([
            {text:i+1},
            {text:param.name},
            {text:param.type},
            {text:param.appos},
            {text:param.appenv},
            {text:param.dbos},
            {text:param.dbenv},
            {text:param.dev},
            {text:param.description},
            {text:param.location},
            {text:getStateName(param.state)}
        ]);
        $(supporttable).appendTableRow([
            {text:i+1},
            {text:param.name},
            {text:param.metrics?.find(val=>val.name=="Приоритетность восстановления")?.value},
            {text:param.metrics?.find(val=>val.name=="Время восстановления")?.value},
            {text:param.metrics?.find(val=>val.name=="Тип обработки отказов")?.value},
            {text:param.metrics?.find(val=>val.name=="Уровень мониторинга")?.value},
            {text:param.metrics?.find(val=>val.name=="Режим функционирования")?.value},
            {text:param.metrics?.find(val=>val.name=="Категории пользователей")?.value},
            {text:param.metrics?.find(val=>val.name=="Тип развертывания")?.value},
            {text:param.metrics?.find(val=>val.name=="Жизненный цикл")?.value},
            {text:param.metrics?.find(val=>val.name=="Оборудование и система")?.value},
            {text:param.metrics?.find(val=>val.name=="Тип масштабирования")?.value}
    ]);
        $.each(param.data, function(j1,d){
            var interfaces = "";
            $.each(lineData,function(i,line){
                $.each(line.data,function(ii,e){
                    if(e.name==d.name && e.state==d.state)
                        interfaces+=(interfaces==""?"":", ") + line.number;
                });
            });
            var key=d.name+','+d.state;
            if(businessData[key]==undefined){
                businessData[key]={
                    name:d.name,
                    master:(d.flowtype=="master"?param.name:""),
                    copy:(d.flowtype!="transfer"?param.name:""),
                    securitytype:getSecuritytypeName(d.securitytype),
                    interfaces:interfaces,
                    state:getStateName(d.state)
                }
            }
            else{
                if(d.flowtype!="transfer" && businessData[key].copy.indexOf(param.name)==-1)
                    businessData[key].copy+=(businessData[key].copy.length>0?", ":"") + param.name;
                if(d.flowtype=="master" && businessData[key].master.indexOf(param.name)==-1)
                    businessData[key].master+=(businessData[key].master.length>0?", ":"") + param.name;
            }
        });
    });
    $.each(Object.keys(businessData), function(i,e){
        $(businesstable).appendTableRow([
            {text:i+1},
            {text:businessData[e].name},
            {text:"Бизнес-данные"},
            {text:businessData[e].master},
            {text:businessData[e].copy},
            {text:businessData[e].securitytype},
            {text:businessData[e].interfaces},
            {text:businessData[e].state}
        ]);
    });
    var developnumber=0;
    var developdata=[];
    $.each($(lineData).sortByIntProp("number"), function(i,params){
        var consumer = undefined;
        var consumerConnector = undefined;
        var consumerFunction = undefined;
        var supply = undefined;
        var supplyConnector = undefined;
        var supplyFunction = undefined;

        if(params.startel!=undefined){
            switch(params.function){
                case "consumer":
                    if (params.startel!=undefined)
                        consumer = $("svg[data-type='element'][id='"+params.startel+"']").logicget();
                    if(params.endel != undefined)
                        supply = $("svg[data-type='element'][id='"+params.endel+"']").logicget();
                    consumerConnector = params.consumerint;
                    supplyConnector = params.supplyint;
                    consumerFunction = params.startfn;
                    supplyFunction = params.endfn;
                    break;
                case "supply":
                    if (params.startel!=undefined)
                        supply = $("svg[data-type='element'][id='"+params.startel+"']").logicget();
                    if(params.endel != undefined)
                        consumer = $("svg[data-type='element'][id='"+params.endel+"']").logicget();
                    consumerConnector = params.supplyint;
                    supplyConnector = params.consumerint;
                    consumerFunction = params.startfn;
                    supplyFunction = params.endfn;
                    break;
            }
        }
        var data = "";
        $.each(params.data,function(i,e){
            data+=(data==""?"":", ") + e.name;            
        });
        if(params.starttype!="comment" && params.endtype!="comment" && params.starttype!="picture" && params.endtype!="picture"){
            $(interfacetable).appendTableRow([
                {text:params.number},
                {text:params.name},
                {text:params.interaction},
                {text:consumer!=undefined? consumer.name:""},
                {text:consumerConnector},
                {text:params.intplatform},
                {text:supplyConnector},
                {text:supply!=undefined? supply.name:""},
                {text:data},
                {text:getStateName(params.state)}
            ]);
        }
        if(isDevelopState(params.state)){
            if(consumer!=undefined){
                $.each(consumer.functions,function(i,e){
                    if(e.id==consumerFunction && isDevelopState(e.state)){
                        developdata.push({
                            id:++developnumber,
                            sys:consumer.name,
                            sysstate:getStateName(consumer.state),
                            sysstateid:consumer.state,
                            fn:e.name,
                            fntype:"Вызов сервиса",
                            fnstate:getStateName(e.state),
                            fnstateid:e.state,
                            intnumber:params.number,
                            int:params.name,
                            consumer:consumer!=undefined?consumer.name:"",
                            supply:supply!=undefined? supply.name:"",
                            data:data,
                            intstate:getStateName(params.state)
                        });
                    }
                });                    
            }
            if(supply!=undefined){
                $.each(supply.functions,function(i,e){
                    if(e.id==supplyFunction && isDevelopState(e.state)){
                        developdata.push({
                            id:++developnumber,
                            sys:supply.name,
                            sysstate:getStateName(supply.state),
                            sysstateid:supply.state,
                            fn:e.name,
                            fntype:"Предоставление сервиса",
                            fnstate:getStateName(e.state),
                            fnstateid:e.state,
                            intnumber:params.number,
                            int:params.name,
                            consumer:consumer!=undefined?consumer.name:"",
                            supply:supply!=undefined? supply.name:"",
                            data:data,
                            intstate:getStateName(params.state),
                            intstateid:params.state
                        });
                    }
                });                    
            }
        }
    }); 
    $.each(elementData, function(i,sys){
        $.each(sys.functions,function(i1,fn){
            if(isDevelopState(fn.state)){
                var found=false;
                $.each(developdata,function(i2,e){
                    found |= (e.sys==sys.name && e.fn==fn.name);
                });
                if(!found){
                    developdata.push({
                        id:++developnumber,
                        sys:sys.name,
                        sysstate:getStateName(sys.state),
                        valuestream:sys.valuestream,
                        sysstateid:sys.state,
                        fn:fn.name,
                        fntype:"Внутренняя",
                        fnstate:getStateName(fn.state),
                        fnstateid:fn.state,
                        intnumber:"",
                        int:"",
                        consumer:"",
                        supply:"",
                        data:"",
                        intstate:""
                    });
                }
            }
        });
        $.each(sys.data,function(i1,dt){
            if(isDevelopState(dt.state)){
                var found=false;
                $.each(developdata,function(i2,e){
                    found |= (e.sys==sys.name && e.fn==dt.name);
                });
                if(!found){
                    developdata.push({
                        id:++developnumber,
                        sys:sys.name,
                        sysstate:getStateName(sys.state),
                        valuestream:sys.valuestream,
                        sysstateid:sys.state,
                        fn:dt.name,
                        fntype:"Данные",
                        fnstate:getStateName(dt.state),
                        fnstateid:dt.state,
                        intnumber:"",
                        int:"",
                        consumer:"",
                        supply:"",
                        data:"",
                        intstate:""
                    });
                }
            }
        });   
    });
    var sys="";
    var hasFunctionHeader=false;
    var hasInterfaceHeader=false;
    var hasDataHeader=false;
    $.each($(developdata).sort(function(a,b){
        if(a["sys"]<b["sys"]) return -1;
        else if(a["sys"]>b["sys"]) return 1;
        else if(getInt(a["intnumber"])<getInt(b["intnumber"])) return -1;
        else if(getInt(a["intnumber"])>getInt(b["intnumber"])) return 1;
        return 0;

    }),function(i,e){
        $(developtable).appendTableRow([
            {text:e.sys},
            {text:e.sysstate},
            {text:e.fn},
            {text:e.fntype},
            {text:e.fnstate},
            {text:e.intnumber},
            {text:e.int},
            {text:e.consumer},
            {text:e.supply},
            {text:e.data},
            {text:e.intstate}
        ]);
        if(sys!=e.sys){
            sys=e.sys;
            hasFunctionHeader=false;
            hasInterfaceHeader=false;
            hasDataHeader=false;
            // новая система, добавляем заголовок
            $(developtable2).appendTableRow([
                {colspan:10, text:e.sys + ". " + e.sysstate + ($.isnull(e.valuestream,"")!=""?" (" + e.valuestream + ")":""), style:"font-size:120%;border:0;color:var(--"+e.sysstateid+"-color)"},
            ]);
        }

        switch(e.fntype){
            case "Внутренняя":
                if(!hasFunctionHeader){
                    if(hasInterfaceHeader || hasDataHeader)
                        $(developtable2).appendTableRow([
                            {colspan:10, style:"border:0"}
                        ]);
                    $(developtable2).appendTableRow([
                        {text:"Функция", style:"background-color:#f3f3f3"},
                        {text:"Тип", style:"background-color:#f3f3f3"},
                        {text:"Статус", style:"background-color:#f3f3f3"},
                        {colspan:7, style:"border:0"}
                    ]);
                    hasFunctionHeader = true;
                }
                // добавляем данные
                $(developtable2).appendTableRow([
                    {text:e.fn,style:"color:var(--"+e.fnstateid+"-color)"},
                    {text:e.fntype},
                    {text:getStateName2(e.fnstateid),style:"color:var(--"+e.fnstateid+"-color)"},
                    {colspan:7, style:"border:0"}
                ]);
                break;
            case "Данные":
                if(!hasDataHeader){
                    if(hasInterfaceHeader || hasFunctionHeader)
                        $(developtable2).appendTableRow([
                            {colspan:10, style:"border:0"}
                        ]);
                    $(developtable2).appendTableRow([
                        {text:"Данные", style:"background-color:#f3f3f3"},
                        {text:"Статус", style:"background-color:#f3f3f3"},
                        {colspan:8, style:"border:0"}
                    ]);
                    hasDataHeader = true;
                }
                // добавляем данные
                $(developtable2).appendTableRow([
                    {text:e.fn,style:"color:var(--"+e.fnstateid+"-color)"},
                    {text:getStateName2(e.fnstateid),style:"color:var(--"+e.fnstateid+"-color)"},
                    {colspan:8, style:"border:0"}
                ]);
                break;
            default: //if(e.fntype=="Вызов сервиса" || e.fntype=="Предоставление сервиса")
                if(!hasInterfaceHeader){
                    if(hasFunctionHeader || hasDataHeader)
                        $(developtable2).appendTableRow([
                            {colspan:10, style:"border:0"}
                        ]);
                    $(developtable2).appendTableRow([
                        {text:"Функция", style:"background-color:#f3f3f3;"},
                        {text:"Тип", style:"background-color:#f3f3f3"},
                        {text:"Статус функции", style:"background-color:#f3f3f3"},
                        {text:"№ интерфейса", style:"background-color:#f3f3f3"},
                        {text:"Интерфейс", style:"background-color:#f3f3f3"},
                        {text:"АС-потребитель", style:"background-color:#f3f3f3"},
                        {text:"АС-поставщик", style:"background-color:#f3f3f3"},
                        {text:"Объект данных", style:"background-color:#f3f3f3"},
                        {text:"Статус интерфейса", style:"background-color:#f3f3f3"}
                    ]);
                    hasInterfaceHeader = true;
                }
                // добавляем данные
                $(developtable2).appendTableRow([
                    {text:e.fn,style:"color:var(--"+e.fnstateid+"-color)"},
                    {text:e.fntype},
                    {text:getStateName2(e.fnstateid),style:"color:var(--"+e.fnstateid+"-color)"},
                    {text:e.intnumber},
                    {text:e.int,style:"color:var(--"+e.intstateid+"-color)"},
                    {text:e.consumer},
                    {text:e.supply},
                    {text:e.data},
                    {text:getStateName2(e.intstateid),style:"color:var(--"+e.intstateid+"-color)"}
                ]);
                break;
        }
    });
    return{
        businesstable:businesstable,
        systemtable:systemtable,
        interfacetable:interfacetable,
        supporttable:supporttable,
        developtable:developtable,
        developtable2:developtable2
    }   
}
$.fn.appendToOtar = function(){
    var body = $(this).find("div.WordSection1");
    $(arguments).each(function(i,e){
        $(body).append(e);
    });
}
var getStateColor = function(state){
    switch (state) {
        case "new":
            return "#c00000";
        case "exist":
            return "#3f3f3f";
        case "change":
            return "#7030a0";
        case "external":
            return "#f59d56";
    }
}
var getFlowtypeColor = function(state){
    switch (state) {
        case "copy":
            return "#c0c2af";
        default:
            return "#c4d6a0";
    }
}
var isDevelopState = function(state){
    switch (state) {
        case "new":
            return true;
        case "exist":
            return false;
        case "change":
            return true;
        case "external":
            return false;
    }
}
var getSystemStateName = function(state){
    switch (state) {
        case "new":
            return "Новая система";
        case "exist":
            return "Система без изменений";
        case "change":
            return "Изменяемая система";
        case "external":
            return "Внешняя система";
        case "abstract":
            return "Абстрактная система";
    }
}
var getInterfaceStateName = function(state){
    switch (state) {
        case "new":
            return "Новый интерфейс";
        case "exist":
            return "Существующий интерфейс";
        case "change":
            return "Изменяемый интерфейс";
        case "external":
            return "Внешний интерфейс";
        case "abstract":
            return "Абстрактный интерфейс";
    }
}
$.fn.getImage = function(options){
    setTimeout(() => { 
        var place = this;
        $.clearselected();
        $.gridshow(false);

        var size=$.getsize();
        if($.isemptyschema(size))
        {
            if(typeof options.error === "function")
                options.error(getPageMenuFullName() + " - пустая схема");
                $.gridshow(isgridshown);
        }
        else{
            var p=$(place).clone().removeAttr("style").attr({
                width:size.maxX-size.minX,
                height:size.maxY-size.minY
            });
            $(p)[0].setAttribute("viewBox",
                (size.minX).toString() + " " +
                (size.minY).toString() + " " +
                (size.maxX-size.minX).toString() + " " +
                (size.maxY-size.minY).toString()
            );
            var imgsrc = 'data:image/svg+xml;base64,' + window.btoa(getUnescaped(unescape(encodeURIComponent($(p)[0].outerHTML)))); 
            var image = new Image();
            image.src=imgsrc;
            image.onload=function(){
                var zoom = (options.zoom?options.zoom:1); // for best view
                var imgwidth=image.width*zoom;
                var imgheight=image.height*zoom;
                var canvas = document.querySelector("canvas");
                $(canvas).attr({
                    width:imgwidth,
                    height:imgheight
                });
                var context = canvas.getContext("2d"); 
                context.fillStyle="white";
                context.fillRect(0,0,imgwidth,imgheight);
                context.drawImage(image,0,0,imgwidth,imgheight);

                if(options.outputtype=="blob")
                    canvas.toBlob(function(imgdata){
                        if(typeof options.success === "function")
                            options.success(imgdata,size);
                    }
                    ,options.imageType);
                else{
                    var imgdata = canvas.toDataURL(options.imageType);
                    if(typeof options.success === "function")
                        options.success(imgdata,size);
                }
                $.gridshow(isgridshown);
            }
            image.onerror=function(context){
                console.error(context);
                $.gridshow(isgridshown);
            }
        }
    }, 500);
}
