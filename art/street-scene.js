import * as THREE from '../three.module.min.js';
import {createHeroCar} from './hero-car.js';
import {createStreetBuildings} from './street-buildings.js';

export function createStreetSample() {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#c7dedc');
  const root=new THREE.Group();scene.add(root);
  const mats=new Map();
  function mat(color){if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.76}));return mats.get(color);}
  function mesh(g,color,x,y,z,parent=root){const m=new THREE.Mesh(g,typeof color==='string'?mat(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function block(w,h,d,color,x,y,z,parent=root){
    const r=Math.min(.09,w/4,h/4,d/4),hw=w/2-r,hh=h/2-r,sh=new THREE.Shape();
    sh.moveTo(-hw,-hh);sh.lineTo(hw,-hh);sh.lineTo(hw,hh);sh.lineTo(-hw,hh);sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:1});g.translate(0,0,-(d-2*r)/2);
    return mesh(g,color,x,y,z,parent);
  }
  // Light rig used in the real WebGL sample, with contact and directional shadows.
  scene.add(new THREE.HemisphereLight('#dcefff','#b29674',2));
  const sun=new THREE.DirectionalLight('#fff1d3',3.1);sun.position.set(-8,20,14);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:20,bottom:-20,near:1,far:65});sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;sun.shadow.radius=3;scene.add(sun);
  block(200,.1,200,'#9fbbb1',0,-.65,0);
  block(31,.8,24,'#e0ccab',0,-.18,-1.5);
  block(30.6,.1,23.6,'#3f515f',0,.27,-1.5);
  // A large readable foreground driving lane; the scene remains genuinely navigable.
  for(let x=-13;x<14;x+=3)block(1.5,.025,.12,'#f2deba',x,.34,2.8);
  for(const side of [-1,1])for(let i=0;i<6;i++)block(.5,.025,2,'#eee0bf',side*11+i*.65,.35,-.5);
  block(29,.38,8.3,'#bcbcac',0,.5,-8.1);
  for(let x=-13.5;x<=13.5;x+=1.5)block(1.4,.1,1.15,'#e2d2b7',x,.75,-3.85);
  for(let x=-13.5;x<=13.5;x+=3)for(let z=-10.5;z<=-5;z+=2.5)block(2.9,.05,2.4,'#d6cab3',x,.72,z);
  const facade = createStreetBuildings(root);
  facade(-8,'#d79577','bakery');facade(0,'#e0c8a0','bank');facade(8,'#80a9a8','workshop');
  for(const x of [-13,13]){
    mesh(new THREE.CylinderGeometry(.18,.25,2.1,8),'#8b6747',x,1.7,-7.5);
    mesh(new THREE.IcosahedronGeometry(1.35,1),'#86ac59',x,3.2,-7.5);
    mesh(new THREE.IcosahedronGeometry(.95,0),'#a6c56b',x-.4,4,-7.5);
  }
  const car=createHeroCar();car.position.set(.7,.36,1.1);root.add(car);
  // Coins and cargo use the game's recognizable gold language, no decorative text.
  const coinMaterial=new THREE.MeshStandardMaterial({color:'#ffc746',metalness:.55,roughness:.27});
  const coins=[];for(let i=0;i<5;i++){
    const coin=mesh(new THREE.CylinderGeometry(.23,.23,.09,16),coinMaterial,4.8+i*1.15,.9,-.6);coin.rotation.z=Math.PI/2;coins.push(coin);
  }
  const cargo=new THREE.Group();car.userData.cargoAnchor.add(cargo);cargo.visible=false;
  for(let i=0;i<3;i++)block(.6,.23,.48,'#efb63e',(i%2)*.08,i*.24,0,cargo);
  return {scene,car,coins,cargo,sun};
}
