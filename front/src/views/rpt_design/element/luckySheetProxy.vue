<template>
  <div :style="{width:'100%',height:height||'100%'}">
    <template v-if="context.mode!='design' && useHtml && gridType=='common'">
      <div  :style="{width:'100%','height':'calc(100% - '+pager_height+'px)'}" v-html="html_table" ref="htmTalbe">
          
      </div>
      <el-pagination  v-if="__TABLEOBJ!=undefined" 
        :current-page.sync="cur_page"
        :page-size.sync="self.page_size" 
        :page-sizes="JSON.parse(self.page_sizes)"
        :layout="context.crisMobile?'total, sizes, prev, next':'total, sizes, prev, pager, next, jumper'" 
        
        hide-on-single-page
        :total="__TABLEOBJ.total()">
      </el-pagination>
    </template>
    <div v-else-if="context.mode!='design' && useHtml && gridType=='large'" 
    :style="{width:'100%',height:'100%'}"
    v-html="self.content"></div>
    <iframe v-else ref='iframe' style="width:100%;height:100%"></iframe>
  </div>
</template>

<script>
let arrow_right_img=undefined
let arrow_down_img=undefined

import {designGrid2LuckySheet,numToString,getRangeByText,resultGrid2LuckySheet,output_largeGrid} from '../utils/util.js'
import   ResultGrid2HtmlTable2   from '../utils/resultGrid2HtmlTable.js'
import mixins from "./mixins"
export default {
 name: "luckySheetProxy",
  mixins:[mixins],
  components: {},
  props: {gridName:String,height:String},
  data(){
    return {
      _window:{},
      useHtml:true,
      html_table:"",
      cur_page:1,
      scrollLeft:0,
      scrollTop:0,
      __TABLEOBJ:undefined,
      scriptArr:[],pager_height:0,
      gridType:"common",
      delayShowType:"none" // or block
    }
  },
  computed:{
    datasource(){
      return "表格:"+this.gridName
    }
  },
  watch: {
    cur_page(){
      this.grid_sort_action()
    },
    "self.page_size"(){
      if(!this.self.page_sizes){
        this.self.page_sizes="[20, 50, 100, 200]"
      }
      if(!this.self.page_size){
        this.self.page_size=20
      }
      this.cur_page=1   
      this.grid_sort_action()   
    },
    //"context.report":function(){this.buildDisplayData() },
    gridName(newVal,oldVal){
      let grid=this.context.report?.AllGrids.grid.find(a=>a._name==oldVal)
      this._window.gridName=newVal
      this.self.gridName=newVal
      if(grid)
        grid._name=newVal
    }
  },
  created(){
    if(this.self.fresh_ds ==undefined){
          this.$set(this.self,'fresh_ds',[])
          this.$set(this.self,'fresh_params',[])
    }
    
  },
  mounted(){
    let _this=this
    setTimeout(function(){//如果不加，group中新增报表的时候会导致名字混乱
      _this.self.gridName=_this.gridName
      _this.buildDisplayData()

    })
    
  },
  beforeDestroy(){
    let idx=this.context.all_sheet_windows.indexOf(this)
    this.context.all_sheet_windows.splice(idx,1)
    this.scriptArr.forEach(ele=>{
        ele.remove()
    });
    this.$refs.htmTalbe?.querySelector(`#reportDiv${this.gridName}`)?.removeEventListener('scroll',this.scrollFunc)
    if(this.context.mode!='design')
        return
    let grid= this.context.report.AllGrids.grid.find(a=>a._name==this.gridName)
    //if(this.context.mode=='design'){// 同一报表多Tab页面切换，要保存
    //  let aaa=luckySheet2ReportGrid( this.context.all_sheet_windows[idx]._window)
    //  $.extend(grid,aaa.grid);  
    //}
      if(this.self.isDelete){
        if(grid!=undefined)
          this.context.report.AllGrids.grid.splice(this.context.report.AllGrids.grid.indexOf(grid), 1) 
        if(this.context.report_result && this.context.report_result.data)
          delete this.context.report_result.data[this.gridName]
        return
      }  
  },
  methods:{
    my_click(){
      console.info('my_click');
    },
    scrollFunc (evt){
      let target=evt.currentTarget
      let div_top=target.parentElement.querySelector(".cr-table__header-wrapper")
      //div_top.style.width=''+target.clientWidth+'px'
      div_top.scrollLeft=(target.scrollLeft);

      let div_Left=target.parentElement.querySelector(".cr-table__fixed-body-wrapper")
      div_Left.style.height=''+target.clientHeight+'px'
      div_Left.scrollTop=(target.scrollTop);

      this.scrollLeft=target.scrollLeft
      this.scrollTop=target.scrollTop
      
    },
    sortFunc(evt){
      this.__TABLEOBJ.sort(evt.currentTarget.dataset['c'])
      this.grid_sort_action(evt.currentTarget.dataset['c'])
    }, 
    grid_sort_action(){
      let _this=this
      let cur_grid=_this.context.report_result.data[_this.gridName]
      if(cur_grid){
          if(_this.$refs.htmTalbe){
            this.$refs.htmTalbe?.querySelector(`#reportDiv${this.gridName}`)?.removeEventListener('scroll',this.scrollFunc)
            let sortArr=$(_this.$refs.htmTalbe.querySelectorAll(`table .cr-sort`))
            if(sortArr.length>0)
              sortArr?.off('click',this.sortFunc)
          }
          if(this.__TABLEOBJ==undefined)
            this.__TABLEOBJ=new ResultGrid2HtmlTable2(cur_grid,this.$el,this.self,_this.context.report_result.footer2)
          this.pager_height=this.__TABLEOBJ!=undefined && (parseInt(this.self.page_size)<=this.__TABLEOBJ.total() )?32:0
          this.html_table=this.__TABLEOBJ.show(this.cur_page,this.self.page_size)
          
    
          //test.show(1,20)
          this.$nextTick(x=>{
            let target=_this.$refs.htmTalbe.querySelector(`#reportDiv${_this.gridName}`)
            let div_top=target.parentElement.querySelector(".cr-table__header-wrapper")
            div_top.style.width=`${target.clientWidth}px`
            let div_Left=target.parentElement.querySelector(".cr-table__fixed-body-wrapper")
            div_Left.style.height=`${target.clientHeight}px`
            //="16px"
            $(_this.$refs.htmTalbe.querySelectorAll(`table .cr-sort`)).on('click',_this.sortFunc)
            
            target?.addEventListener('scroll',_this.scrollFunc)
             this.$nextTick(xaa=>{
                div_Left.style.height=`${target.clientHeight}px`
                $(`#reportDiv${_this.gridName}Top .gutter`).width(target.offsetWidth - target.clientWidth)
                target.scrollLeft=_this.scrollLeft
                target.scrollTop=_this.scrollTop
                $(`#reportDiv${_this.gridName} .cr-table__body tr`).bind('click',
                function(evt){
                  let cur_row=_this.__TABLEOBJ.param_grid.tableData[$(evt.currentTarget).data("n")]
                  let ret={"KEY":cur_row[cur_row.length-1]}
                  for(let idx=0;idx<cur_row.length-1;idx++){
                    ret[numToString(idx+1)]=cur_row[idx]
                  }
                  console.info(ret)        
                  _this.$set(_this.context.clickedEle,_this.self.gridName,{data:ret,cell:null,column:null})
                  _this.click_fresh(_this.context.clickedEle[_this.self.gridName])

                }
                )
                _this.scrollFunc({currentTarget:target})
            })
          })
      }
    },
    onclickrow(idx,row){
      let ret={}
      Object.keys(row).forEach(ele=>{
        ret[numToString( getRangeByText(ele).c + 1)]=row[ele]
      })
          console.info(idx,row)
          if(row){
              this.$set(this.context.clickedEle,this.self.gridName,{data:ret,cell:null,column:null})
              this.click_fresh(this.context.clickedEle[this.self.gridName])
          }
    },
    buildDisplayData(is_run=false)
    {
      let _this=this
      if(_this.context.mode=='run' ||( _this.context.mode!='design' && this.useHtml)){
        this.gridType=this.context.report_result.data[_this.gridName].type
        if(this.gridType=='common'){
          this.__TABLEOBJ=undefined
           this.grid_sort_action()
        }
        else{//large
          output_largeGrid(this,this.context.report_result.data[_this.gridName],this.onclickrow) 
        }
        this.$set(this.context.clickedEle,this.self.gridName,{data:null,cell:null,column:null})
        return
      }

      let iDocumnet=this.$refs.iframe?.contentDocument
      if(this){
        let idx=this.context.all_sheet_windows.indexOf(this)
        if(idx>=0)
          this.context.all_sheet_windows.splice(idx,1)
      }
      this._window=this.$refs.iframe?.contentWindow.window  
      this.context.all_sheet_windows.push(this)
      //_window.luckysheet=luckysheet
      //_window.jQuery=jQuery
      //_window.$=$
      
      
      let  iframe_html=`<html lang="zh-CN" style="overflow-x: hidden;overflow-y: hidden;"><head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
                  
            <link rel="stylesheet" type="text/css" href="cdn/luckysheet/plugins/css/pluginsCss.css" />
                <link rel="stylesheet" type="text/css" href="cdn/luckysheet/plugins/plugins.css" />
                <link rel="stylesheet" type="text/css" href="cdn/luckysheet/css/luckysheet.css" />
                <link rel="stylesheet" type="text/css" href="cdn/luckysheet/assets/iconfont/iconfont.css" />
              <link rel='stylesheet' href='cdn/luckysheet/plugins/css/pluginsCss.css' />
              <link rel='stylesheet' href='cdn/luckysheet/plugins/plugins.css' />
              <link rel='stylesheet' href='cdn/luckysheet/css/luckysheet.css' />
              <link rel='stylesheet' href='cdn/luckysheet/assets/iconfont/iconfont.css' />
               <style>    .my-options{  cursor: pointer;      position: absolute;      z-index: 20;    }
                    .my-sort-options { color: #897bff;    border-radius: 3px; top: 3px;    
                            margin-left: 0;    display: none;    font-size: 12px;    height: 15px;    background: transparent;
                    },
                    a{ target:"_parent"}
                     
              </style>
            <head><body><div id='report' style = 'margin:0px;padding:0px;position:absolute;width:100%;height:100%;left: 0px;top: 0px;'></div></body></html>
            `
        iDocumnet.write(iframe_html);
        iDocumnet.close()

        this._window.gridName=_this.gridName
        this._window.selectChange=function(sheet,luckysheet_select_save){ 
          return _this.context?.selectChange(sheet,luckysheet_select_save,_this._window)
          }
        this._window.cellUpdateBefore=function(r, c, value, isRefresh){ 
          return _this.context?.cellUpdateBefore(r, c, value, isRefresh)
          }
        this._window.rangePasteBefore=function(select_save,txtdata,copy_save){ 
          return _this.context?.rangePasteBefore(select_save,txtdata,copy_save)
          }
        this._window.lucky_updated=_this.context.updated||function(){ }
        
        this._window.cellRenderBefore=function(cell,p,sheet,ctx) {
            
            _this.context.report.range_level.filter(x=>_this.gridName==x.gridName).forEach(x=>{
              let deta=x.level+1
              if(x.s_row==p.r && x.e_col>=p.c  && x.s_col<=p.c){
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.start_c, p.start_r+deta);
                ctx.lineTo(p.end_c, p.start_r+deta);
                ctx.stroke();
              }
              if(x.e_row==p.r && x.e_col>=p.c  && x.s_col<=p.c){
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.start_c, p.end_r-deta);
                ctx.lineTo(p.end_c, p.end_r-deta);
                ctx.stroke();
              }
              if(x.s_col==p.c && x.e_row>=p.r  && x.s_row<=p.r ){
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.start_c, p.start_r-deta);
                ctx.lineTo(p.start_c, p.end_r-deta);
                ctx.stroke();                
              }
              if(x.e_col==p.c && x.e_row>=p.r  && x.s_row<=p.r ){
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.end_c-deta, p.start_r);
                ctx.lineTo(p.end_c-deta, p.end_r);
                ctx.stroke();                
              }
            })
            if(cell?.cr?._extendDirection=='row')
            {
              if(arrow_down_img==undefined){
                arrow_down_img = new Image();    
                arrow_down_img.src = "img/arrow_down.png";  
                arrow_down_img.onload=function(params) {
                  ctx.drawImage(arrow_down_img,p.end_c,p.start_r,-10,25);
                }
              }else{
                ctx.drawImage(arrow_down_img,p.end_c,p.start_r,-10,25);
              }
              //<svg t="1610004191863" class="icon" viewBox="0 0 1000 1000" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1103" width="200" height="200"><path d="M227.986 584.688l257.492 257.492c20.11 20.11 52.709 20.11 72.819 0l257.492-257.492c20.11-20.11 20.11-52.709 0-72.819s-52.709-20.11-72.819 0l-169.585 169.585v-493.664c0-28.453-23.046-51.499-51.499-51.499s-51.499 23.046-51.499 51.499v493.664l-169.585-169.585c-10.042-10.043-23.226-15.089-36.41-15.089s-26.367 5.021-36.41 15.089c-20.11 20.11-20.11 52.709 0 72.819z" p-id="1104" fill="#d81e06"></path></svg>
            }
            if(cell?.cr?._extendDirection=='column')
            {
              if(arrow_right_img==undefined)
              {
                arrow_right_img = new Image();    
                arrow_right_img.src = "img/arrow_right.png";  
                arrow_right_img.onload=function(params) {
                  ctx.drawImage(arrow_right_img,p.start_c,p.start_r,60,16);
                }
              }else{
                ctx.drawImage(arrow_right_img,p.start_c,p.start_r,60,16);
              }
              //<svg t="1610004191863" class="icon" viewBox="0 0 1000 1000" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1103" width="200" height="200"><path d="M227.986 584.688l257.492 257.492c20.11 20.11 52.709 20.11 72.819 0l257.492-257.492c20.11-20.11 20.11-52.709 0-72.819s-52.709-20.11-72.819 0l-169.585 169.585v-493.664c0-28.453-23.046-51.499-51.499-51.499s-51.499 23.046-51.499 51.499v493.664l-169.585-169.585c-10.042-10.043-23.226-15.089-36.41-15.089s-26.367 5.021-36.41 15.089c-20.11 20.11-20.11 52.709 0 72.819z" p-id="1104" fill="#d81e06"></path></svg>
            }
        }
        let sheet_data;
        if(_this.context.mode!='design'){
            this._window.selectChange=function(){ } 
            this._window.cellUpdateBefore=function(){ } 
            this._window.rangePasteBefore=function(){ } 
            let cur_grid=_this.context.report_result.data[_this.gridName]
            if(cur_grid)
                sheet_data=JSON.stringify(resultGrid2LuckySheet( _this.gridName,  cur_grid))
        }
        else{
          let cur_grid=_this.context.report.AllGrids?.grid?.find(a=>a._name==_this.gridName)
          if(!cur_grid){
            cur_grid={}
            if(_this.gridName=="_random_"){
              _this.gridName="report_"+Math.ceil(Math.random() * 99999)
              //_this.self.gridName=_this.gridName
            }
            _this.context.report.AllGrids.grid.push({_name: _this.gridName})  
          }
          //this._window.cur_grid=reportGrid2LuckySheet(cur_grid)
          sheet_data=JSON.stringify(designGrid2LuckySheet(cur_grid,_this.self,_this.context.report.defaultsetting))
        }
        let append
        if(_this.context.mode!='design'){
            append= `rowHeaderWidth:0,columnHeaderHeight:0,showtoolbar:false,`
        }
        else{
          append=` cellRightClickConfig:{ copy: true, // 复制
              copyAs: true, // 复制为
              paste: true, // 粘贴
              insertRow: true, // 插入行
              insertColumn: true, // 插入列
              deleteRow: true, // 删除选中行
              deleteColumn: true, // 删除选中列
              deleteCell: true, // 删除单元格
              hideRow: false, // 隐藏选中行和显示选中行
              hideColumn: false, // 隐藏选中列和显示选中列
              rowHeight: true, // 行高
              columnWidth: true, // 列宽
              clear: true, // 清除内容
              matrix: false, // 矩阵操作选区
              sort: false, // 排序选区
              filter: false, // 筛选选区
              chart: false, // 图表生成
              image: false, // 插入图片
              link: false, // 插入链接
              data: false, // 数据验证
              cellFormat: false // 设置单元格格式
          },
          
          showtoolbarConfig:{  
                        undoRedo: false, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
                        paintFormat: false, //格式刷
                        currencyFormat: false, //货币格式
                        percentageFormat: false, //百分比格式
                        numberDecrease: false, // '减少小数位数'
                        numberIncrease: false, // '增加小数位数
                        moreFormats: false, // '更多格式'
                        font: true, // '字体'
                        fontSize: true, // '字号大小'
                        bold: true, // '粗体 (Ctrl+B)'
                        italic: true, // '斜体 (Ctrl+I)'
                        strikethrough: true, // '删除线 (Alt+Shift+5)'
                        textColor: true, // '文本颜色'
                        fillColor: true, // '单元格颜色'
                        border: true, // '边框'
                        mergeCell: true, // '合并单元格'
                        horizontalAlignMode: true, // '水平对齐方式'
                        verticalAlignMode: true, // '垂直对齐方式'
                        textWrapMode: true, // '换行方式'
                        textRotateMode: false, // '文本旋转方式'
                        image:true, // '插入图片'
                        link:false, // '插入链接'
                        chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
                        postil:  false, //'批注'
                        pivotTable: false,  //'数据透视表'
                        function: false, // '公式'
                        frozenMode: true, // '冻结方式'
                        sortAndFilter: false, // '排序和筛选'
                        conditionalFormat: true, // '条件格式'
                        dataVerification: false, // '数据验证'
                        splitColumn: false, // '分列'
                        screenshot: true, // '截图'
                        findAndReplace: false, // '查找替换'
                      protection:false, // '工作表保护'
                      print:false, // '打印'
                    }`
        }
        let showtoolbar=_this.context.mode=='design'
        let script = iDocumnet.createElement('script'); 
        script.type ='module'; 
        script.async=false;
        script.text = ` function insertScript(src,callback)
          {
            let script = document.createElement('script'); 
            script.type ='text/javascript'; 
            script.src = src
            document.head.appendChild(script)      
            if(callback!=undefined){
                script.onload = script.onreadystatechange = function() {
                  console.info(src)
                  if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
                      callback();
                      script.onload = script.onreadystatechange = null;
                  }// end if
              };// end onload function
            }//end if      
          } 
          function buildReport(){
              luckysheet.create({
                    container: 'report',lang: 'zh',forceCalculation:false,showsheetbar:false,
                    showstatisticBarConfig:{count: false,  view: false,   zoom: false,  },
                    enableAddBackTop:false,enableAddRow:false,sheetFormulaBar:false,
                    showinfobar:false,defaultFontSize:${_this.context.report.defaultsetting.font_size},
                    data:[${sheet_data}],
                    hook:{rangeSelect:selectChange,                      
                      updated:lucky_updated,
                      cellUpdateBefore:cellUpdateBefore,
                      rangePasteBefore:rangePasteBefore,
                      cellRenderAfter:cellRenderBefore
                      },
                    ${append}
              })
            }
            insertScript("cdn/luckysheet/plugins/js/plugin.js",function(){insertScript("cdn/luckysheet/luckysheet.umd.js",buildReport)})
          `
        iDocumnet.head.append(script);
    }
  }
}
</script>

