// 1 用户进入价签零售扫描数据，调用qxi/service/QdocWebService获取相关参数数据，
// 2. 把相关的数据发送到ESL
// 3. 用户输入完确认，更新数据(qxi/service/QdocWebService)，更新库存（调用issueinventory和receiveinventory）
// 4. 把相关的数据发送到ESL
import api from "./../../api";
import qs from "qs";
export default {
    data() {
        // 选项 数据
        return {
            formData: [
                {
                    label: "Item",
                    value: "水杯",
                    disable: true
                }
            ],
            loading: false,
            isRequesting: false,
            qty: "",
            sku: "",
            skuError: false,
            qtyError: false,
            searchObj: null,
            ldLoc: "",
            ldLot: "",
            ldPart: "",
            ldQtyOh: "",
            ldSite: ""
        };
    },
    components: {
        // 定义组件
    },
    methods: {
        checkQty(event) {
            let { value } = event.target;
            if (value) {
                this.qtyError = !value;
            }
        },

        parseXml(xmlStr) {
            let xmlDoc = null;
            if (window.DOMParser) {
                let parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlStr, "text/xml");
                parser.parse;
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr);
            }

            let QryInventory = xmlDoc.getElementsByTagName("ns1:inventoryReceipt");
            let ldQtyOh = "";
            if (
                QryInventory &&
                QryInventory[0] &&
                QryInventory[0].childNodes[0] &&
                QryInventory[0].childNodes[0].childNodes
            ) {
                this.skuError = false;
                ldQtyOh = xmlDoc.getElementsByTagName("qdoc:ldQtyOh")[0]
                    .innerHTML;
                this.ldQtyOh = ldQtyOh;

            } else {
                this.skuError = true;
            }
        },

        // 微信扫码
        scanQrCode() {
            wx.scanQRCode({
                desc: "scanQRCode desc",
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function (res) {
                    // 回调
                    let result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                    window.location.href = result; //因为我这边是扫描后有个链接，然后跳转到该页面
                },
                error: function (res) {
                    if (res.errMsg.indexOf("function_not_exist") > 0) {
                        // this.$toast("微信版本过低请升级最新版本！");
                        this.$notify({
                            message: '微信版本过低请升级最新版本！',
                            className: 'notify',
                            duration: 3000,
                            background: 'rgb(255, 68, 68)'
                        });
                    }
                }
            });
        },

        //确认提交
        confirm() {
            console.log('确认');
            //提交之前，确认用户输入了有效数量
            //这里确认数量不能为空
            if (!this.qty) {
                this.qtyError = !this.qty;
            } else {
                //发送数据，请求接口，发送json数据更新esl，同时发送xml数据更新QAD
                // 3. 用户输入完确认，更新数据(qxi/service/QdocWebService)，更新库存（调用issueinventory和receiveinventory）
                let increaseQtyOrigin = this.qty - this.ldQtyOh; //大于0增加库存，否则减少库存
                let increaseQty = Math.abs(increaseQtyOrigin);
                let issueParams = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:add="http://www.w3.org/2005/08/addressing" xmlns:urn="urn:schemas-qad-com:xml-services:common" xmlns:urn1="urn:schemas-qad-com:xml-services">
   <soapenv:Header>
      <add:ReplyTo>
         <add:Address>urn:services-qad-com:</add:Address>
      </add:ReplyTo>
      <add:ReferenceParameters>
         <urn:suppressResponseDetail>false</urn:suppressResponseDetail>
      </add:ReferenceParameters>
      <add:To>urn:services-qad-com:hvltest</add:To>
      <add:MessageID>urn:services-qad-com::hvltest</add:MessageID>
      <add:Action></add:Action>
   </soapenv:Header>
   <soapenv:Body>
    <urn1:issueInventory>
     <urn:dsSessionContext>
          
            <urn:ttContext>
               <urn:propertyQualifier>QAD</urn:propertyQualifier>
               <urn:propertyName>domain</urn:propertyName>
               <urn:propertyValue>10USA</urn:propertyValue>
            </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>username</urn:propertyName>
                    <urn:propertyValue>mfg</urn:propertyValue>
                </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>password</urn:propertyName>
                    <urn:propertyValue></urn:propertyValue>
                </urn:ttContext>
     <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>version</urn:propertyName>
                    <urn:propertyValue>eB_2 </urn:propertyValue>
                </urn:ttContext>
         </urn:dsSessionContext>
         <urn1:dsInventoryIssue>
            
            <urn1:inventoryIssue>
               
               <urn1:operation>A</urn1:operation>
               
               <urn1:ptPart>${this.ldPart}</urn1:ptPart>
               
               <urn1:lotserialQty>${increaseQty}</urn1:lotserialQty>
           
               <urn1:site>${this.ldSite}</urn1:site>
               
               <urn1:location>${this.ldLoc}</urn1:location>
               
               <urn1:lotserial>${this.ldLot}</urn1:lotserial>
     
               <urn1:issueDetail>
                  <urn1:operation>A</urn1:operation>
   
                  <urn1:ptPart>${this.ldPart}</urn1:ptPart>
                 
                  <urn1:site>${this.ldSite}</urn1:site>
                  
                  <urn1:location>${this.ldLoc}</urn1:location>
                  
                  <urn1:lotserial>${this.ldLot}</urn1:lotserial>
                
                  <urn1:lotserialQty>${increaseQty}</urn1:lotserialQty>
    
               </urn1:issueDetail>
            </urn1:inventoryIssue>
         </urn1:dsInventoryIssue>
      </urn1:issueInventory>
   </soapenv:Body>
</soapenv:Envelope>`;

                let receiveParams = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:add="http://www.w3.org/2005/08/addressing" xmlns:urn="urn:schemas-qad-com:xml-services:common" xmlns:urn1="urn:schemas-qad-com:xml-services">
   <soapenv:Header>
      <add:ReplyTo>
         <add:Address>urn:services-qad-com:</add:Address>
      </add:ReplyTo>
      <add:ReferenceParameters>
         <urn:suppressResponseDetail>false</urn:suppressResponseDetail>
      </add:ReferenceParameters>
      <add:To>urn:services-qad-com:hvltest</add:To>
      <add:MessageID>urn:services-qad-com::hvltest</add:MessageID>
      <add:Action></add:Action>
   </soapenv:Header>
   <soapenv:Body>
      <urn1:receiveInventory>
  <urn:dsSessionContext>
          
            <urn:ttContext>
               <urn:propertyQualifier>QAD</urn:propertyQualifier>
               <urn:propertyName>domain</urn:propertyName>
               <urn:propertyValue>10USA</urn:propertyValue>
            </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>username</urn:propertyName>
                    <urn:propertyValue>mfg</urn:propertyValue>
                </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>password</urn:propertyName>
                    <urn:propertyValue></urn:propertyValue>
                </urn:ttContext>
     <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>version</urn:propertyName>
                    <urn:propertyValue>eB_2 </urn:propertyValue>
                </urn:ttContext>
         </urn:dsSessionContext>
         <urn1:dsInventoryReceipt>            
            <urn1:inventoryReceipt>
               
               <urn1:operation>A</urn1:operation>
               
               <urn1:ptPart>${this.ldPart}</urn1:ptPart>
               
               <urn1:lotserialQty>${increaseQty}</urn1:lotserialQty>
               
               <urn1:site>${this.ldSite}</urn1:site>
               
               <urn1:location>${this.ldLoc}</urn1:location>
               <urn1:lotserial>${this.ldLot}</urn1:lotserial>
               
               <urn1:receiptDetail>
                  <urn1:operation>A</urn1:operation>
                  <urn1:ptPart>${this.ldPart}</urn1:ptPart>
                 
                  <urn1:site>${this.ldSite}</urn1:site>
                  
                  <urn1:location>${this.ldLoc}</urn1:location>
                  
                  <urn1:lotserial>${this.ldLot}</urn1:lotserial>
                       
               </urn1:receiptDetail>
            </urn1:inventoryReceipt>
         </urn1:dsInventoryReceipt>
      </urn1:receiveInventory>
   </soapenv:Body>
</soapenv:Envelope>`;

                // increaseQtyOrigin = 0;说明用户没有更改数量，可以不用改
                if (increaseQtyOrigin == 0) {
                    // this.$toast("修改的数量与上次相等！");
                    this.$notify({
                        message: 'Qty没有变化，可以增加或者减少',
                        className: 'notify',
                        duration: 3000,
                        background: 'rgb(255, 68, 68)'
                    });
                    return;
                }
                if (increaseQtyOrigin > 0) {
                    //增加库存
                    console.log('增加库存');
                    if (this.isRequesting) {
                        return
                    }
                    this.isRequesting = true;
                    this.loading = true;
                    api.home
                        .shopwebIntegrationByXml(receiveParams)
                        .then(res => {
                            let status = res.status;
                            this.loading = false;
                            this.isRequesting = false;
                            // console.log(res);
                            // 增减库存是不是要判断下更新是否成功了，根据xml文档返回的数据判断
                            if (status == 200) {
                                // console.log('增加');
                                this.$toast.success({
                                    message: '更新成功！',
                                    forbidClick: true,
                                    onClose: function () {
                                        console.log(1111);
                                    },
                                    onOpened() {
                                        console.log('完全展示后');
                                    },
                                });

                                //更新数量
                                this.ldQtyOh = this.qty;
                                // this.parseXml(res.data);

                                // if (!this.skuError && increaseQty != 0) {
                                //     this.updateQadEsl(this.searchObj);
                                // }

                            } else {
                                this.$toast.fail("更新失败！");
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                            this.isRequesting = false;
                        });
                } else if (increaseQtyOrigin < 0) {
                    console.log('减少库存');
                    //减少库存
                    if (this.isRequesting) {
                        return
                    }
                    this.isRequesting = true;
                    this.loading = true;
                    api.home
                        .shopwebIntegrationByXml(issueParams)
                        .then(res => {
                            let status = res.status;
                            this.isRequesting = false;
                            this.loading = false;
                            if (status == 200) {
                                this.$toast.success({
                                    message: '更新成功！',
                                    forbidClick: true,
                                    onClose: function () {
                                        console.log(222);
                                    },
                                    onOpened() {
                                        console.log('完全展示后');
                                    },
                                });
                                // 更新数量
                                this.ldQtyOh = this.qty;
                                // this.parseXml(res.data);
                                // if (!this.skuError && increaseQty != 0) {
                                //     this.updateQadEsl(this.searchObj);
                                // }
                            } else {
                                this.$toast.fail("更新失败！");
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                            this.isRequesting = false;
                        });
                }
                //4 更新qad
                //5 更新ESL
                // sku对应有数据
            }
        },
        updateQadEsl(searchObj) {
            // 请求xml数据，并提取需要的数据,不更新esl，也要获取一次qad数据，或者更新qad
            let params = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:add="http://www.w3.org/2005/08/addressing" xmlns:urn="urn:schemas-qad-com:xml-services:common" xmlns:urn1="urn:schemas-qad-com:xml-services">
   <soapenv:Header>
      <add:ReplyTo>
         <add:Address>urn:services-qad-com:</add:Address>
      </add:ReplyTo>
      <add:ReferenceParameters>
         <urn:suppressResponseDetail>false</urn:suppressResponseDetail>
      </add:ReferenceParameters>
      <add:MessageID>urn:services-qad-com::hvltesto</add:MessageID>
      <add:To>urn:services-qad-com:hvltesto</add:To>
      <add:Action></add:Action>
   </soapenv:Header>
     <soapenv:Body>
      <urn1:queryQryInventory>
         <urn:dsSessionContext>
               <urn:ttContext>
               <urn:propertyQualifier>QAD</urn:propertyQualifier>
               <urn:propertyName>domain</urn:propertyName>
               <urn:propertyValue>10USA</urn:propertyValue>
            </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>username</urn:propertyName>
                    <urn:propertyValue>nriadm</urn:propertyValue>
                </urn:ttContext>
                <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>password</urn:propertyName>
                    <urn:propertyValue>nomurahk</urn:propertyValue>
                </urn:ttContext>
                    <urn:ttContext>
                    <urn:propertyQualifier>QAD</urn:propertyQualifier>
                    <urn:propertyName>version</urn:propertyName>
                    <urn:propertyValue>ERP3_1 </urn:propertyValue>
                </urn:ttContext>

         </urn:dsSessionContext>
               <urn1:dsQueryServiceRequest>            
            <urn1:QueryServiceRequest>
                 
               <urn1:SourceApplication>hvltest</urn1:SourceApplication>
               <urn1:Profile>QryInventory</urn1:Profile>
                 <urn1:Filter>ld_site="${searchObj.Site}" and ld_Part="${
                searchObj.itemNo
                }" and ld_loc="${searchObj.Location}" and ld_lot="${searchObj.LotNO}"
    </urn1:Filter>
               <urn1:MaxRows>1</urn1:MaxRows>
               <urn1:IgnoreBOFilter>false</urn1:IgnoreBOFilter>
               <urn1:IgnoreBOInnerJoin>false</urn1:IgnoreBOInnerJoin>
            </urn1:QueryServiceRequest>
         </urn1:dsQueryServiceRequest>
      </urn1:queryQryInventory>
   </soapenv:Body>
</soapenv:Envelope>`;

            // batchNo=1,sku=ldPart,itemName=ldPart,price1=ldQtyOh,placeOfOrigin=ldLoc,qrCode--前端写入grade = ldSite， specification = ldLoc, unit=ldLot

            if (this.isRequestingXml) {
                return;
            }
            this.loading = true;
            this.isRequestingXml = true;
            api.home
                .shopwebIntegrationByXml(params)
                .then(res => {
                    // console.log(res.data);
                    this.loading = false;
                    let status = res.status;
                    this.isRequestingXml = false;
                    let xmlDoc = null;
                    if (status == 200) {
                        let data = res.data;
                        if (window.DOMParser) {
                            let parser = new DOMParser();
                            xmlDoc = parser.parseFromString(data, "text/xml");
                            parser.parse;
                        } else {
                            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                            xmlDoc.async = "false";
                            xmlDoc.loadXML(data);
                        }

                        let QryInventory = xmlDoc.getElementsByTagName("qdoc:QryInventory");
                        let ldLoc = "";
                        let ldLot = "";
                        let ldPart = "";
                        let ldQtyOh = "";
                        let ldSite = "";
                        if (
                            QryInventory &&
                            QryInventory[0] &&
                            QryInventory[0].childNodes[0] &&
                            QryInventory[0].childNodes[0].childNodes
                        ) {
                            this.skuError = false;
                            ldLoc = xmlDoc.getElementsByTagName("qdoc:ldLoc")[0].innerHTML; //placeOfOrigin=ldLoc,specification = ldLoc,
                            ldLot = xmlDoc.getElementsByTagName("qdoc:ldLot")[0].innerHTML; // unit=ldLot
                            ldPart = xmlDoc.getElementsByTagName("qdoc:ldPart")[0].innerHTML; //sku=ldPart,itemName=ldPart
                            ldQtyOh = xmlDoc.getElementsByTagName("qdoc:ldQtyOh")[0]
                                .innerHTML; //price1=ldQtyOh ,qty=ldQtyOh
                            ldSite = xmlDoc.getElementsByTagName("qdoc:ldSite")[0].innerHTML; //grade = ldSite

                            this.ldLoc = ldLoc;
                            this.ldLot = ldLot;
                            this.ldPart = ldPart;
                            this.ldSite = ldSite;

                            this.ldQtyOh = ldQtyOh;
                            this.qty = ldQtyOh;

                        } else {
                            this.skuError = true;
                        }

                    }
                })
                .catch(res => {
                    this.isRequestingXml = false;
                    this.loading = false;
                    this.skuError = true;
                });
        }
    },

    created() {
        this.isRequestingXml = false;
        // this.$toast('this is toast');
        // this.$toast.success({
        //     message: '更新成功',
        //     getContainer:'#homePage',
        //     forbidClick: true,
        //     onOpened() {
        //         console.log('完全展示后');
        //     },
        // });
    },

    mounted() {
        let qrcodeUrl = location.href;
        let searchObj = qs.parse(qrcodeUrl.split("?")[1]);
        this.searchObj = searchObj;
        this.sku = searchObj.itemNo;
        let formData = [];
        for (let key in searchObj) {
            formData.push({
                label: key,
                value: searchObj[key],
                disable: true
            });
        }
        this.formData = formData;
        // 请求xml数据，并提取需要的数据
        this.updateQadEsl(searchObj);
    }
};