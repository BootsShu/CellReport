<template>
<el-dialog  style="text-align: left;" :inline="true"
    :visible.sync="dialogVisible" :title="'数据管理'" 
        :close-on-click-modal="false"  @close="dialogVisible=false" 
          direction="btt" append-to-body  :fullscreen="true"
    >
    <ExprEditorDialog  :visible.sync="ExprEditorDialog_visible" 
        :target_obj="url_param" 
        :prop="{display:'引用报表的参数',val:'_default_value'}" 
        :report="context.report">
    </ExprEditorDialog>
    <el-container style="height:100%; border: 1px solid #eee">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
    
    <el-row>
        <div>
            <span>数据集</span> <el-button @click="save_data_for_init">备份</el-button>
            
            <el-dropdown @command="new_dataset($event)" style="float: right; padding: 3px 0">
                <span class="el-dropdown-link">
                    新增<i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="sql">来自数据库</el-dropdown-item>
                    <el-dropdown-item command="from">来自其他数据集</el-dropdown-item>
                    <el-dropdown-item command="memory">内存数据（sqlite）</el-dropdown-item>
                    <el-dropdown-item command="cr" style="color: gray">来自组件报表</el-dropdown-item>
                    <el-dropdown-item  command="csv" style="color: gray">来自excel文件</el-dropdown-item>
                    <el-dropdown-item  command="api" style="color: gray">来自API调用</el-dropdown-item>
                    <el-dropdown-item  command="html" style="color: gray">来自有Table的html网页</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </el-row>
    <el-row v-for="(ds,ds_idx) in all_dataSet" :key="ds+ds_idx" :style="{'background-color':action_target==ds?'#c5f3e0':'#fff'}"> <!-- https://www.iconfont.cn -->
        <img v-if="ds._type=='csv'" class="cr_icon" src="img/CSV图标.svg"/>
        <img v-if="ds._type=='api' " class="cr_icon" src="img/API.png"/>
        <img v-if="ds._type=='sql' " class="cr_icon" src="img/数据库.svg"/>
        <img v-if="ds._type=='cr'" class="cr_icon" src="img/引用.svg"/>
        <img v-if="ds._type=='from'" class="cr_icon" src="img/引用.svg"/>
        <div @click="action_target=ds"  style="display: inline-block;width:calc(100% - 50px)">{{ds._name}} </div>
        <el-button @click="delete_dataset(ds,ds_idx)" circle plain type="danger" size="mini" icon="el-icon-minus"
            style="padding: 4px;margin-left: 5px;float:right">
        </el-button>
         
    </el-row> 
   </el-aside>
   <el-main>

        <el-form :inline="true" class="demo-form-inline" v-if="action_target!=null">
            <el-row><el-col :span="6">
                <el-form-item label="名字"><el-button type="primary" @click="update_name" >{{action_target._name}}</el-button ></el-form-item>
            </el-col>
            
            <el-col v-if="action_target._type=='sql'|| action_target._type=='db'" :span="8">
                <el-form-item label="数据源">
                    <el-select v-model="action_target._dataSource" placeholder="数据源">
                        <el-option  v-for="(one,index) in context.report.conn_list" :key="one+index" :label="one" :value="one"></el-option>
                    </el-select>
                </el-form-item>
                </el-col>  <el-col :span="4">
                <el-form-item label="类型">{{action_target._type}} </el-form-item> </el-col>
                <el-button  v-if="['memory','sql','userDefine'].includes(action_target._type)" 
                 @click="preview">取数</el-button>
            </el-row>

            <el-row v-if="['sql','db'].includes(action_target._type) " :span="6">
                
                <div v-if="dataLengthList(action_target._name).length>1">
                    <el-tag v-for="(one,index) in dataLengthList(action_target._name)" :key="one+index" 
                        @click="url_choose_get(index)"
                        :style="{'font-weight':(action_target.get==index?'bold':'')}">
                        {{index }}
                     </el-tag>
                </div>     
            </el-row>

            <el-row v-if="['cr','api'].includes(action_target._type)">
                <el-col :span="16"  v-if="['cr'].includes(action_target._type)">
                    <el-input v-model="action_target._dataSource" placeholder="请输入URL地址"></el-input> 
                </el-col>
                 <el-col :span="2">
                     <el-button v-if="action_target._type=='cr'" @click="cr_run">取数</el-button> 
                     <el-button v-if="action_target._type=='api'" @click="api_run">取数</el-button> 
                     </el-col>
                 <el-col :span="6" style="font-weight:800" > 
                     当前选择的是 ： 
                     <span v-if="action_target.get && action_target._type!='api'" >
                     {{action_target.get.substring(0,2)=='tb'?'表格:':'数据集:' }}{{action_target.get.substring(3)}} 
                     </span >
                     <span v-else>
                    {{action_target.get}} 
                     </span >
                     </el-col>
            </el-row>
            <el-row  v-if="['memory','sql','userDefine','api','csv'].includes(action_target._type)">
                <el-col :span="24">
             <codemirror  
                        ref="editor" 
                        v-model="action_target.__text" 
                        style="height:100%"
                        :options="{tabSize: 4, mode: 'text/x-sql', lineNumbers: true,line: true,}"  
            /></el-col>
            </el-row>
            <el-table stripe border  :height="250" v-if="action_target.url_param" 
                    :data="action_target.url_param"  
                >
                <el-table-column prop="_prompt" label="参数说明"> </el-table-column>
                <el-table-column prop="_name" label="参数名"> </el-table-column>
                <el-table-column prop="_default_value" label="值">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row._default_value" 
                        style="width:80%"
                        placeholder=""></el-input> 
                        <el-button @click="paramDialog_open(scope.row)"
                         circle
                         type="success"
                         size="mini"
                         icon="el-icon-edit"
                         style="padding: 4px;margin-left: 5px"></el-button>
                    </template>
                </el-table-column>
            </el-table> 
            <el-row v-if="['api','csv','cr'].includes(action_target._type)"><el-col :span="10">
                <div v-if="action_target._path_list">
                    <el-tag v-for="(one,index) in JSON.parse(action_target._path_list)" 
                    :key="one+index" type="danger" 
                    @click="url_choose_get(one)"  
                    :style="{'font-weight':(action_target.get==one?'bold':'')}">{{one }}</el-tag>
                    
                </div>  
            </el-col>
            </el-row>

             <el-row v-if="action_target._type=='from'"><el-col :span="8">
                 挑选数据集
                <el-select v-model="action_target._dataSource" >
                    <el-option  v-for="(ds,index) in all_dataSet.filter(x=> 
                            ['db','sql','cr'].includes(x._type) 
                            && ((x._type!='cr' 
                            && dataLengthList(x._name).length>1) )|| x._type=='cr')" 
                        :key="ds._name+index" :label="ds._name" :value="ds._name"></el-option>
                    <el-option  v-for="(ds,index) in all_dataSet.filter(x=> 
                            ['api'].includes(x._type) && JSON.parse(x._path_list).length>1)" 
                        :key="ds._name+index" :label="ds._name" :value="ds._name"></el-option>
                    
                </el-select> 
                </el-col>
                 <el-col :span="8">
                     挑选内部数据集
                    <el-select v-model="action_target.__text" 
                            v-if="this.action_target._dataSource!=''  && ['db','sql'].includes(all_dataSet.find(a=>a._name==action_target._dataSource)._type)  " 
                    >
                        <el-option v-for="(one,index) in dataLengthList(action_target._dataSource).slice(1)" 
                            :key="index" type="success" @click="url_choose_get(one)"  :label="one" :value="one" >{{one }}</el-option>
                    </el-select> 
                    <el-select v-model="action_target.__text" 
                            v-if="this.action_target._dataSource!=''  && ['api','cr'].includes(all_dataSet.find(a=>a._name==action_target._dataSource)._type)" 
                    >
                        <el-option v-for="(one,index) in JSON.parse( all_dataSet.find(a=>a._name==action_target._dataSource)._path_list)" 
                            :key="index" type="success" @click="url_choose_get(one)"  :label="one" :value="one" >{{one }}</el-option>
                    </el-select>  
                     
                </el-col>
            </el-row>

            <div >
            <el-upload v-if="action_target._type=='csv'" class="upload-demo" action :auto-upload="false" :show-file-list="false" :on-change="choose_file"
            >
            <el-button size="small" type="primary">请选择导入excel</el-button>
            </el-upload>
            <div v-if="tableData.length==0" >无数据</div>
            
            <el-table stripe border  :height="250" v-if="tableData.length>0" 
                :data="tableData.slice((currentPage - 1) * pageSize, currentPage*pageSize)"  
                style="width: calc(100% -1px)">
                <el-table-column v-for="(one,idx) in Object.keys(tableData[0])"
                sortable :key="one+idx" :prop="one" :label="one"> </el-table-column>
            </el-table>           
            <el-pagination  v-if="tableData.length>0"
                :current-page.sync="currentPage"
                :page-sizes="[2, 5, 10, 20]"
                :page-size.sync="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total.sync="tableData.length">
            </el-pagination>
            </div>
       </el-form>
   </el-main>
  </el-container>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button @click="print_json">print_json</el-button>
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
</el-dialog>
</template>

