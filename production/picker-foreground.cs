using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;
public sealed class PickerForeground : IDisposable {
 [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc callback, IntPtr param);
 delegate bool EnumProc(IntPtr hwnd, IntPtr param);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint process);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd, StringBuilder name, int size);
 [DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int cx, int cy, uint flags);
 [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hwnd);
 public static bool Promoted { get; private set; }
 readonly Timer timer = new Timer();
 readonly uint process = (uint)System.Diagnostics.Process.GetCurrentProcess().Id;
 readonly DateTime deadline = DateTime.UtcNow.AddSeconds(10);
 public PickerForeground(){timer.Interval=150;timer.Tick+=Tick;timer.Start();}
 void Tick(object sender, EventArgs args){
  if(DateTime.UtcNow>deadline){timer.Stop();return;}
  EnumWindows((hwnd,param)=>{
   uint pid;GetWindowThreadProcessId(hwnd,out pid);
   if(pid!=process||!IsWindowVisible(hwnd))return true;
   var name=new StringBuilder(256);GetClassName(hwnd,name,name.Capacity);
   if(name.ToString()!="#32770")return true;
   // Only promote this helper's native dialog. Do not move or resize it.
   Promoted=SetWindowPos(hwnd,new IntPtr(-1),0,0,0,0,0x0001|0x0002|0x0040);
   SetForegroundWindow(hwnd);timer.Stop();return false;
  },IntPtr.Zero);
 }
 public void Dispose(){timer.Stop();timer.Dispose();}
}