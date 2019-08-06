<template>
    <div class="header">
        <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">
            <template v-for="(item) in navData">
                <el-submenu v-if="item.children" :index="item.name">
                    <template slot="title">{{item.name}}</template>
                    <el-menu-item v-for="(subItem,n) in item.children" :key="n" :index="subItem.path">{{subItem.name}}</el-menu-item>
                </el-submenu>
                <el-menu-item v-if="!item.children" :index="item.path">{{item.name}}</el-menu-item>
            </template>
            <span class="changelog">Changelog</span>
        </el-menu>
        <div class="v-logo">日志平台</div>
        <div class="user-info">
            <el-menu
                mode="horizontal"
                background-color="#545c64"
                text-color="#fff">
                <el-submenu :index="'quit'" popper-class="quit">
                    <template slot="title">{{userInfo.userName}}</template>
                    <el-menu-item :index="'quit'"><a href="/devops/api/logout" @click.prevent="handleLogout">退出</a></el-menu-item>
                </el-submenu>
            </el-menu>
        </div>
    </div>
</template>

<script>
import nav from '../router/nav';
import api from '../api';
export default {
    props:['userInfo'],
  	name: 'v-nav',
	  data () {
    	return {
            navData:[],
      		  activeIndex: '/ui/logsearch',
            nodeid:1,
            // userInfo:{},
    	}
  	},
    watch:{
　　    $route(to){
            this.activeIndex = this.$route.path || '/ui/logsearch';
            this.nodeid = this.$route.query.nodeid || 1;
        }　
　　},
    created () {
        this.navData = nav;
        this.activeIndex = this.$route.path || '/ui/logsearch';
        this.nodeid = parseInt(this.$route.query.nodeid) || 0;

        // if(storeSession.get("CURUSERINFO")){
        //     this.userInfo=storeSession.get("CURUSERINFO");
        // }else{
        //   this.getUserInfo();
        // }

    },
  	methods: {
        // getUserInfo(){
        //     // 获取当前登录用户信息
        //     api.condition.geCurrentUserInfo().then(res => {
        //         if(res.data.code="SOA0000"){
        //           this.userInfo=res.data.rows;
        //           storeSession.set("CURUSERINFO",this.userInfo);
        //         }else{
        //           this.$message.error(res.data.errMsg);
        //         }
        //     });
        // },
      	handleSelect(key) {
            this.$router.push({path:key,query:{nodeid:this.nodeid}})
      	},
        handleLogout(){
          api.condition.logout().then(res => {
                 if(res.data.code="SOA0000"){
                    this.$message.success("退出成功！");
                    this.$router.push({name:"home"});
                 }else{
                   this.$message.error(res.data.errMsg);
                 }
             });
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
body{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
.header{
    height: 40px;
    .v-logo{
        position: absolute;
        top: 0;
        left: 0;
        width: 240px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: rgb(255, 208, 75);
        font-size: 22px;
    }
    .user-info{
        position: absolute;
        right: 20px;
        top: 0;
        width: 128px;
        height: 40px;
        color: #fff;
        .el-menu{
            padding: 0;
            .el-submenu__title{
                i{
                    color: #fff;
                }
            }
        }
    }
    .el-menu{
        padding-left: 240px;
        .changelog{
            line-height: 40px;
            height: 40px;
            display: inline-block;
            color: #fff;
            position: absolute;
            right: 150px;
        }
    }
    .el-menu--horizontal .el-menu-item{
        height: 40px;
        line-height: 40px;
    }
    .el-menu--horizontal .el-submenu .el-submenu__title{
        height: 40px;
        line-height: 40px;
    }
    .el-menu--horizontal .el-submenu>.el-menu{
        top: 40px;
    }
    .el-submenu .el-menu-item{
        min-width: 0;
    }
    .el-menu--popup{
        padding: 0;
    }
}
.el-menu--popup-bottom-start,
.el-menu--popup-right-start {
    margin: 0 !important;
}
.el-menu-item{
    a{
        display: block;
        color: #fff
    }
}
.quit{
    .el-menu--popup{
        width: 120px;
        min-width:0;
    }
}
</style>
