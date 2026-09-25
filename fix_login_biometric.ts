import fs from 'fs';
let content = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');

const replacement = `
                  {accounts.some(a => a.webAuthnCredentialId) && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleBiometricLogin}
                      className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Fingerprint className="w-5 h-5 text-emerald-400" />
                      <span>Masuk dengan Biometrik</span>
                    </button>
                  )}
                </div>
              </form>`;

content = content.replace(/<button\s*type="button"\s*disabled=\{isLoading\}\s*onClick=\{handleBiometricLogin\}[\s\S]*?Masuk dengan Biometrik<\/span>\s*<\/button>\s*<\/div>\s*<\/form>/, replacement.trim());

fs.writeFileSync('src/components/LoginView.tsx', content);
