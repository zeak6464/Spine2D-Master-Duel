@echo off
setlocal enabledelayedexpansion

rem Set the source directory containing the files
set "source_directory=C:\Users\zeak6\Documents\GitHub\Spine2D-Master-Duel\master duel"

rem Set the destination directory
set "destination_directory=C:\Users\zeak6\Documents\GitHub\Spine2D-Master-Duel\spines"

rem Display start message
echo Starting file processing...

rem Display source and destination directories for debugging
echo Source Directory: %source_directory%
echo Destination Directory: %destination_directory%
echo.

rem Loop through each file in the source directory excluding .asset files and files with #
for /f "delims=" %%F in ('dir "%source_directory%\P*.txt" "%source_directory%\P*.json" "%source_directory%\P*.png" "%source_directory%\P*.playable" /b /s ^| findstr /vi ".asset" ^| findstr /vi "#"') do (
    rem Extract the KOID from the file name
    set "filename=%%~nF"
    set "koid="
    for /f "tokens=1 delims=P" %%a in ("!filename!") do set "koid=%%a"
    set "koid=!koid:P=!_!"
    for /f "delims=0123456789" %%b in ("!koid!") do set "koid=!koid:%%b=!"

    rem Display the file being processed and destination directory
    echo Processing file: %%~nxF
    echo Copying to folder: %destination_directory%\C!koid!
    
    rem Create the destination directory if it doesn't exist
    if not exist "%destination_directory%\C!koid!" mkdir "%destination_directory%\C!koid!"
    
    rem Copy the file to the destination directory, overriding existing files
    copy /Y "%%F" "%destination_directory%\C!koid!"
    
    rem Rename .playable files to .json after copying
    if /I "%%~xF"==".playable" ren "%destination_directory%\C!koid!\%%~nF%%~xF" "%%~nF.json"
    
    rem Display the file copied message
    echo File copied: %%~nxF to folder: %destination_directory%\C!koid!
    echo.
)

echo All files have been successfully copied and processed.
pause
