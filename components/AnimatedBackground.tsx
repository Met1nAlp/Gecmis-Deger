import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View, type ColorValue } from 'react-native';
import { assetThemes } from '../constants/theme';
import { AssetId } from '../types';

type AnimatedBackgroundProps = {
  assetId?: AssetId;
};

const { width, height } = Dimensions.get('window');

const generateSymbolPositions = (count: number) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 20 + Math.random() * 40,
      rotation: Math.random() * 360,
      speed: 0.5 + Math.random() * 2,
      depth: Math.random(),
      opacity: 0.12 + Math.random() * 0.35
    });
  }
  return positions;
};

export const AnimatedBackground = ({ assetId }: AnimatedBackgroundProps) => {
  const theme = (assetId && assetThemes[assetId]) ? assetThemes[assetId] : assetThemes['dolar'];
  const symbolPositions = useRef(generateSymbolPositions(assetId ? 220 : 140)).current;
  const rotationValues = useRef(symbolPositions.map(() => new Animated.Value(0))).current;
  const spinXValues = useRef(symbolPositions.map(() => new Animated.Value(0))).current;
  const translateValues = useRef(symbolPositions.map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0)
  }))).current;

  useEffect(() => {
    const animations = rotationValues.map((rotation, index) => {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 8000 + Math.random() * 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      const spinXAnimation = Animated.loop(
        Animated.timing(spinXValues[index], {
          toValue: 1,
          duration: 7000 + Math.random() * 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      
      const floatX = Animated.loop(
        Animated.sequence([
          Animated.timing(translateValues[index].x, {
            toValue: -10 - Math.random() * 20,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateValues[index].x, {
            toValue: 10 + Math.random() * 20,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      
      const floatY = Animated.loop(
        Animated.sequence([
          Animated.timing(translateValues[index].y, {
            toValue: -15 - Math.random() * 25,
            duration: 4000 + Math.random() * 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateValues[index].y, {
            toValue: 15 + Math.random() * 25,
            duration: 4000 + Math.random() * 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      
      return { rotateAnimation, spinXAnimation, floatX, floatY };
    });

    animations.forEach(({ rotateAnimation, spinXAnimation, floatX, floatY }) => {
      rotateAnimation.start();
      spinXAnimation.start();
      floatX.start();
      floatY.start();
    });

    return () => {
      animations.forEach(({ rotateAnimation, spinXAnimation, floatX, floatY }) => {
        rotateAnimation.stop();
        spinXAnimation.stop();
        floatX.stop();
        floatY.stop();
      });
    };
  }, [assetId, rotationValues, spinXValues, symbolPositions, translateValues]);

  return (
    <View style={styles.container} key={assetId || 'default'}>
      {/** ensure tuple type for expo-linear-gradient colors prop */}
      {(() => {
        const gradientColors = theme.colors as unknown as readonly [ColorValue, ColorValue, ...ColorValue[]];
        return (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        );
      })()}
      {symbolPositions.map((position, index) => {
        const rotation = rotationValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        const rotateX = spinXValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        const scale = 0.7 + position.depth * 0.9; // fake Z with scale
        
        const symbol = theme.symbols[index % theme.symbols.length];
        
        return (
          <Animated.Text
            key={`symbol-${index}`}
            style={[
              styles.symbol,
              {
                left: position.x,
                top: position.y,
                fontSize: position.size,
                opacity: position.opacity,
                transform: [
                  { perspective: 600 },
                  { rotate: rotation },
                  { rotateX },
                  { scale },
                  { translateX: translateValues[index].x },
                  { translateY: translateValues[index].y },
                ],
              },
            ]}
          >
            {symbol}
          </Animated.Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  symbol: {
    position: 'absolute',
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
