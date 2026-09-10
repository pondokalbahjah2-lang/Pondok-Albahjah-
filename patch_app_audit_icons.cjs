const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('ShieldCheck')) {
  content = content.replace(
    "import { Settings, FileText, Calendar, LogOut, MapPin, Users, Menu, X, ArrowLeft, Clock, ShieldAlert, HeartPulse, Palmtree, UserX, Download, CheckCircle2, ChevronRight, User } from 'lucide-react';",
    "import { Settings, FileText, Calendar, LogOut, MapPin, Users, Menu, X, ArrowLeft, Clock, ShieldAlert, HeartPulse, Palmtree, UserX, Download, CheckCircle2, ChevronRight, User, ShieldCheck } from 'lucide-react';"
  );
  fs.writeFileSync('src/App.tsx', content);
}
