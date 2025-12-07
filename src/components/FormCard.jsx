import React from 'react'


export default function FormCard({ children }){
return (
<div style={{maxWidth:1100,margin:'24px auto',padding:24,background:'#fff',borderRadius:12,boxShadow:'0 10px 30px rgba(2,6,23,0.08)'}}>
{children}
</div>
)
}