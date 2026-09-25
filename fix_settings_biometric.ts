import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf-8');

const replacement = `
          {/* Biometrik Section */}
          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Keamanan & Biometrik</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sidik Jari / Face ID</p>
                  <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${currentUser.webAuthnCredentialId ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}\`}>
                    {currentUser.webAuthnCredentialId ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {currentUser.webAuthnCredentialId 
                    ? 'Biometrik Anda sudah terdaftar. Anda bisa menggunakan ini untuk login dengan cepat.'
                    : 'Daftarkan sidik jari atau Face ID Anda untuk login lebih mudah dan aman.'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {currentUser.webAuthnCredentialId && (
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus data biometrik Anda? Anda tidak akan bisa lagi login menggunakan sidik jari/Face ID sampai Anda mendaftarkannya kembali.')) {
                        const updatedAccounts = accounts.map(a => 
                          a.id === currentUser.id 
                            ? { ...a, webAuthnCredentialId: undefined }
                            : a
                        );
                        onSaveAccounts(updatedAccounts);
                        alert('Data biometrik berhasil dihapus.');
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  >
                    Hapus
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!window.PublicKeyCredential) {
                      alert('Perangkat Anda tidak mendukung WebAuthn / Biometrik.');
                      return;
                    }
                    try {
                      const challenge = new Uint8Array(32);
                      crypto.getRandomValues(challenge);
                      const userId = new Uint8Array(16);
                      crypto.getRandomValues(userId);

                      const createCredentialArgs: CredentialCreationOptions = {
                        publicKey: {
                          challenge: challenge,
                          rp: { name: 'Al-Bahjah App', id: window.location.hostname },
                          user: {
                            id: userId,
                            name: currentUser.username || currentUser.email || 'user',
                            displayName: currentUser.name
                          },
                          pubKeyCredParams: [
                            { type: 'public-key', alg: -7 },
                            { type: 'public-key', alg: -257 }
                          ],
                          authenticatorSelection: {
                            authenticatorAttachment: 'platform',
                            userVerification: 'required'
                          },
                          timeout: 60000,
                          attestation: 'none'
                        }
                      };

                      const cred = await navigator.credentials.create(createCredentialArgs) as PublicKeyCredential;
                      if (cred && cred.id) {
                        const updatedAccounts = accounts.map(a => 
                          a.id === currentUser.id 
                            ? { ...a, webAuthnCredentialId: cred.id }
                            : a
                        );
                        onSaveAccounts(updatedAccounts);
                        alert('Biometrik berhasil didaftarkan!');
                      }
                    } catch (e: any) {
                      console.error(e);
                      alert('Gagal mendaftarkan biometrik: ' + e.message);
                    }
                  }}
                  className={"px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all " + (currentUser.webAuthnCredentialId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500")}
                >
                  {currentUser.webAuthnCredentialId ? 'Perbarui Biometrik' : 'Daftarkan Biometrik'}
                </button>
              </div>
            </div>
          </div>
`;

content = content.replace(/\{\/\* Biometrik Section \*\/\}(.|\n)*?(?=          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700\/50">\n             <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">\n               <Bell className="w-4 h-4 text-blue-500" \/>)/, replacement);

fs.writeFileSync('src/components/SettingsView.tsx', content);
