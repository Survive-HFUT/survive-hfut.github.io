import{m as d,b as r,k as x,J as l}from"./mermaid.esm.min-CWTHE2ko.js";var u=d((t,e)=>{let i;return e==="sandbox"&&(i=r("#i"+t)),(e==="sandbox"?r(i.nodes()[0].contentDocument.body):r("body")).select(`[id="${t}"]`)},"getDiagramElement"),$=d((t,e,i,o)=>{t.attr("class",i);let{width:a,height:h,x:s,y:g}=c(t,e);x(t,h,a,o);let n=w(s,g,a,h,e);t.attr("viewBox",n),l.debug(`viewBox configured: ${n} with padding: ${e}`)},"setupViewPortForSVG"),c=d((t,e)=>{var o;let i=((o=t.node())==null?void 0:o.getBBox())||{width:0,height:0,x:0,y:0};return{width:i.width+e*2,height:i.height+e*2,x:i.x,y:i.y}},"calculateDimensionsWithPadding"),w=d((t,e,i,o,a)=>`${t-a} ${e-a} ${i} ${o}`,"createViewBox");export{$ as B,u as f};
