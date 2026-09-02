const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// I will just locate the exact end of the Right Column by finding:
/*
                ))}
              </tbody>
            </table>
          </div>
        </div>
*/
// And replace the lines after it with:
/*
      </div>
    </>
    )}
*/

const searchStr = `                ))}
              </tbody>
            </table>
          </div>
        </div>
              </>
      )}
      
      {/* Dashboard Analytics for Pejuang */}`;

const replaceStr = `                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
    )}
    
    {/* Dashboard Analytics for Pejuang */}`;

content = content.replace(searchStr, replaceStr);

// Also need to check if there is an issue at the VERY END.
// The component is PejuangDashboardAnalytics. It ends with:
/*
      </div>
    </div>
  );
};
*/
// And before that was DashboardView ending with:
/*
      )}
    </div>
  );
};
*/
// My patch script had:
/*
      )}
    </div>
  );
};

// Internal component for Pejuang Dashboard Analytics
*/

fs.writeFileSync('src/components/DashboardView.tsx', content);
