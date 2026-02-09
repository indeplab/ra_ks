var visiozoom=0.01;
var pagedelta = 40;
var Unit="MM";
var elID=1;
var elementIDConnect={};
var functionNames={};
var masterCount=33;

$.fn.visio = function(options){
    visio(this, options);
}
async function visio(place, options){
   var part="visio";
    const blobWriter = new zip.BlobWriter("application/zip");
    const writer = new zip.ZipWriter(blobWriter);
    await msofficeaddfile(part,zip,writer, "_rels/_.xml", "_rels/.rels");
    await msofficeaddfile(part,zip,writer,"docProps/app.xml");
    await msofficeaddfile(part,zip,writer, "docProps/core.xml");
    await msofficeaddfile(part,zip,writer, "docProps/custom.xml");
    //await msofficeaddfile(part,zip,writer, "docProps/thumbnail.jpg", "docProps/thumbnail.emf");
    await msofficeaddfile(part,zip,writer, "visio/_rels/document.xml", "visio/_rels/document.xml.rels");
//    await msofficeaddfile(part,zip,writer, "visio/masters/_rels/masters.xml", "visio/masters/_rels/masters.xml.rels");
    await writer.add("visio/masters/_rels/masters.xml.rels", new zip.TextReader($(place).visiopagemasterrel(masterCount)));
    await msofficeaddfile(part,zip,writer, "visio/masters/_rels/master10.xml", "visio/masters/_rels/master10.xml.rels");
    await msofficeaddfile(part,zip,writer, "visio/masters/_rels/master11.xml", "visio/masters/_rels/master11.xml.rels");
    await msofficeaddfile(part,zip,writer, "visio/masters/_rels/master33.xml", "visio/masters/_rels/master33.xml.rels");
    await msofficeaddfile(part,zip,writer, "visio/masters/masters.xml");
    for(var i=0;i<masterCount;i++){
        await msofficeaddfile(part,zip,writer, "visio/masters/master" + (i+1).toString() + ".xml");
    }

    await msofficeaddfileblob(part,zip,writer,"visio/media/image1.png");
    await msofficeaddfileblob(part,zip,writer,"visio/media/image2.png");
    await msofficeaddfileblob(part,zip,writer,"visio/media/image3.png");
 
    if(options.viewlist){
        var currentmenu = $.pagemenu();
        var pagelist=[];
        var thumbnail;
        $.each(options.viewlist,function(i,e){
            if(i==0 || e.id=="interface")
                thumbnail=e.id;
        });
        var pagerel=$(place).visiopagerel(masterCount);
        let i=0;
        for (var i1 = 0; i1 < options.viewlist.length; i1++){
            var e=options.viewlist[i1];
            if($.pagemenu()!=e.id) $.pagemenu(e.id);
            var size = $.getsize();//$(place).svggetsize();
            if($.isemptyschema(size)){
                alert(getPageMenuFullName() + " - пустая схема");
            }
            else
            {
                var intsize={
                    minX:size.minX-pagedelta,
                    maxX:size.maxX+2*pagedelta,
                    minY:size.minY-pagedelta,
                    maxY:size.maxY+2*pagedelta,
                    dx:pagedelta/2,
                    dy:pagedelta/2
                }
                if(e.id==thumbnail)
                    await msofficeaddfileimage(place,zip,writer,"docProps/thumbnail.emf",{imageType:"image/emf",outputtype:"blob", zoom: 100/(size.maxX-size.minX)});
                await writer.add("visio/pages/page" + (i+1).toString() + ".xml", new zip.TextReader($(place).visiopage(intsize,e)));
                await writer.add("visio/pages/_rels/page" + (i+1).toString() + ".xml.rels", new zip.TextReader(pagerel));
                pagelist.push({
                    name:e.id.indexOf("business")>-1?getEscaped(e.name):getPageMenuName(e.id),
                    size:intsize
                });
                i++;
            }
        }
        if(currentmenu!=$.pagemenu()) $.pagemenu(currentmenu);

        await writer.add("visio/pages/pages.xml", new zip.TextReader(
            $(place).visiopagelist(pagelist)
        ));
        await writer.add("visio/pages/_rels/pages.xml.rels", new zip.TextReader($(place).visiopagelistrel(pagelist.length)));
        await writer.add("[Content_Types].xml", new zip.TextReader($(place).visiopagecontext(pagelist.length)));
    }

    await msofficeaddfile(part,zip,writer, "visio/document.xml");
    await msofficeaddfile(part,zip,writer, "visio/windows.xml");
    await writer.close();
    // get the zip file as a Blob
    const content = await blobWriter.getData(); 
    if (options && typeof options.success == "function") options.success(content)
}
$.fn.visiopagelist = function(pages){
    var page=$.xml("Pages",{
            "xmlns":"http://schemas.microsoft.com/office/visio/2012/main",
            "xmlns:r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships",
            "xml:space":"preserve"
        });
     
    $.each(pages,function(i,p){
        page.append(
           $.xml("<Page>",{
                ViewCenterY:(p.size.maxY-p.size.minY)/2*visiozoom,
                ViewCenterX:(p.size.maxX-p.size.minX)/2*visiozoom,
                ViewScale:"-1",
                IsCustomName:"1",
                Name:p.name,
                IsCustomNameU:"1",
                NameU:p.name,
                ID:i
            }).append(
                $.xml("PageSheet",{
                    TextStyle:"0",
                    FillStyle:"0",
                    LineStyle:"0"
                }).append(
                    $.xml("Cell",{V:(p.size.maxX-p.size.minX)*visiozoom, N:"PageWidth",U:Unit}),
                    $.xml("Cell",{V:(p.size.maxY-p.size.minY)*visiozoom, N:"PageHeight",U:Unit}),
                    $.xml("Cell",{V:"0.01181102362204724", N:"ShdwOffsetX",U:Unit}),
                    $.xml("Cell",{V:"-0.01181102362204724", N:"ShdwOffsetY",U:Unit}),
                    $.xml("Cell",{V:"1", N:"PageScale",U:Unit}),
                    $.xml("Cell",{V:"1", N:"DrawingScale",U:Unit}),
                    $.xml("Cell",{V:"1", N:"DrawingSizeType"}),
                    $.xml("Cell",{V:"0", N:"DrawingScaleType"}),
                    $.xml("Trigger",{N:"RecalcColor"}).append($.xml("RefBy",{ID:"0",T:"Page"})),
                    $.xml("Cell",{V:"0", N:"InhibitSnap"}),
                    $.xml("Cell",{V:"0", N:"PageLockReplace", U:"BOOL"}),
                    $.xml("Cell",{V:"0", N:"PageLockDuplicate", U:"BOOL"}),
                    $.xml("Cell",{V:"0", N:"UIVisibility"}),
                    $.xml("Cell",{V:"0", N:"ShdwType"}),
                   $.xml("Cell",{V:"0", N:"ShdwObliqueAngle"}),
                    $.xml("Cell",{V:"1", N:"ShdwScaleFactor"}),
                    $.xml("Cell",{V:"1", N:"DrawingResizeType"}),
                    $.xml("Cell",{V:"7.76771653543307", N:"XRulerOrigin"}),
                    $.xml("Cell",{V:"7.76771653543307", N:"XGridOrigin"})
                ),
                $.xml("Rel",{"r:id":"rId" + (i+1).toString()}),
            )
        );
    });
    //console.log(page);
    return "<?xml version='1.0' encoding='utf-8' ?>" + page.toString();
}
$.fn.visiopagelistrel = function(pages){
    var page=$.xml("Relationships",{
            "xmlns":"http://schemas.openxmlformats.org/package/2006/relationships"
        });
     
    for(var i=pages;i>0;i--){
        page.append(
            $.xml("<Relationship>",{
                Target:"page" + i.toString() + ".xml",
                Type:"http://schemas.microsoft.com/visio/2010/relationships/page",
                Id:"rId"+ i.toString()
            })
        );
    }
    //console.log(page);
    return "<?xml version='1.0' encoding='utf-8' standalone='yes'?>" + page.toString();
}
$.fn.visiopagemasterrel = function(masterCount){
    var page=$.xml("Relationships",{
            "xmlns":"http://schemas.openxmlformats.org/package/2006/relationships"
        });
     
    for(var i=0;i<masterCount;i++){
        page.append(
            $.xml("<Relationship>",{
                Target:"master" + (i+1).toString() + ".xml",
                Type:"http://schemas.microsoft.com/visio/2010/relationships/master",
                Id:"rId"+ (i+1).toString()
            })
        );
    }
    return "<?xml version='1.0' encoding='utf-8' standalone='yes'?>" + page.toString();
}
$.fn.visiopagerel = function(masterCount){
    var page=$.xml("Relationships",{
            "xmlns":"http://schemas.openxmlformats.org/package/2006/relationships"
        });
     
    for(var i=0;i<masterCount;i++){
        page.append(
            $.xml("<Relationship>",{
                Target:"../masters/master" + (i+1).toString() + ".xml",
                Type:"http://schemas.microsoft.com/visio/2010/relationships/master",
                Id:"rId"+ (i+1).toString()
            })
        );
    }
    return "<?xml version='1.0' encoding='utf-8' standalone='yes'?>" + page.toString();
}
$.fn.visiopagecontext = function(pages){
    var page = $.xml("Types", {
        "xmlns": "http://schemas.openxmlformats.org/package/2006/content-types"
    }).append(
        $.xml("Default", { ContentType: "image/png", Extension: "png" }),
        $.xml("Default", { ContentType: "image/x-emf", Extension: "emf" }),
        $.xml("Default", { ContentType: "application/vnd.openxmlformats-package.relationships+xml", Extension: "rels" }),
        $.xml("Default", { ContentType: "application/xml", Extension: "xml" }),
        $.xml("Override", { ContentType: "application/vnd.ms-visio.drawing.main+xml", PartName: "/visio/document.xml" }),
        $.xml("Override", { ContentType: "application/vnd.openxmlformats-package.core-properties+xml", PartName: "/docProps/core.xml" }),
        $.xml("Override", { ContentType: "application/vnd.openxmlformats-officedocument.extended-properties+xml", PartName: "/docProps/app.xml" }),
        $.xml("Override", { ContentType: "application/vnd.openxmlformats-officedocument.custom-properties+xml", PartName: "/docProps/custom.xml" }),
        $.xml("Override", { ContentType: "application/vnd.ms-visio.masters+xml", PartName: "/visio/masters/masters.xml" })
    );
    for(var i=0;i<masterCount;i++){
        page.append(
            $.xml("Override", { ContentType: "application/vnd.ms-visio.master+xml", PartName: "/visio/masters/master" + (i+1).toString() + ".xml" }),
        );
    }
    page.append(
        $.xml("Override", { ContentType: "application/vnd.ms-visio.pages+xml", PartName: "/visio/pages/pages.xml" }),
    );
 
    for(var i=0;i<pages;i++){
        page.append(
            $.xml("Override",{ContentType:"application/vnd.ms-visio.page+xml",PartName:"/visio/pages/page" + (i+1).toString() + ".xml"}),
        );
    }
    page=page.append(
        $.xml("Override",{ContentType:"application/vnd.ms-visio.windows+xml",PartName:"/visio/windows.xml"}),
    );
    //console.log(page);
    return "<?xml version='1.0' encoding='utf-8' standalone='yes'?>" + page.toString();
}
$.fn.visiopage = function(size,params){
    var place = this;
    elID=1;
    var shapes = $.xml("Shapes");
    var connectors=$.xml("Connects");
    elementIDConnect={};
    functionNames={};
    var fontsize=0.1944444444444445;
    if($.pagemenuname()=="business"){
        var minX=Infinity;
        var minY=Infinity;
        var maxX=-Infinity;
        var maxY=-Infinity;
        var swparams=[];
        var containerid=$.newguid();
        var delta=1;
        $(place).find("svg[data-type='element']:not([data-type3='simple'])").each(function(i,e){
            var param = $(e).storeget();
            var parammenu = $.getviewpageparam(param);
            swp={
                text:getEscaped(param.name),
                x:getFloat(parammenu.x),
                y:getFloat(parammenu.y),
                width:getFloat(parammenu.w)+delta,
                height:getFloat(parammenu.h),
                containerid:containerid,
                fontsize:fontsize
            }
            minX=Math.min(minX,swp.x,swp.x+swp.width);
            maxX=Math.max(maxX,swp.x,swp.x+swp.width);
            minY=Math.min(minY,swp.y,swp.y+swp.height);
            maxY=Math.max(maxY,swp.y,swp.y+swp.height);
            swparams.push(swp);
        });
        shapes = shapes.append($.visioswimlinecontainer({
            text:getEscaped(params.name),
            lines:swparams.length,
            x:minX*visiozoom - (size.minX-size.dx)*visiozoom,
            y:-((minY)*visiozoom - (size.maxY-size.dy)*visiozoom - 2*fontsize),
            width:(maxX-minX)*visiozoom,
            height:(maxY-minY)*visiozoom +2*fontsize,
            containerid:containerid,
            fontsize
        }));
        $.each(swparams,function(i,e){
            shapes = shapes.append($.visioswimline(
                $.extend(e,{
                    x:e.x*visiozoom - (size.minX-size.dx)*visiozoom,
                    y:-(e.y*visiozoom- (size.maxY-size.dy)*visiozoom),
                    width:e.width*visiozoom,
                    height:e.height*visiozoom
                })
            ));
        });
    }
    else{
        $(place).find("svg[data-type='zone']").each(function(i,e){
            var param = $(e).storeget();
            var parammenu = $.getviewpageparam(param);
            var pos = $(e).logicGetGlobalOffset();
            var elx=getFloat(pos.x)*visiozoom - (size.minX-size.dx)*visiozoom;
            var ely=getFloat(pos.y)*visiozoom - (size.maxY-size.dy)*visiozoom;
            shapes = shapes.append($.visiozone({
                id:param.id,
                text:getEscaped(param.name),
                color:getHexColor((param.color?param.color:"rgb(254,229,153)")),
                x:elx,
                y:-ely,
                height:getFloat(parammenu.h)*visiozoom,
                width:getFloat(parammenu.w)*visiozoom
            }));
        });
        $(place).find("svg[data-type='element']:not([data-type3='simple'])").each(function(i,e){
            var param = $(e).storeget();
            var parammenu = $.getviewpageparam(param);
            var pos = $(e).logicGetGlobalOffset();
            var elx=getFloat(pos.x)*visiozoom - (size.minX-size.dx)*visiozoom;
            var ely=getFloat(pos.y)*visiozoom - (size.maxY-size.dy)*visiozoom;
            if(param.functions){
                $.each(param.functions,function(i,fn){
                    functionNames[fn.id]=getEscaped(fn.name);
                });
            }
            switch($.pagemenuname()){
                case "business":
                    break;
                case "interface":
                    shapes = shapes.append($.visioelement({
                        id:param.id,
                        text:getEscaped(param.name),
                        state:param.state,
                        x:elx,
                        y:-ely,
                        height:getFloat(parammenu.h)*visiozoom,
                        width:getFloat(parammenu.w)*visiozoom
                    }));
                    if(param.functions){
                        let idlist=[];
                        $.each(param.functions,function(i,fn){
                            if(!idlist.includes(fn.id)){
                                $(e).find("g[class='element-function'][data-id='" + fn.id + "'] rect").each(function(fnid,fnel){
                                    shapes = shapes.append($.visiofunction({
                                        text:getEscaped(fn.name),
                                        state:fn.state,
                                        x:getFloat($(fnel).attr("x"))*visiozoom +elx,
                                        y:-getFloat($(fnel).attr("y"))*visiozoom -ely,
                                        height:getFloat($(fnel).attr("height"))*visiozoom,
                                        width:getFloat($(fnel).attr("width"))*visiozoom
                                    }));
                                });
                                idlist.push(fn.id);
                            }
                        });
                    }
                    if(param.data){              
                        var data2Show = param.data.filter(x=>x.flowtype!='transfer');
                        if(data2Show.length>0){
                            var holderel=$(e).find("rect.rect-data");
                            if(holderel.length>0){
                                shapes = shapes.append($.visiodataholder({
                                    x:getFloat($(holderel).attr("x"))*visiozoom +elx,
                                    y:-getFloat($(holderel).attr("y"))*visiozoom -ely,
                                    height:getFloat($(holderel).attr("height"))*visiozoom,
                                    width:getFloat($(holderel).attr("width"))*visiozoom,
                                    zoom:visiozoom
                                }));
                                let idlist=[];
                                $.each(data2Show,function(i,dt){
                                    if(!idlist.includes(dt.id)){
                                        $(e).find("g[class='element-data'][data-id='" + dt.id + "'] rect").each(function(delid,datael) {
                                            shapes = shapes.append($.visiodata({
                                                text:getEscaped(dt.name + (dt.securitytype && dt.securitytype!=""? " (" + dt.securitytype + ")":"")),
                                                state:dt.state,
                                                flowtype:dt.flowtype,
                                                x:getFloat($(datael).attr("x"))*visiozoom +elx,
                                                y:-getFloat($(datael).attr("y"))*visiozoom -ely,
                                                height:getFloat($(datael).attr("height"))*visiozoom,
                                                width:getFloat($(datael).attr("width"))*visiozoom
                                            }));
                                        });
                                        idlist.push(dt.id);
                                    }
                                });
                            }
                        }
                    }
                    break;
                case "system":
                    shapes = shapes.append($.visioelement({
                        id:param.id,
                        text:getEscaped(param.name),
                        state:param.state,
                        x:elx,
                        y:-ely,
                        height:getFloat(parammenu.h)*visiozoom,
                        width:getFloat(parammenu.w)*visiozoom
                    }));
                    
                    $(e).children("g.element-namespace").each(function(i,e3){
                        var nsel = $(e3).children("rect");
                        if(nsel.length>0){
                            shapes = shapes.append($.visiozone({
                                text:getEscaped($(e3).children("text").text()),
                                /*state:param.state,*/
                                x:getFloat($(nsel).attr("x"))*visiozoom +elx,
                                y:-getFloat($(nsel).attr("y"))*visiozoom -ely,
                                height:getFloat($(nsel).attr("height"))*visiozoom,
                                width:getFloat($(nsel).attr("width"))*visiozoom,
                                color:getHexColor("rgb(139, 170, 74)")
                            }));
                        }
                        $(e3).children("g.element-system").each(function(i,e1){
                            var fnel = $(e1).children("rect");
                            if(fnel.length>0){
                                shapes = shapes.append($.visiosystem({
                                    text:getEscaped($(e1).children("text").text()),
                                    state:$(e1).attr("data-state"),
                                    x:getFloat($(fnel).attr("x"))*visiozoom +elx,
                                    y:-getFloat($(fnel).attr("y"))*visiozoom -ely,
                                    height:getFloat($(fnel).attr("height"))*visiozoom,
                                    width:getFloat($(fnel).attr("width"))*visiozoom
                                }));
                            }
                            $(e1).find("g.element-app").each(function(i,e2){
                                var fnapp=$(e2).children("rect");
                                if(fnapp.length>0){
                                    shapes = shapes.append($.visioelement({
                                        text:getEscaped($(e2).children("text").text()),
                                        state:$(e2).attr("data-state"),
                                        x:getFloat($(fnapp).attr("x"))*visiozoom +elx,
                                        y:-getFloat($(fnapp).attr("y"))*visiozoom -ely,
                                        height:getFloat($(fnapp).attr("height"))*visiozoom,
                                        width:getFloat($(fnapp).attr("width"))*visiozoom,
                                        fontsize:"0.125",
                                        heightdelta:0.03,
                                        usezoom:"0.6",
                                    }));
                                }
                            });
                        });
                        $(e3).find("g.element-datasystem").each(function(i,e1){
                            var fndb=$(e1).children("rect.rect-app");
                            if(fndb.length>0){
                                shapes = shapes.append($.visiosystem({
                                    text:getEscaped($(e1).children("text.rect-app").text()),
                                    state:$(e1).attr("data-state"),
                                    x:getFloat($(fndb).attr("x"))*visiozoom +elx,
                                    y:-getFloat($(fndb).attr("y"))*visiozoom -ely,
                                    height:getFloat($(fndb).attr("height"))*visiozoom,
                                    width:getFloat($(fndb).attr("width"))*visiozoom
                                }));
                            }
                            var holderel=$(e1).find("rect.rect-data");
                            if(holderel.length>0){
                                shapes = shapes.append($.visiodataholder({
                                    text:getEscaped($(e1).children("text.rect-data").text()),
                                    state:$(e1).attr("data-state"),
                                    x:getFloat($(holderel).attr("x"))*visiozoom +elx,
                                    y:-getFloat($(holderel).attr("y"))*visiozoom -ely,
                                    height:getFloat($(holderel).attr("height"))*visiozoom,
                                    width:getFloat($(holderel).attr("width"))*visiozoom,
                                    zoom:visiozoom
                                }));
                            }
                        });
                    });
                    break;
            }
        });
    }
    $(place).find("svg[data-type2='logic']:not([data-type='element']):not([data-type='zone'])").each(function(i,e){
        var param = $(e).storeget();
        var parammenu = $.getviewpageparam(param);
        var pos = $(e).logicGetGlobalOffset();
        var elx=getFloat(pos.x)*visiozoom - (size.minX-size.dx)*visiozoom;
        var ely=getFloat(pos.y)*visiozoom - (size.maxY-size.dy)*visiozoom;
        var elh = Math.max(getFloat(parammenu.h),$.logicMinHeight(param.datatype))*visiozoom;
        var elw = Math.max(getFloat(parammenu.w),$.logicMinWidth(param.datatype))*visiozoom;
        switch(param.datatype){
            case "legend":
                shapes = shapes.append($.visiolegend({
                    id:param.id,
                    text:getEscaped(param.name),
                    x:elx,
                    y:-ely,
                    height:elh,
                    width:elw
                }));
                break;
            case "comment":
                shapes = shapes.append($.visiocomment({
                    id: param.id,
                    caption: getEscaped(param.name),
                    description: getEscaped(param.description),
                    x: elx,
                    y: -ely,
                    height: getFloat(parammenu.h) * visiozoom,
                    width: getFloat(parammenu.w) * visiozoom
                }));
                break;
            case "picture":
                var img = $(e).find("image");
                if(img.length>0){
                    var imgheight=getFloat(getFloat($(img).css("height"))*visiozoom);
                    let master="22";
                    switch(param.src.toLowerCase().trim()){
                        case "images/e-user.png":
                            master="22";
                            break;
                        case "images/e-customer.png":
                            master="23";
                            break;
                        case "images/e-mobile.png":
                            master="63";
                            break;
                    }
                    shapes = shapes.append($.visiopicture({
                        id:param.id,
                        text:getEscaped(param.name),
                        x:elx,
                        y:-ely,
                        height:elh,
                        width:elw,
                        imageheight:imgheight,
                        imagewidth:imgheight*(getFloat(param.naturalWidth)/getFloat(param.naturalHeight)),
                        master:master
                    }));
                }
                break;
            case "start-process":
            case "clock-start":
            case "or-process":
            case "and-process":
            case "xor-process":
            case "end-process":
            case "subprocess":
            case "function":
            case "functionstep":
            case "data":
            case "linedata":
                    var p={
                        id:param.id,
                        x:elx,
                        y:-ely,
                        height:elh,
                        width:elw,
                        fontsize:fontsize
                    }
                    if(param.container){
                        var container=$.storeget(param.container);
                        if(container)
                            p.linename=getEscaped(container.name);
                    }
                    switch(param.datatype){
                        case "start-process":
                            p.master="54";
                            p.geometry="circle";
                            break;
                        case "clock-start":
                            p.master="54";
                            p.geometry="circle";
                            break;
                        case "or-process":
                            p.master="45";
                            p.geometry="ellipse";
                            break;
                        case "and-process":
                            p.master="48";
                            p.geometry="ellipse";
                            break;
                        case "xor-process":
                            p.master="42";
                            p.geometry="ellipse";
                            break;
                        case "end-process":
                            p.master="56";
                            p.geometry="circle";
                            break;
                        case "subprocess":
                            p.master="50";//"52";
                            p.color="#97c6ff";
                            p.text=getEscaped(param.name);
                            p.geometry="rectangle";
                            break;
                        case "function":
                            p.master="50";
                            p.text=getEscaped(param.name);
                            p.color="#ebb68d";
                            p.geometry="rectangle";
                            break;
                        case "functionstep":
                            p.master="50";
                            p.text=getEscaped(param.name);
                            p.color="#ebd28d";
                            p.geometry="rectangle";
                            break;
                        case "data":
                            p.master="49";
                            p.geometry="barrel";
                            p.text="";
                            if(param.parentel){
                                var fn=$.storeget(param.parentel);
                                if(fn && fn.data){
                                    $.each(fn.data,function(dtid,dt){
                                        p.text+=getEscaped((dtid>0?", ":"") + dt.name + (dt.securitytype && dt.securitytype!=""? " (" + dt.securitytype + ")":""));
                                    });
                                }
                            }
                            break
                        case "linedata":
                            p.master="51";
                            p.geometry="rectangle";
                            p.text="";
                            p.color="#c4d6a0";
                            p.textcolor="#000000";
                            p.fontsize="0.08333333333333333";
                            if(param.data){
                                $.each(param.data,function(dtid,dt){
                                    p.text+=getEscaped((dtid>0?", ":"") + dt.name + (dt.securitytype && dt.securitytype!=""? " (" + dt.securitytype + ")":""));
                                });
                            }
                            if(param.parentel){
                                var line=$.storeget(param.parentel);
                                if(line && line.data){
                                    $.each(line.data,function(dtid,dt){
                                        p.text+=getEscaped((dtid>0?", ":"") + dt.name + (dt.securitytype && dt.securitytype!=""? " (" + dt.securitytype + ")":""));
                                    });
                                }
                            }
                            break;
                    }
                    shapes = shapes.append($.visioswimlinelogic(p));
                break;
        }
    });
    $(place).find("g[data-type='line']:not([data-type4='lineattr'])").each(function(i,e){
        var param = $(e).storeget();
        var isFlow=(param.starttype=="picture" || param.endtype=="picture" || param.starttype=="comment" || param.endtype=="comment" || param.starttype=="linedata" || param.endtype=="linedata" || param.datatype3=="dashline");
        //if($.pagemenu()!="interface" && isFlow)
            //return;
        var parammenu = $.getviewpageparam(param);
        var points=[];
        var spl=parammenu.points?.split(',');
        var parent={
            x:0,
            y:0
        }
        if(param.container){
            var container=$.storeget(param.container);
            if(container){
                var parent=$.getviewpageparam(container);
            }
        }
        $.each(spl,function(i,e){
            var point=e.trim().split(" ");
            if(point.length>0){
                points.push({
                    x:(getFloat(point[0])+getFloat(parent.x))*visiozoom- (size.minX-size.dx)*visiozoom,
                    y:-((getFloat(point[1])+getFloat(parent.y))*visiozoom - (size.maxY-size.dy)*visiozoom)
                });
            }
        });
        if(parammenu.direction=="r"){
            points=points.reverse();
            param.function=(param.function=="consumer"?"supply":"consumer");
            var el=param.startel;
            param.startel=param.endel;
            param.endel=el;
            /*var fn=param.startfn;
            param.startfn=param.endfn;
            param.endfn=fn;*/
        }
        if(!isFlow && points.length>1){
            if(param.function=="consumer"){
                if(points[points.length-1].x==points[points.length-2].x)
                    points[points.length-1].y=points[points.length-1].y+0.15*sign(points[points.length-2].y-points[points.length-1].y);
                if(points[points.length-1].y==points[points.length-2].y)
                    points[points.length-1].x=points[points.length-1].x+0.15*sign(points[points.length-2].x-points[points.length-1].x);
            }
            else{
                if(points[0].x==points[1].x)
                    points[0].y=points[0].y+0.15*sign(points[1].y-points[0].y);
                if(points[0].y==points[1].y)
                    points[0].x=points[0].x+0.15*sign(points[1].x-points[0].x);
            }
        }
        var linename = getEscaped(param.name);
        var functionname = functionNames[param.endfn];
        var line=undefined;
        switch($.pagemenuname()){
            case "business":
                linename = param.number;
                functionname = "";
                break;
            case "interface":
                if(param.data && param.data.length>0){
                    linename="";
                    $.each(param.data,function(dtid,dt){
                        linename+=getEscaped((dtid>0?", ":"") + dt.name + (dt.securitytype && dt.securitytype!=""? " (" + dt.securitytype + ")":""));
                    });
                }
                break;
            case "system":
                linename=((!param.intplatform || param.intplatform=="" || param.intplatform=="P2P") && param.supplyint==param.consumerint?param.supplyint:splitNames(param.supplyint,param.intplatform,param.consumerint));
                if(param.consumermethod)
                    functionname = param.consumermethod;
                break;
        }
        var txt = $(e).find("text.line-text");
        let textlist = [];
        $(txt).find("tspan").each(function(it,te){
            textlist.push((getInt($(te).attr("dy"))!=0?'\n':'') + $(te).text().trim());
        });
        //console.log(textlist.join(' '));
        //console.log(linename,parammenu.text,$(txt).("width"));
        if(isemptyobject(parammenu.text)){
            var txt = $(e).find("text.line-text")
            parammenu.text={
                x:$(txt).attr("x"),
                y:$(txt).attr("y"),
                width:$(txt).attr("width"),
                height:$(txt).attr("height")
            }
        }
        var dt={
            data:getEscaped(linename),
            state:param.state,
            interaction:getEscaped(param.interaction),
            functionname:getEscaped(functionname),
            elementConnect:elementIDConnect[param.function=="consumer"?param.startel:param.endel],
            circleConnect:elementIDConnect[param.function=="consumer"?param.endel:param.startel],
            function:getEscaped(param.function),
            number:getEscaped(param.number),
            points:points,
            style:param.datatype2,
            textlist:textlist.join(' '),
            text: {
                x:getFloat(parammenu.text.x)*visiozoom- (size.minX-size.dx)*visiozoom,
                y:-(getFloat(parammenu.text.y)*visiozoom - (size.maxY-size.dy-5)*visiozoom),
                width:getFloat(parammenu.text.width*1.5)*visiozoom,
                height:getFloat(parammenu.text.height)*visiozoom
            },
            weight:($.pagemenuname()=="business"?0.01388888888888889:undefined)
        };
        if(isFlow)
            line = $.visioflow(dt);
        else
            line = $.visioline(dt);
        if(line){
            if(line[0])
                shapes = shapes.append(line[0]);
            if(line[1]){
                connectors = connectors.append(line[1]);
            }
        }
    });
    // make doc link
    var doc=$.documentget();
    var doclink=(doc?window.location.origin + window.location.pathname + '?id=' + doc.sysid:"");
    shapes = shapes.append($.visiolabel({
        id: $.newguid(),
        caption: (doclink!=""?"ВебОТАР - " + doclink:""),
        x: (size.maxX - size.minX - 500 - 30) * visiozoom,
        y: (30 + 30) * visiozoom,
        height: 30 * visiozoom,
        width: 500 * visiozoom
    }));

    var page=$.xml("PageContents",{
        "xmlns":"http://schemas.microsoft.com/office/visio/2012/main",
        "xmlns:r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "xml:space":"preserve"
    }).append(
        shapes,
        connectors
    );
    return "<?xml version='1.0' encoding='utf-8' ?>" + page.toString();
}
$.visioelement = function(options){
    var TxtHeight = 0.7;
    if(!options.usezoom) options.usezoom=1;
    elementIDConnect[options.id]=(elID+1);
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"Система",
        Name:"Информационная система",
        Type:"Group",
        Master:"2"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:"0.06", N:"TxtPinX",U:Unit,F:"Inh"}),
        $.xml("Cell",{V: options.height-(options.heightdelta?options.heightdelta:0.08), N:"TxtPinY",U:Unit,F:"Inh"}),
        $.xml("Cell",{V: options.width-0.3, N:"TxtWidth",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:TxtHeight, N:"TxtHeight",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:TxtHeight, N:"TxtLocPinY",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
        $.xml("Section", {
            N:"Character"
        }).append(
            $.xml("Row",{
                IX:"0"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:(options.fontsize?options.fontsize:"0.1525"), N:"Size", U:"PT"}),
            ),
            $.xml("Row",{
                IX:"1"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:(options.fontsize?options.fontsize:"0.1525"), N:"Size", U:"PT"}),
            )
        ),
        $.xml("Section", {
            N:"Control"
        }).append($.xml("Row",{
                N:"FigSize"
            }).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"Y", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"YDyn", F:"Inh"})
            )),
        $.xml("Text",{
            text:'<cp IX="0"/><cp IX="1"/>' + options.text
        }),
        $.xml("Shapes").append(
            $.xml("Shape",{
                ID:elID++,
                NameU:"Rectangle.719",
                IsCustomNameU:"1",
                Name:"AppComponentBase",
                IsCustomName:"1",
                Type:"Shape",
                MasterShape:"17"
            }).append(
                $.xml("Cell",{V:options.width/2, N:"PinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"PinY",F:"Inh"}),
                $.xml("Cell",{V:options.width, N:"Width",F:"Inh"}),
                $.xml("Cell",{V:options.height, N:"Height",F:"Inh"}),
                $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
                $.xml("Cell",{V:getStateColor(options.state), N:"LineColor", F:"Inh"}),
                $.xml("Section",{
                    N:"Geometry",
                    IX:"0"
                }).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.width,N:"X",F:"Inh"})
                    ),
                    $.xml("Row",{IX:"3",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                        $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
                    ),
                    $.xml("Row",{IX:"4",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
                    )
                )
            ),
            $.xml("Shape",{
                ID:elID++,
                NameU:"Application component 2.1105",
                IsCustomNameU:"1",
                Name:"AppComponentSymbol",
                IsCustomName:"1",
                Type:"Group",
                MasterShape:"18"
            }).append(
                $.xml("Cell",{V:options.width-0.04, N:"PinX",U:"PT",F:"Inh"}),
                $.xml("Cell",{V:options.height-0.04, N:"PinY",U:"PT",F:"Inh"}),
                $.xml("Cell",{V:getStateColor(options.state), N:"LineColor", F:"Inh"}),
                $.xml("Shapes").append(
                    $.xml("Shape",{ID:elID++,Type:"Shape",MasterShape:"20"}).append(
                        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
                        $.xml("Cell",{V:getStateColor(options.state), N:"FillForegnd", F:"Inh"}),
                        $.xml("Cell",{V:options.width/2+(0.3*(1-options.usezoom)), N:"PinX",F:"Inh",U:"MM"}),
                        $.xml("Cell",{V:0.2*(1-options.usezoom), N:"PinY",F:"Inh",U:"MM"}),
                        $.xml("Cell",{V:0.2667814960629921*options.usezoom, N:"Width",F:"Inh",U:"MM"}),
                        $.xml("Cell",{V:0.1867470472440944*options.usezoom, N:"Height",F:"Inh",U:"MM"}),
                        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh",U:"MM"}),
                        $.xml("Cell",{V:0, N:"LocPinY",F:"Inh",U:"MM"}),
                    )
                )
            )
        )
    );
    return element;
}
$.visiofunction = function(options){
    var TxtHeight = 0.7;
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"Функция информационной системы2",
        Name:"Функция информационной системы",
        Type:"Group",
        Master:"4"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:"0.06", N:"TxtPinX",U:Unit,F:"Inh"}),
        $.xml("Cell",{V: options.height-0.03, N:"TxtPinY",U:Unit,F:"Inh"}),
        $.xml("Cell",{V: options.width-0.3, N:"TxtWidth",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:TxtHeight, N:"TxtHeight",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:TxtHeight, N:"TxtLocPinY",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
        $.xml("Section", {
           N:"Character"
        }).append(
            $.xml("Row",{
                IX:"0"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:"0.1385", N:"Size", U:"PT"}),
            ),
            $.xml("Row",{
                IX:"1"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:"0.1385", N:"Size", U:"PT"}),
            )
        ),
        $.xml("Section", {
            N:"Control"
        }).append($.xml("Row",{
                N:"FigSize"
            }).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"Y", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"YDyn", F:"Inh"})
            )),
        $.xml("Text",{
            text:'<cp IX="0"/><cp IX="1"/>' + options.text
       }),
        $.xml("Shapes").append(
            $.xml("Shape",{
                ID:elID++,
                NameU:"Rectangle.719",
                IsCustomNameU:"1",
                Name:"AppFunctionBase",
                IsCustomName:"1",
                Type:"Shape",
                MasterShape:"17"
            }).append(
                $.xml("Cell",{V:options.width/2, N:"PinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"PinY",F:"Inh"}),
                $.xml("Cell",{V:options.width, N:"Width",F:"Inh"}),
                $.xml("Cell",{V:options.height, N:"Height",F:"Inh"}),
                $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
                $.xml("Cell",{V:getStateColor(options.state), N:"LineColor", F:"Inh"}),
                $.xml("Section",{
                    N:"Geometry",
                    IX:"0"
                }).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                       $.xml("Cell",{V:options.width,N:"X",F:"Inh"})
                    ),
                    $.xml("Row",{IX:"3",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                        $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
                    ),
                    $.xml("Row",{IX:"4",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
                    )
                )
            ),
            $.xml("Shape",{
                ID:elID++,
                NameU:"Application component 2.1105",
                IsCustomNameU:"1",
                Name:"AppFunctionSymbol",
                IsCustomName:"1",
                Type:"Group",
                MasterShape:"18"
            }).append(
                $.xml("Cell",{V:options.width+0.06, N:"PinX",U:"PT",F:"Inh"}),
                $.xml("Cell",{V:options.height+0.045, N:"PinY",U:"PT",F:"Inh"}),
                $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
                $.xml("Shapes").append(
                    $.xml("Shape",{ID:elID++,Type:"Guide",MasterShape:"29"}).append(
                        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"})
                    ),
                   $.xml("Shape",{ID:elID++,Type:"Shape",MasterShape:"20"}).append(
                    $.xml("Cell",{V:0.12, N:"Width",F:"Inh"}),
                    $.xml("Cell",{V:0.13, N:"Height",F:"Inh"}),
                    $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
                        $.xml("Cell",{V:getStateColor(options.state), N:"FillForegnd", F:"Inh"})
                    )
                )
            )
        )
    );
   return element;
}
$.visioline = function(options){
    var geometry = $.xml("Section",{
        N:"Geometry",
        IX:"0"
    });
    var x=0, y=0;
    var xTxt=0, yTxt=0;
    $.each(options.points,function(i,point) {
        if(i==0){
            geometry.append(
                $.xml("Row",{IX:i+1,T:"MoveTo"}).append(
                    $.xml("Cell",{V:0,N:"X"}),
                    $.xml("Cell",{V:0,N:"Y"})
                )
            )
            xTxt=point.x;
            yTxt=point.y;
        }
        else{
            geometry.append(
                $.xml("Row",{IX:i+1,T:"LineTo"}).append(
                    $.xml("Cell",{V:point.x-xTxt,N:"X"}),
                    $.xml("Cell",{V:point.y-yTxt,N:"Y"})
                )
            )
        }
        x=point.x;
        y=point.y;
    });
    var result=[];
    if($.pagemenuname()!="business" && options.circleConnect){
        var circleX=0;
        var circleY=0;
        var delta=0;
        if(options.points && options.points.length>1){
            if(options.function=="consumer"){
                switch (Math.sign(options.points[options.points.length-1].x-options.points[options.points.length-2].x)){
                    case 1:
                        delta=0.15;
                        break;
                    case -1:
                        delta=-0.08;
                        break;
                    case 0:
                        delta=0.04;
                        break;
                }
                circleX=options.points[options.points.length-1].x+delta;
                switch (Math.sign(options.points[options.points.length-2].y-options.points[options.points.length-1].y)){
                    case 1:
                        delta=-0.06;
                        break;
                    case -1:
                        delta=0.15;
                        break;
                    case 0:
                        delta=0.04;
                        break;
                }
               circleY=options.points[options.points.length-1].y+delta;
            }
            else{
                switch (Math.sign(options.points[1].x-options.points[0].x)){
                    case 1:
                        delta=-0.08;
                        break;
                    case -1:
                        delta=0.15;
                        break;
                    case 0:
                        delta=0.03;
                        break;
                }
                circleX=options.points[0].x+delta;
                switch (Math.sign(options.points[1].y-options.points[0].y)){
                    case 1:
                        delta=-0.08;
                        break;
                    case -1:
                        delta=0.17;
                        break;
                    case 0:
                        delta=0.05;
                        break;
                }
                circleY=options.points[0].y+delta;
            }
        }
        options.circleConnect=elID;
        var point=$.xml("Shape",{
            ID:elID++,
            NameU:"Интерфейс",
            Name:"Интерфейс/последовательность",
            Type:"Shape",
            Master:"12"
        }).append(
            $.xml("Cell",{V:circleX, N:"PinX",U:Unit}),
            $.xml("Cell",{V:circleY, N:"PinY",U:Unit}),
            $.xml("Section", {
                N:"Character"
            }).append(
                $.xml("Row",{
                    IX:"0"
                }).append(
                    $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                    $.xml("Cell",{ V:"0.1385", N:"Size", U:"PT", F:"No Function"}),
                )
            ),
            $.xml("Text",{
                text:'<cp IX="0"/><pp IX="0"/><tp IX="0"/>' + options.number
            }),
        );
        result.push(point);
    }
    var lineID=elID;
    var hasBegin = (options.function=="consumer" && options.elementConnect || options.circleConnect);
    var hasEnd = (options.function=="consumer" && options.circleConnect || options.elementConnect);
    var charsection = $.xml("Section", {
        N:"Character"
    });
    var txt="";
    var txtsp = options.data.split(',');
 
    txt+="<cp IX='0'/><pp IX='0'/><tp IX='0'/>";
    $.each(txtsp,function(i,e){
        txt+=(i>0?",":"") + e;
    });
    if(options.functionname)
        txt+=' [' +options.functionname+']';
    txt+="<cp IX='1'/>";
    charsection = charsection.append(
        $.xml("Row",{
            IX:0
        }).append(
            $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
            $.xml("Cell",{ V:"0.1285", N:"Size", U:"PT", F:"No Function"}),
        ),
        $.xml("Row",{
            IX:1
        }).append(
            $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
            $.xml("Cell",{ V:"0.1285", N:"Size", U:"PT", F:"No Function"}),
        ),
    );
    var line=$.xml("Shape",{
        ID:elID++,
        NameU:"Интеграционный поток",
        Name:"Интеграционный поток",
        Type:"Shape",
        Master:"9"
    }).append(
        $.xml("Cell",{V:(x+xTxt)/2, N:"PinX",F:"GUARD((BeginX+EndX)/2)"}),
        $.xml("Cell",{V:(y+yTxt)/2, N:"PinY",F:"GUARD((BeginY+EndY)/2)"}),
        $.xml("Cell",{V:(x-xTxt)/2, N:"LocPinX",F:"GUARD(Width*0.5)"}),
        $.xml("Cell",{V:(y-yTxt)/2, N:"LocPinY",F:"GUARD(Height*0.5)"}),
        $.xml("Cell",{V:xTxt, N:"BeginX",U:Unit,F:(hasBegin?"_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:yTxt, N:"BeginY",U:Unit,F:(hasBegin?"_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:x, N:"EndX",U:Unit,F:(hasEnd?"_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:y, N:"EndY",U:Unit,F:(hasEnd?"_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:0, N:"LayerMember"}),
        $.xml("Cell",{V:(options.interaction=="Асинхронное"?12:13), N:"EndArrow"})
    );
    if(options.weight){
        line.append(
            $.xml("Cell",{V:options.weight, N:"LineWeight"})
        )
    }
    switch(options.style){
        case "rectangle":
            line.append(
                $.xml("Cell",{V:x-xTxt, N:"Width",F:"GUARD(EndX-BeginX)"}),
                $.xml("Cell",{V:y-yTxt, N:"Height",F:"GUARD(EndY-BeginY)"}),
                $.xml("Cell",{V:1, N:"ShapeRouteStyle"})
            )
            break;
        case "direct":
            line.append(
                $.xml("Cell",{V:16, N:"ShapeRouteStyle"}),
                $.xml("Cell",{V:0, N:"ConFixedCode"})
            )
            break;
    }
    if(options.text){
        line.append(
            $.xml("Cell",{V:options.text.x-xTxt, N:"TxtPinX",F:"Inh"}),
            $.xml("Cell",{V:(options.text.width)/2, N:"TxtLocPinX",F:"Inh"}),
            $.xml("Cell",{V: options.text.width, N:"TxtWidth",U:Unit,F:"GUARD(" + options.text.width.toString() + ")"}),
    
            $.xml("Cell",{V:options.text.y-yTxt, N:"TxtPinY",F:"Inh"}),
            $.xml("Cell",{V:(options.text.height)/2, N:"TxtLocPinY",F:"Inh"}),
    
            $.xml("Section", {
                N:"Control"
            }).append($.xml("Row",{
                    N:"TextPosition"
                }).append(
                    $.xml("Cell",{ V:options.text.x-xTxt, N:"X"}),
                    $.xml("Cell",{ V:options.text.y-yTxt, N:"Y"}),
                    $.xml("Cell",{ V:options.text.x-xTxt, N:"XDyn", F:"Inh"}),
                    $.xml("Cell",{ V:options.text.y-yTxt, N:"YDyn", F:"Inh"})
            )),
        )
    }
    line.append(
        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
        $.xml("Cell",{V:2,N:"BegTrigger",F:(hasBegin?"_XFTRIGGER(Sheet." + (options.function=="consumer"?options.elementConnect:options.circleConnect) + "!EventXFMod)":"Inh")}),
        $.xml("Cell",{V:2,N:"EndTrigger",F:(hasEnd?"_XFTRIGGER(Sheet." + (options.function=="consumer"?options.circleConnect:options.elementConnect) + "!EventXFMod)":"Inh")}),

        charsection,
        geometry,
        $.xml("Text",{
            text:options.textlist
        })
    );
    result.push(line);
    var connectors=[];
    if(hasBegin)
       connectors.push($.xml("Connect",{ToCell:"PinX",ToSheet:(options.function=="consumer"?options.elementConnect:options.circleConnect),FromCell:"BeginX",FromSheet:lineID}));
    if(hasEnd)
        connectors.push($.xml("Connect",{ToCell:"PinX",ToSheet:(options.function=="consumer"?options.circleConnect:options.elementConnect),FromCell:"EndX",FromSheet:lineID}));
    return [result,connectors];
}
$.visiodataholder = function(options){
    //var B=options.width*0.04;
    //var D=0.5*options.width/Math.min(options.width/8,options.height/4);
    //var DF="0.5*Width/(MIN(Width/Scratch.A1,Height/4))";
    var Y=options.height*0.98;
    var B=options.height*0.96;
    var D=options.width*10;//20.49644097224691;
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"Хранение",
        Name:"Хранилище данных",
        Type:"Shape",
        Master:"5"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:options.width/2, N:"TxtPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2+0.07, N:"TxtPinY",F:"Inh"}),
        $.xml("Cell",{V: options.width-0.07, N:"TxtWidth",U:Unit}),
        $.xml("Cell",{V:options.height, N:"TxtHeight",U:Unit}),
        $.xml("Cell",{V:options.width/2-0.035, N:"TxtLocPinX",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:options.height/2+0.07, N:"TxtLocPinY",U:Unit}),
        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
        $.xml("Section", {
            N:"Character"
        }).append($.xml("Row",{
                IX:"0"
            }).append(
                $.xml("Cell", { V: getStateColor(options.state), N:"Color"}),
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:"0.1385", N:"Size", U:"PT"}),
            )),
        $.xml("Section", {
            N:"Control"
        }).append(
            $.xml("Row",{N:"Row_1"}).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:B, N:"Y", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:B, N:"YDyn", F:"Inh"})
            ),
            $.xml("Row",{N:"Row_2"}).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"YDyn", F:"Inh"})
            )
        ),
            /*$.xml("Section", {
            N:"Control"
        }).append(
            $.xml("Row",{N:"Row_1"}).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:options.height-B, N:"Y", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:options.height-B, N:"YDyn", F:"Inh"})
            ),
            $.xml("Row",{N:"Row_2"}).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:options.height-2*B, N:"Y", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:options.height-2*B, N:"YDyn", F:"Inh"})
            )
        ),*/
        $.xml("Section",{
            N:"Geometry",
            IX:"0"
        }).append(
            $.xml("Row",{IX:"1",T:"MoveTo"}).append(
                $.xml("Cell",{V:Y,N:"Y",F:"Inh"})
            ),
            $.xml("Row",{IX:"2",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                $.xml("Cell",{V:Y,N:"Y",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:options.height,N:"B",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:"Inh"})
            ),
            $.xml("Row",{IX:"3",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:Y,N:"Y",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:B,N:"B",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:"Inh"})
            )
        ),
        $.xml("Section",{
            N:"Geometry",
            IX:"1"
        }).append(
            $.xml("Row",{IX:"1",T:"MoveTo"}).append(
                $.xml("Cell",{V:Y,N:"Y",F:"Inh"})
            ),
            $.xml("Row",{IX:"3",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:"Inh"})
            ),
            $.xml("Row",{IX:"4",T:"LineTo"}).append(
                $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                $.xml("Cell",{V:Y,N:"Y",F:"Inh"})
            ),
            $.xml("Row",{IX:"5",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:Y,N:"Y",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:B,N:"B",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:"Inh"})
            )
        )
        /*$.xml("Section",{
            N:"Geometry",
            IX:"0"
        }).append(
            $.xml("Row",{IX:"1",T:"MoveTo"}).append(
                $.xml("Cell",{V:0,N:"X",F:"Inh"}),
                $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
            ),
            $.xml("Row",{IX:"2",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                $.xml("Cell",{V:options.height,N:"Y",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:options.height+B,N:"B",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:DF})
            ),
            $.xml("Row",{IX:"3",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:options.height,N:"Y",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:options.height-B,N:"B",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:DF})
            )
        ),
        $.xml("Section",{
            N:"Geometry",
            IX:"1"
        }).append(
            $.xml("Row",{IX:"1",T:"MoveTo"}).append(
                $.xml("Cell",{V:0,N:"X",F:"Inh"}),
                $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
            ),
            $.xml("Row",{IX:"3",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:DF})
            ),
            $.xml("Row",{IX:"4",T:"LineTo"}).append(
                $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
            ),
            $.xml("Row",{IX:"5",T:"EllipticalArcTo"}).append(
                $.xml("Cell",{V:options.height,N:"Y",F:"Inh"}),
                $.xml("Cell",{V:options.width/2,N:"A",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:options.height-B,N:"B",F:"Inh",U:"DL"}),
                $.xml("Cell",{V:D,N:"D",F:DF})
            )
        )*/
    );
    if(options.text){
        element.append(
            $.xml("Text",{
                text:'<cp IX="0"/>' + options.text
            })
        );
    }
    return element;
}
$.visiodata = function(options){
    var TxtHeight = 0.7;
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"Данные",
        Name:"Данные",
        Type:"Shape",
        Master:"6"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:options.width/2, N:"TxtPinX",F:"Inh"}),
        $.xml("Cell",{V: options.width, N:"TxtWidth",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:options.width/2, N:"TxtLocPinX",U:Unit,F:"Inh"}),
 
        $.xml("Cell",{V:options.height/2+0.07, N:"TxtPinY",F:"Inh"}),
        $.xml("Cell",{V:options.height-0.07, N:"TxtHeight",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:options.height/2+0.07, N:"TxtLocPinY",F:"Inh"}),
 
        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
        $.xml("Cell",{V:getFlowtypeColor(options.flowtype), N:"FillForegnd"}),
        $.xml("Section", {
            N:"Character"
        }).append($.xml("Row",{
                IX:"0"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:"0.135", N:"Size", U:"PT"})
            )),
        $.xml("Text",{
            text:'<cp IX="0"/><pp IX="0"/><tp IX="0"/>' + options.text
        })
    );
    return element;
}
$.visiosystem = function(options){
    var TxtHeight = 0.7;
    //var TxtMargin = 0.05;
    elementIDConnect[options.id]=(elID+1);
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"Системное ПО",
        Name:"Системное ПО",
        Type:"Group",
        Master:"15"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:"0.04", N:"TxtPinX",U:Unit,F:"Inh"}),
        $.xml("Cell",{V: options.height-0.04, N:"TxtPinY",U:Unit,F:"Inh"}),
        $.xml("Cell",{V: options.width-0.3, N:"TxtWidth",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:TxtHeight, N:"TxtHeight",U:Unit,F:"Inh"}),
        $.xml("Cell",{V:TxtHeight, N:"TxtLocPinY",U:Unit,F:"Inh"}),
        $.xml("Section", {
            N:"Character"
        }).append(
            $.xml("Row",{
                IX:"0"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:"0.125", N:"Size", U:"PT"}),
            ),
            $.xml("Row",{
                IX:"1"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:"0.125", N:"Size", U:"PT"}),
            )
        ),
        $.xml("Section", {
            N:"Control"
        }).append($.xml("Row",{
                N:"FigSize"
            }).append(
                $.xml("Cell",{ V:options.width/2, N:"X", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"Y", F:"Inh"}),
                $.xml("Cell",{ V:options.width/2, N:"XDyn", F:"Inh"}),
                $.xml("Cell",{ V:options.height/2, N:"YDyn", F:"Inh"})
            )),
        $.xml("Text",{
            text:'<cp IX="0"/><cp IX="1"/>' + options.text
        }),
        $.xml("Shapes").append(
            $.xml("Shape",{
                ID:elID++,
                NameU:"Rectangle.719",
                IsCustomNameU:"1",
                Name:"AppComponentBase",
                IsCustomName:"1",
                Type:"Shape",
                MasterShape:"17"
            }).append(
                $.xml("Cell",{V:options.width/2, N:"PinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"PinY",F:"Inh"}),
                $.xml("Cell",{V:options.width, N:"Width",F:"Inh"}),
                $.xml("Cell",{V:options.height, N:"Height",F:"Inh"}),
                $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
                $.xml("Section",{
                    N:"Geometry",
                    IX:"0"
                }).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.width,N:"X",F:"Inh"})
                    ),
                    $.xml("Row",{IX:"3",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.width,N:"X",F:"Inh"}),
                        $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
                    ),
                    $.xml("Row",{IX:"4",T:"LineTo"}).append(
                        $.xml("Cell",{V:options.height,N:"Y",F:"Inh"})
                    )
                )
            ),
            $.xml("Shape",{
                ID:elID++,
                NameU:"Application component 2.1105",
                IsCustomNameU:"1",
                Name:"AppComponentSymbol",
                IsCustomName:"1",
                Type:"Group",
                MasterShape:"18"
            }).append(
                $.xml("Cell",{V:options.width-0.04, N:"PinX",U:"PT",F:"Inh"}),
                $.xml("Cell",{V:options.height-0.04, N:"PinY",U:"PT",F:"Inh"}),
                $.xml("Shapes").append(
                    $.xml("Shape",{ID:elID++,Type:"Shape",MasterShape:"30"}),
                    $.xml("Shape",{ID:elID++,Type:"Shape",MasterShape:"20"})
                )
            )
        )
    );
    return element;
}
$.visiozone = function (options) {
    var TxtMargin = 0.05;
    if(options.id)
        elementIDConnect[options.id] = elID;
    var element = $.xml("Shape", {
        ID: elID++,
        NameU: "Сегмент",
        Name: "Сегмент сети",
        Type: "Shape",
        Master: "30"
    }).append(
        $.xml("Cell", { V: options.x + options.width / 2, N: "PinX" }),
        $.xml("Cell", { V: options.y - options.height / 2, N: "PinY" }),
        $.xml("Cell", { V: options.width, N: "Width" }),
        $.xml("Cell", { V: options.height, N: "Height" }),
        $.xml("Cell", { V: options.width / 2, N: "LocPinX", F: "Inh" }),
        $.xml("Cell", { V: options.height / 2, N: "LocPinY", F: "Inh" }),
        $.xml("Cell", { V: "Сегмент сети", N: "Comment", F: "Inh" }),
        $.xml("Cell", { V: options.width / 2, N: "TxtPinX", F: "Inh" }),
        $.xml("Cell", { V: options.height / 2, N: "TxtPinY", F: "Inh" }),
        $.xml("Cell", {V: options.width - TxtMargin * 2, N: "TxtWidth", F: "Width-" + TxtMargin * 2}),
        $.xml("Cell", {V: options.height - TxtMargin * 2, N: "TxtHeight", F: "Height-" + TxtMargin * 2}),
        $.xml("Cell", {V: options.width / 2 - TxtMargin, N: "TxtLocPinX", F: "Width*0.5-" + TxtMargin}),
        $.xml("Cell", {V: options.height / 2 - TxtMargin, N: "TxtLocPinY", F: "Height*0.5-" + TxtMargin}),
        $.xml("Cell", { V: options.color, N: "FillForegnd" }),
        $.xml("Cell", { V: options.color, N: "FillBkgnd" }),
        $.xml("Section", {
            N: "Geometry",
            IX: "0"
        }).append(
            $.xml("Row", { IX: "2", T: "LineTo" }).append(
                $.xml("Cell", { V: options.width, N: "X", F: "Inh" })
            ),
            $.xml("Row", { IX: "3", T: "LineTo" }).append(
                $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
            ),
            $.xml("Row", { IX: "4", T: "LineTo" }).append(
                $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
            )
        ),
        $.xml("Section", {
            N: "Character"
        }).append($.xml("Row", {
            IX: "1"
        }).append(
            $.xml("Cell", { V: "Themed", N: "Font", F: "THEMEVAL()" }),
            $.xml("Cell", { V: "0.135", N: "Size", U: "PT" })
        )),
        $.xml("Text", {
            text: '<cp IX="0"/><cp IX="1"/>' + options.text
        })
    );
    return element;
}
$.visiolegend = function(options){
    elementIDConnect[options.id]=elID;
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"Легенда КД.34",
        Name:"КД - Легенда.34",
        Type:"Group",
        Master:"34"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Shapes").append(
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:5}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:6, Name:"Скругленный прямоугольник.280", NameU:"Rounded Rectangle.280", IsCustomName:"1", IsCustomNameU:"1"}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:7, Name:"Скругленный прямоугольник.282", NameU:"Rounded Rectangle.282", IsCustomName:"1", IsCustomNameU:"1"}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:8}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:9}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:10, Name:"Dynamic connector.808", NameU:"Dynamic connector.808", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:0.1968503937007874, N:"Height", F:"GUARD(0.19685039370079DL)"}),
                $.xml("Cell",{V:"0", N:"LayerMember",}),
                $.xml("Section",{N:"Control"}).append(
                    $.xml("Row",{N:"TextPosition"}).append(
                        $.xml("Cell",{V:0.1931733164612466,N:"X"})
                    ),
                ),
                $.xml("Section",{N:"Geometry", IX:0}).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:0.4211328422656067,N:"X"})
                    )
                )
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:11}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:12, Name:"Dynamic connector.822", NameU:"Dynamic connector.822", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:0.1968503937007874, N:"Height", F:"GUARD(0.19685039370079DL)"}),
                $.xml("Cell",{V:"0", N:"LayerMember",}),
                $.xml("Section",{N:"Control"}).append(
                    $.xml("Row",{N:"TextPosition"}).append(
                        $.xml("Cell",{V:0.1931733164612466,N:"X"})
                    ),
                ),
                $.xml("Section",{N:"Geometry", IX:0}).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:0.4211328422656067,N:"X"})
                    )
                )
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:13}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:14, Name:"Dynamic connector.815", NameU:"Dynamic connector.815", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:0.1968503937007874, N:"Height", F:"GUARD(0.19685039370079DL)"}),
                $.xml("Cell",{V:"0", N:"LayerMember",}),
                $.xml("Section",{N:"Control"}).append(
                    $.xml("Row",{N:"TextPosition"}).append(
                        $.xml("Cell",{V:0.1931733164612466,N:"X"})
                    ),
                ),
                $.xml("Section",{N:"Geometry", IX:0}).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:0.4211328422656067,N:"X"})
                    )
                )
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:15}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:16, Name:"Скругленный прямоугольник.817", NameU:"Rounded Rectangle.817", IsCustomName:"1", IsCustomNameU:"1"}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:17}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:18, Name:"Dynamic connector.822", NameU:"Dynamic connector.822", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:0.1968503937007874, N:"Height", F:"GUARD(0.19685039370079DL)"}),
                $.xml("Cell",{V:"0", N:"LayerMember",}),
                $.xml("Section",{N:"Control"}).append(
                    $.xml("Row",{N:"TextPosition"}).append(
                        $.xml("Cell",{V:0.1931733164612466,N:"X"})
                    ),
                ),
                $.xml("Section",{N:"Geometry", IX:0}).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:0.4211328422656067,N:"X"})
                    )
                )
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:19}),
            $.xml("Shape",{Type:"Group",ID:elID++, MasterShape:20, Name:"AppComponentSymbol", NameU:"Application component 2.1254", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Shapes").append(
                    $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:21}),
                    $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:22}),
                    $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:23})
                )
            ),
            $.xml("Shape",{Type:"Group",ID:elID++, MasterShape:26, Name:"AppFunctionSymbol", NameU:"Application component 2.1260", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Shapes").append(
                    $.xml("Shape",{Type:"Guide",ID:elID++, MasterShape:27}),
                    $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:28})
                )
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:29}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:31}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:32, Name:"Интерфейс/последовательность.1266", NameU:"Интерфейс.1266", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:"0;1",N:"LayerMember"})
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:33}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:34, Name:"Платформа.1268", NameU:"Платформа.1268", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:"2",N:"LayerMember"})
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:41, Name:"Скругленный прямоугольник.37", NameU:"Rounded Rectangle.37", IsCustomName:"1", IsCustomNameU:"1"}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:42}),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:43, Name:"Dynamic connector.43", NameU:"Dynamic connector.43", IsCustomName:"1", IsCustomNameU:"1"}).append(
                $.xml("Cell",{V:-0.1968503937007874, N:"Height", F:"GUARD(-0.19685039370079DL)"}),
                $.xml("Cell",{V:"0", N:"LayerMember",}),
                $.xml("Section",{N:"Control"}).append(
                    $.xml("Row",{N:"TextPosition"}).append(
                        $.xml("Cell",{V:0.1931733164612466,N:"X"})
                    ),
                ),
                $.xml("Section",{N:"Geometry", IX:0}).append(
                    $.xml("Row",{IX:"2",T:"LineTo"}).append(
                        $.xml("Cell",{V:0.4211328422656049,N:"X"})
                    )
                )
            ),
            $.xml("Shape",{Type:"Shape",ID:elID++, MasterShape:44}),
        )
    );
    return element;
}
var getHexColor=function(color){
    var div = $('<div></div>').appendTo("body").css('background-color', color);
    var computedStyle = window.getComputedStyle(div[0]);
    //console.log(computedStyle.backgroundColor);
    var vl="#"+rgba2hex(computedStyle.backgroundColor);
    //console.log(vl);
    div.remove();
    return vl;
}
$.visiocomment = function(options){
    elementIDConnect[options.id]=elID;
    var element=$.xml("Shape",{
        ID:elID++,
        NameU:"КД - Фукнциональный процес ",
        Name:"КД - Фукнциональный процес ",
        Master:"31"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:0.9, N:"FillForegndTrans"}),
        $.xml("Cell",{V:0.9, N:"FillBkgndTrans"}),
        $.xml("Cell",{V:0, N:"FillGradientEnabled"}),
        $.xml("Section", {N: "Geometry",IX: "0"}).append(
            $.xml("Row", { IX: "2", T: "LineTo" }).append(
                $.xml("Cell", { V: options.width, N: "X", F: "Inh" })
            ),
            $.xml("Row", { IX: "3", T: "LineTo" }).append(
                $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
            ),
            $.xml("Row", { IX: "4", T: "LineTo" }).append(
                $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
            )
        ),
        $.xml("Section", {N: "Character"}).append(
            $.xml("Row", {IX: "1"}).append(
                $.xml("Cell", { V: "Themed", N: "Font", F: "THEMEVAL()" }),
                $.xml("Cell",{ V:"0.135", N:"Size", U:"PT"}),
                $.xml("Cell",{ V:"0", N:"Style"})
            ),
            $.xml("Row", {IX: "2"}).append(
                $.xml("Cell", { V: "Themed", N: "Font", F: "THEMEVAL()" }),
                $.xml("Cell", { V: "0.11", N: "Size", U: "PT" }),
                $.xml("Cell",{ V:"0", N:"Style"})
            )
        ),
        $.xml("Text", {
            text: '<cp IX="0"/><cp IX="1"/>' + options.caption + '<cp IX="2"/>' + '\n' + options.description
        })
    );
    return element;
}
function rgba2hex(orig) {
    var a, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ?
      (rgb[1] | 1 << 8).toString(16).slice(1) +
      (rgb[2] | 1 << 8).toString(16).slice(1) +
      (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
        if (alpha !== "") {
          a = alpha;
        } else {
          a = 0;
        }
        a = Math.round(a * 100) / 100;
          var alpha = Math.round(a * 255);
          var hexAlpha = (alpha + 0x10000).toString(16).substr(-2).toUpperCase();
          hex = hex;// + hexAlpha;
    return hex;
}
$.visiopicture = function(options){
    elementIDConnect[options.id]=elID;
    var picture=$.xml("Shape",{
        ID:elID++,
        NameU:"Пользователь",
        Name:"Пользователь",
        Type:"Foreign",
        Master:options.master
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.imagewidth, N:"Width"}),
        $.xml("Cell",{V:options.imageheight, N:"Height"}),
        $.xml("Cell",{V:options.imagewidth/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.imageheight/2, N:"LocPinY",F:"Inh"}),
 
        $.xml("Cell",{V:options.imagewidth, N:"ImgWidth",F:"Inh"}),
        $.xml("Cell",{V:options.imageheight, N:"ImgHeight",F:"Inh"}),
 
        $.xml("Cell",{V:-0.029, N:"TxtPinY",F:"Inh"}),

        $.xml("Cell",{V:options.imagewidth/2, N:"TxtPinX",F:"Inh"}),
        $.xml("Cell",{V:options.width, N:"TxtWidth",F:"Inh"}),
        $.xml("Cell",{V:options.width/2, N:"TxtLocPinX",F:"Inh"}),

        $.xml("Section", {
            N:"Character"
        }).append(
            $.xml("Row",{
                IX:"0"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:(options.fontsize?options.fontsize:"0.1385"), N:"Size", U:"PT"}),
            ),
            $.xml("Row",{
                IX:"1"
            }).append(
                $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
                $.xml("Cell",{ V:(options.fontsize?options.fontsize:"0.1385"), N:"Size", U:"PT"}),
            )
        ),
        $.xml("Text",{
            text:'<cp IX="0"/><cp IX="1"/>' + options.text
        }),
    );
    return picture;
}
$.visioflow = function(options){
    var geometry = $.xml("Section",{
        N:"Geometry",
        IX:"0"
    });
    var x=0, y=0;
    var xTxt=0, yTxt=0;
    $.each(options.points,function(i,point) {
        if(i==0){
            geometry.append(
                $.xml("Row",{IX:i+1,T:"MoveTo"}).append(
                    $.xml("Cell",{V:0,N:"X"}),
                    $.xml("Cell",{V:0,N:"Y"})
                )
            )
            xTxt=point.x;
            yTxt=point.y;
        }
        else{
            geometry.append(
                $.xml("Row",{IX:i+1,T:"LineTo"}).append(
                    $.xml("Cell",{V:point.x-xTxt,N:"X"}),
                    $.xml("Cell",{V:point.y-yTxt,N:"Y"})
                )
            )
        }
        x=point.x;
        y=point.y;
    });
    var result=[];
    var lineID=elID;
    var hasBegin = (options.function=="consumer" && options.elementConnect || options.circleConnect);
    var hasEnd = (options.function=="consumer" && options.circleConnect || options.elementConnect);
    var charsection = $.xml("Section", {
        N:"Character"
    });
    var txt="";
    var txtsp = options.data.split(',');
    txt+="<cp IX='0'/><pp IX='0'/><tp IX='0'/>";
    $.each(txtsp,function(i,e){
        txt+=(i>0?",":"") + e;
    });
    /*if(options.functionname)
        txt+=' [' +options.functionname+']';*/
    txt+="<cp IX='1'/>";
    charsection = charsection.append(
        $.xml("Row",{
            IX:0
        }).append(
            $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
            $.xml("Cell",{ V:"0.1385", N:"Size", U:"PT", F:"No Function"}),
        ),
        $.xml("Row",{
            IX:1
        }).append(
            $.xml("Cell",{ V:"Themed", N:"Font", F:"THEMEVAL()"}),
            $.xml("Cell",{ V:"0.1385", N:"Size", U:"PT", F:"No Function"}),
        ),
    );
    var line=$.xml("Shape",{
        ID:elID++,
        NameU:"Взаимодействие с пользователем",
        Name:"Взаимодействие с пользователем",
        Type:"Shape",
        Master:"24"
   }).append(
        $.xml("Cell",{V:(x+xTxt)/2, N:"PinX",F:"GUARD((BeginX+EndX)/2)"}),
        $.xml("Cell",{V:(y+yTxt)/2, N:"PinY",F:"GUARD((BeginY+EndY)/2)"}),
        $.xml("Cell",{V:(x-xTxt)/2, N:"LocPinX",F:"GUARD(Width*0.5)"}),
        $.xml("Cell",{V:(y-yTxt)/2, N:"LocPinY",F:"GUARD(Height*0.5)"}),
        $.xml("Cell",{V:xTxt, N:"BeginX",U:Unit,F:(hasBegin?"_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:yTxt, N:"BeginY",U:Unit,F:(hasBegin?"_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:x, N:"EndX",U:Unit,F:(hasEnd?"_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:y, N:"EndY",U:Unit,F:(hasEnd?"_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)":"Inh")}),
        $.xml("Cell",{V:0, N:"LayerMember"}),
        $.xml("Cell",{V:13, N:"EndArrow"})
   );
   if(options.weight){
        line.append(
            $.xml("Cell",{V:options.weight, N:"LineWeight"})
        )
    }
    switch(options.style){
        case "rectangle":
            line.append(
                $.xml("Cell",{V:x-xTxt, N:"Width",F:"GUARD(EndX-BeginX)"}),
                $.xml("Cell",{V:y-yTxt, N:"Height",F:"GUARD(EndY-BeginY)"}),
                $.xml("Cell",{V:1, N:"ShapeRouteStyle"})
            )
            break;
        case "direct":
            line.append(
                $.xml("Cell",{V:16, N:"ShapeRouteStyle"}),
                $.xml("Cell",{V:0, N:"ConFixedCode"})
            )
            break;
    }
    if(options.text){
        line.append(
            $.xml("Cell",{V:options.text.x-xTxt, N:"TxtPinX",F:"Inh"}),
            $.xml("Cell",{V:(options.text.width)/2, N:"TxtLocPinX",F:"Inh"}),
            $.xml("Cell",{V: options.text.width, N:"TxtWidth",U:Unit,F:"GUARD(" + options.text.width.toString() + ")"}),
    
            $.xml("Cell",{V:options.text.y-yTxt, N:"TxtPinY",F:"Inh"}),
            $.xml("Cell",{V:(options.text.height)/2, N:"TxtLocPinY",F:"Inh"}),
        
            $.xml("Section", {
                N:"Control"
            }).append($.xml("Row",{
                    N:"TextPosition"
                }).append(
                    $.xml("Cell",{ V:options.text.x-xTxt, N:"X"}),
                $.xml("Cell",{ V:options.text.y-yTxt, N:"Y"}),
                    $.xml("Cell",{ V:options.text.x-xTxt, N:"XDyn", F:"Inh"}),
                    $.xml("Cell",{ V:options.text.y-yTxt, N:"YDyn", F:"Inh"})
            ))
        );
    }
    line.append(
        $.xml("Cell",{V:getStateColor(options.state), N:"LineColor"}),
        $.xml("Cell",{V:2,N:"BegTrigger",F:(hasBegin?"_XFTRIGGER(Sheet." + (options.function=="consumer"?options.elementConnect:options.circleConnect) + "!EventXFMod)":"Inh")}),
        $.xml("Cell",{V:2,N:"EndTrigger",F:(hasEnd?"_XFTRIGGER(Sheet." + (options.function=="consumer"?options.circleConnect:options.elementConnect) + "!EventXFMod)":"Inh")}),
        charsection,
        geometry,
        $.xml("Text",{
            text:options.textlist//'<cp IX="0"/><cp IX="1"/>' + options.data + ' ' + (options.functionname?'<cp IX="2"/>[' +options.functionname+"]":"")
        }),
    );
    result.push(line);
    var connectors=[];
    if(hasBegin)
       connectors.push($.xml("Connect",{ToCell:"PinX",ToSheet:(options.function=="consumer"?options.elementConnect:options.circleConnect),FromCell:"BeginX",FromSheet:lineID}));
    if(hasEnd)
        connectors.push($.xml("Connect",{ToCell:"PinX",ToSheet:(options.function=="consumer"?options.circleConnect:options.elementConnect),FromCell:"EndX",FromSheet:lineID}));
    return [result,connectors];
}
$.visiolabel = function(options){
    elementIDConnect[options.id]=elID;
    var element=$.xml("Shape",{
        ID:elID++,
        TextStyle:"3",
        FillStyle:"3",
        LineStyle:"1"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Cell",{V:0, N:"Angle"}),
        $.xml("Cell",{V:0, N:"FlipX"}),
        $.xml("Cell",{V:0, N:"FlipY"}),
        $.xml("Cell",{V:2, N:"VerticalAlign"}),

        $.xml("Section", {N: "Geometry",IX: "0"}).append(
            $.xml("Cell",{V:0, N:"NoFill"}),
            $.xml("Cell",{V:0, N:"NoLine"}),
            $.xml("Cell",{V:0, N:"NoShadow"}),
            $.xml("Cell",{V:0, N:"NoSnap"}),
            $.xml("Row", { IX: "2", T: "LineTo" }).append(
                $.xml("Cell", { V: options.width, N: "X", F: "Inh" })
            ),
            $.xml("Row", { IX: "3", T: "LineTo" }).append(
                $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
            ),
            $.xml("Row", { IX: "4", T: "LineTo" }).append(
                $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
            )
        ),
        $.xml("Section", {N: "Paragraph"}).append(
            $.xml("Row", {IX: "0"}).append(
                $.xml("Cell",{ V:"2", N:"HorzAlign"})
            )
        ),
        $.xml("Section", {N: "Character"}).append(
            $.xml("Row", {IX: "0"}).append(
                $.xml("Cell",{ V:"0.05", N:"Size", U:"PT"}),
                $.xml("Cell",{ V:"0", N:"Style"})
            )
        ),
        $.xml("Text", {
            text: '<cp IX="0"/><pp IX="0"/>' + options.caption 
        })
    );
    return element;
}
$.visioswimlinecontainer = function(options){
    var sls=[
        $.xml("Shape",{
            ID:elID++,
            NameU:"CFF Container",
            Name:"Контейнер CFF",
            Type:"Group",
            Master:"38"
        }).append(
            $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
            $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
            $.xml("Cell",{V:options.width, N:"Width"}),
            $.xml("Cell",{V:options.height, N:"Height"}),
            $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
            $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
            $.xml("Section", {
                N: "User"
            }).append(
                $.xml("Row", {N: "msvSDContainerLocked" }).append(
                    $.xml("Cell", { V: 1, N: "Value", F: "BOOL" })
                ),
                $.xml("Row", {N: "CFFVertical" }).append(
                    $.xml("Cell", { V: 1, N: "Value"})
                ),
                $.xml("Row", {N: "numLanes" }).append(
                    $.xml("Cell", { V: options.lines, N: "Value" })
                ),
                $.xml("Row", {N: "visShowTitle" }).append(
                    $.xml("Cell", { V: 1, N: "Value", F:"1+DEPENDSON(User.numLanes)"})
                ),
            ),
            $.xml("Shapes", {
                }).append($.xml("Shape",{
                    ID:elID++,
                    Type:"Shape",
                    MasterShape:"6"
                }).append(
                    $.xml("Cell",{V:options.width/2, N:"PinX"}),
                    $.xml("Cell",{V:options.height/2, N:"PinY"}),
                    $.xml("Cell",{V:options.width, N:"Width"}),
                    $.xml("Cell",{V:options.height, N:"Height"}),
                    $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
                    $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
                    $.xml("Section", {
                        N: "Geometry",
                        IX: "0"
                    }).append(
                        $.xml("Row", { IX: "2", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh" })
                        ),
                        $.xml("Row", { IX: "3", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                            $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
                        ),
                        $.xml("Row", { IX: "4", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
                        )
                    )
                ),
                $.xml("Shape",{
                    ID:elID++,
                    Type:"Shape",
                    MasterShape:"7"
                }).append(
                    $.xml("Cell",{V:options.width/2, N:"PinX"}),
                    $.xml("Cell",{V:options.height-options.fontsize/*text height/2 */, N:"PinY"}),
                    $.xml("Cell",{V:options.width, N:"Width"}),
                    $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),

                    $.xml("Cell",{V:options.width/2, N:"TxtPinX",F:"Inh"}),
                    $.xml("Cell",{V:options.width, N:"TxtWidth",F:"Inh"}),
                    $.xml("Cell",{V:options.width/2, N:"TxtLocPinX",F:"Inh"}),
                    $.xml("Section", {
                        N: "Character"
                    }).append(
                        $.xml("Row", { IX: "0" }).append(
                            $.xml("Cell", { V: "0", N:"Color"}),
                            $.xml("Cell", { V: "0", N:"Style" }),
                            $.xml("Cell", { V: options.fontsize, N: "Size", U:"PT" }),
                            $.xml("Cell", { V: "0", N:"AsianFont"}),
                            $.xml("Cell", { V: "0", N:"ComplexScriptFont" })
                        )

                    ),
                    $.xml("Section", {
                        N: "Geometry",
                        IX: "0"
                    }).append(
                        $.xml("Row", { IX: "2", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                        ),
                        $.xml("Row", { IX: "3", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                        )
                    ),
                    $.xml("Section", {
                        N: "Geometry",
                        IX: "1"
                    }).append(
                        $.xml("Row", { IX: "2", T: "EllipticalArcTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh"}),
                            $.xml("Cell", { V: options.width/2, N: "A", F: "Inh"}),
                            $.xml("Cell", { V: "-2.938564086285567E-6", N: "C", F: "Inh"}),
                            $.xml("Cell", { V: 3.999999999870471, N: "D", F: "Inh"})
                        ),
                        $.xml("Row", { IX: "3", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                        )
                    ),
                    $.xml("Section", {
                        N: "Geometry",
                        IX: "2"
                    }).append(
                        $.xml("Row", { IX: "2", T: "LineTo" }).append(
                            $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                        )
                    ),
                    $.xml("Text",{
                        text:'<cp IX="0"/>' + options.text
                    })
                )
            )
        )/*,
        $.xml("Shape",{
            ID:elID++,
            NameU:"Swimlane List",
            Name:"Список дорожек",
            Type:"Shape",
            Master:"39",
            UniqueID:options.containerid
        }).append(
            $.xml("Cell",{V:1.468503937007902, N:"PinX"}),
            $.xml("Cell",{V:10.03937007874015, N:"PinY"}),
            $.xml("Cell",{V:2.952755905511809, N:"Width"}),
            $.xml("Cell",{V:8.070866141734552, N:"Height"}),
            $.xml("Cell",{V:8.070866141734552, N:"LocPinY",F:"Inh"}),
            $.xml("Section", {
                N: "User"
            }).append(
                $.xml("Row", {N: "msvSDContainerStyle" }).append(
                    $.xml("Cell", { V: 1, N: "Value", F: "IFERROR(CONTAINERSHEETREF(1)!User.VISCFFSTYLE,1)" })
                ),
                $.xml("Row", {N: "msvSDListDirection" }).append(
                    $.xml("Cell", { V: 0, N: "Value"})
                ),
                $.xml("Row", {N: "msvSDListItemMaster" }).append(
                    $.xml("Cell", { V: 254, N: "Value", F:"USE('Swimlane (vertical)')"})
                ),
                $.xml("Row", {N: "visHeadingHeight" }).append(
                    $.xml("Cell", { V: 0.3937007874015748, N: "Value", U:"MM"})
                ),
            ),
            $.xml("Section", {
                N: "Scratch"
            }).append(
                $.xml("Row", { IX: "0" }).append(
                    $.xml("Cell", { V: 0, N: "A", F: "IFERROR(SETF(GetRef(CONTAINERSHEETREF(1)!User.NUMLANES),LISTMEMBERCOUNT()),0)"}),
                )
            ),
            $.xml("Section", {
                N: "Geometry",
                IX: "0"
            }).append(
                $.xml("Row", { IX: "2", T: "LineTo" }).append(
                    $.xml("Cell", { V: 2.952755905511773, N: "X", F: "Inh" })
                ),
                $.xml("Row", { IX: "3", T: "LineTo" }).append(
                    $.xml("Cell", { V: 2.952755905511773, N: "X", F: "Inh" }),
                    $.xml("Cell", { V: 8.070866141734552, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "4", T: "LineTo" }).append(
                    $.xml("Cell", { V: 8.070866141734552, N: "Y", F: "Inh" })
                ),
            )
        )*/
    ];
    return sls;
}
$.visioswimline = function(options){
    var sl = $.xml("Shape",{
        ID:elID++,
        NameU:"Swimlane (vertical)",
        Name:"Дорожка (вертикальная)",
        Type:"Group",
        Master:"37"
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),
        $.xml("Section", {
            N: "User"
        }).append(
            $.xml("Row", {N: "RTL" }).append(
                $.xml("Cell", { V: 0, N: "Value", F: "IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,'CFF Container')!User.RTL,0)" })
            ),
            $.xml("Row", {N: "visRotateLabel" }).append(
                $.xml("Cell", { V: 0, N: "Value", F:"IFERROR(LISTSHEETREF()!User.VISROTATELABEL,0)"})
            ),
            $.xml("Row", {N: "visHeadingText" }).append(
                $.xml("Cell", { V: options.text, N: "Value", F:"Inh", U:"STR"})
            ),
            $.xml("Row", {N: "SwimlaneListGUID" }).append(
                $.xml("Cell", { V: options.containerid, N: "Value", U:"GUID"})
            ),
            $.xml("Row", {N: "LineWeight" }).append(
                $.xml("Cell", { V: 0.01041666666666667, N: "Value", F: "IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,'CFF Container')!LineWeight,THEMEVAL('LineWeight'))", U:"DT"})
            )
        ),
        $.xml("Shapes", {
            }).append($.xml("Shape",{
                ID:elID++,
                Type:"Shape",
                MasterShape:"6"
            }).append(
                $.xml("Cell",{V:options.width/2, N:"PinX"}),
                $.xml("Cell",{V:options.height/2, N:"PinY"}),
                $.xml("Cell",{V:options.width, N:"Width"}),
                $.xml("Cell",{V:options.height, N:"Height"}),
                $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
                $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"}),

                $.xml("Section", {
                    N: "Geometry",
                    IX: "0"
                }).append(
                    $.xml("Row", { IX: "2", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh" })
                    ),
                    $.xml("Row", { IX: "3", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                        $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
                    ),
                    $.xml("Row", { IX: "4", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
                    )
                )
            ),
            $.xml("Shape",{
                ID:elID++,
                Type:"Shape",
                MasterShape:"7"
            }).append(
                $.xml("Cell",{V:options.height-options.fontsize/*text height/2 */, N:"PinY"}),
                $.xml("Cell",{V:options.width/2, N:"PinX"}),
                $.xml("Cell",{V:options.width, N:"Width"}),
                $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),

                $.xml("Cell",{V:options.width/2, N:"TxtPinX",F:"Inh"}),
                $.xml("Cell",{V:options.width, N:"TxtWidth",F:"Inh"}),
                $.xml("Cell",{V:options.width/2, N:"TxtLocPinX",F:"Inh"}),
                $.xml("Section", {
                    N: "Character"
                }).append(
                    $.xml("Row", { IX: "0" }).append(
                        $.xml("Cell", { V: options.fontsize, N: "Size", U:"PT" })
                    )
                ),
                $.xml("Section", {
                    N: "Geometry",
                    IX: "0"
                }).append(
                    $.xml("Row", { IX: "2", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                    ),
                    $.xml("Row", { IX: "3", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                    )
                ),
                $.xml("Section", {
                    N: "Geometry",
                    IX: "1"
                }).append(
                    $.xml("Row", { IX: "2", T: "EllipticalArcTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh"}),
                        $.xml("Cell", { V: options.width/2, N: "A", F: "Inh"}),
                        $.xml("Cell", { V: "-2.938564086285567E-6", N: "C", F: "Inh"}),
                        $.xml("Cell", { V: 3.999999999870471, N: "D", F: "Inh"})
                    ),
                    $.xml("Row", { IX: "3", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                    )
                ),
                $.xml("Section", {
                    N: "Geometry",
                    IX: "2"
                }).append(
                    $.xml("Row", { IX: "2", T: "LineTo" }).append(
                        $.xml("Cell", { V: options.width, N: "X", F: "Inh", U:"MM" })
                    )
                ),
                $.xml("Text",{
                    text:'<cp IX="0"/>' + options.text
                })
            )
        )
    )
    return sl;
}
$.visioswimlinecontainer2 = function(options){
    var sls=[
    ];
    return sls;
}
$.visioswimlinelogic = function(options){
    elementIDConnect[options.id]=elID;
    var sl = $.xml("Shape",{
        ID:elID++,
        Type:"Shape",
        Master:options.master
    }).append(
        $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
        $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
        $.xml("Cell",{V:options.width, N:"Width"}),
        $.xml("Cell",{V:options.height, N:"Height"}),
        $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
        $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"})
    );
    if(options.color){
        sl.append(
            $.xml("Cell",{V:options.color, N:"FillForegnd"}),
        );
    }
    if(options.linename){
        sl.append(
            $.xml("Section", {
                N: "Property"
            }).append(
                $.xml("Row", { N: "Function" }).append(
                    $.xml("Cell", { V: options.linename, N: "Value", F: "IFERROR(CONTAINERSHEETREF(1,'Swimlane')!User.VISHEADINGTEXT,'')", U:"STR" })
                )
            )
        );
    }
    if(options.geometry=="circle"){
        sl.append(
            $.xml("Section", {
                N: "Geometry",
                IX: "0"
            }).append(
                $.xml("Row", { IX: "1", T: "MoveTo" }).append(
                    $.xml("Cell", { V: options.height/2, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "2", T: "EllipticalArcTo" }).append(
                    $.xml("Cell", { V: options.width, N: "X", F: "Inh"}),
                    $.xml("Cell", { V: options.height/2, N: "Y", F: "Inh"}),
                    $.xml("Cell", { V: options.width/2, N: "A", F: "Inh"}),
                    $.xml("Cell", { V: options.width, N: "B", F: "Inh"})
                ),
                $.xml("Row", { IX: "3", T: "EllipticalArcTo" }).append(
                    $.xml("Cell", { V: options.height/2, N: "Y", F: "Inh"}),
                    $.xml("Cell", { V: options.width/2, N: "A", F: "Inh"})
                )
            )
        );
    }
    if(options.geometry=="barrel"){
        var B=options.width*0.07;
        var TxtHeight = 0.14;
        sl.append(
            $.xml("Cell",{V:options.width/2, N:"TxtPinX",F:"Inh"}),
            $.xml("Cell",{V:options.height/2, N:"TxtPinY",F:"Inh"}),
            $.xml("Cell",{V:options.width, N:"TxtWidth",F:"Inh"}),
            $.xml("Cell",{V:options.width/2, N:"TxtLocPinX",F:"Inh"}),
            $.xml("Cell",{V:TxtHeight, N:"TxtLocPinY",F:"Inh"}),
            $.xml("Section", {
                N: "Geometry",
                IX: "0"
            }).append(
                $.xml("Row", { IX: "1", T: "MoveTo" }).append(
                    $.xml("Cell", { V: 0, N: "X", F: "Inh" }),
                    $.xml("Cell", { V: options.height-B, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "2", T: "LineTo" }).append(
                    $.xml("Cell", { V: B, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "3", T: "EllipticalArcTo" }).append(
                    $.xml("Cell", { V: options.width, N: "X", F: "Inh"}),
                    $.xml("Cell", { V: B, N: "Y", F: "Inh"}),
                    $.xml("Cell", { V: options.width/2, N: "A", F: "Inh", U: "DL"}),
                    $.xml("Cell", { V: 0, N: "B", F: "Inh", U: "DL"})
                ),
                $.xml("Row", { IX: "4", T: "LineTo" }).append(
                    $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                    $.xml("Cell", { V: options.height-B, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "5", T: "EllipticalArcTo" }).append(
                    $.xml("Cell", { V: options.height-B, N: "Y", F: "Inh"}),
                    $.xml("Cell", { V: options.width/2, N: "A", F: "Inh", U: "DL"}),
                    $.xml("Cell", { V: options.height-2*B, N: "B", F: "Inh", U: "DL"})
                )
            ),
            $.xml("Section", {
                N: "Geometry",
                IX: "1"
            }).append(
                $.xml("Row", { IX: "1", T: "MoveTo" }).append(
                    $.xml("Cell", { V: options.height-B, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "2", T: "EllipticalArcTo" }).append(
                    $.xml("Cell", { V: options.width, N: "X", F: "Inh"}),
                    $.xml("Cell", { V: options.height-B, N: "Y", F: "Inh"}),
                    $.xml("Cell", { V: options.width/2, N: "A", F: "Inh", U: "DL"}),
                    $.xml("Cell", { V: options.height, N: "B", F: "Inh", U: "DL"})
                )
            )
        );
    }
    if(options.geometry=="rectangle"){
        sl.append(
            $.xml("Section", {
                N: "Geometry",
                IX: "0"
            }).append(
                $.xml("Row", { IX: "2", T: "LineTo" }).append(
                    $.xml("Cell", { V: options.width, N: "X", F: "Inh" })
                ),
                $.xml("Row", { IX: "3", T: "LineTo" }).append(
                    $.xml("Cell", { V: options.width, N: "X", F: "Inh" }),
                    $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
                ),
                $.xml("Row", { IX: "4", T: "LineTo" }).append(
                    $.xml("Cell", { V: options.height, N: "Y", F: "Inh" })
                )
            )
        );
    }
    if(options.geometry=="ellipse"){
        sl.append(
            $.xml("Cell",{V:options.width/2, N:"TxtPinX"}),
            $.xml("Cell",{V:options.height/2, N:"TxtPinY"}),
            $.xml("Cell",{V:options.width, N:"TxtWidth"}),
            $.xml("Cell",{V:options.height, N:"TxtHeight"}),
            $.xml("Cell",{V:options.width/2, N:"TxtLocPinX",F:"Inh"}),
            $.xml("Cell",{V:options.height/2, N:"TxtLocPinY",F:"Inh"}),
            $.xml("Section", {
                N: "Geometry",
                IX: "0"
            }).append(
                $.xml("Row", { IX: "1", T: "Ellipse" }).append(
                    $.xml("Cell", { V: options.width/2, N: "X", F: "Inh" }),
                    $.xml("Cell", { V: options.height/2, N: "Y", F: "Inh" }),
                    $.xml("Cell", { V: options.width, N: "A", F: "Inh", U: "DL" }),
                    $.xml("Cell", { V: options.height/2, N: "B", F: "Inh", U: "DL" }),
                    $.xml("Cell", { V: options.width/2, N: "C", F: "Inh", U: "DL" }),
                    $.xml("Cell", { V: options.height, N: "D", F: "Inh", U: "DL" })
                ),
            )
        );
    }
    if(options.text && options.fontsize){
        sl.append(
            $.xml("Section", {
                N: "Character"
            }).append(
                $.xml("Row", { IX: "0" }).append(
                    $.xml("Cell", { V: options.fontsize, N: "Size", U:"PT" }),
                    (options.textcolor?$.xml("Cell", { V: options.textcolor, N: "Color" }):"")
                )
            ),
            $.xml("Text",{
                text:'<cp IX="0"/>' + options.text
            })
        )
    }
    /*
    if(options.master.toString()=="52"){
        sl.append(
            $.xml("Shapes").append(
                $.xml("Shape", { ID: elID++, MasterShape: "8" }).append(
                    $.xml("Cell",{V:options.x+options.width/2, N:"PinX"}),
                    $.xml("Cell",{V:options.y-options.height/2, N:"PinY"}),
                    $.xml("Cell",{V:options.width, N:"Width"}),
                    $.xml("Cell",{V:options.height, N:"Height"}),
                    $.xml("Cell",{V:options.width/2, N:"LocPinX",F:"Inh"}),
                    $.xml("Cell",{V:options.height/2, N:"LocPinY",F:"Inh"})
            
                );
                $.xml("Shape", { ID: elID++, MasterShape: "6" }).append(
                    $.xml("Cell", { V: 0, N: "LayerMember"})
                ),
                $.xml("Shape", { ID: elID++, MasterShape: "7" }).append(
                    $.xml("Cell", { V: 0, N: "LayerMember"})
                )
            )
        );
    }*/
    return sl;
}

/*
-<Shape UniqueID="{22987F78-BEC1-40B7-B779-D48CEF8DF8E0}" Master="40" Type="Shape" Name="Список этапов" NameU="Phase List" ID="8">

<Cell V="1.468503937007874" N="PinX"/>

<Cell V="21.23228346456692" N="PinY"/>

<Cell V="3.740157480314999" N="Width"/>

<Cell V="10.40551181102362" N="Height"/>

<Cell V="10.40551181102362" N="LocPinY" F="Inh"/>

<Cell V="0" N="Relationships" F="SUM(DEPENDSON(11,Sheet.7!SheetRef()),DEPENDSON(2,Sheet.9!SheetRef()),DEPENDSON(4,Sheet.4!SheetRef()))"/>


-<Section N="User">


-<Row N="msvSDContainerLocked">

<Cell V="1" N="Value" U="BOOL"/>

</Row>


-<Row N="msvSDContainerStyle">

<Cell V="1" N="Value" F="IFERROR(CONTAINERSHEETREF(1)!User.VISCFFSTYLE,1)"/>

</Row>


-<Row N="msvSDListDirection">

<Cell V="2" N="Value"/>

</Row>

</Section>


-<Section N="Geometry" IX="0">


-<Row IX="2" T="LineTo">

<Cell V="3.740157480314999" N="X" F="Inh"/>

</Row>


-<Row IX="3" T="LineTo">

<Cell V="3.740157480314999" N="X" F="Inh"/>

<Cell V="10.40551181102362" N="Y" F="Inh"/>

</Row>


-<Row IX="4" T="LineTo">

<Cell V="10.40551181102362" N="Y" F="Inh"/>

</Row>

</Section>

</Shape>


-<Shape UniqueID="{1689A948-3F63-424D-83EC-B00FDA812071}" Master="41" Type="Group" Name="Разделитель (вертикальный)" NameU="Separator (vertical)" ID="9">

<Cell V="3.338582677165373" N="PinX"/>

<Cell V="16.02952755905738" N="PinY"/>

<Cell V="3.740157480314999" N="Width"/>

<Cell V="10.40551181102362" N="Height" U="MM"/>

<Cell V="1.870078740157499" N="LocPinX" F="Inh"/>

<Cell V="5.20275590551181" N="LocPinY" F="Inh" U="MM"/>

<Cell V="0" N="Relationships" F="SUM(DEPENDSON(1,Sheet.12!SheetRef()),DEPENDSON(5,Sheet.8!SheetRef()))"/>


-<Section N="User">


-<Row N="msvSDContainerMargin">

<Cell V="0.2952755905511811" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!User.VISMARGINS,7.5MM)" U="MM"/>

</Row>


-<Row N="visCFFStyle">

<Cell V="1" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!User.VISCFFSTYLE,1)"/>

</Row>


-<Row N="msvSDContainerStyle">

<Cell V="1" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!User.VISCFFSTYLE,1)"/>

</Row>


-<Row N="ListDirection">

<Cell V="2" N="Value" F="IFERROR(LISTSHEETREF()!User.MSVSDLISTDIRECTION,2)"/>

</Row>


-<Row N="visShowPhase">

<Cell V="1" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!User.VISSHOWPHASE,1)"/>

</Row>


-<Row N="LineWeight">

<Cell V="0.01041666666666667" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!LineWeight,THEMEVAL("LineWeight"))" U="DT"/>

</Row>


-<Row N="RTL">

<Cell V="0" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!User.RTL,0)"/>

</Row>


-<Row N="CFFVertical">

<Cell V="1" N="Value" F="IFERROR(CONTAINERSHEETREF(LISTSHEETREF(),1,"CFF Container")!User.CFFVERTICAL,0)"/>

</Row>

</Section>


-<Shapes>


-<Shape UniqueID="{45F558B8-DCB8-490C-90EA-93EF49CDA9D3}" Type="Shape" ID="10" MasterShape="7">

<Cell V="1.870078740157499" N="PinX" F="Inh"/>

<Cell V="5.20275590551181" N="PinY" F="Inh" U="MM"/>

<Cell V="10.40551181102362" N="Width" F="Inh" U="MM"/>

<Cell V="3.740157480314999" N="Height" F="Inh"/>

<Cell V="5.20275590551181" N="LocPinX" F="Inh" U="MM"/>

<Cell V="1.870078740157499" N="LocPinY" F="Inh"/>


-<Section N="Geometry" IX="0">

<Cell V="1" N="NoShow"/>


-<Row IX="1" T="MoveTo">

<Cell V="10.40551181102362" N="X" F="Inh" U="MM"/>

</Row>


-<Row IX="2" T="LineTo">

<Cell V="10.40551181102362" N="X" F="Inh" U="MM"/>

<Cell V="3.740157480314999" N="Y" F="Inh"/>

</Row>

</Section>

</Shape>


-<Shape UniqueID="{DD6EDF5D-9F6E-4374-AFFB-9694241917A9}" Type="Shape" ID="11" MasterShape="6">

<Cell V="0.09842519685039371" N="PinX" F="Inh" U="MM"/>

<Cell V="5.202755905511811" N="PinY" F="Inh" U="MM"/>

<Cell V="10.7992125984252" N="Width" F="Inh" U="MM"/>

<Cell V="0.1968503937007874" N="Height" F="Sheet.8!User.visHeadingHeight*Sheet.4!User.visShowPhase" U="MM"/>

<Cell V="5.20275590551181" N="LocPinX" F="Inh" U="MM"/>

<Cell V="0.09842519685039371" N="LocPinY" F="Inh" U="MM"/>

<Cell V="5.399606299212597" N="TxtPinX" F="Inh" U="MM"/>

<Cell V="0.09842519685039371" N="TxtPinY" F="Inh" U="MM"/>

<Cell V="10.7992125984252" N="TxtWidth" F="Inh" U="MM"/>

<Cell V="0.1968503937007874" N="TxtHeight" F="Inh" U="MM"/>

<Cell V="5.399606299212597" N="TxtLocPinX" F="Inh" U="MM"/>

<Cell V="0.09842519685039371" N="TxtLocPinY" F="Inh" U="MM"/>


-<Section N="User">


-<Row N="HeadingPos">

<Cell V="3" N="Value" F="IF(OR(Sheet.8!User.msvSDListDirection=0,Sheet.8!User.msvSDListDirection=1),2,IF(Sheet.7!User.msvSDListDirection=0,3,1))"/>

</Row>


-<Row N="SwimlaneHeadingSize">

<Cell V="0.3937007874015748" N="Value" F="Sheet.7!User.visHeadingHeight" U="MM"/>

</Row>


-<Row N="FirstHeadingExtend">

<Cell V="0.3937007874015748" N="Value" F="Inh" U="MM"/>

</Row>

</Section>


-<Section N="Geometry" IX="0">


-<Row IX="1" T="MoveTo">

<Cell V="0" N="Y" F="Inh" U="MM"/>

</Row>


-<Row IX="2" T="LineTo">

<Cell V="10.7992125984252" N="X" F="Inh" U="MM"/>

<Cell V="0" N="Y" F="Inh" U="MM"/>

</Row>


-<Row IX="3" T="LineTo">

<Cell V="10.7992125984252" N="X" F="Inh" U="MM"/>

<Cell V="0.1968503937007874" N="Y" F="Inh" U="MM"/>

</Row>


-<Row IX="4" T="LineTo">

<Cell V="0.1968503937007874" N="Y" F="Inh" U="MM"/>

</Row>


-<Row IX="5" T="LineTo">

<Cell V="0" N="Y" F="Inh" U="MM"/>

</Row>

</Section>

</Shape>

</Shapes>

</Shape>
*/