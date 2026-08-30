const fs = require('fs');
let code = fs.readFileSync('src/components/SlipUbarView.tsx', 'utf8');

const anchor = `  const [printData, setPrintData] = useState<SlipUbarRecord | null>(null);`;
const replacement = `  const [printData, setPrintData] = useState<SlipUbarRecord | null>(null);

  React.useEffect(() => {
    const handleAfterPrint = () => setPrintData(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);`;

code = code.replace(anchor, replacement);
fs.writeFileSync('src/components/SlipUbarView.tsx', code);
console.log('Fixed afterprint');
