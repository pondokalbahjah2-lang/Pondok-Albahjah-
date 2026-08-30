const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// The start anchor:
const startAnchor = `      {/* Attendance Summary Circular Progress */}`;
const startReplacement = `      {/* ADMIN ONLY SECTIONS */}
      {currentUser.role === 'Admin' && (
        <div className="space-y-6">
          {/* Attendance Summary Circular Progress */}`;

code = code.replace(startAnchor, startReplacement);

// The end anchor:
const endAnchor = `          </div>
        </div>
      </div>
    </div>
  );
};`;
const endReplacement = `          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};`;

code = code.replace(endAnchor, endReplacement);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log('Admin section wrapped in DashboardView');
