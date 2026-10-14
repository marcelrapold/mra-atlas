'use client';
// Loaded on /agenten only: the prompt compiler stays out of the shared reference chunk.
import {useState} from 'react';
import {Button,Input} from '@rapold/framework-core';
import {compilePrompt} from '../../../../../packages/brands/src/prompt-compiler.mjs';
import {useActiveBrand} from '../framework-shell';
export default function AgentenSection(){
 const {brand}=useActiveBrand();
 const [repo,setRepo]=useState('owner/repo'),[copied,setCopied]=useState('');
 const prompt=compilePrompt({idea:`Analysiere das Repository ${repo.trim()||'owner/repo'}.`,format:'Präsentation',brand});
 const copy=async()=>{try{await navigator.clipboard.writeText(prompt);setCopied('Kopiert');}catch{setCopied('Kopieren nicht verfügbar. Text bitte direkt markieren.');}};
 return <><label>Repository<Input value={repo} onChange={e=>{setRepo(e.target.value);setCopied('');}}/></label><pre>{prompt}</pre><Button onClick={copy}>Prompt kopieren</Button><p role="status">{copied}</p><div className="download-row"><a href={`/brands/${brand.id}/llms.txt`}>Agenten-Einstieg · {brand.id==='neutral'?'Default':brand.name}</a><a href={`/brands/${brand.id}/management.md`}>Vollständiger Management-Ablauf</a></div></>;
}
