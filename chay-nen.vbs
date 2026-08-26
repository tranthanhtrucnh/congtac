' chay-nen.vbs
' Goi chay-san-xuat.bat hoan toan an (khong hien cua so nao), dung de dat
' shortcut vao thu muc Startup cua Windows - Van thu dang nhap la ung dung
' tu chay, khong can bam gi.
'
' Cach dat auto-start (lam 1 lan tren may Van thu):
'   1. Nhan phim Windows + R, go: shell:startup , nhan Enter
'   2. Trong cua so vua mo, chuot phai -> New -> Shortcut
'   3. Duong dan: duong dan day du toi file chay-nen.vbs nay (vd:
'      D:\claude\congtac\chay-nen.vbs)
'   4. Dat ten shortcut, vd "Cong lenh - tu khoi dong", bam Finish
'
' Lan dang nhap Windows tiep theo, ung dung se tu chay ngam, mo trinh duyet
' vao http://localhost:3000 la dung duoc (khong co cua so nao hien ra).

Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")

duongDanThuMuc = fso.GetParentFolderName(WScript.ScriptFullName)
duongDanBat = duongDanThuMuc & "\chay-san-xuat.bat"

WshShell.Run """" & duongDanBat & """", 0, False
