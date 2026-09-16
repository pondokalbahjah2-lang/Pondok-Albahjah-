const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldQ = `const kajianQ = isAd 
          ? query(collection(db, 'kajian'), orderBy('id', 'desc'), limit(3000))
          : query(collection(db, 'kajian'), where('pejuangId', '==', uid));`;
          
const newQ = `const kajianQ = isAd 
          ? query(collection(db, 'kajian'), limit(3000))
          : query(collection(db, 'kajian'), where('pejuangId', '==', uid));`;

code = code.replace(oldQ, newQ);

// also sort admin data client side
const oldData = `          let data = snap.docs.map(d => d.data() as KajianRecord);
          if (!isAd) {
            data = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }`;
const newData = `          let data = snap.docs.map(d => d.data() as KajianRecord);
          data = data.sort((a, b) => {
            const dateDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (b.id || '').localeCompare(a.id || '');
          });`;

code = code.replace(oldData, newData);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched kajian query");
