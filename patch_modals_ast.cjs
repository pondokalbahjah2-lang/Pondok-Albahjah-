const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Let's find "fixed inset-0"
  let startIndex = 0;
  while (true) {
    let overlayIndex = content.indexOf('fixed inset-0', startIndex);
    if (overlayIndex === -1) break;
    
    // Find the next <div
    let innerDivStart = content.indexOf('<div', overlayIndex + 1);
    if (innerDivStart === -1) {
      startIndex = overlayIndex + 1;
      continue;
    }
    
    // Check if it's the modal container (e.g., has rounded, bg-white, bg-slate, max-w, etc.)
    // For iOS modal, we want the inner container. 
    let innerDivCloseBracket = content.indexOf('>', innerDivStart);
    let innerDivAttrs = content.substring(innerDivStart, innerDivCloseBracket);
    
    if (innerDivAttrs.includes('bg-') || innerDivAttrs.includes('rounded-') || innerDivAttrs.includes('shadow')) {
      // It's likely the modal box!
      // Replace <div with <motion.div
      let springProps = ` initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}`;
      
      let newInnerDiv = '<motion.div' + springProps + innerDivAttrs.substring(4) + '>';
      
      // Now we must find the matching closing </div>
      let depth = 1;
      let currentIndex = innerDivCloseBracket + 1;
      let closingIndex = -1;
      
      while (currentIndex < content.length) {
        let nextOpen = content.indexOf('<div', currentIndex);
        let nextClose = content.indexOf('</div', currentIndex);
        let nextSelfClose = content.indexOf('/>', currentIndex); // Not perfect but works for standard HTML
        
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          // Check if it's a self closing div? <div /> is rare but possible.
          let isSelfClosing = content.substring(nextOpen, content.indexOf('>', nextOpen) + 1).endsWith('/>');
          if (!isSelfClosing) {
            depth++;
          }
          currentIndex = content.indexOf('>', nextOpen) + 1;
        } else {
          depth--;
          if (depth === 0) {
            closingIndex = nextClose;
            break;
          }
          currentIndex = nextClose + 6;
        }
      }
      
      if (closingIndex !== -1) {
        // We found the bounds!
        content = content.substring(0, innerDivStart) + newInnerDiv + content.substring(innerDivCloseBracket + 1, closingIndex) + '</motion.div>' + content.substring(closingIndex + 6);
        changed = true;
        // We also should wrap the overlay with AnimatePresence.
        // Wait, wrapping with AnimatePresence requires us to find the conditional rendering `{showModal && (`
        // That's harder. Let's just do motion.div for now. 
      }
    }
    
    startIndex = overlayIndex + 10;
  }
  
  if (changed) {
    if (!content.includes('framer-motion')) {
       content = "import { motion, AnimatePresence } from 'framer-motion';\n" + content;
    }
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
