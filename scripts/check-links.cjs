#!/usr/bin/env node

/**
 * Route Link Checker Script
 * 
 * Scans client/src directory for hardcoded route paths and reports
 * any paths that are not in the routes.ts constants file.
 * 
 * Usage: node scripts/check-links.cjs
 */

const fs = require('fs');
const path = require('path');

// Read routes.ts to get all valid routes
function getValidRoutes() {
  const routesPath = path.join(__dirname, '../client/src/routes.ts');
  const content = fs.readFileSync(routesPath, 'utf-8');
  
  const routes = new Set();
  
  // Extract ROUTES.* values
  const routesMatch = content.match(/ROUTES\s*=\s*\{([^}]+)\}/s);
  if (routesMatch) {
    const routesContent = routesMatch[1];
    const routeMatches = routesContent.matchAll(/(\w+):\s*"([^"]+)"/g);
    for (const match of routeMatches) {
      routes.add(match[2]);
    }
  }
  
  // Extract LEGACY_ROUTES.* values
  const legacyMatch = content.match(/LEGACY_ROUTES\s*=\s*\{([^}]+)\}/s);
  if (legacyMatch) {
    const legacyContent = legacyMatch[1];
    const legacyMatches = legacyContent.matchAll(/(\w+):\s*"([^"]+)"/g);
    for (const match of legacyMatches) {
      routes.add(match[2]);
    }
  }
  
  // Add dynamic routes (patterns)
  routes.add('/:username');
  
  // Add common patterns that are allowed
  routes.add('/');
  routes.add('#');
  routes.add('mailto:');
  routes.add('http://');
  routes.add('https://');
  
  return routes;
}

// Find all .tsx and .ts files in client/src
function findSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findSourceFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Check a file for hardcoded routes
function checkFile(filePath, validRoutes) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Patterns to match hardcoded routes
  const patterns = [
    // href="/..."
    /href\s*=\s*["'](\/[^"']+)["']/g,
    // setLocation("/...")
    /setLocation\s*\(\s*["'](\/[^"']+)["']/g,
    // path="/..."
    /path\s*=\s*["'](\/[^"']+)["']/g,
    // window.location.href = "/..."
    /window\.location\.href\s*=\s*["'](\/[^"']+)["']/g,
  ];
  
  const lines = content.split('\n');
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const route = match[1];
      
      // Skip if it's a valid route or starts with allowed patterns
      if (validRoutes.has(route) || 
          route.startsWith('http://') || 
          route.startsWith('https://') ||
          route.startsWith('mailto:') ||
          route.startsWith('#') ||
          route.startsWith('/api/') || // API endpoints
          route.includes('${') || // Template literals
          route.includes('${ROUTES') || // Already using ROUTES constant
          route.includes('${LEGACY_ROUTES')) { // Already using LEGACY_ROUTES constant
        continue;
      }
      
      // Find line number
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1].trim();
      
      issues.push({
        file: path.relative(process.cwd(), filePath),
        line: lineNum,
        route,
        code: line,
      });
    }
  }
  
  return issues;
}

// Main function
function main() {
  console.log('🔍 Checking for hardcoded route paths...\n');
  
  const validRoutes = getValidRoutes();
  const srcDir = path.join(__dirname, '../client/src');
  const files = findSourceFiles(srcDir);
  
  const allIssues = [];
  
  for (const file of files) {
    // Skip routes.ts and routerConfig.tsx (they define routes)
    if (file.includes('routes.ts') || file.includes('routerConfig.tsx')) {
      continue;
    }
    
    const issues = checkFile(file, validRoutes);
    allIssues.push(...issues);
  }
  
  if (allIssues.length === 0) {
    console.log('✅ No hardcoded routes found! All routes use constants from routes.ts\n');
    process.exit(0);
  }
  
  console.log(`❌ Found ${allIssues.length} hardcoded route(s):\n`);
  
  // Group by file
  const byFile = {};
  for (const issue of allIssues) {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  }
  
  for (const [file, issues] of Object.entries(byFile)) {
    console.log(`📄 ${file}`);
    for (const issue of issues) {
      console.log(`   Line ${issue.line}: ${issue.route}`);
      console.log(`   ${issue.code}`);
    }
    console.log();
  }
  
  console.log('💡 Tip: Use ROUTES.* or LEGACY_ROUTES.* constants from @/routes instead of hardcoded paths.\n');
  process.exit(1);
}

main();

