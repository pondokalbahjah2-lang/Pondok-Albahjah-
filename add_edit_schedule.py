import re

with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

target = """                <button
                  onClick={() => handleDeleteSchedule(sch.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
                  title="Hapus jadwal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>"""

new_buttons = """                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <button
                    onClick={() => handleEditSchedule(sch)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    title="Edit jadwal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(sch.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                    title="Hapus jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>"""

content = content.replace(target, new_buttons)

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content)

