# 介绍

CellReport 是一个为 复杂统计报表 为核心目标的制作、运行工具。你可以使用数据库、excel文件、api服务、已有报表等为数据源，通过内置的集合函数组织数据，以类excel界面设计最终呈现结果。

CellReport 诞生的初衷是为了解决日常快速制作统计报表的需要。在总结了市面上各种报表软件的前提下，结合集合运算的思想，使得报表制作人员抛弃使用存储过程加工数据的方式，专注于每一类指标的加工，然后在报表设计界面，通过集合函数组织数据，极大得方便了报表的制作和维护。
## 主要特点：
1、多数据集的**集合运算**
2、**单元格扩展、引用**
3、内置**类js语言引擎**等方式
4、丰富的函数定义
5、可自定义扩展函数
6、页面元素丰富。预定义有报表组件、echart组件、数据展现组件等
7、灵活的报表元素间的数据引用，局部报表刷新设置方便
8、组件报表引用、以及对其他报表软件制作的报表引用（专业版提供）

## 技术实现
前端设计器采用基于vue、luckysheet、echarts等前端技术实现的网页方式
后端报表引擎核心基于netcore6 实现

## 它是如何工作的？

报表运行时，会首先以并行方式将所有数据集的数据取到运行环境，然后根据报表设计中预定义好的公式做数据的合并、运算，最终数据以json方式传给最终展现页面，前端页面根据json结果呈现最终展示。

报表运行环境内置了类js语言环境，所有运算都是以该语言为核心。通常制作报表，我们只需要记住10个左右的函数，以及+-*/ ，就足够我们制作复杂的统计报表了。

运行环境提供了很多可以拦截接入自定义控制的地方，如：报表运行前的通用检查、控制数据集的数据是否回传前端等。前端展现可以动态插入自定义css、js 。

前端是以vue 为基础，通过template-compiler模板编译器，可自由控制echart、数据展现等组件的显示样式。

后端运行的基础环境是net6。内存效率利用极高，仅需300M左右内存。内部大量异步任务和延迟返回等技术，执行效率基本和原生手写加工数据程序的运行效率相当。

我们可以通过实现FunctionUnit接口实现系统没有预定义的函数，也可以用内置语言实现一些简单的函数扩展。

## 需要安装的软件
1. 下载安装NETCORE6 SDK 或 RUNTIME.[Download .NET (Linux, macOS, and Windows)](https://dotnet.microsoft.com/download)
2. 下载安装redis（可选）。最好安装 [https://github.com/MicrosoftArchive/redis/releases](https://github.com/MicrosoftArchive/redis/releases)
3. 下载解压传输链接：https://cowtransfer.com/s/a21509df346642 或 打开【奶牛快传】cowtransfer.com 使用传输口令：00qhci 提取；

## 运行和配置
假设解压安装到了d:\cellReport。(单独更新前端时，将前端文件解压到d:\cellReport\wwwroot下)。如果使用nginx反向代理，可以单独存放前端文件。
1. 在安装目录下，执行 reportWeb.exe -p 5000
2. 浏览器输入地址:  http://127.0.0.1:5000
3. 缺省管理员用户在appsetting.json中存有（最后面可以找到），可以自行修改。

### 报表组管理
 缺省已经有了一个default组和example组。第一次登录，选报表组管理做基本的配置报表存放路径和数据库链接。可以根据不同的应用建立不同的组。报表组可以添加协助管理人员，多个用户中间用英文逗号分割。
 
 当前预安装的数据库驱动程序有:sqlServer、sqlite、Mysql、Pgsql、odbc。需要其他驱动的自行下载安装。
![](https://atts.w3cschool.cn/attachments/image/20211125/1637815124338385.png)


```
sql server 连接串
Data Source=ip地址;Initial Catalog=数据库名字;Persist Security Info=True;User ID=用户;Password=口令;Min Pool Size=1;Max Pool Size=50;Connect Timeout=15000;Application Name=报表连接
```

配置完毕后，按F5 刷新页面，点报表目录，正常的话，这是应该能看到所有的测试报表了

## 报表交流qq群 860056080

## 本软件使用到的的第三方软件，在此一并致谢
前端： [luckysheet](https://github.com/mengshukeji/Luckysheet) ，vue ，element-ui, [avuejs](http://avuejs.com)
后端: antlr3
