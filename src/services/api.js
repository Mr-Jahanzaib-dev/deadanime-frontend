// Updated extractValidServer function for WatchPage.jsx
// Replace the existing extractValidServer function with this:

const extractValidServer = (links) => {
  console.log('🔍 Extracting valid server from:', links);
  
  // Check if backend says there are no valid links
  if (links && links.hasValidLinks === false) {
    console.warn('⚠️ Backend validation: No valid streaming links available');
    return null;
  }
  
  let servers = [];
  
  // New format (validated by backend)
  if (links && links.servers && Array.isArray(links.servers)) {
    servers = links.servers;
    console.log(`📊 Found ${servers.length} validated servers from backend`);
  }
  // Old format (links array)
  else if (links && links.links && Array.isArray(links.links)) {
    servers = links.links;
    console.log(`📊 Found ${servers.length} servers (old format)`);
  }
  // Direct array format
  else if (Array.isArray(links)) {
    servers = links;
    console.log(`📊 Found ${servers.length} servers (array format)`);
  }
  
  if (servers.length === 0) {
    console.warn('⚠️ No servers found in response');
    return null;
  }
  
  // Try to find a valid server
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    const url = server.watch || server.url || server.embed || server.link;
    
    if (url && url.trim() !== "") {
      const cleanUrl = url.trim();
      console.log(`✅ Valid server found [${i + 1}/${servers.length}]:`, cleanUrl);
      return cleanUrl;
    } else {
      console.log(`❌ Invalid server [${i + 1}/${servers.length}]:`, server);
    }
  }
  
  console.error('❌ No valid streaming URL found in any server');
  return null;
};