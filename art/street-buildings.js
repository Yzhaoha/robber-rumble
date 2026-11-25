import * as THREE from '../three.module.min.js';

export function createStreetBuildings(root) {
  const mats=new Map();
  function mat(color){if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.76}));return mats.get(color);}
  function mesh(g,color,x,y,z,parent=root){const m=new THREE.Mesh(g,typeof color==='string'?mat(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function block(w,h,d,color,x,y,z,parent=root){
    const r=Math.min(.09,w/4,h/4,d/4),hw=w/2-r,hh=h/2-r,sh=new THREE.Shape();
    sh.moveTo(-hw,-hh);sh.lineTo(hw,-hh);sh.lineTo(hw,hh);sh.lineTo(-hw,hh);sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:1});g.translate(0,0,-(d-2*r)/2);
    return mesh(g,color,x,y,z,parent);
  }
  function planter(x,z){block(.95,.5,.95,'#e8d5b0',x,.99,z);mesh(new THREE.IcosahedronGeometry(.63,0),'#759653',x,1.6,z);}
  function facade(x,color,kind){
    const w=kind==='bank'?7:6,h=kind==='bank'?5.6:4.25,z=-7.7;
    block(w,h,5.5,color,x,h/2+.75,z);
    block(w+.3,.3,5.8,'#f4dfb8',x,h+.8,z);
    block(w-.5,.09,4.9,'#a0a6a2',x,h+.99,z);
    for(const side of [-1,1]){
      block(w+.3,.42,.24,'#efddbe',x,h+1,z+side*2.8);
      block(.24,.42,5.7,'#efddbe',x+side*(w/2),h+1,z);
    }
    // Roof vent ribs, kept quiet and grouped away from the facade.
    block(1.3,.6,1.2,'#85908f',x+1.3,h+1.3,z-.7);
    for(let j=0;j<5;j++)block(.95,.04,.07,'#536671',x+1.3,h+1.63,z-1.08+j*.18);
    if(kind==='bank'){
      block(6.8,.4,.6,'#f4dfb8',x,4.8,z+2.95);
      const triangle=new THREE.Shape();triangle.moveTo(-3.5,0);triangle.lineTo(3.5,0);triangle.lineTo(0,1.55);triangle.closePath();
      const roof=new THREE.ExtrudeGeometry(triangle,{depth:.35,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:1});mesh(roof,'#f1debc',x,5,z+2.85);
      for(const side of [-1,1]){
        block(.56,3.5,.6,'#f3dfbc',x+side*2.5,2.8,z+2.95);
        block(.85,.3,.9,'#dfc69e',x+side*2.5,1,z+2.95);
        block(.85,.25,.9,'#f6e7ce',x+side*2.5,4.4,z+2.95);
      }
      const gold=new THREE.MeshStandardMaterial({color:'#e5ad36',metalness:.55,roughness:.32});
      const disk=mesh(new THREE.CylinderGeometry(1.35,1.35,.22,32),gold,x,2.8,z+2.85);disk.rotation.x=Math.PI/2;
      mesh(new THREE.TorusGeometry(1.02,.09,6,32),'#f9de91',x,2.8,z+3.0);
      for(let j=0;j<6;j++){const a=j*Math.PI/3;const b=block(.7,.12,.1,'#f9de91',x+Math.cos(a)*.58,2.8+Math.sin(a)*.58,z+3.12);b.rotation.z=a;}
      const hub=mesh(new THREE.CylinderGeometry(.25,.25,.15,16),gold,x,2.8,z+3.12);hub.rotation.x=Math.PI/2;
      for(let j=0;j<3;j++)block(4.7-j*.25,.17,1.0+j*.4,'#dfcba8',x,.83+j*.16,z+3.2-j*.15);
    }else{
      block(4.9,2.45,.14,'#2c4656',x,2.2,z+2.8);
      for(const side of [-1,1])block(.1,2.5,.2,'#f0dcba',x+side*1.3,2.2,z+2.9);
      block(5.1,.18,.4,'#f0dcba',x,1,z+2.9);
      for(let j=0;j<9;j++){
        const a=block(.6,.16,1.35,j%2?'#f1dfbd':kind==='bakery'?'#c66c4f':'#527f88',x-2.4+j*.6,3.5,z+3.25);a.rotation.x=.22;
        block(.6,.36,.12,j%2?'#f1dfbd':kind==='bakery'?'#c66c4f':'#527f88',x-2.4+j*.6,3.19,z+3.9);
      }
      if(kind==='bakery'){
        for(let j=0;j<4;j++){const loaf=mesh(new THREE.CapsuleGeometry(.2,.35,2,6),'#e8ad50',x-1.8+j*.65,1.35,z+2.99);loaf.rotation.z=Math.PI/2;}
      }else{
        for(let j=0;j<3;j++){const tire=mesh(new THREE.TorusGeometry(.38,.15,6,14),'#283442',x+1.6,1.2+j*.38,z+3.05);tire.rotation.x=Math.PI/2;}
        block(.9,1.3,.5,'#ca7951',x-1.65,1.45,z+3);
        for(let j=0;j<4;j++)block(.72,.035,.05,'#f4d5a2',x-1.65,1.1+j*.22,z+3.28);
      }
    }
    planter(x-w/2+.3,z+3.45);planter(x+w/2-.3,z+3.45);
  }
  return facade;
}
