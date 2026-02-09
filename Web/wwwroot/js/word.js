var wordparams=[];
$.fn.word = function(options){
    word(this, options);
}
async function word(place, options) {
    var part = "word";
    var imageType = "image/png";
    var businessSchema = "", informSchema = "", functionSchema = "";
    var schemaID = 22;
    wordparams=[];
    var businessSchemaID = "", informSchemaID = "", functionSchemaID = "";
    var currentmenu = $.pagemenu();
 
    var version = 1;
    if (options != undefined && options.version != undefined)
        version = options.version;
 
    const blobWriter = new zip.BlobWriter("application/zip");
    const writer = new zip.ZipWriter(blobWriter);
 
    await msofficeaddfile(part, zip, writer, "_rels/_.xml", "_rels/.rels");
 
    await msofficeaddfile(part, zip, writer, "docProps/app.xml");
    await msofficeaddfile(part, zip, writer, "docProps/core.xml");
    await msofficeaddfile(part, zip, writer, "docProps/custom.xml");
 
    await msofficeaddfile(part, zip, writer, "customXml/_rels/item1.xml", "customXml/_rels/item1.xml.rels");
    await msofficeaddfile(part, zip, writer, "customXml/_rels/item2.xml", "customXml/_rels/item2.xml.rels");
    await msofficeaddfile(part, zip, writer, "customXml/_rels/item3.xml", "customXml/_rels/item3.xml.rels");
    await msofficeaddfile(part, zip, writer, "customXml/_rels/item4.xml", "customXml/_rels/item4.xml.rels");
 
    await msofficeaddfile(part, zip, writer, "customXml/item1.xml");
    await msofficeaddfile(part, zip, writer, "customXml/item2.xml");
    await msofficeaddfile(part, zip, writer, "customXml/item3.xml");
    await msofficeaddfile(part, zip, writer, "customXml/item4.xml");
    await msofficeaddfile(part, zip, writer, "customXml/itemProps1.xml");
    await msofficeaddfile(part, zip, writer, "customXml/itemProps2.xml");
    await msofficeaddfile(part, zip, writer, "customXml/itemProps3.xml");
    await msofficeaddfile(part, zip, writer, "customXml/itemProps4.xml");
 
    var prop = $(place).documentget();
    if (prop.sysid != 0) {
       
        /*var viewlist=[];
        $("div.left-menu-row.down a[data-type]:not([data-type='switch'])").each(function(i,e){
            if($(e).attr("data-type").indexOf("business")!=-1){
                viewlist.push({
                    id:$(e).attr("data-type"),
                    name:$(e).attr("title")
                });
            }
        });
        var doc = undefined;
        for(var i in viewlist){
            doc = await $(place).conceptview(doc,viewlist[i].id,viewlist[i].name);
        }
       
        if(doc){
            businessSchema = "business_PDF.bin";
            await new Promise(resolve => {
                let stream = doc.pipe(blobStream());
                stream.on('finish', function() {
                    let blob = stream.toBlob('application/pdf');
                    writer.add("word/embeddings/" + businessSchema, new zip.BlobReader(blob));
                });
                doc.end();
                resolve();
            });
            businessSchemaID = "rId" + (++schemaID).toString();
            wordparams.push({
                name: "%BusinessSchema%",
                value: '<w:object w:dyaOrig="982" w:dxaOrig="1505"><v:shape id="_x0000_i1030" type="#_x0000_t75" o:ole="" style="width:75.35pt;height:49.4pt"><v:imagedata o:title="" r:id="rId19"/></v:shape><o:OLEObject r:id="' + businessSchemaID + '" ObjectID="_1705147867" DrawAspect="Icon" ShapeID="_x0000_i1030" ProgID="Acrobat.Document.DC" Type="Embed"/></w:object>'
            });
        }*/
           
        /*businessSchema = await msofficeaddschema(zip, writer, "word/embeddings/", { id: prop.sysid, type: "business", suffix:"Microsoft_Visio" });
        if (businessSchema != "") {
            businessSchemaID = "rId" + (++schemaID).toString();
            wordparams.push({
                name: "%BusinessSchema%",
                value: '<w:object w:dyaOrig="982" w:dxaOrig="1505"><v:shape id="_x0000_i1030" type="#_x0000_t75" o:ole="" style="width:75.35pt;height:49.4pt"><v:imagedata o:title="" r:id="rId19"/></v:shape><o:OLEObject r:id="' + businessSchemaID + '" ObjectID="_1705147867" DrawAspect="Icon" ShapeID="_x0000_i1030" ProgID="Visio.Drawing.' + (getExtention(businessSchema)=="vsd"?'11':'15') + '" Type="Embed"/></w:object>'
            });
        }*/
        /*
        functionSchema = await msofficeaddschema(zip, writer, "word/embeddings/", { id: prop.sysid, type: "function", suffix:"Microsoft_Visio" });
        if (functionSchema != "") {
            functionSchemaID = "rId" + (++schemaID).toString();
            wordparams.push({
                name: "%FunctionSchema%",
                value: '<w:object w:dyaOrig="983" w:dxaOrig="1506"><v:shape id="_x0000_i1031" type="#_x0000_t75" o:ole="" style="width:75.35pt;height:49.4pt"><v:imagedata o:title="" r:id="rId21"/></v:shape><o:OLEObject r:id="' + functionSchemaID + '" ObjectID="_1705147868" DrawAspect="Icon" ShapeID="_x0000_i1031" ProgID="Visio.Drawing.' + (getExtention(functionSchema) == "vsd" ? '11' : '15') + '" Type="Embed"/></w:object>'
            });
        }*/
    }
    //console.log(businessSchema, functionSchema);
    //await msofficeaddfile(part, zip, writer, "word/_rels/document.xml", "word/_rels/document.xml.rels");
 
    await msofficeaddfile(part, zip, writer, "word/_rels/header1.xml", "word/_rels/header1.xml.rels");
 
    await msofficeaddfile(part, zip, writer, "word/theme/theme1.xml");
 
    await msofficeaddfile(part, zip, writer, "word/header1.xml", "word/header1.xml", $.wordheadparameters, place);
    await msofficeaddfile(part, zip, writer, "word/footer1.xml", "word/footer1.xml", $.wordheadparameters, place);
    await msofficeaddfile(part, zip, writer, "word/endnotes.xml");
    await msofficeaddfile(part, zip, writer, "word/fontTable.xml");
    await msofficeaddfile(part, zip, writer, "word/footnotes.xml");
    await msofficeaddfile(part, zip, writer, "word/numbering.xml");
    await msofficeaddfile(part, zip, writer, "word/settings.xml");
    await msofficeaddfile(part, zip, writer, "word/styles.xml");
    await msofficeaddfile(part, zip, writer, "word/webSettings.xml");
 
    await msofficeaddfile(part, zip, writer, "[Content_Types].xml");
 
    await msofficeaddfileblob(part, zip, writer, "word/media/image1.png");
    await msofficeaddfileblob(part, zip, writer, "word/media/image2.png");
 
    var size,zoom;
    switch (version) {
        case 1:
            if (currentmenu != "interface")
                $.pagemenu("interface");
 
            $.clearselected();
            //$(place).svgfitcanvas();
 
            size=await msofficeaddfileimage(place, zip, writer, "word/media/image3.png", { imageType: imageType, outputtype: "blob" });
            if(size){
                zoom=Math.max((size.maxX-size.minX)/710,(size.maxY-size.minY)/400);
                wordparams.push({
                    name: "%interfacestyle%",
                    value: "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt"
                });
            }
            $.pagemenu("system");
            size=await msofficeaddfileimage(place, zip, writer, "word/media/image4.png", { imageType: imageType, outputtype: "blob" });
            if(size){
                zoom=Math.max((size.maxX-size.minX)/710,(size.maxY-size.minY)/400);
                wordparams.push({
                    name: "%systemstyle%",
                    value: "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt"
                });
            }
            break;
        case 2:
            var viewlist=[];
            $("div.left-menu-row.down a[data-type]:not([data-type='switch'])[schema-type='schema']").each(function(i,e){
                if($(e).attr("data-type")!="function_test" && $(e).attr("data-type")!="function"){
                        viewlist.push({
                        id:$(e).attr("data-type"),
                        name:$(e).attr("title")
                    });
                }
            });
            schemaID++;
            var informSchemaData = await addvisioschema(place,viewlist);
            if (informSchemaData != undefined) {
                informSchema = "inform_Microsoft_Visio.vsdx";
                informSchemaID = "rId" + (schemaID).toString();
                wordparams.push({
                    name: "%InterfaceSchema%",
                    value: '<w:object w:dyaOrig="984" w:dxaOrig="1507"><v:shape id="_x0000_i1032" type="#_x0000_t75" o:ole="" style="width:75.35pt;height:49.4pt"><v:imagedata o:title="" r:id="rId20"/></v:shape><o:OLEObject r:id="' + informSchemaID + '" ObjectID="_1705147869" DrawAspect="Icon" ShapeID="_x0000_i1032" ProgID="Visio.Drawing.15" Type="Embed"/></w:object>'
                });
            }
            if (informSchema != "") {
                writer.add("word/embeddings/" + informSchema, new zip.BlobReader(informSchemaData));
            }
            break;
        case 3:
            if ($.pagemenuname() != "interface")
                $.pagemenu("interface");
            schemaID++;
            size=await msofficeaddfileimage(place, zip, writer, "word/media/image3.png", { imageType: imageType, outputtype: "blob" });
            if(size){
                zoom=Math.max((size.maxX-size.minX)/685,(size.maxY-size.minY)/375);
                wordparams.push({
                    name: "%InterfaceSchema%",
                    value: '<w:pict><v:shape id="_x0000_i1127" type="#_x0000_t75" style="' + "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt" + '"><v:imagedata r:id="rId14" o:title="interface"/></v:shape></w:pict>'
                });
            }
            else{
                wordparams.push({
                    name: "%InterfaceSchema%",
                    value: ''
                });
            }
            $.pagemenu("system");
            size=await msofficeaddfileimage(place, zip, writer, "word/media/image4.png", { imageType: imageType, outputtype: "blob" });
            if(size){
                zoom=Math.max((size.maxX-size.minX)/685,(size.maxY-size.minY)/375);
                wordparams.push({
                    name: "%SystemSchema%",
                    value: '<w:pict><v:shape id="_x0000_i1227" type="#_x0000_t75" style="' + "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt" + '"><v:imagedata r:id="rId15" o:title="system"/></v:shape></w:pict>'
                });
            }
            else{
                wordparams.push({
                    name: "%SystemSchema%",
                    value: ''
                });
            }
            break;
    }

    var xmldata=[];
    var res=await getallschema({ id: prop.sysid});
    //console.log(res);
    businessSchema = (res.func?res.func:"");
    if (businessSchema != "") {
        businessSchemaID = "rId" + (++schemaID).toString();
        await msofficedownloadblob(zip, writer, res.funclink, "word/embeddings/" + res.func);
        wordparams.push({
            name: "%BusinessSchema%",
            value: '<w:object w:dyaOrig="982" w:dxaOrig="1505"><v:shape id="_x0000_i1030" type="#_x0000_t75" o:ole="" style="width:75.35pt;height:49.4pt"><v:imagedata o:title="" r:id="rId19"/></v:shape><o:OLEObject r:id="' + businessSchemaID + '" ObjectID="_1705147867" DrawAspect="Icon" ShapeID="_x0000_i1030" ProgID="Visio.Drawing.' + (getExtention(businessSchema)=="vsd"?'11':'15') + '" Type="Embed"/></w:object>'
        });
    }
    else{
        if(version==2){
            wordparams.push({
                name: "%BusinessSchema%",
                value: '<w:p><w:rPr><w:sz w:val="24"/></w:rPr><w:t>См. вложенный файл схемы информационной архитектуры, листы ФМП</w:t></w:p>'
            });
        }
        else{
            var imagecount=7;
            var imagedata="";
            for(let i of Object.keys(prop.viewdata)){
                var p=prop.viewdata[i];
                if(p.datatype=="business"){
                    if ($.pagemenu() != i)
                        $.pagemenu(i);
                    schemaID++;
                    size=await msofficeaddfileimage(place, zip, writer, "word/media/image" + imagecount + ".png", { imageType: imageType, outputtype: "blob" });
                    if(size){
                        zoom=Math.max((size.maxX-size.minX)/500,(size.maxY-size.minY)/640);// portland
                        imagedata += '<w:p><w:rPr><w:sz w:val="28"/></w:rPr><w:t>' + p.name + '</w:t></w:p><w:p><w:pict><v:shape id="_x0000_i11'+ schemaID +'" type="#_x0000_t75" style="' + "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt" + '"><v:imagedata r:id="rId' + schemaID + '" o:title="business"/></v:shape></w:pict><w:br w:type="page"/></w:p>';
                        xmldata.push(
                            $.xml("<Relationship>", { Target: "media/image" + imagecount +".png", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId" + (schemaID).toString() }),
                        );
                        imagecount++;
                    }
                }
            }
            if(imagedata!=""){
                wordparams.push({
                    name: "%BusinessSchema%",
                    value: imagedata
                });
            }
            else{
                wordparams.push({
                    name: "%BusinessSchema%",
                    value: ''
                });
            }
        }
    }

    functionSchema = (res.deploy?res.deploy:"");
    if (functionSchema != "") {
        functionSchemaID = "rId" + (++schemaID).toString();
        await msofficedownloadblob(zip, writer, res.deploylink, "word/embeddings/" + res.deploy);
        wordparams.push({
            name: "%FunctionSchema%",
            value: '<w:object w:dyaOrig="983" w:dxaOrig="1506"><v:shape id="_x0000_i1031" type="#_x0000_t75" o:ole="" style="width:75.35pt;height:49.4pt"><v:imagedata o:title="" r:id="rId21"/></v:shape><o:OLEObject r:id=16 ObjectID="_1705147868" DrawAspect="Icon" ShapeID="_x0000_i1031" ProgID="Visio.Drawing.' + (getExtention(functionSchema) == "vsd" ? '11' : '15') + '" Type="Embed"/></w:object>'
        });
    }
    else{
        if ($.pagemenu() != "function")
            $.pagemenu("function");
        size=await msofficeaddfileimage(place, zip, writer, "word/media/image5.png", { imageType: imageType, outputtype: "blob" });
        if(size){
            zoom=Math.max((size.maxX-size.minX)/685,(size.maxY-size.minY)/375);
            wordparams.push({
                name: "%FunctionSchema%",
                value: '<w:pict><v:shape id="_x0000_i1027" type="#_x0000_t75" style="' + "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt" + '"><v:imagedata r:id="rId16" o:title="function"/></v:shape></w:pict>'
            });
        }
        if ($.pagemenu() != "function_test")
            $.pagemenu("function_test");
            schemaID++;
        size=await msofficeaddfileimage(place, zip, writer, "word/media/image"+schemaID.toString()+".png", { imageType: imageType, outputtype: "blob" });
        if(size){
            zoom=Math.max((size.maxX-size.minX)/685,(size.maxY-size.minY)/375);
            wordparams.push({
                name: "%FunctionSchemaTest%",
                value: '<w:pict><v:shape id="_x0000_i1128" type="#_x0000_t75" style="' + "width:" + ((size.maxX-size.minX)/zoom).toString() + "pt;height:" + ((size.maxY-size.minY)/zoom).toString() + "pt" + '"><v:imagedata r:id="rId'+schemaID+'" o:title="function"/></v:shape></w:pict>'
            });
            xmldata.push(
                $.xml("<Relationship>", { Target: "media/image"+schemaID.toString()+".png", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId"+schemaID.toString()}),
            );
        }
    }
 
    if (currentmenu != $.pagemenu())
        $.pagemenu(currentmenu);

    // make doc link
    var doclink=window.location.origin + window.location.pathname + '?id=' + prop.sysid;
    schemaID++;
    xmldata.push(
        $.xml("<Relationship>", { Target: doclink, Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", Id: "rId" + (schemaID).toString(),  TargetMode:"External" }),
    );
    await msofficeaddfile(part, zip, writer, "word/document" + version + ".xml", "word/document.xml", $.wordparameters, place, { 
        version: version, 
        link: ' </w:t></w:r></w:p><w:p><w:hyperlink r:id="rId' + (schemaID).toString() + '" w:history="1"><w:r w:rsidR="00A90C66"><w:rPr><w:rStyle w:val="afd"/></w:rPr><w:t>ВебОТАР - ' + doclink  +'</w:t></w:r></w:hyperlink></w:p><w:p><w:r><w:t>'
    });
    await writer.add("word/_rels/document.xml.rels", new zip.TextReader($(place).worddocumentref(businessSchema, businessSchemaID, informSchema, informSchemaID, functionSchema, functionSchemaID,xmldata)));
 
    await msofficeaddfileblob(part, zip, writer, "word/media/image1emf.png", "word/media/image1.emf");
    await msofficeaddfileblob(part, zip, writer, "word/media/image2emf.png", "word/media/image2.emf");
    await msofficeaddfileblob(part, zip, writer, "word/media/image3emf.png", "word/media/image3.emf");
 

    await writer.close();
 
    // get the zip file as a Blob
    const content = await blobWriter.getData();  
    if (options && typeof options.success == "function") options.success(content)
}
async function getallschema(options){
    let response = await new Promise(resolve => {
        $.storeGetAllAttachment({
            id: options.id,
            success: function (attachments) {
                var res = {};
                attachments.forEach(function (e) {
                    var fileName = e.fileName.split('.').shift();
                    switch (fileName) {
                        case 'Функциональная_модель':
                            res.func = 'func_Microsoft_Visio.' + getExtention(e.fileName);
                            res.funclink=e.filePath;
                            break;
                        case 'Модель_развертывания':
                            res.deploy = 'deploy_Microsoft_Visio.' + getExtention(e.fileName);
                            res.deploylink=e.filePath;
                            break;
                    }
                });
                resolve(res);
            }
        });
    });
    return response;
}

async function addvisioschema(place, viewlist) {
    let response = await new Promise(resolve => {
        $(place).visio({
            viewlist:viewlist,
            success: function (content) {
                resolve(content);
            },
            error: function (message) {
                console.error(message);
            }
        })
    });
    return response;
}
 
$.fn.worddocumentref = function (businessShema, businessShemaID, informSchema, informSchemaID, functionSchema, functionSchemaID, xlmdata) {
    var page = $.xml("Relationships", {
        "xmlns": "http://schemas.openxmlformats.org/package/2006/relationships"
    });
 
    page.append(
        $.xml("<Relationship>", { Target: "webSettings.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings", Id: "rId8" }),
        $.xml("<Relationship>", { Target: "media/image2.png", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId13" }),
        $.xml("<Relationship>", { Target: "theme/theme1.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme", Id: "rId18" }),
        $.xml("<Relationship>", { Target: "../customXml/item3.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml", Id: "rId3" }),
        $.xml("<Relationship>", { Target: "settings.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings", Id: "rId7" }),
        $.xml("<Relationship>", { Target: "footer1.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer", Id: "rId12" }),
        $.xml("<Relationship>", { Target: "fontTable.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable", Id: "rId17" }),
        $.xml("<Relationship>", { Target: "../customXml/item2.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml", Id: "rId2" }),
        $.xml("<Relationship>", { Target: "media/image5.png", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId16" }),
        $.xml("<Relationship>", { Target: "../customXml/item1.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml", Id: "rId1" }),
        $.xml("<Relationship>", { Target: "styles.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", Id: "rId6" }),
        $.xml("<Relationship>", { Target: "header1.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header", Id: "rId11" }),
        $.xml("<Relationship>", { Target: "numbering.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering", Id: "rId5" }),
        $.xml("<Relationship>", { Target: "media/image4.png", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId15" }),
        $.xml("<Relationship>", { Target: "endnotes.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes", Id: "rId10" }),
        $.xml("<Relationship>", { Target: "../customXml/item4.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml", Id: "rId4" }),
        $.xml("<Relationship>", { Target: "footnotes.xml", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes", Id: "rId9" }),
        $.xml("<Relationship>", { Target: "media/image3.png", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId14" }),
        $.xml("<Relationship>", { Target: "media/image2.emf", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId19" }),
        $.xml("<Relationship>", { Target: "media/image1.emf", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId20" }),
        $.xml("<Relationship>", { Target: "media/image3.emf", Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Id: "rId21" }),
        xlmdata
        );
    if (businessShema != "") {
        page.append(
            $.xml("<Relationship>", { Target: "embeddings/" + businessShema, Type: (getExtention(businessShema) == "vsdx" ? "http://schemas.openxmlformats.org/officeDocument/2006/relationships/package":"http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject"), Id: businessShemaID })
        );
    }
    if (informSchema != "") {
        page.append(
            $.xml("<Relationship>", { Target: "embeddings/" + informSchema, Type: (getExtention(informSchema) == "vsdx" ? "http://schemas.openxmlformats.org/officeDocument/2006/relationships/package":"http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject"), Id: informSchemaID })
        );
    }
    if (functionSchema != "") {
        page.append(
            $.xml("<Relationship>", { Target: "embeddings/" + functionSchema, Type: (getExtention(functionSchema) == "vsdx" ?"http://schemas.openxmlformats.org/officeDocument/2006/relationships/package": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject"), Id: functionSchemaID })
        );
    }
 
    //console.log(page,xlmdata);
    return "<?xml version='1.0' encoding='utf-8' standalone='yes'?>" + page.toString();
}
$.wordheadparameters = function (data, place) {
    var params = $(place).documentget();
    data = replaceAll(data, "%Type%", getEscaped(params.type ));
    data = replaceAll(data, "%Name%", getEscaped(params.name ));
    var date = new Date();
    data = replaceAll(data, "%Date%", formatDate(date.getDate()) + "." + formatDate(date.getMonth() + 1) + "." + date.getFullYear().toString());
    data = replaceAll(data, "%Year%", date.getFullYear().toString());
    data = replaceAll(data, "%Version%", getEscaped(params.version));
    data = replaceAll(data, "%Link%", "" /*window.location.origin + window.location.pathname + '?id=' + params.sysid*/);
    data = replaceAll(data, "%Author%", getEscaped(params.author));
    return data;
}
$.wordparameters = function (data, place, options) {
 
    data = $.wordheadparameters(data, place);
    var param = $(place).documentget();
    data = replaceAll(data, "%Goal%", getEscaped(param.description) + " " + options.link);
    $.each(wordparams, function (i, e) {
        data = replaceAll(data, e.name, e.value);
    });
    var params = $(place).gettables();
 
    if (options.version == 1) {
        data = replaceAll(data, "%BusinessData%", $.wordtable(params.businesstable).toString());
        data = replaceAll(data, "%DevelopList%", $.wordtable(params.developtable2).toString());
        data = replaceAll(data, "%System%", $.wordtable(params.systemtable).toString());
        data = replaceAll(data, "%Interface%", $.wordtable(params.interfacetable).toString());
    }
    data = replaceAll(data, "%Support%", $.wordtable(params.supporttable).toString());
 
    return data;
}
var formatDate = function(date){
    if(date<10) return "0"+date.toString();
    return date.toString();
}
var getExtention = function (file) {
    return file.substring(file.lastIndexOf('.') + 1);
}
 
$.wordtable = function(table){
    var tbl = $.xml("w:tbl").append($.xml("w:tblPr")).append($.xml("w:tblW",{"w:type":"auto","w:w":"0"}));
    var head = table.thead;
    if(head.length>0){
        $.each(head,function(i1,h){
            var isrotate = false;
            $.each(h,function(i,e){
                isrotate |= e.rotate;
            });
            var row = $.xml("w:tr").append(
                $.xml("w:trPr").append($.xml("w:trHeight",{"w:val":(isrotate?"1670":"auto")}))
            );
            $.each(h,function(i,e){
                row=row.append(
                    $.xml("w:tc").append(
                        $.wordtcPr(e),
                        $.xml("w:p").append(
                            $.xml("w:r").append(
                                $.xml("w:rPr").append(
                                    $.xml("w:b"),
                                    $.xml("w:sz",{"w:val":18})
                                ),
                                $.xml("w:t",{text:getEscaped(e.text)})
                            )
                        )
                    )
                );
            });
            tbl=tbl.append(row);
        });
    }
    var body = table.tbody;
    if(body.length>0){
        $.each(body,function(i1,b){
            var row = $.xml("w:tr");
            $.each(b,function(i,e){
                row.append(
                    $.xml("w:tc").append(
                        $.wordtcPr(e),
                        $.xml("w:p").append(
                            $.xml("w:r").append(
                                $.xml("w:rPr").append(
                                    $.xml("w:sz",{"w:val":18})
                                ),
                                $.xml("w:t",{text:getEscaped(e.text)})
                            )
                        )
                    )
                );
            });
            tbl.append(row);
        });
    }
    return tbl;
}
$.wordtcPr = function(options){
    var result = $.xml("w:tcPr").append(
        $.xml("w:tcW",{"w:w":"0","w:type":"auto"})
    );
    if(options.rotate){
        result = result.append(
            $.xml("w:tcMar").append(
                $.xml("w:left",{"w:w":"140","w:type":"dxa"}),
                $.xml("w:right",{"w:w":"330","w:type":"dxa"})
            )
        );
    }
    if(options){
        if(options.rowspan==0)
            result = result.append(
                $.xml("w:vMerge",{"w:val":"restart"})
            );
        if(options.rowspan>0)
            result = result.append(
                $.xml("w:vMerge")
            );
    }
    if(options && options.colspan){
        result = result.append(
            $.xml("w:gridSpan",{"w:val":options.colspan})
        );
    }
    result=result.append(
        $.xml("w:tcBorders").append(
            $.xml("w:top",{"w:val":"outset","w:space":"0","w:color":"auto","w:sz":"6"}),
            $.xml("w:left",{"w:val":"outset","w:space":"0","w:color":"auto","w:sz":"6"}),
            $.xml("w:bottom",{"w:val":"outset","w:space":"0","w:color":"auto","w:sz":"6"}),
            $.xml("w:right",{"w:val":"outset","w:space":"0","w:color":"auto","w:sz":"6"})
        ),
        $.xml("w:vAlign",{"w:val":(options && options.valign?options.valign:"center")})
    );
    if(options && options.rotate)
        result=result.append(
            $.xml("w:textDirection",{"w:val":"btLr"})
        );
    return result;
}