export const createSlug = (title) => {
  return title
    .normalize('NFD')                  
    .replace(/đ/g, 'd')                  
    .replace(/Đ/g, 'd')                
    .replace(/[\u0300-\u036f]/g, '')   
    .toLowerCase()                       
    .replace(/[^a-z0-9\s-]/g, '')        
    .trim()                            
    .replace(/\s+/g, '-')               
    .replace(/-+/g, '-');                
};
