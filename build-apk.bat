@echo off
echo APK Build Script
echo ================

echo 1. Installing dependencies...
call npm install

echo 2. Exporting for Android...
call npx expo export --platform android

echo 3. Creating APK using Expo...
echo Please run the following commands manually:
echo.
echo npx expo login
echo npx eas build --platform android --profile preview
echo.
echo Or use Expo Go app to test the exported bundle in 'dist' folder.

pause