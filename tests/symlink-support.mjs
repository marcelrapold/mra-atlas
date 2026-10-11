import {mkdtemp,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Windows without Developer Mode or admin rights rejects symlink creation with EPERM.
async function probe(){
  const directory=await mkdtemp(join(tmpdir(),'framework-symlink-probe-'));
  try{await writeFile(join(directory,'target'),'');await symlink(join(directory,'target'),join(directory,'link'));return true;}
  catch(error){if(error.code==='EPERM'||error.code==='EACCES')return false;throw error;}
  finally{await rm(directory,{recursive:true,force:true});}
}
export const canSymlink=await probe();
