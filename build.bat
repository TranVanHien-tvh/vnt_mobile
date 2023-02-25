@REM git status
@REM git pull

@REM Build
call build-npm.bat

@REM Xóa config
rmdir .\dist\cfg /s /q

pause