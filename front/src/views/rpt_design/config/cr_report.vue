<template>
  <div>
    <el-form-item label="页面">
    <el-switch  v-model="data.fit"  active-color="#ff4949" inactive-color="#13ce66"  inactive-text="保持" 
    active-text="撑满"  
    > </el-switch>
    </el-form-item> 

    <el-form-item label="全局格式">
        <el-switch  v-model="data.no_use_parent_css"  active-color="#ff4949" inactive-color="#13ce66"  inactive-text="使用" 
        active-text="不使用"  
        > </el-switch>
    </el-form-item> 

    <el-form-item label="每页行数"> 
        <el-input-number v-model="data.page_size" placeholder="每页行数"></el-input-number>
    </el-form-item> 

    <el-form-item label="可用分页">
    <el-input v-model="data.page_sizes" placeholder="可用分页"></el-input>
    </el-form-item> 

    <el-form-item label="is_large">
        <el-checkbox v-model="cur_grid._is_large" true-label="1" false-label="0" label="is_large" border></el-checkbox>
    </el-form-item> 
    
      <cr_set_fresh :data="data" />

  </div>
</template>

<script>
import cr_set_fresh from "./cr_set_fresh.vue"
export default {
    name: 'config-report',
    components: {cr_set_fresh},
    inject: ["context"],
    props: ['data'],
    computed:{
        cur_grid(){
            let ret= this.context.report.AllGrids.grid.find(x=>x._name==this.data.gridName)
            if(ret._is_large==undefined){
              if(ret._idField!=undefined)
                this.$set(ret,"_is_large","1")
              else 
                this.$set(ret,"_is_large","0")
            }
            if(ret.no_use_parent_css==undefined){
                this.$set(ret,"no_use_parent_css","0")
            }
            return ret
        }
    }
}
</script>

<style>

</style>