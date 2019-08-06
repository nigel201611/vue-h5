<template>
  <div class="menu">
        <!-- <div class="el-input el-input--mini">
            <input  autocomplete="off" placeholder="可搜索产品线与服务节点"
                    @keyup.enter="filterNode"
                    v-model="filterText"
                    size="mini" type="text" rows="2" validateevent="true" class="el-input__inner">
        </div>
        <div class="view-switch" @click="allNode = !allNode">
            <span v-if="allNode">服务视图</span>
            <span v-if="!allNode">组织视图</span>
        </div> -->
        <ul v-if="allNode && filterTreeData.length == 0" class="tree">
          <v-tree v-for="item in treeData"
            :node="item"
            :key="item.id">
          </v-tree>
        </ul>
        <ul v-if="!allNode && filterTreeData.length == 0" class="tree">
            <v-tree v-for="item in treeData2"
                :node="item"
                :key="item.id">
            </v-tree>
        </ul>
        <!-- <ul v-if="filterTreeData.length > 0" class="tree">
            <v-tree v-for="item in filterTreeData"
                :node="item"
                :key="item.id">
            </v-tree>
        </ul> -->
  </div>
</template>

<script>
import Vue from 'vue'
import vTree from './tree'
import bus from './../assets/js/bus'
import api from '../api';
import {mapActions, mapGetters } from 'vuex'
export default {
  	name: 'v-menu',
  	components:{
        vTree
    },
  	data() {
        return {
            filterText: '',
            allNode:true,
            filterTreeData:[],
            treeData: [],
            treeData2: [],
            currentNodeId: 0,
            defaultProps: {
              	children: 'children',
              	label: 'name'
            },
            cmdHost:'',
            userId:'',
            userInfo:{},
        };
    },
  	watch: {
      	$route(to){
            this.currentNodeId = this.$route.query.nodeid || 0;
        }　
    },
    created() {
       this.isTree = true;
       this.currentNodeId = this.$route.query.nodeid || 0;
  	},
    mounted () {
        let self = this;
        this.$on('node-click', function (node) {
            this.handleNodeClick(node)
        });
        this.$on('icon-click', function (node) {
            this.handleExpandIconClick(node)
        });
        bus.$on('updateTree', function () {
            self.getNode(0)
        });
// 判断是否有用户信息
        this.userInfo = self.getAccountInfo();
        if(!this.userInfo){
          api.condition.geCurrentUserInfo().then(res => {
              if(res.data.code="SOA0000"){
                this.userInfo=res.data.rows;
                this.setAccountInfo(res.data.rows);
                storeSession.set("CURUSERINFO",this.userInfo);
                this.getNode(0);
              }else{
                this.$message.error(res.data.errMsg);
              }
          });
        }else{
            this.getNode(0);
        }

    },
    methods: {
        ...mapGetters([
          'getAccountInfo',
        ]),
        ...mapActions([
            'setAccountInfo',
        ]),

        getNode(id){
            let self = this;
            let params={
              userId:this.userInfo.userId,
              cmdHost:this.userInfo.cmdHost,
              currentNodeId:id,
            };
            api.menu.getMenuList(params).then(res => {
                if(res.data.data.length){
                  self.treeData = res.data.data;

                  self.setExpanded(self.treeData);
                  self.getCurrentNode();
                  self.getTreeData2(self.treeData);
                }else{
                  this.$message.error('无数据！');
                }
            });
        },
      	setExpanded(data,flag){
      		data.forEach((item, index)=>{
                  if(!flag){
                      if(item.type == 'product'){
                          item.expanded = true
                      }else {
                          item.expanded = false
                      }
                      if(item.children){
                          this.setExpanded(item.children)
                      }
                  }else{
                      item.expanded = false
                      if(item.children){
                          this.setExpanded(item.children,flag)
                      }
                  }
      		});
      	},
        getTreeData2(data){
            data.forEach((item)=>{
                if(item.type == 'product'){
                    this.treeData2.push(item)
                }
                if(item.children){
                    this.getTreeData2(item.children)
                }
            });
        },
        getCurrentNode(){
            let self = this
            let nodeid = this.$route.query.nodeid || 0;
            let getCurrentNode = function(arr){
                arr.forEach( function(item, index) {
                    if(item.id == nodeid){
                        self.$store.commit('updateNode',item);
                        return
                    }
                    if(item.children){
                        getCurrentNode(item.children);
                    }
                });
            }
            getCurrentNode(this.treeData);
        },

        handleNodeClick(data){
            this.$store.commit('updateNode',data);
            let path = this.$route.path;
            this.$router.replace({path:path,query:{nodeid:this.currentNodeId}});
            if(data.type=='service'){
              this.$router.push({name:'logsearch'});
            }
        },
        handleExpandIconClick(node){
            let self = this;
            if(!node.children){
              let params={
                userId:this.userInfo.userId,
                cmdHost:this.userInfo.cmdHost,
                currentNodeId:node.id,
              };
              api.menu.getMenuList(params).then(res => {
                  if(res.data.data.length){
                    let children = res.data.data;
                    children.forEach((item)=>{
                        item.expanded = true
                    });
                    self.$set(node,'children',children);

                  }else{
                    this.$message.info("无数据!");
                  }
              });
          }
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
	.menu{
        position: absolute;
        width: 100%;
        top: 0;
        bottom: 0;
        overflow: auto;
        .el-input{
            padding: 6px 56px 0 10px;
            box-sizing: border-box;
        }
        .view-switch{
            position: absolute;
            right: 4px;
            top: 10px;
            color: #606266;
            font-size: 12px;
            cursor: pointer;
            text-decoration: underline;
        }
    }

</style>
