<template>
	<div class="tabelwrapper">
        <el-row class="tabel-buttons">
            <el-col :span="12">
                <el-dropdown size="small" placement="bottom-start" @command="onExport">
                    <el-button type="primary" size="mini">导出</el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item :command="{isAll:true,isMade:false}">导出全部</el-dropdown-item>
                        <el-dropdown-item :command="{isAll:true,isMade:true}">导出全部(指定字段)</el-dropdown-item>
                        <el-dropdown-item :command="{isAll:false,isMade:false}">导出选中</el-dropdown-item>
                        <el-dropdown-item :command="{isAll:false,isMade:true}">导出选中(指定字段)</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>                
                <!-- <el-button type="primary" size="mini" v-if="currentNode.type=='company'" @click="allocation()">分配</el-button>
                <el-button type="primary" size="mini" @click="recovery()">回收</el-button> -->
                <!-- <el-button type="primary" size="mini" v-if="currentNode.type=='product'" @click="onMount()">挂载</el-button> -->
                <el-button type="primary" size="mini" @click="onMount()">挂载</el-button>
                <el-button type="primary" size="mini" v-if="currentNode.type=='service'" @click="onUninstall()">卸载</el-button>
            </el-col>
            <el-col :span="12" style="text-align:right">
                <!-- <el-button type="primary" size="mini">创建</el-button> -->
                <el-button type="primary" size="mini" @click="dialogUpload = true">导入</el-button>
                <el-button type="primary" size="mini" @click="setting()">设置</el-button>
                <el-button type="primary" size="mini" v-if="currentNode.type=='company'" @click="dialogQuery = true">批量查询</el-button>
                <el-button type="primary" size="mini" v-if="currentNode.type=='company'" @click="update(null)">批量更新</el-button>
            </el-col>
        </el-row>

        <!--分配-->
        <el-dialog title="分配" @close="dialogAllocationClose"  :visible.sync="dialogAllocation" width='800px'>
            <el-form :model="allocationForm" ref="allocationForm">
                <el-form-item label="当前分配状态" label-width="120px">
                    未分配
                </el-form-item>
                <el-form-item label="分配至" label-width="120px" prop="allocation">
                    <el-select v-model="allocationForm.allocation" filterable placeholder="请选择">
                        <el-option 
                            v-for="(item,i) in allocationOptions"
                            :key="i"
                            :label="item.path" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogAllocationClose">取 消</el-button>
                <el-button type="primary" @click="allocationSubmit">确 定</el-button>
            </div>
        </el-dialog>

        <!--挂载-->
        <el-dialog title="挂载" @close="dialogMountClose"  :visible.sync="dialogMount" width='800px'>
            <el-form :model="mountForm" ref="mountForm">               
                <el-form-item label="挂载至" label-width="120px" prop="id">
                    <el-select v-model="mountForm.id" filterable placeholder="请选择">
                        <el-option 
                            v-for="(item,i) in mountOptions"
                            :key="i"
                            :label="item.path" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogMountClose">取 消</el-button>
                <el-button type="primary" @click="mountSubmit">确 定</el-button>
            </div>
        </el-dialog>

        <!--导入-->
        <el-dialog title="导入" @close="dialogUploadClose" :visible.sync="dialogUpload" width='800px'>
            <el-upload class="upload-demo" ref="upload" :limit="1"
                :action="'/zuul/cmdb-service/api/'+mType+'/importMo/'" 
                :on-change="handleChange" :before-upload="beforeFileUpload"
                :file-list="fileList" :auto-upload="false">
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                <el-button style="float: right;" size="small" type="primary" >
                    <a class="v-upload" :href="'/cmdb-service/api/'+mType+'/downloadMoTemplate'" download>模板下载</a>
                </el-button>
                <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过10Mb</div>
            </el-upload>
            <el-alert v-for="(item,i) in fileListTip" :key="i" :title="item.title" :type="item.type" show-icon></el-alert>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogUploadClose">关闭</el-button>
            </div>
        </el-dialog>

        <!--导出字段选择   设置-->
        <el-dialog :title="setTitle" :visible.sync="dialogSetting" width='800px'>
            <el-row>
                <el-checkbox-group 
                    v-model="settingChecked"
                    :min="1">
                        <el-col :span="6" v-for="(item,i) in settingOptions" :key="i">
                            <el-checkbox :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
                        </el-col> 
                </el-checkbox-group>              
            </el-row>            
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogSetting = false">取 消</el-button>
                <el-button type="primary" v-if="setOrExport == 'set'" @click="settingSubmit">确 定</el-button>
                <el-button type="primary" v-if="setOrExport == 'export'" @click="exportSubmit">确 定</el-button>
            </div>
        </el-dialog>

        <!--批量查询-->
        <el-dialog title="批量查询" @close="dialogQueryClose" :visible.sync="dialogQuery" width='800px'>
            <el-form :model="queryForm" ref="queryForm">                
                <el-form-item label="" label-width="" prop="queryRadio">
                    <el-radio-group v-model="queryForm.queryRadio" v-if="mType == 'server'">
                        <el-radio :label="'sn_num'">SN</el-radio>
                        <el-radio :label="'asset_num'">资产编号</el-radio>
                        <el-radio :label="'manage_ip'">管理IP</el-radio>
                        <el-radio :label="'internal_ip'">内网IP</el-radio>
                    </el-radio-group>
                    <el-radio-group v-model="queryForm.queryRadio" v-else>
                        <el-radio :label="'internal_ip'">内网IP</el-radio>
                        <el-radio :label="'instanceid'">实例ID</el-radio>
                    </el-radio-group>
                    <span style="float:right">请按行粘贴，最多200行</span>
                </el-form-item>
                <el-form-item label="" label-width="" prop="val">
                    <el-input
                        type="textarea"
                        :rows="10"
                        placeholder="请输入内容"
                        v-model="queryVal">
                    </el-input>
                </el-form-item>
            </el-form> 
            <div slot="footer" class="dialog-footer">
                <span style="float:left">共粘入{{queryList.length}}行</span>
                <el-button @click="dialogQueryClose">取 消</el-button>
                <el-button type="primary" @click="querySubmit">查 询</el-button>
            </div>
        </el-dialog>
    
        <!--更新-->
        <el-dialog :title="dialogUpdateTitle" @close="dialogUpdateClose"  :visible.sync="dialogUpdate" width='800px'>
            <el-form :model="updateForm" ref="updateForm">               
                <el-form-item v-if="mType == 'server'" label="数据中心" label-width="120px" prop="idc">
                    <el-select v-model="updateForm.idc" @change="setRoomNumOptions" filterable placeholder="数据中心">
                        <el-option 
                            v-for="(item,i) in idcOptions"
                            :key="i"
                            :label="item.idc" :value="item.idc"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="mType == 'server'" label="房间号" label-width="120px" prop="idc_room_num">
                    <el-select v-model="updateForm.idc_room_num" @change="setRackNumOptions" filterable placeholder="房间号">
                        <el-option 
                            v-for="(item,i) in roomNumOptions"
                            :key="i"
                            :label="item.idc_room_num" :value="item.idc_room_num"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="mType == 'server'" label="机架号" label-width="120px" prop="rack_num">
                    <el-select v-model="updateForm.rack_num" filterable placeholder="机架号">
                        <el-option 
                            v-for="(item,i) in rackNumOptions"
                            :key="i"
                            :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="机器状态" label-width="120px" prop="status">
                    <el-select v-model="updateForm.status" filterable placeholder="机器状态">
                        <el-option 
                            v-for="(item,i) in statusOptions"
                            :key="i"
                            :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="机架位置" label-width="120px" prop="rack_position" v-if="aloneUpdate&&mType == 'server'">
                    <el-select v-model="updateForm.rack_position" filterable placeholder="机架位置">
                        <el-option 
                            v-for="(item,i) in rackOptions"
                            :key="i"
                            :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="业务负责人" label-width="120px" prop="business_owner">
                    <el-input v-model="updateForm.business_owner" placeholder="业务负责人"></el-input>
                </el-form-item>
                <el-form-item label="运维负责人" label-width="120px" prop="operation_owner">
                    <el-input v-model="updateForm.operation_owner" placeholder="运维负责人"></el-input>
                </el-form-item>
                <el-form-item label="备注" label-width="120px" prop="remarks">
                    <el-autocomplete class="inline-input" placeholder="请填写或选择备注信息"
                    v-model="updateForm.remarks" 
                    :fetch-suggestions="querySearch"></el-autocomplete>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogUpdateClose">取 消</el-button>
                <el-button type="primary" @click="updateSubmit">确 定</el-button>
            </div>
        </el-dialog>
                

        <!--提交结果-->
        <el-dialog :title="dialogResTitle" @close="dialogResClose" :visible.sync="dialogRes" width='800px'>
            <el-tag type="success">成功记录：{{resTip.success_cnt}}</el-tag>
            <el-tag type="danger">失败记录：{{resTip.failed_cnt}}</el-tag>
            <el-alert v-for="(item,i) in resTip.details" :key="i" 
                    :title="item.result_msg" :type="item.type" show-icon></el-alert>            
        </el-dialog>

        <!-- 表格 -->
        <div class="v-table" @click.stop="">
            <el-table
                ref="tabel"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                :height="tabelHight" 
                border
                :highlight-current-row="true"
                @row-dblclick="handleRowClick"            
                @selection-change="handleSelectionChange">
                <el-table-column  type="selection"  width="40"></el-table-column>

                <el-table-column v-for="(item,index) in tabelHeader" :key="index" :show-overflow-tooltip="true"  :prop="item.id"  :label="item.name"></el-table-column>

                <el-table-column label="操作" width="60">
                    <template slot-scope="scope">  
                        <i class="el-icon-edit" @click.stop="update(scope.row.id)"></i>  
                    </template>

                </el-table-column>
            </el-table>
        </div>
        
        <!-- 分页 -->
        <el-pagination v-if="page.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.pageNo"
            :page-sizes="[10, 20, 50, 200]"
            :page-size="page.pageSize"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total">
        </el-pagination>
        <v-loading v-if="loading"></v-loading>   
    </div>