<style>
.cr-table--fit {
    border-right: 0;
    border-bottom: 0;
}
.cr-table {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    max-width: 100%;
    background-color: #fff;
    font-size: 14px;
    color: #606266;
}
.cr-table--border {
    border-right: none;
    border-bottom: none;
}
.cr-table--scrollable-y .cr-table__body-wrapper {
    overflow-y: auto;
}
.cr-table--scrollable-x .cr-table__body-wrapper {
    overflow-x: auto;
}
.cr-table__body-wrapper {
    overflow: hidden;
    position: relative;
}
.cr-table__body-wrapper, .cr-table__footer-wrapper, .cr-table__header-wrapper {
    width: 100%;
}    
    .cr-table__body, .cr-table__footer, .cr-table__header {
    table-layout: fixed;
    border-collapse: separate;
}
.cr-table__fixed, .cr-table__fixed-right {
    position: absolute;
    top: 0;
    left: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    box-shadow: 0 0 10px rgb(0 0 0 / 12%);
}
.cr-table__fixed-header-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
}
.cr-table__body, .cr-table__footer, .cr-table__header {
    table-layout: fixed;
    border-collapse: separate;
}
.cr-table__fixed-body-wrapper {
    position: absolute;
    left: 0;
    top: 37px;
    overflow: hidden;
    z-index: 3;
}

.cr-table:before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
}

.cr-table--border:after, .cr-table--group:after, .cr-table:before {
    content: "";
    position: absolute;
    background-color: #ebeef5;
    z-index: 1;
}
.cr-table__footer-wrapper, .cr-table__header-wrapper {
    overflow: hidden;
}
.cr-table__footer-wrapper {
    margin-top: -1px;
}
.cr-table__fixed-right:before, .cr-table__fixed:before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: #ebeef5;
    z-index: 4;
}
.cr-table td.gutter, .cr-table th.gutter {
    width: 15px;
    border-right-width: 0;
    border-bottom-width: 0;
    padding: 0;
}
</style>