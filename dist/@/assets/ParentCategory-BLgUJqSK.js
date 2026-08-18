import{r as f,f as I,j as r}from"./index-CVR3KhDg.js";import{a as M}from"./index-32oq47jL.js";import{u as T}from"./useAsync-C3HH6OpK.js";import"./toast-Bl6U9gUw.js";import{C}from"./ProductServices-ZRtuqukB.js";import{u as j}from"./useUtilsFunction-DcxpwsLf.js";import{S as y,T as S}from"./TreeItem-BxNSgS-r.js";const _=({children:i,hideCheckbox:d,...t})=>r.jsx(S,{...t,slotProps:{checkbox:d?{style:{display:"none"}}:{}},children:i}),V=({selectedCategory:i,setSelectedCategory:d})=>{const{data:t,loading:p}=T(C?.getAllCategory),{showingTranslateValue:l}=j(),{mode:g}=f.useContext(I.WindmillContext),h=f.useMemo(()=>{const o=(n,c=!1)=>n.map(e=>r.jsx(_,{itemId:e._id,hideCheckbox:c,label:r.jsxs("span",{className:"flex items-center gap-2",children:[e.icon?r.jsx("img",{src:e.icon,alt:"",className:"w-6 h-6 my-1 object-contain rounded",style:{filter:g==="dark"?"brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)":"invert(0%)"}}):r.jsx(M,{size:16,className:"text-gray-400"}),l(e.name)]}),children:e.children?.length?o(e.children,!1):null},e._id));return t?o(t,!0):[]},[t,l]),u=(o,n)=>o._id===n?o:o?.children?.reduce((c,e)=>c??u(e,n),void 0),x=(o,n)=>{if(!t||t.length===0)return;const c=t[0],e=i.map(s=>s._id),v=n.filter(s=>!e.includes(s)),k=e.filter(s=>!n.includes(s));let a=[...i];v.forEach(s=>{const m=u(c,s);m&&a.push({_id:m._id,name:l(m.name)})}),a=a.filter(s=>!k.includes(s._id)),d(a)},b=i.map(o=>o._id);return r.jsxs(r.Fragment,{children:[!p&&t&&r.jsx("div",{className:"vsc-tree rounded-lg p-[10px] bg-gray-800/5 dark:bg-gray-100/5",children:r.jsx(y,{multiSelect:!0,checkboxSelection:!0,selectedItems:b,onSelectedItemsChange:x,expansionTrigger:"content",children:h})}),r.jsx("style",{children:`
        .vsc-tree .MuiTreeItem-content {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.875rem;
          color: inherit;
        }
        .vsc-tree .MuiTreeItem-content:hover {
          background: #094771;
          color: #fff;
        }
        .vsc-tree .Mui-selected > .MuiTreeItem-content {
          background: #094771;
          color: #fff;
        }
        .vsc-tree .MuiTreeItem-group {
          margin-left: 12px;
          border-left: 1px solid #3a3d41;
        }
        [dir="rtl"] .vsc-tree .MuiTreeItem-group {
          margin-left: 0;
          margin-right: 12px;
          border-left: 0;
          border-right: 1px solid #3a3d41;
        }
        .dark .vsc-tree .MuiTreeItem-group {
          border-color: #6b7280;
        }
        .dark .vsc-tree .MuiTreeItem-content {
          color: #e5e7eb;
        }
        .dark .vsc-tree .MuiTreeItem-content:hover {
          background: #1e40af;
          color: #fff;
        }
        .dark .vsc-tree .Mui-selected > .MuiTreeItem-content {
          background: #1e40af;
          color: #fff;
        }
        [dir="rtl"] .vsc-tree .MuiTreeItem-iconContainer {
          transform: scaleX(-1);
        }
        
        /* Checkbox styling for better dark mode support */
        .dark .vsc-tree .MuiCheckbox-root {
          color: #9ca3af;
        }
        .dark .vsc-tree .MuiCheckbox-root.Mui-checked {
          color: #3b82f6;
        }
      `})]})};export{V as P};
