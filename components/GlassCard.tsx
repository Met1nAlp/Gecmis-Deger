// @ts-ignore
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

type GlassCardProps = {
    children: React.ReactNode;
    style?: ViewStyle;
};

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
    // Android'de BlurView bazen sorun çıkarabilir, bu yüzden sadece iOS'te veya web'de kullanıyoruz
    // ya da Android için fallback yapıyoruz.
    const isAndroid = Platform.OS === 'android';

    if (isAndroid) {
        return (
            <View style={[styles.container, styles.androidFallback, style]}>
                <View style={styles.inner}>{children}</View>
            </View>
        );
    }

    return (
        <BlurView intensity={50} tint="light" style={[styles.container, style]}>
            <View style={styles.inner}>{children}</View>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    androidFallback: {
        backgroundColor: 'transparent',
    },
    inner: {
        padding: 20,
    },
});
