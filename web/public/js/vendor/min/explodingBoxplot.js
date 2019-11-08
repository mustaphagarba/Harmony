window.ExplodingBoxplot=function(){var t,e,n=[],a=[],r=[],i={id:"",class:"xBoxPlot",width:window.innerWidth,height:window.innerHeight,margins:{top:10,right:10,bottom:60,left:40},logy:!1,axes:{x:{label:"",ticks:10,scale:"linear",nice:!0,tickFormat:void 0,domain:void 0},y:{label:"",key:"",ticks:10,scale:"linear",nice:!0,tickFormat:function(t){return t.toLocaleString()},domain:void 0}},data:{color_index:"color",label:"undefined",group:void 0,identifier:void 0},datapoints:{radius:3},display:{iqr:1.5,boxpadding:.2},resize:!0,mobileScreenMax:500},o={elements:{domParent:void 0,chartRoot:void 0},scales:{X:void 0,Y:void 0,color:void 0}},l=($(window).innerWidth(),i.mobileScreenMax,{0:"#a6cee3",1:"#ff7f00",2:"#b2df8a",3:"#1f78b4",4:"#fdbf6f",5:"#33a02c",6:"#cab2d6",7:"#6a3d9a",8:"#fb9a99",9:"#e31a1c",10:"#ffff99",11:"#b15928"}),s=JSON.parse(JSON.stringify(l)),c=200,d={point:{click:null,mouseover:null,mouseout:null},update:{begin:null,ready:null,end:null}};function u(a){a.each(function(){var a=d3.select(this);o.elements.domParent=a;var l=a.append("svg").attr("class","svg-class");o.elements.chartRoot=l;var u=l.append("g").append("rect").attr("id","resetArea").attr("width",i.width).attr("height",i.height).style("color","white").style("opacity",0),p=l.append("g").attr("class","chartWrapper").attr("id","chartWrapper"+i.id);$(window).innerWidth()<i.mobileScreenMax,e=function(e){l.attr("width",i.width+i.margins.left+i.margins.right).attr("height",i.height+i.margins.top+i.margins.bottom),p.attr("transform","translate("+i.margins.left+","+i.margins.top+")"),d.update.begin&&d.update.begin(o,i,d),t=i.data.group?d3.nest().key(function(t){return t[i.data.group]}).entries(n):[{key:"",values:n}];var a=d3.scale.ordinal().domain(t.map(function(t){return t.key})).rangeRoundBands([0,i.width-i.margins.left-i.margins.right],i.display.boxpadding);if(o.scales.X=a,t=t.map(function(t){var e=f(t.values,i.display.iqr,i.axes.y.key);return e.group=t.key,e}),i.logy)var g=d3.scale.log();else g=d3.scale.linear();g.domain(d3.extent(n.map(function(t){return x(t[i.axes.y.key])}))).range([i.height-i.margins.top-i.margins.bottom,0]).nice(),o.scales.Y=g;var m=d3.scale.ordinal().domain(d3.set(n.map(function(t){return t[i.data.color_index]})).values()).range(Object.keys(s).map(function(t){return s[t]}));o.scales.color=m,d.update.ready&&d.update.ready(o,i,d);var h=d3.svg.axis().scale(a).orient("bottom"),y=d3.svg.axis().scale(g).orient("left").tickFormat(i.axes.y.tickFormat);u.on("dblclick",function(t,e){r=[],p.selectAll(".normal-points").each(function(t){d3.select(this).selectAll("circle").transition().ease(d3.ease("back-out")).duration(function(){return 1.5*c+1.5*c*Math.random()}).attr("cx",.5*a.rangeBand()).attr("cy",g(t.quartiles[1])).remove()}),p.selectAll(".boxcontent").transition().ease(d3.ease("back-out")).duration(1.5*c).delay(c).each(w)});var v=p.selectAll("#xpb_xAxis").data([0]);v.enter().append("g").attr("class","explodingBoxplot x axis").attr("id","xpb_xAxis").append("text").attr("class","axis text").style("font-size","20px"),v.exit().remove(),v.attr("transform","translate(0,"+(i.height-i.margins.top-i.margins.bottom)+")").call(h),t.length>15&&v.selectAll("text").style("text-anchor","start").attr("transform","rotate(45)"),v.select(".axis.text").attr("x",(i.width-i.margins.left-i.margins.right)/2).attr("dy",".71em").attr("y",i.margins.bottom-10).style("text-anchor","middle").text(i.axes.x.label);var b=p.selectAll("#xpb_yAxis").data([0]);b.enter().append("g").attr("class","explodingBoxplot y axis").attr("id","xpb_yAxis").append("text").attr("class","axis text").style("font-size","20px"),b.exit().remove(),b.call(y).select(".axis.text").attr("transform","rotate(-90)").attr("x",-i.margins.top-d3.mean(g.range())).attr("dy",".71em").attr("y",5-i.margins.left).style("text-anchor","middle").text(i.axes.y.label);var B=p.selectAll(".boxcontent").data(t);function k(t){t.attr("class","explodingBoxplot point").attr("r",i.datapoints.radius).attr("fill",function(t){return m(t[i.data.color_index])}).on("mouseover",function(t,e,n){d.point&&"function"==typeof d.point.mouseover&&d.point.mouseover(t,e,d3.select(this),o,i)}).on("mouseout",function(t,e,n){d.point&&"function"==typeof d.point.mouseout&&d.point.mouseout(t,e,d3.select(this),o,i)}).on("click",function(t,e,n){d.point&&"function"==typeof d.point.click&&d.point.click(t,e,d3.select(this),o,i)})}function q(t){t.attr("r",i.datapoints.radius).attr("fill",function(t){return m(t[i.data.color_index])}).attr("cx",function(t){var e=a.rangeBand();return Math.floor(Math.random()*e)}).attr("cy",function(t){return g(x(t[i.axes.y.key]))})}function w(t,e){d3.select("#explodingBoxplot_box"+i.id+e).on("click",function(t){M(e),r.push(e)});t=d3.select(this);if(r.indexOf(e)>=0)return M(e),void O(e);O(e),t.select("rect.box").transition().duration(c).attr("x",0).attr("width",a.rangeBand()).attr("y",function(t){return g(t.quartiles[2])}).attr("height",function(t){return g(t.quartiles[0])-g(t.quartiles[2])}).attr("fill",function(t){return m(t.normal[0][i.data.color_index])}),t.select("line.median").transition().duration(c).attr("x1",0).attr("x2",a.rangeBand()).attr("y1",function(t){return g(t.quartiles[1])}).attr("y2",function(t){return g(t.quartiles[1])}).style("stroke-width",4),t.select("line.min.hline").transition().duration(c).attr("x1",.25*a.rangeBand()).attr("x2",.75*a.rangeBand()).attr("y1",function(t){return g(Math.min(t.min,t.quartiles[0]))}).attr("y2",function(t){return g(Math.min(t.min,t.quartiles[0]))}),t.select("line.min.vline").transition().duration(c).attr("x1",.5*a.rangeBand()).attr("x2",.5*a.rangeBand()).attr("y1",function(t){return g(Math.min(t.min,t.quartiles[0]))}).attr("y2",function(t){return g(t.quartiles[0])}),t.select("line.max.hline").transition().duration(c).attr("x1",.25*a.rangeBand()).attr("x2",.75*a.rangeBand()).attr("y1",function(t){return g(Math.max(t.max,t.quartiles[2]))}).attr("y2",function(t){return g(Math.max(t.max,t.quartiles[2]))}),t.select("line.max.vline").transition().duration(c).attr("x1",.5*a.rangeBand()).attr("x2",.5*a.rangeBand()).attr("y1",function(t){return g(t.quartiles[2])}).attr("y2",function(t){return g(Math.max(t.max,t.quartiles[2]))}),t.select("line.mean").transition().duration(c).attr("x1",0).attr("x2",a.rangeBand()).attr("y1",function(t){return g(t.mean)}).attr("y2",function(t){return g(t.mean)}).style("stroke-dasharray","10,3").style("stroke","white")}function A(t,e){this.select("rect.box").attr("x",.5*a.rangeBand()).attr("width",0).attr("y",function(t){return g(t.quartiles[1])}).attr("height",0),this.selectAll("line").attr("x1",.5*a.rangeBand()).attr("x2",.5*a.rangeBand()).attr("y1",function(t){return g(t.quartiles[1])}).attr("y2",function(t){return g(t.quartiles[1])})}function M(e){d3.select("#explodingBoxplot"+i.id+e).select("g.box").transition().ease(d3.ease("back-in")).duration(1.5*c).call(A);var n=d3.select("#explodingBoxplot"+i.id+e).select(".normal-points").selectAll(".point").data(t[e].normal);n.enter().append("circle"),n.exit().remove(),n.attr("cx",.5*a.rangeBand()).attr("cy",g(t[e].quartiles[1])).call(k).transition().ease(d3.ease("back-out")).delay(function(){return 1.5*c+100*Math.random()}).duration(function(){return 1.5*c+1.5*c*Math.random()}).call(q)}function O(e){var n=d3.select("#explodingBoxplot"+i.id+e).select(".outliers-points").selectAll(".point").data(t[e].outlier);n.enter().append("circle"),n.exit().remove(),n.attr("cx",.5*a.rangeBand()).attr("cy",g(t[e].quartiles[1])).call(k).transition().ease(d3.ease("back-out")).delay(function(){return 1.5*c+100*Math.random()}).duration(function(){return 1.5*c+1.5*c*Math.random()}).call(q)}B.enter().append("g").attr("class","explodingBoxplot boxcontent").attr("id",function(t,e){return"explodingBoxplot"+i.id+e}),B.exit().remove(),B.attr("transform",function(t){return"translate("+a(t.group)+",0)"}).each(function(t,e){d3.select(this).append("g").attr("class","explodingBoxplot outliers-points"),d3.select(this).append("g").attr("class","explodingBoxplot normal-points")}).each(function(t,e){var n=d3.select(this).append("g").attr("class","explodingBoxplot box").attr("id","explodingBoxplot_box"+i.id+e).selectAll(".box").data([t]).enter();n.append("rect").attr("class","explodingBoxplot box").attr("fill",function(t){return m(t.normal[0][i.data.color_index])}),n.append("line").attr("class","explodingBoxplot median line"),n.append("line").attr("class","explodingBoxplot min line hline"),n.append("line").attr("class","explodingBoxplot line min vline"),n.append("line").attr("class","explodingBoxplot max line hline"),n.append("line").attr("class","explodingBoxplot line max vline"),n.append("line").attr("class","explodingBoxplot mean line")}).each(w),d.update.end&&setTimeout(function(){d.update.end(o,i,d)},c)}})}function p(t,e){if(t&&e)for(var n=Object.keys(t),a=Object.keys(e),r=0;r<n.length;r++)if(a.indexOf(n[r])>=0){var i=e[n[r]],o=t[n[r]];"object"==typeof i&&"function"!=typeof o?p(t[n[r]],e[n[r]]):e[n[r]]=t[n[r]]}}function x(t){return i.logy&&0===t?.1:t}u.options=function(t){return arguments.length?(p(t,i),u):i},u.events=function(t){return arguments.length?(p(t,d),u):d},u.constituents=function(){return o},u.colors=function(t){if(!arguments.length)return s;if("object"!=typeof t)return!1;var e=Object.keys(t);return!!e.length&&(e.forEach(function(e){/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t[e])||delete t[e]}),s=Object.keys(t).length?t:JSON.parse(JSON.stringify(l)),u)},u.logy=function(t){return arguments.length?(i.logy=t,u):i.logy},u.width=function(t){return arguments.length?(i.width=t,u):i.width},u.height=function(t){return arguments.length?(i.height=t,u):i.height},u.data=function(t){return arguments.length?(t.sort(function(t,e){return t.group-e.group}),n=JSON.parse(JSON.stringify(t)),u):n},u.push=function(t){var e=JSON.parse(JSON.stringify(t));if(!arguments.length)return!1;if(e.constructor===Array)for(var r=0;r<e.length;r++)n.push(e[r]),a.push(e[r]);else n.push(e),a.push(e);return!0},u.pop=function(){if(n.length){n.length;return a.pop(),n.pop()}},u.update=function(t){"function"==typeof e&&e(t)},u.duration=function(t){return arguments.length?(c=t,u):c};var f=function(t,e,n){e=e||1.5,n=n||Number;var a=d3.mean(t,function(t){return t[n]}),r=t.map(function(t){return x(t[n])}).sort(d3.ascending),i=[d3.quantile(r,.25),d3.quantile(r,.5),d3.quantile(r,.75)],o=(i[2]-i[0])*e,l=Number.MIN_VALUE,s=Number.MAX_VALUE,c=d3.nest().key(function(t){var e=x(t[n]),a=e<i[0]-o||e>i[2]+o?"outlier":"normal";return"normal"==a&&(e<s||e>l)&&(l=Math.max(l,e),s=Math.min(s,e)),a}).map(t);return c.outlier||(c.outlier=[]),c.quartiles=i,c.iqr=o,c.max=l,c.min=s,c.mean=a,c};return u};