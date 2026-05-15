const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'ngx-bootstrap', 'modal', 'modal.module.d.ts');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('from "ngx-bootstrap/focus-trap"')) {
    content = content.replace(/from "ngx-bootstrap\/focus-trap"/g, 'from "../focus-trap/focus-trap.module"');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched ngx-bootstrap/modal.module.d.ts');
  } else {
    console.log('ngx-bootstrap/modal.module.d.ts already patched or does not match');
  }
} else {
  console.log('ngx-bootstrap/modal.module.d.ts not found. Assuming no patch needed.');
}
