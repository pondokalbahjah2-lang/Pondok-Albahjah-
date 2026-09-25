const fs = require('fs');
let code = fs.readFileSync('src/components/KajianView.tsx', 'utf8');

const oldStartDate = "const [filterStartDate, setFilterStartDate] = useState(getLocalDateString(new Date()));";
const newStartDate = `const [filterStartDate, setFilterStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
});`;

code = code.replace(oldStartDate, newStartDate);
fs.writeFileSync('src/components/KajianView.tsx', code);
console.log("Patched filterStartDate");
