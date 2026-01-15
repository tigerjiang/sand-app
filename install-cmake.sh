#!/bin/bash

# Script to install CMake 3.31.6 for Android development
# This is required for react-native-worklets

echo "Installing CMake 3.31.6 for Android..."

# Find Android SDK path
if [ -n "$ANDROID_HOME" ]; then
    SDK_DIR="$ANDROID_HOME"
elif [ -n "$ANDROID_SDK_ROOT" ]; then
    SDK_DIR="$ANDROID_SDK_ROOT"
elif [ -d "$HOME/Library/Android/sdk" ]; then
    SDK_DIR="$HOME/Library/Android/sdk"
elif [ -d "$HOME/Android/Sdk" ]; then
    SDK_DIR="$HOME/Android/Sdk"
else
    echo "Error: Could not find Android SDK directory."
    echo "Please set ANDROID_HOME environment variable or install Android SDK."
    exit 1
fi

echo "Using Android SDK at: $SDK_DIR"

# Check if sdkmanager exists
SDKMANAGER="$SDK_DIR/cmdline-tools/latest/bin/sdkmanager"
if [ ! -f "$SDKMANAGER" ]; then
    SDKMANAGER="$SDK_DIR/tools/bin/sdkmanager"
fi

if [ ! -f "$SDKMANAGER" ]; then
    echo "Error: sdkmanager not found."
    echo "Please install Android SDK Command-line Tools."
    echo "You can install it through Android Studio:"
    echo "  Android Studio > Preferences > Appearance & Behavior > System Settings > Android SDK > SDK Tools"
    exit 1
fi

# Install CMake 3.31.6
echo "Installing CMake 3.31.6..."
"$SDKMANAGER" "cmake;3.31.6"

if [ $? -eq 0 ]; then
    echo "CMake 3.31.6 installed successfully!"
    echo "You can now rebuild your Android app."
else
    echo "Error: Failed to install CMake 3.31.6"
    echo "You can also install it manually through Android Studio:"
    echo "  Android Studio > Preferences > Appearance & Behavior > System Settings > Android SDK > SDK Tools > CMake"
    exit 1
fi

