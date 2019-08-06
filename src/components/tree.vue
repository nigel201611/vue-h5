<template>
    <li class="tree-branch">
        <i  class="icon-caret ace-icon"
            :class="{
                'tree-minus':!expanded&&node.children || node.type=='product',
                'tree-plus':expanded && node.childs>0 && node.type!='service'}"
            @click.stop="handleExpandIconClick(node)">
        </i>
        <div class="tree-branch-header"
            :class="{active:tree.currentNodeId == node.id}"
            @click.stop="nodeClick(node)"
            :title="node.path">
            <span class="tree-branch-name">
                <i  class="ace-icon fa"
                    :class="{
                        'fa-home':node.type == 'department',
                        'fa-group':node.type == 'team',
                        'fa-product-hunt':node.type == 'product',
                        'fa-code-fork':node.type == 'service',
                        'fa-inbox':node.type == 'standby'}
                "></i>
                <span class="tree-label">{{node.name}}</span>
            </span>
        </div>
        <ul class="tree tree-branch-children" v-show="!expanded">
            <v-tree v-for="item in node.children"
                :node="item"
                :key="item.id"></v-tree>
        </ul>

    </li>
</template>

<script>
export default {
    name: 'v-tree',
    data() {
        return {
            tree: null,
            expanded:false
        };
    },
    props: {
        node :{
            type: Object,
        }
    },
    created() {
        const parent = this.$parent;
        if (parent.isTree) {
            this.tree = parent;
        } else {
            this.tree = parent.tree;
        }
        if (this.node.expanded) {
            this.expanded = true;
        }
    },
    mounted () {


    },
    methods: {
        nodeClick(node){
            this.tree.currentNodeId = this.node.id;
            this.tree.$emit('node-click',node);
        },
        handleExpandIconClick(node){
            this.tree.$emit('icon-click',node);
            if(this.expanded){
                this.expanded = false
            }else {
                this.expanded = true
            }
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style>
@import './../assets/css/font-awesome.css';
.tree {
    padding-left: 10px;
    width: calc(100% - 10px);
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
}
.tree:before {
    display: inline-block;
    content: "";
    position: absolute;
    top: -20px;
    bottom: 16px;
    left: 0;
    z-index: 1;
    border: 1px dotted #67b2dd;
    border-width: 0 0 0 1px;
}
.tree .tree-plus.ace-icon:first-child,
.tree .tree-minus.ace-icon:first-child {
    font-style: normal;
    border: 1px solid #DDD;
    vertical-align: middle;
    height: 11px;
    width: 11px;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    text-align: center;
    border: 1px solid #8BAEBF;
    line-height: 10px;
    background-color: #FFF;
    position: relative;
    z-index: 1;
}
.tree .tree-plus.ace-icon:first-child:before,
.tree .tree-minus.ace-icon:first-child:before {
    content: "";
    display: block;
    width: 7px;
    height: 0;
    border-top: 1px solid #4D6878;
    position: absolute;
    top: 5px;
    left: 2px;
}
.tree .tree-plus.ace-icon:first-child:after {
    content: "";
    display: block;
    height: 7px;
    width: 0;
    border-left: 1px solid #4D6878;
    position: absolute;
    top: 2px;
    left: 5px;
}


.tree {
    position: absolute;
    margin: auto;
    overflow-x: hidden;
    overflow-y: auto;
    background: #fff;
    font-size: 14px;
}

.tree:before {
    display: inline-block;
    content: "";
    position: absolute;
    top: -20px;
    bottom: 16px;
    left: 0;
    z-index: 1;
    border: 1px dotted #67B2DD;
    border-width: 0 0 0 1px
}

.tree .tree {
    padding: 0;
    overflow: visible;
}
.tree .tree-branch-name{
    cursor: pointer
}

.tree .icon-caret {
    vertical-align: baseline!important
}

.tree .tree-branch {
    width: auto;
    min-height: 20px;
    cursor: pointer;
    white-space: nowrap;
}

.tree .tree-branch .tree-branch-header {
    position: relative;
    height: 20px;
    line-height: 20px
}
.tree .tree-branch .tree-branch-header.active,
.tree .tree-branch .tree-branch-header:hover {
    background-color: rgba(98,168,209,.1)
}

.tree .tree-branch .icon-caret~.tree-branch-header {
    display: inline-block;
    width: 80%;
    width: calc(100% - 30px)
}

.tree .tree-branch .tree-branch-header .tree-branch-name{
    display: inline;
    z-index: 2
}

.tree .tree-branch .tree-branch-header>.tree-branch-name>.ace-icon:first-child{
    display: inline-block;
    position: relative;
    z-index: 2;
    top: -1px
}

.tree .tree-branch>.tree-branch-header>.tree-branch-name>.tree-label {
    margin-left: 2px
}

.tree .tree-branch>.tree-branch-header>.tree-branch-name>.ace-icon:first-child {
    margin: -2px 0 0 -2px
}

.tree .tree-branch:last-child:after {
    display: inline-block;
    content: "";
    position: absolute;
    z-index: 1;
    top: 15px;
    bottom: 0;
    left: -10px;
    border-left: 2px solid #FFF
}

.tree .tree-branch .tree-branch-children,
.tree .tree-branch .tree-branch-children.tree {
    margin: 0 0 0 20px;
    padding: 0;
    position: relative
}

.tree .tree-branch .tree-branch-children.tree:before,
.tree .tree-branch .tree-branch-children:before {
    display: inline-block;
    content: "";
    position: absolute;
    z-index: 1;
    top: -14px;
    bottom: 16px;
    left: -14px;
    border: 1px dotted #67B2DD;
    border-width: 0 0 0 1px
}

.tree .tree-branch{
    position: relative;
    list-style: none;
    border-left: 1px solid #FFF;
    margin: 1px 0
}

.tree .tree-branch:before{
    display: inline-block;
    content: "";
    position: absolute;
    top: 14px;
    left: -13px;
    width: 18px;
    height: 0;
    border-top: 1px dotted #67B2DD;
    z-index: 1
}


.tree .tree-branch .tree-branch-header {
    border-radius: 0
}

.tree .tree-branch .tree-branch-header{
    padding: 5px;
    color: #4D6878;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box
}


.tree .tree-minus.ace-icon:first-child,
.tree .tree-plus.ace-icon:first-child {
    display: inline-block;
    font-style: normal;
    vertical-align: middle;
    height: 11px;
    width: 11px;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    text-align: center;
    border: 1px solid #8BAEBF;
    line-height: 10px;
    background-color: #FFF;
    position: relative;
    z-index: 2
}

.tree .tree-minus.ace-icon:first-child:before,
.tree .tree-plus.ace-icon:first-child:before {
    content: "";
    display: block;
    width: 7px;
    height: 0;
    border-top: 1px solid #4D6878;
    position: absolute;
    top: 5px;
    left: 2px
}
.tree .tree-plus.ace-icon:first-child:after {
    content: "";
    display: block;
    height: 7px;
    width: 0;
    border-left: 1px solid #4D6878;
    position: absolute;
    top: 2px;
    left: 5px
}
</style>
