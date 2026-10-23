$ErrorActionPreference='Stop'
[Console]::InputEncoding=[Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
$request=[Console]::In.ReadToEnd() | ConvertFrom-Json
Add-Type -AssemblyName System.Windows.Forms
Add-Type -Path (Join-Path $PSScriptRoot 'picker-foreground.cs') -ReferencedAssemblies @('System.Windows.Forms','System.Drawing.Primitives','System.ComponentModel.Primitives','System.Runtime.InteropServices','System.Diagnostics.Process')
[Windows.Forms.Application]::EnableVisualStyles()
$owner=[Windows.Forms.Form]::new()
$owner.Text='语音工作台 · 选择文件'
$owner.Size=[Drawing.Size]::new(360,100)
$owner.StartPosition='CenterScreen'
$owner.ShowInTaskbar=$true
$owner.Opacity=1
$owner.TopMost=$true
$dialog=$null
$foreground=$null
try {
 $initial=[string]$request.initialPath
 if($initial -and (Test-Path -LiteralPath $initial -PathType Leaf)){$initial=Split-Path -LiteralPath $initial}
 while($initial -and !(Test-Path -LiteralPath $initial -PathType Container)){
  $parent=Split-Path -Path $initial -Parent
  if($parent -eq $initial){$initial='';break};$initial=$parent
 }
 if(!$initial){$initial=[Environment]::GetFolderPath('MyDocuments')}
 if($request.kind -eq 'folder'){
  $dialog=[Windows.Forms.FolderBrowserDialog]::new()
  $dialog.AutoUpgradeEnabled=$true
  $dialog.UseDescriptionForTitle=$true
  $dialog.Description='选择素材文件夹'
  $dialog.SelectedPath=$initial
 }else{
  $dialog=[Windows.Forms.OpenFileDialog]::new()
  $dialog.AutoUpgradeEnabled=$true
  $dialog.Multiselect=$false
  $dialog.CheckFileExists=$true
  $dialog.InitialDirectory=$initial
  if($request.kind -eq 'script'){$dialog.Title='选择口播文案';$dialog.Filter='Markdown 文案 (*.md)|*.md'}
  elseif($request.kind -eq 'audio'){$dialog.Title='选择音频';$dialog.Filter='音频文件 (*.wav;*.mp3;*.flac;*.m4a)|*.wav;*.mp3;*.flac;*.m4a'}
  else{throw '选择类型无效'}
 }
 $owner.Show();$owner.Activate()
 $foreground=[PickerForeground]::new()
 $selected=''
 if($dialog.ShowDialog($owner) -eq [Windows.Forms.DialogResult]::OK){
  if($request.kind -eq 'folder'){$selected=$dialog.SelectedPath}else{$selected=$dialog.FileName}
 }
 @{path=$selected;promoted=[PickerForeground]::Promoted} | ConvertTo-Json -Compress
}finally{
 if($foreground){$foreground.Dispose()};if($dialog){$dialog.Dispose()};$owner.Close();$owner.Dispose()
}