</template>

<script>
import vLoading from './loading'
import bus from './../assets/js/bus'
export default {
	name: 'tabel',  
    components:{
        vLoading
    }, 
    data(){
        return{
            mType:'',
            tabelHeader:[],
            tableData: [],
            multipleSelection: [],
            page:{
                pageNo:1,
                pageSize:10,
                total:0
            },
            loading:false, 

            allocationOptions:[],
            dialogAllocation: false,
            allocationForm:{}, 

            mountOptions:[],
            dialogMount: false,
            mountForm:{},  

            dialogUpload:false,
            fileList: [],
            fileListTip:[],

            dialogSetting:false,
            settingChecked:[],
            settingOptions:[], 
            setTitle:'', 
            setOrExport:'',
            export:{},
            exportParam:{},

            dialogQuery:false,
            queryForm:{
                queryRadio:''
            },
            queryVal:'',  
            queryList:[],         

            dialogUpdate:false,
            updateForm: {
                idc_room_num:'',
                rack_num:'',
            },
            dialogUpdateTitle:'',
            aloneUpdate:false,
            updateIds:[],
            idcOptions:[],
            roomNumOptions:[],
            rackNumOptions:[],
            statusOptions:[],
            rackOptions:[],
            remarksOptions:[],


            dialogRes:false,
            dialogResTitle:'',
            resTip:{
                details:[]
            }
        }
    },   
    watch:{　　    
        $route(to){
            this.mType = this.$route.params.type
        },
        mType(){
            if(this.mType == 'server'){
                this.queryForm.queryRadio = 'sn_num'
            }else {
                this.queryForm.queryRadio = 'internal_ip'
            }
            this.getTabelHeader()
            this.getQuery()
        },
        currentNode(){
            this.getQuery()
            this.page = {
                pageNo:1,
                pageSize:10,
                total:0
            }
        },
        queryVal(){
            this.getQueryList()
        }
　　},
	computed: {        
	    currentNode() {
	        return this.$store.state.currentNode
	    },
        filterData() {
            return this.$store.state.filterData
        },
        tabelHight(){
            let tabel = this.$refs.tabel
            if(this.tableData.length >= 15){
                return 515
            }else {
                if(tabel){
                    tabel.bodyHeight.height = 'inherit'
                }
                return 'inherit'
            }  
        }
  	},
    created(){
        this.getQuery()
        this.getUpdateList()
    },    
    methods: { 
        //获取参数
        getQuery(){
            this.mType = this.$route.params.type
            if(JSON.stringify(this.currentNode) != '{}'){
                this.getTableData()
            }
        },
        //获取表格表头
        getTabelHeader(){
            let self = this
            this.$ajax({
                method:'get',
                url:`${this.host}/cmdb-service/api/meta/${self.mType}/listMeta`,
            }).then(function (res) {
                if(res.status == 200){
                    self.tabelHeader = res.data
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        //获取表格数据
        getTableData(){
            let filterVal = this.$parent.getFilterVal()
            let self = this
            let url = `${self.host}/cmdb-tree/api/nodes/query`
            let keyword = {
                    business_line_path:self.currentNode.path,
                    mo_type:self.mType
                }
            if(this.currentNode.type == 'service' || this.currentNode.type == 'standby'){
                url = `${self.host}/cmdb-tree/api/nodes/query/extends`
                keyword = {
                    id:self.currentNode.id,
                    parent_id:self.currentNode.parent_id,
                    path:self.currentNode.path,
                    mo_type:self.mType,
                    type:self.currentNode.type
                }
            }
            if(JSON.stringify(filterVal) != "{}"){
                keyword = Object.assign(keyword,filterVal)
            }   
            this.loading = true
            this.$ajax({
                method:'post',
                url:url,
                data:{
                    fuzzysearch:true,
                    keyword:keyword,
                    start:self.page.pageSize * (self.page.pageNo - 1),
                    length:self.page.pageSize,
                    type:self.mType
                }
            }).then(function (res) {
                if(res.status == 200){
                    let tableData = []
                    self.page.total = res.data.total
                    res.data.data.forEach((element, index)=>{
                        element.attrs.id = element.id
                        tableData.push(element.attrs)
                    });
                    self.tableData = tableData
                }
                setTimeout(() => {
                    self.loading = false
                }, 300);
            }).catch(function (error) {
                self.loading = false
                console.log(error);
            });
            
        },        
        //监听选择数据
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        //表格行点击
        handleRowClick(row, event){
            bus.$emit('tabelrow', row)
        },
        //导出
        onExport(command){
            this.export = command
            this.exportParam = {}
            let filterVal = this.$parent.getFilterVal()
            let setExport = (()=>{
                this.getSettingOptions()
                this.getSettingChecked()
                this.setTitle = '导出'+this.mType 
                this.setOrExport = 'export' 
                this.dialogSetting = true
            })
            if(command.isAll){              
                this.exportParam.keyword = Object.assign({
                    business_line_path:this.currentNode.path
                },filterVal)              
                if(command.isMade){
                    setExport()
                }
                else {  
                    this.exportSubmit()
                }
            }
            else {
                let ids = this.getSelectionIds()
                if(ids){
                    this.exportParam.ids = ids
                    if(command.isMade){
                        setExport()
                    }
                    else {                        
                        this.exportSubmit()
                    }
                }
            }
        },        
        exportSubmit(){
            if(this.export.isMade){
                this.exportParam.exp_attrs = this.settingChecked
            }
            let form = document.createElement("form")
            document.body.appendChild(form)   
            let input = document.createElement("input");
            input.type = "text";
            input.name = "data";
            input.value = JSON.stringify(this.exportParam);
            form.appendChild(input);
            form.method = "POST";
            form.action = `${this.host}/cmdb-service/api/mos/${this.mType}/export`;
            form.submit();
            document.body.removeChild(form);
        },
        //分配
        allocation(){
            let ids = this.getSelectionIds()
            let self = this
            if(ids){
                if(!this.verify('assign_status','未分配')){
                    this.$message({
                         type: 'warning',
                         message: '已分配的不能再分配了！'
                    });
                    return
                }
                if(self.allocationOptions.length == 0){
                    this.$ajax({
                        method:'get',
                        url:`${this.host}/cmdb-tree/api/nodes/product`,
                    }).then(function (res) {
                        if(res.status == 200){
                            self.allocationOptions = res.data                            
                        }
                    })
                }
                self.dialogAllocation = true                
            }
        },
        //分配提交
        allocationSubmit(){
            let ids = this.getSelectionIds()
            let selectId = this.allocationForm.allocation
            let self = this
            let param = {}
                param.ids = ids
            this.allocationOptions.forEach((item)=>{
                if(item.id == selectId){             
                    param.id = item.id
                    param.path = item.path
                    param.product_name = item.name
                    return false
                }
            })
            this.$ajax({
                method:'post',
                url:`${this.host}/cmdb-service/api/asset/allocate`,
                data:param
            }).then(function (res) {
                console.log(res);
                if(res.status == 200){
                    res.data.details.forEach((item)=>{
                        if(item.result == 'success'){
                            item.type = 'success'
                        }else{
                            item.type = 'error'
                        }
                    })
                    self.resTip = res.data    
                    console.log(self.resTip);                
                    self.dialogAllocation = false
                    self.dialogResTitle = '分配结果'
                    self.dialogRes = true             
                }
            })          
        },
        //关闭分配
        dialogAllocationClose(){
            this.dialogAllocation = false
            this.resetForm('allocationForm')
        },         
        //回收
        recovery(){
            let ids = this.getSelectionIds()
            let self = this
            if(ids){               
                if(!this.verify('assign_status','已分配')){
                    this.$message({
                         type: 'warning',
                         message: '您还没有分配，不能进行回收！'
                    });
                    return
                }
                this.$confirm(`请确认是否回收此${ids.length}台机器?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let param = {
                            ids:ids
                        }
                    this.$ajax({
                        method:'post',
                        url:`${this.host}/cmdb-service/api/asset/deallocate`,
                        data:param
                    }).then(function (res) {
                        if(res.status == 200){
                            res.data.details.forEach((item)=>{
                                if(item.result == 'success'){
                                    item.type = 'success'
                                }else{
                                    item.type = 'error'
                                }
                            })
                            self.resTip = res.data                
                            self.dialogAllocation = false
                            self.dialogResTitle = '回收结果'
                            self.dialogRes = true             
                        }
                    })           
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消回收'
                    });          
                });
            }
        },        
        //挂载
        onMount(){
            let ids = this.getSelectionIds()
            let id = this.currentNode.id
            let self = this
            if(ids){                
                this.$ajax({
                    method:'get',
                    url:`${this.host}/cmdb-tree/api/nodes/service/unit/${id}`,
                }).then(function (res) {
                    if(res.status == 200){
                        self.mountOptions = res.data     
                        self.dialogMount = true                           
                    }
                }).catch(function (error) {
                    console.log(error);
                });        
            }
        },
        //挂载提交
        mountSubmit(){
            let ids = this.getSelectionIds()
            let selectId = this.mountForm.id
            let self = this
            let param = {
                mo_ids: ids,
                product_id: this.currentNode.id,
                su_id: selectId
            }            
            this.$ajax({
                method:'post',
                url:`${this.host}/cmdb-tree/api/nodes/attach`,
                data:param
            }).then(function (res) {
                if(res.status == 200){
                    res.data.details.forEach((item)=>{
                        if(item.result == 'success'){
                            item.type = 'success'
                        }else{
                            item.type = 'error'
                        }
                    })
                    self.resTip = res.data             
                    self.dialogMount = false
                    self.dialogResTitle = '挂载结果'
                    self.dialogRes = true             
                }
            }).catch(function (error) {
                console.log(error);
            });           
        },
        //关闭挂载
        dialogMountClose(){
            this.dialogMount = false
            this.resetForm('mountForm')
        },
        //卸载
        onUninstall(){
            let ids = this.getSelectionIds()
            let self = this
            if(ids){ 
                this.$confirm(`请确认是否卸载此${ids.length}台机器?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let param = {
                            mo_ids:ids,
                            su_id:self.currentNode.id
                        }
                    this.$ajax({
                        method:'post',
                        url:`${this.host}/cmdb-tree/api/nodes/detach`,
                        data:param
                    }).then(function (res) {
                        console.log(res);
                        if(res.status == 200){
                            res.data.details.forEach((item)=>{
                                if(item.result == 'success'){
                                    item.type = 'success'
                                }else{
                                    item.type = 'error'
                                }
                            })
                            self.resTip = res.data                
                            self.dialogAllocation = false
                            self.dialogResTitle = '卸载结果'
                            self.dialogRes = true             
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });           
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消卸载'
                    });          
                });
            }
        },
        //设置
        setting(){
            this.getSettingOptions()
            this.getSettingChecked()
            this.setTitle = '列表字段设置' 
            this.setOrExport = 'set' 
            this.dialogSetting = true
        },
        //设置提交
        settingSubmit(){            
            let self = this
            let param = []
            this.settingChecked.forEach((item)=>{
                this.settingOptions.forEach((list)=>{
                    if(list.id == item){
                        param.push({
                            id:list.id,
                            name:list.name
                        })
                    }
                });
            });
            this.$ajax({
                method:'post',
                url:`${this.host}/cmdb-service/api/meta/${self.mType}/listMeta`,
                data:param
            }).then(function (res) {
                if(res.status == 200){
                    self.getTabelHeader()
                    self.dialogSetting = false
                }
            }).catch(function (error) {
                console.log(error);
            });            
        },
        //获取设置Checked
        getSettingChecked(){
            let settingChecked = []
            this.tabelHeader.forEach((element, index)=>{
                settingChecked.push(element.id)
            });
            this.settingChecked = settingChecked
        },
        //获取设置Options
        getSettingOptions(){
            let settingOptions = []
            this.filterData.forEach((element, index)=>{
                element.fields.forEach((item, i)=>{
                    settingOptions.push(item)
                });
            });
            this.settingOptions = settingOptions
        },
        //关闭结果
        dialogResClose(){
            this.dialogResTitle = ''
            this.resTip = {
                details:[]
            }
        },        
        //导入
        submitUpload() {
            this.$refs.upload.submit();
        },
        //上传验证
        beforeFileUpload(file){
            //const isType = file.type === 'application/vnd.ms-excel';
            const isSize = file.size / 1024 / 1024 < 10;
            // if (!isType) {
            //   this.$message.error('上传文件只能是excel文件!');
            // }
            if (!isSize) {
              this.$message.error('上传文件大小不能超过10MB!');
            }
            return isSize;           
        },
        //监听上传
        handleChange(file, fileList){
            console.log(file)
            let status = file.status
            let name = file.name
            if(status == 'success'){
                this.fileListTip.push({
                    title:`${name}上传成功`,
                    type:'success'
                })
                this.fileList = []
            }else if(status == 'fail'){
                this.fileListTip.push({
                    title:`${name}上传失败`,
                    type:'error'
                })
            }else {
                this.fileListTip = []
            }
        },
        //关闭上传
        dialogUploadClose(){
            this.dialogUpload = false
            this.fileList=[]
            this.fileListTip = []
        },
        //获取查询列表
        getQueryList(){
            let list = this.queryVal.split('\n')
            for(let i = 0; i < list.length; i++){ 
                list[i] = list[i].replace(/(^\s*)|(\s*$)/g, "");
                if(list[i] == ''){                          
                    list.splice(i,1);  
                    i--;  
                } 
            }
            this.queryList = list  
        },
        //提交查询
        querySubmit(){
            let self = this
            if(this.queryList.length == 0){
                this.$message({
                     type: 'warning',
                     message: '请输入内容！'
                });
            }else if(this.queryList.length>200){
                this.$message({
                     type: 'warning',
                     message: '最多只能查询200行！'
                });
            }else {
                let keyword = {}
                keyword[this.queryForm.queryRadio] = this.queryList
                keyword['mo_type'] = this.mType
                let param = {
                    "start": 0,
                    "length": 200,
                    "type": this.mType,
                    "keyword": keyword
                }
                this.$ajax({
                    method:'post',
                    url:`${self.host}/cmdb-tree/api/nodes/query`,
                    data:param
                }).then(function (res) {
                    if(res.status == 200){
                        self.tableData = []
                        self.page.total = 0
                        res.data.data.forEach((element, index)=>{
                            element.attrs.id = element.id
                            self.tableData.push(element.attrs)
                        });
                        self.dialogQuery = false                        
                    }
                }).catch(function (error) {                    
                    console.log(error);
                }); 
            }
        },
        //关闭查询
        dialogQueryClose(){
            this.dialogQuery = false
            this.queryVal = ''
            this.resetForm('queryForm')
        },
        //更新
        update(id){
            if(id){
                this.dialogUpdateTitle = '更新'
                this.aloneUpdate = true
                this.dialogUpdate = true
                this.updateIds = [id]
            }else {
                let ids = this.getSelectionIds()
                this.dialogUpdateTitle = '批量更新'
                this.aloneUpdate = false
                if(ids){
                    this.dialogUpdate = true
                    this.updateIds = ids
                }
            }
        },
        //获取更新数据选项
        getUpdateList(){
            let self = this            
            this.$ajax.all([
                self.$ajax({
                    method:'get',
                    url:`${self.host}/cmdb-service/api/meta/dict/server_status_meta`
                }),
                self.$ajax({
                    method:'get',
                    url:`${self.host}/cmdb-service/api/meta/dict/server_remark_meta`
                }),
                self.$ajax({
                    method:'get',
                    url:`${self.host}/cmdb-service/api/meta/dict/rack_num_meta`
                }),
                self.$ajax({
                    method:'get',
                    url:`${self.host}/cmdb-service/api/meta/dict/server_idc_meta`
                }),
            ]).then(
                self.$ajax.spread((statusRes,remarkRes,rackRes,idcRes)=>{
                    self.idcOptions = idcRes.data             
                    self.statusOptions = statusRes.data
                    self.rackOptions = rackRes.data
                    self.remarksOptions = self.setRemarksOptions(remarkRes.data)
                })
            )
        },
        setRoomNumOptions(data){           
            this.updateForm.idc_room_num = ''
            this.updateForm.rack_num = ''
            this.rackNumOptions = []
            let roomNumOptions = []
            this.idcOptions.forEach((item)=>{
                if(item.idc == data){
                    roomNumOptions = item.rooms
                }
            });
            this.roomNumOptions = roomNumOptions
        },
        setRackNumOptions(data){           
            this.updateForm.rack_num = ''
            let rackNumOptions = []
            this.roomNumOptions.forEach((item)=>{
                if(item.idc_room_num == data){
                    rackNumOptions = item.rack_num
                }
            });
            this.rackNumOptions = rackNumOptions
        },        
        setRemarksOptions(data){
            let options = []
            data.forEach((item)=>{
                options.push({
                    value:item
                })
            });
            return options
        },
        //备注输入建议提示
        querySearch(queryString, cb) {
            var remarksOptions = this.remarksOptions;
            var results = queryString ? remarksOptions.filter(this.createFilter(queryString)) : remarksOptions;
            cb(results);
        },
        createFilter(queryString) {
            return (remarksOption) => {
                return (remarksOption.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        },
        //提交更新
        updateSubmit(){
            let self = this
            let attrs = {}
            for(let key in this.updateForm){
                if(this.updateForm[key]){
                    attrs[key] = this.updateForm[key]
                }
            }
            if(JSON.stringify(attrs) == '{}'){
                self.$message({
                    message: '您还没有填写内容！',
                    type: 'warning'
                });
                return
            } 
            let param = {
                id:this.updateIds,
                attrs:attrs
            }
            this.$ajax({
                method:'put',
                url:`${this.host}/cmdb-service/api/mos/batchupdate`,
                data:param
            }).then(function (res) {
                if(res.status == 200){
                    self.$message({
                        message: '更新成功！',
                        type: 'success'
                    });
                    self.dialogUpdate = false
                    self.getTableData()
                }
            }).catch(function (error) {
                console.log(error);
            }); 
        },
        //关闭更新
        dialogUpdateClose(){
            this.dialogUpdate = false
            this.resetForm('updateForm')
        },
        //验证所选机器状态
        verify(key,val){
            let data = this.getSelectionData()
            let pass = false
            data.forEach((item)=>{
                if(item[key] == val){
                    pass = true
                    return
                }
            })
            if(pass){
                return true
            }else {
                return false
            }
        },
        //获取表格选择id
        getSelectionIds(){            
            let ids = []
            if(!this.multipleSelection.length){
                this.$message({
                    message: '请您先选择机器',
                    type: 'warning'
                });
                return false
            }
            this.multipleSelection.forEach((element, index)=>{
                ids.push(element.id)
            });
            return ids
        },
        //获取表格选择属性
        getSelectionData(){            
            let data = []            
            this.multipleSelection.forEach((element)=>{
                data.push(element)
            });
            return data
        },        
        //重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },      
        //分页
        handleSizeChange(val) {
            this.page.pageSize = val
            this.getTableData()
        },
        //分页
        handleCurrentChange(val) {
            this.page.pageNo = val
            this.getTableData()
        },      
    }
}
</script>

<style lang="less">
.tabelwrapper{
    .tabel-buttons{
    	padding: 10px 0;
    }
    .el-table td, .el-table th{
    	padding: 5px 0;
    }
    .el-select{
    	width: 100%;
    }
    .el-pagination{
        margin-top: 20px;
    }
    .el-autocomplete{
        width: 100%;
    }
    .v-upload{
        color: #fff;
        text-decoration: none;
    }
    .el-textarea__inner{
        resize: none;
    }
}
</style>