<script>

import  codemirror  from './element/vue-codemirror.vue'
import ExprEditorDialog from './ExprEditorDialog.vue'
import {request} from 'axios'
import {baseUrl} from './api/report_api'
import {convert_csv_to_json,convert_array_to_json,parse_json,json_by_path,getObjType } from "./utils/util"
export default {
    name: "datasetManger2",
    components: {codemirror,ExprEditorDialog},
    props: { visible: Boolean},
    inject: ["context"],
    data(){
        return {
            all_dataSet:[],
            datasetDialog_visible:false,
            action_target:null,
            action_name:"",
            dialogVisible:false,
            url_param:{},
            ExprEditorDialog_visible:false,
            currentPage: 1,
            pageSize: 10
            
        }
    },watch:{
        dialogVisible(val) {
            this.$emit('update:visible', val)
        },
        visible(val) {
            if(val){
                this.all_dataSet=JSON.parse(JSON.stringify(this.context.report.dataSets.dataSet))
            }
            this.dialogVisible=val
            this.$emit('update:visible', val)
        },
        from(){

        }
    
    },
    mounted(){
        this.all_dataSet=JSON.parse(JSON.stringify(this.context.report.dataSets.dataSet))
        this.dialogVisible=true
        
    },
    computed:{
        tableData(){
            if(this.action_target.report_result && getObjType(this.action_target.report_result)=="string")
                this.action_target.report_result=JSON.parse(this.action_target.report_result)
            let ret
            try{
                if(this.action_target._type=="csv" && this.action_target.get)
                {
                    ret=JSON.parse(this.action_target.data) [this.action_target.get]
                    console.info(getObjType(ret[0]))
                    if(ret.length>0 && getObjType(ret[0])=="array" )
                        ret=convert_array_to_json(ret)
                    //console.info(getObjType(ret[0]))
                    return ret
                }
                if(this.action_target._type=="from" && this.action_target._dataSource!="" && this.action_target.__text!="")
                {
                    let cur_ds=this.all_dataSet.find(a=>a._name==this.action_target._dataSource)
                    if(cur_ds._type=='api'){
                        ret=json_by_path(cur_ds.report_result,this.action_target.__text)
                        return ret
                    }
                    if(cur_ds.report_result){
                        ret=this.choose_cr_ds(cur_ds.report_result,this.action_target.__text)
                        return ret
                        
                    }
                    else
                    {
                        let data=this.context.report_result.dataSet[cur_ds._name][this.action_target.__text||0]
                        if (data && data.length>1){
                            this.action_target._fields=JSON.stringify(data[0])
                            ret= convert_array_to_json(data)
                            return ret
                        }
                    }
                        
                }
                if( ['memory','sql','userDefine'].includes(this.action_target._type) )
                {
                    if(this.context.report_result?.dataSet && this.action_target._name)
                    {
                        if(this.context.report_result.dataSet[this.action_target._name]){
                            let data=this.context.report_result.dataSet[this.action_target._name][this.action_target.get||0]
                            if (data){
                                ret= convert_array_to_json(data)
                                return ret
                            }
                        }
                    }
                }
                if(this.action_target._type=="cr"  && this.action_target.get){
                    ret= this.choose_cr_ds(this.action_target.report_result,this.action_target.get)
                    return ret
                }
                if(this.action_target._type=="api"  && this.action_target.get){
                    if(this.action_target.__text.indexOf("from_zb")>=0){
                        if(this.action_target.report_result==undefined)
                             return []
                        let data=JSON.parse( this.action_target.report_result.ds_dict[this.action_target.get])
                        ret=convert_array_to_json(data.data,0,-1,data.columns)
                    }
                    else
                        ret= json_by_path(this.action_target.report_result,this.action_target.get)
                    return ret
                }
                return []
            }
             finally{
                if (ret && ret.length>1){
                    this.action_target._fields=JSON.stringify(Object.keys(ret[0]))
                }
            }
        }
       
    },
    
    methods:{
        
        preview(){

        },
        paramDialog_open(row){
            this.url_param=row
            this.ExprEditorDialog_visible=true;
        },
        
        dataLengthList(ds_name){
            let ret=[]
            let i=0
            if (ds_name!='' && Object.keys(this.context.report_result).length>1){
                this.context.report_result.dataSet[ds_name]?.forEach(one=>
                    {
                        ret.push(i);
                        i++;
                    }
                ) ;
            }
            return ret
        },
        choose_cr_ds(ds,name){
            if(!ds)
                return []
            if(name.toString().startsWith("ds:")){
                let data=ds.dataSet[name.slice(3)]
                if (data){
                    return convert_array_to_json(data[0])
                }
            }else if(ds && name.toString().startsWith("tb:")){
                let data=ds.data[name.slice(3)]
                if (data && data.type=="common"){
                    return convert_array_to_json(data.tableData.slice (data.colName_lines[1]+1,data.extend_lines[1]+1),0,100,data.columns)
                }
                if (data && data.type=="large"){
                    return convert_array_to_json(data.data,0,100,data.columns)
                }
            } 
            return []
        },
        url_choose_get(name){
            this.$set(this.action_target,"get",name)
            this.currentPage=1
        },
        cr_run(){
            let _this=this
            const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                    });
            let data=new FormData();
            data.append("expr", `return web_request({'url':'${this.action_target._dataSource}','headers':{'needType':'json' } } );`)
            request({
                method: 'post',data,
                url: `${baseUrl}/design/exec_expr`,
            }).then(resp => {
                loading.close();
                if(resp.errcode!=0){
                    _this.$alert(resp.message)
                    return
                }
                let response_data=JSON.parse( resp.result)
                console.log(response_data);
                _this.$set(this.action_target,"report_result",response_data)
                let param=[]
                _this.action_target.report_result.form.forEach(ele=>{
                    param.push({_name:ele.name,_prompt:ele.prompt,_default_value:ele.default_value})
                })
                if(_this.action_target.url_param){                    
                    Object.assign(param,_this.action_target.url_param)
                }
                _this.$set(_this.action_target,"url_param",param)  
                let path_list=[]
                Object.keys( _this.action_target.report_result.data).forEach(x=>path_list.push("tb:"+x))
                if(_this.action_target.report_result?.dataSet)
                    Object.keys( _this.action_target.report_result.dataSet).forEach(x=>path_list.push("ds:"+x))
                this.action_target._path_list=JSON.stringify(path_list)
                _this.$set(this.action_target,"get",path_list[0])
            }).catch(error=> { 
                loading.close();
                this.$message.error(JSON.stringify(error.response_data));
            })
        },
        api_run(){
            let _this=this
            let data=new FormData();
            data.append("expr", this.action_target.__text )
            request({
                method: 'post',data,
                url: `${baseUrl}/design/exec_expr`,
                withCredentials: true
            }).then(response_data => {
                console.info('api 成功')
                if(response_data.errcode==1){
                    this.$message.error(response_data.message)
                    return
                }
                let path_list=[]
                
                let result=JSON.parse( response_data.result)
   
                
                if(_this.action_target.__text.indexOf("from_zb")>=0 ){
                    path_list=result.df_arr
                    if(_this.action_target.__text.indexOf("desc")<0 ){
                        //delete result.data_from.ds
                        _this.action_target.__text="from_zb( \n" + 
                        JSON.stringify( result.data_from,4).replaceAll("},","} ,\n\t").replaceAll("[{","[\n\t{").replaceAll("],",  "] ,\n\t") + "\n);"
                    }
                }else{
                    parse_json(result,'$',path_list)
                }

                _this.$set(this.action_target,"report_result",result)
                this.action_target._path_list=JSON.stringify(path_list)
                _this.$set(this.action_target,"get",path_list[0])

            }).catch(error=> { 
                this.$message.error(JSON.stringify(error.response_data));
            })
        },
        print_json(){
            //his.all_dataSet.forEach(one=>{
            //     if(['cr','api'].includes( one._type)){
            //        if( one.report_result && getObjType(one.report_result)=="object")
            //           one.report_result=JSON.stringify(one.report_result)
            //    }
            //})
            console.info(JSON.stringify(this.all_dataSet,null,4))
        },
        handleSubmit(){
            this.all_dataSet.forEach(one=>{
                if(['cr','api'].includes( one._type)){
                     if( one.report_result )
                        delete one.report_result
                }
            })
            this.context.report.dataSets.dataSet.splice(0)
            JSON.parse(JSON.stringify(this.all_dataSet)).forEach(ele=>{
                this.context.report.dataSets.dataSet.push(ele)
            })
            this.dialogVisible=false
        }, 
        has_name(name){
          if(!name){
              this.$alert("名字不能为空");
            return true
          }
          if(this.context.allElementSet.has(name)){
            this.$alert("名字不能已有元素名称重复");
            return true;  
          }
          if(this.all_dataSet.filter(x=>x._name==name).length>0){
            this.$alert("名字不能重复");
            return true;
          }
          return false
        },
        
        update_name(){
            let _this=this
            this.$prompt('请输入数据集名字', '名字', 
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern:/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z_0-9\u4e00-\u9fa5]*$/,
                inputValue:this.action_target._name
            })
            .then( ({ value }) => {
                if(_this.action_target._name==value)
                    return
                if(_this.has_name(value))
                    return
                _this.action_target._name=value
            }).catch(error=>error) 
        },
        new_dataset(command, node,data){
            let _this=this
            this.$prompt('请输入名字', '名字', 
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern:/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z_0-9\u4e00-\u9fa5]*$/,
                inputValue:"ds"
            }).catch(error=>error)
            .then( ({ value }) => {
                 if(_this.has_name(value))
                    return
                _this.action_target={__text:'',_dataSource:'',_name:value,_type:command,_fields:"[]"}
                if(command=="from"){
                    _this.action_target._dataSource=""
                    _this.action_target.__text=""
                }
                if(command=="api"){
                    _this.action_target._dataSource=""
                    _this.action_target.__text=`from_zb( { "url":"报表地址"} );                    

web_request({
'url':"API网址"  //用你的地址替换这里
,'method':'post'  //可用方法: get ,post
,'data':{'branch_no':'410000'}  //使用form提交,不需要的话，用null替换冒号后的内容
,'json':null      //使用json提交，json 和data 不能同时有值，至少有一个是null
,'headers':null   
});// 语句必须以逗号结束

innerReport(); //设计好的报表页面选中有关单元格，复制粘贴到小括号里面

//以上三选一，不用的请手工删掉
`
                }
                _this.all_dataSet.push(_this.action_target )
            })           
        },
        delete_dataset(item,idx){
            let _this=this
            this.$confirm(`确实要删除针对【${_this.all_dataSet[idx]._name}】吗？`,'提示', 
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
            .then( function () {
                let len=_this.all_dataSet.length
                _this.all_dataSet.splice(idx, 1)
                if(len==1){
                    _this.action_target=null
                }
                else if(idx==len-1){
                    _this.action_target=_this.all_dataSet[len-2]
                }else{
                    _this.action_target=_this.all_dataSet[idx]
                }
            }).catch(function () {});
        },
    save_data_for_init(){
        return
        if(this.context.report.template==undefined)
            this.context.report.template={}
        this.context.report.template.before_exec_script=`
        var _init_dataset_dict_=
            ${ JSON.stringify(this.context.report_result.dataSet,null).replaceAll("{}",null).replaceAll("],[","],\n[")};
        `
    },
    choose_file(file) {
      this.file = file.raw;//这是element的导入数据选择，必须要添加.raw才能获取，其他表单不需要
      // console.log(file);//上传文件信息
      this.importExcel(this.file)
    },
    importExcel(file) {//来自euiadmin ，在https://github.com/chenboyan1/Euiadmin
      
      let _this=this
      //声明一个文件读取器
      const fileReader = new FileReader();
      //文件读取成功时触发事件
      fileReader.onload = (ev) => {
        try {
          //读取的文件;
          const data = ev.target.result;
          //以二进制流方式读取得到整份excel表格
          const workbook = XLSX.read(data, { type: "binary" });
          // 循环遍历excel的sheet对象
          let result={}
          Object.keys(workbook.Sheets).forEach((sheet) => {
            result[sheet]=XLSX.utils.sheet_to_json(workbook.Sheets[sheet],{header:1})
          });
        _this.$set(_this.action_target,"data",JSON.stringify(result))
        _this.$set(_this.action_target,"_path_list",JSON.stringify(Object.keys(result)))
        _this.$set(_this.action_target,"get",Object.keys(result)[0])
        _this.action_target._fields=JSON.stringify(Object.keys(result[Object.keys(result)[0]][0]))
          // 自定义事件，比如校验excel数据。转换数据格式…
          //console.log(_this.excelTableData)//未转换key值的数据
          // this.changeKey(excelData)//调用转换key值
        } catch (e) {
          this.$message.danger('文件类型不正确');
        }
      };
      //读取文件
      fileReader.readAsBinaryString(file);
    },
    }
}
</script>

<style>
.el-dialog__body {height: calc(100% - 200px);}
</style>