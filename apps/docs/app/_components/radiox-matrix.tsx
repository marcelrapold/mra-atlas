'use client';
import {useEffect,useRef} from 'react';

// Port of RadioX MatrixBackground (apps/frontend/components/MatrixBackground.tsx):
// glowing «X» glyphs in three depth layers fall and leave trails on black.
// Differences: sized to its container instead of the viewport, runs only while
// visible on screen and in a visible tab, and draws a still frame when paused
// or when the viewer prefers reduced motion.
type Particle={x:number;y:number;z:number;size:number;speed:number;glowOffset:number;font:string};
const FPS=30,STILL_STEPS=24,DENSITY=0.6;

export default function RadioxMatrix({running}:{running:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;const ctx=canvas?.getContext('2d',{alpha:true});
  if(!canvas||!ctx)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width=0,height=0,particles:Particle[]=[],frame:number|null=null,last=0,onScreen=true;
  const create=(randomY:boolean):Particle=>{const z=Math.random(),size=10+z*14;return {x:Math.random()*width,y:randomY?Math.random()*height:-50,z,size,speed:(0.5+z*1.2)*(Math.random()*0.5+0.8),glowOffset:Math.random()*Math.PI*2,font:`bold ${size}px ui-monospace, monospace`};};
  const resize=()=>{
   const rect=canvas.getBoundingClientRect(),scale=Math.min(window.devicePixelRatio||1,1.5);
   width=rect.width;height=rect.height;canvas.width=width*scale;canvas.height=height*scale;ctx.setTransform(scale,0,0,scale,0,0);
   particles=Array.from({length:Math.floor(width/25*DENSITY)},()=>create(true));
  };
  const draw=(time=performance.now()*0.001)=>{
   ctx.fillStyle='rgba(5, 5, 5, 0.12)';ctx.fillRect(0,0,width,height);
   for(let i=0;i<particles.length;i++){
    const p=particles[i];ctx.font=p.font;
    const wave=(Math.sin(time+p.glowOffset)+1)*0.5,glow=wave*wave*wave;
    ctx.fillStyle=`rgba(${(60+120*glow)|0}, ${(80+175*glow)|0}, ${(90+165*glow)|0}, ${0.02+p.z*0.13+(0.78+p.z*0.07)*glow})`;
    ctx.fillText('X',p.x,p.y);p.y+=p.speed;
    if(p.y>height+50)particles[i]=create(false);
   }
  };
  const still=()=>{ctx.clearRect(0,0,width,height);for(let s=0;s<STILL_STEPS;s++)draw(s/FPS);};
  const loop=(t:number)=>{if(t-last>=1000/FPS){last=t;draw();}frame=requestAnimationFrame(loop);};
  const stop=()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null;};
  const sync=()=>{const animate=running&&!reduced&&onScreen&&!document.hidden;if(animate&&frame===null)frame=requestAnimationFrame(loop);if(!animate)stop();};
  resize();
  if(!running||reduced)still();
  const io=new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;sync();});io.observe(canvas);
  const ro=new ResizeObserver(()=>{resize();if(!running||reduced)still();});ro.observe(canvas);
  document.addEventListener('visibilitychange',sync);sync();
  return ()=>{stop();io.disconnect();ro.disconnect();document.removeEventListener('visibilitychange',sync);};
 },[running]);
 return <canvas ref={ref} className="rx-matrix" aria-hidden="true" data-running={running}/>;
}
