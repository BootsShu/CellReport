﻿<report version="2" needCatchQuShuException="False">
<dataSets>
<dataSet name="数据集1" type="sql" dataSource="testsqlite" fields="[&quot;类别名称&quot;,&quot;雇员名字&quot;,&quot;运货商名称&quot;,&quot;订购日期&quot;,&quot;金额&quot;]">SELECT 类别.类别名称, 雇员.姓氏||雇员.名字 AS 雇员名字, 运货商.公司名称 AS 运货商名称, 订单.订购日期,
 ([订单明细].[单价]*[数量]*(1-[折扣])/100)*100 AS 金额
FROM 运货商 INNER JOIN (类别 INNER JOIN (雇员 INNER JOIN (订单 INNER JOIN (产品 INNER JOIN 订单明细 ON 产品.产品ID = 订单明细.产品ID) ON 订单.订单ID = 订单明细.订单ID) ON 雇员.雇员ID = 订单.雇员ID) ON 类别.类别ID = 产品.类别ID) ON 运货商.运货商ID = 订单.运货商</dataSet>
</dataSets>
<params>
<param name="起始日期" data_type="string" width="20" lines="1" prompt="开始日期" hide="False" allowNull="False" inner="False" allowSpace="False" allowMutil="False" canUsedValueFrom="" dataSetName_kyz="" valueField_kyz="" tagField_kyz="" defaultValueFrom="NoneQuery" dataSetName_default="" valueField_default="" default_value="1997-01-01" />
<param name="end_date" data_type="string" width="20" lines="1" prompt="终止日期" hide="False" allowNull="False" inner="False" allowSpace="False" allowMutil="False" canUsedValueFrom="" dataSetName_kyz="" valueField_kyz="" tagField_kyz="" defaultValueFrom="NoneQuery" dataSetName_default="" valueField_default="" default_value="1997-12-31" />
</params>
<AllGrids>
<grid append="cellSpacing=0 cellPadding=0  style=&quot;TABLE-LAYOUT: fixed; MARGIN-TOP: 0px; FONT-SIZE: 11px; Z-INDEX: -5; MARGIN-LEFT: 0px;   BORDER-COLLAPSE: collapse;&quot;" optimize="True" name="main" fix_rows="-1" fix_cols="1" is_large="0" title="main" CanShow_expr="">
<columns>
<column name="a" width="75" fixed="False" />
<column name="b" width="75" fixed="False" />
<column name="c" width="75" fixed="False" />
<column name="d" width="75" fixed="False" />
<column name="e" width="75" fixed="False" />
<column name="f" width="75" fixed="False" />
<column name="g" width="75" fixed="False" />
<column name="h" width="75" fixed="False" />
</columns>
<rows>
<row name="1" height="25" fixed="False" />
<row name="2" height="25" fixed="False" />
<row name="3" height="25" fixed="False" />
<row name="4" height="25" fixed="False" />
<row name="5" height="25" fixed="False" />
<row name="6" height="25" fixed="False" />
<row name="7" height="25" fixed="False" />
</rows>
<cells>
<cell displayValueExpr="=@value" extendDirection="column" name="B2" valueExpr="类别名称" rowsOfPage="0" leftHead="" calcLevel="0" text-align="center" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" name="C2" valueExpr="类别合计" rowsOfPage="0" leftHead="" calcLevel="0" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" extendDirection="column" name="D2" valueExpr="运货商名称" rowsOfPage="0" leftHead="" calcLevel="0" text-align="center" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" name="E2" valueExpr="合计" rowsOfPage="0" leftHead="" calcLevel="0" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" extendDirection="column" name="B3" valueExpr="=数据集1.group(数据集1.类别名称)" rowsOfPage="0" leftHead="" calcLevel="1" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" valueExpr=" " text-align="right" name="C3" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" extendDirection="column" name="D3" valueExpr="=数据集1.group(数据集1.运货商名称)" rowsOfPage="0" leftHead="" calcLevel="1" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" valueExpr="  " text-align="right" name="E3" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" extendDirection="row" name="A4" valueExpr="=数据集1.group(数据集1.雇员名字)" rowsOfPage="0" leftHead="" calcLevel="0" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" name="B4" valueExpr="=数据集1.sum(数据集1.金额)" rowsOfPage="0" leftHead="" calcLevel="2" background-color="#80FF80" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" name="C4" valueExpr="=数据集1.sum(数据集1.金额)" rowsOfPage="0" leftHead="" calcLevel="1" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" name="D4" valueExpr="=数据集1.sum(数据集1.金额)" rowsOfPage="0" leftHead="" calcLevel="2" background-color="#FFFF80" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
<cell displayValueExpr="=@value" name="E4" valueExpr="=sum(d4{})" rowsOfPage="0" leftHead="" calcLevel="3" BORDER-LEFT="0.5pt solid #000;" BORDER-RIGHT="0.5pt solid #000;" BORDER-TOP="0.5pt solid #000;" BORDER-BOTTOM="0.5pt solid #000;" />
</cells>
<no_use_parent_css>0</no_use_parent_css>
</grid>
</AllGrids>
<reportName>test:/一行两并行列交叉.cr</reportName>
<layout>[
    {
        &quot;x&quot;: 0,
        &quot;y&quot;: 0,
        &quot;w&quot;: 24,
        &quot;h&quot;: 15,
        &quot;i&quot;: 0,
        &quot;element&quot;: {
            &quot;type&quot;: &quot;layout_div&quot;,
            &quot;label&quot;: &quot;div布局&quot;,
            &quot;span&quot;: 24,
            &quot;icon&quot;: &quot;icon-group&quot;,
            &quot;display&quot;: true,
            &quot;style&quot;: {
                &quot;height&quot;: &quot;100%&quot;
            },
            &quot;component&quot;: &quot;widget-form-group&quot;,
            &quot;prop&quot;: &quot;_random_&quot;,
            &quot;children&quot;: {
                &quot;column&quot;: [
                    {
                        &quot;type&quot;: &quot;luckySheetProxy&quot;,
                        &quot;label&quot;: &quot;main&quot;,
                        &quot;display&quot;: true,
                        &quot;style&quot;: {
                            &quot;height&quot;: &quot;100%&quot;
                        },
                        &quot;no_use_parent_css&quot;: true,
                        &quot;fit&quot;: true,
                        &quot;page_size&quot;: 20,
                        &quot;page_sizes&quot;: &quot;[20, 50, 100, 200]&quot;,
                        &quot;gridName&quot;: &quot;main&quot;,
                        &quot;span&quot;: 24,
                        &quot;component&quot;: &quot;luckySheetProxy&quot;,
                        &quot;prop&quot;: &quot;1638161796653_46247&quot;,
                        &quot;fresh_ds&quot;: [],
                        &quot;fresh_params&quot;: [],
                        &quot;conditionformat_save&quot;: &quot;[]&quot;,
                        &quot;alternateformat_save&quot;: &quot;[]&quot;
                    }
                ]
            }
        },
        &quot;moved&quot;: false
    }
]</layout>
<includeFiles />
<datasources>
<dataSource name="dfsd" oledb="0">Dsn=testDb</dataSource>
</datasources>
<macros />
<pageProperty Orientation="True" paperSize="A4" paperSize_rawKind="9" pageHeight="1169" pageWidth="827" marginLeft="1" marginRight="1" marginTop="1" marginBottom="1" Landscape="False" header="" footer="" />
<notebook />
<template />
<conn_list>testsqlite</conn_list>
<range_level>
<level>0</level>
<gridName>main</gridName>
<s_row>1</s_row>
<e_row>3</e_row>
<s_col>1</s_col>
<e_col>1</e_col>
</range_level>
<range_level>
<level>0</level>
<gridName>main</gridName>
<s_row>1</s_row>
<e_row>3</e_row>
<s_col>3</s_col>
<e_col>3</e_col>
</range_level>
<range_level>
<level>1</level>
<gridName>main</gridName>
<s_row>2</s_row>
<e_row>3</e_row>
<s_col>1</s_col>
<e_col>1</e_col>
</range_level>
<range_level>
<level>1</level>
<gridName>main</gridName>
<s_row>2</s_row>
<e_row>3</e_row>
<s_col>3</s_col>
<e_col>3</e_col>
</range_level>
<range_level>
<level>2</level>
<gridName>main</gridName>
<s_row>3</s_row>
<e_row>3</e_row>
<s_col>0</s_col>
<e_col>4</e_col>
</range_level>
<defaultsetting>
<font>微软雅黑</font>
<font_size>11</font_size>
<color>black</color>
<border_style>gray 1px dotted</border_style>
</defaultsetting>
<functions />
<script />
<canExecuteExpr />
<cache time="10" />
<bi_dataSets />
<click_refresh_grids />
<parsererror style="display: block; white-space: pre; border: 2px solid #c77; padding: 0 1em 0 1em; margin: 1em; background-color: #fdd; color: black">
<h3>This page contains the following errors:</h3>
<h3>Below is a rendering of the page up to the first error.</h3>
<div style="font-family:monospace;font-size:12px">error on line 90 at column 20864: Char 0x0 out of allowed range</div>
</parsererror>
</report>