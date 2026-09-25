import re

with open("src/utils/storage.ts", "r") as f:
    content = f.read()

# Add KajianRecord to imports
content = content.replace("SlipUbarRecord,", "SlipUbarRecord,\n  KajianRecord,")

# Add INITIAL_KAJIAN_RECORDS to imports from mockData
content = content.replace("INITIAL_SLIP_UBAR,", "INITIAL_SLIP_UBAR,\n  INITIAL_KAJIAN_RECORDS,")

# Add to STORAGE_KEYS
content = content.replace("  SLIP_UBAR: 'albahjah_slip_ubar_v2',", "  SLIP_UBAR: 'albahjah_slip_ubar_v2',\n  KAJIAN: 'albahjah_kajian_v2',")

# Add save/get methods
methods = """  getSlipUbar: (): SlipUbarRecord[] => getItem(STORAGE_KEYS.SLIP_UBAR, INITIAL_SLIP_UBAR),
  saveSlipUbar: (data: SlipUbarRecord[]) => setItem(STORAGE_KEYS.SLIP_UBAR, data),
  getKajianRecords: (): KajianRecord[] => getItem(STORAGE_KEYS.KAJIAN, INITIAL_KAJIAN_RECORDS),
  saveKajianRecords: (data: KajianRecord[]) => setItem(STORAGE_KEYS.KAJIAN, data),"""
content = content.replace("  getSlipUbar: (): SlipUbarRecord[] => getItem(STORAGE_KEYS.SLIP_UBAR, INITIAL_SLIP_UBAR),\n  saveSlipUbar: (data: SlipUbarRecord[]) => setItem(STORAGE_KEYS.SLIP_UBAR, data),", methods)

with open("src/utils/storage.ts", "w") as f:
    f.write(content)

