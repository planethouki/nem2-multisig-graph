(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{1518:function(t,e,n){"use strict";n.r(e);n(38),n(107),n(108),n(750);var r=n(410),o=n(50),map=n(34),d={components:{},data:function(){return{nodeVersion:null,generationHash:null,chainHeight:null,networkIdentifier:null,deploymentTool:null,lastUpdatedDate:null}},computed:{tryAnywayTo:function(){return"/graph?account=TBJNO5VB4J6UNWFNRU47VKQAO7HABC3NPSHADQQ"},restUrl:function(){return"https://dg0nbr5d1ohfy.cloudfront.net"}},mounted:function(){var t=this,e=new r.RepositoryFactoryHttp(this.restUrl),n=e.createChainRepository(),d=e.createNetworkRepository(),c=e.createNodeRepository();n.getChainInfo().pipe(Object(map.a)((function(t){return t.height}))).subscribe((function(e){t.chainHeight=e})),d.getNetworkProperties().pipe(Object(map.a)((function(t){return t.network.identifier}))).subscribe((function(e){t.networkIdentifier=e})),c.getNodeInfo().pipe(Object(map.a)((function(e){return{v:t.parseNodeVersion(e.version),gh:e.networkGenerationHashSeed}}))).subscribe((function(e){var n=e.v,r=e.gh;t.nodeVersion=n,t.generationHash=r})),Object(o.a)(this.$axios.$request({baseURL:this.restUrl,url:"/node/server"})).pipe(Object(map.a)((function(t){var e=t.serverInfo.deployment;return{deployment:"".concat(e.deploymentTool,"@").concat(e.deploymentToolVersion),lastUpdatedDate:e.lastUpdatedDate}}))).subscribe((function(e){var n=e.deployment,r=e.lastUpdatedDate;t.deploymentTool=n,t.lastUpdatedDate=r}))},methods:{parseNodeVersion:function(t){for(var e="00000000".concat(Number(t).toString(16)).substr(-8),n=[],i=0;i<8;i+=2){var r=Number("0x".concat(e[i]).concat(e[i+1])).toString(10);n.push(r)}return n.join(".")}}},c=n(182),component=Object(c.a)(d,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("div",{staticClass:"jumbotron bg-white"},[n("h1",{staticClass:"display-4"},[t._v("Multisig Graph")]),t._v(" "),n("p",{staticClass:"lead"},[t._v("マルチシグの構成を図で表します。")]),t._v(" "),n("hr",{staticClass:"my-4"}),t._v(" "),n("b-button",{attrs:{variant:"secondary",size:"lg",to:t.tryAnywayTo}},[t._v("\n      Try Anyway\n    ")])],1),t._v(" "),n("div",{staticClass:"container-fluid mb-3"},[n("table",[n("body",[n("tr",[n("td",{staticClass:"pr-3"},[t._v("使用ノード")]),t._v(" "),n("td",[t._v(t._s(t.restUrl))])]),t._v(" "),n("tr",[n("td",[t._v("Node Version")]),t._v(" "),n("td",[t._v(t._s(t.nodeVersion))])]),t._v(" "),n("tr",[n("td",{staticClass:"pr-3"},[t._v("Generation Hash")]),t._v(" "),n("td",[t._v(t._s(t.generationHash))])]),t._v(" "),n("tr",[n("td",[t._v("Height")]),t._v(" "),n("td",[t._v(t._s(t.chainHeight))])]),t._v(" "),n("tr",[n("td",[t._v("Network")]),t._v(" "),n("td",[t._v(t._s(t.networkIdentifier))])]),t._v(" "),n("tr",[n("td",[t._v("Deployment")]),t._v(" "),n("td",[t._v(t._s(t.deploymentTool))])]),t._v(" "),n("tr",[n("td",[t._v("Last Updated")]),t._v(" "),n("td",[t._v(t._s(t.lastUpdatedDate))])])])])])])}),[],!1,null,null,null);e.default=component.exports}}]);