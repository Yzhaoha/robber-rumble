import * as THREE from '../three.module.min.js';

// Model coordinates: +X nose, +Y up. Every visible part is geometry, not a billboard.
export function createHeroCar() {
  const root = new THREE.Group(), wheels = [];
  root.name = 'lightning-coupe';
  const materials = {
    red: new THREE.MeshStandardMaterial({color:'#ed514d',roughness:.34,metalness:.08}),
    redDark: new THREE.MeshStandardMaterial({color:'#a62e37',roughness:.42}),
    cream: new THREE.MeshStandardMaterial({color:'#f6dfaa',roughness:.32,metalness:.15}),
    rubber: new THREE.MeshStandardMaterial({color:'#202631',roughness:.9}),
    dark: new THREE.MeshStandardMaterial({color:'#1c2837',roughness:.6}),
    glass: new THREE.MeshStandardMaterial({color:'#213c58',roughness:.23,metalness:.4}),
    light: new THREE.MeshStandardMaterial({color:'#fff3cc',emissive:'#ffdb8e',emissiveIntensity:1.2}),
    tail: new THREE.MeshStandardMaterial({color:'#ff373c',emissive:'#d42025',emissiveIntensity:.7})
  };
  const add=(geo,mat,x=0,y=0,z=0,parent=root)=>{
    const m=new THREE.Mesh(geo,typeof mat==='string'?materials[mat]:mat);
    m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  function rounded(w,h,d,r=.06) {
    r=Math.min(r,w/3,h/3,d/3);
    const sh=new THREE.Shape(),hw=w/2-r,hh=h/2-r;
    sh.moveTo(-hw,-hh);sh.lineTo(hw,-hh);sh.lineTo(hw,hh);sh.lineTo(-hw,hh);sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:1});
    g.translate(0,0,-(d-2*r)/2);return g;
  }
  const box=(w,h,d,mat,x,y,z,r)=>add(rounded(w,h,d,r),mat,x,y,z);
  function profile(points,width,mat,z=0) {
    const sh=new THREE.Shape();points.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:width-.08,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:1,curveSegments:1});
    g.translate(0,0,-(width-.08)/2);return add(g,mat,0,0,z);
  }
  profile([[-2.22,.35],[2.17,.35],[2.3,.53],[2.05,.78],[.85,.98],[-1.65,1.04],[-2.24,.8]],1.86,'red');
  box(4.15,.16,1.82,'dark',0,.35,0,.04);
  // Sloped hood, windshield and rear window have deliberately different planes.
  profile([[.7,.95],[2.04,.77],[2.13,.87],[.75,1.08]],1.54,'red');
  profile([[-1.5,.98],[.84,.97],[.27,1.65],[-.95,1.65]],1.47,'glass');
  box(1.27,.13,1.58,'red',-.37,1.68,0,.04);
  for(const side of [-1,1]) {
    const z=side*.77;
    profile([[.65,.96],[.83,.99],[.28,1.68],[.17,1.68]],.1,'red',z);
    profile([[-1.55,1.01],[-1.35,1.01],[-.91,1.68],[-1.04,1.68]],.1,'red',z);
    box(.1,.54,.12,'redDark',-.65,1.32,z,.025);
    box(.2,.11,.055,'cream',-.83,1.02,side*.99,.025);
    box(.25,.2,.3,'red',.51,1.17,side*.96,.05);
    box(.2,.12,.04,'glass',.49,1.19,side*1.12,.02);
    box(3.6,.15,.17,'cream',-.1,.42,side*1.02,.04);
    // Carved arch bands; the tire opening stays visibly hollow.
    for(const x of [-1.43,1.4]) {
      const sh=new THREE.Shape();
      sh.moveTo(-.74,-.06);sh.lineTo(-.74,.3);sh.lineTo(-.46,.64);sh.lineTo(.44,.64);sh.lineTo(.74,.3);sh.lineTo(.74,-.06);
      sh.lineTo(.59,-.06);sh.lineTo(.51,.3);sh.lineTo(.33,.45);sh.lineTo(-.33,.45);sh.lineTo(-.51,.3);sh.lineTo(-.59,-.06);sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:.18,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:1});g.translate(0,0,-.09);
      add(g,'red',x,.52,side*.96);
      const pivot=new THREE.Group();pivot.position.set(x,.53,side*1.01);root.add(pivot);wheels.push(pivot);
      const tire=add(new THREE.CylinderGeometry(.53,.53,.35,16),'rubber',0,0,0,pivot);tire.rotation.x=Math.PI/2;
      const rim=add(new THREE.CylinderGeometry(.32,.32,.37,12),'cream',0,0,0,pivot);rim.rotation.x=Math.PI/2;
      const hub=add(new THREE.CylinderGeometry(.12,.12,.4,8),'dark',0,0,0,pivot);hub.rotation.x=Math.PI/2;
      for(let k=0;k<5;k++) {
        const a=k*Math.PI*2/5;
        const spoke=add(rounded(.35,.045,.035,.01),'dark',Math.cos(a)*.19,Math.sin(a)*.19,side*.198,pivot);spoke.rotation.z=a;
      }
    }
    // Side air intake and crease make the broad rear haunch read at gameplay scale.
    profile([[-1.14,.55],[-.58,.55],[-.48,.9],[-.93,.88]],.07,'dark',side*1.005);
    const head=box(.08,.17,.51,'light',2.18,.72,side*.61,.025);head.rotation.y=-side*.18;
    box(.08,.15,.48,'tail',-2.25,.7,side*.62,.025);
    box(.13,.35,.13,'redDark',-1.97,1.17,side*.69,.025);
  }
  box(.42,.12,2.1,'red',-2.02,1.4,0,.04);
  box(.45,.035,1.63,'cream',-2.02,1.475,0,.01);
  box(.2,.15,2.04,'cream',2.19,.36,0,.04);
  box(.06,.2,1.13,'dark',2.285,.53,0,.025);
  box(.16,.18,1.7,'dark',-2.28,.38,0,.035);
  // Center stripes follow each surface rather than floating above the body.
  profile([[.75,1.083],[2.09,.875],[2.09,.891],[.75,1.1]],.27,'cream');
  box(1.25,.018,.27,'cream',-.37,1.755,0,.005);
  box(.45,.018,.27,'cream',-1.8,1.097,0,.005);
  for(const side of [-1,1]) {
    const pipe=add(new THREE.CylinderGeometry(.075,.075,.16,10),'cream',-2.34,.42,side*.66);pipe.rotation.z=Math.PI/2;
  }
  const cargoAnchor=new THREE.Object3D();cargoAnchor.name='cargo-anchor';cargoAnchor.position.set(-.4,1.8,0);root.add(cargoAnchor);
  root.userData={wheels,cargoAnchor};return root;
}
