<template>
  <div class="widget-form-container">
    
    <el-form :label-position="data.labelPosition || 'left'"
             :label-width="data.labelWidth ? `${data.labelWidth}px` : '100px' "
             :label-suffix="data.labelSuffix"
             :model="form"
             ref="widgetForm"
             size="small">
        <widget-form-item :self="data" :parent="data"  
                            class="widget-form-list"
                          :select.sync="selectWidget"
                          :params="data.params"  @change="$emit('change')">
        </widget-form-item> 
    </el-form>
  </div>
</template>

<script>


import {widget_div_layout} from './fieldsConfig'
import mixins from "./element/mixins"
export default {
  name: 'widget-form',  
   mixins:[mixins],
  props: ['data', 'select'],
  data () {
    return {
      form: {}
    }
  },
  methods: {
  },
}
</script>
