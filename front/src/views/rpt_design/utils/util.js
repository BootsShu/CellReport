// 使用方法 arrayToTree(data,{pid:'pid',id:'id'})
export function arrayToTree(array,paramsKey){
	
	// pid 和id 都是字符串
	const pid = paramsKey.pid;
	const id = paramsKey.id;
	
	let copyArr = JSON.parse(JSON.stringify(array));
	
	// 筛选出没有父级的数据
	array.forEach(function(item){
		copyArr = copyArr.filter(function(child){
			return child[pid] !== item[id]
		})
	})
	
	// 递归转换
	function treeLoop(arr = [],total=[]){
		for(let i=0;i<arr.length;i++){
			const aid = arr[i][id]
			let children = total.filter(function(child){
				return child[pid] === aid
			});
			if(children.length > 0){
				children = treeLoop(children,total);
			}
            if(children.length>0)
			    arr[i].children = children;
		}
		return arr;
	}
	
	return treeLoop(copyArr,array)
}
export const parseParam=function(one_ds__text){
    let params=[]
    let result=one_ds__text.match(/#([^ \t\v\n\r\f\+\*-\/\(\)\{\}\.\"\']*?)#/img)
    if(result){
        result.forEach(ele=>{
            let new_name=ele.slice(1,-1)
            if(params.find(x=>x==new_name)==null){
                params.push(new_name)
            }
        })
    }
    result=one_ds__text.match(/\$([^ \t\v\n\r\f\+\*-\/\(\)\{\}\.\"\']*?)\$/img)
    if(result){
        result.forEach(ele=>{
            let new_name=ele.slice(1,-1)
            if(params.find(x=>x==new_name)==null){
                params.push(new_name)
            }
        })
    }
    result=one_ds__text.match(/\$\+(.*?)\$/img)
    if(result){
        result.forEach(one_stat=>{
            let param_result=one_stat.match(/param\.[^ \t\v\n\r\f\+\*-\/\(\)\{\}\.\"\']*/img)
            if(param_result){
                param_result.forEach(ele=>{
                    let new_name=ele.substring(6)
                    if(params.find(x=>x==new_name)==null){
                        params.push(new_name)
                    }
                })
            }
        })
    }
    return params
}
export const build_layout=function(AllGrids){
    let layout_item_arr =[]
    if(AllGrids.grid)
        AllGrids.grid.forEach(ele=>{
            layout_item_arr.push({
                "type": "luckySheetProxy",
                "label": ele._title||ele.title||ele._name||ele.name,
                "display": true,
                "style": {
                    "height": "100%"
                },no_use_parent_css:false,
                "fit":true,page_size:20,
                page_sizes:"[20, 50, 100, 200]",
                "gridName": ele._name||ele.name,
                "span": 24,
                "component": "luckySheetProxy",
                "prop": Date.now() + '_' + Math.ceil(Math.random() * 99999)
            })
        })
    if(AllGrids.HtmlText)
        AllGrids.HtmlText.forEach(ele=>{
            layout_item_arr.push({
                "type": "html-text",
                "label":ele._title||ele.title||ele._name||ele.name,
                "gridName": ele._name||ele.name,
                "color": "#fff",
                "display": true,
                "component": "html-text",
                "style": {
                    "height": "100%"
                },
                "content": "<h1>哈==哈哈</h1>",
                "prop": Date.now() + '_' + Math.ceil(Math.random() * 99999)
            })
        })
    let insert_item
    if(layout_item_arr.length==1)
    {
        insert_item=layout_item_arr[0]
    }else{
        insert_item={
              "type": "tabs",
              "component": "widget-form-tabs",
              "label": "tab面板",
              "span": 24,
              "display": true,
              "style": {
                  "height": "100%"
              },
              
              "children": {
                  "align": "center",
                  "headerAlign": "center",
                  "column": layout_item_arr
              },
              "prop": Date.now() + '_' + Math.ceil(Math.random() * 99999)
          }
    }

    return {
        "type": "layout_div",
        "component": "widget-form-group",
        "label": "div布局",
        "span": 24,
        "icon": "icon-group",
        "display": true,
        "style": {
            "height": "100%"
        },                    
        "children": {
            "column": [
            insert_item
            ]
        }
    } //*/
}

export const build_chart_data=function (ds_name_source,context,fields) {
    let report_result=context.report_result
    let ds_name=ds_name_source.split(":")
    let real_data
    ds_name=ds_name.length>1?ds_name[1]:ds_name[0]
    if(ds_name_source.startsWith("数据集")){
        real_data= JSON.parse(JSON.stringify(report_result.dataSet[ds_name][0]))
    } 
    else if(ds_name_source.startsWith("元素")){
        let cur_grid=report_result.data[ds_name]
        real_data=context.clickedEle[ds_name].data
        if(real_data){
            let keys=Object.keys(real_data)
            let values=Object.values(real_data)
            if(keys.length==0){
                keys=cur_grid.columns
                values= cur_grid.tableData[cur_grid.extend_lines[0]]
            }
            real_data=JSON.parse(JSON.stringify([keys,values]))
        }
    }
    else if(ds_name_source.startsWith('表格'))
    {
        let cur_grid=report_result.data[ds_name]
        real_data=[cur_grid.columns]
        if(ds_name_source.startsWith('表格明细数据'))
        {
            for (let index = cur_grid.extend_lines[0]; index <= cur_grid.extend_lines[1]; index++) 
            {
                real_data.push(cur_grid.tableData[index])
            }
        }
        else if(ds_name_source.startsWith('表格汇总数据')){
            for (let index = cur_grid.colName_lines[1]+1; index < cur_grid.tableData.length; index++) 
            {
                if(index<cur_grid.extend_lines[0] || index > cur_grid.extend_lines[1] ){
                //if(cur_grid.tableData[index].find(x=>x==null)).length>2) //todo
                real_data.push(cur_grid.tableData[index])
                }
            }
        }        
    }else
    {
        real_data= [
                ['product', '2015', '2016', '2017'],
                ['Matcha Latte', 43.3, 85.8, 93.7],
                ['Milk Tea', 83.1, 73.4, 55.1],
                ['Cheese Cocoa', 86.4, 65.2, 82.5],
                ['Walnut Brownie', 72.4, 53.9, 39.1]
            ]
    }
    let valid_fileds=[]  
    if(!fields || fields.length==0)
        return {valid_data:real_data,valid_fileds:real_data[0],real_data} 
      
    let valid_data=[[]]
    for (let index = 0; index < fields.length; index++) {
        const element = fields[index];
        if(!element.selected)
            continue
        valid_fileds.push(real_data[0].indexOf(element.key))
        valid_data[0].push(element.label)
    }
    real_data.slice(1).forEach(element=>{
        let one_line=[]
        valid_data.push(one_line)
        valid_fileds.forEach(i=>{
                one_line.push(element[i])
        });
    });
    return {valid_data,valid_fileds,real_data}
}
export const convert_csv_to_json=function (txt,start=0,end=-1){
    let gridData=[]
    let data=txt.split("\n")
    if(end==-1)
        end =data.length-1
    let col_list=data[0].split(",")
    
    data.slice(start+1,end).forEach(element => {
        let one_line={}
        if(element.length==0)
            return false;
        let one_line_data=element.split(",")
        gridData.push(one_line)
        for (let index = 0; index < col_list.length; index++) {
            one_line[col_list[index]]=one_line_data[index];
        }  
    });
    return gridData
}
//转换数据库表样式的数组为JSON数组
export const convert_array_to_json=function (data,start=0,end=-1,col_list){
    let gridData=[]
    if(end==-1)
        end =data.length
    if(col_list==undefined)
    {
        col_list=data[0]
        start=start+1
    }
    data.slice(start,end).forEach(element => {
        let one_line={}
        if(element.length==0)
            return false;
        gridData.push(one_line)
        for (let index = 0; index < col_list.length; index++) {
            if(getObjType(element[index]) =="object")
                one_line[col_list[index]]='';
            else
                one_line[col_list[index]]=element[index];
        }  
    });
    return gridData
}

export const getObjType = obj => {
    var toString = Object.prototype.toString;
    var map = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Undefined]': 'undefined',
      '[object Null]': 'null',
      '[object Object]': 'object'
    };
    if (obj instanceof Element) {
      return 'element';
    }
    return map[toString.call(obj)];
  };
  /**
   * 对象深拷贝
   */
  export const deepClone = data => {
    var type = getObjType(data);
    var obj;
    if (type === 'array') {
      obj = [];
    } else if (type === 'object') {
      obj = {};
    } else {
      // 不再具有下一层次
      return data;
    }
    if (type === 'array') {
      for (var i = 0, len = data.length; i < len; i++) {
        data[i] = (() => {
          if (data[i] === 0) {
            return data[i];
          }
          return data[i];
        })();
        if(data[i]?.$parent)
        delete data[i].$parent;
        obj.push(deepClone(data[i]));
      }
    } else if (type === 'object') {
      for (var key in data) {
        if(data[i]?.$parent)
        delete data.$parent;
        obj[key] = deepClone(data[key]);
      }
    }
    return obj;
  };

  
function loadFile (name) { // name为文件所在位置
    let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.overrideMimeType("text/xml;charset=utf-8");//默认为utf-8
    xhr.send(null);
    return xhr.status === okStatus ? xhr.responseText : null;
}
var stringArray = [];
export function numToString(numm){
    stringArray.length = 0;
    var numToStringAction = function(nnum){
        var num = nnum - 1;
        var a = parseInt(num / 26);
        var b = num % 26;
        stringArray.push(String.fromCharCode(64 + parseInt(b+1)));
        if(a>0){
            numToStringAction(a);
        }
    }
    numToStringAction(numm);
    return stringArray.reverse().join("");
}
export function stringToNum(a){
    
    let str=a.toLowerCase().split("");

    let al = str.length;
    let getCharNumber = function(charx){
        return charx.charCodeAt() -96;
    };
    let numout = 0;
    let charnum = 0;
    for(let i = 0; i < al; i++){
        charnum = getCharNumber(str[i]);
        numout += charnum * Math.pow(26, al-i-1);
    }
    return numout;
}

export function getRangeByText(txt){
    
    let ret=[]
    txt.toLowerCase().split(":").forEach(one_txt => {
      let idx=0
      for(idx=0;idx<one_txt.length;idx++){
        if (one_txt[idx]<'a' || one_txt[idx]>'z' )
          break    
      }
      let c=stringToNum(one_txt.substring(0,idx))-1
      let r=parseInt(one_txt.substring(idx))-1
      ret.push({r,c})
    });
    if(ret.length==1)
      return ret[0]
    else
      return {r:ret[0].r,c:ret[0].c  , rs:ret[1].r-ret[0].r+1,cs:ret[1].c- ret[0].c+1 }
}
function getHtmlBorderStyle(type, color){
    let style = "";
    let borderType = {
        "0": "none",
        "1": "Thin",
        "2": "Hair",
        "3": "Dotted",
        "4": "Dashed",
        "5": "DashDot",
        "6": "DashDotDot",
        "7": "Double",
        "8": "Medium",
        "9": "MediumDashed",
        "10": "MediumDashDot",
        "11": "MediumDashDotDot",
        "12": "SlantedDashDot",
        "13": "Thick"
    };
    type = borderType[type.toString()];

    if(type.indexOf("Medium") > -1){
        style += "1pt ";
    }
    else if(type == "Thick"){
        style += "1.5pt ";
    }
    else {
        style += "0.5pt ";
    }

    if(type == "Hair"){
        style += "double ";
    }
    else if(type.indexOf("DashDotDot") > -1){
        style += "dotted ";
    }
    else if(type.indexOf("DashDot") > -1){
        style += "dashed ";
    }
    else if(type.indexOf("Dotted") > -1){
        style += "dotted ";
    }
    else if(type.indexOf("Dashed") > -1){
        style += "dashed ";
    }
    else{
        style += "solid ";
    }

    return style + color + ";";
}

function luckySheet2ReportGrid(sheet_window,DefaultCssSetting){
    let sheet=sheet_window.luckysheet.getSheet(0)
    let gridName=sheet_window.gridName
    let boderinfo=sheet_window.luckysheet.getBorderInfoCompute(0)
    let cells=[]
    let max_c=0,max_r=0
    sheet.data.forEach( (row,r)=>{
        row.forEach((cell,c)=>{
            if(cell!=null && cell.cr!=undefined && cell.cr._valueExpr!=undefined ){
                let cell_merge=(sheet.config && sheet.config.merge)?sheet.config.merge[`${r}_${c}`]:undefined
                if(cell_merge!=undefined){
                    cell.cr._name=numToString(cell_merge.c+1) + (cell_merge.r+1)+":"+
                            numToString(cell_merge.c+cell_merge.cs)+ (cell_merge.r+cell_merge.rs)
                    max_c=Math.max(max_c,cell_merge.c+cell_merge.cs)
                    max_r=Math.max(max_r,cell_merge.r+cell_merge.rs)
                }
                else {
                    cell.cr._name=numToString(c+1)+(r+1)
                    max_c=Math.max(max_c,c)
                    max_r=Math.max(max_r,r)
                }
                let cell_bd=boderinfo[`${r}_${c}`]
                cell.cr['_BORDER-LEFT']  = cell_bd?.l?getHtmlBorderStyle(cell_bd.l?.style,cell_bd.l?.color):""
                cell.cr['_BORDER-RIGHT'] = cell_bd?.r?getHtmlBorderStyle(cell_bd.r?.style,cell_bd.r?.color):""
                cell.cr['_BORDER-TOP']   = cell_bd?.t?getHtmlBorderStyle(cell_bd.t?.style,cell_bd.t?.color):""
                cell.cr['_BORDER-BOTTOM']= cell_bd?.b?getHtmlBorderStyle(cell_bd.b?.style,cell_bd.b?.color):""
                if(cell.mc){
                    cell_bd=boderinfo[`${r}_${c+cell.mc.cs-1}`]
                    if(cell_bd)
                        cell.cr['_BORDER-RIGHT'] = cell_bd?.r?getHtmlBorderStyle(cell_bd.r?.style,cell_bd.r?.color):""
                    cell_bd=boderinfo[`${r+cell.mc.rs-1}_${c}`]
                    if(cell_bd)
                        cell.cr['_BORDER-BOTTOM'] = cell_bd?.b?getHtmlBorderStyle(cell_bd.b?.style,cell_bd.b?.color):""
                }
                if(cell.cr['_FONT']==DefaultCssSetting.font) delete cell.cr['_FONT']
                if(cell.cr['_FONT-SIZE']==DefaultCssSetting.font_size) delete cell.cr['_FONT-SIZE']
                if(cell.cr['_background-color']==DefaultCssSetting.background_color) delete cell.cr['_background-color']
                if(cell.cr['_color']==DefaultCssSetting.color) delete cell.cr['_color']

                //if(cell.cr['_BORDER-LEFT']==DefaultCssSetting.border_style) delete cell.cr['_BORDER-LEFT']
                //if(cell.cr['_BORDER-RIGHT']==DefaultCssSetting.border_style) delete cell.cr['_BORDER-RIGHT']
                //if(cell.cr['_BORDER-TOP']==DefaultCssSetting.border_style) delete cell.cr['_BORDER-TOP']
                //if(cell.cr['_BORDER-BOTTOM']==DefaultCssSetting.border_style) delete cell.cr['_BORDER-BOTTOM']

                if(cell.cr._absName)
                    delete cell.cr._absName
                cells.push(JSON.parse(JSON.stringify(cell.cr)))
            }
        })
    })
    let rows=[]
    let row_num=Math.min(max_r+4, sheet.visibledatarow.length)
    let col_num=Math.min(max_c+4,sheet.visibledatacolumn.length)
    for(let i=0;i<row_num;i++){
        rows[i]={_name:i +1,_height:
            (sheet.config && sheet.config.rowlen && sheet.config && sheet.config.rowlen[i.toString()]!=undefined)?
            sheet.config.rowlen[i.toString()]:sheet.defaultRowHeight,
            _fixed:"False" }
    }
    let columns=[]
    for(let i=0;i<col_num;i++){
        columns[i]={_name:numToString(parseInt(i)+1).toLowerCase() ,_width:
            (sheet.config && sheet.config.columnlen && sheet.config && sheet.config.columnlen[i.toString()]!=undefined)?     
            sheet.config.columnlen[i.toString()] :sheet.defaultColWidth
             ,_fixed:"False" }
    }
    let fix_rows=sheet.freezen?.horizontal?.freezenhorizontaldata[1]
    let fix_cols=sheet.freezen?.vertical?.freezenverticaldata[1]
    
    let aaa= {grid:{_name:gridName,_title:gridName,_CanShow_expr:"",
            columns:{column:columns},rows:{row:rows},cells:{cell:cells}
            }
        }
    if(aaa.grid.columns.column.length==0)
        delete aaa.grid.columns.column
    if(aaa.grid.rows.row.length==0)
        delete aaa.grid.rows.row
    return aaa      
}

function designGrid2LuckySheet(grid,setting,DefaultCssSetting){
    let color = require('onecolor');
    let celldata=[]
    let merge={}
    let borderInfo=[]
    let rowlen={}
    let frozen_row_focus=-1, frozen_column_focus=-1
    
    if(grid.rows && grid.rows.row)
    grid.rows.row.forEach(one => {
        rowlen[(parseInt(one._name)-1).toString()]=parseInt(one._height)
        if(one._fixed=="True")
            frozen_row_focus=parseInt(one._name)-1
        
    });
    let columnlen={}
    if(grid.columns && grid.columns.column)
    grid.columns.column.forEach((one) => {
        columnlen[ (stringToNum(one._name)-1).toString()]=parseInt(one._width)
        if(one._fixed=="True")
            frozen_column_focus=stringToNum(one._name)-1
    });
    if(grid._fix_rows!=undefined){
        frozen_row_focus=grid._fix_rows-1
        frozen_column_focus=grid._fix_cols-1
    }
    let frozen={type: 'rangeColumn',range: {row_focus: -1, column_focus:frozen_column_focus } }
    if(frozen_column_focus<0)
        frozen=undefined
    if(grid.cells && grid.cells.cell && Array.isArray(grid.cells.cell)==false)
        grid.cells.cell=[grid.cells.cell]
    if(grid.cells && grid.cells.cell)
    grid.cells.cell.forEach(cell => {
        // {"r":13,"c":5,"v":{"bg":null,"bl":0,"it":0,"ff":0,"fs":11,"fc":"rgb(51, 51, 51)","ht":1,"vt":1,
        // "mc":{"r":13,"c":5,"rs":3,"cs":1}}}
        let pos=getRangeByText(cell._name)
        let one={r:pos.r,c:pos.c,v:{},cr:{}}

        one.v.v=cell._valueExpr
        one.v.cr=Object.assign({'_color':DefaultCssSetting.color,'_displayValueExpr':'=@value'},cell)
        if(cell._color)
            one.v.fc=cell._color
        one.v.ff=cell['_FONT']??DefaultCssSetting.font
        one.v.fs=parseInt(cell['_FONT-SIZE']??DefaultCssSetting.font_size)
        if(cell['_BOLD'] && cell['_BOLD']=="True")
            one.v.bl=1
        if(cell._color)
            one.v.fc=color(cell._color) ? cell._color :DefaultCssSetting.color
        else
            one.v.fc=DefaultCssSetting.color
        if(cell["_background-color"])
            one.v.bg=color(cell["_background-color"])?cell["_background-color"]:DefaultCssSetting.background_color
        else
            one.v.bg=DefaultCssSetting.background_color

        if(cell['_text-align']){
            if (cell['_text-align']=="center")
                one.v.ht=0
            else if (cell['_text-align']=="left")
                one.v.ht=1
            else
                one.v.ht=2
        }

        celldata.push(one)
        if(pos.hasOwnProperty("cs")){
            one.v.mc=Object.assign({},pos)
            for(let idx_r=0;idx_r<pos.rs;idx_r++){
                for(let idx_c=0;idx_c<pos.cs;idx_c++){
                    if (idx_r==0 && idx_c==0)
                        continue
                    celldata.push({r:pos.r+idx_r,c:pos.c+idx_c,v:{mc:{r:pos.r,c:pos.c}}})
                    merge[`${pos.r}_${pos.c}`]=Object.assign({},pos)
                }    
            }
        }        
        if(cell['_BORDER-BOTTOM'] &&  cell['_BORDER-TOP'] &&  cell['_BORDER-LEFT'] &&  cell['_BORDER-RIGHT'])
        {
            let already_add=false
            borderInfo.forEach(one_border_range => {
                if(pos.r>=one_border_range.range[0].row[0] && pos.r <=one_border_range.range[0].row[1]+1
                 && pos.c>=one_border_range.range[0].column[0] && pos.c<=one_border_range.range[0].row[1]+1
                ){
                    one_border_range.range[0].column[1]=pos.c +(pos.cs||0)
                    one_border_range.range[0].row[1]=pos.r +(pos.rs||0)
                    already_add=true
                    return false
                }
            });
            if(already_add==false)
                borderInfo.push({"rangeType": "range","borderType": "border-all","style": "1","color": "#000",
                            "range": [{"row": [pos.r,pos.r+(pos.rs?(pos.rs-1):0)],"column": [pos.c,pos.c+(pos.cs?(pos.cs-1):0)]}]  });
        }
    });
    return {
        "name": grid._name, //工作表名称
        "color": "", //工作表颜色
        "index": 0, //工作表索引
        "status": 1, //激活状态
        "order": 0, //工作表的下标
        "hide": 0,//是否隐藏
        "row": (grid.rows && grid.rows.row) ? grid.rows.row.length:10, //行数
        "column": (grid.columns && grid.columns.column) ? grid.columns.column.length:10, //列数
        "defaultRowHeight": 25, //自定义行高
        "defaultColWidth": 73, //自定义列宽
        "celldata": celldata, //初始化使用的单元格数据
        "config": {
            "merge":merge, //合并单元格
            "rowlen":rowlen, //表格行高
            "columnlen":columnlen, //表格列宽
            "rowhidden":{}, //隐藏行
            "colhidden":{}, //隐藏列
            "borderInfo":borderInfo, //边框
            "authority":{}, //工作表保护
            
        },
        enableAddBackTop:false,enableAddRow:false,
		sheetFormulaBar:false,
        "scrollLeft": 0, //左右滚动条位置
        "scrollTop": 0, //上下滚动条位置
        "luckysheet_alternateformat_save":  JSON.parse( setting.alternateformat_save??'[]'), //交替颜色
        //"luckysheet_alternateformat_save_modelCustom":  JSON.parse( setting.alternateformat_save_modelCustom??'[]'), //自定义交替颜色	
        "luckysheet_conditionformat_save": JSON.parse( setting.conditionformat_save??'[]'),//条件格式
        "frozen": frozen, //冻结行列配置
        "chart": [], //图表配置
        "allowEdit": true, //是否允许编辑
        "image":[], //图片
        "showGridLines": true, //是否显示网格线
    }
}
function resultGrid2LuckySheet(grid_name, param_grid){
    let {config_merge,rowlenArr,columnlenArr,config_borderInfo,config_celldata,conditionformat,alternateformat}={...param_grid}
    let _alternateformat;
    eval("_alternateformat=["+alternateformat+"]")
    return {
        "name": grid_name, //工作表名称
        "color": "", //工作表颜色
        "index": 0, //工作表索引
        "status": 1, //激活状态
        "order": 0, //工作表的下标
        "hide": 0,//是否隐藏
        
        "row": Object.keys(rowlenArr).length , //行数
        "column": Object.keys(columnlenArr).length, //列数
        "defaultRowHeight": 25, //自定义行高
        "defaultColWidth": 73, //自定义列宽
        "celldata": config_celldata, //初始化使用的单元格数据
        "config": {
            
            "merge":config_merge, //合并单元格
            "rowlen":rowlenArr, //表格行高
            "columnlen":columnlenArr, //表格列宽
            "rowhidden":{}, //隐藏行
            "colhidden":{}, //隐藏列
            "borderInfo":config_borderInfo, //边框
            "authority":{//当前工作表的权限配置
                selectLockedCells:1, //选定锁定单元格
                selectunLockedCells:1, //选定解除锁定的单元格
                formatCells:0, //设置单元格格式
                formatColumns:1, //设置列格式
                formatRows:1, //设置行格式
                insertColumns:0, //插入列
                insertRows:0, //插入行
                insertHyperlinks:1, //插入超链接
                deleteColumns:0, //删除列
                deleteRows:0, //删除行
                sort:1, //排序
                filter:1, //使用自动筛选
                usePivotTablereports:0, //使用数据透视表和报表
                editObjects:0, //编辑对象
                editScenarios:0, //编辑方案    
                sheet:1, //如果为1或true，则该工作表受到保护；如果为0或false，则该工作表不受保护。
                hintText:"", //弹窗提示的文字
                algorithmName:"None",//加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
                saltValue:null, //密码解密的盐参数，为一个自己定的随机数值
  
                allowRangeList:[{ //区域保护
                    name:"area", //名称
                    password:"1", //密码
                    hintText:"", //提示文字
                    algorithmName:"None",//加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
                    saltValue:null, //密码解密的盐参数，为一个自己定的随机数值
                    sqref:"\$C\$1:\$D\$5" //区域范围
                }]}, //工作表保护
            
        },
        enableAddBackTop:false,enableAddRow:false,
		sheetFormulaBar:false,
        "scrollLeft": 0, //左右滚动条位置
        "scrollTop": 0, //上下滚动条位置
        "luckysheet_alternateformat_save": _alternateformat, //交替颜色
        "luckysheet_alternateformat_save_modelCustom": [], //自定义交替颜色	
        //"luckysheet_conditionformat_save": conditionformat,//条件格式
        //"frozen": frozen, //冻结行列配置
        "chart": [], //图表配置
        "allowEdit": false, //是否允许编辑
        "image":[], //图片
        "showGridLines": 0, //是否显示网格线
    }   
}
export function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    })
  }
let signalR_connection
let _onReceiveMessage = undefined;
import { baseUrl } from '@/config/env'; 
export const get_signalR_connection=function(onReceiveMessage)
{ 
    _onReceiveMessage=onReceiveMessage
    if(signalR_connection && signalR_connection.connectionState!="Disconnected"    ){
        return signalR_connection
    }
    signalR_connection=new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/chatHub`, { accessTokenFactory: () => "d2762dbd" }).build();
    // Create a function that the hub can call to broadcast messages.
    signalR_connection.on('ReceiveMessage', function (name, message) {
        if(_onReceiveMessage)
            _onReceiveMessage(message)
        console.log(name||'', message||'');
    });
    // Transport fallback functionality is now built into start.
    signalR_connection.start()
        .then(function () {
            console.log('connection started');
            signalR_connection.invoke('SendMessage', "name", "messageInput.value");
    })
    .catch(error => {
        console.error(error.message);
    });
    return signalR_connection;
}
export const output_largeGrid=function(_this,cur_grid,onclickrow){
    if(cur_grid.type=="large"){
      let gridData=[]
      //cur_grid.data.splice(10)
      cur_grid.data.forEach(element => {
        let one_line={}
         gridData.push(one_line)
         for (let index = 0; index < cur_grid.col_list.length; index++) {
            one_line[cur_grid.col_list[index]]=element[index];
         }  
      });
      gridData={rows:gridData,footer:undefined,footer_merger_cell:undefined,total:gridData.length}
      cur_grid.content=cur_grid.content.replace('data-options=""', 'data-options="" style="height:250px"').replaceAll("__url__",`${baseUrl}/run`)
      cur_grid.content=cur_grid.content.replace("__exportjson__",JSON.stringify(gridData))
    }
    _this.self.content=cur_grid.content//.replace(/needResizeFunc.push\( function \(\) \{myChart.resize\(\);\}\);/,'')
    
      let script_pattern=/<script.*?>*?>([\s\S]*?)<\/script>/img
      let result;
      while ((result = script_pattern.exec(_this.self.content)) != null)  {
        let match_result=result[1];
        if(match_result && match_result.length>0){
            setTimeout(function(){
                if (window.needResizeFunc==undefined)
                    window.needResizeFunc=[]
                if (window.allTableArr==undefined)
                    window.allTableArr=[]
                let script = document.createElement('script'); 
                _this.scriptArr.push(script);
                script.type ='text/javascript'; 
                window['easyui_grid_onclickrow_'+_this.gridName]=onclickrow
                script.text = match_result +`
                jQuery(function(){
                jQuery('#reportDiv${_this.gridName}thetable').datagrid({
                    onClickRow:easyui_grid_onclickrow_${_this.gridName} 
                }).datagrid('loadData', reportDiv${_this.gridName}_data);
            })
                
                `
                document.head.appendChild(script)      
            })
        }
      }
    } 

export const parse_json=function(root=[],cur_path="$",retList){
    
    let root_type=getObjType(root)
    if(root_type=="array"){
        retList.push(cur_path)
        return true
    }
    let has=false
    if(root_type=="object"){
        Object.keys(root).forEach(one=>{
            let child_has=parse_json(root[one],cur_path+"."+one,retList)
            has=has || child_has
        })
    }
    return has
}
export const json_by_path=function(root,path="$"){
    let cur=root
    path.split(".").forEach(one=>{
        if(one=='$')
            cur=root
        else 
            cur=cur[one]
    })
    return cur
}
export {
    designGrid2LuckySheet,luckySheet2ReportGrid,resultGrid2LuckySheet,
    loadFile
}