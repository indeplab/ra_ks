let wordreader = undefined;
 
let getWordFileByName = async function (name) {
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
$.fn.importfromword = async function (blob) {
    createdocument(true);
    $.outputclear(["error","recomendation","warning","note"]);
    return await $(this).getDocument(blob);
}
$.fn.getDocument = async function(blob){
    if (await wordopen(blob)) {
        $("#wait").show();
        let text = await getVisioFileByName("word/document.xml");
        setTimeout(()=>{
            console.log(Date().toLocaleString("ru-RU"));
            let res =  $(this).parseDocument(text);
            console.log(Date().toLocaleString("ru-RU"));
            $("#wait").hide();
            return res;
        },50);
    }
    return false;
 
}
let wordopen = async function (blob) {
    await wordclose();
    try {
        wordreader = new zip.ZipReader(new zip.BlobReader(blob));
        filelist = await wordreader.getEntries();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
let wordclose = async function () {
    filelist = undefined;
    if (wordreader) {
        await wordreader.close();
    }
    wordreader = undefined;
}
$.fn.parseDocument = function(text){
    let canvas = this;
    let getMatchValue = function(wt){
        let word = "";
        if(wt){
            wt.forEach(w_e=>{
                if(w_e && w_e.length>1){
                    for(let i=1;i<w_e.length;i++){
                        if(w_e[i]) word+=w_e[i];
                    }
                }
            });
        }
        return word;
    }
    var params = $.currentdocumentget();
    let p = text.matchAll(/<w:p>(.*?)<\/w:p>|<w:p\s+.*?>(.*?)<\/w:p>/g);
    let name="";
    let cap_check=false;
    let name_found=false;
    p.forEach(p_e=>{
        if(!name_found){
            let n="";
            for(let i=1;i<p_e.length;i++){
                if(p_e[i]){
                    let wt = p_e[i].matchAll(/<w:t>(.*?)<\/w:t>|<w:t\s+.*?>(.*?)<\/w:t>/g);
                    n=getMatchValue(wt);
                    break;
                }
            }
            //console.log(n);
            if(n!="" && name=="") name = n;
            if(cap_check && !name_found){
                name=n;
                name_found =true;
            }
            ln = n.split(".");
            //if(n.toLowerCase().indexOf("бизнес")!=-1) debugger;
            let i= ln.findIndex(l=>l.toLowerCase().indexOf("бизнес")>-1 && l.toLowerCase().indexOf("требования")>-1 || l.toLowerCase().trim()=="бт");
            if(i!=-1){
                cap_check=true;
                if(ln[i].toLowerCase().trim()=="бт")
                    ln[i]="";
                else{
                    ln[i]=replaceAll(ln[i],"бизнес-требования","");
                    ln[i]=replaceAll(replaceAll(ln[i],"требования",""),"бизнес","");
                    if(ln[i].trim().length<2) ln[i]="";
                }
                if(ln[i]=="")
                    ln.splice(i,1);
                n=ln.join().trim();
                if(n!=""){
                    name=n;
                    name_found =true;
                }
            }
        }
    });
    if(name!=""){
        params.name=name;
        $.storeset(params);
    }
    let table=[];
    let tbl = text.matchAll(/<w:tbl>(.*?)<\/w:tbl>/g);
    tbl.forEach(tbl_e=>{
        let tr = tbl_e[1].matchAll(/<w:tr.*?>(.*?)<\/w:tr>/g);
        let row=[];
        tr.forEach(tr_e=>{
            let col=[];
            let tc = tr_e[1].matchAll(/<w:tc>(.*?)<\/w:tc>/g);
            tc.forEach(tc_e=>{
                let wt = tc_e[1].matchAll(/<w:t>(.*?)<\/w:t>|<w:t\s+.*?>(.*?)<\/w:t>/g);
                col.push(getMatchValue(wt));
            });
            //if(col.length>0 && col[0].toLowerCase()=="сценарий") console.log(tc);
            row.push(col);
        });
        table.push(row);
    });
//console.log(table);
    let businessid=1;
    for(let key of Object.keys(params.viewdata)){
        if(key.indexOf("business")>-1){
            let i = getInt(key.replace("business",""));
            if(i>businessid) businessid = i;
        }
    }
    var currentmenu = $.pagemenu();
    table.forEach(t=>{
        let caption="";
        let description="";
        let stage = "";
        t.forEach(r=>{
            if(r.length<2) return;
            let cap = r[0].toLowerCase();
            if(cap=="сценарий") caption = r[1].trim();
            else if(cap.indexOf("описание")!=-1) description=r[1].trim();
            else if(cap.indexOf("этап")!=-1 && cap.indexOf("сценари")!=-1) stage=r[1].trim();
 
        });
        if(caption!="" && stage!=""){
            let result = getPlantUml(stage);
            //console.log(result);
            if(result!=""){
                let pm = "business"+businessid.toString();
                businessid++;
                //console.log(pm);
                params.viewdata[pm]={
                    name:caption,
                    notation:"bpmn",
                    description:description,
                    datatype:"business",
                    mx:svgMultuplX,
                    my:svgMultuplY,
                    sw:svgStartWidth,
                    sh:svgStartHeight
                }
                $.storeset(params);
                $(canvas).documentcreatebusinessmenu(params);
                if($.pagemenu()!=pm) $.pagemenu(pm);
                var place=$("svg[data-type='document']");
                if(!$(place).importfrompu(result))
                    alert("Неверный формат диаграммы");
            }
            else return;
        }
    });
 
    if(currentmenu!=$.pagemenu());
        $.pagemenu(currentmenu);
 
}
let getPlantUml = function(text){
    let result = "";
    $.ajax({
        async:false,
        url: "https://dadm-uamo-webotap-scenario-uml.datafactory-test.int.gazprombank.ru:8888/webotar/genuml",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            id:0,
            "input_text": text
        }),
        success: function (data) {
            result = data.result;
        },
        error: function (message) {
            if(message.state==403){
                alert("Ошибка вызова серрвиса, проверьте доступ к сервису LLM.");
                console.error(message);
            }
            else{
                alert("Ошибка вызова серрвиса.");
                console.error(message, text);
            }
        }
    });
    return result;
}
