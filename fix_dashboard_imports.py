with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace("import { FileText, Calendar, getLocalDateString } from '../utils/dateUtils';", "import { getLocalDateString } from '../utils/dateUtils';")
content = content.replace("import { FileText, Calendar,  PieChart as RechartsPieChart", "import {  PieChart as RechartsPieChart")
content = content.replace("import { FileText, Calendar,  X,  Users,", "import { FileText, Calendar,  X,  Users,")

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
