const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Add import
content = content.replace(
  "import { getLocalDateString } from '../utils/dateUtils';",
  "import { getLocalDateString } from '../utils/dateUtils';\nimport { DashboardSummaryChart } from './DashboardSummaryChart';"
);

// Remove the internal component entirely by slicing from the end
const internalComponentStart = content.indexOf('// Internal component for Pejuang Dashboard Analytics');
if (internalComponentStart !== -1) {
  content = content.substring(0, internalComponentStart);
}

// Replace PejuangDashboardAnalytics usage with DashboardSummaryChart
content = content.replace(
  `<PejuangDashboardAnalytics 
          currentUser={currentUser} 
          attendance={attendance} 
          leaveRequests={leaveRequests} 
          exitPermissions={exitPermissions} 
        />`,
  `<DashboardSummaryChart 
          currentUser={currentUser} 
          attendance={attendance} 
        />`
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
