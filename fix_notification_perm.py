with open("src/App.tsx", "r") as f:
    content = f.read()

# Request Notification permission on login
login_hook = """
  useEffect(() => {
    if (currentUser?.role === 'Admin') {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [currentUser]);
"""

if "Notification.requestPermission();" not in content:
    content = content.replace("  console.log('App: Component rendering...');", "  console.log('App: Component rendering...');\n" + login_hook)
    
with open("src/App.tsx", "w") as f:
    f.write(content)
