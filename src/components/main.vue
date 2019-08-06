<template>
    <div class="main">
        <iframe id="main" name="main" :src="url" frameborder="0"></iframe>      
    </div>
</template>
<script>    
    import bus from './../assets/js/bus'
    export default{        
        data(){
            return{
                url:'',
                node:{}
            }
        },
        watch:{
            $route(to){
                let self = this     
                this.url = this.$route.query.url
                document.getElementById('main').onload = function () {
                    self.getCurrentNode()
                }
            }
        },
        created () {
            let url = this.$route.query.url || 'http://test.cmdb.vivo.xyz:8080/menu/motype/server'
            this.url = url
        },　
        mounted(){
            let self = this  
            bus.$on('getCurrentNode', function (data) {
                self.node = data 
                self.getCurrentNode()
            })
        },
        methods: {
            getCurrentNode(){
                var domain = 'http://test.cmdb.vivo.xyz:8080';
                var iframe = document.getElementById('main').contentWindow;
                iframe.postMessage(this.node,domain);
            }, 
        }
     
    }
</script>
<style>
    .main,    
    iframe{
        width: 100%;
        height: 100%;
    }
</style>

