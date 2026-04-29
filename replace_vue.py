import re

with open('../Rshell-web/src/views/settings/Settings.vue', 'r') as f:
    content = f.read()

# I will just write a new Settings.vue here, keeping the other sections intact
# but modifying `tableData` part and adding Notification sections.
