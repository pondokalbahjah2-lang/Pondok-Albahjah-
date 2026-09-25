const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Replace the buggy closing tags
content = content.replace(
  '          </div>\n        </div>      \n        </>\n      )}',
  '          </div>\n        </div>\n      </div>\n        </>\n      )}'
);

content = content.replace(
  '          </div>\n        </div>\n      </div>\n        </>\n      )}',
  '          </div>\n        </div>\n      </div>\n      </>\n      )}'
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
