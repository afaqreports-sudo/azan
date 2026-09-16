#!/bin/bash
set -ex

# 1. Update apt and install openjdk-21-jdk-headless and unzip/wget if not already installed
if ! command -v javac >/dev/null 2>&1 || ! javac -version 2>&1 | grep -q "21\."; then
  echo "Installing OpenJDK 21..."
  apt-get update -y
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends openjdk-21-jdk-headless unzip wget
fi

export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# 2. Set up Android SDK if not present
if [ ! -d "/opt/android-sdk/platforms/android-36" ]; then
  echo "Setting up Android SDK..."
  mkdir -p /opt/android-sdk/cmdline-tools
  if [ ! -d "/opt/android-sdk/cmdline-tools/latest" ]; then
    wget -q -O /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools
    mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
    rm -f /tmp/cmdline-tools.zip
  fi
  echo "Accepting licenses and installing platform 36..."
  yes | sdkmanager --licenses >/dev/null 2>&1 || true
  yes | sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
fi

# 3. Ensure local.properties points to /opt/android-sdk
echo "sdk.dir=/opt/android-sdk" > /app/applet/android/local.properties

# 4. Make sure Vite web assets are built and synced
cd /app/applet
npm run build
npx cap sync android

# 5. Run Gradle assembleDebug
cd /app/applet/android
chmod +x gradlew
./gradlew assembleDebug --no-daemon --console=plain

# 6. Verify APK existence
if [ -f "/app/applet/android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "SUCCESS: APK successfully built at /app/applet/android/app/build/outputs/apk/debug/app-debug.apk"
  ls -lh /app/applet/android/app/build/outputs/apk/debug/app-debug.apk
else
  echo "ERROR: APK not found"
  exit 1
fi
